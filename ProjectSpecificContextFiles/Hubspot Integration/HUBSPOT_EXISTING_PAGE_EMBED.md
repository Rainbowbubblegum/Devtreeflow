# Getting Embed Codes from Existing HubSpot Pages

## Quick Method - Use Existing Pages

Since you already have these pages created:
- `https://23537348.hs-sites.com/customer-home-page-0`
- `https://23537348.hs-sites.com/dealer-hub-home-0`

You can get embed codes directly from them!

## Step-by-Step Instructions

### Method 1: From HubSpot Page Editor

1. **Log into HubSpot**
2. **Go to Content > Website Pages**
3. **Find your page** (customer-home-page-0 or dealer-hub-home-0)
4. **Click to edit the page**
5. **Look for "Actions" or "..." menu**
6. **Click "Get Embed Code" or "Embed"**
7. **Copy the JavaScript embed code** (NOT iframe)

### Method 2: From Page Settings

1. **In the page editor**
2. **Go to Settings tab**
3. **Look for "Embed" or "External Sharing" options**
4. **Copy the embed code**

### Method 3: Contact HubSpot Support

If you can't find the embed option:
1. **Contact HubSpot Support**
2. **Ask them to provide embed codes for:**
   - Page ID for `customer-home-page-0`
   - Page ID for `dealer-hub-home-0`
3. **Request JavaScript embed codes (not iframe)**

## What the Embed Code Will Look Like

### Example for Customer Home Page:
```html
<!-- HubSpot Customer Home Page Embed -->
<div id="hs-embed-customer-home">
    <script type="text/javascript" src="https://js.hsforms.net/forms/embed/v2.js"></script>
    <script>
        hbspt.forms.create({
            region: "na1",
            portalId: "23537348",
            formId: "your-page-id",
            target: "#hs-embed-customer-home"
        });
    </script>
</div>
```

### Example for Dealer Hub:
```html
<!-- HubSpot Dealer Hub Embed -->
<div id="hs-embed-dealer-hub">
    <script type="text/javascript" src="https://js.hsforms.net/forms/embed/v2.js"></script>
    <script>
        hbspt.forms.create({
            region: "na1", 
            portalId: "23537348",
            formId: "your-dealer-page-id",
            target: "#hs-embed-dealer-hub"
        });
    </script>
</div>
```

## Alternative: HubSpot Page Embed

If those are full pages, the embed might look like this:

```html
<!-- Full Page Embed -->
<script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>
<script>
  hbspt.forms.create({
    region: "na1",
    portalId: "23537348", 
    target: '#hubspot-customer-content',
    formId: "form-id-here"
  });
</script>
```

## Implementation in Your Code

### Replace in `Views/Home/Index.cshtml`:
```html
<div id="hubspot-customer-content">
    <!-- Replace this entire section with your HubSpot embed code -->
    <script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>
    <script>
      hbspt.forms.create({
        region: "na1",
        portalId: "23537348",
        target: '#hubspot-customer-content',
        formId: "YOUR_CUSTOMER_PAGE_ID"
      });
    </script>
</div>
```

### Replace in `Views/Home/DealerHub.cshtml`:
```html
<div id="hubspot-dealer-content">
    <!-- Replace this entire section with your HubSpot embed code -->
    <script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>
    <script>
      hbspt.forms.create({
        region: "na1",
        portalId: "23537348", 
        target: '#hubspot-dealer-content',
        formId: "YOUR_DEALER_PAGE_ID"
      });
    </script>
</div>
```

## Benefits

✅ **Uses your existing content** - no recreation needed  
✅ **Fixes navigation issues** - links will work properly  
✅ **Same styling and functionality** - just no iframe restrictions  
✅ **Quick implementation** - just replace iframe with embed code  

## If You Can't Find Embed Options

**Contact HubSpot and ask for:**
1. "JavaScript embed codes for existing pages"
2. "Non-iframe embed options" 
3. "Content API access for pages"

**Tell them you need to embed:**
- `customer-home-page-0` 
- `dealer-hub-home-0`

**Into your external website without iframe restrictions** 