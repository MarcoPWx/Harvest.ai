-- BYOK Tables for API Keys and Usage Tracking

-- API Keys table (encrypted storage)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'mistral', 'cohere')),
  encrypted_key TEXT NOT NULL, -- In production, use Supabase Vault for encryption
  name TEXT, -- Optional friendly name
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- AI Usage tracking
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost DECIMAL(10, 6) DEFAULT 0, -- Cost in USD
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Chat History (optional, for user's convenience)
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  messages JSONB NOT NULL, -- Store the conversation
  response TEXT, -- AI response
  usage JSONB, -- Token usage details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Usage Limits (optional, for quota management)
CREATE TABLE IF NOT EXISTS usage_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  monthly_token_limit INTEGER,
  monthly_cost_limit DECIMAL(10, 2),
  current_month_tokens INTEGER DEFAULT 0,
  current_month_cost DECIMAL(10, 2) DEFAULT 0,
  reset_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Row Level Security Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- API Keys policies
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- AI Usage policies
CREATE POLICY "Users can view own usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat History policies
CREATE POLICY "Users can view own chat history" ON chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history" ON chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history" ON chat_history
  FOR DELETE USING (auth.uid() = user_id);

-- Usage Limits policies
CREATE POLICY "Users can view own limits" ON usage_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own limits" ON usage_limits
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_api_keys_user_provider ON api_keys(user_id, provider);
CREATE INDEX idx_ai_usage_user_created ON ai_usage(user_id, created_at DESC);
CREATE INDEX idx_chat_history_user_created ON chat_history(user_id, created_at DESC);

-- Function to update last_used timestamp
CREATE OR REPLACE FUNCTION update_api_key_last_used()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE api_keys 
  SET last_used = now() 
  WHERE user_id = NEW.user_id AND provider = NEW.provider;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_used when AI is used
CREATE TRIGGER update_api_key_on_usage
  AFTER INSERT ON ai_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_api_key_last_used();

-- Function to calculate monthly usage
CREATE OR REPLACE FUNCTION calculate_monthly_usage(p_user_id UUID, p_provider TEXT)
RETURNS TABLE(
  total_tokens BIGINT,
  total_cost DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(total_tokens), 0)::BIGINT as total_tokens,
    COALESCE(SUM(cost), 0)::DECIMAL as total_cost
  FROM ai_usage
  WHERE user_id = p_user_id 
    AND provider = p_provider
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;
