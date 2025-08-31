export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: "user" | "admin" | "moderator" | "developer";
          subscription_tier: "free" | "starter" | "pro" | "team" | "enterprise";
          subscription_status: "active" | "canceled" | "past_due" | "trialing" | "paused";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          trial_ends_at: string | null;
          preferences: Json;
          notification_settings: Json;
          api_settings: Json;
          onboarding_completed: boolean;
          email_verified: boolean;
          two_factor_enabled: boolean;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      teams: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          subscription_tier: "free" | "starter" | "pro" | "team" | "enterprise";
          subscription_status: "active" | "canceled" | "past_due" | "trialing" | "paused";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          settings: Json;
          features: Json;
          max_members: number;
          max_monthly_generations: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["teams"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["teams"]["Insert"]>;
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: "owner" | "admin" | "member" | "viewer";
          permissions: Json;
          invited_by: string | null;
          joined_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["team_members"]["Row"], "id" | "joined_at">;
        Update: Partial<Database["public"]["Tables"]["team_members"]["Insert"]>;
      };
      content_generations: {
        Row: {
          id: string;
          user_id: string;
          team_id: string | null;
          input_text: string;
          input_format: string | null;
          input_length: number | null;
          input_metadata: Json;
          output_text: string | null;
          output_format:
            | "blog"
            | "email"
            | "summary"
            | "presentation"
            | "tweet"
            | "linkedin"
            | "script"
            | "outline"
            | "report";
          output_length: number | null;
          output_metadata: Json;
          model: string;
          prompt: string | null;
          parameters: Json;
          status: "pending" | "processing" | "completed" | "failed" | "canceled";
          error_message: string | null;
          tokens_used: number | null;
          estimated_cost: number | null;
          quality_score: number | null;
          processing_time: number | null;
          parent_id: string | null;
          template_id: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["content_generations"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["content_generations"]["Insert"]>;
      };
      templates: {
        Row: {
          id: string;
          user_id: string | null;
          team_id: string | null;
          name: string;
          description: string | null;
          category: string | null;
          tags: string[] | null;
          format:
            | "blog"
            | "email"
            | "summary"
            | "presentation"
            | "tweet"
            | "linkedin"
            | "script"
            | "outline"
            | "report";
          prompt_template: string;
          parameters: Json;
          examples: Json;
          is_public: boolean;
          is_featured: boolean;
          price: number;
          usage_count: number;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["templates"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["templates"]["Insert"]>;
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string | null;
          team_id: string | null;
          name: string;
          key_hash: string;
          key_preview: string;
          permissions: Json;
          rate_limit: number;
          max_monthly_requests: number | null;
          requests_count: number;
          status: "active" | "revoked" | "expired";
          expires_at: string | null;
          last_used_at: string | null;
          created_at: string;
          revoked_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["api_keys"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["api_keys"]["Insert"]>;
      };
      files: {
        Row: {
          id: string;
          user_id: string;
          team_id: string | null;
          filename: string;
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          status: "uploading" | "processing" | "ready" | "failed" | "deleted";
          processing_metadata: Json;
          extracted_text: string | null;
          generation_id: string | null;
          uploaded_at: string;
          processed_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["files"]["Row"], "id" | "uploaded_at">;
        Update: Partial<Database["public"]["Tables"]["files"]["Insert"]>;
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string | null;
          team_id: string | null;
          api_key_id: string | null;
          endpoint: string;
          method: string;
          request_body: Json | null;
          response_status: number | null;
          response_time: number | null;
          tokens_used: number | null;
          cost: number | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["usage_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["usage_logs"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "email" | "in_app" | "sms" | "push" | "webhook";
          status: "pending" | "sent" | "failed" | "read";
          title: string;
          message: string;
          data: Json;
          action_url: string | null;
          sent_at: string | null;
          read_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      embeddings: {
        Row: {
          id: string;
          content_id: string | null;
          user_id: string | null;
          text: string;
          embedding: number[] | null;
          metadata: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["embeddings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["embeddings"]["Insert"]>;
      };
      cache: {
        Row: {
          key: string;
          value: Json;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cache"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["cache"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          team_id: string | null;
          event_type: string;
          event_data: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          event_name: string;
          event_properties: Json;
          page_url: string | null;
          referrer: string | null;
          user_agent: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["analytics_events"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Insert"]>;
      };
      rate_limits: {
        Row: {
          id: string;
          identifier: string;
          endpoint: string;
          requests_count: number;
          window_start: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["rate_limits"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["rate_limits"]["Insert"]>;
      };
      webhooks: {
        Row: {
          id: string;
          user_id: string | null;
          team_id: string | null;
          name: string;
          url: string;
          events: string[];
          headers: Json;
          is_active: boolean;
          last_triggered_at: string | null;
          failure_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["webhooks"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["webhooks"]["Insert"]>;
      };
      webhook_deliveries: {
        Row: {
          id: string;
          webhook_id: string;
          event_type: string;
          payload: Json;
          response_status: number | null;
          response_body: string | null;
          delivered_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["webhook_deliveries"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["webhook_deliveries"]["Insert"]>;
      };
      feature_flags: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_enabled: boolean;
          rollout_percentage: number;
          user_whitelist: string[];
          team_whitelist: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["feature_flags"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["feature_flags"]["Insert"]>;
      };
      billing_events: {
        Row: {
          id: string;
          user_id: string | null;
          team_id: string | null;
          event_type: string;
          amount: number | null;
          currency: string;
          stripe_event_id: string | null;
          stripe_invoice_id: string | null;
          stripe_payment_intent_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["billing_events"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["billing_events"]["Insert"]>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "user" | "admin" | "moderator" | "developer";
      subscription_tier: "free" | "starter" | "pro" | "team" | "enterprise";
      subscription_status: "active" | "canceled" | "past_due" | "trialing" | "paused";
      content_format:
        | "blog"
        | "email"
        | "summary"
        | "presentation"
        | "tweet"
        | "linkedin"
        | "script"
        | "outline"
        | "report";
      generation_status: "pending" | "processing" | "completed" | "failed" | "canceled";
      notification_type: "email" | "in_app" | "sms" | "push" | "webhook";
      notification_status: "pending" | "sent" | "failed" | "read";
      file_status: "uploading" | "processing" | "ready" | "failed" | "deleted";
      api_key_status: "active" | "revoked" | "expired";
      team_role: "owner" | "admin" | "member" | "viewer";
    };
  };
}
