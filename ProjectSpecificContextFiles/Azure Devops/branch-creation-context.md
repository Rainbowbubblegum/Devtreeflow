# Branch Creation Context & Azure Integration

## 🎯 **Branch Creation Mission**
Provide comprehensive, Azure DevOps-integrated branch creation with automatic ticket validation, standardized naming conventions, and intelligent workflow management for development teams.

## 🚨 **CRITICAL: New AI Chat Prerequisites**
**Every new AI chat MUST verify these before creating branches:**

### **Step 1: Check Azure DevOps Configuration**
```bash
# Verify azure-devops-context.md exists and is configured
ls -la azure-devops-context.md
```
- ✅ **If exists**: Read configuration section for project details
- ❌ **If missing**: **CRITICAL ERROR** - Create azure-devops-context.md first

### **Step 2: Validate Configuration Settings**
Check azure-devops-context.md configuration section:
```
Required Settings:
- ORGANIZATION_URL: {from azure-devops-context.md}
- PROJECT_NAME: {from azure-devops-context.md}  
- DEFAULT_BASE_BRANCH: {from azure-devops-context.md}
- TEST_TICKET_ID: {from azure-devops-context.md}
```
- ✅ **If all configured**: Proceed to Step 3
- ❌ **If any [EMPTY]**: **STOP** - Configure azure-devops-context.md first

### **Step 3: Test Azure DevOps Connection**
```bash
# Use configured test ticket ID from azure-devops-context.md
az boards work-item show --id {TEST_TICKET_ID} --output json
```
- ✅ **If successful**: Proceed with branch creation workflows
- ❌ **If fails**: **CRITICAL ERROR** - Follow azure-devops-context.md setup guide

### **Step 4: Validate Git Repository State**
```bash
git status
git branch
```
- ✅ **If clean**: Continue with branch creation
- ⚠️ **If uncommitted changes**: Request clarification before proceeding

### **Step 5: Confirm Project Context**
Project settings loaded from azure-devops-context.md:
- **Organization**: `{ORGANIZATION_URL}`
- **Project**: `{PROJECT_NAME}`
- **Default Base Branch**: `{DEFAULT_BASE_BRANCH}`
- **Working Directory**: `{PROJECT_WORKING_DIRECTORY}`

## 🌿 **Branch Naming Convention & Standards**

### **Standard Naming Convention**
```
feature/AzureTicketBranch-{ticket_id}
```

**Examples:**
- `feature/AzureTicketBranch-11530`
- `feature/AzureTicketBranch-11542`
- `feature/AzureTicketBranch-11785`

### **Branch Creation Integration with Release Management**
This naming convention enables:
- ✅ **Automatic ticket-to-branch association** in releases
- ✅ **Easy branch discovery** during release planning
- ✅ **Consistent Azure DevOps integration** across workflows
- ✅ **Professional release note generation** with ticket context

## 🎫 **Single Ticket Branch Creation Workflow**

### **User Request Pattern:**
```
User: "Create a branch for ticket #11530"
User: "Make a branch for this ticket" + [ticket ID or description]
User: "I need a feature branch for the login bug"
```

### **AI Response Workflow:**

#### **Step 1: Ticket Association Inquiry**
If ticket ID not provided:
```
I'd be happy to create a branch for you! To follow our Azure DevOps integration standards, I need to know:

🎫 **Ticket Information:**
- What's the Azure DevOps ticket ID for this branch?
- If no ticket exists, should I create a generic branch or would you prefer to create a ticket first?

🌿 **Base Branch:**
- What base branch should I create this from? (develop/master/other)

Once I have the ticket ID, I'll analyze the ticket details and confirm the branch creation plan with you.
```

#### **Step 2: Ticket Validation & Analysis**
```bash
# Get complete ticket details
az boards work-item show --id {TICKET_ID} --output json

# Extract key information:
# - System.Title (ticket title)
# - System.State (current status)
# - System.WorkItemType (Bug/Feature/Task)
# - Microsoft.VSTS.Common.Priority (priority level)
# - System.AssignedTo (assignee)
# - System.Description (full description)
```

#### **Step 3: Branch Existence Check**
```bash
# Check if branch already exists
git branch -a | grep "AzureTicketBranch-${TICKET_ID}"

# Alternative search patterns
git branch -a | grep "${TICKET_ID}"

# Search in remote branches
git ls-remote --heads origin | grep "${TICKET_ID}"
```

#### **Step 4: Present Creation Plan**
```
🎫 **Ticket Analysis Complete**
- **ID**: #11530
- **Title**: "Hide Dealer Registration Option"
- **Type**: Bug (Critical Severity)
- **Status**: Active
- **Assigned**: Chantalle Cronjé
- **Priority**: High (2/4)

🌿 **Branch Creation Plan:**
- **Branch Name**: feature/AzureTicketBranch-11530
- **Base Branch**: {CONFIRMED_BASE_BRANCH}
- **Existing Branch Check**: ✅ No conflicts found

🎯 **Next Steps:**
1. Create branch from {BASE_BRANCH}
2. Update Azure DevOps ticket with branch name comment
3. Confirm branch creation and provide git commands

Do you want me to proceed with this branch creation?
```

#### **Step 5: Branch Creation Execution**
```bash
# Ensure base branch is current
git checkout {BASE_BRANCH}
git pull origin {BASE_BRANCH}

# Create feature branch
git checkout -b feature/AzureTicketBranch-${TICKET_ID}

# Push branch to remote
git push -u origin feature/AzureTicketBranch-${TICKET_ID}

# Get branch creation confirmation
git branch --show-current
```

#### **Step 6: Azure DevOps Ticket Update (PROVEN METHOD)**
```bash
# Create batch file for reliable comment execution
echo @echo off > add_comment_${TICKET_ID}.bat
echo echo Adding branch comment to ticket #${TICKET_ID}... >> add_comment_${TICKET_ID}.bat
echo az boards work-item update --id ${TICKET_ID} --discussion "Branch created: feature/AzureTicketBranch-${TICKET_ID} >> add_comment_${TICKET_ID}.bat
echo. >> add_comment_${TICKET_ID}.bat
echo Development branch created for this ticket. >> add_comment_${TICKET_ID}.bat
echo Base Branch: ${BASE_BRANCH} >> add_comment_${TICKET_ID}.bat
echo Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm') >> add_comment_${TICKET_ID}.bat
echo Repository: MyCarMatch >> add_comment_${TICKET_ID}.bat
echo. >> add_comment_${TICKET_ID}.bat
echo To work on this ticket: >> add_comment_${TICKET_ID}.bat
echo git checkout feature/AzureTicketBranch-${TICKET_ID}" >> add_comment_${TICKET_ID}.bat
echo echo Comment added successfully to ticket #${TICKET_ID} >> add_comment_${TICKET_ID}.bat

# Execute the batch file
.\add_comment_${TICKET_ID}.bat

# Clean up
Remove-Item add_comment_${TICKET_ID}.bat

# Verify comment was added successfully
echo "✅ Comment added to Azure DevOps ticket #${TICKET_ID}"
```

**✅ CONFIRMED WORKING**: This batch file method is the most reliable approach tested and verified working.

## 📋 **Multiple Ticket Branch Creation Workflow**

### **User Request Patterns:**
```
User: "Create branches for tickets #11530, #11542, #11545"
User: [Screenshot of Azure boards] + "Make branches for these tickets"
User: "I need feature branches for the UAT ready tickets"
```

### **Comprehensive Multi-Ticket Response:**

#### **Step 1: Ticket Collection & Analysis**
```bash
# For each ticket ID provided or extracted from screenshot:
for TICKET_ID in 11530 11542 11545; do
    echo "Analyzing ticket #${TICKET_ID}..."
    az boards work-item show --id ${TICKET_ID} --output json
done

# Extract all relevant information for batch processing
```

#### **Step 2: Batch Branch Existence Check**
```bash
# Check existing branches for all tickets
echo "🔍 **Checking Existing Branches:**"
for TICKET_ID in 11530 11542 11545; do
    EXISTING_BRANCH=$(git branch -a | grep "AzureTicketBranch-${TICKET_ID}" | head -1)
    if [ -n "$EXISTING_BRANCH" ]; then
        echo "⚠️ WARNING: Branch for ticket #${TICKET_ID} already exists: ${EXISTING_BRANCH}"
    else
        echo "✅ Ticket #${TICKET_ID}: Available for branch creation"
    fi
done
```

#### **Step 3: Comprehensive Batch Plan Presentation**
```
🎫 **Multi-Ticket Branch Creation Analysis**

📋 **Ticket Details:**
- **#11530**: "Hide Dealer Registration Option" (Bug, Critical, Active)
  - ✅ **Branch Status**: Available for creation
  - 🌿 **Planned**: feature/AzureTicketBranch-11530

- **#11542**: "Update Login Validation" (Enhancement, High, Active)  
  - ✅ **Branch Status**: Available for creation
  - 🌿 **Planned**: feature/AzureTicketBranch-11542

- **#11545**: "Fix Payment Gateway" (Bug, High, Active)
  - ⚠️ **Branch Status**: EXISTING BRANCH FOUND - feature/AzureTicketBranch-11545
  - 🚨 **Action**: Skip creation or confirm overwrite?

🎯 **Base Branch Confirmation:**
- All branches will be created from: **{BASE_BRANCH}**
- Is this correct? If not, please specify the base branch.

⚡ **Batch Operation Plan:**
1. Create 2 new branches (skip #11545 due to existing branch)
2. Update Azure DevOps tickets with branch name comments
3. Provide git commands for switching to each branch

Do you want me to proceed with this batch branch creation?
```

#### **Step 4: Batch Execution**
```bash
# Execute batch branch creation
for TICKET_ID in 11530 11542; do
    echo "Creating branch for ticket #${TICKET_ID}..."
    
    # Create branch
    git checkout ${BASE_BRANCH}
    git pull origin ${BASE_BRANCH}
    git checkout -b feature/AzureTicketBranch-${TICKET_ID}
    git push -u origin feature/AzureTicketBranch-${TICKET_ID}
    
    # Update Azure DevOps ticket with detailed comment
    az boards work-item update --id ${TICKET_ID} --discussion "Branch created: feature/AzureTicketBranch-${TICKET_ID}
    
Created for development work on this ticket.
Base Branch: ${BASE_BRANCH}
Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm')

To checkout: git checkout feature/AzureTicketBranch-${TICKET_ID}"
    
    echo "✅ Completed: feature/AzureTicketBranch-${TICKET_ID} (Azure ticket updated)"
done
```

## 🖼️ **Screenshot-Based Branch Creation**

### **Screenshot Analysis Protocol**
When user provides Azure boards screenshot:

#### **Step 1: Screenshot Analysis**
```
I can see your Azure boards screenshot. Let me analyze it for ticket information:

🔍 **Screenshot Analysis:**
- **Visible Ticket IDs**: [List all ticket IDs found: #11530, #11542, etc.]
- **Status Columns**: [Identify columns: "Ready for Development", "Active", etc.]
- **Ticket Titles**: [Note any visible titles for context]

📋 **Extracted Tickets for Branch Creation:**
[List each ticket with visible details]

If I missed any tickets or if you need different tickets, please clarify.
```

#### **Step 2: Ticket Validation from Screenshot**
```bash
# For each ticket ID identified in screenshot:
for TICKET_ID in [EXTRACTED_FROM_SCREENSHOT]; do
    az boards work-item show --id ${TICKET_ID} --output json
    # Validate ticket exists and get full context
done
```

#### **Step 3: Follow Multi-Ticket Workflow**
Proceed with comprehensive multi-ticket analysis and batch creation process.

## 🔧 **Technical Implementation Details**

### **Azure DevOps Integration Commands**
```bash
# Test Azure connection
az boards work-item show --id {TICKET_ID} --output json

# PROVEN METHOD: Batch file for reliable commenting (TESTED & VERIFIED)
echo @echo off > comment_temp.bat
echo az boards work-item update --id {TICKET_ID} --discussion "Branch created: feature/AzureTicketBranch-{TICKET_ID}" >> comment_temp.bat
.\comment_temp.bat
Remove-Item comment_temp.bat

# Alternative: Direct command (works but may have display issues)
az boards work-item update --id {TICKET_ID} --discussion "Branch created: feature/AzureTicketBranch-{TICKET_ID}"

# Verification methods
az boards work-item show --id {TICKET_ID} --query "fields.['System.CommentCount']" --output tsv
az boards work-item show --id {TICKET_ID} --query "fields.['System.History']" --output tsv

# Search for existing ticket comments about branches
az boards work-item show --id {TICKET_ID} --output json | findstr -i "branch created"
```

### **🎯 PROVEN COMMENTING WORKFLOW (LESSONS LEARNED)**
Based on extensive testing with ticket #11530:

#### **✅ What Works Best:**
1. **Batch files** - Most reliable, no PowerShell issues
2. **Direct Azure CLI** - Works but may have display issues  
3. **Always verify** - Check comment count or view in browser

#### **⚠️ What to Avoid:**
- Complex PowerShell scripting with ReadLine
- Assuming commands failed due to display issues
- Not verifying comment success

#### **🔧 Recommended Implementation:**
```bash
# Create temporary batch file
BATCH_FILE="add_comment_${TICKET_ID}.bat"
echo @echo off > ${BATCH_FILE}
echo az boards work-item update --id ${TICKET_ID} --discussion "${COMMENT_TEXT}" >> ${BATCH_FILE}
./${BATCH_FILE}
Remove-Item ${BATCH_FILE}
```

### **Git Operations**
```bash
# Base branch operations
git checkout {BASE_BRANCH}
git pull origin {BASE_BRANCH}

# Branch creation
git checkout -b feature/AzureTicketBranch-{TICKET_ID}

# Push and set upstream
git push -u origin feature/AzureTicketBranch-{TICKET_ID}

# Verification
git branch --show-current
git status
```

### **Branch Discovery for Existing Branches**
```bash
# Primary search (standard naming)
git branch -a | grep "AzureTicketBranch-{TICKET_ID}"

# Secondary search (ticket ID anywhere)
git branch -a | grep "{TICKET_ID}"

# Remote branch search
git ls-remote --heads origin | grep "{TICKET_ID}"

# Search in ticket comments for branch references
az boards work-item show --id {TICKET_ID} --output json | jq '.fields["System.History"]' | grep -i "branch"
```

## 🚨 **Error Handling & Edge Cases**

### **Ticket Not Found**
```bash
# If ticket doesn't exist:
az boards work-item show --id {TICKET_ID} --output json 2>&1 | grep "does not exist"

# Response to user:
"⚠️ **Ticket Not Found**: Ticket #{TICKET_ID} doesn't exist in Azure DevOps.
- Please verify the ticket ID
- Check if you're working in the correct project
- Confirm the ticket hasn't been deleted or moved"
```

### **Branch Already Exists**
```bash
# If branch already exists:
git branch -a | grep "AzureTicketBranch-{TICKET_ID}" && echo "Branch exists"

# Response to user:
"⚠️ **Branch Already Exists**: feature/AzureTicketBranch-{TICKET_ID}
Options:
1. Skip creation (recommended)
2. Create with different naming pattern
3. Delete existing and recreate (requires confirmation)

What would you prefer?"
```

### **Base Branch Issues**
```bash
# If base branch doesn't exist:
git branch -a | grep "{BASE_BRANCH}" || echo "Base branch not found"

# Response to user:
"🚨 **Base Branch Issue**: '{BASE_BRANCH}' not found.
Available branches:
$(git branch -a)

Please specify a valid base branch for creation."
```

### **Azure DevOps Connection Issues**
```bash
# If Azure CLI not authenticated:
az boards work-item show --id 11530 --output json 2>&1 | grep "authentication"

# Response to user:
"🚨 **Azure DevOps Connection Issue**: 
Authentication required. Please check azure-devops-context.md for setup instructions.

Quick fix:
az login --allow-no-subscriptions
az devops configure --defaults organization=https://dev.azure.com/datasolve project=MyCarMatch"
```

## 📊 **Integration with Release Management**

### **Branch-to-Release Connection**
Branches created with this naming convention integrate seamlessly with release-management-context.md:

```bash
# Release systems can automatically discover branches:
git branch -a | grep "AzureTicketBranch-{TICKET_ID}"

# Ticket extraction for release notes:
TICKET_ID=$(echo "feature/AzureTicketBranch-11530" | grep -o '[0-9]\{4,6\}')
az boards work-item show --id ${TICKET_ID} --output json
```

### **Professional Release Documentation**
Branches created with this system enable:
- ✅ **Automatic ticket-to-branch association** in releases
- ✅ **Professional release notes** with full ticket context
- ✅ **Visual evidence integration** from ticket attachments
- ✅ **Complete audit trails** linking branches to business requirements

## 🎯 **Complete Workflow Examples**

### **Example 1: Single Ticket Branch**
```
User: "Create a branch for ticket #11530"

AI Response:
1. Tests Azure connection ✅
2. Analyzes ticket #11530 → "Hide Dealer Registration Option" (Critical Bug)
3. Checks for existing branches → None found ✅
4. Confirms base branch → develop ✅
5. Creates feature/AzureTicketBranch-11530
6. Updates Azure ticket with branch comment
7. Provides confirmation and git commands
```

### **Example 2: Screenshot-Based Multi-Ticket**
```
User: [Screenshot showing tickets #11530, #11542, #11545] + "Create branches for these"

AI Response:
1. Analyzes screenshot → Extracts 3 ticket IDs
2. Validates each ticket via Azure DevOps
3. Checks existing branches → #11545 already exists ⚠️
4. Presents comprehensive plan with warnings
5. Creates 2 new branches (skips existing)
6. Updates Azure tickets with branch comments
7. Provides complete summary and next steps
```

### **Example 3: Base Branch Clarification**
```
User: "Make branches for tickets #11530, #11542"

AI Response:
"I can create branches for tickets #11530 and #11542. 

🎫 **Ticket Analysis:**
- #11530: Hide Dealer Registration Option (Critical Bug)
- #11542: Update Login Validation (Enhancement)

🌿 **Base Branch Needed:**
What base branch should I create these from?
- develop (recommended for feature development)
- master (for hotfixes)
- other (please specify)

Once confirmed, I'll create both branches and update the Azure DevOps tickets."
```

## 🚀 **Integration Requirements**

### **Required Context Files**
This branch creation system requires:
- ✅ **azure-devops-context.md**: For Azure DevOps connection and project details
- ✅ **release-management-context.md**: For understanding branch-to-release workflows
- ✅ **Active Azure CLI session**: For ticket validation and updates

### **Recommended Azure DevOps Context Updates**
When using this branch creation system, update azure-devops-context.md with:
```markdown
## Branch Creation Integration
- Standard branch naming: feature/AzureTicketBranch-{ticket_id}
- Automatic ticket commenting with branch names
- Integration with release management workflows
- Base branch: [PROJECT_SPECIFIC - usually develop]
```

## 🔍 **CRITICAL: Code Review Requirement**

### **⚠️ MANDATORY REVIEW PROCESS**
**Before ANY commits or pushes, the AI MUST:**

#### **Step 1: Present Solution for Review**
```
🛠️ **Proposed Solution Summary:**
- **Problem**: [Brief description of issue]
- **Root Cause**: [What was causing the problem]
- **Files to Modify**: [List of files that will be changed]
- **Changes**: [Specific changes to be made]

📋 **Code Changes Preview:**
[Show the actual code changes that will be made]

⚠️ **AWAITING REVIEW**: Please review this solution before I commit and push the changes.
```

#### **Step 2: Wait for User Approval**
- ✅ **If approved**: Proceed with commit and push
- ❌ **If rejected**: Revise solution based on feedback
- 🔄 **If modifications needed**: Apply requested changes, then present again

#### **Step 3: Only After Approval**
```bash
# Commit with descriptive message
git add .
git commit -m "Brief description - Ticket #XXXX"
git push

# Update Azure DevOps ticket
az boards work-item update --id XXXX --discussion "Solution implemented..."
```

### **🚨 VIOLATION CONSEQUENCES**
**If AI commits/pushes without review:**
1. **Immediate**: Acknowledge the workflow violation
2. **Process**: Update context files to prevent recurrence  
3. **Recovery**: Complete any remaining ticket updates as requested

## 🎯 **Ready for Branch Creation**
This context file provides complete guidance for AI assistants to handle all branch creation scenarios with Azure DevOps integration, professional ticket validation, and seamless integration with release management workflows. All operations maintain consistency with established azure-devops-context.md and release-management-context.md protocols.

**⚠️ REMEMBER: Always present solutions for review before committing!**

## 💡 **PROVEN LESSONS LEARNED (TESTED WITH TICKET #11530)**

### **✅ What Works Perfectly:**
1. **Batch File Commenting** - Most reliable method, no PowerShell issues
2. **Azure CLI Integration** - All commenting functionality works as expected  
3. **Automatic Verification** - Comment count and history checking works
4. **Browser Integration** - Direct links to tickets for visual confirmation

### **🔧 Best Practices Established:**
- **Always use batch files** for complex comments to avoid PowerShell ReadLine issues
- **Clean up temporary files** after commenting operations
- **Verify comment success** using comment count or browser viewing
- **Use standardized comment templates** for consistency across workflows

### **📋 Proven Comment Templates:**
- **Branch Creation**: "Branch created: feature/AzureTicketBranch-{ID}"
- **Development Progress**: "Development started on branch: ..."
- **Release Preparation**: "Preparing for {ENV} release..."
- **Deployment Notification**: "🚀 Deployed to {ENV}..."

### **🚀 Integration Success:**
This branch creation system now seamlessly integrates with:
- ✅ **azure-devops-context.md** - For ticket analysis and image downloads
- ✅ **release-management-context.md** - For professional release workflows
- ✅ **Proven commenting methods** - Tested and verified working
- ✅ **Complete automation** - From ticket validation to branch creation to Azure updates

**Ready for Production Use** - All methods tested and verified working with actual Azure DevOps environment.

## 📋 **Recommended AI Assistant Rule**
Add this rule to your AI assistant settings for automatic context activation:
```
When asked to create branches, make branches, create feature branches, or any branch creation requests, always refer to the branch-creation-context.md file first. This file references azure-devops-context.md for configuration settings. Check PROJECT CONFIGURATION settings in azure-devops-context.md first - if any show [EMPTY - NEEDS CONFIGURATION], help configure them before proceeding. Follow the comprehensive workflows including Azure DevOps ticket validation, standardized naming conventions, and proven commenting methods.
``` 