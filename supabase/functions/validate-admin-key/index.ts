import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidateKeyRequest {
  key: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { key }: ValidateKeyRequest = await req.json();

    if (!key) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Key is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const adminKey = Deno.env.get('ADMIN_ACCESS_KEY');
    
    if (!adminKey) {
      console.error('ADMIN_ACCESS_KEY not configured');
      return new Response(
        JSON.stringify({ valid: false, error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const isValid = key === adminKey;
    
    // Generate a session token if valid (simple approach using timestamp + key hash)
    let sessionToken = null;
    if (isValid) {
      const timestamp = Date.now();
      const encoder = new TextEncoder();
      const data = encoder.encode(`${timestamp}-${adminKey}`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      sessionToken = `${timestamp}-${hashHex.slice(0, 32)}`;
    }

    console.log(`Admin key validation: ${isValid ? 'SUCCESS' : 'FAILED'}`);

    return new Response(
      JSON.stringify({ 
        valid: isValid,
        sessionToken: sessionToken,
        expiresAt: isValid ? Date.now() + (24 * 60 * 60 * 1000) : null // 24 hours
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error validating admin key:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});