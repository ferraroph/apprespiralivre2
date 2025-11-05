-- Renomear campo fcm_token para push_subscription na tabela user_tokens
ALTER TABLE user_tokens 
DROP COLUMN IF EXISTS fcm_token;

ALTER TABLE user_tokens
ADD COLUMN IF NOT EXISTS push_subscription TEXT;