-- Allow service role to insert assistant messages for AI Coach
CREATE POLICY "Service role can insert assistant messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (role = 'assistant');