import * as fs from 'fs';
import * as path from 'path';

export function getTreeData(workspaceFolder: string | undefined) {
    if (!workspaceFolder) {
        return { nodes: [], hasDevTreeFlow: false };
    }

    const devTreeFlowPath = path.join(workspaceFolder, 'DevTreeFlow');
    
    if (!fs.existsSync(devTreeFlowPath)) {
        return { nodes: [], hasDevTreeFlow: false };
    }

    const nodes = buildTreeStructure(devTreeFlowPath, '');
    return { nodes, hasDevTreeFlow: true };
}

export function buildTreeStructure(dirPath: string, relativePath: string): any[] {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes: any[] = [];

    for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.')) {
            const nodeRelativePath = relativePath ? path.join(relativePath, item.name) : item.name;
            const fullPath = path.join(dirPath, item.name);
            const children = buildTreeStructure(fullPath, nodeRelativePath);
            
            const hasInstructions = fs.existsSync(path.join(fullPath, 'InstructionsFromParent'));
            const hasContext = fs.existsSync(path.join(fullPath, 'MeAndMyChildren'));
            
            nodes.push({
                name: item.name,
                path: nodeRelativePath,
                children: children,
                hasInstructions,
                hasContext,
                status: getNodeStatus(fullPath)
            });
        }
    }

    return nodes;
}

export function getNodeStatus(nodePath: string): string {
    try {
        const contextPath = path.join(nodePath, 'MeAndMyChildren');
        if (!fs.existsSync(contextPath)) {
            return 'not-started';
        }

        const files = fs.readdirSync(contextPath);
        const hasProgress = files.some(file => 
            file.includes('progress') || 
            file.includes('status') || 
            file.includes('complete')
        );

        return hasProgress ? 'in-progress' : 'not-started';
    } catch {
        return 'unknown';
    }
}

export function getNodeChildren(nodePath: string, workspaceFolder: string | undefined): any[] {
    if (!workspaceFolder) return [];
    const fullPath = path.join(workspaceFolder, 'DevTreeFlow', nodePath);
    if (!fs.existsSync(fullPath)) return [];
    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    return items
        .filter(item => item.isDirectory() && !item.name.startsWith('.'))
        .map(item => ({
            name: item.name,
            path: path.join(nodePath, item.name),
            status: getNodeStatus(path.join(fullPath, item.name))
        }));
} 