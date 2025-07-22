import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as os from 'os';

export class KeyboardSimulator {
    
    // Cache the availability check result to avoid repeated system calls
    private static availabilityCache: boolean | null = null;
    private static availabilityChecked: boolean = false;
    
    /**
     * Try to simulate keyboard shortcuts using external processes
     */
    public static async simulateKeyboardShortcut(shortcut: string): Promise<boolean> {
        try {
            const platform = os.platform();
            
            switch (platform) {
                case 'win32':
                    return await this.simulateWindowsShortcut(shortcut);
                case 'darwin':
                    return await this.simulateMacShortcut(shortcut);
                case 'linux':
                    return await this.simulateLinuxShortcut(shortcut);
                default:
                    console.log(`Unsupported platform: ${platform}`);
                    return false;
            }
        } catch (error) {
            console.error('DevTreeFlow: Keyboard simulation failed:', error);
            return false;
        }
    }
    
    /**
     * Simulate keyboard shortcut on Windows
     */
    private static async simulateWindowsShortcut(shortcut: string): Promise<boolean> {
        return new Promise((resolve) => {
            // Convert shortcut to SendKeys format
            const sendKeysFormat = this.convertToSendKeysFormat(shortcut);
            
            const command = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${sendKeysFormat}')"`;
            
            console.log(`🖥️  Executing Windows PowerShell command: ${command}`);
            
            child_process.exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Windows keyboard simulation failed:', error);
                    console.error('stderr:', stderr);
                    resolve(false);
                } else {
                    console.log('✅ Windows keyboard simulation successful');
                    if (stdout) console.log('stdout:', stdout);
                    resolve(true);
                }
            });
        });
    }
    
    /**
     * Simulate keyboard shortcut on macOS
     */
    private static async simulateMacShortcut(shortcut: string): Promise<boolean> {
        return new Promise((resolve) => {
            // Convert shortcut to AppleScript format
            const appleScriptFormat = this.convertToAppleScriptFormat(shortcut);
            
            const command = `osascript -e 'tell application "System Events" to key code ${appleScriptFormat}'`;
            
            console.log(`🍎 Executing macOS AppleScript command: ${command}`);
            
            child_process.exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ macOS keyboard simulation failed:', error);
                    console.error('stderr:', stderr);
                    resolve(false);
                } else {
                    console.log('✅ macOS keyboard simulation successful');
                    if (stdout) console.log('stdout:', stdout);
                    resolve(true);
                }
            });
        });
    }
    
    /**
     * Simulate keyboard shortcut on Linux
     */
    private static async simulateLinuxShortcut(shortcut: string): Promise<boolean> {
        return new Promise((resolve) => {
            // Use xdotool for Linux
            const xdotoolFormat = this.convertToXdotoolFormat(shortcut);
            
            const command = `xdotool key ${xdotoolFormat}`;
            
            console.log(`🐧 Executing Linux xdotool command: ${command}`);
            
            child_process.exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Linux keyboard simulation failed:', error);
                    console.error('stderr:', stderr);
                    resolve(false);
                } else {
                    console.log('✅ Linux keyboard simulation successful');
                    if (stdout) console.log('stdout:', stdout);
                    resolve(true);
                }
            });
        });
    }
    
    /**
     * Convert shortcut to Windows SendKeys format
     */
    private static convertToSendKeysFormat(shortcut: string): string {
        return shortcut
            .replace('ctrl+', '^')
            .replace('alt+', '%')
            .replace('shift+', '+')
            .replace('enter', '{ENTER}')
            .replace('tab', '{TAB}')
            .replace('escape', '{ESC}')
            .replace('backspace', '{BACKSPACE}')
            .replace('delete', '{DELETE}')
            .replace('home', '{HOME}')
            .replace('end', '{END}')
            .replace('pageup', '{PGUP}')
            .replace('pagedown', '{PGDN}')
            .replace('f1', '{F1}')
            .replace('f2', '{F2}')
            .replace('f3', '{F3}')
            .replace('f4', '{F4}')
            .replace('f5', '{F5}')
            .replace('f6', '{F6}')
            .replace('f7', '{F7}')
            .replace('f8', '{F8}')
            .replace('f9', '{F9}')
            .replace('f10', '{F10}')
            .replace('f11', '{F11}')
            .replace('f12', '{F12}');
    }
    
    /**
     * Convert shortcut to AppleScript format
     */
    private static convertToAppleScriptFormat(shortcut: string): string {
        // This is a simplified conversion - would need more complex mapping
        return shortcut
            .replace('ctrl+', 'control+')
            .replace('alt+', 'option+')
            .replace('shift+', 'shift+')
            .replace('cmd+', 'command+');
    }
    
    /**
     * Convert shortcut to xdotool format
     */
    private static convertToXdotoolFormat(shortcut: string): string {
        return shortcut
            .replace('ctrl+', 'ctrl+')
            .replace('alt+', 'alt+')
            .replace('shift+', 'shift+')
            .replace('super+', 'super+');
    }
    
    /**
     * Simulate the full Cursor chat automation sequence
     * New flow: Focus AI chat (Ctrl+L or configurable), wait, paste (Ctrl+V), do NOT send Enter
     */
    public static async simulateCursorChatSequence(prompt: string): Promise<boolean> {
        try {
            console.log('🎯 DevTreeFlow: Starting Cursor chat automation sequence (focus, paste, no send)...');
            console.log(`📝 Prompt length: ${prompt.length} characters`);
            // Step 1: Copy prompt to clipboard
            await vscode.env.clipboard.writeText(prompt);
            console.log('✅ Step 1: Copied prompt to clipboard');
            
            // Step 2: Focus AI chat - Try multiple shortcuts
            console.log('🔄 Step 2: Focusing AI chat...');
            let focusSuccess = false;
            
            // Try Ctrl+L first (most common Cursor chat shortcut)
            console.log('Trying Ctrl+L...');
            focusSuccess = await this.simulateKeyboardShortcut('ctrl+l');
            
            if (!focusSuccess) {
                // Try Ctrl+Shift+L as fallback
                console.log('Ctrl+L failed, trying Ctrl+Shift+L...');
                focusSuccess = await this.simulateKeyboardShortcut('ctrl+shift+l');
            }
            
            if (!focusSuccess) {
                // Try Ctrl+Shift+7 as last resort (legacy)
                console.log('Ctrl+Shift+L failed, trying Ctrl+Shift+7...');
                focusSuccess = await this.simulateKeyboardShortcut('ctrl+shift+7');
            }
            
            console.log(focusSuccess ? '✅ Step 2: Focused AI chat' : '❌ Step 2: Failed to focus AI chat');
            
            // Step 3: Wait for chat to focus
            console.log('⏳ Step 3: Waiting for chat to focus (300ms)...');
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log('✅ Step 3: Wait completed');
            
            // Step 4: Paste (Ctrl+V)
            console.log('🔄 Step 4: Attempting to paste content (Ctrl+V)...');
            const pasteSuccess = await this.simulateKeyboardShortcut('ctrl+v');
            console.log(pasteSuccess ? '✅ Step 4: Pasted content' : '❌ Step 4: Failed to paste');
            
            // Do NOT send Enter
            // Summary
            const successfulSteps = [focusSuccess, pasteSuccess].filter(Boolean).length;
            console.log(`📊 Automation Summary: ${successfulSteps}/2 key steps successful (no auto-send)`);
            
            if (!focusSuccess) {
                vscode.window.showWarningMessage('⚠️ Could not focus AI chat. Try: Ctrl+L, Ctrl+Shift+L, or check your Cursor keybindings.');
            }
            
            return focusSuccess && pasteSuccess;
        } catch (error) {
            console.error('💥 DevTreeFlow: Keyboard simulation sequence failed:', error);
            return false;
        }
    }
    
    /**
     * Simulate the full Cursor chat automation sequence WITH Enter key press
     * This version includes sending the message automatically
     */
    public static async simulateCursorChatSequenceWithSend(prompt: string): Promise<boolean> {
        try {
            console.log('🎯 DevTreeFlow: Starting Cursor chat automation sequence (focus, paste, send)...');
            console.log(`📝 Prompt length: ${prompt.length} characters`);
            // Step 1: Copy prompt to clipboard
            await vscode.env.clipboard.writeText(prompt);
            console.log('✅ Step 1: Copied prompt to clipboard');
            
            // Step 2: Focus AI chat - Try multiple shortcuts
            console.log('🔄 Step 2: Focusing AI chat...');
            let focusSuccess = false;
            
            // Try Ctrl+L first (most common Cursor chat shortcut)
            console.log('Trying Ctrl+L...');
            focusSuccess = await this.simulateKeyboardShortcut('ctrl+l');
            
            if (!focusSuccess) {
                // Try Ctrl+Shift+L as fallback
                console.log('Ctrl+L failed, trying Ctrl+Shift+L...');
                focusSuccess = await this.simulateKeyboardShortcut('ctrl+shift+l');
            }
            
            if (!focusSuccess) {
                // Try Ctrl+Shift+7 as last resort (legacy)
                console.log('Ctrl+Shift+L failed, trying Ctrl+Shift+7...');
                focusSuccess = await this.simulateKeyboardShortcut('ctrl+shift+7');
            }
            
            console.log(focusSuccess ? '✅ Step 2: Focused AI chat' : '❌ Step 2: Failed to focus AI chat');
            
            // Step 3: Wait for chat to focus
            console.log('⏳ Step 3: Waiting for chat to focus (300ms)...');
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log('✅ Step 3: Wait completed');
            
            // Step 4: Paste (Ctrl+V)
            console.log('🔄 Step 4: Attempting to paste content (Ctrl+V)...');
            const pasteSuccess = await this.simulateKeyboardShortcut('ctrl+v');
            console.log(pasteSuccess ? '✅ Step 4: Pasted content' : '❌ Step 4: Failed to paste');
            
            // Step 5: Wait a moment then send Enter
            console.log('⏳ Step 5: Waiting before sending (200ms)...');
            await new Promise(resolve => setTimeout(resolve, 200));
            console.log('🔄 Step 5: Sending message (Enter)...');
            const sendSuccess = await this.simulateKeyboardShortcut('enter');
            console.log(sendSuccess ? '✅ Step 5: Message sent' : '❌ Step 5: Failed to send');
            
            // Summary
            const successfulSteps = [focusSuccess, pasteSuccess, sendSuccess].filter(Boolean).length;
            console.log(`📊 Automation Summary: ${successfulSteps}/3 key steps successful (with auto-send)`);
            
            if (!focusSuccess) {
                vscode.window.showWarningMessage('⚠️ Could not focus AI chat. Try: Ctrl+L, Ctrl+Shift+L, or check your Cursor keybindings.');
            }
            
            return focusSuccess && pasteSuccess && sendSuccess;
        } catch (error) {
            console.error('💥 DevTreeFlow: Keyboard simulation sequence with send failed:', error);
            return false;
        }
    }

    /**
     * Clear the current chat: focus chat, select all, backspace
     */
    public static async clearCurrentChat(): Promise<boolean> {
        try {
            // Focus AI chat
            const focusSuccess = await this.simulateKeyboardShortcut('ctrl+shift+7');
            if (!focusSuccess) return false;
            await new Promise(resolve => setTimeout(resolve, 300));
            // Select all
            const selectAllSuccess = await this.simulateKeyboardShortcut('ctrl+a');
            if (!selectAllSuccess) return false;
            await new Promise(resolve => setTimeout(resolve, 100));
            // Backspace
            const backspaceSuccess = await this.simulateKeyboardShortcut('backspace');
            return backspaceSuccess;
        } catch (error) {
            console.error('DevTreeFlow: clearCurrentChat failed:', error);
            return false;
        }
    }
    
    /**
     * Check if keyboard simulation is available on this system (cached)
     */
    public static async isKeyboardSimulationAvailable(): Promise<boolean> {
        // Return cached result if already checked
        if (this.availabilityChecked) {
            return this.availabilityCache || false;
        }

        try {
            console.log('🔍 DevTreeFlow: Checking keyboard simulation availability (one-time check)...');
            const platform = os.platform();
            
            let result: boolean;
            
            switch (platform) {
                case 'win32':
                    // Check if PowerShell is available
                    result = await new Promise((resolve) => {
                        child_process.exec('powershell -Command "Get-Command"', (error) => {
                            resolve(!error);
                        });
                    });
                    break;
                    
                case 'darwin':
                    // Check if osascript is available
                    result = await new Promise((resolve) => {
                        child_process.exec('which osascript', (error) => {
                            resolve(!error);
                        });
                    });
                    break;
                    
                case 'linux':
                    // Check if xdotool is available
                    result = await new Promise((resolve) => {
                        child_process.exec('which xdotool', (error) => {
                            resolve(!error);
                        });
                    });
                    break;
                    
                default:
                    result = false;
            }
            
            // Cache the result
            this.availabilityCache = result;
            this.availabilityChecked = true;
            
            console.log(`✅ DevTreeFlow: Keyboard simulation ${result ? 'available' : 'not available'} (cached for session)`);
            return result;
            
        } catch (error) {
            console.error('DevTreeFlow: Error checking keyboard simulation availability:', error);
            // Cache the error result too
            this.availabilityCache = false;
            this.availabilityChecked = true;
            return false;
        }
    }

    /**
     * Reset the availability cache (for testing or troubleshooting)
     */
    public static resetAvailabilityCache(): void {
        this.availabilityCache = null;
        this.availabilityChecked = false;
        console.log('🔄 DevTreeFlow: Keyboard simulation availability cache reset');
    }

    /**
     * Simulate focusing Cursor chat then opening new chat (Ctrl+L then Ctrl+N)
     */
    public static async simulateFocusThenNewChat(): Promise<boolean> {
        try {
            console.log('🎯 DevTreeFlow: Starting focus then new chat sequence...');
            
            // Step 1: Focus AI chat
            console.log('🔄 Step 1: Focusing AI chat...');
            let focusSuccess = await this.simulateKeyboardShortcut('ctrl+l') || 
                               await this.simulateKeyboardShortcut('ctrl+shift+l') ||
                               await this.simulateKeyboardShortcut('ctrl+shift+7');
            
            if (!focusSuccess) {
                console.log('❌ Failed to focus AI chat');
                return false;
            }
            console.log('✅ Step 1: Focused AI chat');
            
            // Step 2: Wait a bit
            console.log('⏳ Step 2: Waiting 300ms...');
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Step 3: New chat (Ctrl+N)
            console.log('🔄 Step 3: Creating new chat (Ctrl+N)...');
            const newChatSuccess = await this.simulateKeyboardShortcut('ctrl+n');
            console.log(newChatSuccess ? '✅ Step 3: Created new chat' : '❌ Step 3: Failed to create new chat');
            
            return focusSuccess && newChatSuccess;
        } catch (error) {
            console.error('💥 DevTreeFlow: Focus then new chat sequence failed:', error);
            return false;
        }
    }

    /**
     * Simulate focusing Cursor chat then opening new chat tab (Ctrl+L then Ctrl+T)
     */
    public static async simulateFocusThenNewChatTab(): Promise<boolean> {
        try {
            console.log('🎯 DevTreeFlow: Starting focus then new chat tab sequence...');
            
            // Step 1: Focus AI chat
            console.log('🔄 Step 1: Focusing AI chat...');
            let focusSuccess = await this.simulateKeyboardShortcut('ctrl+l') || 
                               await this.simulateKeyboardShortcut('ctrl+shift+l') ||
                               await this.simulateKeyboardShortcut('ctrl+shift+7');
            
            if (!focusSuccess) {
                console.log('❌ Failed to focus AI chat');
                return false;
            }
            console.log('✅ Step 1: Focused AI chat');
            
            // Step 2: Wait a bit
            console.log('⏳ Step 2: Waiting 300ms...');
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Step 3: New chat tab (Ctrl+T)
            console.log('🔄 Step 3: Creating new chat tab (Ctrl+T)...');
            const newTabSuccess = await this.simulateKeyboardShortcut('ctrl+t');
            console.log(newTabSuccess ? '✅ Step 3: Created new chat tab' : '❌ Step 3: Failed to create new chat tab');
            
            return focusSuccess && newTabSuccess;
        } catch (error) {
            console.error('💥 DevTreeFlow: Focus then new chat tab sequence failed:', error);
            return false;
        }
    }
} 