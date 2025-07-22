import * as vscode from 'vscode';
import { AutoPromptService } from './auto-prompt-service';

export async function getAIResponse(): Promise<string | undefined> {
    // This is a placeholder for the logic to get the AI's response.
    // In a real implementation, this would involve listening to chat events.
    return await vscode.window.showInputBox({
        prompt: "Paste the AI's task breakdown response here.",
        placeHolder: '<task_breakdown>...'
    });
}

export function parseTaskBreakdown(response: string): any[] | null {
    const breakdownRegex = /<task_breakdown>([\s\S]*?)<\/task_breakdown>/;
    const match = response.match(breakdownRegex);
    if (!match) {
        return null;
    }

    const lines = match[1].trim().split('\n');
    const tree: any[] = [];
    let currentKeyTask: any = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('- ')) {
            const [name, description] = trimmedLine.substring(2).split('|').map(s => s.trim());
            if (name && description) {
                currentKeyTask = {
                    name,
                    description,
                    children: []
                };
                tree.push(currentKeyTask);
            }
        } else if (trimmedLine.startsWith('  - ')) {
            if (currentKeyTask) {
                const [name, description] = trimmedLine.substring(4).split('|').map(s => s.trim());
                if (name && description) {
                    currentKeyTask.children.push({
                        name,
                        description
                    });
                }
            }
        }
    }
    return tree;
}

export function createTreeFromBreakdown(breakdown: any[], mainGoal: string) {
    const prompt = `# DevTreeFlow AI - Process Breakdown Data

You are the DevTreeFlow AI. Process this breakdown data and create the complete folder structure.

## BREAKDOWN DATA TO PROCESS:
${JSON.stringify(breakdown, null, 2)}

## MAIN GOAL: ${mainGoal}

## MANDATORY EXECUTION SEQUENCE:

### Step 1: Read System Rules
<function_calls>
<invoke name="read_file">
<parameter name="target_file">DevTreeFlow/tree-start.md</parameter>
</invoke>
</function_calls>
`;
    // This is an incomplete prompt, but fixing the syntax for now.
} 