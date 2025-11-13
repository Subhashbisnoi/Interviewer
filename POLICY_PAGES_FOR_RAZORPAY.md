# Policy Pages for Razorpay Integration

This document contains all the required policy page URLs for Razorpay activation.

## Required Policy Pages (5/5 Complete ✅)

### 1. Privacy Policy ✅
- **URL**: `https://yourdomain.com/privacy-policy`
- **Route**: `/privacy-policy`
- **Component**: `frontend/src/pages/PrivacyPolicy.js`
- **Description**: Explains how we collect, use, and protect user data

### 2. Terms and Conditions ✅
- **URL**: `https://yourdomain.com/terms`
- **Route**: `/terms`
- **Component**: `frontend/src/pages/TermsAndConditions.js`
- **Description**: Legal terms governing use of the service

### 3. Cancellation and Refund Policy ✅
- **URL**: `https://yourdomain.com/refund-policy`
- **Route**: `/refund-policy`
- **Component**: `frontend/src/pages/RefundPolicy.js`
- **Description**: Details about subscription cancellation and refund process (7-day money-back guarantee)

### 4. Shipping and Delivery Policy ✅
- **URL**: `https://yourdomain.com/shipping-policy`
- **Route**: `/shipping-policy`
- **Component**: `frontend/src/pages/ShippingPolicy.js`
- **Description**: Explains that we offer digital services only (no physical shipping)

### 5. Contact Us ✅
- **URL**: `https://yourdomain.com/contact`
- **Route**: `/contact`
- **Component**: `frontend/src/pages/ContactUs.js`
- **Description**: Contact form and support information

## How to Add These URLs to Razorpay

1. **Login to Razorpay Dashboard**
   - Go to https://dashboard.razorpay.com

2. **Navigate to Settings**
   - Click on "Settings" in the left sidebar
   - Select "Website and App URLs"

3. **Add Policy URLs**
   Replace `yourdomain.com` with your actual domain:
   
   - **Privacy Policy**: `https://yourdomain.com/privacy-policy`
   - **Terms and Conditions**: `https://yourdomain.com/terms`
   - **Cancellation and Refund**: `https://yourdomain.com/refund-policy`
   - **Shipping and Delivery**: `https://yourdomain.com/shipping-policy`
   - **Contact Us**: `https://yourdomain.com/contact`

4. **Save Changes**
   - Click "Save" to update your policy URLs
   - Verify all 5 pages are accessible

## Local Development URLs (for testing)

If you're testing locally, use:
- Privacy Policy: `http://localhost:3000/privacy-policy`
- Terms and Conditions: `http://localhost:3000/terms`
- Cancellation and Refund: `http://localhost:3000/refund-policy`
- Shipping and Delivery: `http://localhost:3000/shipping-policy`
- Contact Us: `http://localhost:3000/contact`

## Production URLs (after deployment)

### If deployed on Vercel:
- Privacy Policy: `https://your-app.vercel.app/privacy-policy`
- Terms and Conditions: `https://your-app.vercel.app/terms`
- Cancellation and Refund: `https://your-app.vercel.app/refund-policy`
- Shipping and Delivery: `https://your-app.vercel.app/shipping-policy`
- Contact Us: `https://your-app.vercel.app/contact`

### If using custom domain:
- Privacy Policy: `https://interviewer.com/privacy-policy`
- Terms and Conditions: `https://interviewer.com/terms`
- Cancellation and Refund: `https://interviewer.com/refund-policy`
- Shipping and Delivery: `https://interviewer.com/shipping-policy`
- Contact Us: `https://interviewer.com/contact`

## Verification Checklist

Before submitting to Razorpay, ensure:

- [ ] All 5 policy pages are accessible
- [ ] Pages load without errors
- [ ] Links in footer work correctly
- [ ] Content is appropriate and complete
- [ ] Contact email is valid (update from `support@interviewer.com` to your actual email)
- [ ] Business address is filled in (update placeholders in pages)
- [ ] All pages are mobile-responsive
- [ ] HTTPS is enabled (required by Razorpay)

## Important Notes

1. **Update Email Address**: Replace `support@interviewer.com` with your actual support email in:
   - `frontend/src/pages/PrivacyPolicy.js`
   - `frontend/src/pages/TermsAndConditions.js`
   - `frontend/src/pages/RefundPolicy.js`
   - `frontend/src/pages/ShippingPolicy.js`
   - `frontend/src/pages/ContactUs.js`

2. **Update Business Address**: Replace `[Your Business Address]` with your actual address in:
   - `frontend/src/pages/PrivacyPolicy.js`
   - `frontend/src/pages/TermsAndConditions.js`
   - `frontend/src/pages/ContactUs.js`

3. **Update City/Jurisdiction**: Replace `[Your City, India]` in:
   - `frontend/src/pages/TermsAndConditions.js` (Governing Law section)

4. **Contact Form Backend**: The contact form in `ContactUs.js` currently logs to console. 
   Implement actual email sending via backend:
   ```javascript
   // In ContactUs.js handleSubmit, replace console.log with:
   const response = await fetch('/api/contact', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(formData)
   });
   ```

## Policy Page Links in Footer

All policy pages are linked in the footer component:
- File: `frontend/src/components/Footer.js`
- Location: Bottom bar with bullet separators
- Also in "Support" section of footer

## Testing the Policy Pages

After deployment, test each page:

```bash
# Test all policy pages are accessible
curl -I https://yourdomain.com/privacy-policy
curl -I https://yourdomain.com/terms
curl -I https://yourdomain.com/refund-policy
curl -I https://yourdomain.com/shipping-policy
curl -I https://yourdomain.com/contact
```

All should return HTTP 200 OK.

## Next Steps After Adding URLs to Razorpay

1. Complete business details in Razorpay dashboard
2. Upload required KYC documents
3. Wait for account verification (2-3 business days)
4. Switch from test mode to live mode
5. Update `.env` with live Razorpay keys
6. Test payment flow with small amount
7. Go live with production payments

---

**Status**: All 5 required policy pages created and integrated ✅
**Last Updated**: November 13, 2025
