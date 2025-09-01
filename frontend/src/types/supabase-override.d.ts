// Temporary type overrides for Supabase to fix TypeScript issues
// This file provides type assertions for database operations

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    from(table: string): any;
  }
}

// Export to make this a module
export {};
