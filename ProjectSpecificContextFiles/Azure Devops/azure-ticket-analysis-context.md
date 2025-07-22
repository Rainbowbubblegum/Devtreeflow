# Azure DevOps Ticket Analysis Context

## 🎯 **COMPREHENSIVE TICKET ANALYSIS**

This file contains the complete workflow for analyzing Azure DevOps work items with full context, visual evidence, and business impact assessment.

---

## 📋 **STANDARD ANALYSIS WORKFLOW**

### **Step 1: Execute Core Command**
```bash
# Primary command for ticket analysis
az boards work-item show --id {TICKET_ID} --output json
```

### **Step 2: Parse JSON Response**
Extract all available fields from the JSON response:
- **Core Fields**: ID, Title, Type, State, Priority, Severity
- **People & Dates**: Assigned To, Created By, Resolved By, timestamps
- **Technical Details**: Environment, Effort, Iteration, Value Area
- **Progress**: Completed Work, Board Column, Resolution Reason
- **Content**: Description, Reproduction Steps, Acceptance Criteria
- **Comments**: Full comment history with focus on latest updates

### **Step 3: Image Analysis Process**
1. **Detect Attachments**: Scan `Microsoft.VSTS.TCM.ReproSteps` field for attachment URLs
2. **Extract Attachment IDs**: Parse attachment URLs using regex pattern
3. **Download Images**: Create PowerShell script to download each attachment
4. **Analyze Content**: Describe image content and context for PNG/JPG files
5. **Handle Non-Analyzable Media**: Note GIFs, videos with clarification request

### **Step 4: Business Impact Assessment**
- Explain what the issue means for business/users
- Assess current risk level and ongoing impact
- Provide recommendations based on ticket status and priority

### **Step 5: Generate Comprehensive Report**
Use the complete analysis template with all sections included

---

## 🖼️ **IMAGE ANALYSIS CAPABILITIES**

### **Supported Image Types**
- ✅ **PNG, JPG, JPEG**: Full visual analysis and description
- ✅ **Screenshots**: Describes UI elements, error messages, form fields
- ✅ **Static Images**: Relates image content to ticket description

### **PowerShell Image Download Script Template**
```powershell
# Dynamic script generation for each ticket
param(
    [string]$TicketId = "{TICKET_ID}",
    [string]$ProjectGuid = "{PROJECT_GUID}",
    [string]$OrganizationUrl = "{ORGANIZATION_URL}"
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
        
        Write-Host "Downloaded: $outputFile ($((Get-Item $outputFile).Length) bytes)"
    }
    
    Write-Host "Total attachments downloaded: $attachmentCount"
} else {
    Write-Host "No attachments found in ticket #$TicketId"
}
```

### **Non-Analyzable Media Handling**
For GIFs, videos, and other media types:

#### **Enhanced Media Workflow**
1. ✅ **Download the media file** (if possible)
2. ✅ **Provide complete media details** (type, size, name, attachment ID)
3. ✅ **Include direct link** to the media in Azure DevOps
4. ✅ **Request clarification** using specific format
5. ✅ **CONTINUE processing** - do NOT stop ticket analysis
6. ✅ **Complete full ticket analysis** with media notation

#### **Media Clarification Format**
```
🎬 **Non-Analyzable Media Detected:**
- **File**: demo-video.gif (245,678 bytes)
- **Type**: Animated GIF
- **Azure Link**: [Direct link to attachment]
- **Context**: Attached to demonstrate the issue reproduction

⚠️ **Clarification Needed**: I encountered an animated GIF that shows the issue reproduction. To provide complete analysis, could you describe what this animation demonstrates or take a screenshot of key frames?

[CONTINUE WITH FULL TICKET ANALYSIS...]
```

---

## 📊 **COMPREHENSIVE ANALYSIS TEMPLATE**

### **Complete Response Format**
```
Ticket #{ID}: "{Title}"

📋 **Full Work Item Details:**
- **Type**: {WorkItemType} ({Severity if applicable})
- **Status**: {State} ({Resolution Reason if resolved})
- **Priority**: {Priority} ({Priority Level}/4)
- **Assigned To**: {AssignedTo} ({Email if available})
- **Created By**: {CreatedBy} ({CreatedDate})
- **Environment**: {Environment Found}
- **Effort**: {Effort Level}
- **Iteration**: {Iteration Path}
- **Value Area**: {Value Area}
- **Completed Work**: {Completed Work}%
- **Board Column**: {Board Column}
- **Stack Rank**: {Stack Rank}

📝 **Description & Reproduction Steps:**
'{Full description and acceptance criteria}'

💬 **Comments & Activity:**
{Complete comment history with focus on latest updates}
- **Latest Activity**: {Most recent comment date and author}
- **Key Updates**: {Important status changes and decisions}

📸 **Visual Evidence Analysis:**
{For each image attachment:}
- **Image {N}** ({file size} bytes): {Detailed description of image content and context}

🎬 **Non-Analyzable Media:** {If applicable}
{Media files that couldn't be analyzed with clarification request}

🎯 **Business Impact:**
{Explanation of business/user impact and implications}

🔗 **Direct Access**: {Azure DevOps URL}

✅ **Risk Assessment**: {Current risk level and ongoing impact analysis}
```

---

## 🔍 **FIELD EXTRACTION GUIDE**

### **Core System Fields**
```json
{
  "System.Id": "Work item ID",
  "System.Title": "Work item title",
  "System.WorkItemType": "Bug, User Story, Task, Epic, etc.",
  "System.State": "New, Active, Resolved, Closed, etc.",
  "System.Reason": "State reason (Approved, Fixed, etc.)",
  "System.AssignedTo": "Current assignee",
  "System.CreatedBy": "Original creator",
  "System.CreatedDate": "Creation timestamp",
  "System.ChangedBy": "Last modifier",
  "System.ChangedDate": "Last modification timestamp",
  "System.ResolvedBy": "Person who resolved",
  "System.ResolvedDate": "Resolution timestamp",
  "System.ClosedBy": "Person who closed",
  "System.ClosedDate": "Closure timestamp"
}
```

### **VSTS Specific Fields**
```json
{
  "Microsoft.VSTS.Common.Priority": "Priority level 1-4",
  "Microsoft.VSTS.Common.Severity": "Critical, High, Medium, Low",
  "Microsoft.VSTS.Common.ValueArea": "Business or Architectural",
  "Microsoft.VSTS.Scheduling.Effort": "Story points or effort",
  "Microsoft.VSTS.Scheduling.StoryPoints": "Story points",
  "Microsoft.VSTS.Scheduling.CompletedWork": "Completed work hours",
  "Microsoft.VSTS.TCM.ReproSteps": "Reproduction steps (contains attachments)",
  "Microsoft.VSTS.Common.AcceptanceCriteria": "Acceptance criteria",
  "System.BoardColumn": "Current board column",
  "System.BoardColumnDone": "Board column completion status"
}
```

### **Custom Fields (Project-Specific)**
```json
{
  "Custom.Environment": "Environment where found",
  "Custom.BugEffort": "Bug effort classification",
  "System.IterationPath": "Sprint/iteration path",
  "System.AreaPath": "Area/team path",
  "System.Tags": "Work item tags",
  "System.CommentCount": "Number of comments",
  "System.History": "Latest comment/history entry"
}
```

---

## 🎯 **ANALYSIS BEST PRACTICES**

### **Maximum Context Philosophy**
- **NEVER summarize away important details**
- **ALWAYS include all available fields and metadata**
- **PROVIDE FULL BUSINESS CONTEXT** - explain why it matters
- **INCLUDE TECHNICAL SPECIFICS** - environments, efforts, iterations
- **SHOW COMPLETE TIMELINE** - who did what when
- **ANALYZE VISUAL EVIDENCE** - describe images in detail with context

### **Visual Analysis Standards**
- **Describe UI elements** visible in screenshots
- **Explain error messages** and their context
- **Relate images to ticket description** and reproduction steps
- **Note file sizes** for reference
- **Provide business context** for what images show

### **Risk Assessment Criteria**
- **Critical**: Production down, major functionality broken
- **High**: Important features affected, user experience degraded
- **Medium**: Minor functionality issues, workarounds available
- **Low**: Cosmetic issues, enhancements, future improvements

---

## 🔗 **URL CONSTRUCTION**

### **Direct Work Item Links**
```
Work Item Edit: {ORGANIZATION_URL}/{PROJECT}/_workitems/edit/{ID}
Board View: {ORGANIZATION_URL}/{PROJECT}/_boards/board/t/{PROJECT}%20Team/Stories?workitem={ID}
```

### **Attachment Links**
```
Direct Attachment: {ORGANIZATION_URL}/{PROJECT_GUID}/_apis/wit/attachments/{ATTACHMENT_ID}
```

### **Project-Specific URLs**
Use project configuration from `azure-projects/{PROJECT}/config.md`:
- `WORK_ITEM_BASE`: Base URL for work item links
- `PROJECT_BOARDS`: Direct board link
- `ORGANIZATION_BASE`: Organization URL

---

## 🚀 **AUTOMATION WORKFLOW**

### **For AI Assistants**
```
1. Receive ticket analysis request
2. Detect project context using azure-flags-context.md
3. Load project configuration from azure-projects/{PROJECT}/config.md
4. Execute az boards work-item show command
5. Parse JSON response for all fields
6. Generate and execute PowerShell script for image downloads
7. Analyze downloaded images (PNG/JPG only)
8. Note non-analyzable media with clarification request
9. Generate comprehensive analysis using complete template
10. Include project-specific business context and URLs
```

### **Error Handling**
```bash
# Verify ticket exists and is accessible
az boards work-item show --id {ID} --output json 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Error: Ticket #{ID} not found or not accessible"
    echo "- Check if ticket ID is correct"
    echo "- Verify Azure DevOps permissions"
    echo "- Confirm project configuration"
    exit 1
fi
```

### **Performance Optimization**
- **Parallel Processing**: Download multiple attachments simultaneously
- **Caching**: Store JSON responses temporarily for follow-up questions
- **Selective Analysis**: Focus on most recent comments for timeline
- **Smart Filtering**: Prioritize high-value fields for analysis

---

## 📝 **EXAMPLE ANALYSIS OUTPUT**

### **Sample Comprehensive Analysis**
```
Ticket #11530: "Hide Dealer Registration Option"

📋 **Full Work Item Details:**
- **Type**: Bug (Critical Severity - Level 1)
- **Status**: ✅ Resolved (Fixed on 2025-05-23)
- **Priority**: High (2/4)
- **Assigned To**: Chantalle Cronjé (chantalle@mycarmatch.co.za)
- **Created By**: nicolenec0@gmail.com (2025-05-16)
- **Environment**: Staging (Test)
- **Bug Effort**: X-small
- **Iteration**: MyCarMatch\Iteration 5
- **Value Area**: Business
- **Completed Work**: 100%
- **Board Column**: Resolved
- **Stack Rank**: 250042387.0

📝 **Description & Reproduction Steps:**
'2025/05/20 - Dealer registration option hidden
Please hide dealer registration option for now.'

💬 **Comments & Activity:**
- **Activated**: 2025-05-20 by nicolenec0
- **Resolved**: 2025-05-23 by nicolenec0 
- **Resolution Reason**: Fixed
- **Latest State**: Completely resolved with visual confirmation

📸 **Visual Evidence Analysis:**
- **Image 1** (51,409 bytes): Shows resolution confirmation - dealer registration option successfully hidden from UI
- **Image 2** (40,520 bytes): Shows original problem state - dealer registration option was visible when it should be hidden

🎯 **Business Impact:**
- Critical severity bug affecting user registration flow
- Temporarily needed to hide dealer registration functionality
- Environment-specific issue found in staging
- Successfully resolved without affecting other registration types

🔗 **Direct Access**: https://datasolve.visualstudio.com/MyCarMatch/_boards/board/t/MyCarMatch%20Team/Stories?workitem=11530

✅ **Risk Assessment**: Low - issue resolved with visual confirmation, no ongoing impact
```

This analysis provides complete context while maintaining efficiency through the structured approach and automated workflows. 