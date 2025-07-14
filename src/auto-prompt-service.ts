import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EnhancedPromptGenerator } from './enhanced-prompt-generator';
import { WorkflowManager } from './workflow-manager';
import { ContextDocumentManager } from './context-document-manager';
import { KeyboardSimulator } from './keyboard-simulator';

export class AutoPromptService {
    
    // Global auto-prompting mode state
    private static autoPromptingMode: boolean = false;
    
    /**
     * Toggle auto-prompting mode
     */
    public static toggleAutoPromptingMode(): boolean {
        this.autoPromptingMode = !this.autoPromptingMode;
        const status = this.autoPromptingMode ? 'enabled' : 'disabled';
        vscode.window.showInformationMessage(`DevTreeFlow: Auto-prompting mode ${status}`);
        return this.autoPromptingMode;
    }
    
    /**
     * Get current auto-prompting mode status
     */
    public static isAutoPromptingModeEnabled(): boolean {
        return this.autoPromptingMode;
    }
    
    /**
     * Auto-prompt for current leaf based on file path
     */
    public static async autoPromptCurrentLeaf(): Promise<void> {
        try {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            const filePath = activeEditor.document.uri.fsPath;
            const leafPath = this.extractLeafPathFromFilePath(filePath);
            
            if (!leafPath) {
                vscode.window.showErrorMessage('Not in a DevTreeFlow leaf directory');
                return;
            }

            const prompt = EnhancedPromptGenerator.generateIdentityPrompt(leafPath);
            
            if (this.autoPromptingMode) {
                await this.sendToCursorChatAutomated(prompt);
            } else {
                await this.sendToCursorChat(prompt);
            }
            
            const leafName = path.basename(leafPath);
            vscode.window.showInformationMessage(`Auto-prompted for '${leafName}' - sent to Cursor chat!`);
            
        } catch (error) {
            console.error('DevTreeFlow: Error in autoPromptCurrentLeaf:', error);
            vscode.window.showErrorMessage(`Failed to auto-prompt: ${error}`);
        }
    }

    /**
     * Auto-prompt with selected code as context
     */
    public static async autoPromptWithContext(): Promise<void> {
        try {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            const selection = activeEditor.selection;
            const selectedText = activeEditor.document.getText(selection);
            
            if (!selectedText.trim()) {
                vscode.window.showErrorMessage('No text selected');
                return;
            }

            const filePath = activeEditor.document.uri.fsPath;
            const leafPath = this.extractLeafPathFromFilePath(filePath);
            
            if (!leafPath) {
                vscode.window.showErrorMessage('Not in a DevTreeFlow leaf directory');
                return;
            }

            const basePrompt = EnhancedPromptGenerator.generateIdentityPrompt(leafPath);
            const contextPrompt = `${basePrompt}

## Selected Code Context
The developer has selected this code for context:

\`\`\`${this.getFileExtension(filePath)}
${selectedText}
\`\`\`

Please consider this code in your response and provide guidance or implementation suggestions based on the selected code.`;

            if (this.autoPromptingMode) {
                await this.sendToCursorChatAutomated(contextPrompt);
            } else {
                await this.sendToCursorChat(contextPrompt);
            }
            
            const leafName = path.basename(leafPath);
            vscode.window.showInformationMessage(`Auto-prompted with context for '${leafName}' - sent to Cursor chat!`);
            
        } catch (error) {
            console.error('DevTreeFlow: Error in autoPromptWithContext:', error);
            vscode.window.showErrorMessage(`Failed to auto-prompt with context: ${error}`);
        }
    }

    /**
     * Auto-prompt for assessment mode
     */
    public static async autoPromptAssessment(): Promise<void> {
        try {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            const filePath = activeEditor.document.uri.fsPath;
            const leafPath = this.extractLeafPathFromFilePath(filePath);
            
            if (!leafPath) {
                vscode.window.showErrorMessage('Not in a DevTreeFlow leaf directory');
                return;
            }

            const prompt = EnhancedPromptGenerator.generateAssessmentPrompt(leafPath);
            
            if (this.autoPromptingMode) {
                await this.sendToCursorChatAutomated(prompt);
            } else {
                await this.sendToCursorChat(prompt);
            }
            
            const leafName = path.basename(leafPath);
            vscode.window.showInformationMessage(`Auto-prompted assessment for '${leafName}' - sent to Cursor chat!`);
            
        } catch (error) {
            console.error('DevTreeFlow: Error in autoPromptAssessment:', error);
            vscode.window.showErrorMessage(`Failed to auto-prompt assessment: ${error}`);
        }
    }

    /**
     * Auto-prompt for correction mode
     */
    public static async autoPromptCorrection(): Promise<void> {
        try {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            const filePath = activeEditor.document.uri.fsPath;
            const leafPath = this.extractLeafPathFromFilePath(filePath);
            
            if (!leafPath) {
                vscode.window.showErrorMessage('Not in a DevTreeFlow leaf directory');
                return;
            }

            const prompt = EnhancedPromptGenerator.generateCorrectionPrompt(leafPath);
            
            if (this.autoPromptingMode) {
                await this.sendToCursorChatAutomated(prompt);
            } else {
                await this.sendToCursorChat(prompt);
            }
            
            const leafName = path.basename(leafPath);
            vscode.window.showInformationMessage(`Auto-prompted correction for '${leafName}' - sent to Cursor chat!`);
            
        } catch (error) {
            console.error('DevTreeFlow: Error in autoPromptCorrection:', error);
            vscode.window.showErrorMessage(`Failed to auto-prompt correction: ${error}`);
        }
    }

    /**
     * Auto-prompt for recovery mode
     */
    public static async autoPromptRecovery(): Promise<void> {
        try {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            const filePath = activeEditor.document.uri.fsPath;
            const leafPath = this.extractLeafPathFromFilePath(filePath);
            
            if (!leafPath) {
                vscode.window.showErrorMessage('Not in a DevTreeFlow leaf directory');
                return;
            }

            const issueDescription = await vscode.window.showInputBox({
                prompt: 'Describe the issue that requires recovery',
                placeHolder: 'e.g., Major architectural inconsistency detected'
            });

            if (!issueDescription) {
                return;
            }

            const prompt = EnhancedPromptGenerator.generateRecoveryPrompt(leafPath, issueDescription);
            
            if (this.autoPromptingMode) {
                await this.sendToCursorChatAutomated(prompt);
            } else {
                await this.sendToCursorChat(prompt);
            }
            
            const leafName = path.basename(leafPath);
            vscode.window.showInformationMessage(`Auto-prompted recovery for '${leafName}' - sent to Cursor chat!`);
            
        } catch (error) {
            console.error('DevTreeFlow: Error in autoPromptRecovery:', error);
            vscode.window.showErrorMessage(`Failed to auto-prompt recovery: ${error}`);
        }
    }

    /**
     * Quick switch to leaf with input
     */
    public static async quickSwitchToLeaf(): Promise<void> {
        try {
            const workspaceFolder = this.getWorkspaceFolder();
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            const devTreeFlowPath = path.join(workspaceFolder, 'DevTreeFlow');
            if (!fs.existsSync(devTreeFlowPath)) {
                vscode.window.showErrorMessage('DevTreeFlow not initialized. Please initialize first.');
                return;
            }

            // Get all available leaves
            const leaves = this.getAllLeaves(devTreeFlowPath);
            
            if (leaves.length === 0) {
                vscode.window.showErrorMessage('No DevTreeFlow leaves found');
                return;
            }

            const selectedLeaf = await vscode.window.showQuickPick(leaves, {
                placeHolder: 'Select a leaf to switch to'
            });

            if (!selectedLeaf) {
                return;
            }

            const prompt = EnhancedPromptGenerator.generateIdentityPrompt(selectedLeaf);
            
            if (this.autoPromptingMode) {
                await this.sendToCursorChatAutomated(prompt);
            } else {
                await this.sendToCursorChat(prompt);
            }
            
            vscode.window.showInformationMessage(`Quick switched to '${selectedLeaf}' - sent to Cursor chat!`);
            
        } catch (error) {
            console.error('DevTreeFlow: Error in quickSwitchToLeaf:', error);
            vscode.window.showErrorMessage(`Failed to quick switch: ${error}`);
        }
    }

    /**
     * Open new Cursor chat using keyboard simulation (Focus chat, then Ctrl+N)
     */
    public static async openNewCursorChat(): Promise<void> {
        try {
            console.log('DevTreeFlow: Opening new Cursor chat using combo (focus, then Ctrl+N)...');
            const isAvailable = await KeyboardSimulator.isKeyboardSimulationAvailable();
            if (!isAvailable) {
                vscode.window.showWarningMessage('⚠️ Keyboard simulation not available. Please open Cursor chat manually with Ctrl+L (or Ctrl+Shift+L), then Ctrl+N.');
                return;
            }
            const success = await KeyboardSimulator.simulateFocusThenNewChat();
            if (success) {
                vscode.window.showInformationMessage('✅ New Cursor chat opened (focus, then Ctrl+N)!');
            } else {
                vscode.window.showWarningMessage('⚠️ Failed to open new chat automatically. Please use Ctrl+L (or Ctrl+Shift+L), then Ctrl+N manually.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open new Cursor chat: ${error}. Please use Ctrl+L (or Ctrl+Shift+L), then Ctrl+N manually.`);
        }
    }

    /**
     * Open new Cursor chat tab using keyboard simulation (Focus chat, then Ctrl+T)
     */
    public static async openNewCursorChatTab(): Promise<void> {
        try {
            console.log('DevTreeFlow: Opening new Cursor chat tab using combo (focus, then Ctrl+T)...');
            const isAvailable = await KeyboardSimulator.isKeyboardSimulationAvailable();
            if (!isAvailable) {
                vscode.window.showWarningMessage('⚠️ Keyboard simulation not available. Please open new chat tab manually with Ctrl+L (or Ctrl+Shift+L), then Ctrl+T.');
                return;
            }
            const success = await KeyboardSimulator.simulateFocusThenNewChatTab();
            if (success) {
                vscode.window.showInformationMessage('✅ New Cursor chat tab opened (focus, then Ctrl+T)!');
            } else {
                vscode.window.showWarningMessage('⚠️ Failed to open new chat tab automatically. Please use Ctrl+L (or Ctrl+Shift+L), then Ctrl+T manually.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open new Cursor chat tab: ${error}. Please use Ctrl+L (or Ctrl+Shift+L), then Ctrl+T manually.`);
        }
    }

    /**
     * Focus Cursor chat input using keyboard simulation (Try multiple shortcuts)
     */
    public static async focusChatInput(): Promise<void> {
        try {
            console.log('DevTreeFlow: Focusing Cursor chat input using keyboard simulation...');
            // Check if keyboard simulation is available
            const isAvailable = await KeyboardSimulator.isKeyboardSimulationAvailable();
            if (!isAvailable) {
                console.log('❌ Keyboard simulation not available for focusing chat');
                vscode.window.showWarningMessage('⚠️ Keyboard simulation not available. Please click in chat input manually.');
                return;
            }
            
            // Try multiple shortcuts to focus chat
            let success = false;
            
            // Try Ctrl+L first (most common Cursor chat shortcut)
            console.log('Trying Ctrl+L to focus chat...');
            success = await KeyboardSimulator.simulateKeyboardShortcut('ctrl+l');
            
            if (!success) {
                // Try Ctrl+Shift+L as fallback
                console.log('Ctrl+L failed, trying Ctrl+Shift+L...');
                success = await KeyboardSimulator.simulateKeyboardShortcut('ctrl+shift+l');
            }
            
            if (!success) {
                // Try Ctrl+Shift+7 as last resort (legacy)
                console.log('Ctrl+Shift+L failed, trying Ctrl+Shift+7...');
                success = await KeyboardSimulator.simulateKeyboardShortcut('ctrl+shift+7');
            }
            
            if (success) {
                console.log('✅ Successfully focused Cursor chat input via keyboard simulation');
                vscode.window.showInformationMessage('✅ Cursor chat focused via keyboard simulation!');
            } else {
                console.log('❌ Failed to focus chat input via keyboard simulation');
                vscode.window.showWarningMessage('⚠️ Failed to focus chat automatically. Try: Ctrl+L, Ctrl+Shift+L, or check your Cursor keybindings.');
            }
        } catch (error) {
            console.error('DevTreeFlow: Error focusing chat input:', error);
            // Don't show error to user as this might not be critical
        }
    }

    /**
     * Clear the current chat with feedback for dashboard
     */
    public static async clearCurrentChatWithFeedback(): Promise<void> {
        vscode.window.showInformationMessage('Clearing current chat...');
        const success = await KeyboardSimulator.clearCurrentChat();
        if (success) {
            vscode.window.showInformationMessage('✅ Current chat cleared!');
        } else {
            vscode.window.showWarningMessage('⚠️ Failed to clear current chat.');
        }
    }

    /**
     * Send prompt to Cursor chat using automated keystrokes (focus, paste, no send)
     */
    private static async sendToCursorChatAutomated(prompt: string): Promise<void> {
        try {
            console.log('DevTreeFlow: Auto-prompting mode ENABLED - using keyboard simulation (focus, paste, no send)...');
            // Check if keyboard simulation is available
            const isAvailable = await KeyboardSimulator.isKeyboardSimulationAvailable();
            if (!isAvailable) {
                console.log('❌ Keyboard simulation not available, using manual fallback');
                vscode.window.showWarningMessage('⚠️ Keyboard simulation not available on this system. Using manual clipboard method.');
                await this.sendToCursorChat(prompt);
                return;
            }
            // Use keyboard simulation for focus and paste only
            const success = await KeyboardSimulator.simulateCursorChatSequence(prompt);
            if (success) {
                console.log('✅ Keyboard simulation completed successfully!');
                vscode.window.showInformationMessage('✅ Prompt pasted into AI chat via keyboard simulation!');
            } else {
                console.log('❌ Keyboard simulation failed, using manual fallback');
                vscode.window.showWarningMessage('⚠️ Keyboard simulation failed. Using manual clipboard method.');
                await this.sendToCursorChat(prompt);
            }
        } catch (error) {
            console.error('DevTreeFlow: Error in automated send:', error);
            vscode.window.showErrorMessage(`Automation failed: ${error}. Using manual fallback.`);
            await this.sendToCursorChat(prompt);
        }
    }

    /**
     * Send prompt to Cursor chat using workarounds
     */
    private static async sendToCursorChat(prompt: string): Promise<void> {
        try {
            console.log('DevTreeFlow: Auto-prompting mode DISABLED - using clipboard method');
            
            // Method 1: Copy to clipboard and show instructions
            await vscode.env.clipboard.writeText(prompt);
            console.log('✅ Copied prompt to clipboard');
            
            // Method 2: Show detailed instructions to user
            const promptPreview = prompt.length > 100 ? prompt.substring(0, 100) + '...' : prompt;
            
            vscode.window.showInformationMessage(
                `📋 Prompt copied to clipboard!\n\n` +
                `📝 Preview: "${promptPreview}"\n\n` +
                `💡 Next steps:\n` +
                `   1. Open Cursor chat (Ctrl+L or Ctrl+Shift+L)\n` +
                `   2. Paste with Ctrl+Shift+V\n` +
                `   3. Press Enter to send`,
                '📋 Copy Again',
                '🆕 Open New Chat',
                '📊 Show Full Prompt'
            ).then(async (selection) => {
                if (selection === '📋 Copy Again') {
                    vscode.env.clipboard.writeText(prompt);
                    vscode.window.showInformationMessage('✅ Prompt copied again!');
                } else if (selection === '🆕 Open New Chat') {
                    this.openNewCursorChat();
                } else if (selection === '📊 Show Full Prompt') {
                    // Show full prompt in a new document
                    const document = await vscode.workspace.openTextDocument({
                        content: prompt,
                        language: 'markdown'
                    });
                    vscode.window.showTextDocument(document);
                }
            });
            
        } catch (error) {
            console.error('DevTreeFlow: Error sending to Cursor chat:', error);
            vscode.window.showErrorMessage(`Failed to send to Cursor chat: ${error}`);
        }
    }

    /**
     * Send a prompt to chat with automation and feedback (for dashboard actions)
     * Now triggers automation before feedback for snappier UX.
     */
    public static async sendPromptToChatWithAutomation(prompt: string, actionName: string): Promise<void> {
        // Start automation immediately
        const automationPromise = this.sendToCursorChatAutomated(prompt);
        // Show feedback as soon as possible (non-blocking)
        vscode.window.showInformationMessage(`Auto Prompting ${actionName}`);
        // Await automation to ensure errors are handled
        await automationPromise;
    }

    /**
     * Extract leaf path from file path
     */
    private static extractLeafPathFromFilePath(filePath: string): string | null {
        const workspaceFolder = this.getWorkspaceFolder();
        if (!workspaceFolder) {
            return null;
        }

        const devTreeFlowPath = path.join(workspaceFolder, 'DevTreeFlow');
        
        // Check if file is within DevTreeFlow directory
        if (!filePath.includes(devTreeFlowPath)) {
            return null;
        }

        // Extract the relative path from DevTreeFlow
        const relativePath = path.relative(devTreeFlowPath, filePath);
        const pathParts = relativePath.split(path.sep);
        
        // Return the first directory (the leaf name)
        if (pathParts.length > 0) {
            return pathParts[0];
        }

        return null;
    }

    /**
     * Get all available leaves
     */
    private static getAllLeaves(devTreeFlowPath: string): string[] {
        const leaves: string[] = [];
        
        if (!fs.existsSync(devTreeFlowPath)) {
            return leaves;
        }

        const items = fs.readdirSync(devTreeFlowPath, { withFileTypes: true });
        
        for (const item of items) {
            if (item.isDirectory() && !item.name.startsWith('.')) {
                leaves.push(item.name);
            }
        }

        return leaves.sort();
    }

    /**
     * Get workspace folder
     */
    private static getWorkspaceFolder(): string | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : undefined;
    }

    /**
     * Get file extension for code highlighting
     */
    private static getFileExtension(filePath: string): string {
        const ext = path.extname(filePath);
        switch (ext) {
            case '.js':
            case '.jsx':
                return 'javascript';
            case '.ts':
            case '.tsx':
                return 'typescript';
            case '.py':
                return 'python';
            case '.java':
                return 'java';
            case '.cpp':
            case '.cc':
            case '.cxx':
                return 'cpp';
            case '.c':
                return 'c';
            case '.cs':
                return 'csharp';
            case '.php':
                return 'php';
            case '.rb':
                return 'ruby';
            case '.go':
                return 'go';
            case '.rs':
                return 'rust';
            case '.swift':
                return 'swift';
            case '.kt':
                return 'kotlin';
            case '.scala':
                return 'scala';
            case '.html':
                return 'html';
            case '.css':
                return 'css';
            case '.scss':
            case '.sass':
                return 'scss';
            case '.json':
                return 'json';
            case '.xml':
                return 'xml';
            case '.yaml':
            case '.yml':
                return 'yaml';
            case '.md':
                return 'markdown';
            case '.sql':
                return 'sql';
            case '.sh':
                return 'bash';
            case '.ps1':
                return 'powershell';
            default:
                return 'text';
        }
    }
} 