# HubSpot Request: Add target="_parent" to Navigation Links

## Simple Fix Request

**We need HubSpot to add `target="_parent"` to all navigation links on our pages so they break out of the iframe and navigate our main website.**

## Pages That Need Updates

### 1. Customer Home Page (`customer-home-page-0`)
### 2. Dealer Hub Page (`dealer-hub-home-0`)

## Specific Links to Update

**Add `target="_parent"` to these links:**

### Customer Page Links:
- **Sell button**: `http://mycarmatch.co.za/sell`
- **Browse button**: `http://mycarmatch.co.za/home/browse` 
- **Build My Deal Button**: `http://mycarmatch.co.za/home/browse?knownRequest=true`
- **Find My Car Match Button**: `http://mycarmatch.co.za/home/browse`

### Dealer Hub Links:
- Any links pointing to `mycarmatch.co.za` domain
- Navigation buttons/links to our main website

## What HubSpot Needs to Change

### Current Code (doesn't work in iframe):
```html
<a href="http://mycarmatch.co.za/sell">Sell</a>
<a href="http://mycarmatch.co.za/home/browse">Browse</a>
<a href="http://mycarmatch.co.za/home/browse?knownRequest=true">Build My Deal</a>
```

### Required Code (works in iframe):
```html
<a href="http://mycarmatch.co.za/sell" target="_parent">Sell</a>
<a href="http://mycarmatch.co.za/home/browse" target="_parent">Browse</a>
<a href="http://mycarmatch.co.za/home/browse?knownRequest=true" target="_parent">Build My Deal</a>
```

## What to Tell HubSpot Support

> "We need to add `target="_parent"` to all navigation links that point to our main website (mycarmatch.co.za) on our HubSpot pages. These pages are embedded in iframes on our external website, and currently when users click navigation links, they only navigate within the iframe instead of navigating to our main website. Adding `target="_parent"` will fix this issue."

## Alternative Requests

If they ask for more details, you can also request:

### Option A: Target Attribute
- Add `target="_parent"` to external links

### Option B: JavaScript Solution  
- Add onclick handlers that use `window.parent.location.href`

### Option C: Button/Link Configuration
- Change link behavior in HubSpot editor to "Open in parent window"

## Benefits of This Approach

✅ **Quick fix** - just add one attribute to existing links  
✅ **No code changes** needed on our website  
✅ **Uses existing content** - no recreation required  
✅ **Immediate solution** - works as soon as HubSpot makes the change  
✅ **Keep current iframe** - no need to switch to embeds  

## Testing Instructions

After HubSpot makes the changes:

1. **Visit your website** with the HubSpot iframes
2. **Click navigation links** (Sell, Browse, etc.)
3. **Verify** that clicking takes you to the main website pages, not just changing iframe content
4. **Check browser URL** changes to show the correct page

## Fallback Plan

If HubSpot cannot add `target="_parent"` for any reason, we can proceed with the embed code approach we discussed earlier. 