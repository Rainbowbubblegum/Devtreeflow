# Framework & Project Migration Context

## 🚨 **CRITICAL MIGRATION PRINCIPLES**

```
MANDATORY_MIGRATION_STEPS:
  1. ALWAYS identify source and target frameworks first
  2. ALWAYS load standards and best practices for BOTH frameworks
  3. ALWAYS track design patterns during conversion
  4. NEVER mix framework-specific patterns inappropriately
  5. ALWAYS preserve functionality while modernizing structure

FRAMEWORK_IDENTIFICATION_PRIORITY:
  1. Analyze project files (.csproj, packages.config, etc.)
  2. Identify framework versions and dependencies
  3. Determine architectural patterns in use
  4. Map compatibility requirements
  5. Plan migration strategy with standards preservation
```

## 📋 **SUPPORTED MIGRATION SCENARIOS**

### **Primary Focus: Xamarin to .NET MAUI**
```
XAMARIN_TO_MAUI_MIGRATION:
  source_framework: "Xamarin.Forms / Xamarin.iOS / Xamarin.Android"
  target_framework: ".NET MAUI (Multi-platform App UI)"
  migration_type: "Modernization & Consolidation"
  
  key_changes:
    - Single project structure vs. multiple platform projects
    - Updated dependency injection patterns
    - Modern .NET 6+ features and APIs
    - Simplified platform-specific implementations
    - Updated MVVM patterns and data binding
    - Handler-based architecture vs. Renderer-based
```

### **Other Common Migration Scenarios**
```
ADDITIONAL_MIGRATIONS:
  - .NET Framework to .NET Core/.NET 5+
  - WPF to WinUI 3
  - UWP to WinUI 3 / .NET MAUI
  - ASP.NET Web Forms to ASP.NET Core MVC/Blazor
  - Legacy .NET to Modern .NET
```

## 🏗️ **FRAMEWORK STANDARDS & BEST PRACTICES**

### **Xamarin.Forms Standards (Source)**
```
XAMARIN_FORMS_PATTERNS:
  architecture:
    - MVVM (Model-View-ViewModel) pattern
    - Dependency injection via DependencyService
    - Custom renderers for platform-specific UI
    - MessagingCenter for loose coupling
    - Platform-specific projects (iOS, Android, UWP)
  
  coding_standards:
    - PCL/Shared project structure
    - Platform-specific implementations in platform projects
    - Custom renderers inherit from specific base classes
    - Effects for minor customizations
    - DependencyService.Get<T>() for service resolution
  
  ui_patterns:
    - ContentPage, NavigationPage, TabbedPage hierarchies
    - XAML with code-behind or MVVM binding
    - ResourceDictionary for styling
    - Triggers and behaviors for interactions
    - Platform-specific styling via OnPlatform
  
  data_binding:
    - INotifyPropertyChanged implementation
    - ObservableCollection for lists
    - Binding context inheritance
    - Value converters for data transformation
    - Command pattern for user interactions
```

### **.NET MAUI Standards (Target)**
```
MAUI_PATTERNS:
  architecture:
    - Single project, multi-platform structure
    - Built-in dependency injection container
    - Handlers replace renderers (more performant)
    - WeakEventManager replaces MessagingCenter
    - Platform folders within single project
  
  coding_standards:
    - Modern .NET 6+ features (nullable reference types, records, etc.)
    - Handler-based customizations over renderers
    - Platform-specific code in Platforms folder
    - Conditional compilation symbols for platform code
    - Services registered in MauiProgram.cs
  
  ui_patterns:
    - ContentPage, Shell-based navigation preferred
    - Enhanced XAML with new controls and features
    - Resource dictionaries with improved theming
    - Modern styling with Visual State Manager
    - Platform-specific resources in Platforms folders
  
  data_binding:
    - Same MVVM patterns but with enhanced performance
    - CommunityToolkit.Mvvm for source generators
    - Improved binding performance and diagnostics
    - Modern command implementations
    - Enhanced collection binding with performance improvements
```

## 🔄 **MIGRATION WORKFLOW & STANDARDS TRACKING**

### **Phase 1: Analysis & Planning**
```
ANALYSIS_CHECKLIST:
  project_structure:
    - [ ] Identify all projects in solution
    - [ ] Map dependencies between projects
    - [ ] Catalog NuGet packages and versions
    - [ ] Document custom renderers and effects
    - [ ] List platform-specific implementations
  
  code_patterns:
    - [ ] Identify MVVM implementation approach
    - [ ] Document dependency injection usage
    - [ ] Catalog data binding patterns
    - [ ] List navigation patterns
    - [ ] Document styling and theming approaches
  
  compatibility_assessment:
    - [ ] Check NuGet package MAUI compatibility
    - [ ] Identify breaking changes in target framework
    - [ ] Plan renderer-to-handler conversions
    - [ ] Assess platform-specific code migration needs
    - [ ] Document required API updates
```

### **Phase 2: Project Structure Migration**
```
STRUCTURE_CONVERSION:
  xamarin_structure:
    - MyApp (Shared/PCL)
    - MyApp.iOS
    - MyApp.Android
    - MyApp.UWP (optional)
  
  maui_structure:
    - MyApp (Single project)
      - Platforms/
        - iOS/
        - Android/
        - Windows/
      - Resources/
      - Views/
      - ViewModels/
      - Services/
  
  migration_steps:
    1. Create new .NET MAUI project
    2. Copy shared code to main project
    3. Move platform code to Platforms folders
    4. Update project file with MAUI targets
    5. Migrate resources and assets
    6. Update namespace declarations
```

### **Phase 3: Code Pattern Migration**
```
PATTERN_CONVERSION_RULES:
  dependency_injection:
    xamarin: "DependencyService.Get<IMyService>()"
    maui: "Services registered in MauiProgram.cs, injected via constructor"
    
  custom_renderers:
    xamarin: "Custom renderer classes inheriting from platform renderers"
    maui: "Handler classes with PropertyMapper and CommandMapper"
    
  messaging:
    xamarin: "MessagingCenter.Send/Subscribe"
    maui: "WeakEventManager or CommunityToolkit.Mvvm.Messaging"
    
  platform_specific:
    xamarin: "Platform projects with shared interface"
    maui: "Conditional compilation in Platforms folders"
    
  navigation:
    xamarin: "NavigationPage.PushAsync, Modal navigation"
    maui: "Shell-based navigation preferred, same APIs available"
```

### **Phase 4: Standards Validation**
```
STANDARDS_CHECKLIST:
  maui_compliance:
    - [ ] Single project structure implemented
    - [ ] MauiProgram.cs properly configured
    - [ ] Handlers used instead of renderers where applicable
    - [ ] Platform-specific code in correct Platforms folders
    - [ ] Modern .NET features utilized appropriately
  
  pattern_consistency:
    - [ ] MVVM patterns maintained and modernized
    - [ ] Dependency injection properly implemented
    - [ ] Data binding patterns optimized for MAUI
    - [ ] Navigation patterns follow MAUI best practices
    - [ ] Resource management follows MAUI conventions
  
  performance_optimization:
    - [ ] Handler implementations optimized
    - [ ] Binding performance reviewed and improved
    - [ ] Memory management patterns updated
    - [ ] Platform-specific optimizations applied
    - [ ] Startup performance optimized
```

## 🛠️ **MIGRATION AUTOMATION & TOOLS**

### **Automated Migration Tools**
```
MIGRATION_TOOLS:
  microsoft_upgrade_assistant:
    command: "upgrade-assistant analyze|upgrade"
    purpose: "Automated project file and dependency updates"
    limitations: "Requires manual review of complex patterns"
  
  maui_check:
    command: "maui-check"
    purpose: "Verify development environment setup"
    usage: "Run before and after migration"
  
  custom_migration_scripts:
    namespace_updates: "PowerShell/bash scripts for bulk namespace changes"
    file_structure: "Scripts to reorganize files into MAUI structure"
    dependency_updates: "Scripts to update NuGet references"
```

### **Manual Migration Patterns**
```
COMMON_MANUAL_TASKS:
  renderer_to_handler:
    process:
      1. Identify custom renderer functionality
      2. Create corresponding handler class
      3. Implement PropertyMapper for property changes
      4. Implement CommandMapper for method calls
      5. Register handler in MauiProgram.cs
  
  dependency_service_migration:
    process:
      1. Convert DependencyService interfaces to services
      2. Register services in MauiProgram.cs
      3. Update constructors to accept injected services
      4. Remove DependencyService.Get<T>() calls
      5. Test service resolution and lifecycle
  
  platform_specific_migration:
    process:
      1. Move platform code to Platforms folders
      2. Update conditional compilation symbols
      3. Verify platform-specific APIs still work
      4. Update resource references
      5. Test on each target platform
```

## 🔍 **QUALITY ASSURANCE & VALIDATION**

### **Migration Validation Checklist**
```
FUNCTIONALITY_VALIDATION:
  - [ ] All screens render correctly on all platforms
  - [ ] Navigation flows work as expected
  - [ ] Data binding functions properly
  - [ ] Platform-specific features work correctly
  - [ ] Performance meets or exceeds original app
  
STANDARDS_COMPLIANCE:
  - [ ] Code follows .NET MAUI best practices
  - [ ] Architecture patterns are consistently applied
  - [ ] Dependencies are properly managed
  - [ ] Error handling follows modern patterns
  - [ ] Logging and diagnostics are properly implemented
  
COMPATIBILITY_TESTING:
  - [ ] App runs on minimum supported OS versions
  - [ ] NuGet packages are compatible and up-to-date
  - [ ] Third-party libraries work correctly
  - [ ] Platform-specific APIs function as expected
  - [ ] App store requirements are met
```

### **Common Migration Issues & Solutions**
```
TYPICAL_ISSUES:
  namespace_conflicts:
    problem: "Xamarin.Forms vs Microsoft.Maui namespaces"
    solution: "Global find/replace with careful review"
  
  renderer_complexity:
    problem: "Complex custom renderers difficult to convert"
    solution: "Break into smaller handlers or use community solutions"
  
  dependency_resolution:
    problem: "DependencyService patterns deeply embedded"
    solution: "Gradual migration with adapter pattern if needed"
  
  platform_specific_apis:
    problem: "Platform APIs changed between versions"
    solution: "Update to new APIs, use compatibility libraries if needed"
  
  performance_regressions:
    problem: "App slower after migration"
    solution: "Profile and optimize handlers, binding, and startup"
```

## 📚 **FRAMEWORK-SPECIFIC RESOURCES**

### **Xamarin.Forms Documentation References**
```
XAMARIN_RESOURCES:
  official_docs: "https://docs.microsoft.com/xamarin/xamarin-forms/"
  migration_guide: "https://docs.microsoft.com/dotnet/maui/migration/"
  patterns_guide: "Xamarin.Forms architectural patterns documentation"
  community_resources: "Xamarin Community Forums, Stack Overflow"
```

### **.NET MAUI Documentation References**
```
MAUI_RESOURCES:
  official_docs: "https://docs.microsoft.com/dotnet/maui/"
  handlers_guide: "https://docs.microsoft.com/dotnet/maui/user-interface/handlers/"
  migration_guide: "https://docs.microsoft.com/dotnet/maui/migration/"
  best_practices: ".NET MAUI performance and best practices guide"
  community_toolkit: "CommunityToolkit.Maui documentation"
```

## 🎯 **MIGRATION SUCCESS CRITERIA**

### **Technical Success Metrics**
```
SUCCESS_INDICATORS:
  functionality:
    - All original features work correctly
    - Performance is maintained or improved
    - Platform-specific features function properly
    - User experience is preserved or enhanced
  
  code_quality:
    - Modern .NET patterns are properly implemented
    - Architecture is clean and maintainable
    - Dependencies are properly managed
    - Code follows established standards
  
  maintainability:
    - Single project structure simplifies development
    - Modern tooling and debugging capabilities
    - Easier platform-specific customizations
    - Better development team productivity
```

### **Business Success Metrics**
```
BUSINESS_BENEFITS:
  development_efficiency:
    - Reduced development time for new features
    - Simplified build and deployment processes
    - Easier maintenance and updates
    - Better developer experience and productivity
  
  platform_support:
    - Access to latest platform features
    - Better performance on modern devices
    - Continued Microsoft support and updates
    - Future-proofed technology stack
```

## 🚨 **CRITICAL MIGRATION REMINDERS**

```
NEVER_FORGET:
  1. Always backup original project before migration
  2. Test thoroughly on all target platforms
  3. Verify all third-party dependencies are compatible
  4. Update development team on new patterns and practices
  5. Plan for gradual rollout if migrating existing production app
  6. Keep framework-specific patterns separate and well-documented
  7. Maintain comprehensive testing throughout migration process
  8. Document any custom solutions or workarounds for future reference
```

This context ensures that framework migrations, especially Xamarin to .NET MAUI, are handled with proper attention to standards, patterns, and best practices while preserving functionality and improving maintainability. 