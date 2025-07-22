import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EnhancedPromptGenerator } from './enhanced-prompt-generator';
import { WorkflowManager } from './workflow-manager';
import { ContextDocumentManager } from './context-document-manager';
import { AutoPromptService } from './auto-prompt-service';
import { ActionManager } from './action-manager';

export async function handleMessage(message: any, dashboard: any) {
    switch (message.command) {
        case 'webviewReady':
            console.log('DevTreeFlow: Webview ready, sending initial state');
            if (dashboard.refreshTreeData) {
                await dashboard.refreshTreeData();
            }
            dashboard.updateWebviewState();
            break;
        case 'switchToNode':
            await ActionManager.switchToNode(message.nodePath);
            break;
        case 'switchAndFollowParent':
            await ActionManager.switchAndFollowParent(message.nodePath);
            break;
        case 'assessChildren':
            await ActionManager.assessChildren(message.nodePath);
            break;
        case 'summarizeStatus':
            await ActionManager.summarizeStatus(message.nodePath);
            break;
        case 'newTaskTree':
            await handleNewTaskTree(dashboard);
            break;
        case 'refreshTree':
            if (dashboard.refreshTreeData) {
                dashboard.refreshTreeData();
            }
            break;
        case 'initializeDevTreeFlow':
            await handleInitializeDevTreeFlow(dashboard);
            break;
        case 'initializeLeaf':
            await handleInitializeLeaf(message.leafPath);
            break;
        case 'workflowMode':
            await handleWorkflowMode(message.leafPath, message.mode);
            break;
        case 'toggleAutoPromptingMode':
            await handleToggleAutoPromptingMode(dashboard);
            break;
        case 'openNewCursorChat':
            await handleOpenNewCursorChat();
            break;
        case 'openNewCursorChatTab':
            await handleOpenNewCursorChatTab();
            break;
        case 'openExtensionsPanel':
            await vscode.commands.executeCommand('devtreeflow.openExtensionsPanel');
            break;
        case 'clearCurrentChat':
            await vscode.commands.executeCommand('devtreeflow.clearCurrentChat');
            break;
        case 'toggleCopyToPromptBuilderMode':
            dashboard.copyToPromptBuilderMode = !dashboard.copyToPromptBuilderMode;
            dashboard.updateWebviewState();
            break;
        case 'toggleContextFileTick':
            dashboard.contextFileTicks[message.filename] = !dashboard.contextFileTicks[message.filename];
            if (dashboard.updatePromptBuilderWithContextFiles) {
                dashboard.updatePromptBuilderWithContextFiles();
            }
            dashboard.updateWebviewState();
            break;
        case 'updatePromptBuilder':
            dashboard.promptBuilderContent = message.content;
            break;
        case 'autoPromptFromBuilder':
            await handleAutoPromptFromBuilder(dashboard, message.content);
            break;
        case 'treeActionPrompt':
            await handleTreeActionPrompt(message.prompt, dashboard);
            break;
        case 'openContextFile':
            await handleOpenContextFile(message.filename, dashboard);
            break;
        case 'createContextFolder':
            await handleCreateContextFolder(message.folderPath, dashboard);
            break;
        case 'createContextDocument':
            await handleCreateContextDocument(message.folderPath, message.fileName, dashboard);
            break;
        case 'refreshContextFiles':
            if (dashboard.loadContextFolderStructure) {
                dashboard.loadContextFolderStructure();
            }
            dashboard.updateWebviewState();
            break;
        case 'nodeAction':
            await handleNodeAction(message.nodePath, dashboard);
            break;
        case 'terminalLog':
            // Handle webview logging to terminal output
            const logLevel = message.level || 'log';
            const logMessage = `[WebView ${logLevel.toUpperCase()}] ${message.message}`;
            if (dashboard.log) {
                dashboard.log(logMessage);
            } else {
                console.log(logMessage);
            }
            break;
        case 'emergencyTest':
            const emergencyMsg = `🚨 EMERGENCY TEST: ${message.message}`;
            if (dashboard.log) {
                dashboard.log(emergencyMsg);
            }
            console.log(emergencyMsg);
            vscode.window.showInformationMessage(emergencyMsg);
            break;
    }
}

export async function handleSwitchToNode(nodePath: string, dashboard: any) {
    await ActionManager.switchToNode(nodePath);
}

export async function handleSwitchAndFollowParent(nodePath: string, dashboard: any) {
    await ActionManager.switchAndFollowParent(nodePath);
}

export async function handleAssessChildren(nodePath: string, dashboard: any) {
    await ActionManager.assessChildren(nodePath);
}

export async function handleSummarizeStatus(nodePath: string, dashboard: any) {
    await ActionManager.summarizeStatus(nodePath);
}

export async function handleNewTaskTree(dashboard: any) {
    const mainGoal = await vscode.window.showInputBox({
        prompt: 'Enter the main goal for your new task tree',
        placeHolder: 'e.g., Implement a full user authentication system'
    });

    if (!mainGoal) {
        return;
    }

    const workspaceFolder = dashboard.getWorkspaceFolder();
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    const devTreeFlowPath = path.join(workspaceFolder, 'DevTreeFlow');

    try {
        if (!fs.existsSync(devTreeFlowPath)) {
            await dashboard.handleInitializeDevTreeFlow();
        }

        const prompt = EnhancedPromptGenerator.generateGenesisPrompt(mainGoal);

        // Always use routePrompt which handles both copyToPromptBuilderMode and auto-prompting
        await AutoPromptService.routePrompt(prompt, 'New Task Tree', dashboard);
        
        // Only do AI response handling if we're in auto-prompting mode and NOT in copyToPromptBuilderMode
        if (AutoPromptService.isAutoPromptingModeEnabled() && !dashboard.copyToPromptBuilderMode) {
            vscode.window.showInformationMessage('Waiting for AI to break down the main goal...');

            const aiResponse = await dashboard.getAIResponse();

            if (aiResponse) {
                const breakdown = dashboard.parseTaskBreakdown(aiResponse);
                if (breakdown) {
                    dashboard.createTreeFromBreakdown(breakdown, mainGoal);
                    vscode.window.showInformationMessage('Task tree created successfully!');
                } else {
                    vscode.window.showErrorMessage("Failed to parse the AI's task breakdown.");
                }
            }
            // Note: If no AI response is provided (user cancels), we silently continue without error
        }

        if (dashboard.refreshTreeData) {
            dashboard.refreshTreeData();
        }

    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to create task tree: ${error.message}`);
    }
}

export async function handleInitializeDevTreeFlow(dashboard: any) {
    const workspaceFolder = dashboard.getWorkspaceFolder();
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
        if (dashboard.refreshTreeData) {
            dashboard.refreshTreeData();
        }

    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to initialize DevTreeFlow: ${error.message}`);
    }
}

export async function handleInitializeLeaf(leafPath: string) {
    try {
        const parentPath = path.dirname(leafPath);
        const parentName = path.basename(parentPath) !== 'DevTreeFlow' ? path.basename(parentPath) : 'Root';

        ContextDocumentManager.initializeLeaf(leafPath, parentName);

        const leafName = path.basename(leafPath);
        vscode.window.showInformationMessage(`Successfully initialized leaf: ${leafName}`);
    } catch (error: any) {
        console.error('DevTreeFlow: Error initializing leaf:', error);
        vscode.window.showErrorMessage(`Failed to initialize leaf: ${error.message}`);
    }
}

export async function handleWorkflowMode(leafPath: string, mode: string) {
    try {
        const workflowResult = await WorkflowManager.executeWorkflow(leafPath, mode);
        await vscode.env.clipboard.writeText(workflowResult);

        const leafName = path.basename(leafPath);
        vscode.window.showInformationMessage(`Workflow mode '${mode}' for '${leafName}' - result copied to clipboard!`);
    } catch (error: any) {
        console.error('DevTreeFlow: Error executing workflow:', error);
        vscode.window.showErrorMessage(`Failed to execute workflow: ${error.message}`);
    }
}

export async function handleToggleAutoPromptingMode(dashboard: any) {
    try {
        const isEnabled = AutoPromptService.toggleAutoPromptingMode();

        if (dashboard.panel) {
            dashboard.panel.webview.postMessage({
                command: 'updateAutoPromptingState',
                isEnabled: isEnabled
            });
        }

    } catch (error: any) {
        console.error('DevTreeFlow: Error toggling auto-prompting mode:', error);
        vscode.window.showErrorMessage(`Failed to toggle auto-prompting mode: ${error.message}`);
    }
}

export async function handleOpenNewCursorChat() {
    try {
        await AutoPromptService.openNewCursorChat();
    } catch (error: any) {
        console.error('DevTreeFlow: Error opening new Cursor chat:', error);
        vscode.window.showErrorMessage(`Failed to open new Cursor chat: ${error.message}`);
    }
}

export async function handleOpenNewCursorChatTab() {
    try {
        await AutoPromptService.openNewCursorChatTab();
    } catch (error: any) {
        console.error('DevTreeFlow: Error opening new Cursor chat tab:', error);
        vscode.window.showErrorMessage(`Failed to open new Cursor chat tab: ${error.message}`);
    }
}

export async function handleAutoPromptFromBuilder(dashboard: any, content?: string) {
    // Use provided content or fall back to dashboard content
    const promptContent = content || dashboard.promptBuilderContent;
    
    // Update dashboard content if new content was provided
    if (content) {
        dashboard.promptBuilderContent = content;
    }
    
    if (AutoPromptService.isAutoPromptingModeEnabled()) {
        await AutoPromptService.sendPromptToChatWithAutomationAndSend(promptContent, 'Prompt Builder');
    } else {
        await vscode.env.clipboard.writeText(promptContent);
        vscode.window.showInformationMessage('Prompt builder content copied to clipboard!');
    }
}

export async function handleTreeActionPrompt(prompt: string, dashboard: any) {
    if (dashboard.copyToPromptBuilderMode) {
        const nodePath = prompt.match(/nodePath:(.+)/)?.[1];
        const action = prompt.match(/action:(.+)/)?.[1];

        let actualPrompt = prompt;

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

        const existingContent = dashboard.promptBuilderContent.replace(/<!--TREE_PROMPT-->.*?<!--END_TREE_PROMPT-->/s, '');
        dashboard.promptBuilderContent = `<!--TREE_PROMPT-->${actualPrompt}<!--END_TREE_PROMPT-->\n\n${existingContent}`;
        dashboard.updateWebviewState();
    } else {
        // Use centralized routing for non-copyToPromptBuilder mode
        await AutoPromptService.routePrompt(prompt, 'Tree/Leaf Action', dashboard);
    }
}

export async function handleOpenContextFile(filename: string, dashboard: any) {
    try {
        const contextDir = path.join(dashboard.getWorkspaceFolder() || '', 'ProjectSpecificContextFiles');
        const normalizedParts = filename.split(/[\\/]+/);
        const filePath = path.join(contextDir, ...normalizedParts);

        if (fs.existsSync(filePath)) {
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);
        } else {
            vscode.window.showErrorMessage(`Context file not found: ${filename}`);
        }
    } catch (error: any) {
        console.error('DevTreeFlow: Error opening context file:', error);
        vscode.window.showErrorMessage(`Failed to open context file: ${error.message}`);
    }
}

export async function handleCreateContextFolder(folderPath: string, dashboard: any) {
    try {
        const contextDir = path.join(dashboard.getWorkspaceFolder() || '', 'ProjectSpecificContextFiles');
        const folderName = await vscode.window.showInputBox({
            prompt: 'Enter folder name',
            placeHolder: 'e.g., azure-contexts, development-guides'
        });

        if (folderName) {
            const fullPath = path.join(contextDir, folderPath, folderName);
            fs.mkdirSync(fullPath, { recursive: true });
            vscode.window.showInformationMessage(`Created folder: ${folderName}`);
            if (dashboard.loadContextFolderStructure) {
                dashboard.loadContextFolderStructure();
            }
            dashboard.updateWebviewState();
        }
    } catch (error: any) {
        console.error('DevTreeFlow: Error creating folder:', error);
        vscode.window.showErrorMessage(`Failed to create folder: ${error.message}`);
    }
}

export async function handleCreateContextDocument(folderPath: string, fileName: string | undefined, dashboard: any) {
    try {
        const contextDir = path.join(dashboard.getWorkspaceFolder() || '', 'ProjectSpecificContextFiles');

        const docName = fileName || await vscode.window.showInputBox({
            prompt: 'Enter context document name',
            placeHolder: 'e.g., api-guidelines.md, testing-strategy.md'
        });

        if (docName) {
            const safeName = docName.endsWith('.md') ? docName : `${docName}.md`;
            const fullPath = path.join(contextDir, folderPath, safeName);

            const template = `# ${safeName.replace('.md', '')}\n\n## Context Overview\n[Describe what this context document provides]\n\n## Guidelines\n- [Add specific guidelines here]\n\n## Instructions for AI\nWhen this document is selected:\n1. [Specific instruction 1]\n2. [Specific instruction 2]\n\n## Examples\n[Add relevant examples if needed]\n\n---\n*Created: ${new Date().toISOString().split('T')[0]}*\n`;

            fs.writeFileSync(fullPath, template);

            const document = await vscode.workspace.openTextDocument(fullPath);
            await vscode.window.showTextDocument(document);

            vscode.window.showInformationMessage(`Created context document: ${safeName}`);
            if (dashboard.loadContextFolderStructure) {
                dashboard.loadContextFolderStructure();
            }
            dashboard.updateWebviewState();
        }
    } catch (error: any) {
        console.error('DevTreeFlow: Error creating document:', error);
        vscode.window.showErrorMessage(`Failed to create document: ${error.message}`);
    }
}

export async function handleNodeAction(nodePath: string, dashboard: any) {
    const actions = [
        { label: 'Switch to this Node', action: 'switchToNode' },
        { label: 'Assess Children', action: 'assessChildren' },
        { label: 'Summarize Status', action: 'summarizeStatus' },
        { label: 'View Briefing', action: 'viewBriefing' },
        { label: 'Break Down into Sub-Tasks', action: 'breakDownSubTasks' },
        { label: 'Setup Sub-Task', action: 'setupSubTask' },
        { label: 'Review Children Details', action: 'reviewChildren' }
    ];
    const selected = await vscode.window.showQuickPick(actions.map(a => a.label));
    if (selected) {
        const chosenAction = actions.find(a => a.label === selected)?.action;
        switch (chosenAction) {
            case 'switchToNode':
                await handleSwitchToNode(nodePath, dashboard);
                break;
            case 'assessChildren':
                await handleAssessChildren(nodePath, dashboard);
                break;
            case 'summarizeStatus':
                await handleSummarizeStatus(nodePath, dashboard);
                break;
            case 'viewBriefing':
                const briefingPath = path.join(dashboard.getWorkspaceFolder() || '', 'DevTreeFlow', nodePath, 'InstructionsFromParent', 'briefing.md');
                await vscode.workspace.openTextDocument(briefingPath).then(doc => vscode.window.showTextDocument(doc));
                break;
            case 'breakDownSubTasks':
                await handleBreakDownSubTasks(nodePath, dashboard);
                break;
            case 'setupSubTask':
                await handleSetupSubTask(nodePath, dashboard);
                break;
            case 'reviewChildren':
                await handleReviewChildren(nodePath, dashboard);
                break;
        }
    }
}

export async function handleBreakDownSubTasks(nodePath: string, dashboard: any) {
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

export async function handleSetupSubTask(nodePath: string, dashboard: any) {
    const subTaskName = await vscode.window.showInputBox({
        prompt: 'Enter name for new sub-task',
        placeHolder: 'e.g., Implement Login Endpoint'
    });
    if (subTaskName) {
        const prompt = `You are DevTreeFlow AI. Create sub-task /DevTreeFlow/${nodePath}/${subTaskName}:\n\n1. <function_call name="list_dir">\n<parameter name="relative_workspace_path">DevTreeFlow/${nodePath}</parameter>`;
    }
}

async function handleReviewChildren(nodePath: string, dashboard: any) {
    if (!dashboard.getNodeChildren) {
        vscode.window.showErrorMessage('Function "getNodeChildren" is not available on the dashboard object.');
        return;
    }
    const children = dashboard.getNodeChildren(nodePath);
    if (children.length === 0) {
        vscode.window.showInformationMessage('No children found for this node.');
        return;
    }
    const childDetails: vscode.QuickPickItem[] = children.map((child: any) => ({
        label: child.name,
        description: `Status: ${child.status}`,
        detail: `Path: /DevTreeFlow/${child.path}`
    }));
    const selected = await vscode.window.showQuickPick(childDetails, { placeHolder: 'Select a child to review' });
    if (selected) {
        await handleNodeAction(path.join(nodePath, selected.label), dashboard);
    }
} 