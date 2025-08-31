-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search
CREATE EXTENSION IF NOT EXISTS "vector"; -- For embeddings

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator', 'developer');
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'pro', 'team', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'paused');
CREATE TYPE content_format AS ENUM ('blog', 'email', 'summary', 'quiz', 'presentation', 'tweet', 'linkedin', 'script', 'outline', 'report');
CREATE TYPE generation_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'canceled');
CREATE TYPE notification_type AS ENUM ('email', 'in_app', 'sms', 'push', 'webhook');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'read');
CREATE TYPE file_status AS ENUM ('uploading', 'processing', 'ready', 'failed', 'deleted');
CREATE TYPE api_key_status AS ENUM ('active', 'revoked', 'expired');
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'user',
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_status subscription_status DEFAULT 'active',
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    trial_ends_at TIMESTAMPTZ,
    
    -- Settings
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{"email": true, "in_app": true}',
    api_settings JSONB DEFAULT '{}',
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    
    -- Billing
    subscription_tier subscription_tier DEFAULT 'team',
    subscription_status subscription_status DEFAULT 'active',
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    
    -- Settings
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    
    -- Limits
    max_members INTEGER DEFAULT 5,
    max_monthly_generations INTEGER DEFAULT 10000,
    
    -- Metadata
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role team_role NOT NULL DEFAULT 'member',
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES public.users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Content generations
CREATE TABLE public.content_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    
    -- Input
    input_text TEXT NOT NULL,
    input_format TEXT,
    input_length INTEGER,
    input_metadata JSONB DEFAULT '{}',
    
    -- Output
    output_text TEXT,
    output_format content_format NOT NULL,
    output_length INTEGER,
    output_metadata JSONB DEFAULT '{}',
    
    -- Generation details
    model TEXT NOT NULL,
    prompt TEXT,
    parameters JSONB DEFAULT '{}',
    status generation_status DEFAULT 'pending',
    error_message TEXT,
    
    -- Metrics
    tokens_used INTEGER,
    estimated_cost DECIMAL(10, 6),
    quality_score DECIMAL(3, 2),
    processing_time INTEGER, -- milliseconds
    
    -- Relations
    parent_id UUID REFERENCES public.content_generations(id), -- For regenerations
    template_id UUID REFERENCES public.templates(id),
    
    -- Timestamps
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates
CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    tags TEXT[],
    
    -- Template content
    format content_format NOT NULL,
    prompt_template TEXT NOT NULL,
    parameters JSONB DEFAULT '{}',
    examples JSONB DEFAULT '[]',
    
    -- Marketplace
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    price DECIMAL(10, 2) DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE, -- Hashed API key
    key_preview TEXT NOT NULL, -- First 8 chars for identification
    
    -- Permissions & Limits
    permissions JSONB DEFAULT '{}',
    rate_limit INTEGER DEFAULT 100, -- requests per hour
    max_monthly_requests INTEGER,
    requests_count INTEGER DEFAULT 0,
    
    -- Status
    status api_key_status DEFAULT 'active',
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

-- Files
CREATE TABLE public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    
    -- File info
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    
    -- Processing
    status file_status DEFAULT 'uploading',
    processing_metadata JSONB DEFAULT '{}',
    extracted_text TEXT,
    
    -- Relations
    generation_id UUID REFERENCES public.content_generations(id) ON DELETE SET NULL,
    
    -- Metadata
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Usage logs
CREATE TABLE public.usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
    
    -- Request details
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    request_body JSONB,
    response_status INTEGER,
    response_time INTEGER, -- milliseconds
    
    -- Metrics
    tokens_used INTEGER,
    cost DECIMAL(10, 6),
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    type notification_type NOT NULL,
    status notification_status DEFAULT 'pending',
    
    -- Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    action_url TEXT,
    
    -- Delivery
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Embeddings for semantic search
CREATE TABLE public.embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES public.content_generations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Content
    text TEXT NOT NULL,
    embedding vector(1536), -- OpenAI embeddings dimension
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cache for expensive operations
CREATE TABLE public.cache (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    
    -- Event details
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id TEXT,
    
    -- Event data
    event_name TEXT NOT NULL,
    event_properties JSONB DEFAULT '{}',
    
    -- Context
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limits
CREATE TABLE public.rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier TEXT NOT NULL, -- user_id, api_key, or IP
    endpoint TEXT NOT NULL,
    
    -- Limits
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(identifier, endpoint, window_start)
);

-- Webhooks
CREATE TABLE public.webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    
    -- Configuration
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    headers JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook deliveries
CREATE TABLE public.webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
    
    -- Delivery details
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    
    -- Status
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature flags
CREATE TABLE public.feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Configuration
    is_enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0,
    user_whitelist UUID[] DEFAULT '{}',
    team_whitelist UUID[] DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing events
CREATE TABLE public.billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    
    -- Event details
    event_type TEXT NOT NULL,
    amount DECIMAL(10, 2),
    currency TEXT DEFAULT 'USD',
    
    -- Stripe
    stripe_event_id TEXT UNIQUE,
    stripe_invoice_id TEXT,
    stripe_payment_intent_id TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX idx_teams_slug ON public.teams(slug);
CREATE INDEX idx_content_generations_user_id ON public.content_generations(user_id);
CREATE INDEX idx_content_generations_status ON public.content_generations(status);
CREATE INDEX idx_content_generations_created_at ON public.content_generations(created_at DESC);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_files_user_id ON public.files(user_id);
CREATE INDEX idx_files_status ON public.files(status);
CREATE INDEX idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON public.usage_logs(created_at DESC);
CREATE INDEX idx_notifications_user_id_status ON public.notifications(user_id, status);
CREATE INDEX idx_embeddings_embedding ON public.embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_cache_expires_at ON public.cache(expires_at);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);

-- Create full-text search indexes
CREATE INDEX idx_content_generations_search ON public.content_generations 
    USING gin(to_tsvector('english', input_text || ' ' || COALESCE(output_text, '')));
CREATE INDEX idx_templates_search ON public.templates 
    USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their content generations" ON public.content_generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create content generations" ON public.content_generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
