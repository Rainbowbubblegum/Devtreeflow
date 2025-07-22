# Cursor Chat Logs Dynamic Access Context

## Context-Referer Flags
**FLAGS**: `chat-logs`, `database-access`, `cursor-logs`, `ffbridge-integration`, `sqlite-access`, `chat-history`, `log-extraction`, `workspace-storage`

**TRIGGER PATTERNS**: 
- "chat logs", "chat history", "access logs", "cursor logs"
- "database", "sqlite", "state.vscdb", "workspace storage"  
- "ffbridge", "bridge logs", "prompt monitoring"
- "extract chat", "read logs", "chat data", "conversation history"

**PRIORITY**: High - Core functionality for FFBridge system integration

---

## Overview
This document provides a comprehensive guide for dynamically accessing Cursor chat logs through the SQLite database backend, with complete implementation details for any project.

## Required NuGet Packages

### Essential Dependencies
```xml
<PackageReference Include="System.Data.SQLite.Core" Version="1.0.118" />
<PackageReference Include="System.Text.Json" Version="8.0.0" />
```

### Installation Commands
```bash
# .NET CLI
dotnet add package System.Data.SQLite.Core
dotnet add package System.Text.Json

# Package Manager Console
Install-Package System.Data.SQLite.Core
Install-Package System.Text.Json

# PackageReference (add to .csproj)
<ItemGroup>
  <PackageReference Include="System.Data.SQLite.Core" Version="1.0.118" />
  <PackageReference Include="System.Text.Json" Version="8.0.0" />
</ItemGroup>
```

## Database Location & Structure

### Primary Storage Location
```
%APPDATA%\Cursor\User\workspaceStorage\{workspace-id}\state.vscdb
```

### Alternative Locations (for VS Code compatibility)
```
%APPDATA%\Code\User\workspaceStorage\{workspace-id}\state.vscdb
```

### Database Schema
Each `state.vscdb` file contains:
- **ItemTable**: Primary storage for chat data and workspace state
  - `key` (TEXT): Identifier for stored data
  - `value` (BLOB): Binary/text data, often JSON
- **cursorDiskKV**: Additional key-value storage

## Complete Implementation Code

### 1. Data Models
```csharp
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

public class ChatPrompt 
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;
    
    [JsonPropertyName("commandType")]
    public int CommandType { get; set; }
}

public class ChatMessage
{
    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;
    
    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;
    
    [JsonPropertyName("timestamp")]
    public long Timestamp { get; set; }
}

public class ChatData
{
    [JsonPropertyName("messages")]
    public List<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}

public class WorkspaceInfo
{
    public string WorkspaceId { get; set; } = string.Empty;
    public string DatabasePath { get; set; } = string.Empty;
    public DateTime LastModified { get; set; }
    public List<ChatPrompt> Prompts { get; set; } = new List<ChatPrompt>();
    public List<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
```

### 2. Binary Data Decoder
```csharp
using System;
using System.Text;

public static class BinaryDataDecoder
{
    public static string TryDecodeBinary(object value)
    {
        if (value == null) return string.Empty;
        if (value is string str) return str;
        
        try
        {
            if (value is byte[] bytes)
            {
                // Try UTF-8 first (most common)
                try 
                { 
                    var utf8Result = Encoding.UTF8.GetString(bytes);
                    // Validate UTF-8 by checking for replacement characters
                    if (!utf8Result.Contains('\uFFFD'))
                        return utf8Result;
                }
                catch { }
                
                // Fallback to UTF-16
                try 
                { 
                    return Encoding.Unicode.GetString(bytes); 
                }
                catch { }
                
                // Last resort: ASCII
                try 
                { 
                    return Encoding.ASCII.GetString(bytes); 
                }
                catch { }
                
                // If all encoding fails: hex representation
                return BitConverter.ToString(bytes).Replace("-", " ");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Binary decode error: {ex.Message}");
        }
        
        return value.ToString() ?? string.Empty;
    }
    
    public static bool LooksLikeJson(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return false;
        text = text.Trim();
        return (text.StartsWith("{") && text.EndsWith("}")) || 
               (text.StartsWith("[") && text.EndsWith("]"));
    }
}
```

### 3. Chat Log Extractor Class
```csharp
using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.IO;
using System.Text.Json;
using System.Linq;

public class CursorChatLogExtractor
{
    private readonly string _outputDirectory;
    
    public CursorChatLogExtractor(string outputDirectory = ".")
    {
        _outputDirectory = outputDirectory;
        Directory.CreateDirectory(_outputDirectory);
    }
    
    /// <summary>
    /// Extract chat logs from all available Cursor workspaces
    /// </summary>
    public List<WorkspaceInfo> ExtractAllChatLogs()
    {
        var workspaces = new List<WorkspaceInfo>();
        var workspaceDirectories = GetWorkspaceDirectories();
        
        foreach (var workspaceDir in workspaceDirectories)
        {
            try
            {
                var workspace = ExtractWorkspaceChatLogs(workspaceDir);
                if (workspace != null)
                {
                    workspaces.Add(workspace);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing workspace {workspaceDir}: {ex.Message}");
            }
        }
        
        // Generate output files
        GenerateOutputFiles(workspaces);
        
        return workspaces;
    }
    
    /// <summary>
    /// Extract chat logs from a specific workspace
    /// </summary>
    public WorkspaceInfo ExtractWorkspaceChatLogs(string workspaceDirectory)
    {
        var workspaceId = Path.GetFileName(workspaceDirectory);
        var dbPath = Path.Combine(workspaceDirectory, "state.vscdb");
        
        if (!File.Exists(dbPath))
            return null;
        
        var workspace = new WorkspaceInfo
        {
            WorkspaceId = workspaceId,
            DatabasePath = dbPath,
            LastModified = File.GetLastWriteTime(dbPath)
        };
        
        try
        {
            using var connection = new SQLiteConnection($"Data Source={dbPath};Version=3;");
            connection.Open();
            
            // Extract chat prompts and messages
            ExtractChatData(connection, workspace);
            
            return workspace;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Database error for {workspaceId}: {ex.Message}");
            return workspace; // Return empty workspace info
        }
    }
    
    private void ExtractChatData(SQLiteConnection connection, WorkspaceInfo workspace)
    {
        var query = @"
            SELECT [key], value FROM ItemTable 
            WHERE [key] LIKE '%aiService%'
               OR [key] LIKE '%chat%' 
               OR [key] LIKE '%message%' 
               OR [key] LIKE '%conversation%' 
               OR [key] LIKE '%cursor%' 
               OR [key] LIKE '%copilot%' 
               OR [key] LIKE '%prompt%'
               OR [key] LIKE '%completion%'
               OR [key] LIKE '%assistant%'
               OR [key] LIKE '%thread%'
               OR [key] LIKE '%session%'
               OR [key] LIKE '%history%'
            ORDER BY rowid DESC";
        
        using var command = new SQLiteCommand(query, connection);
        using var reader = command.ExecuteReader();
        
        while (reader.Read())
        {
            var key = reader["key"]?.ToString() ?? string.Empty;
            var rawValue = reader["value"];
            var value = BinaryDataDecoder.TryDecodeBinary(rawValue);
            
            ProcessChatDataEntry(key, value, workspace);
        }
    }
    
    private void ProcessChatDataEntry(string key, string value, WorkspaceInfo workspace)
    {
        if (string.IsNullOrWhiteSpace(value) || !BinaryDataDecoder.LooksLikeJson(value))
            return;
        
        try
        {
            // Handle different types of chat data
            if (key.Contains("aiService.prompts"))
            {
                var prompts = JsonSerializer.Deserialize<ChatPrompt[]>(value);
                if (prompts != null)
                {
                    workspace.Prompts.AddRange(prompts);
                }
            }
            else if (key.Contains("aiService.generations") || key.Contains("messages"))
            {
                // Try to parse as message array
                try
                {
                    var messages = JsonSerializer.Deserialize<ChatMessage[]>(value);
                    if (messages != null)
                    {
                        workspace.Messages.AddRange(messages);
                    }
                }
                catch
                {
                    // Try as single message
                    var message = JsonSerializer.Deserialize<ChatMessage>(value);
                    if (message != null)
                    {
                        workspace.Messages.Add(message);
                    }
                }
            }
            else if (key.Contains("conversation") || key.Contains("chat"))
            {
                // Try to parse as chat data structure
                var chatData = JsonSerializer.Deserialize<ChatData>(value);
                if (chatData?.Messages != null)
                {
                    workspace.Messages.AddRange(chatData.Messages);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"JSON parse error for key {key}: {ex.Message}");
        }
    }
    
    private List<string> GetWorkspaceDirectories()
    {
        var directories = new List<string>();
        
        // Primary location (Cursor)
        var cursorPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "Cursor", "User", "workspaceStorage");
        
        if (Directory.Exists(cursorPath))
        {
            directories.AddRange(Directory.GetDirectories(cursorPath));
        }
        
        // Fallback location (VS Code)
        var vscodePath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "Code", "User", "workspaceStorage");
        
        if (Directory.Exists(vscodePath))
        {
            directories.AddRange(Directory.GetDirectories(vscodePath));
        }
        
        return directories.Distinct().ToList();
    }
    
    private void GenerateOutputFiles(List<WorkspaceInfo> workspaces)
    {
        // Generate chat history file
        var chatHistoryPath = Path.Combine(_outputDirectory, "chat_history.txt");
        using var chatWriter = new StreamWriter(chatHistoryPath);
        
        foreach (var workspace in workspaces.OrderByDescending(w => w.LastModified))
        {
            chatWriter.WriteLine($"\n=== Chat History from workspace: {workspace.WorkspaceId} ===\n");
            
            // Write prompts
            chatWriter.WriteLine("=== Prompts ===");
            foreach (var prompt in workspace.Prompts.OrderByDescending(p => p.CommandType))
            {
                chatWriter.WriteLine($"Type {prompt.CommandType}: {prompt.Text}");
                chatWriter.WriteLine();
            }
            
            // Write messages
            chatWriter.WriteLine("=== Messages ===");
            foreach (var message in workspace.Messages.OrderByDescending(m => m.Timestamp))
            {
                var timestamp = DateTimeOffset.FromUnixTimeMilliseconds(message.Timestamp).ToString("yyyy-MM-dd HH:mm:ss");
                chatWriter.WriteLine($"[{timestamp}] {message.Role}: {message.Content}");
                chatWriter.WriteLine();
            }
        }
        
        // Generate token usage file
        var tokenUsagePath = Path.Combine(_outputDirectory, "token_usage.txt");
        using var tokenWriter = new StreamWriter(tokenUsagePath);
        
        foreach (var workspace in workspaces)
        {
            tokenWriter.WriteLine($"\n=== Token Usage from workspace: {workspace.WorkspaceId} ===\n");
            tokenWriter.WriteLine($"Total Prompts: {workspace.Prompts.Count}");
            tokenWriter.WriteLine($"Total Messages: {workspace.Messages.Count}");
            tokenWriter.WriteLine($"Last Activity: {workspace.LastModified:yyyy-MM-dd HH:mm:ss}");
            tokenWriter.WriteLine();
        }
        
        Console.WriteLine($"Chat logs extracted to:");
        Console.WriteLine($"  - {chatHistoryPath}");
        Console.WriteLine($"  - {tokenUsagePath}");
    }
}
```

### 4. Console Application Entry Point
```csharp
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("Cursor Chat Log Extractor");
        Console.WriteLine("========================");
        
        try
        {
            var extractor = new CursorChatLogExtractor();
            var workspaces = extractor.ExtractAllChatLogs();
            
            Console.WriteLine($"\nProcessed {workspaces.Count} workspaces:");
            foreach (var workspace in workspaces)
            {
                Console.WriteLine($"  - {workspace.WorkspaceId}: {workspace.Prompts.Count} prompts, {workspace.Messages.Count} messages");
            }
            
            Console.WriteLine("\nExtraction completed successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
        }
        
        Console.WriteLine("\nPress any key to exit...");
        Console.ReadKey();
    }
}
```

### 5. Project File Template (.csproj)
```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="System.Data.SQLite.Core" Version="1.0.118" />
    <PackageReference Include="System.Text.Json" Version="8.0.0" />
  </ItemGroup>

</Project>
```

## Chat Data Identification Patterns

### Key Patterns for Chat Data
```sql
-- Primary chat data patterns
WHERE [key] LIKE '%aiService%'
OR [key] LIKE '%chat%' 
OR [key] LIKE '%message%' 
OR [key] LIKE '%conversation%' 
OR [key] LIKE '%cursor%' 
OR [key] LIKE '%copilot%' 
OR [key] LIKE '%prompt%'
OR [key] LIKE '%completion%'
OR [key] LIKE '%assistant%'
OR [key] LIKE '%thread%'
OR [key] LIKE '%session%'
OR [key] LIKE '%history%'
```

### Data Types Found
1. **aiService.prompts**: Array of chat prompts with text and commandType
2. **aiService.generations**: AI response data
3. **aiService.conversations**: Full conversation threads
4. **Chat session metadata**: Timestamps, user info, context

## Quick Setup Instructions

### For New Project
1. **Create new console project**:
   ```bash
   dotnet new console -n ChatLogExtractor
   cd ChatLogExtractor
   ```

2. **Install packages**:
   ```bash
   dotnet add package System.Data.SQLite.Core
   dotnet add package System.Text.Json
   ```

3. **Copy the implementation code** above into appropriate files:
   - `Program.cs` - Main entry point
   - `CursorChatLogExtractor.cs` - Main extractor class
   - `BinaryDataDecoder.cs` - Data decoding utilities
   - `Models.cs` - Data models

4. **Run the extractor**:
   ```bash
   dotnet run
   ```

### For Existing Project
1. **Add NuGet packages** to your existing project
2. **Copy the classes** you need (typically `CursorChatLogExtractor` and `BinaryDataDecoder`)
3. **Call the extractor** from your code:
   ```csharp
   var extractor = new CursorChatLogExtractor("output-directory");
   var workspaces = extractor.ExtractAllChatLogs();
   ```

## Error Handling & Troubleshooting

### Common Issues and Solutions

#### 1. SQLite Assembly Loading
**Problem**: `Cannot find type [System.Data.SQLite.SQLiteConnection]`
**Solution**: Ensure `System.Data.SQLite.Core` NuGet package is installed

#### 2. Database Access Permissions
**Problem**: `Database is locked` or access denied
**Solution**: Ensure Cursor is closed before accessing databases

#### 3. Empty Results
**Problem**: No chat data found
**Solution**: Check multiple workspace directories, verify key patterns

#### 4. Binary Data Corruption
**Problem**: Garbled text output
**Solution**: Use the multi-encoding fallback strategy in `BinaryDataDecoder`

### Debugging Queries
```sql
-- List all keys to understand data structure
SELECT [key], length(value) as value_length 
FROM ItemTable 
ORDER BY [key];

-- Find recent chat activity
SELECT [key], value 
FROM ItemTable 
WHERE [key] LIKE '%aiService%' 
ORDER BY rowid DESC 
LIMIT 10;

-- Check for specific workspace activity
SELECT COUNT(*) as chat_entries
FROM ItemTable 
WHERE [key] LIKE '%chat%' OR [key] LIKE '%prompt%';
```

## Integration with FFBridge

### Monitoring Setup
The chat log access integrates with FFBridge for:
- **Prompt Detection**: Monitor incoming chat requests
- **Response Routing**: Send extracted prompts to target projects
- **Log Archival**: Move processed chats to archive directories

### Directory Structure
```
.ffbridge/
├── incoming/          # New prompts to process
├── outgoing/          # Prompts to send to other projects
├── processed/         # Completed chat interactions
└── logs/             # Access and processing logs
```

### FFBridge Integration Code
```csharp
public class FFBridgeIntegration
{
    private readonly CursorChatLogExtractor _extractor;
    private readonly string _ffbridgeDirectory;
    
    public FFBridgeIntegration(string ffbridgeDirectory = ".ffbridge")
    {
        _extractor = new CursorChatLogExtractor();
        _ffbridgeDirectory = ffbridgeDirectory;
        
        // Ensure directories exist
        Directory.CreateDirectory(Path.Combine(_ffbridgeDirectory, "incoming"));
        Directory.CreateDirectory(Path.Combine(_ffbridgeDirectory, "outgoing"));
        Directory.CreateDirectory(Path.Combine(_ffbridgeDirectory, "processed"));
        Directory.CreateDirectory(Path.Combine(_ffbridgeDirectory, "logs"));
    }
    
    public void ProcessNewChats()
    {
        var workspaces = _extractor.ExtractAllChatLogs();
        
        foreach (var workspace in workspaces)
        {
            foreach (var prompt in workspace.Prompts)
            {
                if (ShouldProcessPrompt(prompt))
                {
                    var filename = $"prompt_{DateTimeOffset.Now:yyyyMMddHHmmss}.md";
                    var filepath = Path.Combine(_ffbridgeDirectory, "outgoing", filename);
                    
                    var content = FormatFFBridgeMessage(prompt, workspace.WorkspaceId);
                    File.WriteAllText(filepath, content);
                }
            }
        }
    }
    
    private bool ShouldProcessPrompt(ChatPrompt prompt)
    {
        var triggers = new[] { "use FFBridge", "send via FFBridge", "have FFBridge" };
        return triggers.Any(trigger => prompt.Text.Contains(trigger, StringComparison.OrdinalIgnoreCase));
    }
    
    private string FormatFFBridgeMessage(ChatPrompt prompt, string sourceWorkspace)
    {
        return $@"# FFBridge Message
Source: {sourceWorkspace}
Target: [TO_BE_EXTRACTED]
Type: PROMPT
Timestamp: {DateTimeOffset.Now:yyyy-MM-ddTHH:mm:ssZ}

## Content
{prompt.Text}

## Context
CommandType: {prompt.CommandType}
";
    }
}
```

## Performance Considerations

### Optimization Tips
1. **Selective Querying**: Use specific key patterns to avoid full table scans
2. **Workspace Filtering**: Target specific workspace IDs when known
3. **Batch Processing**: Process multiple databases in parallel
4. **Result Caching**: Cache frequently accessed chat data
5. **Incremental Updates**: Track last processed timestamp

### Resource Management
```csharp
// Always use 'using' statements for proper disposal
using (var connection = new SQLiteConnection(connectionString))
{
    connection.Open();
    // ... database operations
} // Automatically closed and disposed
```

## Security & Privacy

### Data Sensitivity
- Chat logs contain sensitive development conversations
- May include API keys, passwords, or proprietary code
- Access should be restricted to authorized processes

### Safe Practices
1. **Encrypt Output**: Consider encrypting extracted chat logs
2. **Secure Storage**: Store processed logs in protected directories
3. **Access Logging**: Log all database access attempts
4. **Data Retention**: Implement automatic cleanup of old logs

## Usage Examples

### Extract Recent Chats for Specific Project
```csharp
var extractor = new CursorChatLogExtractor();
var workspace = extractor.ExtractWorkspaceChatLogs(@"C:\Users\User\AppData\Roaming\Cursor\User\workspaceStorage\specific-workspace-id");
var recentPrompts = workspace.Prompts.Where(p => p.CommandType == 4).ToList();
```

### Monitor for New Chat Activity
```csharp
var integration = new FFBridgeIntegration();
integration.ProcessNewChats();
```

### Export Chat History
```csharp
var extractor = new CursorChatLogExtractor("output-directory");
var workspaces = extractor.ExtractAllChatLogs();
// Output files are automatically generated
```

## Conclusion

This complete implementation provides everything needed to access Cursor chat logs dynamically from any .NET project. The code handles binary data decoding, JSON parsing, multi-workspace scanning, and FFBridge integration while avoiding dependency issues that plague other approaches.

All code is self-contained and can be copied directly into any project with just the two required NuGet packages. 