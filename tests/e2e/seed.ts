import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const email = process.env.E2E_USER_EMAIL ?? 'e2e@test.local';
const password = process.env.E2E_USER_PASSWORD ?? 'test1234!';

async function main() {
  const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error && !error.message.includes('already')) throw error;
  console.log('seed ok:', email);
}

main();
