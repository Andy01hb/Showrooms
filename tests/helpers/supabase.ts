import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_LOCAL_URL ?? 'http://localhost:54321';
const ANON = process.env.SUPABASE_LOCAL_ANON_KEY!;
const SERVICE = process.env.SUPABASE_LOCAL_SERVICE_KEY!;

export function anonClient(): SupabaseClient {
  return createClient(URL, ANON, { auth: { persistSession: false } });
}

export function serviceClient(): SupabaseClient {
  return createClient(URL, SERVICE, { auth: { persistSession: false } });
}

// Crea un usuario confirmado y devuelve un cliente autenticado como él
export async function signUpUser(email: string, password = 'test1234!') {
  const admin = serviceClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;

  const client = anonClient();
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  return { client, userId: data.user.id, admin };
}
