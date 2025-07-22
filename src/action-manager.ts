import * as vscode from 'vscode';
import * as path from 'path';
import { AutoPromptService } from './auto-prompt-service';
import { EnhancedPromptGenerator } from './enhanced-prompt-generator';

export class ActionManager {
    static async switchToNode(nodePath: string) {
        const nodeLabel = path.basename(nodePath);
        const prompt = EnhancedPromptGenerator.generateIdentityPrompt(nodePath);
        if (AutoPromptService.isAutoPromptingModeEnabled()) {
            await AutoPromptService.sendPromptToChatWithAutomation(prompt, `Switch to '${nodeLabel}'`);
        } else {
            await vscode.env.clipboard.writeText(prompt);
            vscode.window.showInformationMessage(`Switched to '${nodeLabel}' - enhanced prompt copied to clipboard!`);
        }
    }

    static async switchAndFollowParent(nodePath: string) {
        const pathParts = nodePath.split(path.sep);
        const nodeLabel = pathParts[pathParts.length - 1];
        const parentName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'root';
        const prompt = EnhancedPromptGenerator.generateIdentityPrompt(nodePath,
            `Follow parent context from '${parentName}' and execute tasks as per parent's expectations`);
        if (AutoPromptService.isAutoPromptingModeEnabled()) {
            await AutoPromptService.sendPromptToChatWithAutomation(prompt, `Follow Parent for '${nodeLabel}'`);
        } else {
            await vscode.env.clipboard.writeText(prompt);
            vscode.window.showInformationMessage(`Switch to '${nodeLabel}' with parent context - enhanced prompt copied to clipboard!`);
        }
    }

    static async assessChildren(nodePath: string) {
        const nodeLabel = path.basename(nodePath);
        const prompt = EnhancedPromptGenerator.generateAssessmentPrompt(nodePath);
        if (AutoPromptService.isAutoPromptingModeEnabled()) {
            await AutoPromptService.sendPromptToChatWithAutomation(prompt, `Assess Children for '${nodeLabel}'`);
        } else {
            await vscode.env.clipboard.writeText(prompt);
            vscode.window.showInformationMessage(`Assess children of '${nodeLabel}' - enhanced assessment prompt copied to clipboard!`);
        }
    }

    static async summarizeStatus(nodePath: string) {
        const nodeLabel = path.basename(nodePath);
        const prompt = `You are the AI agent for '${nodeLabel}' in the DevTreeFlow system.\n\nPlease provide a comprehensive status summary for this task:\n\n1. Read all context from: /DevTreeFlow/${nodePath}/\n2. Review task objectives and current progress\n3. Summarize what has been completed\n4. Identify what remains to be done\n5. Note any blockers or issues\n6. Assess overall task health and timeline\n\nProvide a clear, structured status report that can be shared with parent nodes or team members.`;
        if (AutoPromptService.isAutoPromptingModeEnabled()) {
            await AutoPromptService.sendPromptToChatWithAutomation(prompt, `Status Summary for '${nodeLabel}'`);
        } else {
            await vscode.env.clipboard.writeText(prompt);
            vscode.window.showInformationMessage(`Summarize status of '${nodeLabel}' - prompt copied to clipboard!`);
        }
    }
} 