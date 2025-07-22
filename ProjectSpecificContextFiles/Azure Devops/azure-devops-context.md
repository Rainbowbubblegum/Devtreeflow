# Azure DevOps Context - Main Navigation Hub

## 🚩 **SETUP STATUS FLAG**
```
AZURE_DEVOPS_SETUP_STATUS: 1
# 0 = Not Setup (Read azure-setup-context.md first)
# 1 = Setup Complete (Proceed with operations)
```

## 🏢 **PROJECT SETUP STATUS**
```
CONFIGURED_PROJECTS:
  - MyCarMatch:
      STATUS: 1  # 1 = Configured, 0 = Not Configured
      CONFIG_FILE: azure-projects/MyCarMatch/config.md
      DEPENDENCIES:
        CLI_EXTENSIONS: ["azure-devops"]
        NUGET_PACKAGES: []
      LAST_VERIFIED: 2024-01-21
  # Add new projects below with the same structure
```

**✅ CURRENT STATUS**: Azure DevOps integration is configured and ready for MyCarMatch project operations.

**🚨 CRITICAL**: If `AZURE_DEVOPS_SETUP_STATUS = 0`, you MUST read `azure-setup-context.md` first and complete setup before proceeding with any Azure operations.

---

## 📋 **INHOUDSOPGAWE (NAVIGATION GUIDE)**

### **🎯 QUICK NAVIGATION - Read ONLY What You Need**

#### **🔧 Setup & Configuration**
- **`azure-setup-context.md`** → Initial Azure DevOps setup, authentication, configuration
- **`azure-projects/{project}/config.md`** → Project-specific connection details

#### **📋 Core Operations**
ALWAYS USE BATCH files, we should be using the basic query batch file approach. 
- **`azure-commands-context.md`** → Command reference, batch files, CURL examples Always refer to this file before making any cmd or cli executions, you dont automatically know best way to do it, this file helps you understand how to first try connect and communicate with azure, without context of this file you will most likely fail. So Read azure-commands-context.md always
- **`azure-ticket-analysis-context.md`** → Work item analysis, image handling, comprehensive reporting
- **`azure-search-context.md`** → Finding work items, WIQL queries, filtering

#### **🚀 Advanced Workflows**
- **`release-management-context.md`** → Release processes, deployment workflows
- **`azure-branch-integration-context.md`** → Branch-to-ticket linking, development workflows
- **`azure-commenting-context.md`** → Adding comments, updates, progress tracking

#### **📁 Project Management**
- **`azure-projects/`** → Project-specific configurations and settings
- **`azure-flags-context.md`** → Project detection system and flagging

---

## 🤖 **AI ASSISTANT WORKFLOW**

### **Step 1: Check Setup Status**
```
IF AZURE_DEVOPS_SETUP_STATUS = 0:
  → Read azure-setup-context.md
  → Complete setup process
  → Set AZURE_DEVOPS_SETUP_STATUS = 1
  → Continue to Step 2

IF AZURE_DEVOPS_SETUP_STATUS = 1:
  → Continue to Step 2
```

### **Step 2: Determine User Intent**
Apply semantic detection to understand what the user wants to do:

#### **Setup/Configuration Intent**
- Keywords: "setup", "configure", "install", "authenticate", "connect"
- Action: Read `azure-setup-context.md`

#### **Ticket Analysis Intent**
- Keywords: "analyze ticket", "show me ticket", "what does ticket", "#12345"
- Action: Read `azure-ticket-analysis-context.md` + project config

#### **Search Intent**
- Keywords: "find tickets", "search for", "show me bugs", "list stories"
- Action: Read `azure-search-context.md` + project config

#### **Release/Deploy Intent**
- Keywords: "release", "deploy", "publish", "create release"
- Action: Read `release-management-context.md` + project config

#### **Branch/Development Intent**
- Keywords: "create branch", "branch for ticket", "git integration"
- Action: Read `azure-branch-integration-context.md` + project config

#### **Comment/Update Intent**
- Keywords: "add comment", "update ticket", "comment on"
- Action: Read `azure-commenting-context.md` + project config

### **Step 3: Detect Project Context**
Use the flagging system from `azure-flags-context.md` to determine which project:

#### **Automatic Detection Methods**
1. **Working Directory Analysis**: Extract project from current folder path
2. **Branch Name Parsing**: Extract project from branch naming conventions
3. **User References**: "MCM", "MyCarMatch", "mycarmatch" → MyCarMatch project
4. **Ask for Ticket Link**: If unsure, request Azure DevOps ticket URL to extract details

### **Step 4: Load Project Configuration**
```
Project Detected → Read azure-projects/{project}/config.md
Apply project-specific settings and connection details
```

### **Step 5: Execute Operation**
Use the relevant context file(s) to complete the user's request

---

## 🏗️ **FILE STRUCTURE OVERVIEW**

```
azure-devops-context.md                    # This file - main navigation
├── azure-setup-context.md                 # Setup instructions
├── azure-commands-context.md              # Command reference
├── azure-ticket-analysis-context.md       # Work item analysis
├── azure-search-context.md                # Search and queries
├── azure-branch-integration-context.md    # Branch workflows
├── azure-commenting-context.md            # Comments and updates
├── azure-flags-context.md                 # Project detection system
└── azure-projects/                        # Project-specific configs
    ├── MyCarMatch/
    │   ├── config.md                      # MCM connection details
    │   └── flags.json                     # MCM detection rules
    └── [ProjectName]/
        ├── config.md                      # Project connection details
        └── flags.json                     # Project detection rules
```

---

## 🎯 **EFFICIENCY PRINCIPLE**

**DO NOT** read all context files at once. Use this navigation system to:
1. ✅ **Read ONLY what you need** for the specific user request
2. ✅ **Check setup status first** - avoid wasting time if not configured
3. ✅ **Detect project context** before loading project-specific settings
4. ✅ **Use semantic intent matching** to pick the right context file
5. ✅ **Load project config last** - only after knowing which project

**EXAMPLE WORKFLOW:**
```
User: "Analyze ticket #12345 for MyCarMatch"
→ Check setup status (if 0, setup first)
→ Intent: Ticket Analysis → Read azure-ticket-analysis-context.md
→ Project: MyCarMatch → Read azure-projects/MyCarMatch/config.md
→ Execute analysis with project-specific settings
```

---

## 🔄 **INTEGRATION WITH CONTEXT-REFERER**

This Azure DevOps system works **in parallel** with the existing context-referer.mdc flagging system:

- **Context-Referer**: Handles general workflow detection (branch creation, check-in/out, etc.)
- **Azure Flags**: Handles project-specific Azure DevOps detection and routing

### **Context Integration Map**
```
WORKFLOW_INTEGRATIONS:
  check_in_out:
    - trigger: "Work item updates during check-in/out"
    - context_file: "checkin-checkout-context.md"
    - integration_points:
        - Update work item status
        - Add time tracking comments
        - Link check-in messages to tickets
  
  branch_creation:
    - trigger: "Creating branches for Azure tickets"
    - context_file: "branch-creation-context.md"
    - integration_points:
        - Validate ticket exists
        - Follow naming conventions
        - Link branch to work item
        
  release_management:
    - trigger: "Release and deployment workflows"
    - context_file: "release-management-context.md"
    - integration_points:
        - Update release tickets
        - Generate release notes
        - Track deployment status
```

Both systems can be active simultaneously - use context-referer for general workflow, then Azure flags for project-specific Azure operations.

---

## 📝 **SETUP COMPLETION PROTOCOL**

When Azure DevOps setup is completed via `azure-setup-context.md`, the AI must:

1. ✅ **Verify connection** to Azure DevOps services
2. ✅ **Test with sample ticket** (if available)
3. ✅ **Update this file**: Change `AZURE_DEVOPS_SETUP_STATUS: 0` to `AZURE_DEVOPS_SETUP_STATUS: 1`
4. ✅ **Confirm setup** to user: "Azure DevOps integration is now configured and ready to use"

**Setup Flag Update Location**: Line 4 of this file
```
AZURE_DEVOPS_SETUP_STATUS: 1  # Update this line when setup complete
```

---

## 🚀 **READY FOR OPERATIONS**

When `AZURE_DEVOPS_SETUP_STATUS = 1`, you can handle any Azure DevOps request efficiently by:
- Using semantic intent detection
- Reading only the relevant context file
- Loading project-specific configuration
- Executing with comprehensive guidance 

## 🔍 **BOARD COLUMN QUERYING - IMPORTANT AI GUIDANCE**

### **Key Fields Understanding**
```
CRITICAL_FIELDS:
  board_column: "[System.BoardColumn]"      # The visual column on the board
  state: "[System.State]"                   # The work item's state
  board_lane: "[System.BoardLane]"          # The swim lane on the board
  board_done: "[System.BoardColumnDone]"    # Whether item is in "done" state of column
```

### **Common Pitfalls & Solutions**
1. **State vs Board Column**
   - ❌ `[System.State] = 'In Dev Testing'`  # Often incorrect
   - ✅ `[System.BoardColumn] = 'In Dev Testing'`  # Usually correct
   
2. **Column Names with Spaces**
   - ❌ `'Dev Testing'`  # Incomplete name
   - ✅ `'In Dev Testing'`  # Full column name

### **Script Generation Guidelines**

#### **PowerShell Script Template**
```powershell
# Template for board column queries
$wiql = @{
    query = "SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo] 
            FROM WorkItems 
            WHERE [System.TeamProject] = 'MyCarMatch' 
            AND [System.BoardColumn] = '{COLUMN_NAME}'
            ORDER BY [System.ChangedDate] DESC"
}
```

#### **Quick Query Generation**
```powershell
# Function to generate column query
function Get-BoardColumnItems {
    param(
        [string]$columnName,
        [string]$project = "MyCarMatch"
    )
    
    $wiql = @{
        query = "SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo] 
                FROM WorkItems 
                WHERE [System.TeamProject] = '$project' 
                AND [System.BoardColumn] = '$columnName'
                ORDER BY [System.ChangedDate] DESC"
    }
    # ... rest of query logic
}
```

### **AI Assistant Instructions**

#### **Query Approach Priority**
1. **First Attempt**: Use `[System.BoardColumn]` for board view queries
2. **Second Attempt**: Check column name exactly as shown in board
3. **Third Attempt**: Consider column + done state combination

#### **Script Generation Rules**
```
SCRIPT_GENERATION_RULES:
  1. Always use [System.BoardColumn] for board view queries
  2. Include error handling for authentication
  3. Use proper field names with brackets
  4. Consider spaces in column names
  5. Include basic fields: Id, Title, State, AssignedTo
```

#### **Common Board Columns**
```
KNOWN_COLUMNS:
  development:
    display: "Development"
    done_state: true/false
  dev_testing:
    display: "In Dev Testing"
    done_state: false
  ready_staging:
    display: "Ready for Staging"
    done_state: false
```

### **Troubleshooting Guide**
1. **No Results Found**
   - Check exact column name from board
   - Verify using BoardColumn instead of State
   - Confirm project name is correct
   
2. **Authentication Issues**
   - Ensure az cli is logged in
   - Check token expiration
   - Verify project access permissions

3. **Query Syntax**
   - Use proper field brackets
   - Check for exact column names
   - Verify project name case

### **Best Practices for AI Assistants**
```
AI_ASSISTANT_WORKFLOW:
  1. Verify board column name first
  2. Use BoardColumn field for queries
  3. Generate complete scripts with error handling
  4. Include all necessary authentication steps
  5. Add helpful output formatting
```

## 📚 **AI LEARNINGS REPOSITORY**

### **Purpose & Maintenance Instructions**
```
REPOSITORY_RULES:
  purpose: "Capture and share key learnings from AI interactions"
  when_to_update: 
    - After discovering better approaches
    - When encountering common pitfalls
    - After solving non-obvious issues
    - When finding more efficient methods
  update_guidelines:
    - Keep entries focused and concise
    - Include both problem and solution
    - Add clear examples
    - Categorize properly
    - Remove outdated information
```

### **How to Update This Repository**
```
UPDATE_WORKFLOW:
  1. Identify new learning:
     - Was this a non-obvious solution?
     - Did we try multiple approaches?
     - Is this a common pitfall?
  
  2. Document the learning:
     - Problem: What was the challenge?
     - Solution: What worked?
     - Why: Why is this the better approach?
  
  3. Choose correct section:
     - Add to existing category if relevant
     - Create new category if needed
     - Update category name if scope expanded
  
  4. Format consistently:
     - Use clear examples
     - Include ❌ wrong approaches
     - Include ✅ correct approaches
     - Add brief explanations
```

### **Current Learnings Categories**

#### **1. Board & Column Queries**
*Learned: 2024-01-21*
```
LEARNING:
  problem: "Querying items in specific board columns fails when using State field"
  attempts:
    - ❌ Using System.State
    - ❌ Using partial column names
    - ✅ Using System.BoardColumn with exact name
  why_it_matters: "Board columns and states are different concepts in Azure DevOps"
  example_solution: "[System.BoardColumn] = 'In Dev Testing'"
```

#### **2. Script Generation**
*Learned: 2024-01-21*
```
LEARNING:
  problem: "Generated scripts need consistent authentication and error handling"
  solution: "Use template with auth token and proper field names"
  key_components:
    - Azure CLI token authentication
    - WIQL query with proper brackets
    - Error handling for common issues
```

### **Template for Adding New Learnings**
```
#### **{Category Name}**
*Learned: {YYYY-MM-DD}*
```
LEARNING:
  problem: "{Clear problem statement}"
  attempts:
    - ❌ {Wrong approach}
    - ✅ {Correct approach}
  why_it_matters: "{Explanation}"
  example_solution: "{Code or process example}"
```

### **Categories to Consider**
- Query Optimization
- Authentication Handling
- Error Resolution
- Performance Improvements
- User Experience
- Integration Patterns
- Common Pitfalls
- Best Practices 