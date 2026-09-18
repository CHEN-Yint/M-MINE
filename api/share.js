export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { data, ttlHours = 24 } = body || {};
    if (!data) return new Response(JSON.stringify({ error: '缺少数据' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });

    const id = Math.random().toString(36).slice(2, 10);
    await env.KV.put(`share:${id}`, JSON.stringify(data), { expirationTtl: ttlHours * 3600 });

    return new Response(JSON.stringify({ id, expiresInHours: ttlHours }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const burn = url.searchParams.get('burn');
    if (!id) return new Response(JSON.stringify({ error: '缺少 id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const raw = await env.KV.get(`share:${id}`);
    if (!raw) return new Response(JSON.stringify({ error: '链接已过期或被查看过' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

    if (burn === '1') await env.KV.delete(`share:${id}`);

    return new Response(JSON.stringify({ data: JSON.parse(raw) }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
