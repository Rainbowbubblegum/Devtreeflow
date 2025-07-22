# HubSpot Content Embed Setup Instructions

## Why Switch from iframes to Content Embeds?

- **Fixes Navigation Issues**: Links will work properly and navigate your main website
- **Better SEO**: Search engines can crawl the content 
- **Faster Loading**: No iframe restrictions
- **Better Styling**: Content inherits your site's CSS

## Step-by-Step Instructions

### 1. Access HubSpot Content Embeds

1. Log into your HubSpot account
2. Navigate to **Content** > **Embeds**
3. Click **"Create embed"** in the top right

### 2. Create Customer Home Page Embed

1. **Name**: "Customer Home Page"
2. **Recreate your content** using HubSpot's drag-and-drop editor
   - Copy all content from `https://23537348.hs-sites.com/customer-home-page-0`
   - Use HubSpot modules to recreate the layout
   - Make sure all navigation links point to your actual pages:
     - Browse links should go to `/home/browse`  
     - Login links should go to `/login`
     - Register links should go to `/register`
3. **Publish** the embed
4. Click **"Get Embed Code"** (NOT iframe code)
5. **Copy the embed code**

### 3. Create Dealer Hub Embed  

1. **Name**: "Dealer Hub Home"
2. **Recreate your content** from `https://23537348.hs-sites.com/dealer-hub-home-0`
3. **Ensure navigation links** point to your site:
   - Customer links should go to `/home`
   - Browse links should go to `/home/browse`
   - Other internal links to appropriate pages
4. **Publish** the embed
5. **Get the embed code**

### 4. Update Your ASP.NET Files

#### For Customer Home Page (`Views/Home/Index.cshtml`):
1. Find the comment section that says "REPLACE THIS SECTION WITH HUBSPOT CONTENT EMBED CODE"
2. Replace the entire comment block AND the temporary iframe with your HubSpot embed code
3. Remove the `<!-- TEMPORARY -->` and `<!-- END TEMPORARY -->` sections

#### For Dealer Hub (`Views/Home/DealerHub.cshtml`):
1. Find the comment section that says "REPLACE THIS SECTION WITH HUBSPOT CONTENT EMBED CODE"  
2. Replace the entire comment block AND the temporary iframe with your HubSpot embed code
3. Remove the `<!-- TEMPORARY -->` and `<!-- END TEMPORARY -->` sections

### 5. Example of What Your Embed Code Will Look Like

```html
<div id="hs-embed-61405464936-1wgzc8">
    <script type="text/javascript" src="https://embed.hsforms.com/embedCode.js"></script>
    <script>
        hbspt.content.create({
            portalId: "23537348",
            contentId: "61405464936", 
            target: "#hs-embed-61405464936-1wgzc8"
        });
    </script>
</div>
```

### 6. Test Your Implementation

1. **Deploy your changes**
2. **Visit your home page and dealer hub**
3. **Click navigation links** - they should now navigate your main site properly
4. **Check styling** - adjust CSS if needed since embeds inherit your site's styles

## Benefits After Implementation

✅ **Navigation works properly** - no more iframe restrictions  
✅ **Better user experience** - seamless navigation  
✅ **SEO improvements** - content is crawlable  
✅ **Easier maintenance** - update content in HubSpot, reflects everywhere  
✅ **Better performance** - no iframe overhead  

## Troubleshooting

**If links still don't work:**
- Double-check that you're using embed codes, not iframe codes
- Ensure links in HubSpot content point to full URLs (like `https://yourdomain.com/browse`)

**If styling looks wrong:**
- Embeds inherit your site's CSS - you may need to add custom styles
- Check the `#hubspot-customer-content` and `#hubspot-dealer-content` CSS classes

**If content doesn't load:**
- Verify the embed code is copied exactly from HubSpot
- Check browser console for JavaScript errors
- Ensure HubSpot tracking code is installed on your site

## Need Help?

Contact your HubSpot account manager or support team for assistance with:
- Creating content embeds
- Migration from existing pages
- Advanced embed features 