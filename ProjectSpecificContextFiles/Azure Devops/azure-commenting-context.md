# Azure DevOps Commenting Context

## 💬 **WORK ITEM COMMENTING & UPDATES**

This file contains proven methods for adding comments, updates, and progress tracking to Azure DevOps work items.

---

## ✅ **PROVEN COMMENTING METHODS (TESTED & VERIFIED)**

### **Method 1: Direct Azure CLI Command (RECOMMENDED)**
**Best for: Simple comments, automation, scripting**
```bash
az boards work-item update --id {TICKET_ID} --discussion "Your comment text here"
```

**Example:**
```bash
az boards work-item update --id 11530 --discussion "Branch created: feature/AzureTicketBranch-11530"
```

### **Method 2: Batch File (MOST RELIABLE)**
**Best for: Complex comments, special characters, avoiding PowerShell issues**

**Create batch file (`add-comment.bat`):**
```bat
@echo off
if "%1"=="" (
    echo Usage: add-comment.bat [TICKET_ID] "Comment text"
    echo Example: add-comment.bat 11530 "Development started"
    exit /b 1
)

if "%2"=="" (
    echo Error: Comment text required
    exit /b 1
)

set TICKET_ID=%1
set COMMENT=%2

echo Adding comment to ticket #%TICKET_ID%...
az boards work-item update --id %TICKET_ID% --discussion %COMMENT%

if %errorlevel% eq 0 (
    echo ✅ Comment added successfully to ticket #%TICKET_ID%
) else (
    echo ❌ Error: Failed to add comment to ticket #%TICKET_ID%
)
```

**Usage:**
```bash
.\add-comment.bat 11530 "Development branch created and work started"
```

### **Method 3: PowerShell Script (MULTI-LINE SUPPORT)**
**Best for: Detailed comments with formatting**

**Create PowerShell script (`add-detailed-comment.ps1`):**
```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$TicketId,
    
    [Parameter(Mandatory=$true)]
    [string]$Comment
)

Write-Host "Adding comment to ticket #$TicketId..."

try {
    az boards work-item update --id $TicketId --discussion $Comment
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Comment added successfully to ticket #$TicketId"
    } else {
        Write-Host "❌ Error: Failed to add comment (exit code: $LASTEXITCODE)"
    }
} catch {
    Write-Host "❌ Error: $_"
}
```

**Usage:**
```bash
powershell -ExecutionPolicy Bypass -File add-detailed-comment.ps1 -TicketId 11530 -Comment "Multi-line comment with details"
```

---

## 📝 **COMMENT TEMPLATES**

### **Development Progress Comments**
```bash
# Branch creation
az boards work-item update --id {TICKET_ID} --discussion "Branch created: feature/AzureTicketBranch-{TICKET_ID}

Development branch created for this ticket.
Base Branch: {BASE_BRANCH}
Created: $(date '+%Y-%m-%d %H:%M:%S')

To work on this ticket:
git checkout feature/AzureTicketBranch-{TICKET_ID}"

# Development started
az boards work-item update --id {TICKET_ID} --discussion "Development started

Currently working on implementing the requirements.
Expected completion: {DATE}
Will provide updates as progress is made."

# Progress update
az boards work-item update --id {TICKET_ID} --discussion "Progress Update - $(date '+%Y-%m-%d')

✅ Completed:
- {Completed tasks}

🔄 In Progress:
- {Current work}

📋 Next Steps:
- {Planned work}

ETA: {Estimated completion}"

# Code review ready
az boards work-item update --id {TICKET_ID} --discussion "Ready for Code Review

Implementation completed and ready for review.

📋 Changes Made:
- {Summary of changes}

🧪 Testing:
- {Testing performed}

🔗 Pull Request: {PR_LINK}"

# Deployment notification
az boards work-item update --id {TICKET_ID} --discussion "Deployed to {ENVIRONMENT}

Changes have been successfully deployed to {ENVIRONMENT}.

📅 Deployment Date: $(date '+%Y-%m-%d %H:%M:%S')
🔗 Release Notes: {RELEASE_NOTES_LINK}
📊 Build: {BUILD_NUMBER}"
```

### **Issue Resolution Comments**
```bash
# Investigation started
az boards work-item update --id {TICKET_ID} --discussion "Investigation Started

Beginning analysis of the reported issue.

📋 Initial Assessment:
- {Initial findings}

🔍 Investigation Plan:
- {Steps to investigate}

Will update with findings."

# Root cause identified
az boards work-item update --id {TICKET_ID} --discussion "Root Cause Identified

🔍 Root Cause:
{Description of root cause}

💡 Proposed Solution:
{Solution approach}

📋 Implementation Plan:
{Steps to implement fix}

ETA for fix: {DATE}"

# Fix implemented
az boards work-item update --id {TICKET_ID} --discussion "Fix Implemented

✅ Solution Applied:
{Description of fix}

🧪 Testing Results:
{Testing performed and results}

📦 Deployment:
{Deployment status/plan}

Issue should now be resolved."
```

### **Release Management Comments**
```bash
# Release planning
az boards work-item update --id {TICKET_ID} --discussion "Included in Release Planning

This ticket has been included in {RELEASE_NAME}.

📅 Planned Release Date: {DATE}
🎯 Target Environment: {ENVIRONMENT}
📋 Release Notes: Will be included in release documentation"

# Release completed
az boards work-item update --id {TICKET_ID} --discussion "Released to Production

✅ Successfully deployed to production.

📅 Release Date: $(date '+%Y-%m-%d')
🔗 Release Notes: {LINK}
📊 Version: {VERSION}

This ticket is now live for users."
```

---

## 🔧 **AUTOMATION SCRIPTS**

### **Intelligent Comment Script**
Create `smart-comment.ps1`:
```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$TicketId,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("branch-created", "development-started", "progress-update", 
                 "code-review", "testing-complete", "deployed", "investigation", 
                 "fix-implemented", "release-planning", "release-complete")]
    [string]$CommentType,
    
    [string]$Details = "",
    [string]$Environment = "",
    [string]$ETA = "",
    [string]$Version = ""
)

# Get current date/time
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$date = Get-Date -Format "yyyy-MM-dd"

# Get current branch if in Git repo
$currentBranch = ""
try {
    $currentBranch = git branch --show-current 2>$null
} catch {
    # Not in Git repo or git not available
}

# Build comment based on type
switch ($CommentType) {
    "branch-created" {
        $branchName = if ($currentBranch) { $currentBranch } else { "feature/AzureTicketBranch-$TicketId" }
        $comment = @"
Branch created: $branchName

Development branch created for this ticket.
Created: $timestamp

To work on this ticket:
git checkout $branchName
"@
    }
    
    "development-started" {
        $comment = @"
Development started - $date

Currently working on implementing the requirements.
$(if ($ETA) { "Expected completion: $ETA" })
$(if ($Details) { "Details: $Details" })

Will provide updates as progress is made.
"@
    }
    
    "progress-update" {
        $comment = @"
Progress Update - $date

$(if ($Details) { $Details } else { "Development is progressing as planned." })
$(if ($ETA) { "Updated ETA: $ETA" })

Next update will be provided as significant milestones are reached.
"@
    }
    
    "code-review" {
        $comment = @"
Ready for Code Review - $date

Implementation completed and ready for review.

$(if ($Details) { "Changes: $Details" })

Awaiting code review and approval.
"@
    }
    
    "testing-complete" {
        $comment = @"
Testing Complete - $date

All testing has been completed successfully.

$(if ($Details) { "Test Results: $Details" })

Ready for deployment approval.
"@
    }
    
    "deployed" {
        $comment = @"
Deployed to $(if ($Environment) { $Environment } else { "target environment" }) - $timestamp

Changes have been successfully deployed.
$(if ($Version) { "Version: $Version" })
$(if ($Details) { "Details: $Details" })

Deployment verified and working as expected.
"@
    }
    
    "investigation" {
        $comment = @"
Investigation Started - $date

Beginning analysis of the reported issue.

$(if ($Details) { "Initial findings: $Details" })

Will update with progress and findings.
"@
    }
    
    "fix-implemented" {
        $comment = @"
Fix Implemented - $date

Solution has been applied to resolve the issue.

$(if ($Details) { "Fix details: $Details" })

Testing in progress to verify resolution.
"@
    }
    
    "release-planning" {
        $comment = @"
Included in Release Planning - $date

This ticket has been included in upcoming release.

$(if ($Environment) { "Target environment: $Environment" })
$(if ($ETA) { "Planned release date: $ETA" })
$(if ($Details) { "Release details: $Details" })
"@
    }
    
    "release-complete" {
        $comment = @"
Released to Production - $timestamp

✅ Successfully deployed to production.

$(if ($Version) { "Version: $Version" })
$(if ($Details) { "Release notes: $Details" })

This ticket is now live for users.
"@
    }
}

# Add the comment
Write-Host "Adding $CommentType comment to ticket #$TicketId..."
Write-Host "Comment preview:"
Write-Host $comment
Write-Host ""

az boards work-item update --id $TicketId --discussion $comment

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Comment added successfully to ticket #$TicketId"
} else {
    Write-Host "❌ Error: Failed to add comment to ticket #$TicketId"
}
```

**Usage Examples:**
```bash
# Branch creation
.\smart-comment.ps1 -TicketId 11530 -CommentType "branch-created"

# Development progress
.\smart-comment.ps1 -TicketId 11530 -CommentType "progress-update" -Details "UI components completed, working on backend integration" -ETA "2024-01-15"

# Deployment
.\smart-comment.ps1 -TicketId 11530 -CommentType "deployed" -Environment "Production" -Version "v1.2.3"
```

---

## 🔍 **COMMENT VERIFICATION**

### **Verification Methods**
```bash
# Method 1: Check comment count
az boards work-item show --id {TICKET_ID} --query "fields.['System.CommentCount']" --output tsv

# Method 2: Check last comment
az boards work-item show --id {TICKET_ID} --query "fields.['System.History']" --output tsv

# Method 3: Get full work item with comments
az boards work-item show --id {TICKET_ID} --output json

# Method 4: Open in browser for visual confirmation
start https://dev.azure.com/{ORG}/{PROJECT}/_workitems/edit/{TICKET_ID}
```

### **Comment Verification Script**
Create `verify-comment.ps1`:
```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$TicketId,
    
    [string]$ExpectedText = ""
)

Write-Host "Verifying comment on ticket #$TicketId..."

# Get work item details
$workItem = az boards work-item show --id $TicketId --output json | ConvertFrom-Json

if (-not $workItem) {
    Write-Host "❌ Error: Could not retrieve ticket #$TicketId"
    exit 1
}

# Check comment count
$commentCount = $workItem.fields.'System.CommentCount'
Write-Host "📊 Total comments: $commentCount"

# Check latest history entry
$latestHistory = $workItem.fields.'System.History'
if ($latestHistory) {
    Write-Host "📝 Latest comment preview:"
    Write-Host $latestHistory.Substring(0, [Math]::Min(200, $latestHistory.Length))
    if ($latestHistory.Length -gt 200) { Write-Host "..." }
    
    # Check if expected text is present
    if ($ExpectedText -and $latestHistory -like "*$ExpectedText*") {
        Write-Host "✅ Expected text found in latest comment"
    } elseif ($ExpectedText) {
        Write-Host "❌ Expected text not found in latest comment"
    }
} else {
    Write-Host "📝 No recent comment history found"
}

# Provide browser link
$orgUrl = az devops configure --list | Select-String "organization" | ForEach-Object { $_.ToString().Split("=")[1].Trim() }
$project = az devops configure --list | Select-String "project" | ForEach-Object { $_.ToString().Split("=")[1].Trim() }

if ($orgUrl -and $project) {
    Write-Host "🔗 View in browser: $orgUrl/$project/_workitems/edit/$TicketId"
}
```

---

## 🚨 **CRITICAL LESSONS LEARNED**

### **Best Practices**
- ✅ **Batch files are most reliable** - no PowerShell ReadLine issues
- ✅ **Direct commands work** but may have display issues in PowerShell
- ✅ **Always verify success** by checking comment count or viewing in browser
- ⚠️ **PowerShell ReadLine can cause display problems** but commands still execute
- 🎯 **Use batch files for automation** to ensure consistent results

### **Troubleshooting**
- **PowerShell display issues**: Commands still work, just ignore display problems
- **Special characters**: Use batch files to avoid encoding issues
- **Long comments**: Break into multiple shorter comments if needed
- **Network issues**: Add retry logic for production environments

---

## 🔗 **INTEGRATION WITH OTHER CONTEXTS**

### **Branch Integration**
When creating branches, automatically add comments:
```bash
# From azure-branch-integration-context.md
TICKET_ID=$(extract_ticket_id_from_branch)
BRANCH_NAME=$(git branch --show-current)

az boards work-item update --id $TICKET_ID --discussion "Branch created: $BRANCH_NAME

Development branch created for this ticket.
Base Branch: develop
Created: $(date)

To work on this ticket:
git checkout $BRANCH_NAME"
```

### **Release Integration**
When including tickets in releases:
```bash
# From release-management-context.md
az boards work-item update --id $TICKET_ID --discussion "Included in Release: $RELEASE_NAME

This ticket has been included in the upcoming release.

📅 Planned Release Date: $RELEASE_DATE
🎯 Target Environment: $ENVIRONMENT
📋 Release Notes: Will be included in release documentation"
```

---

## 🚀 **AI ASSISTANT INTEGRATION**

### **Intelligent Commenting**
```javascript
const commentIntents = {
  // Development workflow
  "add comment that I started working on this" → development-started template
  "comment that branch is created" → branch-created template
  "update progress on ticket" → progress-update template
  
  // Issue resolution
  "add comment about investigation" → investigation template
  "comment that fix is implemented" → fix-implemented template
  "note that testing is complete" → testing-complete template
  
  // Release management
  "comment about deployment" → deployed template
  "add release comment" → release-complete template
}
```

### **Automated Comment Detection**
The AI should automatically offer to add comments when:
- Creating branches for tickets
- Completing development milestones
- Deploying to environments
- Resolving issues
- Including tickets in releases

### **Smart Comment Templates**
Based on context detection:
```
User: "I created a branch for ticket #11530"
AI: "I can add a comment to ticket #11530 about the branch creation. 

Would you like me to add this comment:

'Branch created: feature/AzureTicketBranch-11530

Development branch created for this ticket.
Base Branch: develop
Created: 2024-01-21 10:30:00

To work on this ticket:
git checkout feature/AzureTicketBranch-11530'

Shall I proceed? (y/n)"
```

This commenting system ensures professional communication and progress tracking throughout the development lifecycle. 