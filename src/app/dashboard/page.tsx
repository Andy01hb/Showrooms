import { createClient } from '@/lib/supabase/server';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', userData.user?.id ?? '')
    .single();

  return (
    <main style={{ padding: 32 }}>
      <h1>Dashboard</h1>
      <p>Sesión: {userData.user?.email}</p>
      <p>Rol: {profile?.role ?? 'desconocido'}</p>
    </main>
  );
}
