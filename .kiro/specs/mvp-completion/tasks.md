# Implementation Plan

- [x] 1. Set up database schema for new features





  - [x] 1.1 Create chat_messages table with RLS policies for AI Coach


    - Write migration script for chat_messages table
    - Add indexes for performance (user_id, created_at)
    - Implement RLS policies for user message access
    - _Requirements: 1.1, 1.4_
  

  - [x] 1.2 Create user_tokens table for FCM push notifications

    - Write migration script for user_tokens table
    - Add unique constraint on fcm_token
    - Add index on user_id for fast lookups
    - _Requirements: 2.1_
  
  - [x] 1.3 Create squads, squad_members, and squad_messages tables

    - Write migration script for all three squad tables
    - Implement foreign key relationships with CASCADE deletes
    - Add unique constraint on (squad_id, user_id) in squad_members
    - Create indexes for performance optimization
    - _Requirements: 3.1, 3.2_
  

  - [x] 1.4 Create update_squad_streak database function and trigger

    - Write function to calculate minimum streak across squad members
    - Create trigger on squad_members INSERT/UPDATE
    - Test trigger updates squad_streak correctly
    - _Requirements: 3.4_
  
  - [x] 1.5 Implement RLS policies for squads system

    - Create policy for public squad viewing
    - Create policy for squad member access to membership data
    - Create policy for squad member access to messages
    - Create policy for squad members to send messages
    - _Requirements: 3.2, 3.3_
  
  - [x] 1.6 Create purchases table and extend profiles for IAP

    - Write migration for purchases table
    - Add streak_freeze_count, premium_until, ads_removed to profiles
    - Add indexes on purchases (user_id, stripe_payment_id)
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [x] 1.7 Create analytics_events table for event tracking

    - Write migration for analytics_events table
    - Add indexes on event_name, user_id, created_at
    - Use JSONB for flexible properties storage
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  


  - [x] 1.8 Set up content-media storage bucket with RLS policies

    - Create storage bucket with public read access
    - Implement RLS policy for public viewing
    - Implement RLS policy for admin-only uploads
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [x] 1.9 Add role column to profiles table for admin access

    - Write migration to add role column with CHECK constraint
    - Set default role to 'user'
    - Update content table RLS for admin management
    - _Requirements: 5.4, 5.5_

- [x] 2. Implement AI Coach Edge Function



  - [x] 2.1 Create ai-coach Edge Function with Lovable AI integration


    - Set up Edge Function boilerplate in supabase/functions/ai-coach
    - Implement request validation for message and includeContext
    - Fetch user profile and progress data when includeContext is true
    - Call Lovable AI endpoint with LOVABLE_API_KEY
    - _Requirements: 1.2_
  

  - [x] 2.2 Implement streaming response with Server-Sent Events
    - Set up SSE response headers
    - Stream AI responses chunk by chunk
    - Handle connection errors and timeouts
    - _Requirements: 1.3_
  
  - [x] 2.3 Persist chat messages to database

    - Insert user message to chat_messages before AI call
    - Store complete AI response after streaming completes
    - Handle database errors gracefully
    - _Requirements: 1.1, 1.4_
  

  - [x] 2.4 Create system prompt for smoking cessation coaching

    - Write empathetic and supportive system prompt
    - Include context about user's progress in prompt
    - Test prompt generates helpful responses
    - _Requirements: 1.2_

- [x] 3. Implement Push Notifications system





  - [x] 3.1 Create send-notification Edge Function


    - Set up Edge Function boilerplate
    - Implement FCM token retrieval from user_tokens table
    - Integrate FCM REST API with FCM_SERVER_KEY
    - Handle token expiration and cleanup
    - _Requirements: 2.5_
  
  - [x] 3.2 Implement notification types (daily reminder, streak at risk, achievement)

    - Create notification payload builder for each type
    - Query users who need daily reminders (no check-in today)
    - Query users with streak at risk (48h without check-in)
    - Send achievement notifications on unlock
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [x] 3.3 Set up pg_cron jobs for scheduled notifications


    - Create cron job for daily check-in reminder at 9 AM
    - Create cron job for streak at risk check every 6 hours
    - Test cron jobs trigger Edge Function correctly
    - _Requirements: 2.2, 2.3_
  
  - [x] 3.4 Create Firebase messaging service worker for frontend


    - Write firebase-messaging-sw.js in public folder
    - Implement background notification handling
    - Request notification permission on app load
    - Register FCM token with backend
    - _Requirements: 2.1_
  
  - [x] 3.5 Create usePushNotifications hook for token management


    - Implement FCM token registration
    - Store token in user_tokens table
    - Handle permission denied gracefully
    - _Requirements: 2.1_

- [x] 4. Implement Squads system





  - [x] 4.1 Create squad management Edge Functions


    - Implement create-squad function (name, description validation)
    - Implement join-squad function (check max_members limit)
    - Implement leave-squad function (handle leader transfer)
    - _Requirements: 3.1, 3.2_
  
  - [x] 4.2 Create SquadList component for browsing squads


    - Fetch and display all squads with member counts
    - Show squad_streak for each squad
    - Implement join squad button
    - Handle loading and error states
    - _Requirements: 3.1, 3.2_
  
  - [x] 4.3 Create SquadDetail component for squad information


    - Display squad name, description, and stats
    - Show list of squad members with profiles
    - Display squad leaderboard ranked by squad_streak
    - _Requirements: 3.5_
  
  - [x] 4.4 Create SquadChat component with Supabase Realtime


    - Set up Realtime subscription to squad_messages
    - Display messages in chronological order
    - Implement send message functionality
    - Show user avatars and names
    - _Requirements: 3.3_
  
  - [x] 4.5 Create CreateSquadDialog component


    - Build form with name and description fields
    - Validate input (name required, max lengths)
    - Call create-squad Edge Function
    - Handle success and error states
    - _Requirements: 3.1_
  
  - [x] 4.6 Add squads navigation to main app layout


    - Add Squads link to navigation menu
    - Create /squads route in App.tsx
    - Create /squads/:id route for squad detail
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Implement In-App Purchases with Stripe





  - [x] 5.1 Create create-payment Edge Function


    - Set up Stripe SDK with STRIPE_SECRET_KEY
    - Create Checkout session for each product type
    - Store pending purchase in purchases table
    - Return checkout URL to frontend
    - _Requirements: 4.1_
  
  - [x] 5.2 Create webhook-stripe Edge Function


    - Verify Stripe webhook signature with STRIPE_WEBHOOK_SECRET
    - Handle checkout.session.completed event
    - Update purchase status to 'completed'
    - Apply product benefits to user profile
    - _Requirements: 4.2_
  
  - [x] 5.3 Implement product benefit logic

    - Streak Freeze: Increment streak_freeze_count
    - Premium Monthly: Set premium_until to NOW() + 30 days
    - Remove Ads: Set ads_removed to true
    - _Requirements: 4.3, 4.4_
  
  - [x] 5.4 Create PurchaseDialog component for product selection


    - Display available products with prices
    - Show product descriptions and benefits
    - Call create-payment Edge Function on purchase
    - Redirect to Stripe Checkout
    - _Requirements: 4.1_
  
  - [x] 5.5 Create usePremium hook for subscription validation


    - Check if premium_until > current timestamp
    - Return premium status and expiration date
    - Use in components to gate premium features
    - _Requirements: 4.5_
  
  - [x] 5.6 Add purchase UI to profile page


    - Show current premium status
    - Display streak freeze count
    - Show "Remove Ads" status
    - Add "Upgrade" button to open PurchaseDialog
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 6. Implement Content Management System




  - [x] 6.1 Create AdminContentUpload component


    - Build file upload form for audio/video
    - Upload files to content-media storage bucket
    - Show upload progress
    - Return public URL after upload
    - _Requirements: 5.2_
  
  - [x] 6.2 Create AdminContentForm component


    - Build form for title, description, type, media_url
    - Validate required fields
    - Insert/update content table records
    - Handle success and error states
    - _Requirements: 5.3_
  
  - [x] 6.3 Create AdminContentList component


    - Fetch and display all content items
    - Show edit and delete buttons for each item
    - Filter by content type (meditation, breathing)
    - _Requirements: 5.5_
  
  - [x] 6.4 Add admin route and navigation


    - Create /admin route protected by role check
    - Add Admin link to navigation for admin users
    - Redirect non-admins to dashboard
    - _Requirements: 5.4_
  
  - [x] 6.5 Update Content page to display media from storage


    - Fetch content items with media URLs
    - Render audio player for meditation content
    - Render video player for breathing exercises
    - Track content views for analytics
    - _Requirements: 5.5_

- [x] 7. Implement Analytics and Event Tracking





  - [x] 7.1 Create track-event Edge Function


    - Accept batch of analytics events
    - Validate event structure
    - Store events in analytics_events table
    - Forward to external analytics service (optional)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 7.2 Create analytics utility library


    - Implement trackEvent function with batching
    - Use navigator.sendBeacon for reliability
    - Batch events every 30 seconds or 10 events
    - Handle offline scenarios
    - _Requirements: 6.5_
  
  - [x] 7.3 Add analytics tracking to check-in flow


    - Track checkin_completed event with streak_count
    - Include cigarettes_avoided in properties
    - _Requirements: 6.1_
  
  - [x] 7.4 Add analytics tracking to achievements


    - Track achievement_unlocked event
    - Include achievement_id and achievement_name
    - _Requirements: 6.2_
  
  - [x] 7.5 Add analytics tracking to content viewing


    - Track content_viewed event on play
    - Include content_id, content_type, and duration
    - _Requirements: 6.3_
  
  - [x] 7.6 Add analytics tracking to streak loss


    - Track streak_lost event when streak resets
    - Include previous_streak_count
    - _Requirements: 6.4_

- [x] 8. Implement Production Configuration





  - [x] 8.1 Set up Upstash Redis for rate limiting


    - Create rate-limit utility with Redis client
    - Implement sliding window rate limiting (100 req/min)
    - Apply to all Edge Functions
    - Return 429 status when limit exceeded
    - _Requirements: 7.2_
  
  - [x] 8.2 Integrate Sentry for error tracking


    - Initialize Sentry in main.tsx with SENTRY_DSN
    - Configure BrowserTracing and Replay integrations
    - Add Sentry error boundaries to key components
    - Test error reporting in development
    - _Requirements: 7.3_
  
  - [x] 8.3 Create service worker for asset caching


    - Write sw.js with cache-first strategy
    - Cache static assets (HTML, CSS, JS)
    - Implement cache versioning
    - Register service worker in main.tsx
    - _Requirements: 7.4_
  
  - [x] 8.4 Configure Supabase Auth for production


    - Enable email confirmation in Supabase dashboard
    - Disable auto-confirm for new users
    - Test email confirmation flow
    - _Requirements: 7.1_
  
  - [x] 8.5 Create environment variable validation


    - Write validateEnv function to check required variables
    - Call on application startup
    - Fail fast with clear error messages if missing
    - Document all required variables in README
    - _Requirements: 7.5_
  
  - [x] 8.6 Add error handling to all Edge Functions


    - Implement standard error response format
    - Use error codes (UNAUTHORIZED, RATE_LIMIT_EXCEEDED, etc.)
    - Log errors to Sentry from Edge Functions
    - Return user-friendly error messages
    - _Requirements: 7.3_

- [x] 9. Deploy and configure external services



  - [ ] 9.1 Set up Firebase project for FCM
    - Create Firebase project in console
    - Enable Cloud Messaging
    - Generate and save Server Key
    - Add FCM_SERVER_KEY to Supabase secrets
    - _Requirements: 2.1, 2.5_
  
  - [ ] 9.2 Set up Stripe account and products
    - Create Stripe account
    - Create product: Streak Freeze (R$ 4.90)
    - Create product: Premium Monthly (R$ 9.90/month)
    - Create product: Remove Ads (R$ 14.90 one-time)
    - Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to Supabase
    - Configure webhook endpoint URL
    - _Requirements: 4.1, 4.2_
  
  - [ ] 9.3 Set up Upstash Redis database
    - Create Upstash account
    - Create Redis database
    - Copy connection URL and token
    - Add UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN to Supabase
    - _Requirements: 7.2_
  
  - [ ] 9.4 Set up Sentry project
    - Create Sentry account and project
    - Copy DSN
    - Add SENTRY_DSN to environment variables
    - Configure source maps upload (optional)
    - _Requirements: 7.3_
  
  - [ ] 9.5 Deploy all Edge Functions to Supabase
    - Deploy ai-coach function
    - Deploy send-notification function
    - Deploy create-payment function
    - Deploy webhook-stripe function
    - Deploy track-event function
    - Verify all functions are accessible
    - _Requirements: 1.1, 2.1, 4.1, 4.2, 6.1_

- [ ]* 10. Testing and validation
  - [ ]* 10.1 Write unit tests for Edge Functions
    - Test ai-coach with mocked Lovable AI
    - Test send-notification with mocked FCM
    - Test webhook-stripe signature verification
    - Test rate limiting logic
  
  - [ ]* 10.2 Write integration tests for critical flows
    - Test complete AI chat flow
    - Test notification delivery flow
    - Test purchase flow with Stripe test mode
    - Test squad chat with Realtime
  
  - [ ]* 10.3 Perform end-to-end testing
    - Test signup → onboarding → first check-in
    - Test join squad → send message → view leaderboard
    - Test purchase product → verify benefits applied
    - Test AI coach conversation with context
  
  - [ ]* 10.4 Test on real mobile devices
    - Test iOS Safari and Chrome
    - Test Android Chrome
    - Verify push notifications work
    - Test responsive design
  
  - [ ]* 10.5 Load test critical endpoints
    - Load test check-in Edge Function (100 concurrent)
    - Load test AI coach (50 concurrent)
    - Test Realtime with 100 users in squad chat
    - Verify rate limiting works under load
