# DevTreeFlow Extension
<img width="1533" height="986" alt="DevTreeFlowLogo" src="https://github.com/user-attachments/assets/05229e00-136c-42d4-b213-ec779c40186f" />



A VS Code/Cursor extension for managing AI-driven development workflows using a structured tree-based context system.

## Features

- **Tree View**: Visualize your DevTreeFlow folder structure in the sidebar
- **Node Actions**: Right-click on any node to access context-switching commands
- **Prompt Generation**: Automatically generates and copies prompts to clipboard
- **Task Management**: Create new task trees and manage development workflows

## Getting Started

1. **Install the Extension**: Load the extension in VS Code/Cursor
2. **Initialize DevTreeFlow**: Click "Initialize DevTreeFlow" when prompted, or use the command palette
3. **Create Task Trees**: Use the "New Task Tree" button to create structured development tasks
4. **Switch Contexts**: Right-click on nodes to switch AI context with appropriate prompts

## Commands

- `DevTreeFlow: Initialize` - Set up the DevTreeFlow folder structure
- `DevTreeFlow: New Task Tree` - Create a new root task
- `DevTreeFlow: Refresh` - Refresh the tree view
- `Switch to Me` - Copy prompt to switch AI to this node's context
- `Switch and Follow Parent Instructions` - Include parent context when switching
- `Assess Children` - Generate prompt to evaluate child node progress
- `Summarize Task Status` - Get status summary for current task

## Folder Structure

```
DevTreeFlow/
├── tree-start.md              # Root agent instructions
├── templates/                 # Template files
│   ├── node-template.md
│   ├── instructions-template.md
│   └── task-template.md
└── [TaskName]/               # Individual task trees
    ├── InstructionsFromParent/
    │   └── [date]_from_[parent].md
    └── MeAndMyChildren/
        ├── 00_intro.md
        └── task_details.md
```

## Usage Workflow

1. **Create a Task Tree**: Use "New Task Tree" to start a new development workflow
2. **Break Down Tasks**: Use the root agent prompt to create child nodes
3. **Switch Contexts**: Use node actions to switch AI focus between different parts of your project
4. **Track Progress**: Update task files and use assessment tools to monitor progress
5. **Coordinate Work**: Use parent-child relationships to maintain context across complex projects

## Benefits

- **Persistent Context**: Maintain AI context across development sessions
- **Structured Workflow**: Break complex tasks into manageable components
- **Clear Communication**: Parent-child instruction system keeps AI focused
- **Progress Tracking**: Built-in progress monitoring and status reporting
- **Accessibility**: Designed for developers with limited AI tool access

## Development

Built with TypeScript and the VS Code Extension API. Compatible with Cursor IDE.

## License

Open source - designed to help under-resourced developers worldwide.
