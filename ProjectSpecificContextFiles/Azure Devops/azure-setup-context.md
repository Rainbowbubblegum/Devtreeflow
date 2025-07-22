# Azure DevOps Setup Context

## 🚨 **SETUP REQUIREMENTS CHECKLIST**

Before proceeding with Azure DevOps operations, verify these requirements:

### **Prerequisites**
- [ ] **Azure CLI 2.74.0+** installed
- [ ] **Azure DevOps Extension** installed
- [ ] **PowerShell** available (for image downloads)
- [ ] **Git Repository** with Azure DevOps remote
- [ ] **Network Access** to Azure DevOps services

---

## 🔧 **STEP-BY-STEP SETUP GUIDE**

### **Step 1: Install Azure CLI**
```bash
# Windows (if not installed)
# Download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Verify installation
az --version
```

**Expected Output:**
```
azure-cli                         2.74.0
```

### **Step 2: Install Azure DevOps Extension**
```bash
# Install the extension
az extension add --name azure-devops

# Verify installation
az extension list --query "[?name=='azure-devops'].version" -o tsv
```

### **Step 3: Authenticate with Azure**
```bash
# Login with tenant-level access
az login --allow-no-subscriptions

# Select correct tenant if prompted
# Look for: FiveFriday (Pty) Ltd or similar organization tenant
```

### **Step 4: Auto-Detect Project Configuration**

#### **Method 1: Git Remote Detection (Recommended)**
```bash
# Extract Azure DevOps details from git remote
git remote -v

# Sample outputs to parse:
# origin  https://dev.azure.com/datasolve/MyCarMatch/_git/MyCarMatch (fetch)
# origin  https://datasolve.visualstudio.com/MyCarMatch/_git/MyCarMatch (fetch)
# origin  git@ssh.dev.azure.com:v3/datasolve/MyCarMatch/MyCarMatch (fetch)
```

**AI Parsing Instructions:**
- Extract **Organization** and **Project** from remote URL
- Create project-specific config file in `azure-projects/{project}/config.md`
- Set default base branch (usually `develop`, `master`, or `main`)

#### **Method 2: Azure DevOps Ticket Link**
If user provides a ticket link like:
```
https://yourorg.visualstudio.com/YourProject/_boards/board/t/Team/Stories?workitem=12345
```

Extract:
- **Organization**: `yourorg` → `https://yourorg.visualstudio.com`
- **Project**: `YourProject`
- **Test Ticket ID**: `12345`

#### **Method 3: Manual Configuration**
Ask user for:
- Organization URL (e.g., `https://dev.azure.com/yourorg`)
- Project Name (e.g., `YourProject`)
- Base Branch (e.g., `develop`, `master`, `main`)
- Test Ticket ID (any valid ticket number)

### **Step 5: Configure Azure DevOps Defaults**
```bash
# Configure organization and project
az devops configure --defaults organization="{ORGANIZATION_URL}" project="{PROJECT_NAME}"

# Verify configuration
az devops configure --list
```

### **Step 6: Test Connection**
```bash
# Test with sample ticket (use detected or provided ticket ID)
az boards work-item show --id {TEST_TICKET_ID} --output json

# Test query capability
az boards query --wiql "SELECT [System.Id] FROM WorkItems" --top 1
```

---

## 📁 **PROJECT CONFIGURATION CREATION**

### **Create Project Directory Structure**
```bash
# Create project folder
mkdir -p azure-projects/{PROJECT_NAME}

# Create config file
touch azure-projects/{PROJECT_NAME}/config.md
touch azure-projects/{PROJECT_NAME}/flags.json
```

### **Project Config Template**
Create `azure-projects/{PROJECT_NAME}/config.md`:
```markdown
# {PROJECT_NAME} Azure DevOps Configuration

## Connection Settings
```
ORGANIZATION_URL: {DETECTED_ORGANIZATION_URL}
PROJECT_NAME: {DETECTED_PROJECT_NAME}
PROJECT_GUID: {AUTO_EXTRACTED_OR_TBD}
DEFAULT_BASE_BRANCH: {DETECTED_BASE_BRANCH}
TEST_TICKET_ID: {SAMPLE_TICKET_ID}
PROJECT_WORKING_DIRECTORY: {CURRENT_WORKING_DIRECTORY}
```

## Branch Configuration
```
BRANCH_NAMING_CONVENTION: feature/AzureTicketBranch-{ticket_id}
```

## Status
```
SETUP_COMPLETE: 1
LAST_TESTED: {CURRENT_DATE}
```
```

### **Project Flags Template**
Create `azure-projects/{PROJECT_NAME}/flags.json`:
```json
{
  "project_name": "{PROJECT_NAME}",
  "detection_keywords": [
    "{project_name_lowercase}",
    "{project_abbreviation}",
    "{common_references}"
  ],
  "exact_phrases": [
    "{Project Name}",
    "{PROJECT NAME}",
    "{Project-Name}"
  ],
  "working_directory_patterns": [
    "*/{project_folder}/*",
    "*{project_name}*"
  ],
  "branch_patterns": [
    "*/feature/*{project_name}*",
    "*/hotfix/*{project_name}*"
  ]
}
```

---

## 🧪 **VERIFICATION PROTOCOL**

### **Connection Test Checklist**
- [ ] **Azure CLI** responds to `az --version`
- [ ] **Azure DevOps Extension** installed and listed
- [ ] **Authentication** successful with `az account show`
- [ ] **Organization/Project** configured with `az devops configure --list`
- [ ] **Sample Ticket** accessible with `az boards work-item show --id {TEST_ID}`
- [ ] **Query Capability** working with basic WIQL query
- [ ] **Project Config** created in `azure-projects/{PROJECT}/config.md`
- [ ] **Flags File** created in `azure-projects/{PROJECT}/flags.json`

### **Final Setup Completion**
When all tests pass:

1. ✅ **Update Main Context File**
   ```bash
   # Edit azure-devops-context.md
   # Change: AZURE_DEVOPS_SETUP_STATUS: 0
   # To:     AZURE_DEVOPS_SETUP_STATUS: 1
   ```

2. ✅ **Confirm to User**
   ```
   🎉 Azure DevOps integration setup complete!
   
   ✅ Connected to: {ORGANIZATION_URL}
   ✅ Project: {PROJECT_NAME}
   ✅ Test ticket verified: #{TEST_TICKET_ID}
   ✅ Configuration saved to: azure-projects/{PROJECT}/config.md
   
   You can now use Azure DevOps commands for ticket analysis, searching, and management.
   ```

---

## 🚨 **TROUBLESHOOTING GUIDE**

### **Common Issues & Solutions**

#### **"command not found: az"**
- **Problem**: Azure CLI not installed
- **Solution**: Install Azure CLI from official Microsoft documentation

#### **"extension not found: azure-devops"**
- **Problem**: Azure DevOps extension missing
- **Solution**: Run `az extension add --name azure-devops`

#### **"authentication required"**
- **Problem**: Not logged into Azure
- **Solution**: Run `az login --allow-no-subscriptions`

#### **"organization not configured"**
- **Problem**: Azure DevOps defaults not set
- **Solution**: Run `az devops configure --defaults organization="{URL}" project="{PROJECT}"`

#### **"work item not found"**
- **Problem**: Test ticket ID invalid or no access
- **Solution**: 
  1. Verify ticket ID exists in Azure DevOps web interface
  2. Check project permissions
  3. Try different ticket ID

#### **PowerShell Execution Policy Error**
- **Problem**: PowerShell scripts blocked
- **Solution**: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### **Connection Validation Commands**
```bash
# Test Azure CLI
az --version

# Test authentication
az account show

# Test Azure DevOps access
az devops configure --list

# Test work item access
az boards work-item show --id {TEST_TICKET_ID} --query "fields.['System.Title']" -o tsv

# Test query capability
az boards query --wiql "SELECT TOP 1 [System.Id] FROM WorkItems" --output table
```

---

## 🔧 **AUTO-DETECTION SCRIPTS**

### **Git Remote Parser Script**
```bash
#!/bin/bash
# auto-detect-azure-config.sh

REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [[ $REMOTE_URL =~ https://dev\.azure\.com/([^/]+)/([^/]+) ]]; then
    ORG_NAME="${BASH_REMATCH[1]}"
    PROJECT_NAME="${BASH_REMATCH[2]}"
    ORGANIZATION_URL="https://dev.azure.com/$ORG_NAME"
elif [[ $REMOTE_URL =~ https://([^.]+)\.visualstudio\.com/([^/]+) ]]; then
    ORG_NAME="${BASH_REMATCH[1]}"
    PROJECT_NAME="${BASH_REMATCH[2]}"
    ORGANIZATION_URL="https://$ORG_NAME.visualstudio.com"
elif [[ $REMOTE_URL =~ git@ssh\.dev\.azure\.com:v3/([^/]+)/([^/]+) ]]; then
    ORG_NAME="${BASH_REMATCH[1]}"
    PROJECT_NAME="${BASH_REMATCH[2]}"
    ORGANIZATION_URL="https://dev.azure.com/$ORG_NAME"
else
    echo "Could not parse Azure DevOps remote URL: $REMOTE_URL"
    exit 1
fi

echo "Detected Organization: $ORGANIZATION_URL"
echo "Detected Project: $PROJECT_NAME"
```

### **Project Directory Parser**
```bash
# Extract project from current working directory
PWD_PROJECT=$(basename "$PWD")
PARENT_PROJECT=$(basename "$(dirname "$PWD")")

echo "Current directory project hint: $PWD_PROJECT"
echo "Parent directory project hint: $PARENT_PROJECT"
```

---

## 📝 **SETUP COMPLETION PROTOCOL**

After successful setup, the AI assistant must:

1. **Create Project Configuration**
   - Generate `azure-projects/{PROJECT}/config.md` with detected settings
   - Generate `azure-projects/{PROJECT}/flags.json` with detection rules

2. **Update Main Context Flag**
   - Edit `azure-devops-context.md`
   - Change `AZURE_DEVOPS_SETUP_STATUS: 0` to `AZURE_DEVOPS_SETUP_STATUS: 1`

3. **Verify All Components**
   - Test connection with sample ticket
   - Verify configuration files created
   - Confirm flag status updated

4. **User Confirmation**
   - Provide setup completion summary
   - List key configuration details
   - Explain next steps for Azure DevOps operations

**Setup is complete when AZURE_DEVOPS_SETUP_STATUS = 1 in the main context file.** 