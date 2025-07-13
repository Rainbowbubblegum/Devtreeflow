import * as vscode from 'vscode';

export class CursorCommandTester {
    
    /**
     * Test all Cursor commands to see which ones actually work
     */
    public static async testCursorCommands(): Promise<void> {
        const commands = [
            'cursor.chat.show',
            'cursor.chat.focus', 
            'cursor.chat.new',
            'cursor.chat.send',
            'cursor.chat.open',
            'cursor.chat.toggle',
            'cursor.chat.focusInput',
            'cursor.chat.focusChat',
            'cursor.chat.focusPanel'
        ];

        console.log('DevTreeFlow: Testing Cursor commands...');
        
        for (const command of commands) {
            try {
                await vscode.commands.executeCommand(command);
                console.log(`✅ Command works: ${command}`);
                vscode.window.showInformationMessage(`✅ ${command} works!`);
            } catch (error) {
                console.log(`❌ Command failed: ${command} - ${error}`);
            }
        }
    }

    /**
     * Test the actual automation flow
     */
    public static async testAutomationFlow(): Promise<void> {
        try {
            console.log('DevTreeFlow: Testing automation flow...');
            
            // Step 1: Copy test text
            await vscode.env.clipboard.writeText('Test prompt from DevTreeFlow');
            console.log('✅ Step 1: Copied to clipboard');
            
            // Step 2: Try to show chat
            try {
                await vscode.commands.executeCommand('cursor.chat.show');
                console.log('✅ Step 2: Showed chat');
            } catch (error) {
                console.log('❌ Step 2: Failed to show chat -', error);
            }
            
            // Step 3: Try to focus chat
            try {
                await vscode.commands.executeCommand('cursor.chat.focus');
                console.log('✅ Step 3: Focused chat');
            } catch (error) {
                console.log('❌ Step 3: Failed to focus chat -', error);
            }
            
            // Step 4: Try to paste
            try {
                await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
                console.log('✅ Step 4: Pasted content');
            } catch (error) {
                console.log('❌ Step 4: Failed to paste -', error);
            }
            
            // Step 5: Try to send
            try {
                await vscode.commands.executeCommand('cursor.chat.send');
                console.log('✅ Step 5: Sent message');
            } catch (error) {
                console.log('❌ Step 5: Failed to send -', error);
            }
            
            vscode.window.showInformationMessage('Automation test completed! Check console for results.');
            
        } catch (error) {
            console.error('DevTreeFlow: Automation test failed:', error);
            vscode.window.showErrorMessage(`Automation test failed: ${error}`);
        }
    }

    /**
     * List all available commands that contain 'cursor' or 'chat'
     */
    public static async listAvailableCommands(): Promise<void> {
        try {
            const allCommands = await vscode.commands.getCommands();
            const cursorCommands = allCommands.filter(cmd => 
                cmd.toLowerCase().includes('cursor') || 
                cmd.toLowerCase().includes('chat')
            );
            
            console.log('DevTreeFlow: Available Cursor/Chat commands:');
            cursorCommands.forEach(cmd => console.log(`  - ${cmd}`));
            
            vscode.window.showInformationMessage(`Found ${cursorCommands.length} Cursor/Chat commands. Check console.`);
            
        } catch (error) {
            console.error('DevTreeFlow: Failed to list commands:', error);
        }
    }
} 