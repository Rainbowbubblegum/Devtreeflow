import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DevTreeFlowDashboard } from './dashboard';

export class PromptValidator {
    
    /**
     * Validates a prompt string for common issues
     */
    public static validatePrompt(prompt: string): ValidationResult {
        const issues: ValidationIssue[] = [];
        
        // Check for unclosed XML tags
        const unclosedTags = this.findUnclosedTags(prompt);
        unclosedTags.forEach(tag => {
            issues.push({
                type: 'unclosed-tag',
                severity: 'error',
                message: `Unclosed tag: <${tag}>`,
                line: this.findLineNumber(prompt, `<${tag}`)
            });
        });
        
        // Check for missing required parameters
        const missingParams = this.findMissingParameters(prompt);
        missingParams.forEach(param => {
            issues.push({
                type: 'missing-parameter',
                severity: 'error',
                message: `Missing required parameter: ${param.parameter} for ${param.tool}`,
                line: param.line
            });
        });
        
        // Check for unresolved placeholders
        const placeholders = this.findUnresolvedPlaceholders(prompt);
        placeholders.forEach(placeholder => {
            issues.push({
                type: 'unresolved-placeholder',
                severity: 'warning',
                message: `Unresolved placeholder: ${placeholder.text}`,
                line: placeholder.line
            });
        });
        
        // Check for inconsistent tool syntax
        const syntaxIssues = this.checkToolSyntaxConsistency(prompt);
        syntaxIssues.forEach(issue => {
            issues.push(issue);
        });
        
        return {
            isValid: issues.filter(i => i.severity === 'error').length === 0,
            issues: issues,
            summary: this.generateSummary(issues)
        };
    }
    
    /**
     * Finds unclosed XML tags in the prompt
     */
    private static findUnclosedTags(prompt: string): string[] {
        const unclosed: string[] = [];
        const tagStack: string[] = [];
        
        // Match opening tags
        const openTagRegex = /<(\w+)(?:\s[^>]*)?>/g;
        // Match closing tags
        const closeTagRegex = /<\/(\w+)>/g;
        
        // Find all tags
        const allTags: Array<{tag: string, isClosing: boolean, index: number}> = [];
        
        let match;
        while ((match = openTagRegex.exec(prompt)) !== null) {
            allTags.push({tag: match[1], isClosing: false, index: match.index});
        }
        
        while ((match = closeTagRegex.exec(prompt)) !== null) {
            allTags.push({tag: match[1], isClosing: true, index: match.index});
        }
        
        // Sort by position
        allTags.sort((a, b) => a.index - b.index);
        
        // Process tags
        for (const tagInfo of allTags) {
            if (!tagInfo.isClosing) {
                tagStack.push(tagInfo.tag);
            } else {
                if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tagInfo.tag) {
                    unclosed.push(tagInfo.tag);
                } else {
                    tagStack.pop();
                }
            }
        }
        
        // Any remaining tags in stack are unclosed
        unclosed.push(...tagStack);
        
        return unclosed;
    }
    
    /**
     * Finds missing required parameters for tool calls
     */
    private static findMissingParameters(prompt: string): Array<{tool: string, parameter: string, line: number}> {
        const missing: Array<{tool: string, parameter: string, line: number}> = [];
        
        // Tool requirements
        const toolRequirements: {[key: string]: string[]} = {
            'run_terminal_cmd': ['command', 'is_background', 'explanation'],
            'edit_file': ['target_file', 'instructions', 'code_edit'],
            'read_file': ['target_file', 'explanation'],
            'list_dir': ['relative_workspace_path', 'explanation']
        };
        
        // Find all invoke blocks
        const invokeRegex = /<invoke\s+name="(\w+)">([\s\S]*?)(?:<\/invoke>|$)/g;
        let match;
        
        while ((match = invokeRegex.exec(prompt)) !== null) {
            const toolName = match[1];
            const invokeContent = match[2];
            const line = this.findLineNumber(prompt, match[0]);
            
            if (toolRequirements[toolName]) {
                const requiredParams = toolRequirements[toolName];
                const foundParams = new Set<string>();
                
                // Find parameters in the invoke block
                const paramRegex = /<parameter\s+name="(\w+)"/g;
                let paramMatch;
                while ((paramMatch = paramRegex.exec(invokeContent)) !== null) {
                    foundParams.add(paramMatch[1]);
                }
                
                // Check for missing parameters
                for (const required of requiredParams) {
                    if (!foundParams.has(required)) {
                        missing.push({tool: toolName, parameter: required, line});
                    }
                }
            }
        }
        
        return missing;
    }
    
    /**
     * Finds unresolved placeholders
     */
    private static findUnresolvedPlaceholders(prompt: string): Array<{text: string, line: number}> {
        const placeholders: Array<{text: string, line: number}> = [];
        
        // Common placeholder patterns
        const placeholderRegex = /\[([\w-]+)\]/g;
        let match;
        
        while ((match = placeholderRegex.exec(prompt)) !== null) {
            // Common placeholders that should be replaced
            const commonPlaceholders = [
                'TASK-NAME', 'PARENT-NAME', 'CURRENT-DATE', 
                'TASK_NAME', 'PARENT_NAME', 'CURRENT_DATE',
                'Task-Name', 'Parent-Name', 'Current-Date'
            ];
            
            if (commonPlaceholders.includes(match[1])) {
                placeholders.push({
                    text: match[0],
                    line: this.findLineNumber(prompt, match[0])
                });
            }
        }
        
        return placeholders;
    }
    
    /**
     * Checks for inconsistent tool syntax
     */
    private static checkToolSyntaxConsistency(prompt: string): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        
        // Check for mixed syntax (function_calls vs function_call)
        const hasFunctionCalls = prompt.includes('<function_calls>');
        const hasFunctionCall = prompt.includes('<function_call>');
        
        if (hasFunctionCalls && hasFunctionCall) {
            issues.push({
                type: 'inconsistent-syntax',
                severity: 'warning',
                message: 'Mixed tool call syntax: both <function_calls> and <function_call> found',
                line: 0
            });
        }
        
        return issues;
    }
    
    /**
     * Finds the line number for a given text
     */
    private static findLineNumber(text: string, searchText: string): number {
        const index = text.indexOf(searchText);
        if (index === -1) return 0;
        
        const lines = text.substring(0, index).split('\n');
        return lines.length;
    }
    
    /**
     * Generates a summary of validation issues
     */
    private static generateSummary(issues: ValidationIssue[]): string {
        const errors = issues.filter(i => i.severity === 'error').length;
        const warnings = issues.filter(i => i.severity === 'warning').length;
        
        if (errors === 0 && warnings === 0) {
            return 'Prompt is valid!';
        }
        
        return `Found ${errors} error(s) and ${warnings} warning(s)`;
    }
    
    /**
     * Validates all prompts in the enhanced-prompt-generator
     */
    public static async validateAllPrompts(): Promise<void> {
        const results: {[key: string]: ValidationResult} = {};
        
        // Import the prompt generator
        const { EnhancedPromptGenerator } = await import('./enhanced-prompt-generator');
        
        // Create a mock context for the dashboard instance
        const mockContext = {
            extensionPath: '',
            subscriptions: [],
            workspaceState: { get: () => {}, update: () => {} },
            globalState: { get: () => {}, update: () => {} },
            asAbsolutePath: (relativePath: string) => path.join('', relativePath)
        } as unknown as vscode.ExtensionContext;

        const dashboard = new DevTreeFlowDashboard(mockContext);

        const prompts = {
            'generateIdentityPrompt': EnhancedPromptGenerator.generateIdentityPrompt('test-leaf'),
            'generateAssessmentPrompt': EnhancedPromptGenerator.generateAssessmentPrompt('test-leaf'),
            'generateCorrectionPrompt': EnhancedPromptGenerator.generateCorrectionPrompt('test-leaf'),
            'generateRecoveryPrompt': EnhancedPromptGenerator.generateRecoveryPrompt('test-leaf', 'Test issue'),
            'generateGenesisPrompt': EnhancedPromptGenerator.generateGenesisPrompt('Build a task management system'),
            'generateBriefingPrompt': EnhancedPromptGenerator.generateBriefingPrompt('test-task', 'parent-task', 'Main goal')
        };
        
        // Validate each prompt
        for (const [name, prompt] of Object.entries(prompts)) {
            results[name] = this.validatePrompt(prompt);
        }
        
        // Also validate the createTreeFromBreakdown prompt from dashboard
        const testBreakdown = [
            {
                name: "test-task-1",
                description: "Test task 1",
                subtasks: [
                    {name: "sub-task-1", description: "Sub task 1"}
                ]
            }
        ];
        
        // We can't directly test private methods, but we can check the structure
        const mockPrompt = `# DevTreeFlow AI - Process Breakdown Data

You are the DevTreeFlow AI. Process this breakdown data and create the complete folder structure.

## BREAKDOWN DATA TO PROCESS:
${JSON.stringify(testBreakdown, null, 2)}

## MAIN GOAL: Test Goal

## MANDATORY EXECUTION SEQUENCE:

### Step 1: Read System Rules
<function_calls>
<invoke name="read_file">
<parameter name="target_file">DevTreeFlow/tree-start.md</parameter>
<parameter name="explanation">Reading system rules to understand folder structure requirements</parameter>
<parameter name="should_read_entire_file">true</parameter>
</invoke>
</function_calls>`;
        
        results['createTreeFromBreakdown'] = this.validatePrompt(mockPrompt);
        
        // Show results in output channel
        const outputChannel = vscode.window.createOutputChannel('DevTreeFlow Prompt Validator');
        outputChannel.clear();
        outputChannel.appendLine('=== Prompt Validation Results ===\n');
        
        let totalErrors = 0;
        let totalWarnings = 0;
        
        for (const [name, result] of Object.entries(results)) {
            outputChannel.appendLine(`${name}: ${result.summary}`);
            if (!result.isValid || result.issues.length > 0) {
                result.issues.forEach(issue => {
                    outputChannel.appendLine(`  - Line ${issue.line}: [${issue.severity.toUpperCase()}] ${issue.message}`);
                    if (issue.severity === 'error') totalErrors++;
                    else totalWarnings++;
                });
            }
            outputChannel.appendLine('');
        }
        
        outputChannel.appendLine(`\n=== Summary ===`);
        outputChannel.appendLine(`Total Errors: ${totalErrors}`);
        outputChannel.appendLine(`Total Warnings: ${totalWarnings}`);
        outputChannel.appendLine(`\nValidation ${totalErrors === 0 ? 'PASSED' : 'FAILED'}`);
        
        outputChannel.show();
    }
}

interface ValidationResult {
    isValid: boolean;
    issues: ValidationIssue[];
    summary: string;
}

interface ValidationIssue {
    type: 'unclosed-tag' | 'missing-parameter' | 'unresolved-placeholder' | 'inconsistent-syntax';
    severity: 'error' | 'warning';
    message: string;
    line: number;
} 