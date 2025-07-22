# Azure DevOps Project Flags Context

## 🎯 **PROJECT DETECTION SYSTEM**

This file contains the flagging system for Azure DevOps project detection, similar to the context-referer.mdc flagging system. The AI uses this to automatically detect which project the user is working with.

---

## 🔍 **FLAG DETECTION ALGORITHM**

### **Detection Process**
```javascript
function detectAzureProject(prompt, workingDirectory, branchName, gitRemote) {
  const scores = {}
  const promptLower = prompt.toLowerCase()
  
  // Load all project flags from azure-projects/*/flags.json
  const projectFlags = loadAllProjectFlags()
  
  for (const project of projectFlags) {
    scores[project.project_name] = 0
    
    // 1. EXACT PHRASE MATCHING (highest confidence)
    for (const phrase of project.exact_phrases) {
      if (promptLower.includes(phrase.toLowerCase())) {
        scores[project.project_name] += 5
      }
    }
    
    // 2. KEYWORD SEMANTIC MATCHING
    const keywordMatches = project.detection_keywords.filter(keyword => 
      promptLower.includes(keyword.toLowerCase())
    )
    scores[project.project_name] += keywordMatches.length * 2
    
    // 3. WORKING DIRECTORY MATCHING
    if (workingDirectory) {
      for (const pattern of project.working_directory_patterns) {
        if (matchesPattern(workingDirectory, pattern)) {
          scores[project.project_name] += 4
        }
      }
    }
    
    // 4. BRANCH NAME MATCHING
    if (branchName) {
      for (const pattern of project.branch_patterns) {
        if (matchesPattern(branchName, pattern)) {
          scores[project.project_name] += 3
        }
      }
    }
    
    // 5. GIT REMOTE MATCHING
    if (gitRemote) {
      for (const pattern of project.git_remote_patterns) {
        if (gitRemote.includes(pattern)) {
          scores[project.project_name] += 6  // High confidence
        }
      }
    }
    
    // 6. BUSINESS CONTEXT MATCHING
    const businessMatches = project.business_context.filter(term => 
      promptLower.includes(term.toLowerCase())
    )
    scores[project.project_name] += businessMatches.length
    
    // 7. PROJECT-SPECIFIC TERMS
    const specificMatches = project.project_specific_terms.filter(term => 
      promptLower.includes(term.toLowerCase())
    )
    scores[project.project_name] += specificMatches.length * 2
  }
  
  // Return project with highest score above threshold
  const topProject = Object.keys(scores).reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  )
  
  if (scores[topProject] >= 2) {  // Configurable threshold
    return topProject
  }
  
  return null  // No project detected
}
```

---

## 📁 **PROJECT FLAGS STRUCTURE**

### **Flag File Location**
Each project has its flags defined in:
```
azure-projects/{PROJECT_NAME}/flags.json
```

### **Flag File Schema**
```json
{
  "project_name": "ProjectName",
  "project_abbreviation": "ABBR",
  "detection_keywords": [
    "keyword1", "keyword2", "keyword3"
  ],
  "exact_phrases": [
    "Exact Project Name", "Project Full Name"
  ],
  "working_directory_patterns": [
    "*/ProjectName/*", "*projectname*"
  ],
  "branch_patterns": [
    "*/feature/*project*", "*/hotfix/*project*"
  ],
  "git_remote_patterns": [
    "https://dev.azure.com/org/ProjectName"
  ],
  "organization_identifiers": [
    "orgname", "company"
  ],
  "business_context": [
    "business term1", "business term2"
  ],
  "project_specific_terms": [
    "specific feature", "specific component"
  ],
  "priority_score": 100,
  "confidence_threshold": 2
}
```

---

## 🎯 **DETECTION METHODS**

### **1. Working Directory Detection**
```bash
# Extract project from current working directory
PWD_PROJECT=$(basename "$PWD")
PARENT_PROJECT=$(basename "$(dirname "$PWD")")

# Example detections:
# /FiveFriday/MCM/MCM_New/MyCarMatch → MyCarMatch
# /Projects/MyCarMatch/src → MyCarMatch
# /dev/mycarmatch-app → MyCarMatch (via flags)
```

### **2. Git Remote Detection**
```bash
# Extract project from git remote URL
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

# Example patterns:
# https://dev.azure.com/datasolve/MyCarMatch → MyCarMatch
# https://datasolve.visualstudio.com/MyCarMatch → MyCarMatch
# git@ssh.dev.azure.com:v3/datasolve/MyCarMatch → MyCarMatch
```

### **3. Branch Name Detection**
```bash
# Extract project hints from current branch
BRANCH_NAME=$(git branch --show-current 2>/dev/null)

# Example patterns:
# feature/AzureTicketBranch-12345 → Generic Azure ticket
# feature/mycarmatch-login-fix → MyCarMatch
# hotfix/mcm-dealer-registration → MyCarMatch (via MCM abbreviation)
```

### **4. User Prompt Analysis**
```javascript
// Semantic analysis of user input
const promptAnalysis = {
  // Direct project mentions
  "analyze ticket #12345 for MyCarMatch" → MyCarMatch
  "MCM has a bug in dealer registration" → MyCarMatch
  "check the car matching platform status" → MyCarMatch
  
  // Context clues
  "the dealer registration is not working" → MyCarMatch (business context)
  "vehicle search is broken" → MyCarMatch (project-specific terms)
  "datasolve project has issues" → MyCarMatch (organization identifier)
}
```

---

## 🚀 **AI ASSISTANT INTEGRATION**

### **Detection Workflow**
```
1. User makes Azure DevOps request
2. AI runs detectAzureProject() function
3. Loads project-specific configuration from azure-projects/{PROJECT}/config.md
4. Applies project context to Azure operations
5. Uses project URLs, settings, and business context
```

### **Fallback Behavior**
```
IF no project detected:
  → Ask user for Azure DevOps ticket link
  → Extract organization and project from URL
  → Create new project configuration
  → Add project to flags system

IF multiple projects detected:
  → Present options to user
  → Allow user to select correct project
  → Remember selection for current session
```

### **Example AI Response Flow**
```
User: "Check the dealer registration bug"

AI Detection Process:
1. detectAzureProject() → "dealer registration" matches MyCarMatch business_context
2. Load azure-projects/MyCarMatch/config.md
3. Use MyCarMatch connection settings
4. Search for bugs containing "dealer registration"
5. Provide MyCarMatch-specific context and links
```

---

## 📋 **REGISTERED PROJECTS**

### **Current Projects**
- **MyCarMatch** (MCM)
  - File: `azure-projects/MyCarMatch/flags.json`
  - Organization: DataSolve
  - Keywords: mycarmatch, mcm, car match, dealer registration
  - Status: ✅ Active

### **Adding New Projects**
When AI encounters unknown project references:

1. **Ask for Azure DevOps ticket link**
   ```
   I detected a new project reference. Please provide an Azure DevOps ticket link 
   from this project so I can extract the configuration details.
   
   Example: https://yourorg.visualstudio.com/ProjectName/_workitems/edit/12345
   ```

2. **Extract project details from URL**
   - Organization URL
   - Project name
   - Sample ticket ID

3. **Create project configuration**
   - Generate `azure-projects/{PROJECT}/config.md`
   - Generate `azure-projects/{PROJECT}/flags.json`
   - Add to project registry

4. **Test new project**
   - Verify connection
   - Test with sample ticket
   - Confirm project detection works

---

## 🔧 **PROJECT FLAG EXAMPLES**

### **MyCarMatch Project Detection**
```json
{
  "project_name": "MyCarMatch",
  "detection_keywords": ["mycarmatch", "mcm", "car match"],
  "exact_phrases": ["MyCarMatch", "My Car Match"],
  "working_directory_patterns": ["*/MyCarMatch/*", "*/MCM/*"],
  "branch_patterns": ["*/AzureTicketBranch*", "*/feature/*mcm*"],
  "business_context": ["dealer registration", "car matching"],
  "confidence_threshold": 2
}
```

**Detection Examples:**
- ✅ "MCM dealer registration issue" → Score: 6 (keyword + business context)
- ✅ Working in `/FiveFriday/MCM/` → Score: 4 (directory pattern)
- ✅ Branch `feature/mycarmatch-fix` → Score: 3 (branch pattern)
- ✅ "MyCarMatch has a bug" → Score: 5 (exact phrase)

---

## 🎯 **DETECTION PRIORITY**

### **Scoring System**
1. **Git Remote Match**: 6 points (highest confidence)
2. **Exact Phrase Match**: 5 points
3. **Working Directory Match**: 4 points
4. **Branch Pattern Match**: 3 points
5. **Keyword Match**: 2 points each
6. **Business Context**: 1 point each
7. **Project-Specific Terms**: 2 points each

### **Threshold Configuration**
- **Default Threshold**: 2 points minimum
- **High Confidence**: 5+ points (proceed automatically)
- **Medium Confidence**: 2-4 points (proceed with confirmation)
- **Low Confidence**: <2 points (ask for clarification)

---

## 🔄 **INTEGRATION WITH CONTEXT-REFERER**

This Azure flags system works **alongside** the existing context-referer.mdc system:

### **Parallel Operation**
- **Context-Referer**: Detects general workflows (branch creation, check-in/out, releases)
- **Azure Flags**: Detects specific Azure DevOps projects and configurations
- **Combined**: Context-referer workflow + Azure project context = Complete solution

### **Example Combined Detection**
```
User: "Create branch for ticket #12345 in MCM"

Detection Results:
1. Context-Referer: branch_creation flag triggered
2. Azure Flags: MyCarMatch project detected
3. Combined Action: 
   → Read branch-creation-context.md (workflow)
   → Read azure-projects/MyCarMatch/config.md (project settings)
   → Create branch with MyCarMatch naming convention
```

---

## 📝 **AI USAGE INSTRUCTIONS**

### **Always Check Project Context First**
```
Before any Azure DevOps operation:
1. Run detectAzureProject() on user input
2. Check working directory and git remote
3. Load appropriate project configuration
4. Apply project-specific settings and context
```

### **When Project Detection Fails**
```
If detectAzureProject() returns null:
1. Ask user for Azure DevOps ticket link
2. Extract project details from URL
3. Offer to create new project configuration
4. Add to flags system for future detection
```

### **Project Context Application**
```
Once project detected:
1. Load azure-projects/{PROJECT}/config.md
2. Use project-specific organization and URLs
3. Apply project-specific branch naming
4. Include project-specific business context
5. Use project-specific test tickets for verification
```

This system ensures efficient, project-aware Azure DevOps operations without requiring users to manually specify project context every time. 