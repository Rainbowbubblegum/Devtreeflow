const vscode = acquireVsCodeApi();

let copyToPromptBuilderMode = false;
let collapsedFolders = new Set();
let collapsedTrees = new Set(); // Track collapsed task trees
let focusedTree = null; // Track focused tree (null means show all)
window.currentTreeData = null; // Store tree data for event handlers
let currentFolderStructure = null;
let currentContextFileTicks = {};

console.log('DevTreeFlow WebView: Script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DevTreeFlow WebView: DOM loaded');
    
    // Add a visible indicator that the webview loaded
    document.body.style.border = '3px solid red';
    setTimeout(() => {
        document.body.style.border = '';
    }, 2000);
    
    // Setup event listeners
    document.getElementById('refreshBtnTop').addEventListener('click', () => {
        console.log('DevTreeFlow WebView: Refresh button clicked');
        vscode.postMessage({ command: 'refreshTree' });
    });
    document.getElementById('autoPromptToggle').addEventListener('click', () => vscode.postMessage({ command: 'toggleAutoPromptingMode' }));
    document.getElementById('copyToPromptBuilderToggle').addEventListener('change', () => {
        copyToPromptBuilderMode = !copyToPromptBuilderMode;
        vscode.postMessage({ command: 'toggleCopyToPromptBuilderMode' });
    });
    document.getElementById('newChatBtn').addEventListener('click', () => vscode.postMessage({ command: 'openNewCursorChat' }));
    document.getElementById('newChatTabBtn').addEventListener('click', () => vscode.postMessage({ command: 'openNewCursorChatTab' }));
    document.getElementById('clearChatBtn').addEventListener('click', () => vscode.postMessage({ command: 'clearCurrentChat' }));
    document.getElementById('newTaskTreeBtn').addEventListener('click', () => vscode.postMessage({ command: 'newTaskTree' }));
    document.getElementById('initializeDevTreeFlowBtn').addEventListener('click', () => vscode.postMessage({ command: 'initializeDevTreeFlow' }));
    document.getElementById('autoPromptFromBuilderBtn').addEventListener('click', () => {
        const textarea = document.getElementById('promptBuilderTextarea');
        vscode.postMessage({ 
            command: 'autoPromptFromBuilder', 
            content: textarea.value 
        });
    });
    document.getElementById('promptBuilderTextarea').addEventListener('input', function() {
        vscode.postMessage({ command: 'updatePromptBuilder', content: this.value });
    });

    vscode.postMessage({ command: 'webviewReady' });
    console.log('DevTreeFlow WebView: webviewReady sent');
});

window.addEventListener('message', event => {
    const message = event.data;
    console.log('DevTreeFlow WebView: Received message:', message);
    switch (message.command) {
        case 'updateTree':
            console.log('DevTreeFlow WebView: Updating tree with data:', message.data);
            updateTreeDisplay(message.data);
            break;
        case 'updateAutoPromptingState':
            console.log('DevTreeFlow WebView: Updating auto-prompting state:', message.isEnabled);
            updateAutoPromptingState(message.isEnabled);
            break;
        case 'updateDashboardState':
            console.log('DevTreeFlow WebView: Updating dashboard state:', message);
            updateDashboardState(message);
            break;
        default:
            console.log('DevTreeFlow WebView: Unknown message command:', message.command);
    }
});

function updateTreeDisplay(data) {
    const container = document.getElementById('treeContainer');
    
    // Store data globally for event handlers
    window.currentTreeData = data;
    
    // Initialize collapsed state for new trees (default collapsed)
    if (data.nodes) {
        data.nodes.forEach(node => {
            // Only set default collapsed state if tree is not in any state yet
            if (node.children && node.children.length > 0) {
                if (!collapsedTrees.has(node.name) && !window.hasInitializedTree?.[node.name]) {
                    collapsedTrees.add(node.name); // Default to collapsed
                    if (!window.hasInitializedTree) window.hasInitializedTree = {};
                    window.hasInitializedTree[node.name] = true;
                }
            }
        });
    }
    
    if (!data.hasDevTreeFlow || data.nodes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No DevTreeFlow Structure Found</h2>
                <p>Initialize DevTreeFlow to start managing your AI development workflows.</p>
                <button class="btn" id="initializeDevTreeFlowBtn">
                    <span class="icon">🚀</span>Initialize DevTreeFlow
                </button>
            </div>
        `;
        document.getElementById('initializeDevTreeFlowBtn').addEventListener('click', () => vscode.postMessage({ command: 'initializeDevTreeFlow' }));
        return;
    }

    // Generate both folder view and diagram
    container.innerHTML = `
        <div class="tree-header">
            <h3>📂 Task Trees</h3>
            <div class="tree-view-toggles">
                <button class="btn secondary" id="showFolderView">📁 Folder View</button>
                <button class="btn secondary" id="showDiagramView">📊 Diagram View</button>
            </div>
            <div class="tree-focus-controls">
                <button class="btn secondary" id="expandAllTreesBtn">📂 Expand All</button>
                <button class="btn secondary" id="collapseAllTreesBtn">📁 Collapse All</button>
                <button class="btn secondary" id="resetFocusBtn" ${focusedTree ? '' : 'style="display: none;"'}>🔄 Reset Focus</button>
            </div>
        </div>
        <div id="folderTreeView">
            ${data.nodes.map(node => renderTreeNode(node)).join('')}
        </div>
        <div id="diagramTreeView" style="display: none;">
            ${data.nodes.map((node, index) => `
                <div class="diagram-instance" ${focusedTree && focusedTree !== node.name ? 'style="display: none;"' : ''} data-diagram-index="${index}">
                    <h4>${node.name}</h4>
                    <div class="diagram-controls">
                        <button class="btn secondary" onclick="focusSingleDiagram('${node.name}')">Focus This Diagram</button>
                        <button class="btn secondary" onclick="showAllDiagrams()">Show All</button>
                    </div>
                    <div id="mermaidContainer_${node.name.replace(/\\W/g, '')}" class="mermaid-container">
                        <div class="mermaid">
                            ${generateMermaidDiagram(node)}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Add view toggle functionality
    document.getElementById('showFolderView').addEventListener('click', () => {
        document.getElementById('folderTreeView').style.display = 'block';
        document.getElementById('diagramTreeView').style.display = 'none';
        document.getElementById('showFolderView').classList.add('enabled');
        document.getElementById('showDiagramView').classList.remove('enabled');
        
        // Clean up any pan-zoom instances when switching away from diagram view
        cleanupPanZoomInstances();
    });

    document.getElementById('showDiagramView').addEventListener('click', () => {
        document.getElementById('folderTreeView').style.display = 'none';
        document.getElementById('diagramTreeView').style.display = 'block';
        document.getElementById('showFolderView').classList.remove('enabled');
        document.getElementById('showDiagramView').classList.add('enabled');
        
        // Initialize Mermaid and pan-zoom with improved timing and error handling
        initializeMermaidWithPanZoom(data.nodes);
    });

    // Set default view
    document.getElementById('showFolderView').classList.add('enabled');

    // Tree control event listeners are added globally, not here

    // Event delegation for tree controls is handled in the global container listener
}

function renderTreeNode(node) {
    // Check if this tree should be shown (focus mode)
    if (focusedTree && focusedTree !== node.name) {
        return '';
    }

    const isCollapsed = collapsedTrees.has(node.name);
    const hasChildren = node.children && node.children.length > 0;
    
    return `
        <div class="tree-root" data-tree-name="${node.name}">
            <div class="tree-root-header">
                <div class="tree-toggle-section">
                    ${hasChildren ? `<button class="tree-toggle-btn ${isCollapsed ? '' : 'expanded'}" data-tree="${node.name}">${isCollapsed ? '▶' : '▼'}</button>` : '<span class="tree-toggle-spacer"></span>'}
                    <div class="tree-root-info">
                        <div class="tree-root-name">${node.name}</div>
                        <div class="tree-root-status">${node.status.replace('-', ' ')}</div>
                    </div>
                </div>
                <div class="tree-root-actions">
                    <button class="btn secondary tree-focus-btn" data-tree="${node.name}">🔍 Focus</button>
                    <button class="btn" data-action="switchToNode">🎯 Switch to Me</button>
                </div>
            </div>
            <div class="tree-root-path">📁 /DevTreeFlow/${node.path}</div>
            ${hasChildren ? `
                <div class="tree-children ${isCollapsed ? 'collapsed' : ''}" data-tree="${node.name}">
                    ${node.children.map(child => renderSubNode(child, 1)).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function renderSubNode(node, level = 1) {
    const statusIcon = {
        'not-started': '⭕',
        'in-progress': '🔄',
        'completed': '✅',
        'unknown': '❓'
    }[node.status] || '❓';

    const indentation = (level - 1) * 20; // 20px indentation per level (subtract 1 since we start at level 1)

    return `
        <div class="tree-node ${node.status}" data-path="${node.path}" style="margin-left: ${indentation}px;">
            <div class="node-header">
                <div class="node-name">${statusIcon} ${node.name}</div>
                <div class="node-status">${node.status.replace('-', ' ')}</div>
            </div>
            <div class="node-path">📁 /DevTreeFlow/${node.path}</div>
            <div class="node-actions">
                <button class="btn" data-action="switchToNode">🎯 Switch to Me</button>
                <button class="btn secondary" data-action="switchAndFollowParent">👨‍👩‍👧‍👦 Follow Parent</button>
                <button class="btn secondary" data-action="assessChildren">👀 Assess Children</button>
                <button class="btn secondary" data-action="summarizeStatus">📊 Status Summary</button>
            </div>
            ${node.children.length > 0 ? `
                <div class="node-children">
                    ${node.children.map(child => renderSubNode(child, level + 1)).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function generateMermaidDiagram(rootNode) {
    if (!rootNode) return '';
    
    let diagram = 'graph TD\n';
    let nodeCounter = 0;
    const nodeMap = new Map();
    
    function processNode(node, parentId = null) {
        const nodeId = `node${nodeCounter++}`;
        nodeMap.set(node.path, nodeId);
        
        // Determine node styling based on status
        const statusClass = {
            'not-started': 'pending',
            'in-progress': 'active', 
            'completed': 'done',
            'unknown': 'default'
        }[node.status] || 'default';
        
        // Add node definition with click handling
        const nodeLabel = node.name.replace(/[^a-zA-Z0-9]/g, ' ');

        // The root node gets a different style
        const style = parentId === null ? `style ${nodeId} fill:#90ee90,stroke:#333,stroke-width:4px` : '';

        diagram += `    ${nodeId}["🔗 ${nodeLabel}"]:::${statusClass}\n`;
        if (style) {
            diagram += `    ${style}\n`;
        }
        diagram += `    click ${nodeId} "javascript:handleDiagramNodeClick('${node.path}')"\n`;
        
        // Add connection to parent
        if (parentId) {
            diagram += `    ${parentId} --> ${nodeId}\n`;
        }
        
        // Process children
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => processNode(child, nodeId));
        }
    }
    
    // Process the root node and its descendants
    processNode(rootNode);
    
    // Add styling class definitions
    diagram += `
    classDef pending fill:#fff2cc,stroke:#d6b656,color:#000
    classDef active fill:#d5e8d4,stroke:#82b366,color:#000  
    classDef done fill:#d4edda,stroke:#28a745,color:#000
    classDef default fill:#f8f9fa,stroke:#6c757d,color:#000
    `;
    
    return diagram;
}

function handleDiagramNodeClick(nodePath) {
    console.log('DevTreeFlow WebView: Diagram node clicked:', nodePath);
    // Show action menu for clicked node
    const actions = [
        { label: '🎯 Switch to Me', action: 'switchToNode' },
        { label: '👨‍👩‍👧‍👦 Follow Parent', action: 'switchAndFollowParent' },
        { label: '👀 Assess Children', action: 'assessChildren' },
        { label: '📊 Status Summary', action: 'summarizeStatus' }
    ];
    
    // Create a simple action menu (you could make this more sophisticated)
    const actionMenu = document.getElementById('diagramActionMenu') || createActionMenu();
    showActionMenu(actionMenu, nodePath, actions);
}

function createActionMenu() {
    const menu = document.createElement('div');
    menu.id = 'diagramActionMenu';
    menu.className = 'diagram-action-menu';
    menu.style.cssText = `
        position: absolute;
        background: var(--vscode-menu-background);
        border: 1px solid var(--vscode-menu-border);
        border-radius: 4px;
        padding: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 1000;
        display: none;
    `;
    document.body.appendChild(menu);
    return menu;
}

function showActionMenu(menu, nodePath, actions) {
    menu.innerHTML = actions.map(action => 
        `<button class="diagram-action-btn" data-action="${action.action}" data-path="${nodePath}">
            ${action.label}
        </button>`
    ).join('');
    
    menu.style.display = 'block';
    
    // Position menu near mouse (simplified positioning)
    menu.style.left = '50%';
    menu.style.top = '50%';
    
    // Add click handlers
    menu.querySelectorAll('.diagram-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const path = e.target.dataset.path;
            
            if (copyToPromptBuilderMode) {
                vscode.postMessage({
                    command: 'treeActionPrompt',
                    prompt: `nodePath:${path}\naction:${action}`
                });
            } else {
                vscode.postMessage({
                    command: action,
                    nodePath: path
                });
            }
            
            menu.style.display = 'none';
        });
    });
    
    // Hide menu when clicking outside
    document.addEventListener('click', function hideMenu(e) {
        if (!menu.contains(e.target)) {
            menu.style.display = 'none';
            document.removeEventListener('click', hideMenu);
        }
    });
}

// Make function globally available for Mermaid click handlers
window.handleDiagramNodeClick = handleDiagramNodeClick;

// Improved Mermaid and pan-zoom initialization function
function initializeMermaidWithPanZoom(nodes) {
    console.log('Initializing Mermaid with pan-zoom for nodes:', nodes);
    
    // Check if required libraries are available
    if (typeof mermaid === 'undefined') {
        console.error('Mermaid library not available');
        return;
    }
    
    if (typeof svgPanZoom === 'undefined') {
        console.error('svg-pan-zoom library not available');
        return;
    }

    // Initialize mermaid first
    try {
        mermaid.init();
        console.log('Mermaid initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Mermaid:', error);
        return;
    }

    // Use MutationObserver to detect when SVG elements are rendered
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if this is an SVG element or contains SVG elements
                        const svgElements = node.tagName === 'svg' ? [node] : node.querySelectorAll ? node.querySelectorAll('svg') : [];
                        svgElements.forEach(svgElement => {
                            if (!svgElement.dataset.panZoomInitialized) {
                                // Find the container for this SVG
                                const container = svgElement.closest('[id^="mermaidContainer_"]');
                                if (container) {
                                    const containerIdMatch = container.id.match(/mermaidContainer_(.+)/);
                                    if (containerIdMatch) {
                                        const nodeName = containerIdMatch[1];
                                        console.log(`Detected SVG render for node: ${nodeName}`);
                                        
                                        // Small delay to ensure SVG is fully rendered
                                        setTimeout(() => {
                                            initializePanZoomForSVG(svgElement, container, nodeName);
                                        }, 100);
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });
    });

    // Start observing the diagram tree view
    const diagramTreeView = document.getElementById('diagramTreeView');
    if (diagramTreeView) {
        observer.observe(diagramTreeView, {
            childList: true,
            subtree: true
        });
        
        // Stop observing after 10 seconds to prevent memory leaks
        setTimeout(() => {
            observer.disconnect();
            console.log('SVG observer disconnected');
        }, 10000);
    }

    // Fallback: try to initialize pan-zoom after a delay for any existing SVG elements
    setTimeout(() => {
        nodes.forEach(node => {
            const containerId = `mermaidContainer_${node.name.replace(/\W/g, '')}`;
            const container = document.getElementById(containerId);
            const svgElement = container ? container.querySelector('svg') : null;
            
            if (svgElement && !svgElement.dataset.panZoomInitialized) {
                console.log(`Fallback initialization for: ${node.name}`);
                initializePanZoomForSVG(svgElement, container, node.name);
            }
        });
    }, 1500);
}

// Separate function to initialize pan-zoom for a specific SVG element
function initializePanZoomForSVG(svgElement, container, nodeName) {
    try {
        console.log(`Initializing pan-zoom for: ${nodeName}`);
        
        // Ensure the container has proper dimensions
        const containerRect = container.getBoundingClientRect();
        if (containerRect.width === 0 || containerRect.height === 0) {
            console.warn(`Container has zero dimensions for ${nodeName}, retrying...`);
            // Retry after a short delay
            setTimeout(() => {
                const newRect = container.getBoundingClientRect();
                if (newRect.width > 0 && newRect.height > 0) {
                    initializePanZoomForSVG(svgElement, container, nodeName);
                }
            }, 500);
            return;
        }
        
        // Clean up any existing pan-zoom instance
        if (svgElement.panZoomInstance) {
            svgElement.panZoomInstance.destroy();
            delete svgElement.panZoomInstance;
        }
        
        // Remove any existing transforms that might interfere
        svgElement.style.transform = '';
        svgElement.removeAttribute('transform');
        
        // Force SVG to use full container space
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        svgElement.style.minWidth = '300px';
        svgElement.style.minHeight = '200px';
        svgElement.style.maxWidth = 'none';
        svgElement.style.maxHeight = 'none';
        
        // Configure preserveAspectRatio for better stretching
        svgElement.removeAttribute('preserveAspectRatio');
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        // Force viewBox to match container if needed
        const containerDimensions = container.getBoundingClientRect();
        const currentViewBox = svgElement.getAttribute('viewBox');
        if (currentViewBox) {
            const viewBoxParts = currentViewBox.split(' ');
            if (viewBoxParts.length === 4) {
                // Keep the original aspect ratio but expand to container
                const originalWidth = parseFloat(viewBoxParts[2]);
                const originalHeight = parseFloat(viewBoxParts[3]);
                const containerAspect = containerDimensions.width / containerDimensions.height;
                const originalAspect = originalWidth / originalHeight;
                
                let newWidth = originalWidth;
                let newHeight = originalHeight;
                
                if (containerAspect > originalAspect) {
                    // Container is wider, expand width
                    newWidth = originalHeight * containerAspect;
                } else {
                    // Container is taller, expand height  
                    newHeight = originalWidth / containerAspect;
                }
                
                // Set new viewBox with expanded dimensions
                svgElement.setAttribute('viewBox', `${viewBoxParts[0]} ${viewBoxParts[1]} ${newWidth} ${newHeight}`);
            }
        }
        
        // Configure the container to ensure proper sizing
        container.style.display = 'block';
        container.style.position = 'relative';
        
        // Configure pan-zoom with optimized settings for full container usage
        const panZoomInstance = svgPanZoom(svgElement, {
            zoomEnabled: true,
            controlIconsEnabled: true,
            fit: true, // Start with fit to show full content
            center: true, // Center the content initially
            minZoom: 0.1,
            maxZoom: 10,
            mouseWheelZoomEnabled: true,
            preventMouseEventsDefault: false, // Allow some mouse events to pass through
            panEnabled: true,
            dblClickZoomEnabled: true,
            zoomScaleSensitivity: 0.1,
            contain: false, // Allow panning outside the initial viewBox
            beforeZoom: function(oldScale, newScale) {
                // Allow zoom
                return true;
            },
            beforePan: function(oldPan, newPan) {
                // Allow pan throughout the entire container space
                return true;
            },
            onZoom: function(scale) {
                // Optional: Add zoom feedback
                console.log(`Zoom level: ${scale}`);
            }
        });
        
        // Force the SVG to use full container width after pan-zoom initialization
        setTimeout(() => {
            if (panZoomInstance && svgElement) {
                // Get the current zoom and pan state
                const zoom = panZoomInstance.getZoom();
                const pan = panZoomInstance.getPan();
                
                // Reset and configure for full width usage
                panZoomInstance.resetZoom();
                panZoomInstance.resetPan();
                
                // Force SVG to fill container width by adjusting the zoom
                const containerWidth = containerDimensions.width - 16; // Account for padding
                const svgWidth = svgElement.getBBox ? svgElement.getBBox().width : svgElement.clientWidth;
                
                if (svgWidth > 0 && containerWidth > 0) {
                    const scaleToFitWidth = containerWidth / svgWidth;
                    panZoomInstance.zoom(scaleToFitWidth);
                    panZoomInstance.center();
                }
                
                console.log(`SVG resized to container width for: ${nodeName}`, {
                    containerWidth,
                    svgWidth,
                    appliedScale: containerWidth / svgWidth
                });
            }
        }, 100);
        
        // Mark as initialized and store instance
        svgElement.dataset.panZoomInitialized = 'true';
        svgElement.panZoomInstance = panZoomInstance;
        
        // Add specialized event handling for wheel events
        const wheelHandler = function(e) {
            // Only prevent default if the event is actually on the SVG
            if (e.target.closest('svg') === svgElement) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        
        container.addEventListener('wheel', wheelHandler, { passive: false });
        
        // Store the handler for cleanup
        container._wheelHandler = wheelHandler;
        
        console.log(`Pan-zoom initialized successfully for: ${nodeName}`, {
            containerDimensions: containerRect,
            svgDimensions: {
                width: svgElement.clientWidth,
                height: svgElement.clientHeight,
                viewBox: svgElement.getAttribute('viewBox'),
                actualStyleWidth: svgElement.style.width,
                actualStyleHeight: svgElement.style.height
            },
            panZoomEnabled: true,
            panZoomViewport: panZoomInstance ? {
                width: panZoomInstance.getSizes().width,
                height: panZoomInstance.getSizes().height,
                viewBox: panZoomInstance.getSizes().viewBox
            } : 'not available'
        });
        
    } catch (error) {
        console.error(`Failed to initialize pan-zoom for ${nodeName}:`, error);
    }
}

// Cleanup function to destroy all pan-zoom instances
function cleanupPanZoomInstances() {
    const allSVGs = document.querySelectorAll('[id^="mermaidContainer_"] svg');
    allSVGs.forEach(svg => {
        if (svg.panZoomInstance) {
            try {
                svg.panZoomInstance.destroy();
                delete svg.panZoomInstance;
                svg.removeAttribute('data-pan-zoom-initialized');
                console.log('Cleaned up pan-zoom instance for SVG');
            } catch (error) {
                console.warn('Error cleaning up pan-zoom instance:', error);
            }
        }
        
        // Clean up wheel event handlers
        const container = svg.closest('[id^="mermaidContainer_"]');
        if (container && container._wheelHandler) {
            container.removeEventListener('wheel', container._wheelHandler);
            delete container._wheelHandler;
        }
    });
}

// Global functions for diagram management
window.focusSingleDiagram = function(diagramName) {
    console.log('Focusing single diagram:', diagramName);
    document.querySelectorAll('.diagram-instance').forEach(instance => {
        const title = instance.querySelector('h4').textContent;
        if (title === diagramName) {
            instance.style.display = 'block';
            // Ensure pan-zoom is initialized for the focused diagram
            const container = instance.querySelector('[id^="mermaidContainer_"]');
            const svg = container ? container.querySelector('svg') : null;
            if (svg && !svg.dataset.panZoomInitialized) {
                setTimeout(() => {
                    initializePanZoomForSVG(svg, container, diagramName);
                }, 100);
            }
        } else {
            instance.style.display = 'none';
        }
    });
};

window.showAllDiagrams = function() {
    console.log('Showing all diagrams');
    document.querySelectorAll('.diagram-instance').forEach(instance => {
        instance.style.display = 'block';
        // Ensure pan-zoom is initialized for all visible diagrams
        const container = instance.querySelector('[id^="mermaidContainer_"]');
        const svg = container ? container.querySelector('svg') : null;
        if (svg && !svg.dataset.panZoomInitialized) {
            const title = instance.querySelector('h4').textContent;
            setTimeout(() => {
                initializePanZoomForSVG(svg, container, title);
            }, 100);
        }
    });
};





document.getElementById('treeContainer').addEventListener('click', (event) => {
    const target = event.target;
    
    // Handle tree control buttons (expand/collapse/focus)
    if (target.classList.contains('tree-toggle-btn')) {
        const treeName = target.dataset.tree;
        if (collapsedTrees.has(treeName)) {
            collapsedTrees.delete(treeName);
        } else {
            collapsedTrees.add(treeName);
        }
        // Refresh the tree display
        const container = document.getElementById('treeContainer');
        const currentData = window.currentTreeData; // We need to store this
        if (currentData) {
            updateTreeDisplay(currentData);
        }
        return;
    } else if (target.classList.contains('tree-focus-btn')) {
        const treeName = target.dataset.tree;
        focusedTree = treeName;
        // Refresh the tree display
        const container = document.getElementById('treeContainer');
        const currentData = window.currentTreeData;
        if (currentData) {
            updateTreeDisplay(currentData);
        }
        return;
    }
    
    // Handle regular tree node action buttons
    if (target.tagName === 'BUTTON' && target.dataset.action) {
        const nodeElement = target.closest('.tree-node');
        if (nodeElement) {
            const nodePath = nodeElement.dataset.path;
            const action = target.dataset.action;
            
            if (copyToPromptBuilderMode) {
                vscode.postMessage({
                    command: 'treeActionPrompt',
                    prompt: `nodePath:${nodePath}\naction:${action}`
                });
            } else {
                vscode.postMessage({
                    command: action,
                    nodePath: nodePath
                });
            }
        }
    }
});

// Global event listeners for tree control buttons
document.addEventListener('click', (event) => {
    if (event.target.id === 'expandAllTreesBtn') {
        collapsedTrees.clear();
        if (window.currentTreeData) {
            updateTreeDisplay(window.currentTreeData);
        }
    } else if (event.target.id === 'collapseAllTreesBtn') {
        if (window.currentTreeData && window.currentTreeData.nodes) {
            window.currentTreeData.nodes.forEach(node => collapsedTrees.add(node.name));
            updateTreeDisplay(window.currentTreeData);
        }
    } else if (event.target.id === 'resetFocusBtn') {
        focusedTree = null;
        if (window.currentTreeData) {
            updateTreeDisplay(window.currentTreeData);
        }
    }
});

function updateAutoPromptingState(isEnabled) {
    const button = document.getElementById('autoPromptToggle');
    const text = document.getElementById('autoPromptText');
    
    if (isEnabled) {
        button.classList.add('enabled');
        text.textContent = 'Auto-Prompting ON';
    } else {
        button.classList.remove('enabled');
        text.textContent = 'Enable Auto-Prompting';
    }
}

function updateDashboardState(message) {
    console.log('DevTreeFlow WebView: Received updateDashboardState message:', message);
    const contextFilesContainer = document.getElementById('contextFilesContainer');
    const promptBuilderTextarea = document.getElementById('promptBuilderTextarea');
    const copyToPromptBuilderToggle = document.getElementById('copyToPromptBuilderToggle');

    if (message.contextFolderStructure) {
        currentFolderStructure = message.contextFolderStructure;
        currentContextFileTicks = message.contextFileTicks || {};
        
        const contextFilesHTML = `
            <h3>📄 Project Specific Context Files</h3>
            <div class="context-header-actions">
                <button class="btn secondary" id="createContextFolderBtn" title="Create new folder">
                    <span class="icon">📁</span>New Folder
                </button>
                <button class="btn secondary" id="createContextDocumentBtn" title="Create new document">
                    <span class="icon">📄</span>New Document
                </button>
                <button class="btn secondary" id="expandAllFoldersBtn" title="Expand all folders">
                    <span class="icon">📂</span>Expand All
                </button>
                <button class="btn secondary" id="collapseAllFoldersBtn" title="Collapse all folders">
                    <span class="icon">📁</span>Collapse All
                </button>
                <button class="btn secondary" id="refreshContextFilesBtn" title="Refresh">
                    <span class="icon">🔄</span>Refresh
                </button>
            </div>
            <div class="context-folder-tree">
                ${renderFolderStructure(message.contextFolderStructure, message.contextFileTicks || {})}
            </div>
        `;
        contextFilesContainer.innerHTML = contextFilesHTML;
        // Re-add event listeners
        document.getElementById('createContextFolderBtn').addEventListener('click', () => vscode.postMessage({ command: 'createContextFolder', folderPath: '' }));
        document.getElementById('createContextDocumentBtn').addEventListener('click', () => vscode.postMessage({ command: 'createContextDocument', folderPath: '' }));
        document.getElementById('expandAllFoldersBtn').addEventListener('click', expandAllFolders);
        document.getElementById('collapseAllFoldersBtn').addEventListener('click', collapseAllFolders);
        document.getElementById('refreshContextFilesBtn').addEventListener('click', () => vscode.postMessage({ command: 'refreshContextFiles' }));
    }

    if (message.promptBuilderContent !== undefined) {
        promptBuilderTextarea.value = message.promptBuilderContent;
    }

    if (message.copyToPromptBuilderMode !== undefined) {
        copyToPromptBuilderMode = message.copyToPromptBuilderMode;
        copyToPromptBuilderToggle.checked = message.copyToPromptBuilderMode;
    }
}

function renderFolderStructure(structure, ticks) {
    if (!structure) return '';
    
    let html = '';
    
    if (structure.type === 'folder') {
        const isCollapsed = collapsedFolders.has(structure.path);
        const hasChildren = structure.children && structure.children.length > 0;
        const toggleIcon = hasChildren ? (isCollapsed ? '▶' : '▼') : '';
        
        let toggleButton = '';
        if (hasChildren) {
            const expandedClass = isCollapsed ? '' : 'expanded';
            toggleButton = `<button class="context-folder-toggle ${expandedClass}" data-path="${structure.path}">${toggleIcon}</button>`;
        } else {
            toggleButton = '<span style="width: 16px; display: inline-block;"></span>';
        }
        
        html += `<div class="context-folder-item">
            <div class="context-folder-header" data-path="${structure.path}">
                ${toggleButton}
                <span class="context-folder-icon">📁</span>
                <span class="context-folder-name">${structure.name}</span>
            </div>
            <div class="context-folder-actions">
                <button class="context-add-btn" data-action="createFolder" data-path="${structure.path}" title="Add subfolder">📁+</button>
                <button class="context-add-btn" data-action="createDocument" data-path="${structure.path}" title="Add document">📄+</button>
            </div>
        </div>`;
        
        if (hasChildren) {
            html += `<div class="context-folder-children ${isCollapsed ? 'collapsed' : ''}" data-parent-path="${structure.path}">`;
            structure.children.forEach(function(child) {
                html += renderFolderStructure(child, ticks);
            });
            html += '</div>';
        }
    } else if (structure.type === 'file') {
        html += `<div class="context-folder-item">
            <input type="checkbox" class="context-file-checkbox" data-path="${structure.path}" ${ticks[structure.path] ? 'checked' : ''}>
            <span class="context-folder-icon">📄</span>
            <span class="context-folder-name">${structure.name}</span>
            <div class="context-folder-actions">
                <button class="context-add-btn" data-action="open" data-path="${structure.path}" title="Open">👁️</button>
            </div>
        </div>`;
    }
    
    return html;
}

document.getElementById('contextFilesContainer').addEventListener('click', (event) => {
    const target = event.target;
    const path = target.dataset.path;

    if (target.classList.contains('context-folder-toggle') || target.closest('.context-folder-header')) {
        const folderPath = target.closest('[data-path]').dataset.path;
        toggleFolder(folderPath);
    } else if (target.dataset.action === 'createFolder') {
        vscode.postMessage({ command: 'createContextFolder', folderPath: path });
    } else if (target.dataset.action === 'createDocument') {
        vscode.postMessage({ command: 'createContextDocument', folderPath: path });
    } else if (target.dataset.action === 'open') {
        vscode.postMessage({ command: 'openContextFile', filename: path });
    } else if (target.classList.contains('context-file-checkbox')) {
        vscode.postMessage({ command: 'toggleContextFileTick', filename: path });
    } else if ((target.classList.contains('context-folder-name') || target.classList.contains('context-folder-icon')) && target.closest('.context-folder-item').querySelector('.context-file-checkbox')) {
        // Handle clicking on the file name label or file icon to toggle checkbox
        const fileItem = target.closest('.context-folder-item');
        const checkbox = fileItem.querySelector('.context-file-checkbox');
        const filePath = checkbox.dataset.path;
        vscode.postMessage({ command: 'toggleContextFileTick', filename: filePath });
    }
});

function toggleFolder(folderPath) {
    if (collapsedFolders.has(folderPath)) {
        collapsedFolders.delete(folderPath);
    } else {
        collapsedFolders.add(folderPath);
    }
    reRenderFolderStructure();
}

function expandAllFolders() {
    collapsedFolders.clear();
    reRenderFolderStructure();
}

function collapseAllFolders() {
    if (currentFolderStructure) {
        function collectFolderPaths(structure) {
            const paths = [];
            if (structure.type === 'folder' && structure.children && structure.children.length > 0) {
                paths.push(structure.path);
                structure.children.forEach(child => {
                    paths.push(...collectFolderPaths(child));
                });
            }
            return paths;
        }
        const allFolderPaths = collectFolderPaths(currentFolderStructure);
        allFolderPaths.forEach(path => collapsedFolders.add(path));
        reRenderFolderStructure();
    }
}

function reRenderFolderStructure() {
    if (currentFolderStructure) {
        const container = document.querySelector('.context-folder-tree');
        if(container) {
            container.innerHTML = renderFolderStructure(currentFolderStructure, currentContextFileTicks);
        }
    }
} 