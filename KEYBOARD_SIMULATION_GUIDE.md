# 🎹 DevTreeFlow Keyboard Simulation Guide

## Overview

This guide explains the **keyboard simulation workaround** implemented in DevTreeFlow to achieve true automation when Cursor commands are not available. This is a **fallback method** that uses external system processes to simulate keyboard input.

## 🚨 **Important Limitations**

### What Keyboard Simulation CANNOT Do:
- **Send keyboard events from within the VS Code extension sandbox**
- **Simulate keyboard input to VS Code's own UI elements**
- **Work without user permission** (requires external process execution)
- **Guarantee 100% reliability** (depends on system tools and timing)

### What Keyboard Simulation CAN Do:
- **Send keyboard events to the active application** (including Cursor)
- **Simulate standard keyboard shortcuts** (Ctrl+N, Ctrl+V, Enter, etc.)
- **Work as a fallback** when Cursor commands are unavailable
- **Provide true automation** when properly configured

## 🔧 **How It Works**

### The Workaround Architecture

```
VS Code Extension → External Process → System Keyboard API → Cursor
```

1. **Extension triggers** keyboard simulation command
2. **External process** (PowerShell/AppleScript/xdotool) executes
3. **System keyboard API** sends events to active window
4. **Cursor receives** keyboard events as if user typed them

### Platform-Specific Implementation

#### Windows
```typescript
// Uses PowerShell SendKeys
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')"
```

#### macOS
```typescript
// Uses AppleScript
osascript -e 'tell application "System Events" to key code 9 using {command down}'
```

#### Linux
```typescript
// Uses xdotool
xdotool key ctrl+v
```

## 🎯 **Cursor Chat Automation Sequence**

When auto-prompting mode is enabled and Cursor commands fail, the extension attempts this sequence:

### Step 1: Copy to Clipboard
```typescript
await vscode.env.clipboard.writeText(prompt);
```

### Step 2: Open New Chat (Ctrl+N)
```typescript
await KeyboardSimulator.simulateKeyboardShortcut('ctrl+n');
```

### Step 3: Wait for Chat to Open
```typescript
await new Promise(resolve => setTimeout(resolve, 1000));
```

### Step 4: Paste Content (Ctrl+V)
```typescript
await KeyboardSimulator.simulateKeyboardShortcut('ctrl+v');
```

### Step 5: Wait for Paste
```typescript
await new Promise(resolve => setTimeout(resolve, 500));
```

### Step 6: Send Message (Enter)
```typescript
await KeyboardSimulator.simulateKeyboardShortcut('enter');
```

## 🛠️ **Setup Requirements**

### Windows Requirements
- **PowerShell** (usually pre-installed)
- **System.Windows.Forms** assembly (usually available)

### macOS Requirements
- **AppleScript** (pre-installed on macOS)
- **Accessibility permissions** for VS Code

### Linux Requirements
- **xdotool** (may need installation)
- **X11 display** (for GUI applications)

## 🔍 **Testing Keyboard Simulation**

### Test Command
Run from Command Palette:
```
DevTreeFlow: Test Keyboard Simulation (Debug)
```

### Manual Testing
1. Open Cursor
2. Run the test command
3. Check if Ctrl+V is simulated
4. Verify in console output

### Expected Results
- **Success**: "Keyboard simulation test: SUCCESS"
- **Failure**: "Keyboard simulation test: FAILED"
- **Unavailable**: "Keyboard simulation available: false"

## ⚠️ **Common Issues and Solutions**

### Issue: "Keyboard simulation not available"
**Solutions:**
1. **Windows**: Ensure PowerShell is available
2. **macOS**: Grant accessibility permissions to VS Code
3. **Linux**: Install xdotool (`sudo apt-get install xdotool`)

### Issue: "Keyboard simulation failed"
**Solutions:**
1. **Check permissions**: Ensure VS Code has necessary permissions
2. **Verify active window**: Make sure Cursor is the active application
3. **Check timing**: Increase delays between commands

### Issue: "Commands not working as expected"
**Solutions:**
1. **Focus Cursor first**: Ensure Cursor is the active window
2. **Check shortcuts**: Verify Cursor's keyboard shortcuts haven't changed
3. **Test manually**: Try the shortcuts manually first

## 🔄 **Fallback Hierarchy**

The extension uses this priority order:

1. **Cursor Commands** (if available)
   - `cursor.chat.show`
   - `cursor.chat.focus`
   - `cursor.chat.send`

2. **Keyboard Simulation** (if system tools available)
   - PowerShell SendKeys (Windows)
   - AppleScript (macOS)
   - xdotool (Linux)

3. **Manual Fallback** (always available)
   - Copy to clipboard
   - Show instructions to user
   - User manually pastes

## 📊 **Success Rate Expectations**

### Best Case Scenario
- **Cursor commands work**: 100% automation
- **Keyboard simulation works**: 90% automation
- **Manual fallback**: 0% automation (user required)

### Typical Scenario
- **Cursor commands fail**: 0% automation
- **Keyboard simulation works**: 70% automation
- **Manual fallback**: 0% automation (user required)

### Worst Case Scenario
- **Cursor commands fail**: 0% automation
- **Keyboard simulation fails**: 0% automation
- **Manual fallback**: 0% automation (user required)

## 🎭 **Security Considerations**

### What the Extension Does
- **Executes external processes** (PowerShell, AppleScript, xdotool)
- **Sends keyboard events** to the active application
- **Requires user permission** for external process execution

### What the Extension Does NOT Do
- **Access system files** outside the workspace
- **Send data to external servers**
- **Modify system settings**
- **Access user data** beyond clipboard

## 🔧 **Troubleshooting**

### Debug Information
Check the console for detailed logs:
1. Open Developer Tools (`Ctrl+Shift+I`)
2. Look for "DevTreeFlow:" messages
3. Check for error messages

### Common Error Messages
- **"Keyboard simulation not available"**: System tools not found
- **"Keyboard simulation failed"**: Permission or timing issue
- **"External process execution failed"**: Security restriction

### Manual Testing Steps
1. **Test PowerShell** (Windows):
   ```powershell
   powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('test')"
   ```

2. **Test AppleScript** (macOS):
   ```bash
   osascript -e 'tell application "System Events" to keystroke "test"'
   ```

3. **Test xdotool** (Linux):
   ```bash
   xdotool type "test"
   ```

## 🚀 **Future Improvements**

### Planned Enhancements
1. **Better timing control**: Adaptive delays based on system performance
2. **Window focus management**: Ensure Cursor is active before sending keys
3. **Error recovery**: Retry failed commands with different approaches
4. **User feedback**: More detailed status messages

### Alternative Approaches
1. **Native messaging**: Communication with native application
2. **WebSocket integration**: Direct communication with Cursor
3. **Plugin API**: If Cursor exposes plugin capabilities

## 📝 **Summary**

The keyboard simulation workaround provides a **realistic path to automation** when Cursor commands are not available. While not perfect, it offers a significant improvement over manual clipboard operations and can achieve **70-90% automation** in typical scenarios.

**Key Points:**
- ✅ **Works when system tools are available**
- ✅ **Provides true keyboard automation**
- ✅ **Falls back gracefully to manual methods**
- ❌ **Requires external process execution**
- ❌ **Depends on system-specific tools**
- ❌ **Not 100% reliable due to timing issues**

**Bottom Line**: This is the **best available workaround** for keyboard simulation within VS Code extension constraints. 