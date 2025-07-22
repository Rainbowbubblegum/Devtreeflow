# DevTreeFlow Extension - Test Guide

## Fixed Issues Summary

### 1. ✅ Prompt Template Quality
- **generateGenesisPrompt**: Now has consistent `<invoke>` syntax with all required parameters
- **createTreeFromBreakdown**: Complete prompt with all execution steps and proper XML closing tags
- All tool calls now include required parameters: command, is_background, explanation for run_terminal_cmd

### 2. ✅ Variable Replacement
- Added clear instructions for replacing placeholders like [TASK-NAME], [PARENT-NAME], [CURRENT-DATE]
- Example breakdown structure provided to show how to extract values from JSON data

### 3. ✅ Tool-Call Consistency
- Standardized on `<invoke>` syntax within `<function_calls>` blocks
- All XML tags properly closed
- All required parameters specified for each tool

### 4. ✅ Enhanced tree-start.md Rules
- Added comprehensive naming conventions (kebab-case, max 50 chars)
- Defined leaf vs branch node structures
- Added success criteria checklist
- Quality standards and error prevention guidelines

### 5. ✅ Validation Utility
- Created `PromptValidator` class to check for:
  - Unclosed XML tags
  - Missing required parameters
  - Unresolved placeholders
  - Inconsistent tool syntax
- Added command `devtreeflow.validatePrompts` to run validation

### 6. ✅ Extension Integration
- Added validation command to package.json
- Integrated PromptValidator into extension.ts
- Command available in VS Code command palette

## Testing Steps

### 1. Test Prompt Generation
1. Open VS Code Command Palette (Ctrl+Shift+P)
2. Run "DevTreeFlow: Show Dashboard"
3. Click "New Task Tree"
4. Enter a goal like "Build a user authentication system"
5. Verify the generated prompt has:
   - Proper XML syntax with closed tags
   - All required tool parameters
   - Clear variable replacement instructions

### 2. Test Prompt Validation
1. Open VS Code Command Palette
2. Run "DevTreeFlow: Validate All Prompts"
3. Check the Output panel (View > Output > DevTreeFlow Prompt Validator)
4. Verify all prompts pass validation with no errors

### 3. Test Tree Creation
1. In the dashboard, create a new task tree
2. Copy the generated prompt
3. Paste into AI chat
4. Verify AI can execute all steps without syntax errors

### 4. Verify Fixed Components
- ✅ `src/enhanced-prompt-generator.ts` - Updated generateGenesisPrompt
- ✅ `src/dashboard.ts` - Fixed createTreeFromBreakdown
- ✅ `DevTreeFlow/tree-start.md` - Enhanced with comprehensive rules
- ✅ `src/prompt-validator.ts` - New validation utility
- ✅ `src/extension.ts` - Added validation command
- ✅ `package.json` - Added validatePrompts command

## Expected Results

1. **No Syntax Errors**: All prompts should have valid XML syntax
2. **Complete Instructions**: AI should be able to follow prompts without confusion
3. **Proper Structure**: Created folders follow naming conventions
4. **Validation Pass**: Running validation should show "Validation PASSED"

## Next Steps

If all tests pass:
1. The extension is ready for use
2. AI agents can properly parse and execute tree creation
3. Prompts are consistent and complete

If issues remain:
1. Run the validation command to identify specific problems
2. Check the Output panel for detailed error messages
3. Fix any remaining unclosed tags or missing parameters 