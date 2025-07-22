# Release Management Context

## 🚨 **CRITICAL SETUP**
```
RELEASE_NOTES_STATUS: 1  # 1 = Template Available, 0 = Needs Setup
RELEASE_NOTES_TEMPLATE: release-notes-templates/professional-template.md
EXAMPLE_NOTES: release-notes-examples/Release_Notes_2025-06-09_Professional.md
```

## 📋 **RELEASE NOTES STRUCTURE**

### **Standard Sections**
```
1. 🚀 Header & Introduction
2. ✨ Major Features & Improvements
3. 🔧 Quality of Life Improvements
4. 🐛 Bug Fixes & Stability
5. 🔒 Security Updates (if applicable)
6. 🎯 Sprint Summary
7. 🚀 What's Next
8. 📞 Support Information
```

### **Category Icons**
```
CATEGORY_ICONS = {
    "major_feature": "✨",
    "improvement": "🔧",
    "bug_fix": "🐛",
    "security": "🔒",
    "ui_ux": "🎨",
    "analytics": "📊",
    "communication": "📧",
    "integration": "🔗",
    "performance": "⚡",
    "documentation": "📚"
}
```

## 🎯 **TICKET ANALYSIS WORKFLOW**

### **1. Ticket Categorization**
```python
def categorize_ticket(ticket):
    categories = {
        "major_feature": ["new feature", "major enhancement", "new functionality"],
        "improvement": ["enhancement", "improve", "update", "rename"],
        "bug_fix": ["bug", "fix", "issue", "error"],
        "security": ["security", "privacy", "protection"],
        "ui_ux": ["UI", "UX", "design", "visual", "font", "color"],
        "analytics": ["analytics", "tracking", "metrics"],
        "communication": ["email", "notification", "message"],
        "integration": ["integration", "connect", "API"],
        "performance": ["performance", "speed", "optimize"],
        "documentation": ["doc", "guide", "help", "FAQ"]
    }
    
    # Analyze ticket title and description
    # Return appropriate category and icon
```

### **2. Business Impact Analysis**
```python
def analyze_business_impact(ticket):
    impact_template = """
    **What's New/Fixed:**
    - {key_changes}
    
    **Why This Matters:**
    {business_value}
    """
    
    # Extract key changes from ticket
    # Determine business value
    # Format using template
```

### **3. Release Note Generation**
```python
def generate_release_notes(tickets, sprint_info):
    # Group tickets by category
    # Sort by priority/impact
    # Apply professional formatting
    # Include sprint summary
    # Add support information
```

## 📝 **EXAMPLE RELEASE NOTES**

See our gold-standard example in `release-notes-examples/Release_Notes_2025-06-09_Professional.md`:

Key elements that make it excellent:
1. Clear categorization with visual icons
2. Business-focused descriptions
3. User-friendly explanations
4. Professional formatting
5. Comprehensive coverage
6. Sprint context
7. Future outlook
8. Support information

## 🔄 **RELEASE WORKFLOW**

### **1. Preparation**
```bash
# Create release branch
git checkout -b release/v{version}

# Get completed tickets
az boards query --wiql "SELECT [System.Id], [System.Title], [System.State] 
                       FROM WorkItems 
                       WHERE [System.State] IN ('Resolved', 'Closed') 
                       AND [System.IterationPath] = 'MyCarMatch\\{sprint}'"
```

### **2. Ticket Analysis**
1. Fetch all tickets in release
2. Categorize each ticket
3. Analyze business impact
4. Group by category

### **3. Notes Generation**
1. Use professional template
2. Include all categories
3. Add business context
4. Include sprint summary

### **4. Review & Refinement**
1. Technical review
2. Business review
3. Format check
4. Link verification

### **5. Publication**
1. Save to release-notes folder
2. Update Azure DevOps
3. Notify stakeholders

## 📁 **FOLDER STRUCTURE**
```
release-management/
├── templates/
│   └── professional-template.md
├── examples/
│   └── Release_Notes_2025-06-09_Professional.md
└── releases/
    └── {YYYY-MM-DD}/
        ├── release-notes.md
        └── metadata.json
```

## 🤖 **AI ASSISTANT INSTRUCTIONS**

### **Example-Based Learning**
```
CRITICAL: ALWAYS refer to Release_Notes_2025-06-09_Professional.md as your primary example
This example demonstrates:
1. Professional business-focused writing style
2. Effective categorization of changes
3. Clear "What's New" and "Why This Matters" sections
4. Proper use of emojis and formatting
5. Balanced technical and user-friendly descriptions
```

### **Pattern Matching from Example**
When writing release notes, match these patterns from the example:

1. **Feature Descriptions**:
```
### 🤝 **{Feature Name}** 
*Ticket #{ID}: {Original Title}*

**What's New:**
- Point 1
- Point 2
- Point 3

**Why This Matters:**
{Business value in user-friendly terms}
```

2. **Improvement Descriptions**:
```
### 🎯 **{Improvement Name}**
*Ticket #{ID}: {Original Title}*

**What's Changed:**
- Specific change 1
- Specific change 2

**Why This Matters:**
{User benefit explanation}
```

3. **Bug Fix Descriptions**:
```
### 📧 **{Bug Fix Category}**
*Ticket #{ID}: {Original Title}*

**What's Fixed:**
- Technical fix details
- User-facing improvements

{Add "Why This Matters" for significant fixes}
```

### **Release Notes Generation**
1. Get list of tickets for release
2. For each ticket:
   - Study example Release_Notes_2025-06-09_Professional.md for similar tickets
   - Match the writing style and structure
   - Use similar categorization patterns
   - Mirror the business value presentation
3. Group by category following example structure
4. Apply professional template
5. Include sprint context
6. Add support information

### **Quality Checks**
1. Verify all tickets included
2. Check categorization accuracy
3. Ensure business value clear
4. Validate formatting
5. Confirm links working

### **Best Practices**
1. Use consistent voice
2. Focus on user benefits
3. Keep technical details relevant
4. Include visual elements
5. Maintain professional tone

## 📊 **METRICS & TRACKING**

### **Release Quality Metrics**
```
QUALITY_CHECKS = {
    "completeness": "All tickets included",
    "categorization": "Proper grouping",
    "business_value": "Clear benefits",
    "formatting": "Professional layout",
    "readability": "User-friendly language"
}
```

### **Required Fields**
```
REQUIRED_FIELDS = {
    "version": "Release version",
    "date": "Release date",
    "sprint": "Sprint name/number",
    "tickets": "List of included tickets",
    "categories": "Feature groupings",
    "impacts": "Business value statements"
}
```

## 🔍 **EXAMPLE QUERIES**

### **Get Release Tickets**
```sql
SELECT [System.Id], [System.Title], [System.State], [System.Tags]
FROM WorkItems 
WHERE [System.IterationPath] = 'MyCarMatch\\{sprint}'
AND [System.State] IN ('Resolved', 'Closed')
ORDER BY [Microsoft.VSTS.Common.Priority]
```

### **Get Major Features**
```sql
SELECT [System.Id], [System.Title]
FROM WorkItems 
WHERE [System.Tags] CONTAINS 'major-feature'
AND [System.IterationPath] = 'MyCarMatch\\{sprint}'
```

## 🎯 **READY FOR OPERATIONS**

This context provides:
- ✅ Professional template
- ✅ Gold-standard example to follow
- ✅ Categorization system
- ✅ Business impact analysis
- ✅ Generation workflow
- ✅ Quality checks
- ✅ Best practices
- ✅ Pattern matching guidance

CRITICAL REMINDER: Always refer to Release_Notes_2025-06-09_Professional.md as your primary example for style, structure, and tone.

## 📝 **WRITING STYLE GUIDE**

### **Learn from Example**
Study these specific sections from Release_Notes_2025-06-09_Professional.md:

1. **Major Features** (e.g., "Smart Trade-In Offer Acceptance System"):
   - Clear feature name
   - Bullet-pointed capabilities
   - Strong business value statement

2. **Quality Improvements** (e.g., "Enhanced FAQ Navigation"):
   - User-focused title
   - Clear "What's New" section
   - Concise "Why This Matters"

3. **Bug Fixes** (e.g., "Email Communication Enhancements"):
   - Grouped by category
   - Technical details when relevant
   - User impact explained

### **Voice and Tone**
Match the example's:
- Professional but approachable voice
- User-focused explanations
- Clear business value statements
- Consistent formatting
- Strategic emoji usage

Use this guide to maintain consistent, professional release notes that effectively communicate value to users. 