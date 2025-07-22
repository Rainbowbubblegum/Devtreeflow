# 🎯 Ticket 11868 - Manual Stock Creation Context

## 📋 **Azure DevOps Information**
- **Ticket ID**: #11868
- **Title**: Dealer Hub - Manual Create of Stock Items
- **Type**: User Story
- **State**: Active
- **Priority**: 2
- **Assigned To**: Jacques Cornelis Schutte
- **Branch**: `feature/AzureTicketBranch-11868`
- **URL**: [View Ticket](https://dev.azure.com/fivefriday/MyCarMatch/_workitems/edit/11868)

## �� **Project Scope**
**IMPORTANT**: This is an **additional** stock upload method, NOT a replacement for the existing Excel bulk upload system. Both systems will coexist.

Two-component system for enhanced dealer stock management:

**Component 1: Form-Based Stock Upload** (✅ SKELETON COMPLETE)
- **Additional** user-friendly form interface alongside existing Excel bulk upload
- Dynamic form sections for multiple stock entries
- Real-time validation and error handling
- Professional UI with responsive design
- Individual stock item creation vs bulk Excel processing

**Component 2: Edit Stock Popup** (Future Enhancement)
- Popup interface for editing existing uploaded stock items
- Not part of current implementation phase

## 📊 **Data Requirements Analysis**

### **VehicleStock Entity Extensions Required**
New properties to be added to the VehicleStock model:

| Property | Type | Options | Required | Tooltip |
|----------|------|---------|----------|---------|
| `DealerStockStatus` | Bool | Active/Inactive | Yes (Default: Inactive) | "Whether we show your stock on front end to our customers" |
| `VarientSubtext` | String | Text Input | No | "Additional information about the vehicle variant" |
| `FinanceAvailable` | String | Yes/Cash Only | No | - |
| `IsRoadWorthy` | Bool | Yes/No | No | "To uphold the quality standard of vehicles available on the MyCarMatch platform, only vehicles that will be sold with a valid certification confirming it's roadworthiness, with no additional cost the buyer, will be available for consumer deal matches." |

### **Form Input Fields Specification**

#### **Core Vehicle Information** (Required Fields)
| Field | Form Input Type | Source/Options | Required | Tooltip |
|-------|----------------|----------------|----------|---------|
| Make | Dropdown | `VehicleConstants.Makes` | Yes | - |
| Model | Text Input | User Entry | Yes | - |
| Year | Dropdown | `VehicleConstants.Years` | Yes | - |
| Variant | Text Input | User Entry | Yes | - |
| `VarientSubtext` | Text Input | User Entry | No | "Additional information about the vehicle variant" |
| Body Type | Dropdown | `VehicleConstants.BodyTypes` | Yes | - |
| Condition | Radio Buttons | New/Used | Yes | - |
| Price | Number Input | User Entry | Yes | - |
| Mileage | Number Input | User Entry | Yes | - |
| Color | Dropdown | `VehicleConstants.Colors` | Yes | - |
| `VIN` | Text Input | User Entry | Yes | "To provide our dealerships and customers with the most accurate data, the VIN number is required for each vehicle listed on MyCarMatch" |
| `StockReferenceNumber` | Text Input | User Entry | Yes | "Used to check for existing stock entries" |
| `DealerStockStatus` | Dropdown | Active/Inactive | Yes (Default: Inactive) | "Whether we show your stock on front end to our customers" |

#### **Technical Specifications** (Optional Fields)  
| Field | Form Input Type | Source/Options | Required |
|-------|----------------|----------------|----------|
| Fuel Type | Dropdown | `VehicleConstants.FuelTypes` | No |
| Transmission | Dropdown | `VehicleConstants.Transmissions` | No |
| Engine Size | Number Input | User Entry | No |
| Drive Type | Dropdown | `VehicleConstants.DriveTypes` | No |
| `FinanceAvailable` | Dropdown | Yes/Cash Only | No |
| `IsRoadWorthy` | Dropdown | Yes/No | No |

#### **Additional Information**
| Field | Form Input Type | Source/Options | Required |
|-------|----------------|----------------|----------|
| `Comments` | Textarea | User Entry | No |

#### **Auto-Set Fields** (Not shown in form)
| Field | Auto-Set Logic | Source |
|-------|----------------|--------|
| `Carbike` | Always "Car" | System Default |
| `GPSLocation` | From Dealer Address | Dealer Profile |

#### **Removed from Manual Form** (Still available in Excel upload)
❌ **Excluded Fields**: FullServiceHistory, ServiceHistory, CO2 Emissions, CO2 Emissions Range, Top Speed, Top Speed Range, Acceleration, Seats

### **Image Upload Requirements** (10 Total Images)
| # | Image Type | Input Name | Required |
|---|------------|------------|----------|
| 1 | Main Photo | `uploadMain` | Required |
| 2 | Front Photo | `uploadFront` | Optional |
| 3 | Back Photo | `uploadBack` | Optional |
| 4 | Left Photo | `uploadLeft` | Optional |
| 5 | Right Photo | `uploadRight` | Optional |
| 6 | Engine Photo | `uploadEngine` | Optional |
| 7 | License Disc Photo | `uploadLicenseDisc` | Optional |
| 8 | Wheels Photo | `uploadWheels` | Optional |
| 9 | Interior 1 Photo | `interior1` | Optional |
| 10 | Interior 2 Photo | `interior2` | Optional |

### **File Upload Implementation** (Based on Browse View Pattern)
- **File Types**: JPG, JPEG, PNG, GIF (max 5MB each)
- **Upload Method**: AJAX with preview functionality
- **Storage**: AWS S3 with URL validation
- **Preview**: Immediate thumbnail display after upload

## 🏗️ **Implementation Architecture**

### **Form Layout Structure**
1. **Header Section**: Instructions and dealer info
2. **Plus Icon**: Add new stock entry forms
3. **Section Management**: Each section has validation and error highlighting
4. **Final Submit**: Single submit button for all forms - validation on the submit foreach form section

### **Form Layout Structure**
- **Dynamic Sections**: Each "New Stock Entry" section contains all input fields
- **Plus Button**: Adds new form section with same inputs (clean/empty)
- **Section Validation**: Individual validation per form section
- **Compact Design**: Simple forms with labels above inputs
- **Professional Styling**: Consistent with existing dealer hub design

## 📅 **Development Phases**

### **✅ Phase 1: Skeleton Creation** (COMPLETED)
- Controller endpoints with comprehensive TODO specifications
- Complete view model structure  
- Professional UI framework
- Context system for development continuity

### **⏳ Phase 2A: Data Loading & GET Method** (CURRENT PHASE)
**Objective**: Complete dropdown data loading and view preparation

**Tasks**:
1. ✅ Finalize dropdown data loading from VehicleConstants
2. ⏳ Create FormBasedStockUploadViewModel for view to use - means setting up data dropdowns will use for options
3. ⏳ Implement dealer permission validation - check the dealer data there / this is dealer.. checking dealer id
4. ⏳ Pass dropdown collections to view - view must have init js functions for the setup of the form because we will have multiple form sections from the data from the get
5. ⏳ Initialize empty form structure

### **Phase 2B: Form Rendering** (Following Phase 2A)
**Objective**: Complete frontend form structure
**Tasks**:
1. ⏳ Implement dynamic form sections - Plus button for adding a new form car section with all same inputs clean empty ready for selection - setup init methods for setting up new forms, start setting up first New stock option 1 
2. ⏳ Add JavaScript for form management - Js should handle the validation foreach form, plus button for adding more forms to the overall view, the submit button must validate all options / forms before construction of submission data
3. ⏳ Implement image upload with preview - Should be js for uploading images foreach form / new stock entry added by plus button.
4. ⏳ Add validation and error handling - foreach form / option / entry added by plus button (1 form added to start)
5. ⏳ Style form sections professionally - We want a simple compact form with labels and inputs below labels 

### **Phase 2C: POST Method Implementation** (Later Phase) 
We will pass viewmodel with list of viewmodels foreach stock entry.. efficient processing of multiple entries .. show loading spinner front end while processing
**Objective**: Complete form submission and processing
**Tasks**:
1. ⏳ Implement JSON data collection from multiple forms
2. ⏳ Server-side validation for each stock entry
3. ⏳ Integration with existing admin approval workflow
4. ⏳ Error handling and user feedback
5. ⏳ Success confirmation and redirect

## 🔧 **Technical Integration Points**

### **Existing System Integration**
- **VehicleConstants**: Dropdown options (Makes, Models, Years, etc.)
- **VehicleStockExcelService**: Validation logic patterns
- **Admin Approval Workflow**: Email notifications and status management  
- **AWS S3**: Image storage and URL generation
- **Dealer Permission System**: Access control and session management

### **Database Schema Updates Required**
```sql
-- Add new columns to VehicleStock table
ALTER TABLE VehicleStock ADD DealerStockStatus BIT DEFAULT 0;
ALTER TABLE VehicleStock ADD VarientSubtext NVARCHAR(500) NULL;
ALTER TABLE VehicleStock ADD FinanceAvailable NVARCHAR(50) NULL;
ALTER TABLE VehicleStock ADD IsRoadWorthy BIT NULL;
```

## 🎯 **Development Standards**
- **Comment-Driven Development**: TODO specifications guide implementation
- **Consistent Validation**: Mirror existing Excel upload validation logic
- **Professional UI**: Match existing dealer hub design patterns
- **Error Handling**: Clear user feedback for validation failures
- **Performance**: Efficient AJAX processing for multiple forms

## 📝 **Notes for Developers**
- Context system established for AI development continuity
- All TODO comments provide specific implementation guidance
- Form validation must be consistent with Excel upload requirements
- Image upload follows established Browse view patterns
- Professional user experience is priority over feature complexity

## 📊 **Implementation Progress**

### ✅ Phase 1: Skeleton Creation - COMPLETED
**Status**: ✅ **COMPLETED** 
**Completion Date**: Current Session
**Deliverables Completed**:
- **Controller Endpoints**: Created GET/POST methods with comprehensive TODO specifications
- **View Model**: Complete `VehicleStockFormViewModel` structure with all required fields
- **Razor View**: Professional UI framework with form sections and JavaScript placeholders
- **Context System**: Established ticket-specific context and flag detection
- **Build Verification**: Confirmed skeleton compiles without errors

**Implementation Details**:
- `FormBasedStockUpload()` GET method with dropdown data loading specifications
- `FormBasedStockUpload(List<VehicleStockFormViewModel>)` POST method with validation framework
- Helper methods: `ValidateFormStockItem()`, `ProcessFormStockItems()`
- Complete view model mirroring `VehicleStockExcelViewModel`
- Razor view with dynamic form container and professional interface

### ⏳ Phase 2: Implementation Logic Planning - CURRENT FOCUS
**Status**: 🔄 **IN PROGRESS**
**Current Task**: Data Requirements Analysis & Form Structure Planning
**Next Steps**:
1. ✅ Complete data field analysis based on Excel mapping system
2. ⏳ Finalize form input types and validation requirements
3. ⏳ Update GET method with comprehensive data loading specifications
4. ⏳ Plan image upload system migration from URLs to file uploads
5. ⏳ Validate implementation approach before code development

## 📊 **DATA REQUIREMENTS ANALYSIS**

### 🔍 **Excel Mapping System Analysis**
Based on `MapExcelToStockUploadViewModel` method and `VehicleConstants`, our form must support:

### **Core Vehicle Information** (Required Fields)
| Field | Excel Column | Input Type | Data Type | Validation | VehicleConstants Source |
|-------|-------------|------------|-----------|------------|----------------------|
| Make | 1 | Text Input | string | Required | Free text |
| Model | 2 | Text Input | string | Required | Free text |
| Variant | 3 | Text Input | string | Required | Free text |
| Year | 4 | Number Input | int? | Required, Range(1900, 2050) | Free text |
| Stock Reference Number | 5 | Text Input | string | Required | Auto-generated |
| Body Type | 6 | **Dropdown** | string | Required | `BodyTypes` |
| New/Used | 7 | **Radio Buttons** | string | Required | `NewUsedOptions` |
| Car/Bike | 8 | **Radio Buttons** | string | Required | `CarBikeOptions` |
| GPS Location | 9 | Text Input | string | Required | Free text |
| Mileage | 10 | Number Input | int? | Required, Range(0, 1000000) | Free text |
| Color | 11 | Text Input | string | Required | Free text |
| Fuel Type | 12 | **Dropdown** | string | Required | `FuelTypes` |
| Price | 13 | Number Input | decimal | Required, Range(0, 9999999) | Free text |
| Full Service History | 14 | **Dropdown** | string | Required | `ServiceHistoryOptions` |
| Province | 27 | **Dropdown** | string | Required | `Provinces` |

### **Performance & Technical Data** (Required Fields)
| Field | Excel Column | Input Type | Data Type | Validation |
|-------|-------------|------------|-----------|------------|
| Engine Capacity (cc) | 15 | Number Input | int? | Required, Range(1, 8000) |
| Fuel Consumption (L/100km) | 16 | Number Input | decimal? | Required, Range(0, 100) |
| Power (KW) | 17 | Number Input | int? | Required, Range(0, 1000) |
| Gears | 19 | Number Input | int? | Required, Range(1, 10) |
| Transmission Type | 20 | **Dropdown** | string | Required | `TransmissionTypes` |
| Top Speed | 23 | Number Input | decimal? | Required, Range(0, 500) |
| Acceleration (0-100km/h) | 25 | Number Input | decimal? | Required, Range(0, 100) |
| Seats | 26 | Number Input | int? | Required, Range(1, 10) |

### **Optional Performance Data**
| Field | Excel Column | Input Type | Data Type | Validation |
|-------|-------------|------------|-----------|------------|
| Power Range (KW) | 18 | Text Input | string | Optional |
| CO2 Emissions | 21 | Number Input | int? | Optional, Range(0, 9999) |
| CO2 Emissions Range | 22 | Text Input | string | Optional |
| Top Speed Range | 24 | Text Input | string | Optional |

### **Promotional Data** (Optional Fields)
| Field | Excel Column | Input Type | Data Type | Validation |
|-------|-------------|------------|-----------|------------|
| Seller Type | 28 | Text Input | string | Optional |
| Promotional Price | 29 | Text Input | string | Optional |
| Promotion Start Date | 30 | Date Input | DateTime? | Optional |
| Promotion End Date | 31 | Date Input | DateTime? | Optional |

### **Dropdown Options from VehicleConstants**
```csharp
// Form Dropdown Data Sources
BodyTypes: "SUV,Sedan,Hatchback,Coupe,Convertible,Station Wagon,MPV,Bakkie,Single Cab,Double Cab,Extended Cab,Cabriolet,Panel Van,Minibus,Microbus,Crew Bus,Dropside,Chassis Cab,Tipper,Truck,Bus,Other,N/A"

NewUsedOptions: "New,Used"

CarBikeOptions: "Car,Bike"

ServiceHistoryOptions: "Yes,No,Partial"

FuelTypes: "Petrol,Diesel,Electric,Hybrid"

TransmissionTypes: "Automatic,Manual"

Provinces: "North West,Gauteng,Western Cape,KwaZulu-Natal,Free State,Eastern Cape,Limpopo,Mpumalanga,Northern Cape"
```

## 🖼️ **IMAGE UPLOAD SYSTEM**

### **Migration from URL to File Upload**
**Current Excel System**: Uses URL strings for 8 image positions
**New Form System**: File upload inputs with preview functionality

### **Image Structure** (Based on VehicleConstants.ImagePriorityMapping)
| Priority | Image Type | Input Name | Required |
|----------|------------|------------|----------|
| 1 | Front Photo | `uploadFront` | ✅ Required |
| 2 | Back Photo | `uploadBack` | Optional |
| 3 | Right Photo | `uploadRight` | Optional |
| 4 | Left Photo | `uploadLeft` | Optional |
| 5 | Windscreen Photo | `uploadWindscreen` | Optional |
| 6 | Instrument Panel Photo | `uploadInstrument` | Optional |
| 7 | License Disc Photo | `uploadLicenseDisc` | Optional |
| 8 | Wheels Photo | `uploadWheels` | Optional |
| 9 | Interior 1 Photo | `interior1` | Optional |
| 10 | Interior 2 Photo | `interior2` | Optional |

### **File Upload Implementation** (Based on Browse View Pattern)
```html
<!-- Implementation Pattern from Browse View -->
<div class="col-4">
    <label class="form-label" for="uploadFront">Front*</label>
    <button id="previewFront" class="btn btn-outline-secondary w-100 camera-div" type="button" onclick="document.getElementById('uploadFront').click()">
        <i class="fas fa-camera"></i>
    </button>
    <input type="file" id="uploadFront" name="uploadFront" style="display:none" required>
</div>
```

### **JavaScript Preview System**
```javascript
// Pattern from SellingForm.js
function previewImage(input, previewButton) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) {
            $(previewButton).html('<img src="' + e.target.result + '" class="img-fluid" alt="Image Preview" style="height: 100px; object-fit: cover;">');
        }
        reader.readAsDataURL(input.files[0]);
    }
}
```

## 🔧 **FORM STRUCTURE PLANNING**

### **Dynamic Form Sections**
1. **Form Container**: Dynamic sections for multiple stock entries
2. **Plus Icon**: Add new stock entry forms
3. **Section Management**: Each section has validation and error highlighting
4. **Final Submit**: Single submit button for all forms - validation on the submit foreach form section

### **Form Layout Structure**
```
┌─────────────────────────────────────┐
│ Instructions Section                │
├─────────────────────────────────────┤
│ New Stock Entry 1                   │
│ ├─ Core Vehicle Info               │
│ ├─ Performance Data                │
│ ├─ Image Uploads                   │
│ └─ Optional Features               │
├─────────────────────────────────────┤
│ [ + Add Another Stock Entry ]       │
├─────────────────────────────────────┤
│ [ Submit All Stock Items ]          │
└─────────────────────────────────────┘
```

### **Validation Strategy**
1. **Real-time Validation**: Per field validation on blur/change
2. **Section Validation**: Validate entire form section before submit
3. **Error Highlighting**: Red border on invalid sections
4. **Submit Validation**: Validate all forms before AJAX submission

## 🎯 **IMPLEMENTATION PRIORITIES**

### **Phase 2A: GET Method Implementation** (Next Focus)
**Objective**: Complete data loading and form initialization
**Tasks**:
1. ✅ Finalize dropdown data loading from VehicleConstants
2. ⏳ Create FormBasedStockUploadViewModel for view to use - means setting up data dropdowns will use for options
3. ⏳ Implement dealer permission validation - check the dealer data there / this is dealer.. checking dealer id
4. ⏳ Pass dropdown collections to view - view must have init js functions for the setup of the form becuase we will have multiple form sections from the data from the get
5. ⏳ Initialize empty form structure

### **Phase 2B: Form Rendering** (Following Phase 2A)
**Objective**: Complete frontend form structure
**Tasks**:
1. ⏳ Implement dynamic form sections - Plus button for adding a new form car section with all same inputs clean empty ready for selection - setup init methods for setting up new forms, start setting up first New stock option 1 
2. ⏳ Add JavaScript for form management - Js should handle the validation foreach form, plus button for adding more forms to the overall view, the submit button must validate all options / forms before construction of submission data
3. ⏳ Implement image upload with preview - Should be js for uploading images foreach form / new stock entry added by plus button.
4. ⏳ Add validation and error handling - foreach form / option / entry added by plus button (1 form added to start)
5. ⏳ Style form sections professionally - We want a simple compact form with labels and inputs below labels 

### **Phase 2C: POST Method Implementation** (Later Phase) We will pass viewmodel with list of viewmodels foreach stock entry.. efficient processing of multiple entries .. show loading spinner front end while processing
**Objective**: Complete form submission and processing
**Tasks**:
1. ⏳ AJAX form data collection
2. ⏳ Server-side validation
3. ⏳ Stock creation and processing
4. ⏳ Admin approval workflow integration
5. ⏳ Success/error response handling

## 📝 **TECHNICAL NOTES**

### **Integration Points**
- **VehicleConstants**: Source for all dropdown options
- **VehicleStockExcelService**: Reuse validation logic
- **Admin Approval**: Same workflow as bulk upload
- **Image Processing**: File upload service integration
- **Existing Stock Service**: Reuse entity creation logic

### **Data Consistency**
- All field names must map to existing `VehicleStockExcelViewModel` properties
- Validation rules must match Excel upload system
- Image priority mapping must follow `VehicleConstants.ImagePriorityMapping`
- Status defaults to "Inactive" pending admin approval

### **Development Notes**
- Use comment-driven development approach
- Maintain consistency with existing bulk upload system
- Ensure proper error handling and user feedback
- Follow professional UI/UX patterns from existing dealer views

## 🔍 **FUTURE DEVELOPMENT CONSIDERATIONS**
- Component 2 (Edit Stock Popup) integration points
- Potential bulk operations within form interface
- Mobile responsiveness for tablet/phone use
- Advanced image editing capabilities
- Integration with external vehicle data APIs 