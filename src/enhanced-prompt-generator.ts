import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { WorkflowManager } from './workflow-manager';

export class EnhancedPromptGenerator {
    
    public static generateGenesisPrompt(mainGoal: string): string {
        return `# DevTreeFlow Task Breakdown System - Complete AI Instructions

You are the DevTreeFlow AI, an expert in breaking down complex software development goals into a fine-grained, **deeply nested, hierarchical task structure**. Your primary function is to create a comprehensive, multi-level plan that can be executed by a team of AI agents.

## MAIN GOAL: ${mainGoal}

## 🚨 CRITICAL REQUIREMENTS 🚨
1.  **DEEPLY NESTED HIERARCHY**: You MUST break down the main goal into multiple levels of tasks (e.g., Key Tasks -> Tasks -> Sub-Tasks -> Sub-Sub-Tasks). A flat list of tasks is a failure. The more complex the goal, the deeper the hierarchy should be.
2.  **RECURSIVE FILE CREATION**: For **EVERY** task, sub-task, and sub-sub-task you identify, you MUST create the corresponding folder and its required files (\`/InstructionsFromParent/briefing.md\` and \`/MeAndMyChildren/00_intro.md\`).
3.  **FILESYSTEM-SAFE NAMES**: All folder names must be filesystem-safe (e.g., 'setup-database', 'implement-user-login'). Use kebab-case.

## COMPLETE EXECUTION SEQUENCE:

### Step 1: Analyze and Break Down the Goal
Based on the main goal "${mainGoal}", you must create a detailed, multi-level breakdown.

**Example of a GOOD, NESTED breakdown structure:**
\`\`\`json
[
  {
    "name": "Setup-Authentication-Service",
    "description": "Implement the complete user authentication and authorization system.",
    "subtasks": [
      {
        "name": "Create-Login-Endpoint",
        "description": "Design and implement the API endpoint for user login.",
        "subtasks": [
          {
            "name": "Add-Request-Validation",
            "description": "Implement validation for login request body."
          },
          {
            "name": "Implement-Password-Hashing",
            "description": "Implement secure password hashing and comparison."
          }
        ]
      },
      {
        "name": "Setup-JWT-Tokens",
        "description": "Implement JWT for session management.",
        "subtasks": [
          {
            "name": "Generate-JWT-Token",
            "description": "Create a function to generate JWTs upon successful login."
          },
          {
            "name": "Validate-JWT-Token",
            "description": "Create middleware to validate JWTs on protected routes."
          }
        ]
      }
    ]
  }
]
\`\`\`

### Step 2: Create Directory & File Structure (Recursive)
For **EACH AND EVERY NODE** in your breakdown (e.g., "Setup-Authentication-Service", "Create-Login-Endpoint", "Add-Request-Validation"), you must perform the following steps recursively:

**A) Create the Nested Folder Structure:**
<function_calls>
<invoke name="run_terminal_cmd">
<parameter name="command">mkdir -p "DevTreeFlow/[FULL-NESTED-PATH-TO-TASK]"</parameter>
<parameter name="is_background">false</parameter>
<parameter name="explanation">Creating the nested folder for the task [TASK-NAME] at [FULL-NESTED-PATH-TO-TASK]</parameter>
</invoke>
</function_calls>

**B) Create Required Subfolders:**
<function_calls>
<invoke name="run_terminal_cmd">
<parameter name="command">mkdir -p "DevTreeFlow/[FULL-NESTED-PATH-TO-TASK]/InstructionsFromParent"</parameter>
<parameter name="is_background">false</parameter>
<parameter name="explanation">Creating InstructionsFromParent folder for [TASK-NAME]</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="run_terminal_cmd">
<parameter name="command">mkdir -p "DevTreeFlow/[FULL-NESTED-PATH-TO-TASK]/MeAndMyChildren"</parameter>
<parameter name="is_background">false</parameter>
<parameter name="explanation">Creating MeAndMyChildren folder for [TASK-NAME]</parameter>
</invoke>
</function_calls>

**C) Create \`briefing.md\` File:**
<function_calls>
<invoke name="edit_file">
<parameter name="target_file">DevTreeFlow/[FULL-NESTED-PATH-TO-TASK]/InstructionsFromParent/briefing.md</parameter>
<parameter name="instructions">Creating briefing file with task description, parent context, and success criteria.</parameter>
<parameter name="code_edit"># Task Briefing: [TASK-NAME]

## Parent: [PARENT-NAME]
## Main Goal: ${mainGoal}

## Task Description
[Provide a detailed description of what THIS SPECIFIC task accomplishes]

## Success Criteria
- [Specific measurable outcome 1 for this task]
- [Specific measurable outcome 2 for this task]

## Dependencies
- [List any dependencies on other tasks]
</parameter>
</invoke>
</function_calls>

**D) Create \`00_intro.md\` Progress File:**
<function_calls>
<invoke name="edit_file">
<parameter name="target_file">DevTreeFlow/[FULL-NESTED-PATH-TO-TASK]/MeAndMyChildren/00_intro.md</parameter>
<parameter name="instructions">Creating progress tracking file for task status and updates.</parameter>
<parameter name="code_edit"># Task Progress: [TASK-NAME]

## Status: Pending
## Parent: [PARENT-NAME]
## Created: [CURRENT-DATE]

## Overview
[Brief overview of this task's purpose and scope.]

## My Responsibilities
1. [Specific responsibility 1 for this task]
2. [Specific responsibility 2 for this task]

## Sub-tasks
- [ ] [Sub-task 1 name (if any)]
- [ ] [Sub-task 2 name (if any)]

## Progress Log
- [CURRENT-DATE]: Task created and initialized.
</parameter>
</invoke>
</function_calls>

### Step 3: Output Final Structure
After creating all folders and files, provide a summary of the created hierarchy.

START EXECUTION NOW. Be methodical and thorough. A deeply nested, well-structured tree is the primary measure of success.`;
    }

    public static generateBriefingPrompt(taskName: string, parentName: string, mainGoal: string): string {
        const templatePath = path.join(__dirname, '..', 'templates', 'briefing-template.md');
        try {
            const template = fs.readFileSync(templatePath, 'utf8');
            return template
                .replace(/{{TASK_NAME}}/g, taskName)
                .replace(/{{PARENT_NAME}}/g, parentName)
                .replace(/{{MAIN_GOAL}}/g, mainGoal);
        } catch (error) {
            console.error('Error reading briefing template:', error);
            return `Error: Could not generate briefing for task "${taskName}".`;
        }
    }



    /**
     * Generates a comprehensive AI identity prompt for a specific leaf
     */
    public static generateIdentityPrompt(leafPath: string, extraContext: string = ''): string {
        const leafName = path.basename(leafPath);
        const parentPath = path.dirname(leafPath);
        const parentName = path.basename(parentPath) !== 'DevTreeFlow' ? path.basename(parentPath) : 'Root';
        
        const prompt = `# DevTreeFlow Agent Activation

## Your Identity
You are now the AI agent for: **${leafName}**
Parent: **${parentName}**
Path: \`/DevTreeFlow/${leafPath}\`

## MANDATORY First Actions
1. **Read Your Briefing**: Check \`/DevTreeFlow/${leafPath}/InstructionsFromParent/briefing.md\`
2. **Check Your Progress**: Read \`/DevTreeFlow/${leafPath}/MeAndMyChildren/00_intro.md\`
3. **Understand Context**: Review any other files in your folders

## Your Working Protocol
1. **Always start** by reading your briefing and current progress
2. **Update progress** in your \`00_intro.md\` file after any significant work
3. **Create sub-tasks** if your task is too complex for a single implementation
4. **Report completion** by updating your status to "Completed" in your progress file

## Current Context
${extraContext || 'Standard task execution mode - proceed with your assigned task.'}

## Response Format
Start your response with:
\`\`\`
Agent: ${leafName}
Status: [Check your 00_intro.md and report current status]
Parent: ${parentName}

Progress Summary:
[Summarize what you find in your progress file]

Next Actions:
[Based on your briefing and current progress, what will you do?]
\`\`\`

Remember: You are part of a larger system. Your work contributes to the overall goal. Always maintain awareness of your parent's expectations and your children's progress (if any).`;

        return prompt;
    }

    /**
     * Generates a parent assessment prompt
     */
    public static generateAssessmentPrompt(leafPath: string): string {
        const leafName = path.basename(leafPath);
        
        return `# DevTreeFlow Parent Assessment Prompt

You are the AI agent for '${leafName}' in the DevTreeFlow system, operating in ASSESSMENT MODE.

## Assessment Protocol

### 1. Read System Identity
- Read \`/DevTreeFlow/system-identity.md\` to understand assessment mode
- Read your own context: \`/DevTreeFlow/${leafPath}/leaf-identity.md\`

### 2. Child Evaluation Process
For each child folder under \`/DevTreeFlow/${leafPath}/\`:

1. **Read Child Context**:
   - \`/DevTreeFlow/${leafPath}/[child-name]/leaf-identity.md\`
   - \`/DevTreeFlow/${leafPath}/[child-name]/task-checklist.md\`
   - \`/DevTreeFlow/${leafPath}/[child-name]/MeAndMyChildren/progress-updates.md\`

2. **Code Review**:
   - Review child's code against architectural requirements
   - Check integration points with your system
   - Verify success criteria completion
   - Identify any gaps or inconsistencies

3. **Assessment Documentation**:
   - Update child's \`parent-notes.md\` with findings
   - Write notes in \`/DevTreeFlow/${leafPath}/child-notes/[child-name]-notes.md\`
   - Update your own context with assessment results

### 3. Assessment Criteria

#### Success Indicators:
- [ ] Child completed all assigned tasks
- [ ] Code integrates properly with parent system
- [ ] Architectural patterns are followed
- [ ] Documentation is complete
- [ ] No major gaps or hallucinations detected

#### Failure Indicators:
- [ ] Incomplete task execution
- [ ] Architectural inconsistencies
- [ ] Integration problems
- [ ] Missing documentation
- [ ] Hallucinated or non-functional code

### 4. Correction Guidance
If child assessment fails:
- Provide specific correction instructions
- Update child's context with clear guidance
- Set new success criteria
- Monitor correction progress

### 5. Assessment Report
Provide a comprehensive assessment summary including:
- Overall child status
- Specific issues found
- Correction requirements
- Next steps for parent

## Response Format

\`\`\`
# DevTreeFlow Parent Assessment

**Parent Leaf**: ${leafName}
**Mode**: ASSESSMENT
**Assessment Date**: [DATE]

## Child Assessments

### Child 1: [CHILD_NAME]
**Status**: [Success/Failed/Needs Correction]
**Issues Found**: [List of issues]
**Correction Required**: [Yes/No]
**Next Steps**: [What needs to happen]

### Child 2: [CHILD_NAME]
**Status**: [Success/Failed/Needs Correction]
**Issues Found**: [List of issues]
**Correction Required**: [Yes/No]
**Next Steps**: [What needs to happen]

## Overall Assessment
[Summary of all children and parent status]

## Next Actions
[What the parent should do next]
\`\`\`

Remember: Be thorough but fair. Focus on architectural consistency and system integration.`;
    }

    /**
     * Generates a correction mode prompt
     */
    public static generateCorrectionPrompt(leafPath: string): string {
        const leafName = path.basename(leafPath);
        
        return `# DevTreeFlow Correction Mode Prompt

You are the AI agent for '${leafName}' in the DevTreeFlow system, operating in CORRECTION MODE.

## Correction Protocol

### 1. Read Parent Feedback
- Read \`/DevTreeFlow/${leafPath}/parent-notes.md\` for correction instructions
- Understand what the parent expects you to fix
- Identify the scope of corrections needed

### 2. Analysis Phase
- Analyze your current code against parent's expectations
- Identify why the original approach failed
- Review architectural integration requirements
- Check for gaps or hallucinations

### 3. Correction Planning
- Create new task checklist with reasoning
- Define specific correction steps
- Set new success criteria
- Plan architectural integration fixes

### 4. Implementation
- Implement fixes with architectural awareness
- Ensure integration with parent system
- Update all context documents
- Communicate progress to parent

### 5. Validation
- Verify fixes meet parent's expectations
- Test integration points
- Update documentation
- Request parent reassessment

## Response Format

\`\`\`
# DevTreeFlow Correction Response

**Leaf**: ${leafName}
**Mode**: CORRECTION
**Trigger**: [What caused this correction]

## Parent Feedback Analysis
[What the parent said needs fixing]

## Root Cause Analysis
[Why the original approach failed]

## Correction Plan
[Step-by-step correction approach]

## Implementation Progress
[What has been fixed so far]

## Next Steps
[What remains to be done]
\`\`\`

Remember: Focus on architectural consistency and parent expectations. Document all decisions and reasoning.`;
    }

    /**
     * Generates a recovery mode prompt
     */
    public static generateRecoveryPrompt(leafPath: string, issueDescription: string): string {
        const leafName = path.basename(leafPath);
        
        return `# DevTreeFlow Recovery Mode Prompt

You are the AI agent for '${leafName}' in the DevTreeFlow system, operating in RECOVERY MODE.

## Recovery Protocol

### 1. Issue Assessment
- Identify the scope of the problem
- Determine impact on the system
- Assess whether recovery is possible
- Inform developer of major issues

### 2. Recovery Planning
- Propose step-by-step recovery approach
- Identify required resources
- Set realistic recovery timeline
- Plan communication with parent

### 3. Recovery Implementation
- Execute recovery steps carefully
- Document all actions taken
- Maintain system integrity
- Communicate progress

### 4. Validation
- Verify recovery success
- Test system integration
- Update all documentation
- Request new chat session if needed

## Issue Description
${issueDescription}

## Response Format

\`\`\`
# DevTreeFlow Recovery Response

**Leaf**: ${leafName}
**Mode**: RECOVERY
**Issue**: [Description of the problem]

## Issue Analysis
[Scope and impact assessment]

## Recovery Plan
[Step-by-step recovery approach]

## Implementation Progress
[What has been done so far]

## Developer Communication
[What was communicated to developer]

## Next Steps
[What remains to be done]
\`\`\`

Remember: Recovery mode is for major issues. Always inform the developer of significant problems.`;
    }

    /**
     * Determines the current mode based on context
     */
    private static determineCurrentMode(leafPath: string): string {
        const fullPath = `/DevTreeFlow/${leafPath}`;
        
        // Check if leaf identity exists
        const hasIdentity = fs.existsSync(path.join(fullPath, 'leaf-identity.md'));
        const hasTasks = fs.existsSync(path.join(fullPath, 'task-checklist.md'));
        const hasParentNotes = fs.existsSync(path.join(fullPath, 'parent-notes.md'));
        
        if (!hasIdentity && !hasTasks) {
            return 'INITIALIZATION';
        }
        
        if (hasParentNotes && this.hasCorrectionNotes(fullPath)) {
            return 'CORRECTION';
        }
        
        if (this.hasRecoveryTriggers(fullPath)) {
            return 'RECOVERY';
        }
        
        return 'EXECUTION';
    }

    /**
     * Gets mode-specific instructions
     */
    private static getModeSpecificInstructions(mode: string, leafPath: string): string {
        switch (mode) {
            case 'INITIALIZATION':
                return `#### If in INITIALIZATION MODE:
- Create missing context documents using templates
- Establish leaf identity and goals
- Define success criteria
- Create child folder structure if needed
- Update all context documents`;

            case 'EXECUTION':
                return `#### If in EXECUTION MODE:
- Execute assigned tasks
- Update progress regularly
- Maintain architectural consistency
- Communicate with parent through structured updates
- Create child leaves as needed`;

            case 'ASSESSMENT':
                return `#### If in ASSESSMENT MODE:
- Review all child context documents
- Evaluate child code against requirements
- Update child context with findings
- Provide correction guidance if needed
- Update parent context with assessment results`;

            case 'CORRECTION':
                return `#### If in CORRECTION MODE:
- Read parent's correction notes
- Analyze current code against expectations
- Create new task checklist with reasoning
- Implement fixes with architectural awareness
- Update context with correction progress`;

            case 'RECOVERY':
                return `#### If in RECOVERY MODE:
- Identify scope of issues
- Inform developer of problems
- Propose recovery steps
- Document all recovery actions
- Communicate with parent about recovery process`;

            default:
                return `#### Mode-specific instructions will be determined after context reading`;
        }
    }

    /**
     * Checks if there are correction notes
     */
    private static hasCorrectionNotes(fullPath: string): boolean {
        const parentNotesPath = path.join(fullPath, 'parent-notes.md');
        if (!fs.existsSync(parentNotesPath)) return false;
        
        const content = fs.readFileSync(parentNotesPath, 'utf8');
        return content.toLowerCase().includes('correction') || 
               content.toLowerCase().includes('fix') ||
               content.toLowerCase().includes('failed');
    }

    /**
     * Checks if there are recovery triggers
     */
    private static hasRecoveryTriggers(fullPath: string): boolean {
        const taskPath = path.join(fullPath, 'task-checklist.md');
        if (!fs.existsSync(taskPath)) return false;
        
        const content = fs.readFileSync(taskPath, 'utf8');
        return content.toLowerCase().includes('recovery') ||
               content.toLowerCase().includes('major issue') ||
               content.toLowerCase().includes('hallucination');
    }
} 