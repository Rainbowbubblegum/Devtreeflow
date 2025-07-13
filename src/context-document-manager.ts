import * as path from 'path';
import * as fs from 'fs';

export class ContextDocumentManager {
    
    /**
     * Creates the standard folder structure for a leaf
     */
    public static createLeafStructure(leafPath: string): void {
        const fullPath = path.join(process.cwd(), 'DevTreeFlow', leafPath);
        
        // Create main folders
        const folders = [
            '',
            'InstructionsFromParent',
            'MeAndMyChildren',
            'child-notes'
        ];
        
        folders.forEach(folder => {
            const folderPath = path.join(fullPath, folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
        });
    }
    
    /**
     * Creates a leaf identity document from template
     */
    public static createLeafIdentity(leafPath: string, parentName: string = 'Root'): void {
        const fullPath = path.join(process.cwd(), 'DevTreeFlow', leafPath);
        const leafName = path.basename(leafPath);
        const templatePath = path.join(process.cwd(), 'DevTreeFlow', 'templates', 'leaf-identity-template.md');
        
        if (!fs.existsSync(templatePath)) {
            throw new Error('Leaf identity template not found');
        }
        
        let template = fs.readFileSync(templatePath, 'utf8');
        
        // Replace template placeholders
        template = template.replace(/\[LEAF_NAME\]/g, leafName);
        template = template.replace(/\[PARENT_NAME\]/g, parentName);
        template = template.replace(/\[DATE\]/g, new Date().toISOString().split('T')[0]);
        template = template.replace(/\[MODE\]/g, 'INITIALIZATION');
        
        const identityPath = path.join(fullPath, 'leaf-identity.md');
        fs.writeFileSync(identityPath, template);
    }
    
    /**
     * Creates a task checklist document from template
     */
    public static createTaskChecklist(leafPath: string): void {
        const fullPath = path.join(process.cwd(), 'DevTreeFlow', leafPath);
        const leafName = path.basename(leafPath);
        const templatePath = path.join(process.cwd(), 'DevTreeFlow', 'templates', 'task-checklist-template.md');
        
        if (!fs.existsSync(templatePath)) {
            throw new Error('Task checklist template not found');
        }
        
        let template = fs.readFileSync(templatePath, 'utf8');
        
        // Replace template placeholders
        template = template.replace(/\[LEAF_NAME\]/g, leafName);
        template = template.replace(/\[MODE\]/g, 'INITIALIZATION');
        template = template.replace(/\[DATE\]/g, new Date().toISOString().split('T')[0]);
        
        const checklistPath = path.join(fullPath, 'task-checklist.md');
        fs.writeFileSync(checklistPath, template);
    }
    
    /**
     * Creates a parent notes document
     */
    public static createParentNotes(leafPath: string): void {
        const fullPath = path.join(process.cwd(), 'DevTreeFlow', leafPath);
        const leafName = path.basename(leafPath);
        
        const content = `# Parent Notes for ${leafName}

## Created: ${new Date().toISOString().split('T')[0]}

This document contains notes and feedback from parent assessments.

## Assessment History

### Assessment 1: [DATE]
**Assessor**: [PARENT_NAME]
**Status**: [Success/Failed/Needs Correction]
**Notes**: [Assessment notes]
**Correction Required**: [Yes/No]
**Next Steps**: [What needs to happen]

---

## Current Status
**Last Assessment**: [DATE]
**Overall Status**: [Success/Failed/Needs Correction]
**Blockers**: [Current obstacles]
**Next Assessment Due**: [DATE]

## Correction History

### Correction 1: [DATE]
**Trigger**: [What caused this correction]
**Parent Feedback**: [What parent said needs fixing]
**Correction Status**: [In Progress/Completed/Failed]
**Notes**: [Correction progress notes]

---

## Notes Section
[Use this area for any additional parent notes, decisions, or important information]

---
*Last Updated: ${new Date().toISOString().split('T')[0]}*
*Updated By: [AI_AGENT_NAME]*
`;
        
        const notesPath = path.join(fullPath, 'parent-notes.md');
        fs.writeFileSync(notesPath, content);
    }
    
    /**
     * Creates an architectural context document
     */
    public static createArchitecturalContext(leafPath: string): void {
        const fullPath = path.join(process.cwd(), 'DevTreeFlow', leafPath);
        const leafName = path.basename(leafPath);
        
        const content = `# Architectural Context for ${leafName}

## Created: ${new Date().toISOString().split('T')[0]}

This document defines the architectural integration requirements for this leaf.

## System Integration

### Parent Integration Points
- **Parent System**: [Parent system name]
- **Integration Method**: [How this leaf integrates with parent]
- **Data Flow**: [How data flows between parent and this leaf]
- **API Requirements**: [Any API requirements for parent integration]

### Child Integration Points
- **Child Systems**: [List of child systems]
- **Integration Methods**: [How children integrate with this leaf]
- **Data Flow**: [How data flows to children]
- **API Requirements**: [Any API requirements for child integration]

## Technical Requirements

### Technologies
- **Primary Language**: [Main programming language]
- **Frameworks**: [Frameworks used]
- **Libraries**: [Key libraries]
- **Tools**: [Development tools]

### Dependencies
- **External Dependencies**: [External systems or services]
- **Internal Dependencies**: [Internal system dependencies]
- **Version Requirements**: [Specific version requirements]

### Outputs
- **Primary Outputs**: [What this leaf produces]
- **Secondary Outputs**: [Additional outputs]
- **Format Requirements**: [Required output formats]
- **Integration Points**: [Where outputs are consumed]

## Architectural Patterns

### Design Patterns
- **Primary Pattern**: [Main design pattern used]
- **Secondary Patterns**: [Additional patterns]
- **Anti-patterns to Avoid**: [Patterns to avoid]

### Code Standards
- **Coding Style**: [Coding style requirements]
- **Naming Conventions**: [Naming conventions]
- **Documentation Standards**: [Documentation requirements]
- **Testing Requirements**: [Testing standards]

## Performance Requirements

### Performance Metrics
- **Response Time**: [Expected response times]
- **Throughput**: [Expected throughput]
- **Resource Usage**: [Expected resource usage]
- **Scalability**: [Scalability requirements]

### Optimization Guidelines
- **Performance Targets**: [Specific performance targets]
- **Optimization Strategies**: [How to optimize]
- **Monitoring Points**: [What to monitor]

## Security Requirements

### Security Considerations
- **Authentication**: [Authentication requirements]
- **Authorization**: [Authorization requirements]
- **Data Protection**: [Data protection requirements]
- **Input Validation**: [Input validation requirements]

## Error Handling

### Error Scenarios
- **Common Errors**: [Common error scenarios]
- **Error Responses**: [How to handle errors]
- **Recovery Procedures**: [Recovery procedures]
- **Logging Requirements**: [Logging requirements]

## Notes Section
[Use this area for any additional architectural notes, decisions, or important information]

---
*Last Updated: ${new Date().toISOString().split('T')[0]}*
*Updated By: [AI_AGENT_NAME]*
`;
        
        const archPath = path.join(fullPath, 'architectural-context.md');
        fs.writeFileSync(archPath, content);
    }
    
    /**
     * Creates a progress updates document
     */
    public static createProgressUpdates(leafPath: string): void {
        const fullPath = path.join(process.cwd(), 'DevTreeFlow', leafPath);
        const leafName = path.basename(leafPath);
        
        const content = `# Progress Updates for ${leafName}

## Created: ${new Date().toISOString().split('T')[0]}

This document contains structured updates to the parent about progress.

## Update Format

Each update should follow this format:

### Update [NUMBER]: [DATE]
**Status**: [Success/In Progress/Failed/Needs Help]
**Mode**: [Current operational mode]
**Tasks Completed**: [List of completed tasks]
**Tasks In Progress**: [List of tasks currently being worked on]
**Blockers**: [Any current obstacles]
**Next Steps**: [What will be done next]
**Parent Communication**: [Any specific communication needed from parent]

---

## Update History

### Update 1: ${new Date().toISOString().split('T')[0]}
**Status**: Not Started
**Mode**: INITIALIZATION
**Tasks Completed**: [None yet]
**Tasks In Progress**: [Setting up context documents]
**Blockers**: [None]
**Next Steps**: [Complete initialization and begin task execution]
**Parent Communication**: [None needed at this time]

---

## Overall Progress Summary

**Total Updates**: 1
**Last Update**: ${new Date().toISOString().split('T')[0]}
**Current Status**: Not Started
**Overall Progress**: 0%

## Notes Section
[Use this area for any additional progress notes or important information]

---
*Last Updated: ${new Date().toISOString().split('T')[0]}*
*Updated By: [AI_AGENT_NAME]*
`;
        
        const progressPath = path.join(fullPath, 'MeAndMyChildren', 'progress-updates.md');
        fs.writeFileSync(progressPath, content);
    }
    
    /**
     * Creates all required context documents for a new leaf
     */
    public static initializeLeaf(leafPath: string, parentName: string = 'Root'): void {
        try {
            // Create folder structure
            this.createLeafStructure(leafPath);
            
            // Create all required documents
            this.createLeafIdentity(leafPath, parentName);
            this.createTaskChecklist(leafPath);
            this.createParentNotes(leafPath);
            this.createArchitecturalContext(leafPath);
            this.createProgressUpdates(leafPath);
            
            console.log(`Successfully initialized leaf: ${leafPath}`);
        } catch (error) {
            console.error(`Failed to initialize leaf ${leafPath}:`, error);
            throw error;
        }
    }
    
    /**
     * Checks if a leaf has all required context documents
     */
    public static hasRequiredDocuments(leafPath: string): boolean {
        const fullPath = path.join(process.cwd(), 'DevTreeFlow', leafPath);
        
        const requiredFiles = [
            'leaf-identity.md',
            'task-checklist.md',
            'parent-notes.md',
            'architectural-context.md',
            'MeAndMyChildren/progress-updates.md'
        ];
        
        return requiredFiles.every(file => {
            const filePath = path.join(fullPath, file);
            return fs.existsSync(filePath);
        });
    }
    
    /**
     * Updates a context document with new content
     */
    public static updateContextDocument(leafPath: string, documentName: string, content: string): void {
        const fullPath = path.join(process.cwd(), 'DevTreeFlow', leafPath);
        const documentPath = path.join(fullPath, documentName);
        
        // Add timestamp to content
        const timestampedContent = `${content}\n\n---\n*Last Updated: ${new Date().toISOString().split('T')[0]}*\n*Updated By: AI Agent*`;
        
        fs.writeFileSync(documentPath, timestampedContent);
    }
    
    /**
     * Reads a context document
     */
    public static readContextDocument(leafPath: string, documentName: string): string | null {
        const fullPath = path.join(process.cwd(), 'DevTreeFlow', leafPath);
        const documentPath = path.join(fullPath, documentName);
        
        if (fs.existsSync(documentPath)) {
            return fs.readFileSync(documentPath, 'utf8');
        }
        
        return null;
    }
    
    /**
     * Lists all context documents for a leaf
     */
    public static listContextDocuments(leafPath: string): string[] {
        const fullPath = path.join(process.cwd(), 'DevTreeFlow', leafPath);
        
        if (!fs.existsSync(fullPath)) {
            return [];
        }
        
        const files: string[] = [];
        
        const scanDirectory = (dir: string, relativePath: string = '') => {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const item of items) {
                const itemPath = path.join(dir, item.name);
                const relativeItemPath = relativePath ? path.join(relativePath, item.name) : item.name;
                
                if (item.isDirectory()) {
                    scanDirectory(itemPath, relativeItemPath);
                } else if (item.isFile() && item.name.endsWith('.md')) {
                    files.push(relativeItemPath);
                }
            }
        };
        
        scanDirectory(fullPath);
        return files;
    }
} 