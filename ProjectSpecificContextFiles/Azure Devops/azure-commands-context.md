# Azure DevOps Commands Context

## ⚙️ **CRITICAL CONFIGURATION**
```
ORGANIZATION_URL: https://dev.azure.com/datasolve
PROJECT_NAME: MyCarMatch  
PROJECT_GUID: 86f6b58b-4c8b-4e38-9483-40b5a96636e7
DEFAULT_BASE_BRANCH: develop
TEST_TICKET_ID: 11530
```

## 🚨 **CRITICAL RULES - READ FIRST**
```
MOST RELIABLE APPROACH FOR AZURE INTEGRATION:
Always use the basic batch file approach first - it's the most reliable and avoids console buffer issues.

WORKING EXAMPLE:
@echo off
echo Adding comment to ticket #11354...
az boards work-item update --id 11354 --discussion "your comment here"
echo.
echo Adding comment to ticket #11680...
az boards work-item update --id 11680 --discussion "your comment here"

DO NOT FIRST USE:
❌ Direct PowerShell REST API calls
❌ Complex WIQL queries in PowerShell
❌ Direct CURL commands
❌ PowerShell scripts for simple operations

Fallback to these methods of integration when batch file approach fails.

MANDATORY SETUP VERIFICATION:
1. Check Configuration:
   - Verify all values in CRITICAL CONFIGURATION section
   - If any are missing, use auto-detection or request configuration
   
2. Test Connection:
   - Run: az boards work-item show --id {TEST_TICKET_ID} --output json
   - If fails, follow Setup Guide
   
3. Auto-Detect (if needed):
   - Use git remote -v to detect organization and project
   - Update configuration values accordingly

ALWAYS_USE_THESE_APPROACHES:
1. For work item queries:
   - FIRST try simple batch file approach with basic az boards commands
   - If more complex operations needed, THEN use query-mcm-items.ps1
   - AVOID complex WIQL queries in PowerShell/Command Prompt
   - NEVER start with direct PowerShell REST calls or CURL

2. Most reliable approach:
   Step 1: Create simple batch file
   - Use basic az boards commands
   - One command per line
   - Add echo statements for clarity
   
   Step 2: Execute batch file
   - Run directly with .\your-batch-file.bat
   - Check output for success/failure

3. Error Handling Protocol:
   When encountering issues:
   a) Always start with basic batch approach
   b) Check configuration values
   c) Test connection with TEST_TICKET_ID
   d) Follow appropriate recovery steps
   e) Verify success after recovery
```

## 🎯 **COMMAND REFERENCE GUIDE**

This file contains all the command templates, batch files, and CURL examples for Azure DevOps operations.

---

## 📋 **CORE AZURE CLI COMMANDS**

### **Work Item Operations**
```bash
# Get work item details
az boards work-item show --id {TICKET_ID} --output json

# Update work item
az boards work-item update --id {TICKET_ID} --title "New Title" --description "New Description"

# Add comment to work item
az boards work-item update --id {TICKET_ID} --discussion "Your comment here"

# Create work item
az boards work-item create --title "New Item" --type "Bug" --description "Description"

# List work item types
az boards work-item type list --output table
```

### **Query Operations**
```bash
# Basic query
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems"

# Search by title
az boards query --wiql "SELECT [System.Id] FROM WorkItems WHERE [System.Title] CONTAINS 'keyword'"

# Filter by state
az boards query --wiql "SELECT [System.Id] FROM WorkItems WHERE [System.State] = 'Active'"

# Filter by assignee
az boards query --wiql "SELECT [System.Id] FROM WorkItems WHERE [System.AssignedTo] = 'user@domain.com'"

# Filter by work item type
az boards query --wiql "SELECT [System.Id] FROM WorkItems WHERE [System.WorkItemType] = 'Bug'"

# Recent items
az boards query --wiql "SELECT [System.Id] FROM WorkItems WHERE [System.ChangedDate] >= @Today-7"
```

### **Project Operations**
```bash
# List projects
az devops project list --output table

# Show project details
az devops project show --project {PROJECT_NAME} --output json

# List team members
az devops team list --project {PROJECT_NAME} --output table
```

---

## 📁 **BATCH FILE TEMPLATES**

### **Basic Ticket Analysis Batch**
Create `analyze-ticket.bat`:
```bat
@echo off
setlocal enabledelayedexpansion

if "%1"=="" (
    echo Usage: analyze-ticket.bat [TICKET_ID]
    echo Example: analyze-ticket.bat 12345
    exit /b 1
)

set TICKET_ID=%1

echo Analyzing Azure DevOps ticket #%TICKET_ID%...
echo.

REM Get ticket details
az boards work-item show --id %TICKET_ID% --output json > ticket_%TICKET_ID%.json

if %errorlevel% neq 0 (
    echo Error: Could not retrieve ticket #%TICKET_ID%
    echo Check if ticket exists and you have access
    exit /b 1
)

echo Ticket #%TICKET_ID% details saved to ticket_%TICKET_ID%.json
echo Analysis complete!

REM Optional: Open in browser
start https://dev.azure.com/{ORGANIZATION}/{PROJECT}/_workitems/edit/%TICKET_ID%
```

### **Ticket Comment Batch**
Create `add-comment.bat`:
```bat
@echo off
setlocal enabledelayedexpansion

if "%1"=="" (
    echo Usage: add-comment.bat [TICKET_ID] "Comment text"
    echo Example: add-comment.bat 12345 "Work in progress"
    exit /b 1
)

if "%2"=="" (
    echo Error: Comment text required
    echo Usage: add-comment.bat [TICKET_ID] "Comment text"
    exit /b 1
)

set TICKET_ID=%1
set COMMENT=%2

echo Adding comment to ticket #%TICKET_ID%...
az boards work-item update --id %TICKET_ID% --discussion %COMMENT%

if %errorlevel% eq 0 (
    echo Comment added successfully to ticket #%TICKET_ID%
) else (
    echo Error: Failed to add comment to ticket #%TICKET_ID%
)
```

### **Ticket Search Batch**
Create `search-tickets.bat`:
```bat
@echo off
setlocal enabledelayedexpansion

if "%1"=="" (
    echo Usage: search-tickets.bat "search term"
    echo Example: search-tickets.bat "login bug"
    exit /b 1
)

set SEARCH_TERM=%1

echo Searching for tickets containing: %SEARCH_TERM%
echo.

REM Search in titles
az boards query --wiql "SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.Title] CONTAINS '%SEARCH_TERM%'" --output table

echo.
echo Search complete!
```

### **Project Info Batch**
Create `project-info.bat`:
```bat
@echo off
echo Azure DevOps Project Information
echo ================================

REM Show current configuration
echo Current Azure DevOps Configuration:
az devops configure --list

echo.
echo Available Projects:
az devops project list --output table

echo.
echo Team Information:
az devops team list --output table
```

---

## 🌐 **CURL EXAMPLES**

### **REST API Authentication**
```bash
# Get access token
TOKEN=$(az account get-access-token --query accessToken --output tsv)

# Use token in CURL requests
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     https://dev.azure.com/{ORGANIZATION}/{PROJECT}/_apis/wit/workitems/{ID}?api-version=6.0
```

### **Get Work Item via CURL**
```bash
# PowerShell version
$token = az account get-access-token --query accessToken --output tsv
$headers = @{Authorization="Bearer $token"; "Content-Type"="application/json"}
$url = "https://dev.azure.com/{ORGANIZATION}/{PROJECT}/_apis/wit/workitems/{ID}?api-version=6.0"

Invoke-RestMethod -Uri $url -Headers $headers -Method GET
```

### **Download Attachment via CURL**
```bash
# PowerShell script for downloading attachments
$attachmentId = "{ATTACHMENT_ID}"
$projectId = "{PROJECT_GUID}"
$orgUrl = "{ORGANIZATION_URL}"
$url = "$orgUrl/$projectId/_apis/wit/attachments/$attachmentId?api-version=6.0"

$token = az account get-access-token --query accessToken --output tsv
$headers = @{Authorization="Bearer $token"}

Invoke-RestMethod -Uri $url -Headers $headers -OutFile "attachment_$attachmentId.png"
Write-Host "Downloaded attachment to attachment_$attachmentId.png"
```

### **Add Work Item Comment via CURL**
```bash
# PowerShell version
$token = az account get-access-token --query accessToken --output tsv
$headers = @{Authorization="Bearer $token"; "Content-Type"="application/json-patch+json"}
$url = "https://dev.azure.com/{ORGANIZATION}/{PROJECT}/_apis/wit/workitems/{ID}?api-version=6.0"

$body = @(
    @{
        op = "add"
        path = "/fields/System.History"
        value = "Your comment text here"
    }
) | ConvertTo-Json

Invoke-RestMethod -Uri $url -Headers $headers -Method PATCH -Body $body
```

---

## 🔧 **DYNAMIC SCRIPT GENERATION**

### **PowerShell Script Templates**

#### **Image Download Script Template**
```powershell
# download-attachments.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$TicketId,
    
    [Parameter(Mandatory=$true)]
    [string]$ProjectGuid,
    
    [Parameter(Mandatory=$true)]
    [string]$OrganizationUrl
)

# Get work item details
$workItemJson = az boards work-item show --id $TicketId --output json | ConvertFrom-Json

# Extract attachment IDs from ReproSteps field
$reproSteps = $workItemJson.fields.'Microsoft.VSTS.TCM.ReproSteps'

if ($reproSteps) {
    # Find attachment URLs in the HTML content
    $attachmentPattern = '/_apis/wit/attachments/([a-f0-9-]+)\?fileName=([^"]+)'
    $matches = [regex]::Matches($reproSteps, $attachmentPattern)
    
    $attachmentCount = 0
    foreach ($match in $matches) {
        $attachmentId = $match.Groups[1].Value
        $fileName = $match.Groups[2].Value
        $attachmentCount++
        
        Write-Host "Downloading attachment $attachmentCount`: $fileName"
        
        # Download attachment
        $url = "$OrganizationUrl/$ProjectGuid/_apis/wit/attachments/$attachmentId"
        $token = az account get-access-token --query accessToken --output tsv
        $headers = @{Authorization="Bearer $token"}
        
        $outputFile = "attachment$attachmentCount.png"
        Invoke-RestMethod -Uri $url -Headers $headers -OutFile $outputFile
        
        Write-Host "Saved as: $outputFile"
    }
    
    Write-Host "Downloaded $attachmentCount attachments"
} else {
    Write-Host "No attachments found in ticket #$TicketId"
}
```

#### **Batch Work Item Processing**
```powershell
# process-work-items.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$Query
)

# Execute WIQL query
$queryResult = az boards query --wiql $Query --output json | ConvertFrom-Json

Write-Host "Found $($queryResult.workItems.Count) work items"

foreach ($workItem in $queryResult.workItems) {
    $id = $workItem.id
    Write-Host "Processing work item #$id..."
    
    # Get detailed work item information
    $details = az boards work-item show --id $id --output json | ConvertFrom-Json
    
    Write-Host "  Title: $($details.fields.'System.Title')"
    Write-Host "  State: $($details.fields.'System.State')"
    Write-Host "  Type: $($details.fields.'System.WorkItemType')"
    Write-Host ""
}
```

---

## 📊 **ADVANCED WIQL QUERIES**

### **Common Query Patterns**
```sql
-- All active bugs assigned to current user
SELECT [System.Id], [System.Title], [System.AssignedTo] 
FROM WorkItems 
WHERE [System.WorkItemType] = 'Bug' 
AND [System.State] = 'Active' 
AND [System.AssignedTo] = @Me

-- Recently modified items
SELECT [System.Id], [System.Title], [System.ChangedDate]
FROM WorkItems 
WHERE [System.ChangedDate] >= @Today-7
ORDER BY [System.ChangedDate] DESC

-- Items by iteration
SELECT [System.Id], [System.Title], [System.IterationPath]
FROM WorkItems 
WHERE [System.IterationPath] UNDER 'ProjectName\Iteration 1'

-- Items with specific tag
SELECT [System.Id], [System.Title], [System.Tags]
FROM WorkItems 
WHERE [System.Tags] CONTAINS 'urgent'

-- Items without assignee
SELECT [System.Id], [System.Title], [System.AssignedTo]
FROM WorkItems 
WHERE [System.AssignedTo] = ''

-- Items by area path
SELECT [System.Id], [System.Title], [System.AreaPath]
FROM WorkItems 
WHERE [System.AreaPath] UNDER 'ProjectName\ComponentName'
```

### **Complex Filtering Examples**
```sql
-- Bugs created this week with high priority
SELECT [System.Id], [System.Title], [System.CreatedDate], [Microsoft.VSTS.Common.Priority]
FROM WorkItems 
WHERE [System.WorkItemType] = 'Bug'
AND [System.CreatedDate] >= @StartOfWeek
AND [Microsoft.VSTS.Common.Priority] <= 2

-- Stories ready for deployment
SELECT [System.Id], [System.Title], [System.State]
FROM WorkItems 
WHERE [System.WorkItemType] = 'User Story'
AND [System.State] IN ('Resolved', 'Closed')
AND [System.Tags] CONTAINS 'ready-for-deployment'

-- Items blocked or waiting
SELECT [System.Id], [System.Title], [System.Reason]
FROM WorkItems 
WHERE [System.Reason] IN ('Blocked', 'Waiting for input')
OR [System.Tags] CONTAINS 'blocked'
```

---

## 🎯 **COMMAND EXECUTION BEST PRACTICES**

### **Error Handling**
```bash
# Always check command exit codes
az boards work-item show --id 12345 --output json
if [ $? -ne 0 ]; then
    echo "Error: Failed to retrieve work item"
    exit 1
fi

# Use try-catch in PowerShell
try {
    $result = az boards work-item show --id 12345 --output json | ConvertFrom-Json
    Write-Host "Successfully retrieved work item: $($result.fields.'System.Title')"
} catch {
    Write-Host "Error: $_"
}
```

### **Output Formatting**
```bash
# Table format for lists
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems" --output table

# JSON for detailed processing
az boards work-item show --id 12345 --output json

# TSV for single values
az boards work-item show --id 12345 --query "fields.['System.Title']" --output tsv

# YAML for readable structure
az boards work-item show --id 12345 --output yaml
```

### **Batch Processing**
```bash
# Process multiple work items
for id in 12345 12346 12347; do
    echo "Processing work item #$id"
    az boards work-item show --id $id --query "fields.['System.Title']" --output tsv
done

# PowerShell array processing
$workItemIds = @(12345, 12346, 12347)
foreach ($id in $workItemIds) {
    Write-Host "Processing work item #$id"
    $title = az boards work-item show --id $id --query "fields.['System.Title']" --output tsv
    Write-Host "  Title: $title"
}
```

---

## 🔗 **INTEGRATION COMMANDS**

### **Git Integration**
```bash
# Link commit to work item
git commit -m "Fix login issue - resolves #12345"

# Create branch for work item
git checkout -b feature/AzureTicketBranch-12345

# Extract work item ID from branch name
BRANCH_NAME=$(git branch --show-current)
WORK_ITEM_ID=$(echo $BRANCH_NAME | grep -o '[0-9]\{4,6\}')
echo "Working on ticket #$WORK_ITEM_ID"
```

### **Browser Integration**
```bash
# Open work item in browser (Windows)
start https://dev.azure.com/{ORGANIZATION}/{PROJECT}/_workitems/edit/12345

# Open work item in browser (Linux/Mac)
open https://dev.azure.com/{ORGANIZATION}/{PROJECT}/_workitems/edit/12345

# Open board view
start https://dev.azure.com/{ORGANIZATION}/{PROJECT}/_boards/board/t/Team/Stories?workitem=12345
```

---

## 📝 **COMMAND TEMPLATES FOR AI USAGE**

### **Standard Analysis Command**
```bash
# Template for AI to use
az boards work-item show --id {TICKET_ID} --output json | jq .
```

### **Search Command Template**
```bash
# Template for AI to use
az boards query --wiql "SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.Title] CONTAINS '{SEARCH_TERM}'" --output table
```

### **Comment Addition Template**
```bash
# Template for AI to use
az boards work-item update --id {TICKET_ID} --discussion "{COMMENT_TEXT}"
```

**Note**: Replace {TICKET_ID}, {SEARCH_TERM}, {COMMENT_TEXT}, {ORGANIZATION}, {PROJECT}, etc. with actual values when using these templates. 

## 🔧 **HANDLING CONSOLE BUFFER ISSUES**

### **Common PowerShell Console Issues**
When encountering `System.ArgumentOutOfRangeException` related to console buffer size:

1. **Direct PowerShell Script Approach (Most Reliable)**
```powershell
# Create script.ps1:
$token = & az account get-access-token --query accessToken --output tsv
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Execute WIQL query via REST API
$wiql = @{
    query = "YOUR_WIQL_QUERY_HERE"
}
$url = "https://dev.azure.com/datasolve/MyCarMatch/_apis/wit/wiql?api-version=6.0"
$result = Invoke-RestMethod -Uri $url -Headers $headers -Method Post -Body ($wiql | ConvertTo-Json)

# Process results
foreach ($item in $result.workItems) {
    $itemUrl = "https://dev.azure.com/datasolve/MyCarMatch/_apis/wit/workitems/$($item.id)?api-version=6.0"
    $details = Invoke-RestMethod -Uri $itemUrl -Headers $headers -Method Get
    # Process item details...
}
```

2. **Batch File with PowerShell (Alternative Approach)**
```batch
@echo off
REM Get token first
for /f "tokens=* USEBACKQ" %%F in (`az account get-access-token --query accessToken --output tsv`) do set TOKEN=%%F

REM Create temporary PowerShell script
echo $token = "%TOKEN%" > temp.ps1
echo $headers = @{Authorization="Bearer $token"; "Content-Type"="application/json"} >> temp.ps1
REM Add rest of PowerShell script...

REM Execute and clean up
powershell -ExecutionPolicy Bypass -File temp.ps1
del temp.ps1
```

3. **REST API Direct Calls (Most Stable)**
- Use REST API calls instead of az CLI commands for complex queries
- Handle results in smaller chunks if needed
- Use proper error handling and retry logic

### **Best Practices for Reliable Azure DevOps Operations**

1. **Prefer REST API Over CLI**
   - More stable for complex queries
   - Better error handling
   - Not affected by console buffer issues

2. **Use Temporary Files**
   - Write output to files instead of console
   - Process results in chunks
   - Clean up temporary files after use

3. **Error Handling**
   - Implement proper try-catch blocks
   - Log errors to file instead of console
   - Add retry logic for network issues

4. **Output Formatting**
   - Use structured output (JSON/CSV)
   - Process and format data in code
   - Avoid large console outputs 