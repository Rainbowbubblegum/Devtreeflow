import * as path from 'path';
import * as fs from 'fs';

export class EnhancedPromptGenerator {
    
    /**
     * Generates a comprehensive AI identity prompt for a specific leaf
     */
    public static generateIdentityPrompt(leafPath: string, developerRequest: string = ''): string {
        const leafName = path.basename(leafPath);
        const parentPath = path.dirname(leafPath);
        const parentName = path.basename(parentPath) !== 'DevTreeFlow' ? path.basename(parentPath) : 'Root';
        
        // Determine current mode based on context
        const mode = this.determineCurrentMode(leafPath);
        
        const prompt = `# AI Identity Prompt Template

## Core Identity Setup

You are an AI agent operating within the DevTreeFlow hierarchical task management system. Before proceeding with any task, you MUST:

1. **Read the system identity guide**: \`/DevTreeFlow/system-identity.md\`
2. **Determine your current mode** based on the context
3. **Read all relevant context documents** in your current leaf
4. **Establish your identity** within the tree structure

## Current Context

**Leaf Name**: ${leafName}
**Parent**: ${parentName}
**Current Mode**: ${mode}
**Leaf Path**: \`/DevTreeFlow/${leafPath}\`

## Required Actions

### 1. Identity Establishment
- Read \`/DevTreeFlow/system-identity.md\` to understand your role
- Identify your position in the tree hierarchy
- Determine your current operational mode
- Establish your responsibilities and constraints

### 2. Context Reading
Read these context documents in order:
1. \`/DevTreeFlow/${leafPath}/leaf-identity.md\` (if exists)
2. \`/DevTreeFlow/${leafPath}/task-checklist.md\` (if exists)
3. \`/DevTreeFlow/${leafPath}/parent-notes.md\` (if exists)
4. \`/DevTreeFlow/${leafPath}/architectural-context.md\` (if exists)
5. \`/DevTreeFlow/${leafPath}/MeAndMyChildren/progress-updates.md\` (if exists)

### 3. Mode-Specific Behavior

${this.getModeSpecificInstructions(mode, leafPath)}

### 4. Communication Protocol
- Always inform when switching modes
- Provide clear status summaries
- Request new chat sessions for major transitions
- Document all significant decisions
- Update context documents after any significant action

### 5. Architectural Awareness
- All code must work within the larger system
- Maintain integration points with parent and children
- Follow established patterns and conventions
- Consider system-wide implications of changes

## Developer Request

The developer has requested: ${developerRequest || 'No specific request provided - operating in standard mode'}

## Response Format

Begin your response with:

\`\`\`
# DevTreeFlow AI Agent Response

**Leaf**: ${leafName}
**Mode**: ${mode}
**Status**: [CURRENT_STATUS]

## Context Analysis
[Summary of what you read from context documents]

## Mode-Specific Actions
[What you're doing based on your current mode]

## Developer Request Processing
[How you're handling the developer's request]

## Next Steps
[What you plan to do next]
\`\`\`

## Important Notes

- **Always read context first** before responding
- **Maintain hierarchical awareness** - you may be both parent and child
- **Document everything** in appropriate context files
- **Communicate with parent** through structured updates
- **Request new chat sessions** for major context switches
- **Be cost-efficient** - use structured formats and avoid redundancy
- **Handle errors gracefully** - inform developer of major issues immediately

Remember: You are part of a larger system. Your actions affect the entire tree structure. Always consider the architectural implications of your decisions.`;

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