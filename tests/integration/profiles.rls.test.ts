import { describe, it, expect } from 'vitest';
import { signUpUser, serviceClient } from '../helpers/supabase';

const uniq = () => `user_${Math.floor(performance.now())}_${process.pid}@test.local`;

describe('RLS de profiles', () => {
  it('un usuario puede leer su propio profile', async () => {
    const { client, userId } = await signUpUser(uniq());
    const { data, error } = await client.from('profiles').select('*').eq('id', userId).single();
    expect(error).toBeNull();
    expect(data?.id).toBe(userId);
  });

  it('un usuario NO puede leer el profile de otro', async () => {
    const a = await signUpUser(uniq());
    const b = await signUpUser(uniq());
    const { data } = await a.client.from('profiles').select('*').eq('id', b.userId);
    expect(data).toEqual([]); // RLS oculta filas ajenas: 0 resultados
  });

  it('un cliente NO puede auto-promoverse a admin', async () => {
    const { client, userId } = await signUpUser(uniq());
    const { error } = await client.from('profiles').update({ role: 'admin' }).eq('id', userId);
    // la política with_check rechaza el cambio de rol
    const { data } = await serviceClient()
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    expect(data?.role).toBe('cliente');
    expect(error).not.toBeNull();
  });

  it('nuevo usuario obtiene rol cliente por el trigger', async () => {
    const { userId } = await signUpUser(uniq());
    const { data } = await serviceClient()
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    expect(data?.role).toBe('cliente');
  });
});
