# External Services Setup Guide

This guide walks you through setting up all external services required for Respira Livre production deployment.

## Overview

You'll need to set up:
1. Firebase (Push Notifications)
2. Stripe (Payments)
3. Upstash Redis (Rate Limiting & Caching)
4. Sentry (Error Tracking)
5. Deploy Supabase Edge Functions

---

## 1. Firebase Setup (Push Notifications)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `respira-livre` (or your preferred name)
4. Disable Google Analytics (optional for this use case)
5. Click "Create project"

### Step 2: Enable Cloud Messaging

1. In your Firebase project, click the gear icon ⚙️ → "Project settings"
2. Navigate to the "Cloud Messaging" tab
3. Under "Cloud Messaging API (Legacy)", you'll see the "Server key"
4. Copy the **Server Key** (starts with `AAAA...`)

### Step 3: Get Web Push Certificate (Optional but Recommended)

1. Still in "Cloud Messaging" tab
2. Scroll to "Web Push certificates"
3. Click "Generate key pair"
4. Copy the **Key pair** value (this is your VAPID key)

### Step 4: Add to Supabase Secrets

```bash
# Add FCM Server Key to Supabase
supabase secrets set FCM_SERVER_KEY="YOUR_SERVER_KEY_HERE"
```

### Step 5: Update Environment Variables

Add to your `.env` file (for local development):
```env
VITE_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY_HERE
```

---

## 2. Stripe Setup (Payments)

### Step 1: Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Sign up for a new account
3. Complete business verification (required for live mode)
4. Switch to "Test mode" for initial setup

### Step 2: Create Products

#### Product 1: Streak Freeze
1. Go to "Products" in Stripe Dashboard
2. Click "+ Add product"
3. Fill in:
   - **Name**: Streak Freeze
   - **Description**: Protect your streak for one day
   - **Pricing**: One-time payment
   - **Price**: R$ 4.90 BRL
4. Click "Save product"
5. Copy the **Price ID** (starts with `price_...`)

#### Product 2: Premium Monthly
1. Click "+ Add product"
2. Fill in:
   - **Name**: Premium Monthly
   - **Description**: Unlock all premium features
   - **Pricing**: Recurring
   - **Billing period**: Monthly
   - **Price**: R$ 9.90 BRL
3. Click "Save product"
4. Copy the **Price ID**

#### Product 3: Remove Ads
1. Click "+ Add product"
2. Fill in:
   - **Name**: Remove Ads
   - **Description**: Remove all advertisements permanently
   - **Pricing**: One-time payment
   - **Price**: R$ 14.90 BRL
3. Click "Save product"
4. Copy the **Price ID**

### Step 3: Get API Keys

1. Go to "Developers" → "API keys"
2. Copy your **Secret key** (starts with `sk_test_...` for test mode)
3. For production, switch to "Live mode" and copy the live secret key

### Step 4: Set Up Webhook

1. Go to "Developers" → "Webhooks"
2. Click "+ Add endpoint"
3. Enter endpoint URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/webhook-stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_...`)

### Step 5: Add to Supabase Secrets

```bash
# Add Stripe credentials to Supabase
supabase secrets set STRIPE_SECRET_KEY="sk_test_..."
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..."

# Add product price IDs
supabase secrets set STRIPE_PRICE_STREAK_FREEZE="price_..."
supabase secrets set STRIPE_PRICE_PREMIUM="price_..."
supabase secrets set STRIPE_PRICE_REMOVE_ADS="price_..."
```

### Step 6: Update Environment Variables

Add to your `.env` file:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 3. Upstash Redis Setup (Rate Limiting)

### Step 1: Create Upstash Account

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up with GitHub, Google, or email
3. Verify your email

### Step 2: Create Redis Database

1. Click "Create Database"
2. Fill in:
   - **Name**: respira-livre-redis
   - **Type**: Regional (cheaper) or Global (faster worldwide)
   - **Region**: Choose closest to your Supabase region
   - **TLS**: Enabled (recommended)
3. Click "Create"

### Step 3: Get Connection Details

1. Click on your newly created database
2. Scroll to "REST API" section
3. Copy:
   - **UPSTASH_REDIS_REST_URL**: The REST URL
   - **UPSTASH_REDIS_REST_TOKEN**: The REST token

### Step 4: Add to Supabase Secrets

```bash
# Add Upstash credentials to Supabase
supabase secrets set UPSTASH_REDIS_REST_URL="https://..."
supabase secrets set UPSTASH_REDIS_REST_TOKEN="..."
```

---

## 4. Sentry Setup (Error Tracking)

### Step 1: Create Sentry Account

1. Go to [Sentry.io](https://sentry.io/signup/)
2. Sign up for a free account
3. Choose "React" as your platform

### Step 2: Create Project

1. After signup, you'll be prompted to create a project
2. Select platform: **React**
3. Set alert frequency: Your preference
4. Enter project name: `respira-livre`
5. Click "Create Project"

### Step 3: Get DSN

1. You'll see the DSN immediately after project creation
2. Or go to "Settings" → "Projects" → "respira-livre" → "Client Keys (DSN)"
3. Copy the **DSN** (looks like `https://...@sentry.io/...`)

### Step 4: Add to Environment Variables

Add to your `.env` file:
```env
VITE_SENTRY_DSN=https://...@sentry.io/...
```

For Supabase Edge Functions:
```bash
supabase secrets set SENTRY_DSN="https://...@sentry.io/..."
```

### Step 5: Configure Source Maps (Optional)

For better error tracking with source maps:

1. Install Sentry CLI:
```bash
npm install --save-dev @sentry/vite-plugin
```

2. Get Auth Token from Sentry:
   - Go to "Settings" → "Account" → "API" → "Auth Tokens"
   - Create new token with `project:releases` scope
   - Copy the token

3. Add to `.env`:
```env
SENTRY_AUTH_TOKEN=your_auth_token_here
```

---

## 5. Deploy Supabase Edge Functions

### Prerequisites

Make sure you have:
- Supabase CLI installed: `npm install -g supabase`
- Logged in: `supabase login`
- Linked to your project: `supabase link --project-ref YOUR_PROJECT_REF`

### Deploy All Functions

```bash
# Deploy AI Coach function
supabase functions deploy ai-coach

# Deploy Send Notification function
supabase functions deploy send-notification

# Deploy Create Payment function
supabase functions deploy create-payment

# Deploy Stripe Webhook function
supabase functions deploy webhook-stripe

# Deploy Track Event function
supabase functions deploy track-event

# Deploy Check-in function
supabase functions deploy checkin

# Deploy Create Squad function
supabase functions deploy create-squad
```

### Verify Deployment

1. Go to your Supabase Dashboard
2. Navigate to "Edge Functions"
3. Verify all functions are listed and show "Deployed" status
4. Test each function using the "Invoke" button

### Set Function Secrets

All secrets should be set before deploying:

```bash
# View current secrets
supabase secrets list

# Set all required secrets
supabase secrets set FCM_SERVER_KEY="..."
supabase secrets set STRIPE_SECRET_KEY="..."
supabase secrets set STRIPE_WEBHOOK_SECRET="..."
supabase secrets set STRIPE_PRICE_STREAK_FREEZE="..."
supabase secrets set STRIPE_PRICE_PREMIUM="..."
supabase secrets set STRIPE_PRICE_REMOVE_ADS="..."
supabase secrets set UPSTASH_REDIS_REST_URL="..."
supabase secrets set UPSTASH_REDIS_REST_TOKEN="..."
supabase secrets set SENTRY_DSN="..."
supabase secrets set OPENAI_API_KEY="..."
```

---

## Complete Environment Variables Checklist

### Local Development (.env)

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Firebase
VITE_FIREBASE_VAPID_KEY=...

# Sentry
VITE_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=... (optional, for source maps)
```

### Supabase Secrets (Production)

```bash
# Firebase
FCM_SERVER_KEY=AAAA...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STREAK_FREEZE=price_...
STRIPE_PRICE_PREMIUM=price_...
STRIPE_PRICE_REMOVE_ADS=price_...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Sentry
SENTRY_DSN=https://...@sentry.io/...

# OpenAI (for AI Coach)
OPENAI_API_KEY=sk-...
```

---

## Testing Your Setup

### Test Firebase (Push Notifications)

```bash
# Use the send-notification function
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-user-id", "title": "Test", "body": "Testing FCM"}'
```

### Test Stripe (Payments)

1. Use Stripe test card: `4242 4242 4242 4242`
2. Try creating a payment through your app
3. Check Stripe Dashboard → Payments for the test transaction

### Test Upstash (Rate Limiting)

```bash
# Make multiple rapid requests to any rate-limited endpoint
# Should return 429 after exceeding limit
```

### Test Sentry (Error Tracking)

1. Trigger an error in your app
2. Check Sentry Dashboard → Issues
3. Verify error appears with stack trace

---

## Troubleshooting

### Firebase Issues

- **"Invalid server key"**: Make sure you copied the Server Key, not the Sender ID
- **"Registration token not found"**: User hasn't granted notification permission

### Stripe Issues

- **"No such price"**: Verify you're using the correct Price ID, not Product ID
- **"Webhook signature verification failed"**: Check webhook secret matches exactly

### Upstash Issues

- **"Connection refused"**: Verify you're using the REST URL, not the Redis URL
- **"Unauthorized"**: Check token is correct and hasn't expired

### Sentry Issues

- **"DSN not found"**: Verify DSN format is correct
- **No errors appearing**: Check VITE_SENTRY_DSN is set and app is rebuilt

---

## Next Steps

After completing all setups:

1. ✅ Update your production `.env` file with all keys
2. ✅ Deploy your application to production
3. ✅ Test each feature end-to-end
4. ✅ Monitor Sentry for any errors
5. ✅ Check Stripe Dashboard for payment activity
6. ✅ Verify push notifications are working

## Security Notes

- ⚠️ Never commit API keys to version control
- ⚠️ Use test mode for Stripe until ready for production
- ⚠️ Rotate keys if accidentally exposed
- ⚠️ Set up proper CORS and security rules in Supabase
- ⚠️ Enable 2FA on all service accounts
