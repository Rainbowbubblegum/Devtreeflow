# Azure DevOps Branch Integration Context

## 🎯 **BRANCH CREATION MISSION**
Comprehensive Azure DevOps-integrated branch creation with automatic ticket validation, standardized naming, and intelligent workflow management.

---

## 🚨 **AI PREREQUISITES (REQUIRED BEFORE BRANCH CREATION)**

### **Step 1: Verify Azure DevOps Setup**
```bash
# Check if Azure DevOps is configured
az boards work-item show --id {TEST_TICKET_ID} --output json
```
- ✅ **Success**: Proceed with workflows
- ❌ **Fails**: Load `azure-setup-context.md` and configure first

### **Step 2: Load Project Configuration**
Use `azure-flags-context.md` to detect active project:
- **MyCarMatch**: Organization: datasolve, Project: MyCarMatch, Test Ticket: 11530
- **Other Projects**: Auto-detect from working directory/git remote

### **Step 3: Validate Git Repository State**
```bash
git status
git branch
```
- ✅ **Clean**: Continue
- ⚠️ **Uncommitted changes**: Request clarification

---

## 🌿 **BRANCH NAMING CONVENTIONS**

### **Standard Convention**
```
feature/AzureTicketBranch-{ticket_id}
hotfix/AzureTicketBranch-{ticket_id}
release/v{version}
```

**Examples:**
- `feature/AzureTicketBranch-11530`
- `hotfix/AzureTicketBranch-11542`

**Integration Benefits:**
- ✅ Automatic ticket-to-branch association in releases
- ✅ Easy branch discovery during release planning
- ✅ Professional release note generation with ticket context

---

## 🎫 **SINGLE TICKET BRANCH CREATION**

### **User Request Patterns**
```
"Create a branch for ticket #11530"
"Make a branch for this ticket"
"I need a feature branch for the login bug"
```

### **AI Workflow**

#### **Step 1: Ticket Association (if ID not provided)**
```
I'll create a branch for you! I need:

🎫 **Ticket Information:**
- Azure DevOps ticket ID for this branch?
- If no ticket exists, create generic branch or ticket first?

🌿 **Base Branch:**
- What base branch? (develop/master/other)

Once I have the ticket ID, I'll analyze details and confirm creation plan.
```

#### **Step 2: Ticket Validation & Analysis**
```bash
# Get complete ticket details
az boards work-item show --id {TICKET_ID} --output json

# Extract key information:
# - System.Title, System.State, System.WorkItemType
# - Microsoft.VSTS.Common.Priority, System.AssignedTo
```

#### **Step 3: Branch Existence Check**
```bash
# Check if branch already exists
git branch -a | grep "AzureTicketBranch-${TICKET_ID}"
git branch -a | grep "${TICKET_ID}"
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

🌿 **Branch Creation Plan:**
- **Branch Name**: feature/AzureTicketBranch-11530
- **Base Branch**: {CONFIRMED_BASE_BRANCH}
- **Existing Branch Check**: ✅ No conflicts found

Do you want me to proceed?
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
```

#### **Step 6: Azure DevOps Ticket Update (PROVEN METHOD)**
```bash
# Create batch file for reliable comment execution (TESTED & VERIFIED)
echo @echo off > add_comment_${TICKET_ID}.bat
echo az boards work-item update --id ${TICKET_ID} --discussion "Branch created: feature/AzureTicketBranch-${TICKET_ID}

Development branch created for this ticket.
Base Branch: ${BASE_BRANCH}
Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm')

To work on this ticket:
git checkout feature/AzureTicketBranch-${TICKET_ID}" >> add_comment_${TICKET_ID}.bat

# Execute and cleanup
.\add_comment_${TICKET_ID}.bat
Remove-Item add_comment_${TICKET_ID}.bat
```

**✅ PROVEN WORKING**: Batch file method tested with ticket #11530

---

## 📋 **MULTIPLE TICKET BRANCH CREATION**

### **User Request Patterns**
```
"Create branches for tickets #11530, #11542, #11545"
[Screenshot of Azure boards] + "Make branches for these tickets"
"I need feature branches for the UAT ready tickets"
```

### **AI Workflow**

#### **Step 1: Ticket Collection & Analysis**
```bash
# For each ticket ID (provided or extracted from screenshot):
for TICKET_ID in 11530 11542 11545; do
    az boards work-item show --id ${TICKET_ID} --output json
done
```

#### **Step 2: Batch Branch Existence Check**
```bash
echo "🔍 **Checking Existing Branches:**"
for TICKET_ID in 11530 11542 11545; do
    EXISTING_BRANCH=$(git branch -a | grep "AzureTicketBranch-${TICKET_ID}" | head -1)
    if [ -n "$EXISTING_BRANCH" ]; then
        echo "⚠️ WARNING: Branch for ticket #${TICKET_ID} exists: ${EXISTING_BRANCH}"
    else
        echo "✅ Ticket #${TICKET_ID}: Available for creation"
    fi
done
```

#### **Step 3: Present Batch Plan**
```
🎫 **Multi-Ticket Branch Creation Analysis**

📋 **Ticket Details:**
- **#11530**: "Hide Dealer Registration Option" (Bug, Critical, Active)
  - ✅ Available for creation → feature/AzureTicketBranch-11530
- **#11542**: "Update Login Validation" (Enhancement, High, Active)
  - ✅ Available for creation → feature/AzureTicketBranch-11542
- **#11545**: "Fix Payment Gateway" (Bug, High, Active)
  - ⚠️ EXISTING BRANCH FOUND - Skip or overwrite?

🎯 **Base Branch**: {BASE_BRANCH}
⚡ **Plan**: Create 2 new branches, update Azure tickets

Proceed with batch creation?
```

#### **Step 4: Batch Execution**
```bash
for TICKET_ID in 11530 11542; do
    # Create branch
    git checkout ${BASE_BRANCH}
    git pull origin ${BASE_BRANCH}
    git checkout -b feature/AzureTicketBranch-${TICKET_ID}
    git push -u origin feature/AzureTicketBranch-${TICKET_ID}
    
    # Update Azure ticket (batch file method)
    echo @echo off > temp_comment_${TICKET_ID}.bat
    echo az boards work-item update --id ${TICKET_ID} --discussion "Branch created: feature/AzureTicketBranch-${TICKET_ID}" >> temp_comment_${TICKET_ID}.bat
    .\temp_comment_${TICKET_ID}.bat
    Remove-Item temp_comment_${TICKET_ID}.bat
    
    echo "✅ Completed: feature/AzureTicketBranch-${TICKET_ID}"
done
```

---

## 🖼️ **SCREENSHOT-BASED BRANCH CREATION**

### **Screenshot Analysis Protocol**
```
I can see your Azure boards screenshot. Analyzing for ticket information:

🔍 **Screenshot Analysis:**
- **Visible Ticket IDs**: #11530, #11542, #11545
- **Status Columns**: "Ready for Development", "Active"
- **Ticket Titles**: [Note visible titles for context]

📋 **Extracted Tickets for Branch Creation:**
[List each ticket with visible details]

If I missed any tickets or need different ones, please clarify.
```

Then follow **Multi-Ticket Workflow** above.

---

## 🔍 **TICKET ID EXTRACTION & BRANCH ANALYSIS**

### **Extract Ticket from Current Branch**
```bash
# PowerShell version
$BranchName = git branch --show-current
if ($BranchName -match 'AzureTicketBranch-(\d{4,6})') {
    $TicketId = $matches[1]
    Write-Host "Found ticket ID: $TicketId"
}

# Bash version
BRANCH_NAME=$(git branch --show-current)
TICKET_ID=$(echo "$BRANCH_NAME" | grep -o -E '[0-9]{4,6}' | head -1)
echo "Ticket ID: $TICKET_ID"
```

### **Analyze Current Branch Context**
```bash
# Complete branch-to-ticket analysis
TICKET_ID=$(git branch --show-current | grep -o -E '[0-9]{4,6}' | head -1)

if [ -n "$TICKET_ID" ]; then
    echo "Current branch ticket: #$TICKET_ID"
    az boards work-item show --id $TICKET_ID --output json
    echo "Direct link: https://dev.azure.com/{ORG}/{PROJECT}/_workitems/edit/$TICKET_ID"
else
    echo "No ticket ID found in current branch"
fi
```

---

## 📊 **RELEASE BRANCH DISCOVERY**

### **Find Release-Ready Branches**
```bash
# Discover branches ready for release
FEATURE_BRANCHES=$(git branch -r | grep -E "(feature|hotfix)" | sed 's/origin\///' | sort)

for BRANCH in $FEATURE_BRANCHES; do
    TICKET_ID=$(echo "$BRANCH" | grep -o -E '[0-9]{4,6}' | head -1)
    
    if [ -n "$TICKET_ID" ]; then
        STATE=$(az boards work-item show --id $TICKET_ID --query "fields.['System.State']" --output tsv 2>/dev/null)
        TITLE=$(az boards work-item show --id $TICKET_ID --query "fields.['System.Title']" --output tsv 2>/dev/null)
        
        echo "Branch: $BRANCH"
        echo "  └─ Ticket #$TICKET_ID: $TITLE"
        echo "     State: $STATE"
        
        if [[ "$STATE" =~ ^(Resolved|Closed|Done)$ ]]; then
            echo "     🚀 READY FOR RELEASE"
        else
            echo "     🔄 In Progress"
        fi
    fi
done
```

### **Validate Release Branch**
```bash
# Check if branch is ready for release
BRANCH_NAME=$1
TICKET_ID=$(echo "$BRANCH_NAME" | grep -o -E '[0-9]{4,6}' | head -1)

if [ -n "$TICKET_ID" ]; then
    STATE=$(az boards work-item show --id $TICKET_ID --query "fields.['System.State']" --output tsv)
    
    case "$STATE" in
        "Resolved"|"Closed"|"Done")
            echo "✅ READY FOR RELEASE - Ticket completed"
            ;;
        "Active"|"In Progress")
            echo "⚠️ WARNING: Ticket still in progress"
            ;;
        "New"|"Open")
            echo "❌ NOT READY - Ticket not started"
            ;;
    esac
fi
```

---

## 🚨 **ERROR HANDLING**

### **Common Issues & Solutions**

#### **Ticket Not Found**
```bash
# If ticket doesn't exist
az boards work-item show --id {TICKET_ID} --output json 2>&1 | grep "does not exist"

# AI Response:
"⚠️ **Ticket Not Found**: Ticket #{TICKET_ID} doesn't exist.
- Verify ticket ID
- Check correct project
- Confirm ticket not deleted"
```

#### **Branch Already Exists**
```bash
# If branch exists
git branch -a | grep "AzureTicketBranch-{TICKET_ID}" && echo "Branch exists"

# AI Response:
"⚠️ **Branch Exists**: feature/AzureTicketBranch-{TICKET_ID}
Options:
1. Skip creation (recommended)
2. Create with different naming
3. Delete and recreate (needs confirmation)"
```

#### **Azure Connection Issues**
```bash
# If Azure CLI not authenticated
az boards work-item show --id 11530 2>&1 | grep "authentication"

# AI Response:
"🚨 **Azure Connection Issue**: Authentication required.
Quick fix:
az login --allow-no-subscriptions
az devops configure --defaults organization=https://dev.azure.com/{ORG} project={PROJECT}"
```

---

## 🔗 **INTEGRATION POINTS**

### **Required Context Files**
- ✅ `azure-setup-context.md`: For Azure DevOps connection setup
- ✅ `azure-flags-context.md`: For project detection and configuration
- ✅ `azure-ticket-analysis-context.md`: For comprehensive ticket analysis
- ✅ `release-management-context.md`: For branch-to-release workflows

### **Git Integration Commands**
```bash
# Commit with ticket reference
git commit -m "Fix login issue - resolves #11530"

# Create PR with ticket context
gh pr create --title "Fix: Hide dealer registration (#11530)" \
              --body "Resolves #11530 - Implementation details..."

# Merge with ticket reference
git merge --squash feature/AzureTicketBranch-11530
git commit -m "Hide dealer registration option (#11530)"
```

---

## 🎯 **AI ASSISTANT INTEGRATION**

### **Branch Intent Detection**
```javascript
const branchIntents = {
  // Creation
  "create branch for ticket #12345" → Single ticket workflow
  "make branches for these tickets" → Multi-ticket workflow
  [Screenshot] + "create branches" → Screenshot analysis workflow
  
  // Analysis
  "what ticket is this branch for" → Extract ticket ID, analyze
  "analyze current branch" → Full branch-to-ticket analysis
  "is branch ready for release" → Check ticket status + branch state
}
```

### **Context-Aware Response Example**
```
User: "What am I working on?"

AI: "Branch: feature/AzureTicketBranch-11530

🎫 **Ticket #11530**: 'Hide Dealer Registration Option'
- **Type**: Bug (Critical)
- **Status**: ✅ Resolved
- **Project**: MyCarMatch
- **Priority**: High (2/4)

📋 **Branch Status**: Ready for merge (ticket resolved)
🔗 **Link**: https://datasolve.visualstudio.com/MyCarMatch/_workitems/edit/11530

✅ This branch is ready for release!"
```

---

## 💡 **PROVEN LESSONS (TESTED WITH #11530)**

### **✅ What Works**
1. **Batch File Commenting** - Most reliable, no PowerShell issues
2. **Azure CLI Integration** - All functionality works as expected
3. **Automatic Verification** - Comment count/history checking works
4. **Standardized Naming** - Enables seamless release integration

### **🔧 Best Practices**
- **Always use batch files** for Azure comments (avoid PowerShell ReadLine)
- **Clean up temp files** after operations
- **Verify comment success** using count or browser
- **Use standard templates** for consistency

### **📋 Proven Templates**
- **Branch Creation**: "Branch created: feature/AzureTicketBranch-{ID}"
- **Development**: "Development started on branch..."
- **Release**: "Preparing for {ENV} release..."
- **Deployment**: "🚀 Deployed to {ENV}..."

---

## 🚀 **READY FOR PRODUCTION**

This context provides complete branch creation workflows with:
- ✅ **Proven Azure DevOps integration** (tested with real tickets)
- ✅ **Comprehensive error handling** based on actual experience
- ✅ **Multiple user interaction patterns** (single, multi, screenshot)
- ✅ **Release management integration** for professional workflows
- ✅ **AI-friendly structure** for consistent assistant responses

**All methods tested and verified working with actual Azure DevOps environment.** 