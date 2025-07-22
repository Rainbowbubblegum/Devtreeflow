# MyCarMatch Unit Testing Standards
**Enterprise Testing Guidelines for Production Systems**

## 📋 Overview

This document establishes official unit testing standards for the MyCarMatch platform, ensuring code quality, maintainability, and reliability across all development teams.

**Technology Stack:** .NET Core 2.1, xUnit 2.4.1, Moq 4.10.1, FluentAssertions 5.10.3, AutoFixture 4.11.0

### Quality Objectives
- **Defect Reduction:** 90% fewer production bugs through comprehensive testing
- **Code Coverage:** Minimum 80% for business logic components
- **Build Reliability:** 99.9% build success rate with automated testing
- **Performance:** Complete test suite execution under 5 minutes

## 🚀 Quick Start

### Prerequisites
- .NET Core SDK 2.1.x or later
- Visual Studio 2019+ or VS Code with C# extension
- Git configured with company credentials

### Setup Commands
```bash
# Clone and build
git clone [repository-url]
cd MyCarMatch
dotnet restore
dotnet build --configuration Release

# Run tests
dotnet test --configuration Release --logger trx --collect:"XPlat Code Coverage"
```

### Code Coverage Report Setup
Install the required ReportGenerator tool using these commands:

```bash
# Install ReportGenerator globally
dotnet tool install -g dotnet-reportgenerator-globaltool

# Alternative installation methods
dotnet tool install dotnet-reportgenerator-globaltool --tool-path tools
dotnet new tool-manifest
dotnet tool install dotnet-reportgenerator-globaltool
```

## ✍️ Testing Standards

### Framework Dependencies
```xml
<PackageReference Include="xunit" Version="2.4.1" />
<PackageReference Include="xunit.runner.visualstudio" Version="2.4.1" />
<PackageReference Include="Moq" Version="4.10.1" />
<PackageReference Include="FluentAssertions" Version="5.10.3" />
<PackageReference Include="AutoFixture" Version="4.11.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="2.1.14" />
<PackageReference Include="coverlet.collector" Version="1.2.0" />
```

### Test Method Structure (AAA Pattern)
```csharp
[Fact]
[Trait("Category", "Unit")]
[Trait("Component", "CarService")]
public async Task MethodName_Scenario_ExpectedResult()
{
    // Arrange - Setup test data and mocks
    var mockRepository = new Mock<ICarRepository>();
    var testCar = new Car { Make = "Toyota", Model = "Camry", Year = 2020 };
    mockRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(testCar);
    
    var service = new CarService(mockRepository.Object);
    
    // Act - Execute the method being tested
    var result = await service.GetCarByIdAsync(1);
    
    // Assert - Verify expected outcomes
    result.Should().NotBeNull("Service should return car when found");
    result.Make.Should().Be("Toyota");
    result.Year.Should().Be(2020);
    
    // Verify - Confirm system interactions
    mockRepository.Verify(r => r.GetByIdAsync(1), Times.Once);
}
```

### Service Layer Testing
```csharp
public class CarServiceTests
{
    private readonly Mock<ICarRepository> _mockRepository;
    private readonly Mock<ILogger<CarService>> _mockLogger;
    private readonly CarService _service;
    private readonly Fixture _fixture;

    public CarServiceTests()
    {
        _mockRepository = new Mock<ICarRepository>();
        _mockLogger = new Mock<ILogger<CarService>>();
        _fixture = new Fixture();
        
        _service = new CarService(_mockRepository.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task FindMatchingCars_WithValidCriteria_ReturnsFilteredResults()
    {
        // Arrange
        var searchCriteria = _fixture.Create<CarSearchCriteria>();
        var availableCars = _fixture.CreateMany<Car>(10).ToList();
        var expectedMatches = availableCars.Take(3).ToList();
        
        _mockRepository.Setup(r => r.SearchAsync(It.IsAny<CarSearchCriteria>()))
                      .ReturnsAsync(expectedMatches);

        // Act
        var result = await _service.FindMatchingCarsAsync(searchCriteria);

        // Assert
        result.Should().HaveCount(3);
        result.Should().BeEquivalentTo(expectedMatches);
        _mockRepository.Verify(r => r.SearchAsync(searchCriteria), Times.Once);
    }

    [Fact]
    public async Task CreateCar_WithInvalidData_ThrowsValidationException()
    {
        // Arrange
        var invalidCar = new Car { Make = "", Model = "Camry" }; // Invalid: empty make

        // Act & Assert
        await _service.Invoking(s => s.CreateCarAsync(invalidCar))
                     .Should().ThrowAsync<ValidationException>()
                     .WithMessage("*Make is required*");
    }
}
```

### Repository Testing (Data Layer)
```csharp
public class CarRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly CarRepository _repository;

    public CarRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
            
        _context = new ApplicationDbContext(options);
        _repository = new CarRepository(_context);
    }

    [Fact]
    public async Task GetAvailableCarsAsync_ReturnsOnlyAvailableCars()
    {
        // Arrange
        var cars = new List<Car>
        {
            new Car { Make = "Toyota", Model = "Camry", IsAvailable = true },
            new Car { Make = "Honda", Model = "Civic", IsAvailable = true },
            new Car { Make = "Ford", Model = "Focus", IsAvailable = false }
        };
        _context.Cars.AddRange(cars);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAvailableCarsAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(c => c.IsAvailable);
        result.Should().Contain(c => c.Make == "Toyota");
        result.Should().Contain(c => c.Make == "Honda");
    }

    public void Dispose() => _context?.Dispose();
}
```

### Controller Testing (API Layer)
```csharp
public class CarsControllerTests
{
    private readonly Mock<ICarService> _mockService;
    private readonly CarsController _controller;

    public CarsControllerTests()
    {
        _mockService = new Mock<ICarService>();
        _controller = new CarsController(_mockService.Object);
    }

    [Fact]
    public async Task GetCar_WithValidId_ReturnsOkResult()
    {
        // Arrange
        var carId = 123;
        var expectedCar = new CarDto { Id = carId, Make = "BMW", Model = "X3" };
        _mockService.Setup(s => s.GetCarByIdAsync(carId)).ReturnsAsync(expectedCar);

        // Act
        var result = await _controller.GetCar(carId);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedCar = okResult.Value.Should().BeOfType<CarDto>().Subject;
        returnedCar.Should().BeEquivalentTo(expectedCar);
    }

    [Fact]
    public async Task GetCar_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        var nonExistentId = 999;
        _mockService.Setup(s => s.GetCarByIdAsync(nonExistentId))
                   .ThrowsAsync(new NotFoundException($"Car {nonExistentId} not found"));

        // Act
        var result = await _controller.GetCar(nonExistentId);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }
}
```

## 🔧 Testing Utilities

### Test Data Builder Pattern
```csharp
public class CarTestBuilder
{
    private Car _car = new Car
    {
        Make = "Toyota",
        Model = "Camry", 
        Year = 2020,
        Price = 25000,
        IsAvailable = true
    };

    public CarTestBuilder WithMake(string make)
    {
        _car.Make = make;
        return this;
    }

    public CarTestBuilder WithPrice(decimal price)
    {
        _car.Price = price;
        return this;
    }

    public CarTestBuilder AsUnavailable()
    {
        _car.IsAvailable = false;
        return this;
    }

    public Car Build() => _car;

    // Factory methods
    public static CarTestBuilder NewCar() => new CarTestBuilder();
    public static CarTestBuilder LuxuryCar() => new CarTestBuilder()
        .WithMake("BMW").WithPrice(65000);
}

// Usage: var car = CarTestBuilder.NewCar().WithMake("Honda").Build();
```

### Common Mock Setups
```csharp
// Repository mock with common setups
public static Mock<ICarRepository> CreateCarRepositoryMock()
{
    var mock = new Mock<ICarRepository>();
    
    // Default behavior - return empty list
    mock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Car>());
    mock.Setup(r => r.GetAvailableCarsAsync()).ReturnsAsync(new List<Car>());
    
    return mock;
}

// Service mock with typical responses
public static Mock<ICarService> CreateCarServiceMock()
{
    var mock = new Mock<ICarService>();
    var fixture = new Fixture();
    
    mock.Setup(s => s.GetCarByIdAsync(It.IsAny<int>()))
        .ReturnsAsync((int id) => fixture.Build<CarDto>().With(c => c.Id, id).Create());
        
    return mock;
}
```

## 📊 Code Coverage & Reporting

### Setup Requirements
Install the ReportGenerator tool before running coverage reports:

```bash
# Install ReportGenerator globally (recommended)
dotnet tool install -g dotnet-reportgenerator-globaltool

# Alternative installation methods
dotnet tool install dotnet-reportgenerator-globaltool --tool-path tools
dotnet new tool-manifest
dotnet tool install dotnet-reportgenerator-globaltool
```

### Running Code Coverage Reports

#### Step-by-Step Process

**Step 1: Execute All Tests**
- Run the complete test suite and ensure all tests finish processing
- Wait for all tests to complete (pass or fail status doesn't matter)
- Monitor the test runner to confirm full completion

```bash
dotnet test --collect:"XPlat Code Coverage"
```

**Step 2: Save All Changes**
- Save all project files to ensure nothing is missed during report generation
- Commit any pending changes to avoid inconsistencies

**Step 3: Generate Coverage Report**
- Navigate to Tools > Run Code Coverage in Visual Studio
- Alternative command line approach:

```bash
reportgenerator -reports:"**/coverage.cobertura.xml" -targetdir:"coverage" -reporttypes:Html
```

**Step 4: Monitor Report Generation**
- Report generation typically takes 30-40 seconds
- Depending on project size, it may take 10 seconds to 2 minutes maximum
- Monitor terminal output for completion status

### Troubleshooting Coverage Reports

If Report Generation Fails:
- Verify all tests completed successfully
- Confirm all files are saved
- Check for code compilation errors
- Review test runner logs for crashes or hanging tests
- Ensure proper tool installation

### Coverage Exclusions

**Exclude Entire Projects:**
Add this to the .csproj file of projects you want to exclude:
```xml
<ItemGroup>
  <AssemblyAttribute Include="System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverageAttribute" />
</ItemGroup>
```

**Exclude Specific Classes:**
```csharp
[ExcludeFromCodeCoverage]
public class Program { } // Entry point

[ExcludeFromCodeCoverage]
public class Startup { } // Configuration only

[ExcludeFromCodeCoverage]
public class CarDto { } // Simple DTOs without logic
```

### Coverage Targets

| Component Type | Minimum | Target | Critical |
|---|---|---|---|
| Business Logic/Services | 80% | 90% | 95% |
| Data Access/Repositories | 70% | 80% | 85% |
| API Controllers | 75% | 85% | 90% |
| Domain Models | 85% | 95% | 100% |

### Performance Standards
- **Unit Test Execution:** < 3 minutes for full suite
- **Individual Test Performance:** < 100ms average per test
- **Build Pipeline:** < 10 minutes total including tests
- **Coverage Report Generation:** 30-40 seconds typical, 2 minutes maximum

## 🎯 Best Practices

### ✅ Do
- **Follow AAA Pattern:** Arrange, Act, Assert structure
- **Use Descriptive Names:** `GetCar_WithValidId_ReturnsCarDto()`
- **Test One Behavior:** One logical assertion per test
- **Mock External Dependencies:** Isolate the unit under test
- **Use AutoFixture:** Reduce boilerplate test data creation
- **Verify Interactions:** Confirm important service calls
- **Test Error Scenarios:** Include exception and edge cases
- **Keep Tests Focused:** Simple, readable, maintainable

### ❌ Don't
- **Test Framework Code:** Don't test Entity Framework or ASP.NET Core
- **Mock the Subject:** Don't mock the class being tested
- **Share Test State:** Ensure test independence
- **Use Real External Resources:** No databases, APIs, file systems
- **Create Complex Test Setup:** Keep arrangement simple
- **Test Private Methods:** Test through public interfaces
- **Ignore Failing Tests:** Fix or remove broken tests immediately

### Naming Conventions
- **Test Classes:** `{ClassUnderTest}Tests.cs`
- **Test Methods:** `{MethodName}_{Scenario}_{ExpectedResult}`
- **Test Categories:** Use `[Trait("Category", "Unit")]` for organization

### Assertion Guidelines
```csharp
// Use FluentAssertions for readable tests
result.Should().NotBeNull();
result.Should().BeOfType<CarDto>();
result.Should().HaveCount(5);
cars.Should().OnlyContain(c => c.IsAvailable);
cars.Should().BeInAscendingOrder(c => c.Price);

// Exception testing
await service.Invoking(s => s.InvalidOperation())
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*specific error message*");
```

## 🔄 CI/CD Integration

### Pipeline Configuration
```yaml
# Essential CI/CD pipeline steps
steps:
- task: DotNetCoreCLI@2
  displayName: 'Build Solution'
  inputs:
    command: 'build'
    arguments: '--configuration Release'

- task: DotNetCoreCLI@2
  displayName: 'Run Unit Tests'
  inputs:
    command: 'test'
    arguments: '--configuration Release --collect:"XPlat Code Coverage" --logger trx'
    publishTestResults: true

- task: PublishCodeCoverageResults@1
  displayName: 'Publish Coverage'
  inputs:
    codeCoverageTool: 'Cobertura'
    summaryFileLocation: '**/coverage.cobertura.xml'
    failIfCoverageEmpty: true
```

### Quality Gates
- **Build Failure:** Any test failure fails the build
- **Coverage Gate:** Minimum 80% code coverage required
- **Code Quality:** SonarQube quality gate must pass
- **Performance:** Test suite must complete within 5 minutes

## 📚 Quick Reference

### Essential Commands
```bash
# Run all tests
dotnet test

# Run specific test class
dotnet test --filter "FullyQualifiedName~CarServiceTests"

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Verbose output for debugging
dotnet test --logger "console;verbosity=detailed"

# Run tests by category
dotnet test --filter "Category=Unit"
```

### Common Patterns
```csharp
// Parameterized testing
[Theory]
[InlineData("Toyota", true)]
[InlineData("", false)]
public void ValidateMake_VariousInputs_ReturnsExpected(string make, bool expected)

// Async testing
[Fact]
public async Task GetDataAsync_ReturnsData()

// Exception testing
[Fact]
public async Task InvalidOperation_ThrowsException()
```

## 📞 Support & Resources

### Documentation
- [xUnit Documentation](https://xunit.net/)
- [Moq Documentation](https://github.com/moq/moq4)
- [FluentAssertions Documentation](https://fluentassertions.com/)

**Questions or Issues?** Create a ticket in the project management system or contact the development team.

---
**Last Updated:** [Current Date] | **Version:** 2.0 | **Next Review:** [3 months]