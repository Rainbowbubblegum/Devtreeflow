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
| Make | Text Input | Free Text Entry | Yes | - |
| Model | Text Input | Free Text Entry | Yes | - |
| Year | Number Input | Range(1990-current) | Yes | - |
| Variant | Text Input | Free Text Entry | Yes | - |
| `VarientSubtext` | Text Input | Free Text Entry | No | "Additional information about the vehicle variant" |
| Body Type | Dropdown | `VehicleConstants.BodyTypes` | Yes | - |
| Condition | Radio Buttons | New/Used | Yes | - |
| Price | Number Input | User Entry | Yes | - |
| Mileage | Number Input | User Entry | Yes | - |
| Color | Text Input | Free Text Entry | Yes | - |
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
- **Section Validation**: Individual validation per form section using data attributes
- **Client-Side Validation**: Uses ViewModel data attributes with custom validation library
- **Multiple Form Handling**: JavaScript manages validation rules for dynamically added forms
- **Compact Design**: Simple forms with labels above inputs
- **Professional Styling**: Consistent with existing dealer hub design

### **Client-Side Validation Strategy**
- **Data Attributes**: Use ViewModel validation attributes for client-side rules
- **Dynamic Validation**: Add validation rules to new forms created via plus button
- **Form Section Management**: Each form section has independent validation state
- **Real-time Feedback**: Validate fields on blur/change events
- **Submit Validation**: Validate all form sections before AJAX submission
- **Error Highlighting**: Visual feedback for invalid fields and sections

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

### ✅ Phase 2: Implementation Logic Planning - COMPLETED
**Status**: ✅ **COMPLETED**
**Completion Date**: Current Session
**Deliverables Completed**:
1. ✅ Complete data field analysis based on Excel mapping system
2. ✅ Finalize form input types and validation requirements (Performance fields moved to optional)
3. ✅ Comprehensive front-end technical implementation plan documented
4. ✅ Client-side validation strategy defined with data attributes
5. ✅ JavaScript architecture planned for dynamic form management
6. ✅ ViewModel validation attributes updated to match requirements

### 🚀 Phase 3: ACTUAL CODE IMPLEMENTATION - CURRENT FOCUS
**Status**: 🔄 **IN PROGRESS - ACTIVE CODE DEVELOPMENT**
**Current Task**: GET Method & View Implementation
**Implementation Mode**: ✅ **ACTUAL CODE (No longer pseudo-code/comments)**

**Priority Tasks**:
1. ⏳ **GET Method Implementation**: Complete FormBasedStockUpload GET method with real data loading
2. ⏳ **View Implementation**: Build complete form template with all required/optional fields
3. ⏳ **JavaScript Implementation**: Create dynamic form management system
4. ⏳ **Client-Side Validation**: Implement validation using ViewModel data attributes
5. ⏳ **AJAX Submission**: Build form data collection and submission system

**IMPORTANT**: We are now in **ACTUAL IMPLEMENTATION MODE** - No more TODO comments or pseudo-code. 
All code changes will be functional, working implementations based on our comprehensive planning.

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
| Transmission Type | 20 | **Dropdown** | string | Required | `TransmissionTypes` |

### **Optional Performance Data**
| Field | Excel Column | Input Type | Data Type | Validation |
|-------|-------------|------------|-----------|------------|
| Power Range (KW) | 18 | Text Input | string | Optional |
| CO2 Emissions | 21 | Number Input | int? | Optional, Range(0, 9999) |
| CO2 Emissions Range | 22 | Text Input | string | Optional |
| Top Speed Range | 24 | Text Input | string | Optional |
| Engine Capacity (cc) | 15 | Number Input | int? | Optional, Range(1, 8000) |
| Fuel Consumption (L/100km) | 16 | Number Input | decimal? | Optional, Range(0, 100) |
| Power (KW) | 17 | Number Input | int? | Optional, Range(0, 1000) |
| Gears | 19 | Number Input | int? | Optional, Range(1, 10) |
| Top Speed | 23 | Number Input | decimal? | Optional, Range(0, 500) |
| Acceleration (0-100km/h) | 25 | Number Input | decimal? | Optional, Range(0, 100) |
| Seats | 26 | Number Input | int? | Optional, Range(1, 10) |

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

## 🎯 **FRONT-END TECHNICAL IMPLEMENTATION PLAN**

### **JavaScript Form Management Architecture**

#### **Core Functions Required:**
1. **`initializeFormSystem()`** - Set up initial form structure and event handlers
2. **`addStockFormSection()`** - Clone template, assign unique IDs, add validation rules
3. **`removeStockFormSection(formIndex)`** - Remove form, update indices, manage validation
4. **`updateFormSectionNumbers()`** - Renumber forms after add/remove operations
5. **`collectFormData()`** - Serialize all form data into JSON array for AJAX submission
6. **`validateAllForms()`** - Run validation on all form sections before submission
7. **`submitFormData(formData)`** - AJAX POST to controller with loading overlay
8. **`handleSubmissionResponse(response)`** - Process server response, show results

#### **Form Section Management:**
```javascript
// Form Section Structure
{
    formIndex: 1,                    // Unique identifier
    formTitle: "New Stock Entry 1",  // Display title
    formElement: jQuery object,      // DOM reference
    validationRules: {},            // Client-side validation rules
    isValid: false,                 // Current validation state
    formData: {}                    // Collected form data
}
```

#### **Validation Strategy:**
- **Data Attribute Integration**: Use ViewModel validation attributes for client-side rules
- **Dynamic Rule Assignment**: Apply validation to cloned form templates
- **Real-time Validation**: Validate on blur/change events with visual feedback
- **Section-Level Validation**: Each form section maintains independent validation state
- **Submit Validation**: Validate all sections before allowing submission

### **Form Field Implementation Plan**

#### **Required Fields (Based on VehicleStockFormViewModel):**

**Core Vehicle Information:**
- MakeName (text input, required)
- ModelName (text input, required)  
- VariantName (text input, required)
- VarientSubtext (text input, optional) - **NEW FIELD TO IMPLEMENT**
- VehicleYear (number input, 1990-current, required)
- StockReferenceNumber (text input, required)
- BodyType (dropdown from VehicleConstants, required)
- NewUsed (radio buttons: New/Used, required)
- VehiclePrice (number input, required)
- VehicleMileage (number input, required)
- VehicleColor (text input, required)
- VehicleVIN (text input, required)
- DealerStockStatus (dropdown: Active/Inactive, default Inactive)
- FuelType (dropdown from VehicleConstants, required)
- VehicleFullServiceHistory (dropdown: Yes/No/Partial, required)
- Province (dropdown from VehicleConstants, required)

**Performance & Technical Data (Only Transmission Required):**
- TransmissonType (dropdown from VehicleConstants, required)

**Optional Performance Fields:**
- EngineCapacitycc (number input, 1-8000)
- FuelPer100km (number input, 0-100)
- PowerKW (number input, 0-1000)
- Gears (number input, 1-10)
- TopSpeed (number input, 0-500)
- Acceleration0100kmh (number input, 0-100)
- Seats (number input, 1-10)
- PowerKWRange (text input)
- CO2Emissions (number input, 0-9999)
- CO2EmissionsRange (text input)
- TopSpeedRange (text input)
- FinanceAvailable (dropdown: Yes/Cash Only)
- IsRoadWorthy (dropdown: Yes/No)
- Comments (textarea)

**Image URLs (10 total):**
- MainPhotoUrl (required)
- FrontPhotoUrl, BackPhotoUrl, LeftPhotoUrl, RightPhotoUrl
- EnginePhotoUrl, LicenseDiscPhotoUrl, WheelsPhotoUrl
- Interior1PhotoUrl, Interior2PhotoUrl

### **Form Template Structure:**
```html
<div class="stock-form-section" data-form-index="{INDEX}">
    <div class="card mb-3">
        <div class="card-header">
            <h4>New Stock Entry {INDEX}
                <button class="btn btn-sm btn-danger float-right remove-stock-button">
                    <i class="fas fa-times"></i> Remove
                </button>
            </h4>
        </div>
        <div class="card-body">
            <!-- Core Vehicle Information Section -->
            <!-- Performance & Technical Data Section -->
            <!-- Optional Fields Section -->
            <!-- Image URLs Section -->
            <!-- Validation Messages Container -->
        </div>
    </div>
</div>
```

### **Client-Side Validation Rules:**
```javascript
const validationConfig = {
    required: ['MakeName', 'ModelName', 'VariantName', 'VehicleYear', ...],
    ranges: {
        VehicleYear: { min: 1990, max: new Date().getFullYear() + 1 },
        VehicleMileage: { min: 0, max: 1000000 },
        VehiclePrice: { min: 0, max: 9999999 },
        EngineCapacitycc: { min: 1, max: 8000 },
        // ... other ranges
    },
    patterns: {
        VehicleVIN: /^[A-HJ-NPR-Z0-9]{17}$/i,
        // ... other patterns
    }
};
```

### **AJAX Submission Flow:**
1. **Collect Data**: Serialize all form sections into JSON array
2. **Validate**: Run client-side validation on all forms
3. **Submit**: POST to `/Dealer/Dashboard/FormBasedStockUpload` with JSON payload
4. **Loading**: Show loading overlay during processing
5. **Response**: Handle success/error responses, update UI accordingly

### **Implementation Priority:**
1. **Phase 2B.1**: Complete form template with all required fields
2. **Phase 2B.2**: Implement dynamic form section management (add/remove)
3. **Phase 2B.3**: Add client-side validation with data attributes
4. **Phase 2B.4**: Implement AJAX submission and response handling
5. **Phase 2B.5**: Add professional styling and responsive design

## 🚨 **IMPLEMENTATION MODE TRANSITION**

### ✅ **PLANNING PHASE COMPLETE**
All planning, architecture design, and comment-driven development is now **COMPLETE**. 
The following items are ready for implementation:

**Ready for Implementation:**
- ✅ Controller structure with comprehensive specifications
- ✅ ViewModels with correct validation attributes
- ✅ View template with form structure
- ✅ JavaScript architecture planned
- ✅ Client-side validation strategy defined
- ✅ AJAX submission flow documented
- ✅ Validation requirements finalized (Performance fields = Optional, Transmission = Required)

### 🚀 **ACTIVE CODE IMPLEMENTATION MODE**
**Status**: ✅ **ACTIVE** - No more pseudo-code or TODO comments
**Current Focus**: GET Method & View Implementation
**Next Steps**: Write actual functional code based on all planning completed above

**Implementation Order:**
1. **GET Method**: Complete FormBasedStockUpload GET method with real dropdown data loading
2. **View Template**: Build complete form with all required/optional fields based on ViewModel
3. **JavaScript**: Implement dynamic form management system
4. **Validation**: Client-side validation using ViewModel data attributes
5. **AJAX**: Form submission and response handling

## 🔍 **FUTURE DEVELOPMENT CONSIDERATIONS**
- Component 2 (Edit Stock Popup) integration points
- Potential bulk operations within form interface
- Mobile responsiveness for tablet/phone use
- Advanced image editing capabilities
- Integration with external vehicle data APIs 

---

# 🤝 **HANDOVER SECTION FOR NEXT AI SESSION**

## 📋 **CURRENT PROJECT STATUS**
**Date**: 2024-12-19  
**Phase**: Phase 2A - Data Loading & GET Method Implementation  
**Current Focus**: GET endpoint completion and view rendering  
**Development Mode**: ✅ **ACTIVE CODE IMPLEMENTATION** (No more planning/TODO comments)

## 🎯 **WHAT WE'VE ACCOMPLISHED**

### **✅ Context System Established**
- ✅ Context file created: `ProjectSpecificContextFiles/ticket-11868-manual-stock-context.md`
- ✅ Context flag added to `.cursor/rules/context-referer.mdc` for automatic detection
- ✅ Azure DevOps branch created: `feature/AzureTicketBranch-11868`
- ✅ Azure ticket comment added documenting branch creation

### **✅ Code Architecture Completed**
- ✅ **Controller Skeleton**: Comprehensive TODO-guided implementation structure
- ✅ **View Model Complete**: Full property mapping with validation attributes
- ✅ **View Template**: Professional skeleton with dynamic form sections
- ✅ **JavaScript Architecture**: Planned form management system
- ✅ **Validation Strategy**: Client-side validation framework defined

### **✅ Requirements Finalized**
- ✅ **Field Classification**: Required vs Optional fields determined
- ✅ **Performance Fields**: Confirmed as Optional (except Transmission = Required)
- ✅ **Data Validation**: Rules aligned with existing Excel upload system
- ✅ **Image Upload**: 10 image slots defined (1 required, 9 optional)
- ✅ **Form Structure**: Dynamic sections with add/remove functionality

## 📁 **FILES CREATED/MODIFIED FOR NEXT AI SESSION**

### **🆕 NEWLY CREATED FILES**
```
1. ProjectSpecificContextFiles/ticket-11868-manual-stock-context.md
   - Complete context documentation
   - Requirements specification
   - Implementation phases
   - Technical architecture

2. VirtualDrive.Models/ViewModels/VehicleStockFormViewModel.cs
   - Complete view model structure
   - All required validation attributes
   - Form management properties
   - Image URL properties (10 total)
   - Helper methods for data collection

3. VirtualDrive.Web/Areas/Dealer/Views/Dashboard/FormBasedStockUpload.cshtml
   - Professional view template
   - Dynamic form sections structure
   - JavaScript skeleton with TODO specifications  
   - CSS placeholders for styling
   - Form template with core vehicle fields
```

### **📝 MODIFIED EXISTING FILES**
```
1. VirtualDrive.Web/Areas/Dealer/Controllers/DashboardController.cs
   - Added FormBasedStockUpload() GET method (lines ~2904-2950)
   - Added FormBasedStockUpload(POST) method (lines ~2951-3000)
   - Added ValidateFormStockItem() helper method
   - Added ProcessFormStockItems() helper method
   - Comprehensive TODO comments for implementation guidance

2. .cursor/rules/context-referer.mdc  
   - Added ticket_11868_manual_stock flag for automatic context detection
   - Keywords: ["ticket 11868", "manual stock", "FormBasedStockUpload"]
   - Semantic intent for stock upload functionality
```

## 🔄 **CURRENT TASK BREAKDOWN**

### **⏳ Phase 2A: Data Loading & GET Method** (ACTIVE)
**Status**: 🔄 **IN PROGRESS**

**Immediate Next Steps**:
1. **Complete GET Method Implementation**:
   - Replace TODO comments with actual dropdown data loading
   - Implement `FormBasedStockUploadViewModel` creation
   - Add dealer permission validation
   - Load dropdown collections from VehicleConstants
   - Pass data to view for form initialization

2. **Finalize View Rendering**:
   - Set up dropdown data binding in view
   - Initialize first form section on page load
   - Prepare JavaScript for dynamic form management

### **🔜 Phase 2B: Form Rendering** (NEXT)
**Immediate Tasks After GET Method**:
1. Implement JavaScript form management (add/remove sections)
2. Add client-side validation using ViewModel data attributes
3. Complete image upload functionality with preview
4. Style form sections professionally (compact design)

## 📋 **CRITICAL IMPLEMENTATION REQUIREMENTS**

### **GET Method Implementation Requirements**
```csharp
// VirtualDrive.Web/Areas/Dealer/Controllers/DashboardController.cs
// Lines ~2904-2950 need completion

Required Data Loading:
- BodyTypes: VehicleConstants.BodyTypes
- FuelTypes: VehicleConstants.FuelTypes  
- Transmissions: VehicleConstants.Transmissions
- Provinces: VehicleConstants.Provinces
- Makes: VehicleConstants.Makes (if available)
- ServiceHistoryOptions: Yes/No/Partial
- FinanceOptions: Yes/Cash Only
- RoadWorthyOptions: Yes/No
- StockStatusOptions: Active/Inactive
```

### **View Implementation Requirements**
```html
<!-- VirtualDrive.Web/Areas/Dealer/Views/Dashboard/FormBasedStockUpload.cshtml -->
<!-- Form structure needs completion with dropdown population -->

Required Form Sections:
1. Core Vehicle Information (9 required fields)
2. Technical Specifications (Transmission required, others optional)
3. Optional Performance Data (8 optional fields)
4. Image Upload Section (10 image slots)
5. Form Management (Add/Remove sections)
```

### **JavaScript Implementation Plan**
```javascript
// JavaScript functions to implement:
- initializeFormSystem() - Page load setup
- addStockFormSection() - Dynamic form creation
- removeStockFormSection() - Form removal with validation
- validateAllForms() - Pre-submission validation
- collectFormData() - Serialize to JSON array
- submitFormData() - AJAX POST submission
```

## 🎯 **NEXT AI SESSION INSTRUCTIONS**

### **🚀 START HERE NEXT SESSION**
1. **Read Context Files** (Automatic via context-referer system):
   - `.cursor/rules/context-referer.mdc` (will detect ticket_11868_manual_stock flag)
   - `ProjectSpecificContextFiles/ticket-11868-manual-stock-context.md` (full context)

2. **Examine Current Code Files**:
   - `VirtualDrive.Web/Areas/Dealer/Controllers/DashboardController.cs` (lines 2904-3000)
   - `VirtualDrive.Models/ViewModels/VehicleStockFormViewModel.cs` (entire file)
   - `VirtualDrive.Web/Areas/Dealer/Views/Dashboard/FormBasedStockUpload.cshtml` (entire file)

3. **Focus on GET Method Completion**:
   - Replace TODO comments with functional code
   - Implement dropdown data loading
   - Create FormBasedStockUploadViewModel
   - Add dealer permission validation
   - Pass data collections to view

### **🔍 REFERENCE FILES FOR IMPLEMENTATION**
**Existing System Files to Reference**:
```
- VirtualDrive.Web/Areas/Dealer/Controllers/DashboardController.cs (lines 1-2903)
  → Reference for dropdown data loading patterns
  → Dealer permission validation examples
  → Existing bulk upload implementation

- VirtualDrive.Models/ViewModels/VehicleStockExcelViewModel.cs
  → Field mapping reference
  → Validation attribute patterns
  → Data structure consistency

- VirtualDrive.Web/Areas/Dealer/Views/Dashboard/EditStock.cshtml
  → Professional form styling patterns
  → Dealer hub UI consistency
  → Image upload implementation examples

- VirtualDrive.Common/Constants/VehicleConstants.cs
  → Dropdown data sources
  → Available options for form fields
```

### **⚠️ CRITICAL REMINDERS**
- **Implementation Mode**: Write actual functional code, no more TODO comments
- **Data Consistency**: All fields must map to existing VehicleStockExcelViewModel
- **Performance Fields**: Optional (except Transmission = Required)
- **Validation**: Mirror existing Excel upload validation logic
- **Professional UI**: Match existing dealer hub design patterns
- **Git Branch**: Working on `feature/AzureTicketBranch-11868`

### **🎯 SUCCESS CRITERIA FOR NEXT SESSION**
- ✅ GET method loads dropdown data and renders view
- ✅ View displays professional form with dropdowns populated
- ✅ First form section is ready for user input
- ✅ JavaScript foundation is prepared for Phase 2B
- ✅ Code follows existing system patterns and conventions

---

**END OF HANDOVER SECTION** 