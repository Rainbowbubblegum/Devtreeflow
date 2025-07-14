import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EnhancedPromptGenerator } from './enhanced-prompt-generator';
import { WorkflowManager } from './workflow-manager';
import { ContextDocumentManager } from './context-document-manager';
import { AutoPromptService } from './auto-prompt-service';
import { readdirSync, readFileSync } from 'fs';

export class DevTreeFlowDashboard {
    private panel: vscode.WebviewPanel | undefined;
    private context: vscode.ExtensionContext;

    // [2] Add new state for context file ticks and prompt builder
    private contextFileTicks: { [filepath: string]: boolean } = {};
    private promptBuilderContent: string = '';
    private copyToPromptBuilderMode: boolean = false;
    private contextFilesList: string[] = [];
    private contextFolderStructure: any = null;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public show() {
        try {
            console.log('DevTreeFlow: Dashboard show() called');
            
            if (this.panel) {
                console.log('DevTreeFlow: Panel exists, revealing...');
                this.panel.reveal(vscode.ViewColumn.One);
                return;
            }

            console.log('DevTreeFlow: Creating new WebView panel...');
            this.panel = vscode.window.createWebviewPanel(
                'devTreeFlowDashboard',
                'DevTreeFlow Dashboard',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [
                        vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
                    ]
                }
            );

            console.log('DevTreeFlow: Setting WebView content...');
            // Load context folder structure
            this.loadContextFolderStructure();
            this.panel.webview.html = this.getWebviewContent();

            this.panel.webview.onDidReceiveMessage(
                async (message) => {
                    await this.handleMessage(message);
                },
                undefined,
                this.context.subscriptions
            );

            this.panel.onDidDispose(() => {
                console.log('DevTreeFlow: Panel disposed');
                this.panel = undefined;
            });

            console.log('DevTreeFlow: Refreshing tree data...');
            this.refreshTreeData();
            
            // Send initial state including context files
            this.updateWebviewState();
            
            console.log('DevTreeFlow: Dashboard created successfully');
        } catch (error) {
            console.error('DevTreeFlow: Error in dashboard show():', error);
            vscode.window.showErrorMessage(`Failed to create dashboard: ${error}`);
        }
    }

    private async handleMessage(message: any) {
        switch (message.command) {
            case 'switchToNode':
                await this.handleSwitchToNode(message.nodePath);
                break;
            case 'switchAndFollowParent':
                await this.handleSwitchAndFollowParent(message.nodePath);
                break;
            case 'assessChildren':
                await this.handleAssessChildren(message.nodePath);
                break;
            case 'summarizeStatus':
                await this.handleSummarizeStatus(message.nodePath);
                break;
            case 'newTaskTree':
                await this.handleNewTaskTree();
                break;
            case 'refreshTree':
                this.refreshTreeData();
                break;
            case 'initializeDevTreeFlow':
                await this.handleInitializeDevTreeFlow();
                break;
            case 'initializeLeaf':
                await this.handleInitializeLeaf(message.leafPath);
                break;
            case 'workflowMode':
                await this.handleWorkflowMode(message.leafPath, message.mode);
                break;
            case 'toggleAutoPromptingMode':
                await this.handleToggleAutoPromptingMode();
                break;
            case 'openNewCursorChat':
                await this.handleOpenNewCursorChat();
                break;
            case 'openNewCursorChatTab':
                await this.handleOpenNewCursorChatTab();
                break;
            case 'openExtensionsPanel':
                await vscode.commands.executeCommand('devtreeflow.openExtensionsPanel');
                break;
            case 'clearCurrentChat':
                await vscode.commands.executeCommand('devtreeflow.clearCurrentChat');
                break;
            case 'toggleCopyToPromptBuilderMode':
                this.copyToPromptBuilderMode = !this.copyToPromptBuilderMode;
                this.updateWebviewState();
                break;
            case 'toggleContextFileTick':
                this.contextFileTicks[message.filename] = !this.contextFileTicks[message.filename];
                this.updatePromptBuilderWithContextFiles();
                this.updateWebviewState();
                break;
            case 'updatePromptBuilder':
                this.promptBuilderContent = message.content;
                break;
            case 'autoPromptFromBuilder':
                await this.handleAutoPromptFromBuilder();
                break;
            case 'treeActionPrompt':
                await this.handleTreeActionPrompt(message.prompt);
                break;
            case 'openContextFile':
                await this.handleOpenContextFile(message.filename);
                break;
            case 'createContextFolder':
                await this.handleCreateContextFolder(message.folderPath);
                break;
            case 'createContextDocument':
                await this.handleCreateContextDocument(message.folderPath, message.fileName);
                break;
            case 'refreshContextFiles':
                this.loadContextFolderStructure();
                this.updateWebviewState();
                break;
        }
    }

    private async handleSwitchToNode(nodePath: string) {
        const nodeLabel = path.basename(nodePath);
        const prompt = EnhancedPromptGenerator.generateIdentityPrompt(nodePath);
        if (AutoPromptService.isAutoPromptingModeEnabled()) {
            await AutoPromptService.sendPromptToChatWithAutomation(prompt, `Switch to '${nodeLabel}'`);
        } else {
            await vscode.env.clipboard.writeText(prompt);
            vscode.window.showInformationMessage(`Switched to '${nodeLabel}' - enhanced prompt copied to clipboard!`);
        }
    }

    private async handleSwitchAndFollowParent(nodePath: string) {
        const pathParts = nodePath.split(path.sep);
        const nodeLabel = pathParts[pathParts.length - 1];
        const parentName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'root';
        const prompt = EnhancedPromptGenerator.generateIdentityPrompt(nodePath, 
            `Follow parent context from '${parentName}' and execute tasks as per parent's expectations`);
        if (AutoPromptService.isAutoPromptingModeEnabled()) {
            await AutoPromptService.sendPromptToChatWithAutomation(prompt, `Follow Parent for '${nodeLabel}'`);
        } else {
            await vscode.env.clipboard.writeText(prompt);
            vscode.window.showInformationMessage(`Switch to '${nodeLabel}' with parent context - enhanced prompt copied to clipboard!`);
        }
    }

    private async handleAssessChildren(nodePath: string) {
        const nodeLabel = path.basename(nodePath);
        const prompt = EnhancedPromptGenerator.generateAssessmentPrompt(nodePath);
        if (AutoPromptService.isAutoPromptingModeEnabled()) {
            await AutoPromptService.sendPromptToChatWithAutomation(prompt, `Assess Children for '${nodeLabel}'`);
        } else {
            await vscode.env.clipboard.writeText(prompt);
            vscode.window.showInformationMessage(`Assess children of '${nodeLabel}' - enhanced assessment prompt copied to clipboard!`);
        }
    }

    private async handleSummarizeStatus(nodePath: string) {
        const nodeLabel = path.basename(nodePath);
        const prompt = `You are the AI agent for '${nodeLabel}' in the DevTreeFlow system.\n\nPlease provide a comprehensive status summary for this task:\n\n1. Read all context from: /DevTreeFlow/${nodePath}/\n2. Review task objectives and current progress\n3. Summarize what has been completed\n4. Identify what remains to be done\n5. Note any blockers or issues\n6. Assess overall task health and timeline\n\nProvide a clear, structured status report that can be shared with parent nodes or team members.`;
        if (AutoPromptService.isAutoPromptingModeEnabled()) {
            await AutoPromptService.sendPromptToChatWithAutomation(prompt, `Status Summary for '${nodeLabel}'`);
        } else {
            await vscode.env.clipboard.writeText(prompt);
            vscode.window.showInformationMessage(`Summarize status of '${nodeLabel}' - prompt copied to clipboard!`);
        }
    }

    private async handleNewTaskTree() {
        const taskName = await vscode.window.showInputBox({
            prompt: 'Enter the name for your new task tree',
            placeHolder: 'e.g., AddCustomerForm, FixBugInLogin'
        });

        if (!taskName) {
            return;
        }

        const workspaceFolder = this.getWorkspaceFolder();
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        const devTreeFlowPath = path.join(workspaceFolder, 'DevTreeFlow');
        const taskPath = path.join(devTreeFlowPath, taskName);

        try {
            if (!fs.existsSync(devTreeFlowPath)) {
                await this.handleInitializeDevTreeFlow();
            }

            if (fs.existsSync(taskPath)) {
                vscode.window.showErrorMessage(`Task tree '${taskName}' already exists`);
                return;
            }

            fs.mkdirSync(taskPath, { recursive: true });
            fs.mkdirSync(path.join(taskPath, 'InstructionsFromParent'));
            fs.mkdirSync(path.join(taskPath, 'MeAndMyChildren'));

            const introContent = `# ${taskName} - Task Introduction

## Created: ${new Date().toISOString().split('T')[0]}
## Status: Not Started

This is the main task node for: **${taskName}**

### Task Overview
[Describe what this task should accomplish]

### Subtasks to Create
[List the child tasks that need to be created]

### Context Files
- Read parent instructions from: InstructionsFromParent/
- Document progress in: MeAndMyChildren/
`;

            fs.writeFileSync(path.join(taskPath, 'MeAndMyChildren', '00_intro.md'), introContent);

            const prompt = `You are the root DevTreeFlow agent for the task: "${taskName}"

Please:
1. Read the context from /DevTreeFlow/tree-start.md
2. Read your task intro from /DevTreeFlow/${taskName}/MeAndMyChildren/00_intro.md
3. Break this task down into reasonable logical subtasks
4. Create child node folders for each subtask with proper structure
5. Write clear instructions for each child agent

Begin by analyzing the task "${taskName}" and creating the necessary child nodes.`;

            await vscode.env.clipboard.writeText(prompt);
            vscode.window.showInformationMessage(`Task tree '${taskName}' created! Root prompt copied to clipboard.`);

            this.refreshTreeData();

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create task tree: ${error}`);
        }
    }

    private async handleInitializeDevTreeFlow() {
        const workspaceFolder = this.getWorkspaceFolder();
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        const devTreeFlowPath = path.join(workspaceFolder, 'DevTreeFlow');
        
        try {
            if (!fs.existsSync(devTreeFlowPath)) {
                fs.mkdirSync(devTreeFlowPath, { recursive: true });
            }

            const treeStartContent = `# DevTreeFlow Root Agent Instructions

You are the root agent of the DevTreeFlow system. Your role is to:

1. **Break down the main task** into logical subtasks
2. **Create child nodes** (subfolders) for each subtask
3. **Assign clear roles** to each child agent
4. **Provide context** via InstructionsFromParent folders

## Task Breakdown Process

When given a new task:

1. Analyze the requirements and identify 2-5 main subtasks
2. For each subtask, create a folder structure:
   \`\`\`
   /TaskName/
     /InstructionsFromParent/
       [date]_from_[parent].md
     /MeAndMyChildren/
       00_intro.md
       task_details.md
   \`\`\`

3. Write clear instructions for each child agent in their InstructionsFromParent folder
4. Define success criteria and expected outputs
5. Begin coordinating the work across child agents

## Context System Rules

- Each node reads its own context files before starting work
- Parent instructions take priority over child autonomy
- Progress updates should be saved in MeAndMyChildren folders
- Use the DevTreeFlow extension to switch between agents

## Getting Started

Copy this prompt to your clipboard and begin breaking down your task:

"I need you to act as the root DevTreeFlow agent. Please read the context from /DevTreeFlow/tree-start.md and break down this task into subtasks with proper folder structure: [YOUR_TASK_HERE]"
`;

            const treeStartPath = path.join(devTreeFlowPath, 'tree-start.md');
            fs.writeFileSync(treeStartPath, treeStartContent);

            vscode.window.showInformationMessage('DevTreeFlow initialized successfully!');
            this.refreshTreeData();

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize DevTreeFlow: ${error}`);
        }
    }

    private getWorkspaceFolder(): string | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : undefined;
    }

    private refreshTreeData() {
        if (this.panel) {
            const treeData = this.getTreeData();
            this.panel.webview.postMessage({
                command: 'updateTree',
                data: treeData
            });
            // Also refresh context files
            this.loadContextFolderStructure();
            this.updateWebviewState();
        }
    }

    private getTreeData() {
        const workspaceFolder = this.getWorkspaceFolder();
        if (!workspaceFolder) {
            return { nodes: [], hasDevTreeFlow: false };
        }

        const devTreeFlowPath = path.join(workspaceFolder, 'DevTreeFlow');
        
        if (!fs.existsSync(devTreeFlowPath)) {
            return { nodes: [], hasDevTreeFlow: false };
        }

        const nodes = this.buildTreeStructure(devTreeFlowPath, '');
        return { nodes, hasDevTreeFlow: true };
    }

    private buildTreeStructure(dirPath: string, relativePath: string): any[] {
        if (!fs.existsSync(dirPath)) {
            return [];
        }

        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        const nodes: any[] = [];

        for (const item of items) {
            if (item.isDirectory() && !item.name.startsWith('.')) {
                const nodeRelativePath = relativePath ? path.join(relativePath, item.name) : item.name;
                const fullPath = path.join(dirPath, item.name);
                const children = this.buildTreeStructure(fullPath, nodeRelativePath);
                
                const hasInstructions = fs.existsSync(path.join(fullPath, 'InstructionsFromParent'));
                const hasContext = fs.existsSync(path.join(fullPath, 'MeAndMyChildren'));
                
                nodes.push({
                    name: item.name,
                    path: nodeRelativePath,
                    children: children,
                    hasInstructions,
                    hasContext,
                    status: this.getNodeStatus(fullPath)
                });
            }
        }

        return nodes;
    }

    private getNodeStatus(nodePath: string): string {
        try {
            const contextPath = path.join(nodePath, 'MeAndMyChildren');
            if (!fs.existsSync(contextPath)) {
                return 'not-started';
            }

            const files = fs.readdirSync(contextPath);
            const hasProgress = files.some(file => 
                file.includes('progress') || 
                file.includes('status') || 
                file.includes('complete')
            );

            return hasProgress ? 'in-progress' : 'not-started';
        } catch {
            return 'unknown';
        }
    }

    // [6] Update getWebviewContent to add new UI sections and JS wiring
    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevTreeFlow Dashboard</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            margin: 0;
            padding: 0;
        }
        .dashboard-header {
            width: 100%;
            background: var(--vscode-panel-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding: 18px 24px 12px 24px;
            box-sizing: border-box;
            position: relative;
        }
        .dashboard-header h1 {
            margin: 0;
            color: var(--vscode-titleBar-activeForeground);
            font-size: 2em;
        }
        .refresh-btn-top {
            position: absolute;
            top: 18px;
            right: 24px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 13px;
        }
        .refresh-btn-top:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .section {
            margin: 24px 24px 0 24px;
            padding: 18px;
            background: var(--vscode-panel-background);
            border-radius: 8px;
            border: 1px solid var(--vscode-panel-border);
        }
        .section-header {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 12px;
            color: var(--vscode-titleBar-activeForeground);
        }
        .modes-row, .chat-controls-row, .tree-controls-row {
            display: flex;
            gap: 16px;
            align-items: center;
            margin-bottom: 12px;
        }
        .modes-row label, .chat-controls-row button, .tree-controls-row button {
            margin-right: 8px;
        }
        .tree-and-context-row {
            display: flex;
            gap: 32px;
            align-items: flex-start;
        }
        #treeContainer {
            flex: 2;
            min-width: 350px;
        }
        #contextFilesContainer {
            flex: 1;
            min-width: 220px;
            margin-top: 0;
        }
        #promptBuilderContainer {
            flex: 2;
            min-width: 350px;
            margin-top: 0;
        }
        .context-files-list label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
        }
        .context-file-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
        }
        .context-file-row label {
            flex: 1;
            margin-bottom: 0;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .context-file-open-btn {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            padding: 2px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
            white-space: nowrap;
        }
        .context-file-open-btn:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .context-folder-tree {
            font-size: 13px;
            line-height: 22px;
        }
        .context-folder-item {
            display: flex;
            align-items: center;
            padding: 2px 0;
            cursor: pointer;
            user-select: none;
        }
        .context-folder-item:hover {
            background-color: var(--vscode-list-hoverBackground);
        }
        .context-folder-icon {
            margin-right: 4px;
            flex-shrink: 0;
        }
        .context-folder-name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .context-folder-actions {
            display: none;
            gap: 4px;
            margin-left: 8px;
        }
        .context-folder-item:hover .context-folder-actions {
            display: flex;
        }
        .context-folder-children {
            margin-left: 20px;
        }
        .context-add-btn {
            background: none;
            border: none;
            color: var(--vscode-foreground);
            cursor: pointer;
            padding: 2px 4px;
            font-size: 16px;
            opacity: 0.7;
        }
        .context-add-btn:hover {
            opacity: 1;
            background-color: var(--vscode-toolbar-hoverBackground);
        }
        .context-file-checkbox {
            margin-right: 6px;
        }
        .context-header-actions {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
        }
        textarea {
            width: 100%;
            min-height: 120px;
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 13px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            margin-bottom: 8px;
            padding: 8px;
            box-sizing: border-box;
        }
        .btn {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        .btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .btn.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .btn.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .btn.enabled {
            background-color: var(--vscode-terminal-ansiGreen);
            color: var(--vscode-button-foreground);
        }
        .btn.enabled:hover {
            background-color: var(--vscode-terminal-ansiBrightGreen);
        }
        
        /* Tree node styles */
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--vscode-descriptionForeground);
        }
        .empty-state h2 {
            margin-bottom: 10px;
            color: var(--vscode-titleBar-activeForeground);
        }
        .tree-node {
            margin: 10px 0;
            padding: 12px;
            background-color: var(--vscode-list-inactiveSelectionBackground);
            border-radius: 6px;
            border-left: 4px solid var(--vscode-textLink-foreground);
        }
        .tree-node.not-started {
            border-left-color: var(--vscode-editorWarning-foreground);
        }
        .tree-node.in-progress {
            border-left-color: var(--vscode-editorInfo-foreground);
        }
        .tree-node.completed {
            border-left-color: var(--vscode-terminal-ansiGreen);
        }
        .node-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .node-name {
            font-weight: bold;
            font-size: 14px;
            color: var(--vscode-editor-foreground);
        }
        .node-status {
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 10px;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
        }
        .node-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .node-actions .btn {
            padding: 4px 12px;
            font-size: 11px;
        }
        .node-children {
            margin-left: 20px;
            margin-top: 10px;
            border-left: 2px solid var(--vscode-panel-border);
            padding-left: 15px;
        }
        .node-path {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
        }
        .icon {
            margin-right: 5px;
        }
        
        @media (max-width: 1100px) {
            .tree-and-context-row {
                flex-direction: column;
            }
            #promptBuilderContainer, #contextFilesContainer, #treeContainer {
                min-width: 0;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard-header">
        <h1>🌳 DevTreeFlow Dashboard</h1>
        <button class="refresh-btn-top" onclick="refreshTree()">
            <span class="icon">🔄</span>Refresh
        </button>
    </div>
    <div class="section">
        <div class="section-header">Modes</div>
        <div class="modes-row">
            <button class="btn" id="autoPromptToggle" onclick="toggleAutoPromptingMode()">
                <span class="icon">🤖</span><span id="autoPromptText">Enable Auto-Prompting</span>
            </button>
            <label><input type="checkbox" id="copyToPromptBuilderToggle" onchange="toggleCopyToPromptBuilderMode()"> Copy to Prompt Builder before prompting</label>
        </div>
    </div>
    <div class="section">
        <div class="section-header">Chat Controls</div>
        <div class="chat-controls-row">
            <button class="btn secondary" onclick="openNewCursorChat()">
                <span class="icon">💬</span>New Chat
            </button>
            <button class="btn secondary" onclick="openNewCursorChatTab()">
                <span class="icon">💡</span>Open New Chat Tab
            </button>
            <button class="btn secondary" onclick="clearCurrentChat()">
                <span class="icon">🧹</span>Clear Chat
            </button>
        </div>
    </div>
    <div class="section">
        <div class="section-header">Tree Controls</div>
        <div class="tree-controls-row">
            <button class="btn" onclick="newTaskTree()">
                <span class="icon">➕</span>New Task Tree
            </button>
        </div>
    </div>
    <div class="section">
        <div class="tree-and-context-row">
            <div id="treeContainer">
                <div class="empty-state">
                    <h2>No DevTreeFlow Structure Found</h2>
                    <p>Initialize DevTreeFlow to start managing your AI development workflows.</p>
                    <button class="btn" onclick="initializeDevTreeFlow()">
                        <span class="icon">🚀</span>Initialize DevTreeFlow
                    </button>
                </div>
            </div>
            <div id="contextFilesContainer">
                <h3>📄 Project Specific Context Files</h3>
                <div class="context-files-list">
                    <p style="color: var(--vscode-descriptionForeground);">Loading context files...</p>
                </div>
            </div>
            <div id="promptBuilderContainer">
                <h3>🛠️ Prompt Builder</h3>
                <textarea id="promptBuilderTextarea" rows="10" placeholder="Tree/leaf prompts will appear here when you use tree actions with 'Copy to Prompt Builder' mode enabled..."></textarea>
                <div>
                    <button class="btn" onclick="autoPromptFromBuilder()">
                        <span class="icon">🚀</span>Auto-Prompt from Builder
                    </button>
                </div>
            </div>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        let copyToPromptBuilderMode = false;

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateTree':
                    updateTreeDisplay(message.data);
                    break;
                case 'updateAutoPromptingState':
                    updateAutoPromptingState(message.isEnabled);
                    break;
                case 'updateDashboardState':
                    updateDashboardState(message);
                    break;
            }
        });

        function updateTreeDisplay(data) {
            const container = document.getElementById('treeContainer');
            
            if (!data.hasDevTreeFlow || data.nodes.length === 0) {
                container.innerHTML = \`
                    <div class="empty-state">
                        <h2>No DevTreeFlow Structure Found</h2>
                        <p>Initialize DevTreeFlow to start managing your AI development workflows.</p>
                        <button class="btn" onclick="initializeDevTreeFlow()">
                            <span class="icon">🚀</span>Initialize DevTreeFlow
                        </button>
                    </div>
                \`;
                return;
            }

            container.innerHTML = \`
                <h3>📂 Task Trees</h3>
                \${data.nodes.map(node => renderNode(node)).join('')}
            \`;
        }

        function renderNode(node) {
            const statusIcon = {
                'not-started': '⭕',
                'in-progress': '🔄',
                'completed': '✅',
                'unknown': '❓'
            }[node.status] || '❓';

            return \`
                <div class="tree-node \${node.status}">
                    <div class="node-header">
                        <div class="node-name">\${statusIcon} \${node.name}</div>
                        <div class="node-status">\${node.status.replace('-', ' ')}</div>
                    </div>
                    <div class="node-path">📁 /DevTreeFlow/\${node.path}</div>
                    <div class="node-actions">
                        <button class="btn" onclick="switchToNode('\${node.path}')">
                            🎯 Switch to Me
                        </button>
                        <button class="btn secondary" onclick="switchAndFollowParent('\${node.path}')">
                            👨‍👩‍👧‍👦 Follow Parent
                        </button>
                        <button class="btn secondary" onclick="assessChildren('\${node.path}')">
                            👀 Assess Children
                        </button>
                        <button class="btn secondary" onclick="summarizeStatus('\${node.path}')">
                            📊 Status Summary
                        </button>
                    </div>
                    \${node.children.length > 0 ? \`
                        <div class="node-children">
                            \${node.children.map(child => renderNode(child)).join('')}
                        </div>
                    \` : ''}
                </div>
            \`;
        }

        function switchToNode(nodePath) {
            if (copyToPromptBuilderMode) {
                vscode.postMessage({
                    command: 'treeActionPrompt',
                    prompt: \`nodePath:\${nodePath}\\naction:switchToNode\`
                });
            } else {
                vscode.postMessage({
                    command: 'switchToNode',
                    nodePath: nodePath
                });
            }
        }

        function switchAndFollowParent(nodePath) {
            if (copyToPromptBuilderMode) {
                vscode.postMessage({
                    command: 'treeActionPrompt',
                    prompt: \`nodePath:\${nodePath}\\naction:switchAndFollowParent\`
                });
            } else {
                vscode.postMessage({
                    command: 'switchAndFollowParent',
                    nodePath: nodePath
                });
            }
        }

        function assessChildren(nodePath) {
            if (copyToPromptBuilderMode) {
                vscode.postMessage({
                    command: 'treeActionPrompt',
                    prompt: \`nodePath:\${nodePath}\\naction:assessChildren\`
                });
            } else {
                vscode.postMessage({
                    command: 'assessChildren',
                    nodePath: nodePath
                });
            }
        }

        function summarizeStatus(nodePath) {
            if (copyToPromptBuilderMode) {
                vscode.postMessage({
                    command: 'treeActionPrompt',
                    prompt: \`nodePath:\${nodePath}\\naction:summarizeStatus\`
                });
            } else {
                vscode.postMessage({
                    command: 'summarizeStatus',
                    nodePath: nodePath
                });
            }
        }

        function newTaskTree() {
            vscode.postMessage({
                command: 'newTaskTree'
            });
        }

        function refreshTree() {
            vscode.postMessage({
                command: 'refreshTree'
            });
        }

        function initializeDevTreeFlow() {
            vscode.postMessage({
                command: 'initializeDevTreeFlow'
            });
        }

        function toggleAutoPromptingMode() {
            vscode.postMessage({
                command: 'toggleAutoPromptingMode'
            });
        }

        function openNewCursorChat() {
            vscode.postMessage({
                command: 'openNewCursorChat'
            });
        }
        
        function openNewCursorChatTab() {
            vscode.postMessage({
                command: 'openNewCursorChatTab'
            });
        }

        function clearCurrentChat() {
            vscode.postMessage({ command: 'clearCurrentChat' });
        }

        function toggleCopyToPromptBuilderMode() {
            copyToPromptBuilderMode = !copyToPromptBuilderMode;
            vscode.postMessage({ command: 'toggleCopyToPromptBuilderMode' });
        }

        function toggleContextFileTick(filename) {
            vscode.postMessage({ command: 'toggleContextFileTick', filename: filename });
        }

        function openContextFile(filename) {
            vscode.postMessage({ command: 'openContextFile', filename: filename });
        }

        function createContextFolder(folderPath) {
            vscode.postMessage({ command: 'createContextFolder', folderPath: folderPath || '' });
        }

        function createContextDocument(folderPath) {
            vscode.postMessage({ command: 'createContextDocument', folderPath: folderPath || '' });
        }

        function refreshContextFiles() {
            vscode.postMessage({ command: 'refreshContextFiles' });
        }

        function renderFolderStructure(structure, ticks) {
            if (!structure) return '';
            
            var html = '';
            
            if (structure.type === 'folder') {
                html += \`<div class="context-folder-item">
                    <span class="context-folder-icon">📁</span>
                    <span class="context-folder-name">\${structure.name}</span>
                    <div class="context-folder-actions">
                        <button class="context-add-btn" onclick="createContextFolder('\${structure.path.replace(/'/g, "\\\\'")}')" title="Add subfolder">📁+</button>
                        <button class="context-add-btn" onclick="createContextDocument('\${structure.path.replace(/'/g, "\\\\'")}')" title="Add document">📄+</button>
                    </div>
                </div>\`;
                
                if (structure.children && structure.children.length > 0) {
                    html += '<div class="context-folder-children">';
                    structure.children.forEach(function(child) {
                        html += renderFolderStructure(child, ticks);
                    });
                    html += '</div>';
                }
            } else if (structure.type === 'file') {
                html += \`<div class="context-folder-item">
                    <input type="checkbox" class="context-file-checkbox" onchange="toggleContextFileTick('\${structure.path.replace(/'/g, "\\\\'")}')" \${ticks[structure.path] ? 'checked' : ''}>
                    <span class="context-folder-icon">📄</span>
                    <span class="context-folder-name">\${structure.name}</span>
                    <div class="context-folder-actions">
                        <button class="context-add-btn" onclick="openContextFile('\${structure.path.replace(/'/g, "\\\\'")}')" title="Open">👁️</button>
                    </div>
                </div>\`;
            }
            
            return html;
        }

        function updatePromptBuilder() {
            const textarea = document.getElementById('promptBuilderTextarea');
            vscode.postMessage({ command: 'updatePromptBuilder', content: textarea.value });
        }

        function autoPromptFromBuilder() {
            updatePromptBuilder(); // Save current content first
            vscode.postMessage({ command: 'autoPromptFromBuilder' });
        }

        // Update auto-prompting button state
        function updateAutoPromptingState(isEnabled) {
            const button = document.getElementById('autoPromptToggle');
            const text = document.getElementById('autoPromptText');
            
            if (isEnabled) {
                button.classList.add('enabled');
                text.textContent = 'Auto-Prompting ON';
            } else {
                button.classList.remove('enabled');
                text.textContent = 'Enable Auto-Prompting';
            }
        }

        function updateDashboardState(message) {
            const contextFilesContainer = document.getElementById('contextFilesContainer');
            const promptBuilderTextarea = document.getElementById('promptBuilderTextarea');
            const copyToPromptBuilderToggle = document.getElementById('copyToPromptBuilderToggle');

            if (message.contextFolderStructure) {
                const contextFilesHTML = \`
                    <h3>📄 Project Specific Context Files</h3>
                    <div class="context-header-actions">
                        <button class="btn secondary" onclick="createContextFolder('')" title="Create new folder">
                            <span class="icon">📁</span>New Folder
                        </button>
                        <button class="btn secondary" onclick="createContextDocument('')" title="Create new document">
                            <span class="icon">📄</span>New Document
                        </button>
                        <button class="btn secondary" onclick="refreshContextFiles()" title="Refresh">
                            <span class="icon">🔄</span>Refresh
                        </button>
                    </div>
                    <div class="context-folder-tree">
                        \${renderFolderStructure(message.contextFolderStructure, message.contextFileTicks || {})}
                    </div>
                \`;
                contextFilesContainer.innerHTML = contextFilesHTML;
            }

            if (message.promptBuilderContent !== undefined) {
                promptBuilderTextarea.value = message.promptBuilderContent;
            }

            if (message.copyToPromptBuilderMode !== undefined) {
                copyToPromptBuilderMode = message.copyToPromptBuilderMode;
                copyToPromptBuilderToggle.checked = message.copyToPromptBuilderMode;
            }
        }
        
        // Add event listener for prompt builder textarea changes
        document.getElementById('promptBuilderTextarea').addEventListener('input', function() {
            updatePromptBuilder();
        });
    </script>
</body>
</html>`;
    }

    private async handleInitializeLeaf(leafPath: string) {
        try {
            const parentPath = path.dirname(leafPath);
            const parentName = path.basename(parentPath) !== 'DevTreeFlow' ? path.basename(parentPath) : 'Root';
            
            ContextDocumentManager.initializeLeaf(leafPath, parentName);
            
            const leafName = path.basename(leafPath);
            vscode.window.showInformationMessage(`Successfully initialized leaf: ${leafName}`);
        } catch (error) {
            console.error('DevTreeFlow: Error initializing leaf:', error);
            vscode.window.showErrorMessage(`Failed to initialize leaf: ${error}`);
        }
    }

    private async handleWorkflowMode(leafPath: string, mode: string) {
        try {
            const workflowResult = await WorkflowManager.executeWorkflow(leafPath, mode);
            await vscode.env.clipboard.writeText(workflowResult);
            
            const leafName = path.basename(leafPath);
            vscode.window.showInformationMessage(`Workflow mode '${mode}' for '${leafName}' - result copied to clipboard!`);
        } catch (error) {
            console.error('DevTreeFlow: Error executing workflow:', error);
            vscode.window.showErrorMessage(`Failed to execute workflow: ${error}`);
        }
    }

    private async handleToggleAutoPromptingMode() {
        try {
            const isEnabled = AutoPromptService.toggleAutoPromptingMode();
            
            // Update the dashboard UI to reflect the new state
            if (this.panel) {
                this.panel.webview.postMessage({
                    command: 'updateAutoPromptingState',
                    isEnabled: isEnabled
                });
            }
            
        } catch (error) {
            console.error('DevTreeFlow: Error toggling auto-prompting mode:', error);
            vscode.window.showErrorMessage(`Failed to toggle auto-prompting mode: ${error}`);
        }
    }

    private async handleOpenNewCursorChat() {
        try {
            await AutoPromptService.openNewCursorChat();
        } catch (error) {
            console.error('DevTreeFlow: Error opening new Cursor chat:', error);
            vscode.window.showErrorMessage(`Failed to open new Cursor chat: ${error}`);
        }
    }

    private async handleOpenNewCursorChatTab() {
        try {
            await AutoPromptService.openNewCursorChatTab();
        } catch (error) {
            console.error('DevTreeFlow: Error opening new Cursor chat tab:', error);
            vscode.window.showErrorMessage(`Failed to open new Cursor chat tab: ${error}`);
        }
    }

    // [5] Add helpers for prompt builder and context file ticks
    private updatePromptBuilderWithContextFiles() {
        const contextDir = path.join(this.getWorkspaceFolder() || '', 'ProjectSpecificContextFiles');
        let contextReferences = '';
        
        // Collect all ticked context files
        const tickedFiles = this.contextFilesList.filter(file => this.contextFileTicks[file]);
        
        if (tickedFiles.length > 0) {
            contextReferences = 'Please read the context files for context for this request:\n';
            tickedFiles.forEach(file => {
                contextReferences += `- ${path.join(contextDir, file)}\n`;
            });
            contextReferences += '\n';
        }
        
        // Always keep tree/leaf prompt at the top (if present)
        const treePromptMatch = this.promptBuilderContent.match(/<!--TREE_PROMPT-->.*?<!--END_TREE_PROMPT-->/s);
        const treePrompt = treePromptMatch ? treePromptMatch[0] + '\n\n' : '';
        const contentWithoutTreePrompt = this.promptBuilderContent.replace(/<!--TREE_PROMPT-->.*?<!--END_TREE_PROMPT-->\n\n/s, '');
        const contentWithoutContextRefs = contentWithoutTreePrompt.replace(/Please read the context files for context for this request:[\s\S]*?\n\n/, '');
        
        this.promptBuilderContent = `${treePrompt}${contextReferences}${contentWithoutContextRefs}`;
    }

    private updateWebviewState() {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'updateDashboardState',
                contextFilesList: this.contextFilesList,
                contextFileTicks: this.contextFileTicks,
                promptBuilderContent: this.promptBuilderContent,
                copyToPromptBuilderMode: this.copyToPromptBuilderMode,
                contextFolderStructure: this.contextFolderStructure
            });
        }
    }

    private async handleAutoPromptFromBuilder() {
        // Send promptBuilderContent to chat using automation/clipboard
        if (AutoPromptService.isAutoPromptingModeEnabled()) {
            await AutoPromptService.sendPromptToChatWithAutomation(this.promptBuilderContent, 'Prompt Builder');
        } else {
            await vscode.env.clipboard.writeText(this.promptBuilderContent);
            vscode.window.showInformationMessage('Prompt builder content copied to clipboard!');
        }
    }

    private async handleTreeActionPrompt(prompt: string) {
        // If copyToPromptBuilderMode is active, inject at top of builder
        if (this.copyToPromptBuilderMode) {
            // Extract the node path from the message if it's a placeholder
            const nodePath = prompt.match(/nodePath:(.+)/)?.[1];
            const action = prompt.match(/action:(.+)/)?.[1];
            
            let actualPrompt = prompt;
            
            // Generate the actual prompt based on the action
            if (nodePath && action) {
                switch (action) {
                    case 'switchToNode':
                        actualPrompt = EnhancedPromptGenerator.generateIdentityPrompt(nodePath);
                        break;
                    case 'switchAndFollowParent':
                        const pathParts = nodePath.split(path.sep);
                        const parentName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'root';
                        actualPrompt = EnhancedPromptGenerator.generateIdentityPrompt(nodePath, 
                            `Follow parent context from '${parentName}' and execute tasks as per parent's expectations`);
                        break;
                    case 'assessChildren':
                        actualPrompt = EnhancedPromptGenerator.generateAssessmentPrompt(nodePath);
                        break;
                    case 'summarizeStatus':
                        const nodeLabel = path.basename(nodePath);
                        actualPrompt = `You are the AI agent for '${nodeLabel}' in the DevTreeFlow system.\n\nPlease provide a comprehensive status summary for this task:\n\n1. Read all context from: /DevTreeFlow/${nodePath}/\n2. Review task objectives and current progress\n3. Summarize what has been completed\n4. Identify what remains to be done\n5. Note any blockers or issues\n6. Assess overall task health and timeline\n\nProvide a clear, structured status report that can be shared with parent nodes or team members.`;
                        break;
                }
            }
            
            // Inject at top of prompt builder, preserving existing content
            const existingContent = this.promptBuilderContent.replace(/<!--TREE_PROMPT-->.*?<!--END_TREE_PROMPT-->/s, '');
            this.promptBuilderContent = `<!--TREE_PROMPT-->${actualPrompt}<!--END_TREE_PROMPT-->\n\n${existingContent}`;
            this.updateWebviewState();
        } else if (AutoPromptService.isAutoPromptingModeEnabled()) {
            await AutoPromptService.sendPromptToChatWithAutomation(prompt, 'Tree/Leaf Action');
        } else {
            await vscode.env.clipboard.writeText(prompt);
            vscode.window.showInformationMessage('Prompt copied to clipboard!');
        }
    }

    private async handleOpenContextFile(filename: string) {
        try {
            const contextDir = path.join(this.getWorkspaceFolder() || '', 'ProjectSpecificContextFiles');
            // Support POSIX-style relative paths coming from the Webview
            const normalizedParts = filename.split(/[\\/]+/);
            const filePath = path.join(contextDir, ...normalizedParts);
            
            if (fs.existsSync(filePath)) {
                const document = await vscode.workspace.openTextDocument(filePath);
                await vscode.window.showTextDocument(document);
            } else {
                vscode.window.showErrorMessage(`Context file not found: ${filename}`);
            }
        } catch (error) {
            console.error('DevTreeFlow: Error opening context file:', error);
            vscode.window.showErrorMessage(`Failed to open context file: ${error}`);
        }
    }

    private async handleCreateContextFolder(folderPath: string) {
        try {
            const contextDir = path.join(this.getWorkspaceFolder() || '', 'ProjectSpecificContextFiles');
            const folderName = await vscode.window.showInputBox({
                prompt: 'Enter folder name',
                placeHolder: 'e.g., azure-contexts, development-guides'
            });

            if (folderName) {
                const fullPath = path.join(contextDir, folderPath, folderName);
                fs.mkdirSync(fullPath, { recursive: true });
                vscode.window.showInformationMessage(`Created folder: ${folderName}`);
                this.loadContextFolderStructure();
                this.updateWebviewState();
            }
        } catch (error) {
            console.error('DevTreeFlow: Error creating folder:', error);
            vscode.window.showErrorMessage(`Failed to create folder: ${error}`);
        }
    }

    private async handleCreateContextDocument(folderPath: string, fileName?: string) {
        try {
            const contextDir = path.join(this.getWorkspaceFolder() || '', 'ProjectSpecificContextFiles');
            
            const docName = fileName || await vscode.window.showInputBox({
                prompt: 'Enter context document name',
                placeHolder: 'e.g., api-guidelines.md, testing-strategy.md'
            });

            if (docName) {
                const safeName = docName.endsWith('.md') ? docName : `${docName}.md`;
                const fullPath = path.join(contextDir, folderPath, safeName);
                
                // Create template content
                const template = `# ${safeName.replace('.md', '')}

## Context Overview
[Describe what this context document provides]

## Guidelines
- [Add specific guidelines here]

## Instructions for AI
When this document is selected:
1. [Specific instruction 1]
2. [Specific instruction 2]

## Examples
[Add relevant examples if needed]

---
*Created: ${new Date().toISOString().split('T')[0]}*
`;
                
                fs.writeFileSync(fullPath, template);
                
                // Open the new file
                const document = await vscode.workspace.openTextDocument(fullPath);
                await vscode.window.showTextDocument(document);
                
                vscode.window.showInformationMessage(`Created context document: ${safeName}`);
                this.loadContextFolderStructure();
                this.updateWebviewState();
            }
        } catch (error) {
            console.error('DevTreeFlow: Error creating document:', error);
            vscode.window.showErrorMessage(`Failed to create document: ${error}`);
        }
    }

    private loadContextFolderStructure() {
        const contextDir = path.join(this.getWorkspaceFolder() || '', 'ProjectSpecificContextFiles');
        if (!fs.existsSync(contextDir)) {
            fs.mkdirSync(contextDir, { recursive: true });
        }
        this.contextFolderStructure = this.buildContextFolderStructure(contextDir, '');
        this.contextFilesList = this.flattenContextFiles(this.contextFolderStructure);
    }

    private buildContextFolderStructure(dirPath: string, relativePath: string): any {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        const structure: any = {
            name: relativePath || 'ProjectSpecificContextFiles',
            path: relativePath,
            type: 'folder',
            children: []
        };

        for (const item of items) {
            // Skip 'Older Versions' folder
            if (item.name === 'Older Versions') continue;

            const itemPath = path.join(dirPath, item.name);
            // Build POSIX-style relative path to ensure stable separators in the Webview
            const itemRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;

            if (item.isDirectory()) {
                structure.children.push(this.buildContextFolderStructure(itemPath, itemRelativePath));
            } else if (item.isFile() && item.name.endsWith('.md')) {
                structure.children.push({
                    name: item.name,
                    path: itemRelativePath,
                    type: 'file'
                });
            }
        }

        return structure;
    }

    private flattenContextFiles(structure: any, files: string[] = []): string[] {
        if (structure.type === 'file') {
            files.push(structure.path);
        } else if (structure.children) {
            for (const child of structure.children) {
                this.flattenContextFiles(child, files);
            }
        }
        return files;
    }
}