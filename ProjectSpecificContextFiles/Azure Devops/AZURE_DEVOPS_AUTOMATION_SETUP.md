# Azure DevOps Automation Setup Guide - Simplified Current Active Release

## 🎯 What This System Does

This automation system provides **instant branch creation** and **current active release management** using Azure DevOps native capabilities:

1. **Branch Creation**: When work items move to "In Development" → Instantly creates `Feature/AzureTicket{ID}` branches and associates them with work items
2. **UAT Release**: When work items move to "Ready For UAT" → Adds to current `UATRelease-Current` branch (creates if none exists)
3. **Live Release**: When work items move to "Release" → Adds to current `LiveRelease-Current` branch (creates if none exists, matches UAT release ID)

## 🌟 **New Simplified Approach - No Timers!**

### **How It Works:**
- **UAT**: All work items go into `UATRelease-Current` branch until you manually finalize it
- **Live**: All work items go into `LiveRelease-Current` branch until you manually finalize it
- **Finalization**: When ready, simply rename the branch (e.g., `UATRelease-Completed-20240115`) and the next work item will create a new `*-Current` branch

### **Benefits:**
- ✅ **No complex timers** - Immediate processing
- ✅ **Complete control** - You decide when releases are finalized
- ✅ **Simpler logic** - Just check for existing release, add to it or create new
- ✅ **Better workflow** - Works like real development teams work

**Total setup time: 30-45 minutes**

---

## 📋 Prerequisites

### Required Information
Before starting, gather this information:

| Item | Example | Your Value |
|------|---------|------------|
| **Organization URL** | `https://dev.azure.com/YourCompany` | `_____________` |
| **Project Name** | `MyCarMatch` | `_____________` |
| **Repository Name** | `MyCarMatch` | `_____________` |
| **Default Branch** | `main` or `master` | `_____________` |

### Board Column Requirements
Your Azure DevOps board must have these **exact** column names:
- ✅ **"In Development"** - For instant branch creation
- ✅ **"Ready For UAT"** - For UAT release management  
- ✅ **"Release"** - For Live release management

### Required Permissions
You need **Project Administrator** permissions or these specific permissions:
- ✅ **Work Items**: Read & Write
- ✅ **Build**: Read & Execute 
- ✅ **Code**: Read & Write
- ✅ **Service Hooks**: Read & Write
- ✅ **Pull Requests**: Read & Write

---

## 🏗️ Step 1: Create Personal Access Token (PAT)

### 1.1 Generate PAT
1. Go to your Azure DevOps organization
2. Click your profile picture (top right) → **Personal access tokens**
3. Click **+ New Token**
4. Configure the token:
   - **Name**: `DevOps Automation Token`
   - **Expiration**: 1 year (or your preference)
   - **Scopes**: Select these specific scopes:
     - ✅ **Work Items**: Read & Write
     - ✅ **Build**: Read & Execute
     - ✅ **Code**: Read & Write
     - ✅ **Service Hooks**: Read & Write
     - ✅ **Pull Request**: Read & Write
5. Click **Create**
6. **IMPORTANT**: Copy the token immediately - you won't see it again!

### 1.2 Store Your PAT Securely
```
Your PAT: _________________________________
```
Keep this secure - treat it like a password!

---

## 🏗️ Step 2: Update Pipeline Configuration Files

### 2.1 Edit Branch Creation Pipeline
Open `azure-pipelines-branch-creator.yml` and replace these values:

```yaml
# Pipeline variables - REPLACE THESE WITH YOUR VALUES
variables:
  - name: organizationUrl
    value: 'https://dev.azure.com/YourOrganization'  # ← YOUR ORGANIZATION URL
  - name: projectName
    value: 'YourProjectName'                         # ← YOUR PROJECT NAME
  - name: repositoryName
    value: 'YourRepositoryName'                      # ← YOUR REPOSITORY NAME
  - name: defaultBranch
    value: 'main'                                    # ← YOUR DEFAULT BRANCH
```

### 2.2 Edit UAT Release Pipeline
Open `azure-pipelines-uat-release.yml` and replace the same values:

```yaml
# Pipeline variables - REPLACE THESE WITH YOUR VALUES
variables:
  - name: organizationUrl
    value: 'https://dev.azure.com/YourOrganization'  # ← YOUR ORGANIZATION URL
  - name: projectName
    value: 'YourProjectName'                         # ← YOUR PROJECT NAME
  - name: repositoryName
    value: 'YourRepositoryName'                      # ← YOUR REPOSITORY NAME
  - name: defaultBranch
    value: 'main'                                    # ← YOUR DEFAULT BRANCH
  - name: uatReleaseBranch
    value: 'UATRelease-Current'                      # ← CURRENT UAT BRANCH NAME
```

### 2.3 Edit Live Release Pipeline
Open `azure-pipelines-live-release.yml` and replace the same values:

```yaml
# Pipeline variables - REPLACE THESE WITH YOUR VALUES
variables:
  - name: organizationUrl
    value: 'https://dev.azure.com/YourOrganization'  # ← YOUR ORGANIZATION URL
  - name: projectName
    value: 'YourProjectName'                         # ← YOUR PROJECT NAME
  - name: repositoryName
    value: 'YourRepositoryName'                      # ← YOUR REPOSITORY NAME
  - name: defaultBranch
    value: 'main'                                    # ← YOUR DEFAULT BRANCH
  - name: liveReleaseBranch
    value: 'LiveRelease-Current'                     # ← CURRENT LIVE BRANCH NAME
```

---

## 🏗️ Step 3: Create Azure Pipelines

### 3.1 Create Branch Creation Pipeline

1. **Go to Azure DevOps** → Your Project → **Pipelines**
2. **Click "New Pipeline"**
3. **Select "Azure Repos Git"** (or your source control)
4. **Select your repository**
5. **Choose "Existing Azure Pipelines YAML file"**
6. **Select path**: `/azure-pipelines-branch-creator.yml`
7. **Click "Continue"**
8. **Click "Save"** (don't run it yet)

### 3.2 Get Branch Creation Pipeline ID
After saving, you'll see a URL like:
```
https://dev.azure.com/YourOrg/YourProject/_build?definitionId=123
```
The Pipeline ID is **123** (the number after `definitionId=`)

**Record this:** Branch Creation Pipeline ID: `_______`

### 3.3 Create UAT Release Pipeline

1. **Click "New Pipeline"** again
2. **Select "Azure Repos Git"** 
3. **Select your repository**
4. **Choose "Existing Azure Pipelines YAML file"**
5. **Select path**: `/azure-pipelines-uat-release.yml`
6. **Click "Continue"**
7. **Click "Save"**

### 3.4 Get UAT Release Pipeline ID
**Record this:** UAT Release Pipeline ID: `_______`

### 3.5 Create Live Release Pipeline

1. **Click "New Pipeline"** again
2. **Select "Azure Repos Git"**
3. **Select your repository**
4. **Choose "Existing Azure Pipelines YAML file"**
5. **Select path**: `/azure-pipelines-live-release.yml`
6. **Click "Continue"**
7. **Click "Save"**

### 3.6 Get Live Release Pipeline ID
**Record this:** Live Release Pipeline ID: `_______`

---

## 🏗️ Step 4: Set Up Service Hooks

### 4.1 Set Up Branch Creation Hook

Open PowerShell and run:

```powershell
.\Setup-BranchCreationServiceHook.ps1 -OrganizationUrl "https://dev.azure.com/YourOrg" -ProjectName "YourProject" -PersonalAccessToken "YourPAT" -PipelineId "123"
```

**Replace:**
- `YourOrg` with your organization name
- `YourProject` with your project name  
- `YourPAT` with your Personal Access Token
- `123` with your Branch Creation Pipeline ID

### 4.2 Set Up UAT Release Hook

```powershell
.\Setup-UATReleaseServiceHook.ps1 -OrganizationUrl "https://dev.azure.com/YourOrg" -ProjectName "YourProject" -PersonalAccessToken "YourPAT" -PipelineId "456"
```

**Replace `456`** with your UAT Release Pipeline ID

### 4.3 Set Up Live Release Hook

```powershell
.\Setup-LiveReleaseServiceHook.ps1 -OrganizationUrl "https://dev.azure.com/YourOrg" -ProjectName "YourProject" -PersonalAccessToken "YourPAT" -PipelineId "789"
```

**Replace `789`** with your Live Release Pipeline ID

---

## 🎯 Step 5: How to Use the System

### **Workflow Overview:**

```
Work Item → "In Development" → ⚡ Instant: Feature/AzureTicket{ID} branch
     ↓
Work Item → "Ready For UAT" → 🧪 Added to UATRelease-Current + PR
     ↓  
Work Item → "Release" → 🚀 Added to LiveRelease-Current + PR
```

### **5.1 Branch Creation (Instant)**
1. Move work item to **"In Development"**
2. Pipeline automatically creates `Feature/AzureTicket{ID}` branch
3. Work item gets commented with branch info
4. Start developing!

### **5.2 UAT Release Management** 
1. Move work item(s) to **"Ready For UAT"**
2. Pipeline automatically:
   - Adds to existing `UATRelease-Current` branch OR creates new one
   - Creates/updates pull request with all UAT work items
   - Comments on work items with release info

### **5.3 Live Release Management**
1. Move work item(s) to **"Release"**  
2. Pipeline automatically:
   - Adds to existing `LiveRelease-Current` branch OR creates new one
   - Creates/updates pull request with all Live work items
   - Matches UAT release ID for traceability
   - Comments on work items with release info

### **5.4 Finalizing Releases**

When you're ready to finalize a release:

**For UAT:**
1. Complete UAT testing
2. Manually rename `UATRelease-Current` → `UATRelease-Completed-20240115`
3. Next UAT work item will create a new `UATRelease-Current`

**For Live:**
1. Complete production deployment
2. Manually rename `LiveRelease-Current` → `LiveRelease-Deployed-20240115` 
3. Next Live work item will create a new `LiveRelease-Current`

---

## 🔧 How Master/Develop Branches Work

### **Default Branch Strategy:**
- All feature branches are created from your **default branch** (main/master)
- All release branches are created from your **default branch**
- You control merging through pull requests

### **If You Use Git Flow:**
- Set `defaultBranch` to `develop` in all pipeline files
- Feature branches will be created from `develop`
- Release branches will be created from `develop`
- You manually merge releases to `master` when ready

### **Branch Association:**
- Work items are tagged with `AutoBranch-{branchname}` for tracking
- UAT/Live releases find associated feature branches automatically
- Release IDs provide traceability between UAT and Live

---

## ✅ Testing Your Setup

### Test 1: Branch Creation
1. Create a work item
2. Move it to "In Development"
3. Check if `Feature/AzureTicket{ID}` branch is created
4. Verify work item has comments

### Test 2: UAT Release
1. Move work item to "Ready For UAT"
2. Check if `UATRelease-Current` branch is created
3. Verify pull request is created
4. Check work item comments

### Test 3: Live Release
1. Move work item to "Release"
2. Check if `LiveRelease-Current` branch is created  
3. Verify pull request is created
4. Check release ID matches UAT

### Test 4: Adding to Existing Release
1. Move another work item to "Ready For UAT"
2. Verify it's added to existing `UATRelease-Current`
3. Check PR is updated with new work item

---

## 🚨 Troubleshooting

### Common Issues:

**Pipeline not triggering:**
- Check service hook configuration
- Verify PAT permissions
- Check board column names are exact matches

**Branch not created:**
- Verify repository permissions
- Check default branch name in configuration
- Ensure PAT has Code permissions

**Work items not found:**
- Check WIQL query syntax
- Verify project name in configuration
- Ensure work items are in correct state

**Pull request errors:**
- Verify repository name
- Check Pull Request permissions in PAT
- Ensure branch exists before PR creation

### **Getting Help:**
1. Check pipeline logs in Azure DevOps
2. Verify all configuration values
3. Test PAT permissions manually
4. Check service hook trigger history

---

## 📈 Future Enhancements

You can easily extend this system:

1. **Add more states** (e.g., "Code Review", "Testing")
2. **Customize branch naming** conventions
3. **Add approval workflows** to releases
4. **Integrate with deployment pipelines**
5. **Add Slack/Teams notifications**
6. **Custom work item field updates**

The system is designed to be **modular and extensible** - each pipeline can be modified independently!

---

## 🎉 You're Done!

Your Azure DevOps automation is now set up with the simplified "Current Active Release" approach. This system will:

- ✅ Create branches instantly when development starts
- ✅ Manage current active UAT releases 
- ✅ Manage current active Live releases
- ✅ Provide full traceability between UAT and Live
- ✅ Keep work items updated automatically
- ✅ Give you complete control over release timing

**No timers, no complexity - just simple, effective automation!** 🚀 