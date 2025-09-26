import { supabase } from '@/integrations/supabase/client';

// Admin client that routes operations through edge function with service role
export class AdminClient {
  async select(table: string, orderBy?: { column: string; ascending: boolean }) {
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: { operation: 'select', table, orderBy }
    });

    if (error) throw error;
    return data;
  }

  async insert(table: string, data: any) {
    const { data: result, error } = await supabase.functions.invoke('admin-operations', {
      body: { operation: 'insert', table, data }
    });

    if (error) throw error;
    return result;
  }

  async update(table: string, id: string, data: any) {
    const { data: result, error } = await supabase.functions.invoke('admin-operations', {
      body: { operation: 'update', table, id, data }
    });

    if (error) throw error;
    return result;
  }

  async delete(table: string, id: string) {
    const { data: result, error } = await supabase.functions.invoke('admin-operations', {
      body: { operation: 'delete', table, id }
    });

    if (error) throw error;
    return result;
  }

  async upsert(table: string, data: any) {
    const { data: result, error } = await supabase.functions.invoke('admin-operations', {
      body: { operation: 'upsert', table, data }
    });

    if (error) throw error;
    return result;
  }
}

export const adminClient = new AdminClient();