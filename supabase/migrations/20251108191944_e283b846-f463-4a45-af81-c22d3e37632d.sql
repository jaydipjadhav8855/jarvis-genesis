-- Create conversations table to store chat history
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own conversations" 
ON public.conversations 
FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create index for better performance
CREATE INDEX idx_conversations_user_id_created_at ON public.conversations(user_id, created_at DESC);

-- Enable realtime for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;