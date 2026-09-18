import { kv } from '@vercel/kv';

export default async function handler(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	if (req.method === 'OPTIONS') return res.status(200).end();

	// ---------- 生成分享 ----------
	if (req.method === 'POST') {
		const { data, burn = false, ttlHours = 24 } = req.body || {};
		if (!data) return res.status(400).json({ error: '缺少数据' });

		const id = Math.random().toString(36).slice(2, 10);

		// 存入 Vercel KV，设置过期时间（默认24小时）
		await kv.set(`share:${id}`, JSON.stringify(data), { ex: ttlHours * 3600 });

		return res.json({ id, expiresInHours: ttlHours });
	}

	// ---------- 读取分享 ----------
	if (req.method === 'GET') {
		const { id, burn } = req.query;
		if (!id) return res.status(400).json({ error: '缺少 id' });

		const raw = await kv.get(`share:${id}`);
		if (!raw) return res.status(404).json({ error: '链接已过期或被查看过' });

		// ★ 阅后即焚核心逻辑：读取后立刻删除
		if (burn === '1') {
			await kv.del(`share:${id}`);
		}

		return res.json({ data: JSON.parse(raw) });
	}

	return res.status(405).json({ error: 'Method Not Allowed' });
}
