# Framework Migration Context - MAUI Project

## 🏗️ **CURRENT PROJECT IDENTIFICATION**

**THIS IS A .NET MAUI PROJECT** - You are currently working in a .NET Multi-platform App UI (MAUI) project.

### Project Framework Details
```
CURRENT_FRAMEWORK: ".NET MAUI"
TARGET_FRAMEWORKS: ["net8.0-android", "net8.0-ios", "net8.0-maccatalyst", "net8.0-windows"]
PROJECT_TYPE: "Single Project (Multi-targeting)"
UI_FRAMEWORK: "MAUI Controls with XAML"
DEPENDENCY_MANAGER: "NuGet (PackageReference)"
BUILD_SYSTEM: "MSBuild (SDK-style .csproj)"
```

## 🎯 **AI BEHAVIORAL RULES FOR MAUI CONTEXT**

### Project Identification Protocol
1. **ALWAYS** announce: "I am working in a .NET MAUI project" when migration requests are detected
2. **VERIFY** target framework before proceeding with any cross-project operations
3. **CONFIRM** destination project location and framework before navigation
4. **VALIDATE** namespace compatibility between MAUI and target framework

### Workspace Navigation Rules
```
CURRENT_WORKSPACE_ROOT: "This MAUI project workspace"
EXTERNAL_NAVIGATION_REQUIRED: When user requests involve "Xamarin project" or "other project"
NAVIGATION_PATTERN: Must explicitly ask for target project path/location
NEVER_ASSUME: Project locations outside current workspace
```

## 🚨 **COMMON AI MISTAKES IN MAUI CONTEXT**

### Critical Issues to Avoid

#### 1. **Project Context Confusion**
```
❌ MISTAKE: Assuming all projects are in same workspace
✅ CORRECT: Ask for explicit path to target project

Example Wrong Approach:
- User: "Move this to Xamarin project"
- AI: *searches current workspace for Xamarin files*

Example Correct Approach:
- User: "Move this to Xamarin project" 
- AI: "I'm currently in a .NET MAUI project. Please provide the path to your Xamarin project as it's likely outside this workspace."
```

#### 2. **Namespace Confusion**
```
❌ MISTAKE: Using Xamarin namespaces in MAUI context
✅ CORRECT: Maintain MAUI-specific namespaces

MAUI Namespaces:
- Microsoft.Maui
- Microsoft.Maui.Controls
- Microsoft.Maui.Controls.Xaml
- Microsoft.Maui.Graphics
- Microsoft.Maui.Essentials
- Microsoft.Maui.Authentication
- Microsoft.Maui.Storage

NEVER use in MAUI:
- Xamarin.Forms
- Xamarin.Forms.Xaml
- Xamarin.Essentials (use Microsoft.Maui.Essentials)
```

#### 3. **Dependency Management Errors**
```
❌ MISTAKE: Suggesting Xamarin packages for MAUI
✅ CORRECT: Use MAUI-compatible packages

MAUI Dependencies:
- Microsoft.Maui.Controls
- Microsoft.Maui.Controls.Compatibility
- Microsoft.Maui.Essentials
- CommunityToolkit.Maui
- Microsoft.Extensions.* (DI, Logging, etc.)

Avoid suggesting:
- Xamarin.Forms.*
- Xamarin.Essentials (use Microsoft.Maui.Essentials)
- .NET Framework specific packages
```

#### 4. **Project Structure Misunderstanding**
```
❌ MISTAKE: Assuming multi-project structure like Xamarin
✅ CORRECT: Recognize single project with platform targeting

MAUI Structure:
- Single .csproj with multi-targeting
- Platforms/ folder (Android/, iOS/, Windows/, MacCatalyst/)
- Resources/ folder (Images/, Fonts/, Raw/, etc.)
- MauiProgram.cs as entry point

Xamarin Structure (different):
- Multiple projects (.Shared, .Android, .iOS, .UWP)
```

#### 5. **Handler vs Renderer Confusion**
```
❌ MISTAKE: Suggesting Xamarin renderers for MAUI
✅ CORRECT: Use MAUI handlers architecture

MAUI Handlers:
- Microsoft.Maui.Handlers namespace
- IElementHandler interface
- Platform-specific handler classes
- Handler registration in MauiProgram.cs

Xamarin Renderers (don't use):
- Custom renderers (legacy)
- Platform-specific renderer projects
```

## 📁 **MAUI PROJECT ARCHITECTURE AWARENESS**

### File Structure Recognition
```
MAUI_INDICATORS:
- *.xaml files with Microsoft.Maui namespace
- App.xaml with Microsoft.Maui.Controls.Application
- MauiProgram.cs file
- Platforms/ folder structure
- Single .csproj with <UseMaui>true</UseMaui>
- <TargetFrameworks> with net8.0-* platforms

PROJECT_STRUCTURE:
- Root project files (.csproj, MauiProgram.cs, App.xaml)
- Platforms/ (Android/, iOS/, Windows/, MacCatalyst/)
- Resources/ (Images/, Fonts/, Raw/, Splash/)
- Views/, ViewModels/, Models/, Services/ (typical folders)
```

### ViewModels and Components
```
MAUI_PATTERNS:
- ViewModels inherit from INotifyPropertyChanged or ObservableObject
- Commands use Microsoft.Toolkit.Mvvm.Input.RelayCommand or built-in Command
- Navigation via Shell or INavigationService
- Dependency injection via Microsoft.Extensions.DependencyInjection
- Platform-specific code via conditional compilation or handlers

COMPONENT_LOCATIONS:
- Views: Usually in Views/ or Pages/ folder
- ViewModels: Usually in ViewModels/ folder  
- Models: Usually in Models/ folder
- Services: Usually in Services/ folder
- Handlers: Usually in Handlers/ folder
- Platform code: Platforms/[Platform]/ folders
```

## 🔄 **MIGRATION DETECTION AND HANDLING**

### Migration Request Patterns
```
DETECT_MIGRATION_INTENT:
- "move to Xamarin"
- "migrate to Xamarin" 
- "port to Xamarin"
- "create same in Xamarin"
- "duplicate in Xamarin project"
- "copy to other project"
- "move to different framework"
- "legacy project"
```

### Migration Response Protocol
```
STEP_1: Identify current framework (MAUI)
STEP_2: Confirm target framework (Xamarin/other)
STEP_3: Request target project location/path
STEP_4: Analyze component for migration compatibility
STEP_5: Provide framework-specific migration guidance
STEP_6: Warn about potential breaking changes
```

## 🛠️ **MAUI-SPECIFIC DEVELOPMENT PATTERNS**

### UI Development
```
XAML_STRUCTURE:
- ContentPage as base page type
- StackLayout, Grid, FlexLayout for layouts
- Label, Entry, Button for basic controls
- CollectionView, ListView for data display
- Custom controls via ContentView or custom handlers

BINDING_PATTERNS:
- {Binding PropertyName}
- {x:Static} for static resources
- {x:Reference} for element references
- Converters for data transformation
- Source generators for binding performance
```

### Navigation Patterns
```
NAVIGATION_TYPES:
- Shell navigation (preferred)
- NavigationPage for hierarchical navigation
- TabbedPage for tab-based navigation
- FlyoutPage for drawer navigation

NAVIGATION_CODE:
- await Shell.Current.GoToAsync("//route")
- await Shell.Current.GoToAsync($"details?id={id}")
- await Navigation.PushAsync(new Page())
- Routing with Shell.SetTabBarIsVisible()
```

### Platform-Specific Code
```
PLATFORM_ACCESS:
- Conditional compilation (#if ANDROID, #if IOS, etc.)
- Platform-specific folders (Platforms/Android/, etc.)
- Microsoft.Maui.Authentication.WebAuthenticator
- Microsoft.Maui.Storage.Preferences
- Handlers for custom platform UI

PLATFORM_DETECTION:
- DeviceInfo.Platform == DevicePlatform.Android
- DeviceInfo.Platform == DevicePlatform.iOS
- DeviceInfo.Platform == DevicePlatform.WinUI
- DeviceInfo.Platform == DevicePlatform.MacCatalyst
```

### Dependency Injection
```
DI_CONTAINER:
- Microsoft.Extensions.DependencyInjection
- Registration in MauiProgram.cs
- Constructor injection in pages/viewmodels
- Service lifetime management

DI_REGISTRATION:
- builder.Services.AddSingleton<IService, Service>()
- builder.Services.AddTransient<ViewModel>()
- builder.Services.AddScopedWithShellRoute<Page, ViewModel>("route")
```

## ⚠️ **MIGRATION COMPATIBILITY MATRIX**

### MAUI to Xamarin Migration Challenges
```
DIFFICULT_MIGRATIONS:
- Handlers → Custom renderers (architecture change)
- Single project → Multi-project structure
- Modern .NET APIs → .NET Standard/Framework APIs
- Shell navigation → Traditional navigation
- Built-in DI → DependencyService

MODERATE_MIGRATIONS:
- XAML layouts (namespace updates needed)
- ViewModels (dependency injection changes)
- Services (interface compatibility)
- Platform-specific code (API differences)

EASY_MIGRATIONS:
- Basic data models
- Simple business logic
- Basic XAML without advanced features
- Simple converters
```

### Breaking Changes Awareness
```
NAMESPACE_CHANGES:
- Microsoft.Maui.Controls → Xamarin.Forms
- Microsoft.Maui.Controls.Xaml → Xamarin.Forms.Xaml
- Microsoft.Maui.Essentials → Xamarin.Essentials

ARCHITECTURE_CHANGES:
- Handlers → Renderers
- Built-in DI → DependencyService
- Single project → Platform-specific projects
- MauiProgram.cs → App.xaml.cs startup

API_CHANGES:
- DeviceInfo/DeviceDisplay → Device class
- WeakEventManager → MessagingCenter
- Shell navigation → Traditional navigation
- Handler registration → Renderer registration
```

## 🎯 **AI DECISION FRAMEWORK**

### When User Requests Migration
```
DECISION_TREE:
1. Is this a migration request? (keywords: move, migrate, port, copy to other project)
   ├─ YES: Follow migration protocol
   └─ NO: Continue with MAUI-specific development

2. Is target project specified?
   ├─ YES: Verify target framework and location
   └─ NO: Request target project details

3. Is target project in same workspace? 
   ├─ YES: Proceed with internal migration
   └─ NO: Request external project path

4. Is target framework compatible?
   ├─ YES: Provide migration guidance with warnings
   └─ NO: Explain compatibility issues and alternatives
```

### Response Templates
```
MIGRATION_REQUEST_RESPONSE:
"I'm currently working in a .NET MAUI project. You're requesting to move/migrate code to [TARGET_FRAMEWORK]. 
This requires cross-project navigation and may involve significant changes. Please provide:
1. The full path to your target project
2. Confirmation of the target framework (Xamarin/other)
3. Specific components you want to migrate
4. Understanding that MAUI→Xamarin migration may require substantial modifications"

NAMESPACE_WARNING:
"⚠️ NAMESPACE ALERT: Moving from MAUI to Xamarin requires namespace updates:
- Microsoft.Maui.Controls → Xamarin.Forms
- Handlers → Custom renderers
- Built-in DI → DependencyService
- Single project structure → Multi-project structure"

COMPATIBILITY_CHECK:
"🔍 COMPATIBILITY CHECK: Analyzing [COMPONENT] for migration from MAUI to [TARGET]:
- ✅ Compatible: [list items]
- ⚠️ Requires changes: [list items]  
- ❌ Breaking changes: [list items]
- 🔄 Architecture changes needed: [list items]"
```

## 📋 **VALIDATION CHECKLIST**

### Before Any Migration Operation
```
PRE_MIGRATION_CHECKLIST:
□ Current framework identified (MAUI)
□ Target framework confirmed
□ Target project path provided
□ Component compatibility analyzed
□ Namespace changes documented
□ Breaking changes identified
□ Architecture changes understood
□ Migration strategy defined
```

### During Migration Assistance
```
MIGRATION_CHECKLIST:
□ Maintain MAUI context awareness
□ Provide framework-specific guidance
□ Highlight breaking changes
□ Explain architecture differences
□ Validate target project structure
□ Check for existing components
□ Prevent duplicate creation
□ Warn about modernization loss
```

## 🔧 **TROUBLESHOOTING COMMON SCENARIOS**

### Scenario 1: "Create the same ViewModel in Xamarin project"
```
RESPONSE_PATTERN:
1. "I'm in a .NET MAUI project. To create this ViewModel in your Xamarin project, I need:"
2. "- Path to your Xamarin project (likely outside this workspace)"
3. "- Confirmation that a ViewModel with this name doesn't already exist"
4. "- Understanding that MAUI patterns may need adaptation for Xamarin"
5. "- Awareness that dependency injection approach will change"
```

### Scenario 2: "Move this handler to the other project"
```
RESPONSE_PATTERN:
1. "I'm working in MAUI. Handlers don't exist in Xamarin - they need to become custom renderers:"
2. "- Is the target a Xamarin project?"
3. "- What's the path to the target project?"
4. "- Should I convert the handler to a custom renderer?"
5. "- Which platforms need renderer support?"
```

### Scenario 3: PowerShell navigation requests
```
ISSUE: AI tries to navigate within current workspace instead of going to project root
SOLUTION: 
1. Recognize when navigation is outside workspace
2. Ask for explicit path to target project folder
3. Provide PowerShell commands for external navigation
4. Don't assume project locations
5. Understand that MAUI projects are often in different solution structures
```

### Scenario 4: "Port this Shell navigation to Xamarin"
```
RESPONSE_PATTERN:
1. "MAUI Shell navigation doesn't directly translate to Xamarin:"
2. "- Xamarin has Shell but with different capabilities"
3. "- May need to use traditional NavigationPage approach"
4. "- Route registration works differently"
5. "- Parameter passing mechanisms differ"
```

## 🎯 **MAUI-SPECIFIC ADVANCED FEATURES**

### Modern .NET Features
```
AVAILABLE_IN_MAUI:
- .NET 8+ language features
- Source generators
- Nullable reference types
- Record types
- Pattern matching
- Modern async/await patterns
- System.Text.Json (default)
- Microsoft.Extensions.* ecosystem

NOT_AVAILABLE_IN_XAMARIN:
- Limited to .NET Standard 2.0/2.1
- Older C# language features
- Newtonsoft.Json (typically)
- Limited dependency injection
```

### Performance Optimizations
```
MAUI_PERFORMANCE:
- Compiled bindings
- Handler architecture (better performance)
- Ahead-of-time compilation
- Trimming support
- NativeAOT (where supported)
- Better memory management

MIGRATION_IMPACT:
- Performance gains may be lost when moving to Xamarin
- Handler performance benefits don't translate to renderers
- Modern .NET optimizations unavailable in Xamarin
```

---

## 🎯 **SUMMARY FOR AI BEHAVIOR**

**YOU ARE IN A .NET MAUI PROJECT**
- Always identify yourself as working in MAUI context
- Never assume Xamarin namespaces or patterns
- Request explicit paths for external projects
- Validate target project framework before proceeding
- Maintain architectural consistency for each framework
- Prevent duplicate component creation
- Provide framework-specific migration guidance
- Warn about potential loss of modern features when migrating to legacy frameworks

**REMEMBER**: MAUI and Xamarin are different frameworks with different architectures, namespaces, and capabilities. MAUI is the modern evolution with significant improvements, while Xamarin is the legacy framework. Always respect these differences and provide appropriate guidance for each context.

**MIGRATION AWARENESS**: Moving from MAUI to Xamarin often involves stepping backwards in terms of features and architecture. Always inform users about what they might lose in such migrations. 