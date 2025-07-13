import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { DevTreeFlowDashboard } from './dashboard';
import { AutoPromptService } from './auto-prompt-service';
import { CursorCommandTester } from './cursor-command-tester';

export function activate(context: vscode.ExtensionContext) {
    const provider = new DevTreeFlowProvider(context);
    vscode.window.registerTreeDataProvider('devTreeFlowExplorer', provider);
    
    const dashboard = new DevTreeFlowDashboard(context);

    const refreshCommand = vscode.commands.registerCommand('devtreeflow.refreshTree', () => {
        provider.refresh();
    });

    const newTaskTreeCommand = vscode.commands.registerCommand('devtreeflow.newTaskTree', async () => {
        await handleNewTaskTree();
    });

    const switchToNodeCommand = vscode.commands.registerCommand('devtreeflow.switchToNode', (item: TreeNode) => {
        handleSwitchToNode(item);
    });

    const switchAndFollowParentCommand = vscode.commands.registerCommand('devtreeflow.switchAndFollowParent', (item: TreeNode) => {
        handleSwitchAndFollowParent(item);
    });

    const assessChildrenCommand = vscode.commands.registerCommand('devtreeflow.assessChildren', (item: TreeNode) => {
        handleAssessChildren(item);
    });

    const summarizeStatusCommand = vscode.commands.registerCommand('devtreeflow.summarizeStatus', (item: TreeNode) => {
        handleSummarizeStatus(item);
    });

    const createDevTreeFlowCommand = vscode.commands.registerCommand('devtreeflow.createDevTreeFlow', async () => {
        await handleCreateDevTreeFlow();
    });

    const showDashboardCommand = vscode.commands.registerCommand('devtreeflow.showDashboard', () => {
        try {
            dashboard.show();
            console.log('DevTreeFlow: Dashboard show command executed');
        } catch (error) {
            console.error('DevTreeFlow: Error showing dashboard:', error);
            vscode.window.showErrorMessage(`Failed to show DevTreeFlow dashboard: ${error}`);
        }
    });

    // Auto-prompting commands
    const autoPromptCurrentLeafCommand = vscode.commands.registerCommand('devtreeflow.autoPromptCurrentLeaf', async () => {
        await AutoPromptService.autoPromptCurrentLeaf();
    });

    const autoPromptWithContextCommand = vscode.commands.registerCommand('devtreeflow.autoPromptWithContext', async () => {
        await AutoPromptService.autoPromptWithContext();
    });

    const autoPromptAssessmentCommand = vscode.commands.registerCommand('devtreeflow.autoPromptAssessment', async () => {
        await AutoPromptService.autoPromptAssessment();
    });

    const autoPromptCorrectionCommand = vscode.commands.registerCommand('devtreeflow.autoPromptCorrection', async () => {
        await AutoPromptService.autoPromptCorrection();
    });

    const autoPromptRecoveryCommand = vscode.commands.registerCommand('devtreeflow.autoPromptRecovery', async () => {
        await AutoPromptService.autoPromptRecovery();
    });

    const quickSwitchToLeafCommand = vscode.commands.registerCommand('devtreeflow.quickSwitchToLeaf', async () => {
        await AutoPromptService.quickSwitchToLeaf();
    });

    // New auto-prompting mode commands
    const toggleAutoPromptingModeCommand = vscode.commands.registerCommand('devtreeflow.toggleAutoPromptingMode', async () => {
        const isEnabled = AutoPromptService.toggleAutoPromptingMode();
        vscode.window.showInformationMessage(`Auto-prompting mode ${isEnabled ? 'enabled' : 'disabled'}`);
    });

    const openNewCursorChatCommand = vscode.commands.registerCommand('devtreeflow.openNewCursorChat', async () => {
        await AutoPromptService.openNewCursorChat();
    });

    const focusCursorChatCommand = vscode.commands.registerCommand('devtreeflow.focusCursorChat', async () => {
        await AutoPromptService.focusChatInput();
    });

    // Test commands for debugging
    const testCursorCommandsCommand = vscode.commands.registerCommand('devtreeflow.testCursorCommands', async () => {
        await CursorCommandTester.testCursorCommands();
    });

    const testAutomationFlowCommand = vscode.commands.registerCommand('devtreeflow.testAutomationFlow', async () => {
        await CursorCommandTester.testAutomationFlow();
    });

    const listAvailableCommandsCommand = vscode.commands.registerCommand('devtreeflow.listAvailableCommands', async () => {
        await CursorCommandTester.listAvailableCommands();
    });

    // Test keyboard simulation
    const testKeyboardSimulationCommand = vscode.commands.registerCommand('devtreeflow.testKeyboardSimulation', async () => {
        try {
            const { KeyboardSimulator } = await import('./keyboard-simulator');
            
            // Test if keyboard simulation is available
            const isAvailable = await KeyboardSimulator.isKeyboardSimulationAvailable();
            vscode.window.showInformationMessage(`Keyboard simulation available: ${isAvailable}`);
            
            if (isAvailable) {
                // Test a simple keyboard shortcut
                const success = await KeyboardSimulator.simulateKeyboardShortcut('ctrl+v');
                vscode.window.showInformationMessage(`Keyboard simulation test: ${success ? 'SUCCESS' : 'FAILED'}`);
            }
            
        } catch (error) {
            console.error('DevTreeFlow: Error testing keyboard simulation:', error);
            vscode.window.showErrorMessage(`Keyboard simulation test failed: ${error}`);
        }
    });

    // Add Clear Current Chat command
    const clearCurrentChatCommand = vscode.commands.registerCommand('devtreeflow.clearCurrentChat', async () => {
        await AutoPromptService.clearCurrentChatWithFeedback();
    });

    context.subscriptions.push(
        refreshCommand,
        newTaskTreeCommand,
        switchToNodeCommand,
        switchAndFollowParentCommand,
        assessChildrenCommand,
        summarizeStatusCommand,
        createDevTreeFlowCommand,
        showDashboardCommand,
        autoPromptCurrentLeafCommand,
        autoPromptWithContextCommand,
        autoPromptAssessmentCommand,
        autoPromptCorrectionCommand,
        autoPromptRecoveryCommand,
        quickSwitchToLeafCommand,
        toggleAutoPromptingModeCommand,
        openNewCursorChatCommand,
        focusCursorChatCommand,
        testCursorCommandsCommand,
        testAutomationFlowCommand,
        listAvailableCommandsCommand,
        testKeyboardSimulationCommand,
        clearCurrentChatCommand
    );

    checkForDevTreeFlowFolder();
}

class DevTreeFlowProvider implements vscode.TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined | void> = new vscode.EventEmitter<TreeNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TreeNode): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeNode): Thenable<TreeNode[]> {
        const workspaceFolder = getWorkspaceFolder();
        if (!workspaceFolder) {
            return Promise.resolve([]);
        }

        const devTreeFlowPath = path.join(workspaceFolder, 'DevTreeFlow');
        
        if (!fs.existsSync(devTreeFlowPath)) {
            return Promise.resolve([]);
        }

        if (!element) {
            return Promise.resolve(this.getNodesInDirectory(devTreeFlowPath, ''));
        } else {
            const fullPath = path.join(devTreeFlowPath, element.relativePath);
            return Promise.resolve(this.getNodesInDirectory(fullPath, element.relativePath));
        }
    }

    private getNodesInDirectory(dirPath: string, relativePath: string): TreeNode[] {
        if (!fs.existsSync(dirPath)) {
            return [];
        }

        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        const nodes: TreeNode[] = [];

        for (const item of items) {
            if (item.isDirectory()) {
                const nodeRelativePath = relativePath ? path.join(relativePath, item.name) : item.name;
                const fullPath = path.join(dirPath, item.name);
                const hasChildren = this.hasSubdirectories(fullPath);
                
                const node = new TreeNode(
                    item.name,
                    nodeRelativePath,
                    hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
                );
                nodes.push(node);
            }
        }

        return nodes;
    }

    private hasSubdirectories(dirPath: string): boolean {
        try {
            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            return items.some(item => item.isDirectory());
        } catch {
            return false;
        }
    }
}

class TreeNode extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly relativePath: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.contextValue = 'treeNode';
        this.tooltip = `${this.label} - ${this.relativePath}`;
    }
}

function getWorkspaceFolder(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    return workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : undefined;
}

function checkForDevTreeFlowFolder() {
    const workspaceFolder = getWorkspaceFolder();
    if (!workspaceFolder) {
        return;
    }

    const devTreeFlowPath = path.join(workspaceFolder, 'DevTreeFlow');
    if (!fs.existsSync(devTreeFlowPath)) {
        vscode.window.showInformationMessage(
            'DevTreeFlow folder not found. Would you like to initialize it?',
            'Initialize'
        ).then(selection => {
            if (selection === 'Initialize') {
                vscode.commands.executeCommand('devtreeflow.createDevTreeFlow');
            }
        });
    }
}

async function handleCreateDevTreeFlow() {
    const workspaceFolder = getWorkspaceFolder();
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

        const templatePath = path.join(devTreeFlowPath, 'templates');
        if (!fs.existsSync(templatePath)) {
            fs.mkdirSync(templatePath);
        }

        const nodeTemplateContent = `# Node Template

## Task: [TASK_NAME]
## Parent: [PARENT_NAME]
## Created: [DATE]

### Role Description
[What this agent is responsible for]

### Expected Inputs
[What this agent needs from parent/siblings]

### Expected Outputs
[What this agent should produce]

### Success Criteria
[How to know when this task is complete]

### Progress Notes
[Track progress here]
`;

        const nodeTemplatePath = path.join(templatePath, 'node-template.md');
        fs.writeFileSync(nodeTemplatePath, nodeTemplateContent);

        vscode.window.showInformationMessage('DevTreeFlow initialized successfully!');
        
        const rootPrompt = `I need you to act as the root DevTreeFlow agent. Please read the context from /DevTreeFlow/tree-start.md and begin setting up the structured development workflow. 

The DevTreeFlow system is now initialized. You should:
1. Read the tree-start.md file for full context
2. Break down your current task into logical subtasks
3. Create child node folders with proper structure
4. Begin coordinating the development workflow

Ask me what task you'd like to break down using this system.`;

        await vscode.env.clipboard.writeText(rootPrompt);
        vscode.window.showInformationMessage('Root agent prompt copied to clipboard!');

    } catch (error) {
        vscode.window.showErrorMessage(`Failed to initialize DevTreeFlow: ${error}`);
    }
}

async function handleNewTaskTree() {
    const taskName = await vscode.window.showInputBox({
        prompt: 'Enter the name for your new task tree',
        placeHolder: 'e.g., AddCustomerForm, FixBugInLogin'
    });

    if (!taskName) {
        return;
    }

    const workspaceFolder = getWorkspaceFolder();
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    const devTreeFlowPath = path.join(workspaceFolder, 'DevTreeFlow');
    const taskPath = path.join(devTreeFlowPath, taskName);

    try {
        if (!fs.existsSync(devTreeFlowPath)) {
            await handleCreateDevTreeFlow();
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
3. Break this task down into 2-5 logical subtasks
4. Create child node folders for each subtask with proper structure
5. Write clear instructions for each child agent

Begin by analyzing the task "${taskName}" and creating the necessary child nodes.`;

        await vscode.env.clipboard.writeText(prompt);
        vscode.window.showInformationMessage(`Task tree '${taskName}' created! Root prompt copied to clipboard.`);

        vscode.commands.executeCommand('devtreeflow.refreshTree');

    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create task tree: ${error}`);
    }
}

async function handleSwitchToNode(item: TreeNode) {
    const workspaceFolder = getWorkspaceFolder();
    if (!workspaceFolder) {
        return;
    }

    const prompt = `You are an AI agent assigned to the '${item.label}' task in the DevTreeFlow system.

Read all context files inside:
- /DevTreeFlow/${item.relativePath}/InstructionsFromParent/
- /DevTreeFlow/${item.relativePath}/MeAndMyChildren/

Follow the context system described in tree-start.md and begin executing your role for the "${item.label}" task.`;

    await vscode.env.clipboard.writeText(prompt);
    vscode.window.showInformationMessage(`Switched to '${item.label}' - prompt copied to clipboard!`);
}

async function handleSwitchAndFollowParent(item: TreeNode) {
    const workspaceFolder = getWorkspaceFolder();
    if (!workspaceFolder) {
        return;
    }

    const pathParts = item.relativePath.split(path.sep);
    const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : 'root';
    const parentName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'root';

    const prompt = `You are the AI agent assigned to '${item.label}', a subtask of '${parentName}' in the DevTreeFlow system.

You must:
- Read your context from: /DevTreeFlow/${item.relativePath}/InstructionsFromParent/
- Read your task details from: /DevTreeFlow/${item.relativePath}/MeAndMyChildren/
- Pay special attention to any instructions left by your parent node '${parentName}'

Your role is to carry out the "${item.label}" task as per the parent's expectations and update your folder with progress notes as needed.

Begin by reading all context files and following your parent's instructions.`;

    await vscode.env.clipboard.writeText(prompt);
    vscode.window.showInformationMessage(`Switch to '${item.label}' with parent context - prompt copied to clipboard!`);
}

async function handleAssessChildren(item: TreeNode) {
    const prompt = `You are the AI agent for '${item.label}' in the DevTreeFlow system.

Your task is to assess the status and progress of all your child nodes/tasks.

Please:
1. Read your context from: /DevTreeFlow/${item.relativePath}/MeAndMyChildren/
2. Check each child folder under /DevTreeFlow/${item.relativePath}/
3. Review progress in each child's MeAndMyChildren folder
4. Identify any blockers, completed tasks, or areas needing attention
5. Provide a summary of child task statuses
6. Update coordination plans if needed

Focus on: task completion status, quality of work, next steps, and any needed interventions.`;

    await vscode.env.clipboard.writeText(prompt);
    vscode.window.showInformationMessage(`Assess children of '${item.label}' - prompt copied to clipboard!`);
}

async function handleSummarizeStatus(item: TreeNode) {
    const prompt = `You are the AI agent for '${item.label}' in the DevTreeFlow system.

Please provide a comprehensive status summary for this task:

1. Read all context from: /DevTreeFlow/${item.relativePath}/
2. Review task objectives and current progress
3. Summarize what has been completed
4. Identify what remains to be done
5. Note any blockers or issues
6. Assess overall task health and timeline

Provide a clear, structured status report that can be shared with parent nodes or team members.`;

    await vscode.env.clipboard.writeText(prompt);
    vscode.window.showInformationMessage(`Summarize status of '${item.label}' - prompt copied to clipboard!`);
}

export function deactivate() {}