# Supabase Auth Production Configuration

This document describes the steps to configure Supabase Auth for production deployment.

## Configuration Steps

### 1. Enable Email Confirmation

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth** section
4. Find **Enable email confirmations** toggle
5. **Enable** this setting
6. Save changes

### 2. Disable Auto-Confirm for New Users

1. In the same **Email Auth** section
2. Find **Enable auto-confirm** toggle
3. **Disable** this setting
4. This ensures new users must confirm their email before accessing the app
5. Save changes

### 3. Configure Email Templates (Optional but Recommended)

1. Navigate to **Authentication** → **Email Templates**
2. Customize the following templates:
   - **Confirm signup**: Email sent to new users
   - **Magic Link**: For passwordless login
   - **Change Email Address**: When users update their email
   - **Reset Password**: For password recovery

3. Recommended customizations:
   - Update branding (logo, colors)
   - Translate to Portuguese (Brazilian)
   - Add support contact information

### 4. Set Up Email Rate Limiting

1. Navigate to **Authentication** → **Rate Limits**
2. Configure appropriate limits:
   - **Email sending**: 4 emails per hour per user (default)
   - **SMS sending**: 4 SMS per hour per user (default)
   - Adjust based on your needs

### 5. Configure Redirect URLs

1. Navigate to **Authentication** → **URL Configuration**
2. Add your production domain to **Site URL**:
   ```
   https://your-production-domain.com
   ```
3. Add allowed redirect URLs:
   ```
   https://your-production-domain.com/**
   https://your-production-domain.com/auth/callback
   ```

### 6. Test Email Confirmation Flow

After configuration, test the complete flow:

1. **Sign up with a new email**
   - User should receive confirmation email
   - User should NOT be able to log in before confirming

2. **Confirm email**
   - Click link in confirmation email
   - User should be redirected to app
   - User should now be able to log in

3. **Password reset**
   - Request password reset
   - Receive reset email
   - Complete password reset flow

## SQL Configuration (Alternative Method)

If you prefer to configure via SQL, you can run these commands in the Supabase SQL Editor:

```sql
-- Enable email confirmation
UPDATE auth.config
SET email_confirm = true,
    email_autoconfirm = false
WHERE id = 1;

-- Verify configuration
SELECT email_confirm, email_autoconfirm
FROM auth.config
WHERE id = 1;
```

## Environment Variables

Ensure these environment variables are set in production:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

## Security Best Practices

1. **Never commit** service role keys to version control
2. **Use environment variables** for all sensitive configuration
3. **Enable RLS** (Row Level Security) on all tables
4. **Regularly review** authentication logs for suspicious activity
5. **Set up monitoring** for failed login attempts

## Troubleshooting

### Users not receiving confirmation emails

1. Check Supabase email logs in Dashboard → Authentication → Logs
2. Verify email provider configuration
3. Check spam folders
4. Ensure email templates are properly configured

### Confirmation links not working

1. Verify redirect URLs are correctly configured
2. Check that Site URL matches your production domain
3. Ensure HTTPS is enabled in production

### Auto-confirm still enabled

1. Clear browser cache
2. Verify configuration in Supabase Dashboard
3. Check SQL configuration with the query above
4. Contact Supabase support if issue persists

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Auth Configuration Reference](https://supabase.com/docs/reference/javascript/auth-signup)
