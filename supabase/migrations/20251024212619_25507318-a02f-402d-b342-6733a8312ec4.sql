-- Add length constraints to prevent resource exhaustion attacks

-- Add constraint to squad_messages to prevent extremely long messages
ALTER TABLE public.squad_messages
ADD CONSTRAINT message_length_check 
CHECK (length(message) > 0 AND length(message) <= 2000);

-- Add constraint to community_posts to prevent extremely long posts
ALTER TABLE public.community_posts
ADD CONSTRAINT post_content_length 
CHECK (length(content) > 0 AND length(content) <= 5000);

-- Add helpful comments
COMMENT ON CONSTRAINT message_length_check ON public.squad_messages IS 
'Prevents DoS attacks by limiting squad messages to 2000 characters';

COMMENT ON CONSTRAINT post_content_length ON public.community_posts IS 
'Prevents DoS attacks and ensures reasonable post length (max 5000 characters)';