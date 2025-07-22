import * as fs from 'fs';
import * as path from 'path';

export function loadContextFolderStructure(dashboard: any) {
    const contextDir = path.join(dashboard.getWorkspaceFolder() || '', 'ProjectSpecificContextFiles');
    console.log('DevTreeFlow: Loading context folder structure from:', contextDir);
    
    if (!fs.existsSync(contextDir)) {
        console.log('DevTreeFlow: Context directory does not exist, creating:', contextDir);
        fs.mkdirSync(contextDir, { recursive: true });
    }
    
    dashboard.contextFolderStructure = buildContextFolderStructure(contextDir, '');
    dashboard.contextFilesList = flattenContextFiles(dashboard.contextFolderStructure);
    
    console.log('DevTreeFlow: Context folder structure loaded:', JSON.stringify(dashboard.contextFolderStructure, null, 2));
    console.log('DevTreeFlow: Context files list:', dashboard.contextFilesList);
}

export function buildContextFolderStructure(dirPath: string, relativePath: string): any {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const structure: any = {
        name: relativePath || 'ProjectSpecificContextFiles',
        path: relativePath,
        type: 'folder',
        children: []
    };

    for (const item of items) {
        // Skip 'Older Versions' folder
        if (item.name === 'Older Versions') continue;

        const itemPath = path.join(dirPath, item.name);
        // Build POSIX-style relative path to ensure stable separators in the Webview
        const itemRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;

        if (item.isDirectory()) {
            structure.children.push(buildContextFolderStructure(itemPath, itemRelativePath));
        } else if (item.isFile() && item.name.endsWith('.md')) {
            structure.children.push({
                name: item.name,
                path: itemRelativePath,
                type: 'file'
            });
        }
    }

    return structure;
}

export function flattenContextFiles(structure: any, files: string[] = []): string[] {
    if (structure.type === 'file') {
        files.push(structure.path);
    } else if (structure.children) {
        for (const child of structure.children) {
            flattenContextFiles(child, files);
        }
    }
    return files;
}

export function updatePromptBuilderWithContextFiles(dashboard: any) {
    const contextDir = path.join(dashboard.getWorkspaceFolder() || '', 'ProjectSpecificContextFiles');
    let contextReferences = '';
    
    // Collect all ticked context files
    const tickedFiles = dashboard.contextFilesList.filter((file: any) => dashboard.contextFileTicks[file]);
    
    if (tickedFiles.length > 0) {
        contextReferences = 'Please read the context files for context for this request:\n';
        tickedFiles.forEach((file: any) => {
            contextReferences += `- ${path.join(contextDir, file)}\n`;
        });
        contextReferences += '\n';
    }
    
    // Always keep tree/leaf prompt at the top (if present)
    const treePromptMatch = dashboard.promptBuilderContent.match(/<!--TREE_PROMPT-->.*?<!--END_TREE_PROMPT-->/s);
    const treePrompt = treePromptMatch ? treePromptMatch[0] + '\n\n' : '';
    const contentWithoutTreePrompt = dashboard.promptBuilderContent.replace(/<!--TREE_PROMPT-->.*?<!--END_TREE_PROMPT-->\n\n/s, '');
    const contentWithoutContextRefs = contentWithoutTreePrompt.replace(/Please read the context files for context for this request:[\s\S]*?\n\n/, '');
    
    dashboard.promptBuilderContent = `${treePrompt}${contextReferences}${contentWithoutContextRefs}`;
} 