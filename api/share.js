export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    // 处理跨域预检
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // 路由：匹配 /api/share
    if (url.pathname === '/api/share') {
      // ---------- 生成分享 (POST) ----------
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const { data, ttlHours = 24 } = body || {};
          if (!data) return new Response(JSON.stringify({ error: '缺少数据' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

          const id = Math.random().toString(36).slice(2, 10);
          await env.KV.put(`share:${id}`, JSON.stringify(data), { expirationTtl: ttlHours * 3600 });

          return new Response(JSON.stringify({ id, expiresInHours: ttlHours }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      // ---------- 读取分享 (GET) ----------
      if (request.method === 'GET') {
        try {
          const id = url.searchParams.get('id');
          const burn = url.searchParams.get('burn');
          if (!id) return new Response(JSON.stringify({ error: '缺少 id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

          const raw = await env.KV.get(`share:${id}`);
          if (!raw) return new Response(JSON.stringify({ error: '链接已过期或被查看过' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

          // ★ 阅后即焚逻辑
          if (burn === '1') await env.KV.delete(`share:${id}`);

          return new Response(JSON.stringify({ data: JSON.parse(raw) }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
}
