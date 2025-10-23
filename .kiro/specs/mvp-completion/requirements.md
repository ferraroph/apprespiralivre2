# Requirements Document

## Introduction

This specification covers the completion of the Respira Livre MVP by implementing the remaining 5% of features. The system currently has a complete backend schema, authentication, check-in system, and progress tracking. This spec focuses on implementing AI Coach, Push Notifications, Squads (group system), In-App Purchases, Content Management, Analytics, and production adjustments.

## Glossary

- **Respira Livre System**: The complete smoking cessation application including frontend and backend
- **AI Coach**: An AI-powered conversational assistant using Lovable AI (Gemini 2.5 Flash)
- **FCM**: Firebase Cloud Messaging service for push notifications
- **Squad**: A group of users (max 10 members) who support each other in quitting smoking
- **Edge Function**: Serverless function running on Supabase infrastructure
- **Lovable Cloud**: Supabase-based backend infrastructure
- **IAP**: In-App Purchase system for monetization
- **Content Media Bucket**: Storage bucket for meditation audios and breathing exercise videos
- **Streak**: Consecutive days of successful check-ins
- **RLS**: Row Level Security policies in PostgreSQL

## Requirements

### Requirement 1: AI Coach Implementation

**User Story:** As a user struggling with cravings, I want to chat with an AI coach, so that I can receive personalized support and motivation in real-time.

#### Acceptance Criteria

1. WHEN a user sends a message to the AI Coach, THE Respira Livre System SHALL store the message in the chat_messages table with user_id, message content, and timestamp
2. WHEN the AI Coach receives a user message, THE Respira Livre System SHALL call the Lovable AI endpoint at https://ai.gateway.lovable.dev/v1/chat/completions with the user's context (profile data and progress metrics)
3. WHEN the AI generates a response, THE Respira Livre System SHALL stream the response to the frontend using Server-Sent Events
4. THE Respira Livre System SHALL persist all AI responses in the chat_messages table with role set to 'assistant'
5. WHEN a user opens the AI Coach interface, THE Respira Livre System SHALL retrieve the last 50 messages from chat_messages ordered by timestamp

### Requirement 2: Push Notifications System

**User Story:** As a user, I want to receive timely reminders and notifications, so that I stay engaged with my quit journey and maintain my streak.

#### Acceptance Criteria

1. WHEN a user grants notification permission, THE Respira Livre System SHALL register the FCM token in the user_tokens table associated with their user_id
2. THE Respira Livre System SHALL send a daily check-in reminder notification at 9:00 AM local time to all users who have not checked in that day
3. WHEN a user has not checked in for 48 hours, THE Respira Livre System SHALL send a streak-at-risk notification
4. WHEN a user unlocks an achievement, THE Respira Livre System SHALL send a congratulatory notification within 5 seconds
5. THE Respira Livre System SHALL use the send-notification Edge Function to deliver notifications via FCM with the FCM_SERVER_KEY secret

### Requirement 3: Squads (Group System)

**User Story:** As a user, I want to join or create a squad with other users, so that we can support each other and compete together in our quit journey.

#### Acceptance Criteria

1. WHEN a user creates a squad, THE Respira Livre System SHALL create a new record in the squads table with the user as leader and max_members set to 10
2. WHEN a user requests to join a squad, THE Respira Livre System SHALL add them to squad_members if the squad has fewer than max_members
3. WHILE a user is a squad member, THE Respira Livre System SHALL display real-time chat messages from other squad members using Supabase Realtime
4. THE Respira Livre System SHALL calculate squad_streak as the minimum streak value among all active squad members
5. WHEN a user views the squad leaderboard, THE Respira Livre System SHALL display squads ranked by squad_streak in descending order

### Requirement 4: In-App Purchases

**User Story:** As a user, I want to purchase premium features like Streak Freeze, so that I can enhance my experience and support the app.

#### Acceptance Criteria

1. WHEN a user initiates a purchase, THE Respira Livre System SHALL create a Stripe Checkout session via the create-payment Edge Function
2. WHEN Stripe confirms a successful payment, THE Respira Livre System SHALL receive the webhook event and create a record in the purchases table
3. WHEN a user purchases a Streak Freeze, THE Respira Livre System SHALL add one streak_freeze_count to their profile
4. WHEN a user purchases Premium Content subscription, THE Respira Livre System SHALL set premium_until timestamp to 30 days from purchase date
5. THE Respira Livre System SHALL validate active subscriptions by checking if premium_until is greater than current timestamp

### Requirement 5: Content Management System

**User Story:** As an administrator, I want to upload meditation audios and breathing videos, so that users can access quality content for their recovery.

#### Acceptance Criteria

1. THE Respira Livre System SHALL provide a content-media storage bucket with public read access
2. WHEN an administrator uploads a media file, THE Respira Livre System SHALL store the file in the content-media bucket and return a public URL
3. WHEN an administrator creates content, THE Respira Livre System SHALL insert a record in the content table with title, description, type, and media_url
4. THE Respira Livre System SHALL enforce RLS policies allowing only users with admin role to insert or update content records
5. WHEN a user views the content library, THE Respira Livre System SHALL retrieve all published content items with their media URLs

### Requirement 6: Analytics and Event Tracking

**User Story:** As a product manager, I want to track user behavior and key events, so that I can understand engagement and optimize the product.

#### Acceptance Criteria

1. WHEN a user completes a check-in, THE Respira Livre System SHALL send a checkin_completed event to the analytics service with user_id and streak_count
2. WHEN a user unlocks an achievement, THE Respira Livre System SHALL send an achievement_unlocked event with achievement_id and user_id
3. WHEN a user views content, THE Respira Livre System SHALL send a content_viewed event with content_id and duration
4. WHEN a user loses their streak, THE Respira Livre System SHALL send a streak_lost event with previous_streak_count
5. THE Respira Livre System SHALL batch analytics events and send them via the track-event Edge Function to minimize performance impact

### Requirement 7: Production Configuration

**User Story:** As a developer, I want the application properly configured for production, so that it is secure, performant, and reliable.

#### Acceptance Criteria

1. THE Respira Livre System SHALL require email confirmation for new user registrations in production environment
2. THE Respira Livre System SHALL implement rate limiting on Edge Functions using Upstash Redis with maximum 100 requests per minute per user
3. WHEN an error occurs in production, THE Respira Livre System SHALL send error details to Sentry with user context and stack trace
4. THE Respira Livre System SHALL cache static assets using a service worker with cache-first strategy for performance
5. THE Respira Livre System SHALL validate all environment variables on application startup and fail fast if required variables are missing
