# Terminal Buffer Size Prediction - AI Context Guide

## 🎯 **PURPOSE**
Proactively predict when terminal operations will produce extensive output requiring larger buffer sizes, preventing truncation and display issues before they occur.

## 🔍 **COMMAND PATTERN ANALYSIS**

### **High-Output Commands (Require Large Buffers)**

#### **Build & Compilation Commands:**
```bash
# .NET Commands
dotnet build
dotnet test --verbosity detailed
dotnet publish
dotnet restore

# Node.js Commands  
npm install
npm run build
npm test
yarn install --verbose

# Python Commands
pip install -r requirements.txt
python -m pytest -v
python setup.py install

# Recommended Buffer: 120x5000 (Window: 120x40)
```

#### **Infrastructure & Deployment:**
```bash
# Terraform Commands
terraform plan
terraform apply
terraform destroy
terraform show

# Docker Commands
docker build .
docker-compose up
docker logs --follow container_name
docker system prune

# Kubernetes Commands
kubectl get pods --all-namespaces
kubectl describe deployment
kubectl logs -f deployment/app

# Recommended Buffer: 140x7000 (Window: 140x45)
```

#### **Version Control & Analysis:**
```bash
# Git Commands
git log --oneline --graph --all
git diff --stat
git blame filename.cs
git show --stat

# Code Analysis
eslint . --format detailed
sonarqube-scanner
code-coverage-report

# Recommended Buffer: 120x3000 (Window: 120x35)
```

### **Medium-Output Commands (Standard Buffers)**

#### **Standard Development Commands:**
```bash
# File Operations
ls -la
dir /s
find . -name "*.cs"
grep -r "pattern" .

# Process Management
ps aux
Get-Process
netstat -an
tasklist

# Recommended Buffer: 120x2000 (Window: 120x30)
```

### **Low-Output Commands (Default Buffers)**

#### **Simple Commands:**
```bash
# Basic Operations
cd path
mkdir directory
echo "message"
pwd
whoami

# Quick Checks
node --version
dotnet --version
git --version

# Recommended Buffer: Default (Current settings)
```

## 🤖 **AI PREDICTION ALGORITHM**

### **Step 1: Command Analysis**
```javascript
function predictBufferNeeds(command) {
  const highOutputPatterns = [
    /^(dotnet|npm|yarn|pip)\s+(build|install|test|publish)/,
    /^terraform\s+(plan|apply|show|destroy)/,
    /^docker(-compose)?\s+(build|up|logs)/,
    /^kubectl\s+(get|describe|logs)/,
    /^git\s+(log|diff|blame|show).*--/,
    /--verbose|--detailed|-v\s|--all/
  ];
  
  const mediumOutputPatterns = [
    /^(ls|dir|find|grep|ps|netstat|tasklist)/,
    /^Get-(Process|Service|ChildItem)/,
    /\|\s*(Select|Where|Sort)/
  ];
  
  // Analyze command complexity
  if (highOutputPatterns.some(pattern => pattern.test(command))) {
    return 'high';
  } else if (mediumOutputPatterns.some(pattern => pattern.test(command))) {
    return 'medium';
  }
  return 'low';
}
```

### **Step 2: Proactive Buffer Adjustment**
```powershell
function Set-OptimalBufferSize {
    param([string]$OutputLevel)
    
    switch ($OutputLevel) {
        'high' {
            $bufferSize = New-Object System.Management.Automation.Host.Size(140, 7000)
            $windowSize = New-Object System.Management.Automation.Host.Size(140, 45)
        }
        'medium' {
            $bufferSize = New-Object System.Management.Automation.Host.Size(120, 3000)
            $windowSize = New-Object System.Management.Automation.Host.Size(120, 35)
        }
        default {
            $bufferSize = New-Object System.Management.Automation.Host.Size(120, 2000)
            $windowSize = New-Object System.Management.Automation.Host.Size(120, 30)
        }
    }
    
    try {
        $Host.UI.RawUI.BufferSize = $bufferSize
        $Host.UI.RawUI.WindowSize = $windowSize
        Write-Host "✅ Buffer optimized for $OutputLevel output" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Could not adjust buffer size: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
```

## 🛠️ **IMPLEMENTATION WORKFLOW**

### **For AI Assistants:**

1. **Pre-Command Analysis:**
   ```powershell
   # Before running any terminal command, analyze it
   $command = "terraform plan"
   $outputLevel = Get-PredictedOutputLevel $command
   
   if ($outputLevel -ne 'low') {
       Write-Host "🔧 Optimizing buffer for $outputLevel output command..." -ForegroundColor Cyan
       Set-OptimalBufferSize -OutputLevel $outputLevel
   }
   ```

2. **Command Execution:**
   ```powershell
   # Run the actual command
   Invoke-Expression $command
   ```

3. **Post-Command Monitoring:**
   ```powershell
   # Check if output was truncated
   $currentBufferHeight = $Host.UI.RawUI.BufferSize.Height
   $cursorPosition = $Host.UI.RawUI.CursorPosition.Y
   
   if ($cursorPosition -gt ($currentBufferHeight * 0.8)) {
       Write-Host "⚠️ Output may have been truncated. Consider increasing buffer size." -ForegroundColor Yellow
   }
   ```

## 📊 **BUFFER SIZE RECOMMENDATIONS**

### **By Command Category:**

| Command Type | Buffer Width | Buffer Height | Window Width | Window Height | Use Case |
|--------------|--------------|---------------|--------------|---------------|----------|
| Infrastructure (terraform, docker, k8s) | 140 | 7000 | 140 | 45 | Deployment logs, detailed output |
| Build Systems (dotnet, npm, maven) | 120 | 5000 | 120 | 40 | Compilation output, test results |
| Version Control (git log, diff) | 120 | 3000 | 120 | 35 | Code history, change analysis |
| File Operations (ls, find, grep) | 120 | 2000 | 120 | 30 | Directory listings, search results |
| Simple Commands (cd, echo, version) | 100 | 1000 | 100 | 25 | Basic operations |

### **Special Cases:**

#### **Long-Running Commands:**
```powershell
# For commands that run for extended periods
$Host.UI.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size(160, 10000)
$Host.UI.RawUI.WindowSize = New-Object System.Management.Automation.Host.Size(160, 50)

# Examples: docker-compose up, npm run dev, dotnet watch
```

#### **Wide Output Commands:**
```powershell
# For commands with wide tabular output
$Host.UI.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size(200, 3000)
$Host.UI.RawUI.WindowSize = New-Object System.Management.Automation.Host.Size(200, 30)

# Examples: kubectl get pods -o wide, docker ps, netstat -an
```

## 🔧 **INTEGRATION WITH EXISTING BUFFER FIX**

### **Combined Approach:**
1. **First**: Check for existing buffer issues (height = 1)
2. **Second**: Apply emergency fix if needed
3. **Third**: Predict optimal buffer size for upcoming command
4. **Fourth**: Adjust buffer proactively
5. **Fifth**: Monitor for truncation during execution

### **Smart Buffer Management:**
```powershell
function Invoke-CommandWithOptimalBuffer {
    param([string]$Command)
    
    # Step 1: Emergency fix if needed
    if ($Host.UI.RawUI.BufferSize.Height -eq 1) {
        Write-Host "🚨 Emergency buffer fix required!" -ForegroundColor Red
        $Host.UI.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size(120, 3000)
        $Host.UI.RawUI.WindowSize = New-Object System.Management.Automation.Host.Size(120, 30)
    }
    
    # Step 2: Predict optimal size
    $outputLevel = Get-PredictedOutputLevel $Command
    Set-OptimalBufferSize -OutputLevel $outputLevel
    
    # Step 3: Execute command
    Write-Host "▶️ Executing: $Command" -ForegroundColor Green
    Invoke-Expression $Command
    
    # Step 4: Post-execution check
    if (Test-OutputTruncation) {
        Write-Host "💡 Consider using 'Get-Command | Out-Host -Paging' for very long output" -ForegroundColor Yellow
    }
}
```

## 🎯 **SUCCESS METRICS**

### **Indicators of Successful Prediction:**
- ✅ No output truncation during command execution
- ✅ Full command output visible in terminal
- ✅ No PSReadLine cursor position errors
- ✅ Smooth scrolling through command output
- ✅ Proper terminal responsiveness maintained

### **Monitoring Commands:**
```powershell
# Check buffer utilization
$bufferUsage = [math]::Round(($Host.UI.RawUI.CursorPosition.Y / $Host.UI.RawUI.BufferSize.Height) * 100, 2)
Write-Host "Buffer Usage: $bufferUsage%" -ForegroundColor $(if($bufferUsage -gt 80){'Red'}else{'Green'})
```

This system would allow our AI to intelligently predict and prevent buffer issues before they occur, making the development experience much smoother! 