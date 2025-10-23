import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
    const redirectUri = `${new URL(req.url).origin}/spotify-callback`;
    
    const scope = 'user-read-private user-read-email user-library-read user-top-read user-read-recently-played playlist-read-private playlist-read-collaborative streaming';
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId!,
      scope: scope,
      redirect_uri: redirectUri,
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

    return new Response(JSON.stringify({ authUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in spotify-login:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
