import * as path from 'path';
import * as fs from 'fs';
import { ContextDocumentManager } from './context-document-manager';

export class WorkflowManager {
    
    /**
     * Determines the current mode for a leaf based on context
     */
    public static determineCurrentMode(leafPath: string): string {
        const fullPath = path.join(process.cwd(), 'DevTreeFlow', leafPath);
        
        // Check if leaf exists and has required documents
        if (!fs.existsSync(fullPath)) {
            return 'INITIALIZATION';
        }
        
        // Check if required documents exist
        const hasRequiredDocs = ContextDocumentManager.hasRequiredDocuments(leafPath);
        if (!hasRequiredDocs) {
            return 'INITIALIZATION';
        }
        
        // Check for correction mode triggers
        const parentNotes = ContextDocumentManager.readContextDocument(leafPath, 'parent-notes.md');
        if (parentNotes && this.hasCorrectionTriggers(parentNotes)) {
            return 'CORRECTION';
        }
        
        // Check for recovery mode triggers
        const taskChecklist = ContextDocumentManager.readContextDocument(leafPath, 'task-checklist.md');
        if (taskChecklist && this.hasRecoveryTriggers(taskChecklist)) {
            return 'RECOVERY';
        }
        
        // Check if this is a parent with children (assessment mode)
        const hasChildren = this.hasChildLeaves(leafPath);
        if (hasChildren) {
            return 'ASSESSMENT';
        }
        
        return 'EXECUTION';
    }
    
    /**
     * Executes the workflow for a specific mode
     */
    public static async executeWorkflow(leafPath: string, mode: string, developerRequest: string = ''): Promise<string> {
        switch (mode) {
            case 'INITIALIZATION':
                return this.executeInitializationWorkflow(leafPath);
            case 'EXECUTION':
                return this.executeExecutionWorkflow(leafPath, developerRequest);
            case 'ASSESSMENT':
                return this.executeAssessmentWorkflow(leafPath);
            case 'CORRECTION':
                return this.executeCorrectionWorkflow(leafPath);
            case 'RECOVERY':
                return this.executeRecoveryWorkflow(leafPath, developerRequest);
            default:
                throw new Error(`Unknown mode: ${mode}`);
        }
    }
    
    /**
     * Executes initialization workflow
     */
    private static async executeInitializationWorkflow(leafPath: string): Promise<string> {
        const leafName = path.basename(leafPath);
        const parentPath = path.dirname(leafPath);
        const parentName = path.basename(parentPath) !== 'DevTreeFlow' ? path.basename(parentPath) : 'Root';
        
        // Create all required context documents
        ContextDocumentManager.initializeLeaf(leafPath, parentName);
        
        return `# DevTreeFlow Initialization Complete

**Leaf**: ${leafName}
**Mode**: INITIALIZATION
**Status**: Initialized

## Context Analysis
- Created leaf identity document
- Created task checklist
- Created parent notes document
- Created architectural context
- Created progress updates document
- Established folder structure

## Mode-Specific Actions
- Initialized all required context documents
- Set up communication protocols
- Established leaf identity and goals
- Created child folder structure

## Next Steps
1. Read the created context documents
2. Define specific tasks and goals
3. Begin execution mode
4. Update progress regularly

The leaf is now ready for task execution. Please review the created context documents and begin working on assigned tasks.`;
    }
    
    /**
     * Executes execution workflow
     */
    private static async executeExecutionWorkflow(leafPath: string, developerRequest: string): Promise<string> {
        const leafName = path.basename(leafPath);
        
        // Read current context
        const identity = ContextDocumentManager.readContextDocument(leafPath, 'leaf-identity.md');
        const tasks = ContextDocumentManager.readContextDocument(leafPath, 'task-checklist.md');
        
        return `# DevTreeFlow Execution Mode

**Leaf**: ${leafName}
**Mode**: EXECUTION
**Status**: Active

## Context Analysis
- Leaf identity established
- Task checklist available
- Progress tracking active
- Parent communication established

## Mode-Specific Actions
- Executing assigned tasks
- Updating progress regularly
- Maintaining architectural consistency
- Communicating with parent through structured updates

## Developer Request Processing
${developerRequest ? `Processing developer request: "${developerRequest}"` : 'No specific request - continuing with assigned tasks'}

## Next Steps
1. Review current task checklist
2. Execute next pending task
3. Update progress in context documents
4. Communicate with parent as needed
5. Create child leaves if required

Continue with task execution and maintain regular progress updates.`;
    }
    
    /**
     * Executes assessment workflow
     */
    private static async executeAssessmentWorkflow(leafPath: string): Promise<string> {
        const leafName = path.basename(leafPath);
        const children = this.getChildLeaves(leafPath);
        
        return `# DevTreeFlow Assessment Mode

**Leaf**: ${leafName}
**Mode**: ASSESSMENT
**Status**: Assessing Children

## Context Analysis
- Parent leaf with ${children.length} children
- Assessment criteria established
- Child evaluation process ready

## Mode-Specific Actions
- Reviewing all child context documents
- Evaluating child code against requirements
- Updating child context with findings
- Providing correction guidance if needed
- Updating parent context with assessment results

## Child Assessment Plan
${children.map(child => `- **${child}**: Review context and code integration`).join('\n')}

## Assessment Criteria
- [ ] Child completed all assigned tasks
- [ ] Code integrates properly with parent system
- [ ] Architectural patterns are followed
- [ ] Documentation is complete
- [ ] No major gaps or hallucinations detected

## Next Steps
1. Read each child's context documents
2. Review child code against architectural requirements
3. Update child context with assessment findings
4. Provide correction guidance if needed
5. Update parent context with assessment results

Begin child assessment process.`;
    }
    
    /**
     * Executes correction workflow
     */
    private static async executeCorrectionWorkflow(leafPath: string): Promise<string> {
        const leafName = path.basename(leafPath);
        
        // Read parent notes for correction guidance
        const parentNotes = ContextDocumentManager.readContextDocument(leafPath, 'parent-notes.md');
        
        return `# DevTreeFlow Correction Mode

**Leaf**: ${leafName}
**Mode**: CORRECTION
**Status**: Correcting Issues

## Context Analysis
- Parent feedback received
- Correction requirements identified
- Root cause analysis needed

## Mode-Specific Actions
- Reading parent's correction notes
- Analyzing current code against expectations
- Creating new task checklist with reasoning
- Implementing fixes with architectural awareness
- Updating context with correction progress

## Parent Feedback
${parentNotes ? 'Parent notes available for review' : 'No parent notes found - manual correction required'}

## Correction Process
1. Read parent's correction instructions
2. Analyze why original approach failed
3. Create new task checklist with reasoning
4. Implement fixes with architectural awareness
5. Update context with correction progress
6. Request parent reassessment

## Next Steps
1. Review parent feedback in detail
2. Analyze current code against expectations
3. Create correction plan
4. Implement fixes systematically
5. Update all context documents

Begin correction process based on parent feedback.`;
    }
    
    /**
     * Executes recovery workflow
     */
    private static async executeRecoveryWorkflow(leafPath: string, developerRequest: string): Promise<string> {
        const leafName = path.basename(leafPath);
        
        return `# DevTreeFlow Recovery Mode

**Leaf**: ${leafName}
**Mode**: RECOVERY
**Status**: Recovering from Issues

## Context Analysis
- Major issues detected
- Recovery process initiated
- Developer notification required

## Mode-Specific Actions
- Identifying scope of issues
- Informing developer of problems
- Proposing recovery steps
- Documenting all recovery actions
- Communicating with parent about recovery process

## Issue Description
${developerRequest || 'Major system issues detected requiring recovery'}

## Recovery Process
1. Assess scope and impact of issues
2. Inform developer of problems
3. Propose step-by-step recovery approach
4. Execute recovery carefully
5. Document all actions taken
6. Validate recovery success

## Next Steps
1. Identify specific issues and their scope
2. Inform developer of problems
3. Create detailed recovery plan
4. Execute recovery steps systematically
5. Document all recovery actions
6. Request new chat session if needed

**IMPORTANT**: Recovery mode is for major issues. Always inform the developer of significant problems immediately.`;
    }
    
    /**
     * Checks if there are correction triggers in parent notes
     */
    private static hasCorrectionTriggers(content: string): boolean {
        const lowerContent = content.toLowerCase();
        return lowerContent.includes('correction') || 
               lowerContent.includes('fix') ||
               lowerContent.includes('failed') ||
               lowerContent.includes('needs correction');
    }
    
    /**
     * Checks if there are recovery triggers in task checklist
     */
    private static hasRecoveryTriggers(content: string): boolean {
        const lowerContent = content.toLowerCase();
        return lowerContent.includes('recovery') ||
               lowerContent.includes('major issue') ||
               lowerContent.includes('hallucination') ||
               lowerContent.includes('system error');
    }
    
    /**
     * Checks if a leaf has child leaves
     */
    private static hasChildLeaves(leafPath: string): boolean {
        const fullPath = path.join(process.cwd(), 'DevTreeFlow', leafPath);
        
        if (!fs.existsSync(fullPath)) {
            return false;
        }
        
        const items = fs.readdirSync(fullPath, { withFileTypes: true });
        return items.some(item => item.isDirectory() && item.name !== 'InstructionsFromParent' && item.name !== 'MeAndMyChildren' && item.name !== 'child-notes');
    }
    
    /**
     * Gets list of child leaves
     */
    private static getChildLeaves(leafPath: string): string[] {
        const fullPath = path.join(process.cwd(), 'DevTreeFlow', leafPath);
        
        if (!fs.existsSync(fullPath)) {
            return [];
        }
        
        const items = fs.readdirSync(fullPath, { withFileTypes: true });
        return items
            .filter(item => item.isDirectory() && 
                          item.name !== 'InstructionsFromParent' && 
                          item.name !== 'MeAndMyChildren' && 
                          item.name !== 'child-notes')
            .map(item => item.name);
    }
    
    /**
     * Transitions a leaf to a new mode
     */
    public static async transitionToMode(leafPath: string, newMode: string): Promise<void> {
        const identityPath = path.join(process.cwd(), 'DevTreeFlow', leafPath, 'leaf-identity.md');
        
        if (fs.existsSync(identityPath)) {
            let content = fs.readFileSync(identityPath, 'utf8');
            
            // Update the mode in the identity document
            content = content.replace(/Current Mode: \[.*?\]/, `Current Mode: ${newMode}`);
            content = content.replace(/Status: \[.*?\]/, `Status: ${this.getStatusForMode(newMode)}`);
            
            fs.writeFileSync(identityPath, content);
        }
    }
    
    /**
     * Gets the appropriate status for a mode
     */
    private static getStatusForMode(mode: string): string {
        switch (mode) {
            case 'INITIALIZATION':
                return 'Initializing';
            case 'EXECUTION':
                return 'In Progress';
            case 'ASSESSMENT':
                return 'Assessing Children';
            case 'CORRECTION':
                return 'Correcting Issues';
            case 'RECOVERY':
                return 'Recovering';
            default:
                return 'Unknown';
        }
    }
    
    /**
     * Validates workflow transitions
     */
    public static validateTransition(currentMode: string, newMode: string): boolean {
        const validTransitions: { [key: string]: string[] } = {
            'INITIALIZATION': ['EXECUTION', 'ASSESSMENT'],
            'EXECUTION': ['ASSESSMENT', 'CORRECTION', 'RECOVERY'],
            'ASSESSMENT': ['EXECUTION', 'CORRECTION'],
            'CORRECTION': ['EXECUTION', 'ASSESSMENT', 'RECOVERY'],
            'RECOVERY': ['EXECUTION', 'INITIALIZATION']
        };
        
        return validTransitions[currentMode]?.includes(newMode) || false;
    }
} 