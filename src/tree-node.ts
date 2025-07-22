import * as vscode from 'vscode';

export class TreeNode extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly relativePath: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.contextValue = 'treeNode';
        this.tooltip = `${this.label} - ${this.relativePath}`;
    }
} 