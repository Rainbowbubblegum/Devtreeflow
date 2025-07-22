# Azure DevOps Search Context

## 🔍 **WORK ITEM SEARCH & DISCOVERY**

This file contains all the search capabilities, WIQL queries, and filtering options for finding Azure DevOps work items.

---

## 🎯 **BASIC SEARCH COMMANDS**

### **Simple Text Search**
```bash
# Search by title
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.Title] CONTAINS '{SEARCH_TERM}'"

# Search by description
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.Description] CONTAINS '{SEARCH_TERM}'"

# Search across multiple fields
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.Title] CONTAINS '{SEARCH_TERM}' OR [System.Description] CONTAINS '{SEARCH_TERM}'"
```

### **Status and Type Filtering**
```bash
# Active items only
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.State] = 'Active'"

# Bugs only
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.WorkItemType] = 'Bug'"

# User stories only
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.WorkItemType] = 'User Story'"

# All active bugs
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.WorkItemType] = 'Bug' AND [System.State] = 'Active'"
```

### **Assignment and People Filtering**
```bash
# Assigned to specific person
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.AssignedTo] = 'user@domain.com'"

# Assigned to current user
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.AssignedTo] = @Me"

# Unassigned items
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.AssignedTo] = ''"

# Created by specific person
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.CreatedBy] = 'user@domain.com'"
```

---

## 📅 **DATE-BASED SEARCHES**

### **Recent Activity**
```bash
# Items modified in last 7 days
az boards query --wiql "SELECT [System.Id], [System.Title], [System.ChangedDate] FROM WorkItems WHERE [System.ChangedDate] >= @Today-7"

# Items created this week
az boards query --wiql "SELECT [System.Id], [System.Title], [System.CreatedDate] FROM WorkItems WHERE [System.CreatedDate] >= @StartOfWeek"

# Items created today
az boards query --wiql "SELECT [System.Id], [System.Title], [System.CreatedDate] FROM WorkItems WHERE [System.CreatedDate] >= @Today"

# Items resolved in last month
az boards query --wiql "SELECT [System.Id], [System.Title], [System.ResolvedDate] FROM WorkItems WHERE [System.ResolvedDate] >= @Today-30"
```

### **Date Range Searches**
```bash
# Items created between specific dates
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.CreatedDate] >= '2024-01-01' AND [System.CreatedDate] <= '2024-12-31'"

# Items modified this month
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.ChangedDate] >= @StartOfMonth"
```

---

## 🏷️ **PRIORITY AND SEVERITY SEARCHES**

### **High Priority Items**
```bash
# Critical priority (1)
az boards query --wiql "SELECT [System.Id], [System.Title], [Microsoft.VSTS.Common.Priority] FROM WorkItems WHERE [Microsoft.VSTS.Common.Priority] = 1"

# High priority (1-2)
az boards query --wiql "SELECT [System.Id], [System.Title], [Microsoft.VSTS.Common.Priority] FROM WorkItems WHERE [Microsoft.VSTS.Common.Priority] <= 2"

# Critical severity bugs
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.WorkItemType] = 'Bug' AND [Microsoft.VSTS.Common.Severity] = 'Critical'"
```

### **Tag-Based Filtering**
```bash
# Items with specific tag
az boards query --wiql "SELECT [System.Id], [System.Title], [System.Tags] FROM WorkItems WHERE [System.Tags] CONTAINS 'urgent'"

# Items with multiple tags
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.Tags] CONTAINS 'bug' AND [System.Tags] CONTAINS 'critical'"

# Items tagged for release
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.Tags] CONTAINS 'ready-for-deployment'"
```

---

## 📊 **ADVANCED WIQL QUERIES**

### **Complex Filtering**
```sql
-- Bugs created this week with high priority
SELECT [System.Id], [System.Title], [System.CreatedDate], [Microsoft.VSTS.Common.Priority]
FROM WorkItems 
WHERE [System.WorkItemType] = 'Bug'
  AND [System.CreatedDate] >= @StartOfWeek
  AND [Microsoft.VSTS.Common.Priority] <= 2

-- Active user stories in current iteration
SELECT [System.Id], [System.Title], [System.IterationPath]
FROM WorkItems 
WHERE [System.WorkItemType] = 'User Story'
  AND [System.State] = 'Active'
  AND [System.IterationPath] = @CurrentIteration

-- Items assigned to team with no activity in 30 days
SELECT [System.Id], [System.Title], [System.AssignedTo], [System.ChangedDate]
FROM WorkItems 
WHERE [System.AssignedTo] <> ''
  AND [System.ChangedDate] < @Today-30
  AND [System.State] IN ('Active', 'New')
```

### **Release Planning Queries**
```sql
-- Items ready for deployment
SELECT [System.Id], [System.Title], [System.State]
FROM WorkItems 
WHERE [System.State] IN ('Resolved', 'Closed')
  AND [System.Tags] CONTAINS 'ready-for-deployment'
  AND [System.ResolvedDate] >= @Today-14

-- Completed work in iteration
SELECT [System.Id], [System.Title], [Microsoft.VSTS.Scheduling.StoryPoints]
FROM WorkItems 
WHERE [System.IterationPath] = 'ProjectName\Iteration 1'
  AND [System.State] = 'Closed'

-- Blocked or waiting items
SELECT [System.Id], [System.Title], [System.Reason]
FROM WorkItems 
WHERE [System.Reason] IN ('Blocked', 'Waiting for input')
   OR [System.Tags] CONTAINS 'blocked'
```

---

## 🎯 **PROJECT-SPECIFIC SEARCHES**

### **Search Templates by Project Context**
Use project configuration from `azure-projects/{PROJECT}/config.md` to customize searches:

#### **MyCarMatch Example Searches**
```sql
-- MyCarMatch dealer registration issues
SELECT [System.Id], [System.Title], [System.State]
FROM WorkItems 
WHERE ([System.Title] CONTAINS 'dealer registration' 
   OR [System.Description] CONTAINS 'dealer registration')
  AND [System.AreaPath] UNDER 'MyCarMatch'

-- MyCarMatch bugs in production
SELECT [System.Id], [System.Title], [Custom.Environment]
FROM WorkItems 
WHERE [System.WorkItemType] = 'Bug'
  AND [Custom.Environment] = 'Production'
  AND [System.AreaPath] UNDER 'MyCarMatch'

-- MyCarMatch vehicle search features
SELECT [System.Id], [System.Title], [System.State]
FROM WorkItems 
WHERE ([System.Title] CONTAINS 'vehicle search' 
   OR [System.Title] CONTAINS 'car search')
  AND [System.WorkItemType] = 'User Story'
```

---

## 🔧 **SEARCH AUTOMATION SCRIPTS**

### **Batch Search Script**
Create `search-work-items.bat`:
```bat
@echo off
setlocal enabledelayedexpansion

if "%1"=="" (
    echo Usage: search-work-items.bat "search term" [type] [state]
    echo Example: search-work-items.bat "login" Bug Active
    exit /b 1
)

set SEARCH_TERM=%1
set WORK_ITEM_TYPE=%2
set STATE=%3

if "%WORK_ITEM_TYPE%"=="" set WORK_ITEM_TYPE=*
if "%STATE%"=="" set STATE=*

echo Searching for: %SEARCH_TERM%
echo Type filter: %WORK_ITEM_TYPE%
echo State filter: %STATE%
echo.

REM Build WIQL query
set QUERY=SELECT [System.Id], [System.Title], [System.State], [System.WorkItemType] FROM WorkItems WHERE [System.Title] CONTAINS '%SEARCH_TERM%'

if not "%WORK_ITEM_TYPE%"=="*" (
    set QUERY=!QUERY! AND [System.WorkItemType] = '%WORK_ITEM_TYPE%'
)

if not "%STATE%"=="*" (
    set QUERY=!QUERY! AND [System.State] = '%STATE%'
)

echo Executing query: !QUERY!
echo.

az boards query --wiql "!QUERY!" --output table
```

### **PowerShell Advanced Search**
```powershell
# advanced-search.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$SearchTerm,
    
    [string]$WorkItemType = "",
    [string]$State = "",
    [string]$AssignedTo = "",
    [int]$DaysBack = 0,
    [string]$Priority = "",
    [string]$Tags = ""
)

# Build WIQL query dynamically
$conditions = @()
$conditions += "[System.Title] CONTAINS '$SearchTerm' OR [System.Description] CONTAINS '$SearchTerm'"

if ($WorkItemType) { $conditions += "[System.WorkItemType] = '$WorkItemType'" }
if ($State) { $conditions += "[System.State] = '$State'" }
if ($AssignedTo) { $conditions += "[System.AssignedTo] = '$AssignedTo'" }
if ($DaysBack -gt 0) { $conditions += "[System.ChangedDate] >= @Today-$DaysBack" }
if ($Priority) { $conditions += "[Microsoft.VSTS.Common.Priority] = $Priority" }
if ($Tags) { $conditions += "[System.Tags] CONTAINS '$Tags'" }

$whereClause = $conditions -join " AND "
$query = "SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo] FROM WorkItems WHERE $whereClause"

Write-Host "Executing search query:"
Write-Host $query
Write-Host ""

# Execute query
$results = az boards query --wiql $query --output json | ConvertFrom-Json

if ($results.workItems.Count -eq 0) {
    Write-Host "No work items found matching your criteria."
} else {
    Write-Host "Found $($results.workItems.Count) work items:"
    Write-Host ""
    
    foreach ($item in $results.workItems) {
        $details = az boards work-item show --id $item.id --query "fields.['System.Title', 'System.State', 'System.AssignedTo']" --output json | ConvertFrom-Json
        Write-Host "ID: $($item.id)"
        Write-Host "Title: $($details.'System.Title')"
        Write-Host "State: $($details.'System.State')"
        Write-Host "Assigned: $($details.'System.AssignedTo')"
        Write-Host "---"
    }
}
```

---

## 📈 **SEARCH RESULT PROCESSING**

### **Output Formats**
```bash
# Table format (readable)
az boards query --wiql "{QUERY}" --output table

# JSON format (detailed)
az boards query --wiql "{QUERY}" --output json

# TSV format (machine readable)
az boards query --wiql "{QUERY}" --output tsv

# YAML format (structured)
az boards query --wiql "{QUERY}" --output yaml
```

### **Result Analysis**
```bash
# Count results
az boards query --wiql "{QUERY}" --output json | jq '.workItems | length'

# Extract specific fields
az boards query --wiql "{QUERY}" --output json | jq -r '.workItems[].id'

# Filter and sort results
az boards query --wiql "{QUERY}" --output json | jq '.workItems | sort_by(.id)'
```

---

## 🎯 **SEARCH BEST PRACTICES**

### **Performance Optimization**
- **Use specific fields** in SELECT clause to reduce data transfer
- **Add date ranges** to limit result sets
- **Filter by area/iteration** to focus on relevant items
- **Use indexes fields** (System.Id, System.State, System.WorkItemType)

### **Search Strategies**
- **Start broad, then narrow** - begin with general terms, add filters
- **Use multiple search terms** - try synonyms and variations
- **Check different fields** - title, description, comments, tags
- **Consider project context** - use project-specific terminology

### **Common Search Scenarios**
```sql
-- Find all items related to a feature
SELECT [System.Id], [System.Title] 
FROM WorkItems 
WHERE [System.Title] CONTAINS 'feature-name' 
   OR [System.Tags] CONTAINS 'feature-name'
   OR [System.Description] CONTAINS 'feature-name'

-- Find items for code review
SELECT [System.Id], [System.Title], [System.State]
FROM WorkItems 
WHERE [System.Tags] CONTAINS 'code-review'
   OR [System.State] = 'Ready for Review'

-- Find technical debt items
SELECT [System.Id], [System.Title], [Microsoft.VSTS.Common.Priority]
FROM WorkItems 
WHERE [System.Tags] CONTAINS 'technical-debt'
   OR [System.Title] CONTAINS 'refactor'
   OR [System.Title] CONTAINS 'cleanup'
```

---

## 🚀 **AI ASSISTANT SEARCH WORKFLOW**

### **Intelligent Search Process**
```
1. Parse user search intent and keywords
2. Detect project context using azure-flags-context.md
3. Load project configuration for context-aware searching
4. Build appropriate WIQL query based on intent
5. Execute search and process results
6. Offer to analyze specific work items from results
7. Provide direct links to Azure DevOps for each result
```

### **Search Intent Detection**
```javascript
const searchIntents = {
  // General searches
  "find bugs about login" → Bug search with login keyword
  "show me active stories" → User Story search with Active state
  "what tickets are assigned to me" → AssignedTo = @Me search
  
  // Recent activity
  "recent changes" → ChangedDate >= @Today-7
  "what's new this week" → CreatedDate >= @StartOfWeek
  "show latest resolved items" → ResolvedDate >= @Today-7
  
  // Priority/severity
  "critical bugs" → Bug + Priority = 1 or Severity = Critical
  "high priority items" → Priority <= 2
  "urgent issues" → Tags CONTAINS urgent or Priority = 1
  
  // Project-specific
  "dealer registration issues" → MyCarMatch context + dealer registration keywords
  "car search problems" → MyCarMatch context + vehicle/car search keywords
}
```

### **Result Presentation**
```
Search Results for "{search_term}":

Found {count} work items:

1. **#{id}**: {title}
   - **Type**: {workItemType} | **State**: {state} | **Priority**: {priority}
   - **Assigned**: {assignedTo}
   - **Link**: [View in Azure DevOps]({direct_link})

2. **#{id}**: {title}
   - **Type**: {workItemType} | **State**: {state} | **Priority**: {priority}
   - **Assigned**: {assignedTo}
   - **Link**: [View in Azure DevOps]({direct_link})

Would you like me to analyze any of these work items in detail?
```

This search system provides comprehensive discovery capabilities while maintaining project context and user-friendly results. 