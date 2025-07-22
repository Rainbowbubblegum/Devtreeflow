import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EnhancedPromptGenerator } from './enhanced-prompt-generator';
import { WorkflowManager } from './workflow-manager';
import { ContextDocumentManager } from './context-document-manager';
import { AutoPromptService } from './auto-prompt-service';
import { readdirSync, readFileSync } from 'fs';
import { handleMessage } from './dashboard-handlers';
import { getTreeData, getNodeChildren } from './tree-management';
import { loadContextFolderStructure, updatePromptBuilderWithContextFiles } from './context-manager';
import { getAIResponse, parseTaskBreakdown, createTreeFromBreakdown } from './prompt-utils';

export class DevTreeFlowDashboard implements vscode.Disposable {
    private panel: vscode.WebviewPanel | undefined;
    private context: vscode.ExtensionContext;
    private disposables: vscode.Disposable[] = [];

    // [2] Add new state for context file ticks and prompt builder
    private contextFileTicks: { [filepath: string]: boolean } = {};
    private promptBuilderContent: string = '';
    private copyToPromptBuilderMode: boolean = false;
    private contextFilesList: string[] = [];
    private contextFolderStructure: any = null;

    public getTreeData = () => getTreeData(this);
    public getNodeChildren = (nodePath: string) => getNodeChildren(this, nodePath);

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        
        // Set this dashboard instance in AutoPromptService for routing
        AutoPromptService.setDashboard(this);
    }

    public show() {
        try {
            console.log('DevTreeFlow: Dashboard show() called');
            
            if (this.panel) {
                console.log('DevTreeFlow: Panel exists, revealing...');
                this.panel.reveal(vscode.ViewColumn.One);
                return;
            }

            // Check if DevTreeFlow folder exists
            const workspaceFolder = this.getWorkspaceFolder();
            if (workspaceFolder) {
                const devTreeFlowPath = path.join(workspaceFolder, 'DevTreeFlow');
                if (!fs.existsSync(devTreeFlowPath)) {
                    console.log('DevTreeFlow: Creating DevTreeFlow folder...');
                    fs.mkdirSync(devTreeFlowPath, { recursive: true });
                }
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
                        vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'webview')),
                        vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
                    ]
                }
            );

            // Get logo URI for webview
            const logoUri = this.panel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'Devtreeflow.PNG')));

            console.log('DevTreeFlow: Setting WebView content...');
            // Load context folder structure
            loadContextFolderStructure(this);
            this.panel.webview.html = this.getWebviewContent();

            // Properly handle disposables to prevent listener leaks
            const messageDisposable = this.panel.webview.onDidReceiveMessage(
                async (message) => {
                    await handleMessage(message, this);
                },
                undefined,
                this.context.subscriptions
            );
            this.disposables.push(messageDisposable);

            const panelDisposable = this.panel.onDidDispose(() => {
                console.log('DevTreeFlow: Panel disposed');
                this.panel = undefined;
                this.dispose();
            });
            this.disposables.push(panelDisposable);

            console.log('DevTreeFlow: Dashboard created successfully');
        } catch (error: any) {
            console.error('DevTreeFlow: Error in dashboard show():', error);
            vscode.window.showErrorMessage(`Failed to create dashboard: ${error.message}`);
        }
    }

    public dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }

    private getWebviewContent(): string {
        if (!this.panel) {
            console.log('DevTreeFlow: getWebviewContent - No panel found');
            return '';
        }
        const webviewPath = path.join(this.context.extensionPath, 'src', 'webview');
        const htmlPath = path.join(webviewPath, 'index.html');
        
        console.log('DevTreeFlow: Extension path:', this.context.extensionPath);
        console.log('DevTreeFlow: Webview path:', webviewPath);
        console.log('DevTreeFlow: HTML path:', htmlPath);
        console.log('DevTreeFlow: HTML file exists:', fs.existsSync(htmlPath));
        
        if (!fs.existsSync(htmlPath)) {
            console.error('DevTreeFlow: HTML file not found at:', htmlPath);
            return '<html><body><h1>Error: HTML file not found</h1></body></html>';
        }
        
        let html = fs.readFileSync(htmlPath, 'utf8');
        console.log('DevTreeFlow: HTML content length:', html.length);

        const toUri = (filePath: string) => {
            if (!this.panel) {
                return vscode.Uri.file('');
            }
            return this.panel.webview.asWebviewUri(vscode.Uri.file(path.join(webviewPath, filePath)))
        };
        
        const cssUri = toUri('styles.css').toString();
        const jsUri = toUri('main.js').toString();
        console.log('DevTreeFlow: CSS URI:', cssUri);
        console.log('DevTreeFlow: JS URI:', jsUri);
        
        html = html.replace('styles.css', cssUri);
        html = html.replace('main.js', jsUri);

        const logoPath = this.panel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'Devtreeflow.PNG')));
        console.log('DevTreeFlow: Logo URI:', logoPath.toString());
        html = html.replace('src=""', `src="${logoPath}"`);

        console.log('DevTreeFlow: Final HTML length:', html.length);
        return html;
    }

    private async handleSwitchToNode(nodePath: string) {
        const nodeLabel = path.basename(nodePath);
        const prompt = EnhancedPromptGenerator.generateIdentityPrompt(nodePath);
        
        // Use centralized routing that checks copyToPromptBuilderMode
        await AutoPromptService.routePrompt(prompt, `Switch to '${nodeLabel}'`, this);
    }

    private async handleSwitchAndFollowParent(nodePath: string) {
        const pathParts = nodePath.split(path.sep);
        const nodeLabel = pathParts[pathParts.length - 1];
        const parentName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'root';
        const prompt = EnhancedPromptGenerator.generateIdentityPrompt(nodePath, 
            `Follow parent context from '${parentName}' and execute tasks as per parent's expectations`);
        
        // Use centralized routing that checks copyToPromptBuilderMode
        await AutoPromptService.routePrompt(prompt, `Follow Parent for '${nodeLabel}'`, this);
    }

    private async handleAssessChildren(nodePath: string) {
        const nodeLabel = path.basename(nodePath);
        const prompt = EnhancedPromptGenerator.generateAssessmentPrompt(nodePath);
        
        // Use centralized routing that checks copyToPromptBuilderMode
        await AutoPromptService.routePrompt(prompt, `Assess Children for '${nodeLabel}'`, this);
    }

    private async handleSummarizeStatus(nodePath: string) {
        const nodeLabel = path.basename(nodePath);
        const prompt = `You are the AI agent for '${nodeLabel}' in the DevTreeFlow system.\n\nPlease provide a comprehensive status summary for this task:\n\n1. Read all context from: /DevTreeFlow/${nodePath}/\n2. Review task objectives and current progress\n3. Summarize what has been completed\n4. Identify what remains to be done\n5. Note any blockers or issues\n6. Assess overall task health and timeline\n\nProvide a clear, structured status report that can be shared with parent nodes or team members.`;
        
        // Use centralized routing that checks copyToPromptBuilderMode
        await AutoPromptService.routePrompt(prompt, `Status Summary for '${nodeLabel}'`, this);
    }

    private async handleNewTaskTree() {
        const mainGoal = await vscode.window.showInputBox({
            prompt: 'Enter the main goal for your new task tree',
            placeHolder: 'e.g., Implement a full user authentication system'
        });

        if (!mainGoal) {
            return;
        }

        const workspaceFolder = this.getWorkspaceFolder();
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        const devTreeFlowPath = path.join(workspaceFolder, 'DevTreeFlow');

        try {
            if (!fs.existsSync(devTreeFlowPath)) {
                await this.handleInitializeDevTreeFlow();
            }

            const prompt = EnhancedPromptGenerator.generateGenesisPrompt(mainGoal);

            if (AutoPromptService.isAutoPromptingModeEnabled()) {
                
                await AutoPromptService.sendPromptToChatWithAutomation(prompt, 'New Task Tree');
                vscode.window.showInformationMessage('Waiting for AI to break down the main goal...');
                
                // This is a conceptual placeholder. We'll need a robust way to get the response.
                const aiResponse = await this.getAIResponse();

                if(aiResponse) {
                    const breakdown = this.parseTaskBreakdown(aiResponse);
                    if(breakdown) {
                        await this.createTreeFromBreakdown(breakdown, mainGoal);
                        vscode.window.showInformationMessage('Task tree created successfully!');
                    } else {
                        vscode.window.showErrorMessage('Failed to parse the AI\'s task breakdown.');
                    }
                }
                // Note: If no AI response is provided (user cancels), we silently continue without error


            } else {
                await vscode.env.clipboard.writeText(prompt);
                vscode.window.showInformationMessage(`Genesis prompt for "${mainGoal}" copied to clipboard. Paste it to have the AI break it down, then use the 'Create Tree from AI Response' button.`);
            }

            // The folder creation will be handled after we get the AI's response.
            // For now, we just refresh to show any new base folders.
            this.refreshTreeData();

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create task tree: ${error}`);
        }
    }

    private async handleCreateTreeFromAIResponse() {
        const aiResponse = await vscode.window.showInputBox({
            prompt: "Paste the AI's task breakdown response here",
            placeHolder: "The full response from the AI, including the <task_breakdown> tags"
        });

        if (!aiResponse) {
            return;
        }

        const mainGoal = await vscode.window.showInputBox({
            prompt: 'Please re-enter the main goal for context',
            placeHolder: 'e.g., Implement a full user authentication system'
        });

        if (!mainGoal) {
            return;
        }

        try {
            const breakdown = this.parseTaskBreakdown(aiResponse);
            if (breakdown) {
                await this.createTreeFromBreakdown(breakdown, mainGoal);
                vscode.window.showInformationMessage('Task tree created successfully from AI response!');
                this.refreshTreeData();
            } else {
                vscode.window.showErrorMessage("Failed to parse the AI's task breakdown. Please make sure you've copied the full response.");
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create task tree from AI response: ${error}`);
        }
    }
    private async getAIResponse(): Promise<string | undefined> {
        // This is a placeholder for the logic to get the AI's response.
        // In a real implementation, this would involve listening to chat events.
        return await vscode.window.showInputBox({
            prompt: 'Paste the AI\'s task breakdown response here.',
            placeHolder: '<task_breakdown>...'
        });
    }

    private parseTaskBreakdown(response: string): any[] | null {
        const breakdownRegex = /<task_breakdown>([\s\S]*?)<\/task_breakdown>/;
        const match = response.match(breakdownRegex);
        if (!match) {
            return null;
        }

        const lines = match[1].trim().split('\n');
        const tree: any[] = [];
        let currentKeyTask: any = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('- ')) {
                const [name, description] = trimmedLine.substring(2).split('|').map(s => s.trim());
                if (name && description) {
                    currentKeyTask = {
                        name,
                        description,
                        children: []
                    };
                    tree.push(currentKeyTask);
                }
            } else if (trimmedLine.startsWith('  - ')) {
                if (currentKeyTask) {
                    const [name, description] = trimmedLine.substring(4).split('|').map(s => s.trim());
                    if (name && description) {
                        currentKeyTask.children.push({
                            name,
                            description
                        });
                    }
                }
            }
        }
        return tree;
    }

    private async createTreeFromBreakdown(breakdown: any[], mainGoal: string) {
        const prompt = `# DevTreeFlow AI - Process Breakdown Data

You are the DevTreeFlow AI. Process this breakdown data and create the complete folder structure.

## BREAKDOWN DATA TO PROCESS:
${JSON.stringify(breakdown, null, 2)}

## MAIN GOAL: ${mainGoal}

## MANDATORY EXECUTION SEQUENCE:

### Step 1: Read System Rules
<function_calls>
<invoke name="read_file">
<parameter name="target_file">DevTreeFlow/tree-start.md</parameter>
<parameter name="explanation">Reading system rules to understand folder structure requirements</parameter>
<parameter name="should_read_entire_file">true</parameter>
</invoke>
</function_calls>

### Step 2: Check Existing Structure
<function_calls>
<invoke name="list_dir">
<parameter name="relative_workspace_path">DevTreeFlow</parameter>
<parameter name="explanation">Checking what folders already exist in DevTreeFlow directory</parameter>
</invoke>
</function_calls>

### Step 3: Process Breakdown Data
For EACH task in the breakdown data above:

1. Extract the task name and make it filesystem-safe (replace spaces with hyphens)
2. Create the main task folder:
<function_calls>
<invoke name="run_terminal_cmd">
<parameter name="command">mkdir -p "DevTreeFlow/[TASK-NAME]"</parameter>
<parameter name="is_background">false</parameter>
<parameter name="explanation">Creating main folder for [TASK-NAME]</parameter>
</invoke>
</function_calls>

3. Create required subfolders:
<function_calls>
<invoke name="run_terminal_cmd">
<parameter name="command">mkdir -p "DevTreeFlow/[TASK-NAME]/InstructionsFromParent"</parameter>
<parameter name="is_background">false</parameter>
<parameter name="explanation">Creating InstructionsFromParent folder for [TASK-NAME]</parameter>
</invoke>
</function_calls>

<function_calls>
<invoke name="run_terminal_cmd">
<parameter name="command">mkdir -p "DevTreeFlow/[TASK-NAME]/MeAndMyChildren"</parameter>
<parameter name="is_background">false</parameter>
<parameter name="explanation">Creating MeAndMyChildren folder for [TASK-NAME]</parameter>
</invoke>
</function_calls>

### Step 4: Create Required Files
For EACH task folder:

1. Create briefing.md:
<function_calls>
<invoke name="edit_file">
<parameter name="target_file">DevTreeFlow/[TASK-NAME]/InstructionsFromParent/briefing.md</parameter>
<parameter name="instructions">Creating briefing file for [TASK-NAME] with task description and instructions</parameter>
<parameter name="code_edit"># Task Briefing: [TASK-NAME]

## Parent: [PARENT-NAME]
## Main Goal: ${mainGoal}

## Task Description
[Extract description from breakdown data]

## Success Criteria
- [Specific measurable outcome 1]
- [Specific measurable outcome 2]
- [Specific measurable outcome 3]

## Specific Instructions
1. [Detailed instruction 1]
2. [Detailed instruction 2]
3. [Detailed instruction 3]

## Context from Parent
This task is part of achieving: ${mainGoal}
[Additional context about how this fits into the larger goal]
</parameter>
</function_calls>

2. Create progress file:
<function_calls>
<invoke name="edit_file">
<parameter name="target_file">DevTreeFlow/[TASK-NAME]/MeAndMyChildren/00_intro.md</parameter>
<parameter name="instructions">Creating progress tracking file for [TASK-NAME]</parameter>
<parameter name="code_edit"># Task Progress: [TASK-NAME]

## Status: Pending
## Parent: [PARENT-NAME]
## Created: [CURRENT-DATE]

## Overview
[Task overview based on breakdown data]

## My Responsibilities
1. [Responsibility 1]
2. [Responsibility 2]
3. [Responsibility 3]

## Sub-tasks
[List any sub-tasks from breakdown data]

## Progress Log
- [CURRENT-DATE]: Task created, awaiting start
</parameter>
</function_calls>

### Step 5: Final Summary
After creating all folders and files, provide a summary:

TASK BREAKDOWN COMPLETE:
Main Goal: ${mainGoal}

Tasks Created:
[List all tasks created with their paths]

Total Folders Created: [Number]
Total Files Created: [Number]

Ready for AI agents to begin work!

## IMPORTANT: Variable Replacement
When processing the breakdown data:
1. Replace [TASK-NAME] with actual task names from the breakdown
2. Replace [PARENT-NAME] with the appropriate parent (Root for top-level tasks)
3. Replace [CURRENT-DATE] with today's date
4. Extract descriptions and details from the breakdown JSON data

Start execution now!`;
        
        // Send or copy prompt for AI to handle creation
        if (AutoPromptService.isAutoPromptingModeEnabled()) {
            await AutoPromptService.sendPromptToChatWithAutomation(prompt, 'Create Tree from Breakdown');
        } else {
            await vscode.env.clipboard.writeText(prompt);
            vscode.window.showInformationMessage('Prompt to create tree copied - paste into AI chat.');
        }
        setTimeout(() => this.refreshTreeData(), 3000); // Delay for AI
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
        return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    }

    public refreshTreeData() {
        if (this.panel) {
            console.log('DevTreeFlow: Refreshing tree data...');
            const treeData = this.getTreeData();
            console.log('DevTreeFlow: Tree data:', treeData);
            this.panel.webview.postMessage({ command: 'updateTree', data: treeData });

            // Also refresh context files
            loadContextFolderStructure(this);
            this.updateWebviewState();
        }
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
        updatePromptBuilderWithContextFiles(this);
    }

    public updateWebviewState() {
        if (this.panel) {
            console.log('DevTreeFlow: Updating webview state with context structure:', JSON.stringify(this.contextFolderStructure, null, 2));
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
            await AutoPromptService.sendPromptToChatWithAutomationAndSend(this.promptBuilderContent, 'Prompt Builder');
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
        loadContextFolderStructure(this);
    }

    private async handleNodeAction(nodePath: string) {
        const workspaceFolder = this.getWorkspaceFolder();
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found. Please open a project or workspace.');
            return;
        }

        const actions = [
            { label: 'Switch to this Node', action: 'switchToNode' },
            { label: 'Assess Children', action: 'assessChildren' },
            { label: 'Summarize Status', action: 'summarizeStatus' },
            { label: 'View Briefing', action: 'viewBriefing' },
            { label: 'Break Down into Sub-Tasks', action: 'breakDownSubTasks' },
            { label: 'Setup Sub-Task', action: 'setupSubTask' },
            { label: 'Review Children Details', action: 'reviewChildren' }
        ];

        const selected = await vscode.window.showQuickPick(actions, { title: `Actions for ${path.basename(nodePath)}` });

        if (selected) {
            const chosenAction = selected.action;
            switch (chosenAction) {
                case 'switchToNode':
                    await this.handleSwitchToNode(nodePath);
                    break;
                case 'assessChildren':
                    await this.handleAssessChildren(nodePath);
                    break;
                case 'summarizeStatus':
                    await this.handleSummarizeStatus(nodePath);
                    break;
                case 'viewBriefing':
                    const briefingPath = path.join(workspaceFolder, 'DevTreeFlow', nodePath, 'InstructionsFromParent', 'briefing.md');
                    try {
                        const document = await vscode.workspace.openTextDocument(briefingPath);
                        await vscode.window.showTextDocument(document);
                    } catch (error) {
                        vscode.window.showErrorMessage(`Could not open briefing file: ${briefingPath}`);
                    }
                    break;
                case 'breakDownSubTasks':
                    await this.handleBreakDownSubTasks(nodePath);
                    break;
                case 'setupSubTask':
                    await this.handleSetupSubTask(nodePath);
                    break;
                case 'reviewChildren':
                    const children = getNodeChildren(this, nodePath);
                    const child = await vscode.window.showQuickPick(children.map(c => c.name));
                    if(child) {
                        await this.handleNodeAction(path.join(nodePath, child));
                    }
                    break;
            }
        }
    }

    private async handleBreakDownSubTasks(nodePath: string) {
        const subTaskGoal = await vscode.window.showInputBox({
            prompt: 'Enter the goal for breaking down this node into sub-tasks',
            placeHolder: 'e.g., Break down user authentication implementation'
        });
        if (subTaskGoal) {
            const prompt = EnhancedPromptGenerator.generateGenesisPrompt(subTaskGoal);
            if (AutoPromptService.isAutoPromptingModeEnabled()) {
                await AutoPromptService.sendPromptToChatWithAutomation(prompt, `Break Down Sub-Tasks for ${path.basename(nodePath)}`);
            } else {
                await vscode.env.clipboard.writeText(prompt);
                vscode.window.showInformationMessage(`Sub-task breakdown prompt for "${subTaskGoal}" copied to clipboard.`);
            }
        }
    }

    private async handleSetupSubTask(nodePath: string) {
        const subTaskName = await vscode.window.showInputBox({
            prompt: 'Enter name for new sub-task',
            placeHolder: 'e.g., Implement Login Endpoint'
        });
        if (subTaskName) {
            const prompt = `You are DevTreeFlow AI. Create sub-task /DevTreeFlow/${nodePath}/${subTaskName}:

1. <function_call name="list_dir">
<parameter name="relative_workspace_path">DevTreeFlow/${nodePath}</parameter>
</function_call>

2. <function_call name="run_terminal_cmd">
<parameter name="command">mkdir -p "DevTreeFlow/${nodePath}/${subTaskName}"</parameter>
<parameter name="is_background">false</parameter>
<parameter name="explanation">Creating sub-task folder structure</parameter>
</function_call>

3. <function_call name="run_terminal_cmd">
<parameter name="command">mkdir -p "DevTreeFlow/${nodePath}/${subTaskName}/InstructionsFromParent"</parameter>
<parameter name="is_background">false</parameter>
<parameter name="explanation">Creating InstructionsFromParent folder</parameter>
</function_call>

4. <function_call name="run_terminal_cmd">
<parameter name="command">mkdir -p "DevTreeFlow/${nodePath}/${subTaskName}/MeAndMyChildren"</parameter>
<parameter name="is_background">false</parameter>
<parameter name="explanation">Creating MeAndMyChildren folder</parameter>
</function_call>

5. <function_call name="edit_file">
<parameter name="target_file">DevTreeFlow/${nodePath}/${subTaskName}/MeAndMyChildren/00_intro.md</parameter>
<parameter name="instructions">Creating initial progress file for ${subTaskName}</parameter>
<parameter name="code_edit"># ${subTaskName} - Sub-Task Introduction

## Created: ${new Date().toISOString().split('T')[0]}
## Status: Not Started

This is a sub-task of: **${path.basename(nodePath)}**

### Task Overview
[Describe what this sub-task should accomplish]

### Progress Log
- [${new Date().toISOString().split('T')[0]}] Task created and initialized

### Notes
- Waiting for instructions to begin
- Parent task: ${path.basename(nodePath)}
</parameter>
</function_call>

6. <function_call name="read_file">
<parameter name="target_file">DevTreeFlow/tree-start.md</parameter>
<parameter name="explanation">Reading system rules for context</parameter>
</function_call>

Follow the system rules from tree-start.md. Create briefing.md with parent context linking to "${path.basename(nodePath)}".`;
            if (AutoPromptService.isAutoPromptingModeEnabled()) {
                await AutoPromptService.sendPromptToChatWithAutomation(prompt, `Setup Sub-Task '${subTaskName}'`);
            } else {
                await vscode.env.clipboard.writeText(prompt);
                vscode.window.showInformationMessage(`Prompt to create sub-task '${subTaskName}' copied to clipboard. Paste into AI chat to execute.`);
            }
            // Refresh after AI would have created it
            setTimeout(() => this.refreshTreeData(), 2000); // Delay to allow AI to act
        }
    }

    private async handleReviewChildren(nodePath: string) {
        const workspaceFolder = this.getWorkspaceFolder();
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }
        const children = getNodeChildren(nodePath, workspaceFolder);
        if (children.length === 0) {
            vscode.window.showInformationMessage('No children found for this node.');
            return;
        }
        const childDetails = children.map(child => ({
            label: child.name,
            description: `Status: ${child.status}`,
            detail: `Path: /DevTreeFlow/${child.path}`
        }));
        const selected = await vscode.window.showQuickPick(childDetails, { placeHolder: 'Select a child to review' });
        if (selected) {
            await this.handleNodeAction(path.join(nodePath, selected.label)); // Recursive call for child actions
        }
    }
}