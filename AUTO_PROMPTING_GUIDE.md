# DevTreeFlow Auto-Prompting Guide

## Overview

The DevTreeFlow extension now includes an advanced auto-prompting system that can automatically send prompts to Cursor chat using keyboard automation. This feature allows for seamless integration between DevTreeFlow leaf management and AI assistance.

## Auto-Prompting Mode

### What is Auto-Prompting Mode?

Auto-prompting mode is a toggle that changes how DevTreeFlow sends prompts to Cursor chat:

- **OFF (Default)**: Prompts are copied to clipboard with manual instructions
- **ON**: Prompts are automatically sent to Cursor chat using keyboard automation

### How to Enable/Disable

#### Method 1: Dashboard Toggle
1. Open the DevTreeFlow Dashboard (`Alt+Shift+O`)
2. Click the "🤖 Enable Auto-Prompting" button
3. The button will change to "🤖 Auto-Prompting ON" when enabled

#### Method 2: Keyboard Shortcut
- Press `Alt+Shift+M` to toggle auto-prompting mode
- A notification will show the current status

#### Method 3: Command Palette
1. Press `Ctrl+Shift+P` to open command palette
2. Type "DevTreeFlow: Toggle Auto-Prompting Mode"
3. Press Enter to toggle

## Auto-Prompting Workflow

### When Auto-Prompting Mode is OFF:
1. Generate the prompt based on context
2. Copy prompt to clipboard
3. Show instructions to user
4. User manually pastes in Cursor chat

### When Auto-Prompting Mode is ON:
1. Generate the prompt based on context
2. Copy prompt to clipboard
3. Automatically open/focus Cursor chat
4. Focus the chat input field
5. Paste the prompt automatically
6. Send the message automatically

## Available Auto-Prompting Commands

### Keyboard Shortcuts

| Command | Shortcut | Description |
|---------|----------|-------------|
| Auto-Prompt Current Leaf | `Alt+Shift+D` | Send identity prompt for current leaf |
| Auto-Prompt with Context | `Alt+Shift+C` | Send prompt with selected code context |
| Auto-Prompt Assessment | `Alt+Shift+A` | Send assessment prompt for current leaf |
| Auto-Prompt Correction | `Alt+Shift+X` | Send correction prompt for current leaf |
| Auto-Prompt Recovery | `Alt+Shift+R` | Send recovery prompt for current leaf |
| Quick Switch to Leaf | `Alt+Shift+L` | Quick switch to any leaf |
| Toggle Auto-Prompting Mode | `Alt+Shift+M` | Enable/disable auto-prompting |
| Open New Cursor Chat | `Alt+Shift+N` | Open new Cursor chat window |
| Focus Cursor Chat | `Alt+Shift+F` | Focus existing Cursor chat |

### Context Menu Commands

Right-click in the editor to access:
- DevTreeFlow: Auto-Prompt Current Leaf
- DevTreeFlow: Auto-Prompt with Selected Code
- DevTreeFlow: Auto-Prompt Assessment
- DevTreeFlow: Auto-Prompt Correction
- DevTreeFlow: Auto-Prompt Recovery
- DevTreeFlow: Toggle Auto-Prompting Mode
- DevTreeFlow: Open New Cursor Chat
- DevTreeFlow: Focus Cursor Chat

## Usage Scenarios

### Scenario 1: Working in a Leaf Directory
1. Navigate to a DevTreeFlow leaf directory
2. Press `Alt+Shift+D` to auto-prompt for that leaf
3. If auto-prompting is ON: Prompt is automatically sent to Cursor
4. If auto-prompting is OFF: Prompt is copied to clipboard

### Scenario 2: Code Review with Context
1. Select code in your editor
2. Press `Alt+Shift+C` to auto-prompt with context
3. The selected code will be included in the prompt

### Scenario 3: Assessment Mode
1. Navigate to a leaf directory
2. Press `Alt+Shift+A` for assessment
3. Get an assessment of the current leaf's progress

### Scenario 4: Quick Leaf Switching
1. Press `Alt+Shift+L`
2. Select a leaf from the dropdown
3. Automatically switch to that leaf's context

## Technical Implementation

### Automation Flow

When auto-prompting mode is enabled, the extension performs these steps:

1. **Copy to Clipboard**: `await vscode.env.clipboard.writeText(prompt)`
2. **Open Chat**: `await vscode.commands.executeCommand('cursor.chat.show')`
3. **Focus Input**: `await vscode.commands.executeCommand('cursor.chat.focus')`
4. **Paste Content**: `await vscode.commands.executeCommand('editor.action.clipboardPasteAction')`
5. **Send Message**: `await vscode.commands.executeCommand('cursor.chat.send')`

### Fallback Mechanism

If automation fails, the system falls back to:
1. Copy prompt to clipboard
2. Show manual instructions
3. Provide options to open new chat or copy again

## Troubleshooting

### Common Issues

#### Issue: Auto-prompting doesn't work
**Solution**: 
1. Check if Cursor chat is open
2. Try opening a new chat first (`Alt+Shift+N`)
3. Ensure you're in a DevTreeFlow leaf directory
4. Check the notification messages for specific errors

#### Issue: Commands not responding
**Solution**:
1. Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")
2. Check if the extension is activated
3. Verify keyboard shortcuts aren't conflicting

#### Issue: Chat doesn't focus properly
**Solution**:
1. Try the "Focus Cursor Chat" command (`Alt+Shift+F`)
2. Manually click in the chat input field
3. Use the dashboard "New Chat" button

#### Issue: Prompts not sending
**Solution**:
1. Check if Cursor's chat API is available
2. Try manual mode (toggle auto-prompting OFF)
3. Use the clipboard method and paste manually

### Debug Information

To see detailed logs:
1. Open VS Code Developer Tools (`Ctrl+Shift+I`)
2. Look for "DevTreeFlow" messages in the console
3. Check for any error messages

### Manual Override

If automation isn't working:
1. Toggle auto-prompting mode OFF (`Alt+Shift+M`)
2. Use the manual clipboard method
3. Paste manually in Cursor chat

## Integration with Cursor

### Cursor Commands Used

The extension attempts to use these Cursor commands:
- `cursor.chat.show` - Show chat panel
- `cursor.chat.focus` - Focus chat input
- `cursor.chat.new` - Open new chat
- `cursor.chat.send` - Send message

### Compatibility Notes

- Works best with Cursor's latest version
- Some commands may not be available in all Cursor versions
- Fallback mechanisms ensure functionality even if commands fail

## Best Practices

### When to Use Auto-Prompting Mode

**Use Auto-Prompting ON when:**
- You want seamless workflow integration
- You're doing focused development work
- You have a stable Cursor setup

**Use Auto-Prompting OFF when:**
- You want to review prompts before sending
- You're in a complex debugging session
- You need to modify prompts before sending

### Workflow Recommendations

1. **Start with Manual Mode**: Get familiar with the prompts first
2. **Enable Auto-Prompting**: Once comfortable, enable for efficiency
3. **Use Context Selection**: Select relevant code before auto-prompting
4. **Monitor Notifications**: Pay attention to success/failure messages

### Keyboard Shortcut Tips

- `Alt+Shift+M` is your friend - use it to quickly toggle modes
- `Alt+Shift+N` opens new chats when needed
- `Alt+Shift+F` refocuses chat when it loses focus

## Advanced Features

### Custom Prompt Templates

The auto-prompting system uses enhanced prompt generators that:
- Include leaf context and identity
- Add selected code when available
- Provide specific prompts for different modes (assessment, correction, etc.)

### Context-Aware Prompts

Prompts automatically include:
- Current leaf identity and role
- Parent context and expectations
- Selected code context (when applicable)
- Task-specific instructions

### Error Recovery

The system includes multiple fallback mechanisms:
1. Try automated sending
2. Fall back to clipboard method
3. Show user instructions
4. Provide manual options

## Future Enhancements

Planned improvements:
- Custom prompt templates
- Batch auto-prompting
- Integration with other AI tools
- Advanced context management
- Prompt history and reuse

---

For more information, see the main DevTreeFlow documentation or contact the development team. 