import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function getTreeData(dashboard: any): any {
    const workspaceFolder = dashboard.getWorkspaceFolder();
    if (!workspaceFolder) {
        return { hasDevTreeFlow: false, nodes: [] };
    }

    const devTreeFlowPath = path.join(workspaceFolder, 'DevTreeFlow');
    if (!fs.existsSync(devTreeFlowPath)) {
        return { hasDevTreeFlow: false, nodes: [] };
    }

    const nodes = buildTreeStructure(devTreeFlowPath, '');
    return { hasDevTreeFlow: true, nodes: nodes };
}

export function buildTreeStructure(dirPath: string, relativePath: string): any[] {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes: any[] = [];
    const systemFolders = ['InstructionsFromParent', 'MeAndMyChildren'];

    for (const item of items) {
        if (item.isDirectory() && !systemFolders.includes(item.name)) {
            const itemRelativePath = path.join(relativePath, item.name);
            const children = buildTreeStructure(path.join(dirPath, item.name), itemRelativePath);
            nodes.push({
                name: item.name,
                path: itemRelativePath,
                status: getNodeStatus(path.join(dirPath, item.name)),
                children: children
            });
        }
    }
    return nodes;
}

export function getNodeStatus(nodePath: string): string {
    const statusFile = path.join(nodePath, 'status.txt');
    if (fs.existsSync(statusFile)) {
        return fs.readFileSync(statusFile, 'utf8').trim();
    }
    return 'not-started';
}

export function getNodeChildren(dashboard: any, nodePath: string): any[] {
    const workspaceFolder = dashboard.getWorkspaceFolder();
    if (!workspaceFolder) {
        return [];
    }
    const fullPath = path.join(workspaceFolder, 'DevTreeFlow', nodePath);
    if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
        return buildTreeStructure(fullPath, nodePath);
    }
    return [];
} 