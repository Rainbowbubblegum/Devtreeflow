# PowerShell Buffer Size Fix - AI Context Guide

## 🚨 **ISSUE IDENTIFICATION**

### **Symptoms to Detect:**
- Terminal displays only 1 line of output
- Cursor position errors in PowerShell
- "ArgumentOutOfRangeException: The value must be greater than or equal to zero and less than the console's buffer size"
- PSReadLine errors with cursor positioning
- Commands appear to run but output is truncated
- Terminal becomes unresponsive or shows partial command results
- "Oops, something went wrong. Please report this bug with the details below" from PSReadLine
- "System.ArgumentOutOfRangeException" with "Parameter name: top" and "Actual value was -1"
- "at System.Console.SetCursorPosition(Int32 left, Int32 top)" errors
- "at Microsoft.PowerShell.PSConsoleReadLine.ReallyRender" errors
- Terminal input appears to work but no visual feedback
- Typing characters but they don't appear on screen properly

### **Keywords/Phrases that Trigger This Context:**
- "buffer size"
- "terminal issues"
- "cursor position"
- "PowerShell not displaying output"
- "terminal only shows one line"
- "PSReadLine errors"
- "console buffer"
- "terminal truncated"

## 🔍 **DIAGNOSTIC COMMANDS**

### **Step 1: Check Current Buffer Size**
```powershell
# Check buffer size - should show width x height
$Host.UI.RawUI.BufferSize

# Check window size - should show width x height  
$Host.UI.RawUI.WindowSize

# Expected PROBLEM: Height = 1 (extremely small)
# Expected NORMAL: Height >= 15 (reasonable size)
```

### **Step 2: Identify the Problem**
```powershell
# Display current settings clearly
Write-Host "Buffer Size: $($Host.UI.RawUI.BufferSize.Width) x $($Host.UI.RawUI.BufferSize.Height)"
Write-Host "Window Size: $($Host.UI.RawUI.WindowSize.Width) x $($Host.UI.RawUI.WindowSize.Height)"

# If Height = 1 for either, this is the problem
```

## 🛠️ **AUTOMATED FIX PROCEDURE**

### **Method 1: Direct PowerShell Commands (Preferred)**
```powershell
# Set buffer size first (must be larger than or equal to window size)
$Host.UI.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size(120, 3000)

# Set window size
$Host.UI.RawUI.WindowSize = New-Object System.Management.Automation.Host.Size(120, 30)
```

### **Method 2: Script File Approach (If Direct Commands Fail)**
Create a PowerShell script file with the following content:

```powershell
# PowerShell Buffer Fix Script
Write-Host "Diagnosing buffer size issue..." -ForegroundColor Yellow

Write-Host "Current Buffer Size: $($Host.UI.RawUI.BufferSize.Width) x $($Host.UI.RawUI.BufferSize.Height)"
Write-Host "Current Window Size: $($Host.UI.RawUI.WindowSize.Width) x $($Host.UI.RawUI.WindowSize.Height)"

try {
    # Fix buffer size
    $newBufferSize = New-Object System.Management.Automation.Host.Size(120, 3000)
    $Host.UI.RawUI.BufferSize = $newBufferSize
    
    # Fix window size
    $newWindowSize = New-Object System.Management.Automation.Host.Size(120, 30)
    $Host.UI.RawUI.WindowSize = $newWindowSize
    
    Write-Host "✅ Buffer and window sizes fixed successfully!" -ForegroundColor Green
    Write-Host "New Buffer Size: $($Host.UI.RawUI.BufferSize.Width) x $($Host.UI.RawUI.BufferSize.Height)"
    Write-Host "New Window Size: $($Host.UI.RawUI.WindowSize.Width) x $($Host.UI.RawUI.WindowSize.Height)"
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Try restarting the terminal or adjusting IDE settings" -ForegroundColor Yellow
}

# Self-cleanup
Remove-Item -Path $PSCommandPath -Force -ErrorAction SilentlyContinue
```

## 🔄 **AI IMPLEMENTATION WORKFLOW**

### **Step-by-Step Process for AI:**

1. **Detect Issue:**
   ```powershell
   # Run diagnostic command
   $bufferHeight = $Host.UI.RawUI.BufferSize.Height
   $windowHeight = $Host.UI.RawUI.WindowSize.Height
   
   # If either height is 1, proceed with fix
   if ($bufferHeight -eq 1 -or $windowHeight -eq 1) {
       Write-Host "⚠️ Buffer size issue detected!" -ForegroundColor Red
   }
   ```

2. **Apply Fix:**
   ```powershell
   # Try direct method first
   try {
       $Host.UI.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size(120, 3000)
       $Host.UI.RawUI.WindowSize = New-Object System.Management.Automation.Host.Size(120, 30)
       Write-Host "✅ Direct fix applied successfully"
   }
   catch {
       # Fall back to script file method
       # Create and run script file as shown in Method 2
   }
   ```

3. **Verify Fix:**
   ```powershell
   # Confirm the fix worked
   $newBufferHeight = $Host.UI.RawUI.BufferSize.Height
   $newWindowHeight = $Host.UI.RawUI.WindowSize.Height
   
   if ($newBufferHeight -gt 1 -and $newWindowHeight -gt 1) {
       Write-Host "✅ Buffer size issue resolved!" -ForegroundColor Green
   }
   ```

4. **Test Terminal:**
   ```powershell
   # Test with a multi-line output command
   Get-Process | Select-Object -First 5
   ```

## 📋 **RECOMMENDED SIZES**

### **Standard Settings:**
- **Buffer Width:** 120 characters (good for most development work)
- **Buffer Height:** 3000 lines (provides good scroll-back history)
- **Window Width:** 120 characters (matches buffer width)
- **Window Height:** 30 lines (good visible area)

### **Alternative Settings:**
- **Minimal:** Buffer 100x1000, Window 100x25
- **Large:** Buffer 140x5000, Window 140x40
- **Ultra-wide:** Buffer 160x3000, Window 160x35

## 🔧 **TROUBLESHOOTING**

### **If Direct Commands Fail:**
1. Terminal may be in broken state due to cursor position errors
2. Create script file and run it instead
3. May need to restart terminal session
4. Check IDE/editor terminal settings

### **If PSReadLine Errors Persist:**
```powershell
# Method 1: Disable PSReadLine temporarily and fix buffer
Remove-Module PSReadLine -Force -ErrorAction SilentlyContinue

# Apply buffer fix
$Host.UI.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size(120, 3000)
$Host.UI.RawUI.WindowSize = New-Object System.Management.Automation.Host.Size(120, 30)

# Re-import PSReadLine
Import-Module PSReadLine -Force
```

### **Advanced PSReadLine Cursor Error Fixes:**
```powershell
# Method 2: Reset PSReadLine options if cursor errors persist
try {
    # Clear PSReadLine history and reset options
    Clear-Host
    Set-PSReadLineOption -PredictionSource None
    Set-PSReadLineOption -Colors @{
        Command = 'Yellow'
        Parameter = 'Green'
        Operator = 'Magenta'
        Variable = 'Green'
        String = 'Blue'
        Number = 'Blue'
        Type = 'Cyan'
        Comment = 'DarkCyan'
    }
    Write-Host "PSReadLine options reset" -ForegroundColor Green
} catch {
    Write-Host "Could not reset PSReadLine options: $($_.Exception.Message)" -ForegroundColor Yellow
}
```

### **Terminal Session Recovery:**
```powershell
# Method 3: Complete terminal session recovery
function Reset-TerminalSession {
    try {
        # Step 1: Clear screen and reset cursor
        Clear-Host
        [System.Console]::SetCursorPosition(0, 0)
        
        # Step 2: Fix buffer sizes
        $Host.UI.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size(120, 3000)
        $Host.UI.RawUI.WindowSize = New-Object System.Management.Automation.Host.Size(120, 30)
        
        # Step 3: Reset PSReadLine
        Remove-Module PSReadLine -Force -ErrorAction SilentlyContinue
        Import-Module PSReadLine -Force -ErrorAction SilentlyContinue
        
        # Step 4: Test recovery
        Write-Host "✅ Terminal session recovered!" -ForegroundColor Green
        Write-Host "Buffer: $($Host.UI.RawUI.BufferSize.Width)x$($Host.UI.RawUI.BufferSize.Height)"
        Write-Host "Window: $($Host.UI.RawUI.WindowSize.Width)x$($Host.UI.RawUI.WindowSize.Height)"
        
        return $true
    } catch {
        Write-Host "❌ Recovery failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Recommend restarting terminal" -ForegroundColor Yellow
        return $false
    }
}

# Run recovery function
Reset-TerminalSession
```

### **Common Error Patterns:**
- "ArgumentOutOfRangeException" + "cursor position" = Buffer size too small
- "PSReadLine" errors = Usually buffer size related
- Commands run but no output visible = Buffer height = 1

## 🎯 **SUCCESS INDICATORS**

### **Fix is Successful When:**
- ✅ Buffer height > 1 (preferably 15+)
- ✅ Window height > 1 (preferably 15+)
- ✅ Multi-line commands display properly
- ✅ No PSReadLine cursor errors
- ✅ Terminal scrollback works
- ✅ Command history visible

### **Test Commands:**
```powershell
# These should all display properly after fix:
Get-Process | Select-Object -First 10
Get-ChildItem | Select-Object -First 5
Get-Date; Get-Location; Get-Host
```

## 🔄 **PERMANENT FIX (Optional)**

### **PowerShell Profile Setup:**
To make this fix permanent, add to PowerShell profile:

```powershell
# Check if profile exists, create if not
if (!(Test-Path $PROFILE)) {
    New-Item -Path $PROFILE -Type File -Force
}

# Add comprehensive buffer size and PSReadLine fix to profile
Add-Content $PROFILE @"
# PowerShell Buffer Size and PSReadLine Fix
try {
    # Check and fix buffer size issues
    if (`$Host.UI.RawUI.BufferSize.Height -eq 1 -or `$Host.UI.RawUI.WindowSize.Height -eq 1) {
        # Fix buffer size first
        `$Host.UI.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size(120, 3000)
        `$Host.UI.RawUI.WindowSize = New-Object System.Management.Automation.Host.Size(120, 30)
        
        # Reset cursor position to prevent PSReadLine errors
        try {
            [System.Console]::SetCursorPosition(0, 0)
        } catch {
            # Ignore cursor position errors during startup
        }
        
        # Configure PSReadLine to prevent cursor issues
        if (Get-Module -ListAvailable PSReadLine) {
            Import-Module PSReadLine -Force -ErrorAction SilentlyContinue
            try {
                Set-PSReadLineOption -PredictionSource None -ErrorAction SilentlyContinue
                Set-PSReadLineOption -BellStyle None -ErrorAction SilentlyContinue
            } catch {
                # Ignore PSReadLine configuration errors
            }
        }
        
        Write-Host "✅ Terminal buffer and PSReadLine auto-corrected" -ForegroundColor Green
    }
} catch {
    # Silently continue if unable to set buffer size or configure PSReadLine
}
"@
```

## 🎯 **CURSOR-SPECIFIC BEHAVIOR**

### **Important: Cursor IDE Override**
If running in Cursor IDE, be aware that:
- ✅ **Manual fixes work** but don't persist across sessions
- ❌ **Profile auto-fixes don't work** - Cursor overrides PowerShell settings
- ⚠️ **Expected behavior** - Cursor controls terminal buffer initialization
- 🔧 **Solution** - Provide manual/script-based fixes instead of profile-based

### **Cursor Detection:**
```powershell
# Check if running in Cursor environment
$isCursor = $env:TERM_PROGRAM -eq "cursor" -or 
            $env:VSCODE_INJECTION -eq "1" -or
            (Get-Process -Name "Cursor" -ErrorAction SilentlyContinue)

if ($isCursor) {
    Write-Host "⚠️ Cursor environment detected - using manual fix approach" -ForegroundColor Yellow
}
```

### **Cursor-Optimized Quick Fix:**
```powershell
# fix-cursor-buffer.ps1 - Quick fix for Cursor terminals
Write-Host "🔧 Fixing Cursor terminal buffer..." -ForegroundColor Yellow
try {
    $Host.UI.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size(120, 3000)
    $Host.UI.RawUI.WindowSize = New-Object System.Management.Automation.Host.Size(120, 30)
    [System.Console]::SetCursorPosition(0, 0)
    
    # Reset PSReadLine for Cursor
    Remove-Module PSReadLine -Force -ErrorAction SilentlyContinue
    Import-Module PSReadLine -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Cursor terminal fixed!" -ForegroundColor Green
    Write-Host "Buffer: $($Host.UI.RawUI.BufferSize.Width)x$($Host.UI.RawUI.BufferSize.Height)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Fix failed: $($_.Exception.Message)" -ForegroundColor Red
}
```

## 🚨 **AI RESPONSE TEMPLATE**

When this issue is detected, AI should respond with:

**For Cursor IDE environments:**
```
I've detected a PowerShell buffer size issue in Cursor IDE. This is a known issue where Cursor 
overrides PowerShell terminal settings. Let me apply a manual fix that works in Cursor.

[Run diagnostic commands]
[Apply manual fix - not profile-based]
[Verify fix worked]
[Explain that fix needs to be reapplied for new sessions]

✅ Buffer size issue resolved! Note: In Cursor, you may need to reapply this fix for new terminal sessions.
```

**For standard PowerShell environments:**
```
I've detected a PowerShell buffer size issue. Your terminal buffer is set to only 1 line height, 
which causes display problems and cursor errors. Let me fix this for you.

[Run diagnostic commands]
[Apply fix]
[Verify fix worked]
[Set up permanent profile fix]

✅ Buffer size issue resolved! Your terminal should now display output properly.
```

## 📝 **CONTEXT ACTIVATION**

This context should be activated when user mentions:
- Terminal display issues
- PowerShell buffer problems
- Cursor position errors
- Commands not showing output
- "Only one line" terminal issues
- PSReadLine errors
- Console buffer size problems 