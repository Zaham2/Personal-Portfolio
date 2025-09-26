import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation, table, data, id, orderBy } = await req.json();
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Admin operation: ${operation} on table: ${table}`);

    let result;

    switch (operation) {
      case 'select':
        if (orderBy) {
          result = await supabaseAdmin
            .from(table)
            .select('*')
            .order(orderBy.column, { ascending: orderBy.ascending });
        } else {
          result = await supabaseAdmin
            .from(table)
            .select('*');
        }
        break;

      case 'insert':
        result = await supabaseAdmin
          .from(table)
          .insert([data])
          .select()
          .single();
        break;

      case 'update':
        result = await supabaseAdmin
          .from(table)
          .update(data)
          .eq('id', id)
          .select()
          .single();
        break;

      case 'delete':
        result = await supabaseAdmin
          .from(table)
          .delete()
          .eq('id', id);
        break;

      case 'upsert':
        // For personal_info table which might not have existing records
        const { data: existing } = await supabaseAdmin
          .from(table)
          .select('*')
          .maybeSingle();
        
        if (existing) {
          result = await supabaseAdmin
            .from(table)
            .update(data)
            .eq('id', existing.id)
            .select()
            .single();
        } else {
          result = await supabaseAdmin
            .from(table)
            .insert([data])
            .select()
            .single();
        }
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    if (result.error) {
      console.error('Supabase error:', result.error);
      throw result.error;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-operations function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});