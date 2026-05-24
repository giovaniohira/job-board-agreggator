import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createAnonServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function createServiceClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceRoleKey) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return createAnonServiceClient();
}

export function getCronKey(): string {
  const cronKey = process.env.CRON_SECRET;
  if (!cronKey || cronKey.length < 16) {
    throw new Error("CRON_SECRET must be set and at least 16 characters");
  }
  return cronKey;
}
