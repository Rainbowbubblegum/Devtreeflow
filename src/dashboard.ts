import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EnhancedPromptGenerator } from './enhanced-prompt-generator';
import { WorkflowManager } from './workflow-manager';
import { ContextDocumentManager } from './context-document-manager';
import { AutoPromptService } from './auto-prompt-service';

export class DevTreeFlowDashboard {
    private panel: vscode.WebviewPanel | undefined;
    private context: vscode.ExtensionContext;

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
            padding: 20px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .header h1 {
            margin: 0;
            color: var(--vscode-titleBar-activeForeground);
        }

        .header-actions {
            display: flex;
            gap: 10px;
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

        .tree-container {
            background-color: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 15px;
        }

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

        .refresh-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌳 DevTreeFlow Dashboard</h1>
        <div class="header-actions">
            <button class="btn secondary" onclick="refreshTree()">
                <span class="icon">🔄</span>Refresh
            </button>
            <button class="btn" onclick="newTaskTree()">
                <span class="icon">➕</span>New Task Tree
            </button>
            <button class="btn" id="autoPromptToggle" onclick="toggleAutoPromptingMode()">
                <span class="icon">🤖</span><span id="autoPromptText">Enable Auto-Prompting</span>
            </button>
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

    <div class="tree-container" id="treeContainer">
        <div class="empty-state">
            <h2>No DevTreeFlow Structure Found</h2>
            <p>Initialize DevTreeFlow to start managing your AI development workflows.</p>
            <button class="btn" onclick="initializeDevTreeFlow()">
                <span class="icon">🚀</span>Initialize DevTreeFlow
            </button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateTree':
                    updateTreeDisplay(message.data);
                    break;
                case 'updateAutoPromptingState':
                    updateAutoPromptingState(message.isEnabled);
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
            vscode.postMessage({
                command: 'switchToNode',
                nodePath: nodePath
            });
        }

        function switchAndFollowParent(nodePath) {
            vscode.postMessage({
                command: 'switchAndFollowParent',
                nodePath: nodePath
            });
        }

        function assessChildren(nodePath) {
            vscode.postMessage({
                command: 'assessChildren',
                nodePath: nodePath
            });
        }

        function summarizeStatus(nodePath) {
            vscode.postMessage({
                command: 'summarizeStatus',
                nodePath: nodePath
            });
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
}