# Razorpay Setup Guide (Individual Mode - No GST Required)

This guide will help you set up Razorpay payment integration for your AI Interviewer platform.

## Step 1: Create Razorpay Account

1. Go to [https://razorpay.com](https://razorpay.com)
2. Click on "Sign Up" 
3. Choose **"Individual"** as account type (No GST number required)
4. Complete the registration with your:
   - Name
   - Email
   - Phone number
   - PAN Card details

## Step 2: Get API Keys

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** → **API Keys**
3. Click on **"Generate Test Keys"** for testing
4. You'll get:
   - `Key ID` (starts with `rzp_test_`)
   - `Key Secret` (keep this secure!)

## Step 3: Configure Environment Variables

Add these to your `backend/.env` file:

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

**Important:** Never commit these keys to GitHub!

## Step 4: Configure Frontend

Add Razorpay script to `frontend/public/index.html`:

```html
<!-- Add before closing </body> tag -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</body>
```

## Step 5: Test Payments

### Test Mode (Free):
1. Use the test API keys
2. Use these test cards:
   - **Success:** 4111 1111 1111 1111
   - **Failed:** 4111 1111 1111 1112
   - CVV: Any 3 digits
   - Expiry: Any future date

### Test UPI:
- UPI ID: `success@razorpay`
- PIN: Any 4-6 digits

## Step 6: Enable Live Mode (When Ready)

1. Complete KYC verification:
   - Upload PAN card
   - Upload address proof
   - Bank account verification
   - Submit individual business details

2. After approval, generate **Live API Keys**:
   - Go to Settings → API Keys
   - Click "Generate Live Keys"
   - Replace test keys with live keys in `.env`

## Pricing Configuration

Current pricing (can be changed in `backend/razorpay_service.py`):

- **Monthly Premium**: ₹499/month
- **Yearly Premium**: ₹4,999/year (17% discount)

## Features by Tier

### Free Tier:
- 3 interviews per month
- Basic feedback
- Learning roadmap
- Interview history

### Premium Tier:
- Unlimited interviews
- Detailed feedback with scores
- Personalized learning roadmap
- Advanced proctoring insights
- Priority support
- Download results as PDF

## Payment Flow

1. User clicks "Upgrade to Premium"
2. Backend creates Razorpay order
3. Frontend opens Razorpay checkout
4. User completes payment
5. Razorpay redirects back with payment details
6. Backend verifies payment signature
7. Subscription activated immediately

## Security Notes

✅ **What we implemented:**
- Payment signature verification
- Secure webhook handling
- PCI DSS compliant (Razorpay handles this)
- No card details stored on your server

⚠️ **Important:**
- Keep `RAZORPAY_KEY_SECRET` secure
- Use HTTPS in production
- Never expose secret keys in frontend
- Verify all payments on backend

## Webhooks (Optional but Recommended)

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-backend-url.com/webhooks/razorpay`
3. Select events:
   - `payment.captured`
   - `payment.failed`
   - `subscription.cancelled`

## Support

- Razorpay Docs: https://razorpay.com/docs
- Razorpay Support: support@razorpay.com
- Test Dashboard: https://dashboard.razorpay.com/app/test

## Common Issues

### Issue: "Invalid Key ID"
**Solution:** Make sure you're using the correct key (test vs live)

### Issue: "Payment not getting verified"
**Solution:** Check that you're passing correct signature and verifying properly

### Issue: "Order creation failed"
**Solution:** Verify amount is in paise (multiply by 100)

## Next Steps

1. ✅ Install dependencies: `pip install razorpay`
2. ✅ Run migration: `alembic upgrade head`
3. ⬜ Add Razorpay keys to `.env`
4. ⬜ Test with test mode cards
5. ⬜ Complete KYC for live mode
6. ⬜ Switch to live keys
7. ⬜ Start accepting payments!

---

**Good luck with your AI Interviewer platform! 🚀**
