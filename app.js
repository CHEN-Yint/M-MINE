/* ============================================================
   IndexedDB 封装（用于存放大数据：作品、草稿）
   容量：通常 250MB ~ 几 GB，远超 localStorage 的 5MB
   ============================================================ */
const IDB_NAME = 'mmine_db';
const IDB_VERSION = 1;
const IDB_STORE = 'kv';

let _idbPromise = null;
function getIDB() {
  if (_idbPromise) return _idbPromise;
  _idbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error('浏览器不支持 IndexedDB')); return; }
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
  return _idbPromise;
}

async function idbGet(key) {
  try {
    const db = await getIDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (e) { console.warn('idbGet 失败', e); return undefined; }
}

async function idbSet(key, value) {
  try {
    const db = await getIDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const req = tx.objectStore(IDB_STORE).put(value, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) { console.warn('idbSet 失败', e); return false; }
}

async function idbDelete(key) {
  try {
    const db = await getIDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const req = tx.objectStore(IDB_STORE).delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) { return false; }
}

function supportsFlexGap() {
  var flex = document.createElement('div');
  flex.style.position = 'absolute';
  flex.style.visibility = 'hidden';
  flex.style.display = 'flex';
  flex.style.flexDirection = 'column';
  flex.style.rowGap = '1px';
  flex.appendChild(document.createElement('div'));
  flex.appendChild(document.createElement('div'));
  document.body.appendChild(flex);
  var supported = flex.scrollHeight === 1;
  flex.parentNode.removeChild(flex);
  return supported;
}
if (document.body && supportsFlexGap()) {
  document.documentElement.classList.add('supports-flex-gap');
}

function flattenTraitPairs(pairs) {
  var list = [];
  for (var i = 0; i < pairs.length; i++) {
    var row = pairs[i] || [];
    for (var j = 0; j < row.length; j++) list.push(row[j]);
  }
  return list;
}

const STORAGE_KEY = 'personal_gallery_v2';
const USER_KEY = 'personal_gallery_user_v2';
const FRIENDS_KEY = 'personal_gallery_ai_friends_v1';

const DEFAULT_USER = {
  username: 'M-MINE',
  bio: '今天开始记录生活',
  avatar: '',
  banner: ''
};

const DEFAULT_DATA = {
  works: [],
  theme: 'default',
  aiFriends: null,
  collectedWorks: [],
  drafts: []
};

const DEFAULT_THEME = 'default';

const THEMES = {
  default: {
    '--bg-main': '#FFFFFF', '--text-primary': '#000000', '--text-secondary': '#8E8E93',
    '--accent': '#000000', '--divider': '#E5E5EA', '--border': '#D1D1D6', '--top-atmosphere': '#F2F2F7',
    '--view-accent': '#E0E0E0'
  },
  barbie: {
    '--bg-main': '#FFF0F5', '--text-primary': '#8B2E52', '--text-secondary': '#C77B9E',
    '--accent': '#FF69B4', '--divider': '#F5D9E2', '--border': '#EAC3D0', '--top-atmosphere': '#FBE3EC',
    '--view-accent': '#FF69B4'
  },
  baby: {
    '--bg-main': '#F0F7FF', '--text-primary': '#1E4A6E', '--text-secondary': '#7BA8C7',
    '--accent': '#5BA3D9', '--divider': '#D6E5F2', '--border': '#C2D6E8', '--top-atmosphere': '#E2EDF8',
    '--view-accent':'#5BA3D9'
  },
  grass: {
    '--bg-main': '#F2FAF0', '--text-primary': '#2D4A2A', '--text-secondary': '#7BA876',
    '--accent': '#4CAF50', '--divider': '#DCEBD8', '--border': '#C6DCC1', '--top-atmosphere': '#E5F1E2',
    '--view-accent': '#4CAF50'
  },
  lemon: {
    '--bg-main': '#FFFDF0', '--text-primary': '#6B5A1E', '--text-secondary': '#B5A560',
    '--accent': '#F5C518', '--divider': '#F4ECCC', '--border': '#EAE0B0', '--top-atmosphere': '#FBF5DC',
    '--view-accent':'#F5C518'
  },
  lavender: {
    '--bg-main': '#F8F7FA', '--text-primary': '#4A4066', '--text-secondary': '#8C829E',
    '--accent': '#9B7EBD', '--divider': '#EBE9F0', '--border': '#DCD7E5', '--top-atmosphere': '#F4F1F8',
    '--view-accent':'#9B7EBD'
  },
  red: {
    '--bg-main': '#FFFFFF', '--text-primary': '#A31D1D', '--text-secondary': '#C77E7E',
    '--accent': '#D32F2F', '--divider': '#F5D9D9', '--border': '#EAC3C3', '--top-atmosphere': '#FFEBEE',
    '--view-accent':'#D32F2F'
  },
  brown: {
    '--bg-main': '#FAF7F2', '--text-primary': '#5D4037', '--text-secondary': '#8D786C',
    '--accent': '#A1887F', '--divider': '#EFE6DC', '--border': '#DDD0C4', '--top-atmosphere': '#F5EFE6',
    '--view-accent': '#A1887F'
  }
};

const THEMES_PIXEL = {
  // ── 第一排 ──
  'pixel-bluepink': {
    '--bg-main': '#E3F2FD', '--text-primary': '#0D47A1', '--text-secondary': '#5472D2',
    '--accent': '#FF4081', '--divider': '#BBDEFB', '--border': '#0D47A1', '--top-atmosphere': '#F0F8FF',
    '--view-accent': '#FF4081'
  },
  'pixel-pinkpurple': {
    '--bg-main': '#FCE4EC', '--text-primary': '#4A148C', '--text-secondary': '#BA68C8',
    '--accent': '#E040FB', '--divider': '#F8BBD0', '--border': '#4A148C', '--top-atmosphere': '#FCE4EC',
    '--view-accent': '#E040FB'
  },
  'pixel-greenyellow': {
    '--bg-main': '#F9FBE7', '--text-primary': '#33691E', '--text-secondary': '#689F38',
    '--accent': '#FFEB3B', '--divider': '#F0F4C3', '--border': '#33691E', '--top-atmosphere': '#F9FBE7',
    '--view-accent': '#FFEB3B'
  },
  'pixel-mintchoco': {
    '--bg-main': '#E0F2F1', '--text-primary': '#3E2723', '--text-secondary': '#8D6E63',
    '--accent': '#8D6E63', '--divider': '#B2DFDB', '--border': '#3E2723', '--top-atmosphere': '#E0F2F1',
    '--view-accent': '#8D6E63'
  },
  'pixel-bluered': {
    '--bg-main': '#13294B', '--text-primary': '#F5EFE0', '--text-secondary': '#8FA8CC',
    '--accent': '#C8102E', '--divider': '#1E3E6B', '--border': '#F5EFE0', '--top-atmosphere': '#0A1A33',
    '--view-accent': '#C8102E'
  },
  'pixel-blackpurple': {
    '--bg-main': '#1A1A1A', '--text-primary': '#FFFFFF', '--text-secondary': '#B0BEC5',
    '--accent': '#9C27B0', '--divider': '#333333', '--border': '#FFFFFF', '--top-atmosphere': '#121212',
    '--view-accent': '#9C27B0'
  },
  'pixel-blueorange': {
    '--bg-main': '#2B0A0A', '--text-primary': '#F5E6C8', '--text-secondary': '#B08A5C',
    '--accent': '#D4AF37', '--divider': '#3D1414', '--border': '#D4AF37', '--top-atmosphere': '#1A0505',
    '--view-accent': '#D4AF37'
  },
'pixel-default': {
    '--bg-main': '#FFFFFF', '--text-primary': '#000000', '--text-secondary': '#6B6560',
    '--accent': '#000000', '--divider': '#D4CFC5', '--border': '#000000', '--top-atmosphere': '#F5F5F5',
    '--view-accent': '#E0E0E0'
  }
};
function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) { saveUser(DEFAULT_USER); return Object.assign({}, DEFAULT_USER); }
    const parsed = JSON.parse(raw);
    return {
      username: typeof parsed.username === 'string' ? parsed.username : DEFAULT_USER.username,
      bio: typeof parsed.bio === 'string' ? parsed.bio : DEFAULT_USER.bio,
      avatar: typeof parsed.avatar === 'string' ? parsed.avatar : '',
      banner: typeof parsed.banner === 'string' ? parsed.banner : ''
    };
  } catch (e) { return Object.assign({}, DEFAULT_USER); }
}
function saveUser(u) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(u)); }
  catch (e) { console.warn('user 写入失败', e);
if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      showToast('存储空间不足！背景图片过大，请换一张小图或压缩后再试');	
	}
   }
}

/* 数据加载：优先 IndexedDB，兼容 localStorage 老数据迁移 */
async function loadData() {
  // 1. 尝试从 IndexedDB 读
  let parsed = await idbGet(STORAGE_KEY);

  // 2. 如果 IndexedDB 没有，检查 localStorage 是否有老数据（自动迁移）
  if (!parsed) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        parsed = JSON.parse(raw);
        await idbSet(STORAGE_KEY, parsed);
        localStorage.removeItem(STORAGE_KEY); // 迁移后清空 localStorage
        console.log('[迁移] 老数据已从 localStorage 迁移到 IndexedDB');
      }
    } catch (e) {}
  }

  // 3. 全新用户
  if (!parsed) {
    parsed = Object.assign({}, DEFAULT_DATA);
    await idbSet(STORAGE_KEY, parsed);
    return parsed;
  }

  // 4. 数据迁移/兼容（保持原有逻辑）
  let migrated = false;
  if (!Array.isArray(parsed.works)) { parsed.works = []; migrated = true; }
  if (typeof parsed.theme !== 'string' || (!THEMES[parsed.theme] && !THEMES_PIXEL[parsed.theme])) {
    parsed.theme = DEFAULT_THEME; migrated = true;
  }
  if (!Array.isArray(parsed.collectedWorks)) { parsed.collectedWorks = []; migrated = true; }
  if (!Array.isArray(parsed.drafts)) { parsed.drafts = []; migrated = true; }
  parsed.works = parsed.works.map(w => {
    if (typeof w.likes !== 'number') { w.likes = Math.floor(42 * (0.8 + Math.random() * 0.4)); migrated = true; }
    if (typeof w.userLiked !== 'boolean') { w.userLiked = false; migrated = true; }
    if (typeof w.collected !== 'boolean') { w.collected = false; migrated = true; }
    if (!w.displayDate) { w.displayDate = formatDateLabel(w.timestamp); migrated = true; }
    if (!w.aspectRatio) { w.aspectRatio = '1:1'; migrated = true; }
    if (!Array.isArray(w.categories)) {
      w.categories = (typeof w.category === 'string' && w.category) ? [w.category] : [];
      delete w.category; migrated = true;
    }
    if (!Array.isArray(w.replies)) { w.replies = []; migrated = true; }
    if (w.aiComments && w.aiComments.length) {
      w.aiComments = w.aiComments.map(c => {
        if (typeof c.avatarIsImage !== 'boolean') { c.avatarIsImage = false; migrated = true; }
        if (typeof c.commentId !== 'string') { c.commentId = 'c-' + uid(); migrated = true; }
        return c;
      });
    }
    if (!w.aiComments || !w.aiComments.length) {
      w.aiComments = pickCommentsForWork(w); migrated = true;
    }
    return w;
  });
  const realCollected = parsed.works.filter(w => w.collected === true).map(w => w.id);
  if (JSON.stringify(realCollected) !== JSON.stringify(parsed.collectedWorks)) {
    parsed.collectedWorks = realCollected; migrated = true;
  }
  if (migrated) await idbSet(STORAGE_KEY, parsed);
  return parsed;
}

/* 数据保存：异步写入 IndexedDB，绝不阻塞 UI */
function saveData(d) {
  const collectedIds = (d.works || []).filter(w => w.collected === true).map(w => w.id);
  const payload = {
    works: d.works || [],
    theme: d.theme || DEFAULT_THEME,
    aiFriends: d.aiFriends || null,
    collectedWorks: collectedIds,
    drafts: Array.isArray(d.drafts) ? d.drafts : []
  };
  idbSet(STORAGE_KEY, payload).then(ok => {
    if (!ok) console.warn('⚠️ IndexedDB 写入失败');
  });
}

function applyTheme(themeKey) {
  const root = document.documentElement;
  const style = root.dataset.style || 'default';
  const isPixel = style === 'pixel';
  const themeSet = isPixel ? THEMES_PIXEL : THEMES;
  
  let safe = themeSet[themeKey] ? themeKey : (isPixel ? 'pixel-default' : DEFAULT_THEME);
  const theme = themeSet[safe];
  Object.keys(theme).forEach(k => root.style.setProperty(k, theme[k]));
  
  if (typeof appData !== 'undefined' && appData) {
    appData.theme = safe;
    try { saveData(appData); } catch (e) {}
  }
}

function formatDateLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((today - target) / 86400000);
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
function formatDateLong(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${h}:${m}`;
}

/* ============================================================
   AI 朋友与评论系统
   ============================================================ */

const DEFAULT_AI_FRIENDS = [
  { id: 'f1', name: '高冷学哥',   avatarEmoji: '🎧', avatarImage: '', style: 'cool',   traits: [], identity: '', customIdentity: '' },
  { id: 'f2', name: '温柔邻居',   avatarEmoji: '☕', avatarImage: '', style: 'warm',   traits: [], identity: '', customIdentity: '' },
  { id: 'f3', name: '安静的朋友', avatarEmoji: '🌿', avatarImage: '', style: 'quiet',  traits: [], identity: '', customIdentity: '' },
  { id: 'f4', name: '话痨学姐',   avatarEmoji: '📚', avatarImage: '', style: 'talk',   traits: [], identity: '', customIdentity: '' },
  { id: 'f5', name: '点赞狂魔',   avatarEmoji: '❤️', avatarImage: '', style: 'praise', traits: [], identity: '', customIdentity: '' },
  { id: 'f6', name: '文艺诗人',   avatarEmoji: '🎨', avatarImage: '', style: 'art',    traits: [], identity: '', customIdentity: '' }
];

const TRAIT_PAIRS = [
  ['温柔', '高冷'], ['安静', '话痨'], ['热情', '冷淡'], ['毒舌', '暖言'], ['文艺', '直白'],
  ['Bking', '土纯']
];

const IDENTITY_OPTIONS = ['邻居','最好友','学哥','学姐','同事','发小','网友','普通朋友'];

const EMOJI_OPTIONS = ['🎧','☕','🌿','📚','❤️','🎨','🍀','🌙','⭐','🎵','💬','🐱'];

/* 分类评论池（已去除所有视觉细节，避免图文不符穿帮） */
const COMMENT_POOLS = {
  游戏: [
    ['这波操作可以啊。', '下一把可以试试换个思路。'],
    ['这波我看了两遍。', '下次教教我。'],
    ['看得出你花了不少心思。', '有意思。'],
    ['这个我喜欢。', '继续保持。'],
    ['今天营业质量很高。', '这波不亏。'],
    ['可以啊。', '有点东西。'],
    ['这波属于意料之外。', '哈哈可以。'],
    ['玩得挺细。', '我看懂了。'],
    ['这段操作有点东西。', '再练练就无敌了。'],
    ['看得出你很有想法。', '审美在线。'],
    ['这个选择不错。', '我懂你的点。'],
    ['日常营业质量很高。', '继续保持。']
  ],
  人物: [
    ['状态不错。', '这张我喜欢。'],
    ['这个瞬间值得留下来。', '继续记录吧。'],
    ['今天状态很好。', '继续保持这个能量。'],
    ['这张我看了好久。', '这个调调很你。'],
    ['看得出来你今天心情不错。', '挺好的。'],
    ['这个瞬间我很喜欢。', '拍得不错。'],
    ['今天这身搭配可以。', '细节在线。'],
    ['这张挺有感觉的。', '我很喜欢。'],
    ['看得出来你最近状态不错。', '继续保持。'],
    ['这个瞬间挺打动我的。', '很共鸣。'],
    ['你这张挺特别的。', '很有氛围。'],
    ['这张挺有故事感的。', '我很喜欢。']
  ],
  美食: [
    ['看着就香。', '在哪家？'],
    ['这谁顶得住，我馋了。', '下次带我一个。'],
    ['这个我喜欢。', '手艺见长。'],
    ['就这一份够吃吗？', '再加一杯就完美了。'],
    ['看着就很舒服。', '我馋了。'],
    ['这个做法有点意思。', '自己研究的？'],
    ['看起来很有灵魂。', '有被治愈到。'],
    ['这份量很实在。', '在哪吃的？'],
    ['这个我喜欢。', '会吃。'],
    ['看着就很下饭。', '下次我也去试试。'],
    ['这种搭配我第一次见。', '有点好奇。'],
    ['这一餐挺用心的。', '幸福。']
  ],
  风景: [
    ['这个地方我喜欢。', '让人静下来。'],
    ['这张我可以当壁纸吗？', '喜欢这种安静的力量。'],
    ['这个视角选得很好。', '有在认真取景。'],
    ['这张让我很放松。', '那一刻应该很舒服吧。'],
    ['这个我喜欢。', '很有层次感。'],
    ['这种感觉很珍贵。', '抓得好。'],
    ['这种表达很妙。', '有余韵。'],
    ['很喜欢这种不喧闹的美。', '让人静下来。'],
    ['这个地方我记下了。', '下次也想去看看。'],
    ['这张很有电影感。', '我很喜欢。'],
    ['我很喜欢这张。', '有一种说不出的舒服。'],
    ['这张让我想起了远方。', '很想出发。']
  ],
  情绪: [
    ['辛苦了，早点休息。', '今天不容易，明天会好一点。'],
    ['看到这张想说点什么。', '抱抱，会过去的。'],
    ['今天状态很好啊，替你开心。', '继续保持这个能量。'],
    ['有时候不用说话，发张图就够了。', '我懂。'],
    ['这种心情我懂。', '不用解释。'],
    ['有些日子就是需要慢慢过。', '别太着急。'],
    ['看到这张突然安静下来。', '谢谢你分享。'],
    ['这种感觉说不清楚，但我懂。', '会好的。'],
    ['允许自己慢一点。', '没关系的。'],
    ['这张让我也想发点什么了。', '很有共鸣。'],
    ['心里那块被触到了。', '抱抱。'],
    ['什么都不用说，我都懂。', '会好起来的。']
  ],
  日常: [
    ['生活里这些碎片，拼起来就是完整的你。', '日常感拉满。'],
    ['可以啊，今天营业质量很高。', '这张让我想起了什么。'],
    ['就这么随手一拍，也很有味道。', '你拍的东西总有一种安静的力量。'],
    ['这些瞬间，其实最值得留下来。', '继续记录吧。'],
    ['这张挺有生活感的。', '喜欢这种真实。'],
    ['看得出来你最近过得挺充实。', '继续保持。'],
    ['这种日常碎片最动人。', '很治愈。'],
    ['每天记录一点点，回头看会很惊喜。', '继续。'],
    ['这张让我想起自己的某个瞬间。', '很共鸣。'],
    ['平淡里有光。', '喜欢。'],
    ['这种不经意的瞬间最美。', '拍得好。'],
    ['记录本身就是一件温柔的事。', '继续吧。']
  ]
};

/* 组合式生成器（30%概率随机生成单条评论，防止重复） */
const COMMENT_COMBOS = {
  游戏: {
    openers: ['这张', '这一波', '这波操作', '这段'],
    cores: ['看得出来下了功夫', '有点东西', '质感很在线', '很有意思', '抓得很到位', '审美很不错', '细节挺到位', '氛围感拉满'],
    closers: ['。', '，我看了两遍。', '，继续保持。', '，我懂。', '，懂的都懂。', '，我馋了。']
  },
  人物: {
    openers: ['这张', '这个角度', '这个瞬间', '这一张'],
    cores: ['拍得很松弛', '很有画面感', '很有故事感', '很舒服', '状态很在线', '氛围感很足', '挺有电影感的', '感觉很自然'],
    closers: ['。', '，喜欢。', '，我看了好久。', '，可以当头像。', '，很高级。', '，继续保持。']
  },
  美食: {
    openers: ['这个', '这一份', '这餐', '这一桌'],
    cores: ['看着就香', '很有食欲', '有讲究', '很有灵魂', '看着很治愈', '分量很实在', '颜色很诱人', '很会拍'],
    closers: ['。', '，在哪家？', '，馋了。', '，下次带我一个？', '，手艺见长。', '，我馋了。']
  },
  风景: {
    openers: ['这张', '这个地方', '这个视角', '这一片'],
    cores: ['很舒服', '构图很稳', '很有层次感', '很有余韵', '很有电影感', '安静又有力量', '很让人放松', '抓得很准'],
    closers: ['。', '，喜欢。', '，可以当壁纸吗？', '，我也想去了。', '，让人静下来。', '，我很喜欢。']
  },
  情绪: {
    openers: ['这张', '看到这张', '这一刻', '这个瞬间'],
    cores: ['让我想安静下来', '很有共鸣', '心里被触到了', '我懂这种感觉', '说不出但很有力量', '想给你一个拥抱', '很有温度', '突然想到很多'],
    closers: ['。', '，辛苦了。', '，会好的。', '，抱抱。', '，别太着急。', '，我都懂。']
  },
  日常: {
    openers: ['这张', '这个瞬间', '这一张', '这样的日常'],
    cores: ['很有生活感', '平淡但有光', '很治愈', '很真实', '很打动我', '很不经意但很美', '很温柔', '很有味道'],
    closers: ['。', '，喜欢。', '，继续记录吧。', '，很共鸣。', '，拍得好。', '，继续保持。']
  }
};

function generateRandomComment(cat) {
  const pool = COMMENT_COMBOS[cat] || COMMENT_COMBOS['日常'];
  const o = pool.openers[Math.floor(Math.random() * pool.openers.length)];
  const c = pool.cores[Math.floor(Math.random() * pool.cores.length)];
  const e = pool.closers[Math.floor(Math.random() * pool.closers.length)];
  return o + c + e;
}

const KEYWORD_RULES = [
  { keys: ['游戏', '捏人', 'sims', '角色', '战绩', '抽卡', '出货'], cat: '游戏' },
  { keys: ['自拍', '人物', '状态', '街拍'], cat: '人物' },
  { keys: ['美食', '吃', '咖啡', '饭', '餐'], cat: '美食' },
  { keys: ['风景', '旅行', '山', '海', '天空'], cat: '风景' },
  { keys: ['累', '加班', '睡不着', '感慨'], cat: '情绪' }
];

function detectCommentCategory(work) {
  const caption = String(work.caption || '').toLowerCase();
  for (const r of KEYWORD_RULES) {
    if (r.keys.some(k => caption.indexOf(k.toLowerCase()) !== -1)) return r.cat;
  }
  const cats = Array.isArray(work.categories) ? work.categories : [];
  if (cats.length > 0) return cats[0];
  return '日常'; 
}

/* 新增：提取文案关键词 */
function extractKeywords(caption) {
  if (!caption) return [];
  const words = caption.split(/[\s,，。！？；：、\.\?\!]+/);
  const stopWords = ['今天', '昨天', '明天', '我', '你', '他', '她', '的', '了', '去', '在', '是', '很', '好', '感觉', '真的', '这个', '那个', '一个', '这', '那'];
  return words.filter(w => w.length >= 2 && !stopWords.includes(w)).slice(0, 3);
}
/* ---------- 性格与身份辅助函数 ---------- */
const EMOTIONAL_WORDS = /(好|太|很|超|绝了|绝|喜欢|可以|真|确实|蛮|挺|有点|尤其|最|老|贼)/g;
function removeEmotional(line) {
  if (!line) return line;
  let s = line.replace(EMOTIONAL_WORDS, '');
  s = s.replace(/^[，。、\s]+/, '').replace(/[，。、\s]+$/, '');
  return s || line;
}

const REVERSE_MAP = {
  '好': '差', '美': '丑', '绝了': '拉了', '绝': '烂', '可爱': '腻', '棒': '水',
  '赞': '踩', '强': '弱', '香': '一般', '馋': '饱', '羡慕': '无语', '在线': '掉线',
  '喜欢': '无感', '可以': '勉强', '舒服': '难受', '高级': '普通', '好看': '一般',
  '有意思': '没劲', '有味道': '没味', '治愈': '闹心', '温柔': '敷衍'
};
function reverseExpress(line) {
  if (!line) return line;
  for (const k in REVERSE_MAP) {
    if (line.indexOf(k) !== -1) return line.replace(new RegExp(k, 'g'), REVERSE_MAP[k]);
  }
  return '就这？' + line;
}

const POETIC_LINES = [
  '风停在窗台，像没说出口的话。',
  '此刻的安静，比语言更长久。',
  '光落下来的时候，时间也慢了。',
  '有些心情，只适合写在风里。',
  '远方的云，替我说了晚安。',
  '愿你被这世界温柔以待。'
];
function pickPoetic() {
  return POETIC_LINES[Math.floor(Math.random() * POETIC_LINES.length)];
}

function hasPersonalityTail(line) {
  return /[哦哈吧啦嘛][。]?$/.test(line) || /！$/.test(line);
}

function applyPersonality(lines, trait) {
  if (!trait || !lines.length) return lines;
  const last = lines.length - 1;
  switch (trait) {
    case '高冷':
      return [removeEmotional(lines[0])];
    case '话痨':
      return lines.map(l => l.replace(/[。！!？\?\s]*$/, '') + '！');
    case '温柔':
      return lines.map((l, i) => {
        const clean = l.replace(/[。！!？\?\s]*$/, '');
        return (i === last) ? clean + '，要好好照顾自己哦。' : clean + '。';
      });
    case '毒舌':
      return [reverseExpress(lines[0])].concat(lines.slice(1));
    case '文艺':
      return lines.map((l, i) => {
        const clean = l.replace(/[。！!？\?\s]*$/, '');
        return (i === last) ? clean + '，' + pickPoetic() : clean + '。';
      });
    case 'Bking':
      return lines.map((l, i) => {
        const clean = l.replace(/[。！!？\?\s]*$/, '');
        return (i === last) ? clean + '，也就还行吧。' : clean + '。';
      });
    case '土纯':
      return lines.map((l, i) => {
        const clean = l.replace(/[。！!？\?\s]*$/, '');
        return (i === last) ? clean + '，俺觉得挺好。' : clean + '。';
      });
    default:
      return lines;
  }
}

function applyIdentity(lines, identity) {
  if (!identity || !lines.length) return lines;

  const NEIGHBOR_TAILS = ['诶，', '话说，', '嘿，', '哎，', '看到这个，'];
  const CASUAL_TAILS = ['，下次一起吃', '，想你了', '，记得回我', '，最近怎么样', '，等你的下一条'];
  const XUEGE_TAILS = ['，期待你的下一条', '，会常来看', '，继续加油'];
  const XUEJIE_TAILS = ['，期待你的下一条', '，有空多发点', '，看着挺舒服', '，会常来看', '，继续加油'];

  if (['邻居', '同事', '普通朋友', '网友'].indexOf(identity) !== -1) {
    const prefix = NEIGHBOR_TAILS[Math.floor(Math.random() * NEIGHBOR_TAILS.length)];
    return lines.map(l => prefix + l);
  }

  if (['最好友', '发小'].indexOf(identity) !== -1) {
    const tail = CASUAL_TAILS[Math.floor(Math.random() * CASUAL_TAILS.length)];
    return lines.map((l, i) => {
      if (hasPersonalityTail(l)) return l;
      const clean = l.replace(/您/g, '你').replace(/[。！!？\?\s]*$/, '');
      return (i === lines.length - 1) ? clean + tail : clean + '。';
    });
  }

  if (['学哥', '学姐'].indexOf(identity) !== -1) {
    const pool = identity === '学姐' ? XUEJIE_TAILS : XUEGE_TAILS;
    const tail = pool[Math.floor(Math.random() * pool.length)];
    return lines.map((l, i) => {
      if (hasPersonalityTail(l)) return l;
      const clean = l.replace(/您/g, '你').replace(/[。！!？\?\s]*$/, '');
      return (i === lines.length - 1) ? clean + tail : clean + '。';
    });
  }

  return lines;
}

/* ---------- 评论生成核心 ---------- */
function pickCommentsForWork(work) {
  const cat = detectCommentCategory(work);
  const pool = COMMENT_POOLS[cat] || COMMENT_POOLS['日常'];
  const contentForKeywords = work.aiPrompt ? (work.aiPrompt + ' ' + (work.caption || '')) :   (work.caption || '');
  const keywords = extractKeywords(contentForKeywords); 
  const seedStr = (work.id || '') + '|' + (work.caption || '') + '|' + cat; 
  const seedNum = Array.from(seedStr).reduce((s, c) => s + c.charCodeAt(0), 0);

  const friends = (typeof aiFriends !== 'undefined' && Array.isArray(aiFriends)) ? aiFriends.slice() : [];
  if (!friends.length) return [];

  const ordered = friends
    .map((f, i) => ({ f, k: (seedNum + i * 7 + 3) % 1009 }))
    .sort((a, b) => a.k - b.k)
    .map(x => x.f);
  const count = Math.min(ordered.length, 2 + (seedNum % 2));
  const chosen = ordered.slice(0, count);

  const result = [];
  const startMinutes = [5, 3, 1];
  
  chosen.forEach((friend, fIdx) => {
    const trait = (Array.isArray(friend.traits) && friend.traits[0]) || '';
    const identity = friend.identity || '';

    let lines = [];
    
    // ★ 核心修改：如果有文案关键词，强行生成关联评论！
    if (keywords.length > 0) {
      const kw = keywords[Math.floor(Math.random() * keywords.length)];
      const templates = [
        `看到你说的“${kw}”，我也好感兴趣！`,
        `“${kw}”看起来真不错，下次带我一个？`,
        `关于“${kw}”，我觉得可以再多记录一点。`,
        `你写的“${kw}”让我想起了一些事。`,
        `“${kw}”确实是个好话题，我也喜欢。`
      ];
      lines = [templates[Math.floor(Math.random() * templates.length)]];
    } else {
      // 如果用户没写文案，才走原来的分类随机池
      const usePool = ((seedNum + fIdx * 3) % 10) < 7;
      if (usePool) {
        const gi = (seedNum + fIdx * 5 + 1) % pool.length;
        lines = pool[gi].slice();
      } else {
        lines = [generateRandomComment(cat)];
      }
    }

    lines = applyPersonality(lines, trait);
    lines = applyIdentity(lines, identity);

    let minutes = startMinutes[fIdx] || (5 - fIdx * 2);
    lines.forEach((line, lIdx) => {
      const m = Math.max(0, minutes - lIdx * 2);
      const timeLabel = m <= 0 ? '刚刚' : m + '分钟前';
      result.push({
        avatar: friend.avatarImage || friend.avatarEmoji,
        avatarIsImage: !!friend.avatarImage,
        nickname: friend.name,
        content: line,
        time: timeLabel,
        commentId: 'c-' + uid(),
        friendId: friend.id
      });
    });
  });
  return result;
}

function generateAIComments(work) { return pickCommentsForWork(work); }

function calcLikes() {
  return Math.floor(42 * (0.8 + Math.random() * 0.4));
}

const DEFAULT_AVATAR_SVG = `
  <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
    <circle cx="36" cy="36" r="36" fill="#E5E5EA"/>
    <circle cx="36" cy="29" r="11" fill="#FFFFFF"/>
    <path d="M14 64 C14 50, 24 44, 36 44 C48 44, 58 50, 58 64 Z" fill="#FFFFFF"/>
  </svg>`;

function loadAIFriends() {
  try {
    const raw = localStorage.getItem(FRIENDS_KEY);
    if (!raw) { saveAIFriends(DEFAULT_AI_FRIENDS); return JSON.parse(JSON.stringify(DEFAULT_AI_FRIENDS)); }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) { saveAIFriends(DEFAULT_AI_FRIENDS); return JSON.parse(JSON.stringify(DEFAULT_AI_FRIENDS)); }
    const flat = flattenTraitPairs(TRAIT_PAIRS);
    const cleaned = parsed.map((f, i) => ({
      id: typeof f.id === 'string' ? f.id : (DEFAULT_AI_FRIENDS[i] && DEFAULT_AI_FRIENDS[i].id) || ('f' + (i+1)),
      name: typeof f.name === 'string' ? f.name : (DEFAULT_AI_FRIENDS[i] && DEFAULT_AI_FRIENDS[i].name) || 'AI朋友',
      avatarEmoji: typeof f.avatarEmoji === 'string' ? f.avatarEmoji : '',
      avatarImage: typeof f.avatarImage === 'string' ? f.avatarImage : '',
      style: typeof f.style === 'string' ? f.style : '',
      traits: Array.isArray(f.traits) ? f.traits.filter(t => flat.indexOf(t) !== -1) : [],
      identity: typeof f.identity === 'string' ? f.identity : '',
      customIdentity: typeof f.customIdentity === 'string' ? f.customIdentity : ''
    }));
    saveAIFriends(cleaned);
    return cleaned;
  } catch (e) { return JSON.parse(JSON.stringify(DEFAULT_AI_FRIENDS)); }
}
function saveAIFriends(list) {
  try { localStorage.setItem(FRIENDS_KEY, JSON.stringify(list)); }
  catch (e) { console.warn('aiFriends 写入失败', e); }
}

/* ============================================================
   ★★★ 关键：变量声明顺序（aiFriends 必须在 appData 之前）
   ============================================================ */
let aiFriends = loadAIFriends();
let user = loadUser();
let appData= Object.assign({}, DEFAULT_DATA); 

/* ---------- 渲染 ---------- */
function renderUser() {
  const avatarEl = document.getElementById('avatar');
  if (!avatarEl) return;
  if (user.avatar) {
    avatarEl.innerHTML = `<img src="${user.avatar}" alt="avatar" />
      <div class="avatar-edit-hint">✎</div>
      <input type="file" id="avatar-input" accept="image/*" />`;
  } else {
    avatarEl.innerHTML = DEFAULT_AVATAR_SVG +
      `<div class="avatar-edit-hint">✎</div>
       <input type="file" id="avatar-input" accept="image/*" />`;
  }
  bindAvatarInput();
  document.getElementById('username').textContent = user.username;
  document.getElementById('bio').textContent = user.bio || '今天开始记录生活';
  applyBanner();
} 

function renderStats() {
  document.getElementById('stat-works').textContent = appData.works.length;
  document.getElementById('stat-friends').textContent = aiFriends.length;
  document.getElementById('stat-collected').textContent = appData.works.filter(w => w.collected === true).length;
}

let collectedOnly = false;

function bindStatClicks() {
  const friendsBtn = document.getElementById('stat-friends-btn');
  const collectedBtn = document.getElementById('stat-collected-btn');
  if (friendsBtn) {
    friendsBtn.addEventListener('click', () => {
      renderAIFriendsList();
      openModal('modal-ai');
    });
  }
  if (collectedBtn) {
    collectedBtn.addEventListener('click', () => {
      collectedOnly = !collectedOnly;
      collectedBtn.classList.toggle('active', collectedOnly);
      const fb = document.getElementById('stat-friends-btn');
      if (fb) fb.classList.remove('active');
      renderGallery();
      updateCollectedIndicator();
    });
  }
  const indicatorClose = document.getElementById('collected-indicator-close');
  if (indicatorClose) {
    indicatorClose.addEventListener('click', () => {
      collectedOnly = false;
      const cBtn = document.getElementById('stat-collected-btn');
      if (cBtn) cBtn.classList.remove('active');
      renderGallery();
      updateCollectedIndicator();
    });
  }
}

function updateCollectedIndicator() {
  const ind = document.getElementById('collected-indicator');
  if (!ind) return;
  ind.style.display = collectedOnly ? 'flex' : 'none';
}

function renderGallery() {
  const gallery = document.getElementById('gallery');
  const list = collectedOnly ? appData.works.filter(w => w.collected === true) : appData.works;
  if (!list.length) {
    gallery.classList.add('empty');
    const emptyTitle = collectedOnly ? '还没有收藏' : '还没有作品';
    const emptyHint = collectedOnly ? '在作品详情页点击收藏按钮' : '点击下方 · 添加第一张';
    gallery.innerHTML = `
      <div class="gallery-empty">
        <div class="gallery-empty-icon">⌖</div>
        <div class="gallery-empty-title">${emptyTitle}</div>
        <div class="gallery-empty-hint">${emptyHint}</div>
      </div>`;
    return;
  }
  gallery.classList.remove('empty');
  gallery.innerHTML = '';
  list.forEach((w, idx) => {
    const cover = (w.images && w.images[0]) || ''; 
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.id = w.id;
    item.innerHTML = `
      <img src="${cover}" alt="作品 ${idx + 1}" loading="lazy" />
      ${w.images && w.images.length > 1 ? `<div class="badge-multi">▦ ${w.images.length}</div>` : ''}
      <div class="badge-time">${escapeHtml(w.displayDate || formatDateLabel(w.timestamp))}</div>
    `;
    item.addEventListener('click', () => openDetail(w.id));
    gallery.appendChild(item);
  });
}

function renderAll() {
  renderUser();
  renderStats();
  renderGallery();
  updateCollectedIndicator();
}

function renderThemeSwatches() {
  const wrap = document.getElementById('theme-swatches');
  if (!wrap) return;
  const style = document.documentElement.dataset.style || 'default';
  const isPixel = style === 'pixel';
  const themeSet = isPixel ? THEMES_PIXEL : THEMES;
  const currentTheme = appData.theme || (isPixel ? 'pixel-default' : 'default');

  let html = '';
  for (const key in themeSet) {
    const theme = themeSet[key];
    const bg = theme['--bg-main'];
    const text = theme['--text-primary'];
    const isActive = currentTheme === key;
    html += `
      <button class="theme-swatch ${isActive ? 'active' : ''}" data-theme="${key}" type="button" title="${key}">
        <span class="theme-swatch-circle" style="--swatch-bg:${bg};--swatch-text:${text};"></span>
      </button>`;
  }
  wrap.innerHTML = html;

  wrap.querySelectorAll('.theme-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
      wrap.querySelectorAll('.theme-swatch').forEach(b => b.classList.toggle('active', b === btn));
    });
  });
}

function exportData() {
  const payload = {
    __version: 'personal_gallery_export_v1',
    exportedAt: new Date().toISOString(),
    user: user, appData: appData
  };
  openDataIoModal('export', JSON.stringify(payload, null, 2));
}
function openDataIoModal(mode, text) {
  const title = document.getElementById('data-io-title');
  const hint = document.getElementById('data-io-hint');
  const ta = document.getElementById('data-io-text');
  const confirm = document.getElementById('data-io-confirm');
  if (!ta) return;
  ta.value = text || '';
  ta.readOnly = mode === 'export';
  if (mode === 'export') {
    title.textContent = '导出数据';
    hint.textContent = '请长按选中下方文本，手动复制后自行保存。';
    confirm.style.display = 'none';
  } else {
    title.textContent = '导入数据';
    hint.textContent = '将备份文本粘贴到下方，再点确定。';
    confirm.style.display = '';
  }
  openModal('modal-data-io');
}
function applyImportedPayload(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('格式错误');
  const newAppData = parsed.appData || parsed;
  const newUser = parsed.user || user;
  if (!Array.isArray(newAppData.works)) throw new Error('缺少作品列表');
  if (!confirm('导入将覆盖当前所有数据，确定继续？')) return;
  user = {
    username: typeof newUser.username === 'string' ? newUser.username : DEFAULT_USER.username,
    bio: typeof newUser.bio === 'string' ? newUser.bio : DEFAULT_USER.bio,
    avatar: typeof newUser.avatar === 'string' ? newUser.avatar : '',
    banner: typeof newUser.banner === 'string' ? newUser.banner : ''
  };
    appData = {
    works: newAppData.works,
    theme: (THEMES[newAppData.theme] || THEMES_PIXEL[newAppData.theme]) ? newAppData.theme : DEFAULT_THEME,
    aiFriends: Array.isArray(newAppData.aiFriends) ? newAppData.aiFriends : null,
    collectedWorks: Array.isArray(newAppData.collectedWorks) ? newAppData.collectedWorks : [],
    drafts: Array.isArray(newAppData.drafts) ? newAppData.drafts : []
  };
  if (Array.isArray(appData.aiFriends) && appData.aiFriends.length) {
    aiFriends = appData.aiFriends;
    saveAIFriends(aiFriends);
  } else {
    aiFriends = loadAIFriends();
    appData.aiFriends = aiFriends;
  }
  saveUser(user); saveData(appData); applyTheme(appData.theme);
  closeModal('modal-data-io'); closeModal('modal-edit');
  renderAll(); showToast('导入成功');
}

function bindAvatarInput() {
  const input = document.getElementById('avatar-input');
  if (!input) return;
  input.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('请选择图片'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      user.avatar = ev.target.result;
      saveUser(user); renderUser(); showToast('头像已更新');
    };
    reader.readAsDataURL(file);
  });
}

function applyBanner() {
  const root = document.documentElement;
  if (user.banner) {
    root.style.setProperty('--user-banner', `url("${user.banner}")`);
    document.body.classList.add('has-banner');
  } else {
    root.style.setProperty('--user-banner', 'none');
    document.body.classList.remove('has-banner');
  }
}

function updateBannerThumb() {
  const thumb = document.getElementById('banner-thumb');
  if (!thumb) return;
  thumb.style.backgroundImage = user.banner ? `url(${user.banner})` : '';
}

function openModal(id) {
  const mask = document.getElementById(id);
  if (!mask) return;
  mask.classList.add('show');
  document.body.classList.add('no-scroll');
}
function closeModal(id) {
  const mask = document.getElementById(id);
  if (!mask) return;
  mask.classList.remove('show');
  document.body.classList.remove('no-scroll');
}

let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

function renderAIFriendsList() {
  const wrap = document.getElementById('ai-list');
  if (!wrap) return;
  wrap.innerHTML = aiFriends.map((f, idx) => {
    const avatarHtml = f.avatarImage
      ? `<img src="${escapeHtml(f.avatarImage)}" alt="" />`
      : escapeHtml(f.avatarEmoji);
    const traits = Array.isArray(f.traits) ? f.traits : [];
    const identity = typeof f.identity === 'string' ? f.identity : '';
    const traitRowsHtml = TRAIT_PAIRS.map((pair, pIdx) => {
      const btns = pair.map(t => {
        const active = traits.indexOf(t) >= 0;
        return `<button type="button" class="trait-pill ${active ? 'active' : ''}" data-trait-row="${pIdx}" data-trait="${escapeHtml(t)}">${escapeHtml(t)}</button>`;
      }).join('');
      return `<div class="trait-pair-row">${btns}</div>`;
    }).join('');
    const identityChipsHtml = IDENTITY_OPTIONS.map(opt => {
      const active = identity === opt;
      return `<button type="button" class="identity-pill ${active ? 'active' : ''}" data-identity="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`;
    }).join('');
    return `
      <div class="ai-row" data-idx="${idx}">
        <div class="ai-avatar">${avatarHtml}</div>
        <div class="ai-name">${escapeHtml(f.name)}</div>
        <button class="ai-edit-btn" data-edit="${idx}" aria-label="编辑">✎</button>
        <button class="ai-edit-btn" data-delete="${idx}" aria-label="删除" style="color:var(--danger);border-color:var(--danger);">🗑</button>
      </div>
      <div class="ai-edit-panel" data-panel="${idx}">
        <div class="ai-edit-title">编辑 ${escapeHtml(f.name)}</div>
        <div class="ai-avatar-row">
          <div class="ai-avatar-preview" id="ai-prev-${idx}">${avatarHtml}</div>
          <div style="flex:1;">
            <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px;">当前头像</div>
            <div style="font-size:12px;color:var(--text-secondary);">点击下方 Emoji 或上传图片</div>
          </div>
        </div>
        <div class="ai-emoji-grid" id="ai-emojis-${idx}">
          ${EMOJI_OPTIONS.map(e =>
            `<button class="ai-emoji-btn ${e === f.avatarEmoji && !f.avatarImage ? 'active' : ''}" data-emoji="${e}">${e}</button>`
          ).join('')}
        </div>
        <button class="ai-upload-btn" data-upload="${idx}">📷 上传自定义头像</button>
        <input type="file" data-file-input="${idx}" accept="image/*" style="display:none" />
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label">昵称</label>
          <input type="text" class="form-input" maxlength="10" value="${escapeHtml(f.name)}" data-name-input="${idx}" />
        </div>
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label">性格特征（选填，可多选）</label>
          <div class="trait-pairs" data-trait-pairs="${idx}">${traitRowsHtml}</div>
        </div>
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label">身份背景</label>
          <div class="identity-pills" data-identity-pills="${idx}">${identityChipsHtml}</div>
        </div>
        <div class="ai-edit-actions">
          <button class="btn" data-cancel="${idx}">取消</button>
          <button class="btn btn-primary" data-save="${idx}">保存</button>
        </div>
      </div>
    `;
  }).join('');

  aiFriends.forEach((f, idx) => {
    const panel = wrap.querySelector(`[data-panel="${idx}"]`);
    if (!panel) return;
    wrap.querySelector(`[data-edit="${idx}"]`).addEventListener('click', () => {
      const isOpen = panel.classList.contains('show');
      wrap.querySelectorAll('.ai-edit-panel.show').forEach(p => p.classList.remove('show'));
      if (!isOpen) panel.classList.add('show');
    });
    const delBtn = wrap.querySelector(`[data-delete="${idx}"]`);
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        if (aiFriends.length <= 1) { alert('至少保留一位朋友'); return; }
        if (!confirm('确定要删除这位朋友吗？')) return;
        aiFriends.splice(idx, 1);
        const cleanList = aiFriends.map(x => ({
          id: x.id, name: x.name, avatarEmoji: x.avatarEmoji, avatarImage: x.avatarImage, style: x.style,
          traits: Array.isArray(x.traits) ? x.traits : [],
          identity: typeof x.identity === 'string' ? x.identity : '',
          customIdentity: typeof x.customIdentity === 'string' ? x.customIdentity : ''
        }));
        saveAIFriends(cleanList); appData.aiFriends = cleanList; saveData(appData);
        renderAIFriendsList(); renderStats(); showToast('已删除');
      });
    }
    wrap.querySelector(`[data-cancel="${idx}"]`).addEventListener('click', () => panel.classList.remove('show'));
    wrap.querySelectorAll(`#ai-emojis-${idx} .ai-emoji-btn`).forEach(btn => {
      btn.addEventListener('click', () => {
        wrap.querySelectorAll(`#ai-emojis-${idx} .ai-emoji-btn`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        wrap.querySelector(`#ai-prev-${idx}`).innerHTML = btn.dataset.emoji;
      });
    });
    const traitWrap = wrap.querySelector(`[data-trait-pairs="${idx}"]`);
    if (traitWrap) {
      traitWrap.querySelectorAll('.trait-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const row = btn.dataset.traitRow;
          const sameRow = traitWrap.querySelectorAll(`.trait-pill[data-trait-row="${row}"]`);
          const wasActive = btn.classList.contains('active');
          sameRow.forEach(b => b.classList.remove('active'));
          if (!wasActive) btn.classList.add('active');
        });
      });
    }
    const idWrap = wrap.querySelector(`[data-identity-pills="${idx}"]`);
    if (idWrap) {
      idWrap.querySelectorAll('.identity-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          idWrap.querySelectorAll('.identity-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }
    const fileInput = wrap.querySelector(`[data-file-input="${idx}"]`);
    wrap.querySelector(`[data-upload="${idx}"]`).addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { showToast('请选择图片'); return; }
      if (file.size > 5 * 1024 * 1024) { showToast('图片不能超过 5MB'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        wrap.querySelector(`#ai-prev-${idx}`).innerHTML = `<img src="${ev.target.result}" alt="" />`;
        wrap.querySelectorAll(`#ai-emojis-${idx} .ai-emoji-btn`).forEach(b => b.classList.remove('active'));
        fileInput.dataset.dataUrl = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
    wrap.querySelector(`[data-save="${idx}"]`).addEventListener('click', () => {
      const nameInput = wrap.querySelector(`[data-name-input="${idx}"]`);
      const newName = nameInput.value.trim();
      if (!newName) { showToast('昵称不能为空'); return; }
      const oldId = aiFriends[idx].id;
      let newEmoji = '', newImage = '';
      if (fileInput.dataset.dataUrl) { newImage = fileInput.dataset.dataUrl; newEmoji = ''; }
      else {
        const activeEmoji = wrap.querySelector(`#ai-emojis-${idx} .ai-emoji-btn.active`);
        if (activeEmoji) { newEmoji = activeEmoji.dataset.emoji; newImage = ''; }
        else { newEmoji = aiFriends[idx].avatarEmoji; newImage = aiFriends[idx].avatarImage; }
      }
      const newTraits = [];
      if (traitWrap) {
        TRAIT_PAIRS.forEach((pair, pIdx) => {
          const activeBtn = traitWrap.querySelector(`.trait-pill.active[data-trait-row="${pIdx}"]`);
          if (activeBtn) newTraits.push(activeBtn.dataset.trait);
        });
      }
      let newIdentity = '';
      if (idWrap) {
        const activeId = idWrap.querySelector('.identity-pill.active');
        if (activeId) newIdentity = activeId.dataset.identity || '';
      }
      aiFriends[idx] = {
        id: oldId, name: newName, avatarEmoji: newEmoji, avatarImage: newImage,
        style: aiFriends[idx].style || '', traits: newTraits, identity: newIdentity, customIdentity: ''
      };
      const cleanList = aiFriends.map(x => ({
        id: x.id, name: x.name, avatarEmoji: x.avatarEmoji, avatarImage: x.avatarImage, style: x.style,
        traits: Array.isArray(x.traits) ? x.traits : [],
        identity: typeof x.identity === 'string' ? x.identity : '',
        customIdentity: typeof x.customIdentity === 'string' ? x.customIdentity : ''
      }));
      saveAIFriends(cleanList); appData.aiFriends = cleanList; saveData(appData);
      panel.classList.remove('show'); renderAIFriendsList(); showToast('已保存');
    });
  });
}

const newFriendState = { emoji: '😊', image: '', traits: [], identity: '' };

function initAddFriendPanel() {
  const emojiWrap = document.getElementById('new-friend-emojis');
  if (emojiWrap) {
    emojiWrap.innerHTML = EMOJI_OPTIONS.map(e =>
      `<button class="ai-emoji-btn ${e === newFriendState.emoji ? 'active' : ''}" data-emoji="${e}">${e}</button>`
    ).join('');
    emojiWrap.querySelectorAll('.ai-emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        emojiWrap.querySelectorAll('.ai-emoji-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        newFriendState.emoji = btn.dataset.emoji;
        newFriendState.image = '';
        const prev = document.getElementById('new-friend-avatar-preview');
        if (prev) prev.innerHTML = newFriendState.emoji;
      });
    });
  }
  const uploadBtn = document.getElementById('new-friend-upload-btn');
  const fileInput = document.getElementById('new-friend-file-input');
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { showToast('请选择图片'); return; }
      if (file.size > 5 * 1024 * 1024) { showToast('图片不能超过 5MB'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        newFriendState.image = ev.target.result;
        newFriendState.emoji = '';
        const prev = document.getElementById('new-friend-avatar-preview');
        if (prev) prev.innerHTML = `<img src="${ev.target.result}" alt="" />`;
        if (emojiWrap) emojiWrap.querySelectorAll('.ai-emoji-btn').forEach(b => b.classList.remove('active'));
      };
      reader.readAsDataURL(file);
    });
  }
  const traitWrap = document.getElementById('new-friend-trait-pairs');
  if (traitWrap) {
    traitWrap.querySelectorAll('.trait-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.dataset.traitRow;
        const sameRow = traitWrap.querySelectorAll(`.trait-pill[data-trait-row="${row}"]`);
        const wasActive = btn.classList.contains('active');
        sameRow.forEach(b => b.classList.remove('active'));
        if (!wasActive) btn.classList.add('active');
        const selected = [];
        traitWrap.querySelectorAll('.trait-pill.active').forEach(b => selected.push(b.dataset.trait));
        newFriendState.traits = selected;
      });
    });
  }
  const idWrap = document.getElementById('new-friend-identity-pills');
  if (idWrap) {
    idWrap.querySelectorAll('.identity-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        idWrap.querySelectorAll('.identity-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        newFriendState.identity = btn.dataset.identity || '';
      });
    });
  }
  const nameInput = document.getElementById('new-friend-name');
  const nameCounter = document.getElementById('new-friend-name-counter');
  if (nameInput && nameCounter) {
    nameInput.addEventListener('input', () => { nameCounter.textContent = `${nameInput.value.length} / 10`; });
  }
  const cancelBtn = document.getElementById('new-friend-cancel');
  if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal('modal-ai-add'));
  const saveBtn = document.getElementById('new-friend-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = nameInput ? nameInput.value.trim() : '';
      if (!name) { showToast('昵称不能为空'); return; }
      const traits = [];
      if (traitWrap) traitWrap.querySelectorAll('.trait-pill.active').forEach(b => traits.push(b.dataset.trait));
      let identity = '';
      if (idWrap) {
        const active = idWrap.querySelector('.identity-pill.active');
        if (active) identity = active.dataset.identity || '';
      }
      const newFriend = {
        id: 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: name, avatarEmoji: newFriendState.emoji || '', avatarImage: newFriendState.image || '',
        style: '', traits: traits, identity: identity, customIdentity: ''
      };
      aiFriends.push(newFriend);
      const cleanList = aiFriends.map(x => ({
        id: x.id, name: x.name, avatarEmoji: x.avatarEmoji, avatarImage: x.avatarImage, style: x.style,
        traits: Array.isArray(x.traits) ? x.traits : [],
        identity: typeof x.identity === 'string' ? x.identity : '',
        customIdentity: typeof x.customIdentity === 'string' ? x.customIdentity : ''
      }));
      saveAIFriends(cleanList); appData.aiFriends = cleanList; saveData(appData);
      newFriendState.emoji = '😊'; newFriendState.image = ''; newFriendState.traits = []; newFriendState.identity = '';
      if (nameInput) nameInput.value = '';
      if (nameCounter) nameCounter.textContent = '0 / 10';
      const prev = document.getElementById('new-friend-avatar-preview');
      if (prev) prev.innerHTML = '😊';
      if (traitWrap) traitWrap.querySelectorAll('.trait-pill').forEach(b => b.classList.remove('active'));
      if (idWrap) idWrap.querySelectorAll('.identity-pill').forEach(b => b.classList.remove('active'));
      closeModal('modal-ai-add'); renderAIFriendsList(); renderStats(); showToast('已添加');
    });
  }
}

function openAddFriendModal() {
  newFriendState.emoji = '😊'; newFriendState.image = ''; newFriendState.traits = []; newFriendState.identity = '';
  const nameInput = document.getElementById('new-friend-name');
  if (nameInput) nameInput.value = '';
  const nameCounter = document.getElementById('new-friend-name-counter');
  if (nameCounter) nameCounter.textContent = '0 / 10';
  const prev = document.getElementById('new-friend-avatar-preview');
  if (prev) prev.innerHTML = '😊';
  const emojiWrap = document.getElementById('new-friend-emojis');
  if (emojiWrap) {
    emojiWrap.innerHTML = EMOJI_OPTIONS.map(e =>
      `<button class="ai-emoji-btn ${e === '😊' ? 'active' : ''}" data-emoji="${e}">${e}</button>`
    ).join('');
    emojiWrap.querySelectorAll('.ai-emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        emojiWrap.querySelectorAll('.ai-emoji-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        newFriendState.emoji = btn.dataset.emoji;
        newFriendState.image = '';
        const p = document.getElementById('new-friend-avatar-preview');
        if (p) p.innerHTML = newFriendState.emoji;
      });
    });
  }
  const traitWrap = document.getElementById('new-friend-trait-pairs');
  if (traitWrap) traitWrap.querySelectorAll('.trait-pill').forEach(b => b.classList.remove('active'));
  const idWrap = document.getElementById('new-friend-identity-pills');
  if (idWrap) idWrap.querySelectorAll('.identity-pill').forEach(b => b.classList.remove('active'));
  openModal('modal-ai-add');
}

function getShareUrl() {
  return `${location.origin}${location.pathname}#/@${encodeURIComponent(user.username)}`;
}

let pendingImages = [];
let pendingCategories = [];
let pendingRatio = '3:4';
let editingDraftId = null;
let pendingAiCommentEnabled = true; 
let pendingAiPrompt = '';

function renderUploadPreview() {
  if (!pendingImages.length) {
    uploadZone.style.display = 'flex';
    uploadPreview.style.display = 'none';
    uploadPreview.innerHTML = '';
    uploadConfirm.disabled = true;
    return;
  }
  uploadZone.style.display = 'none';
  uploadPreview.style.display = 'grid';
  uploadConfirm.disabled = false;
  let html = '';
  pendingImages.forEach((src, idx) => {
    html += `<div class="slot"><img src="${src}" /><button class="slot-remove" data-idx="${idx}" aria-label="移除">×</button></div>`;
  });
  if (pendingImages.length < 9) html += `<div class="slot slot-add" id="slot-add">+</div>`;
  uploadPreview.innerHTML = html;
  uploadPreview.querySelectorAll('.slot-remove').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const idx = Number(btn.dataset.idx);
      pendingImages.splice(idx, 1);
      renderUploadPreview();
    });
  });
  const addBtn = document.getElementById('slot-add');
  if (addBtn) addBtn.addEventListener('click', () => uploadInput.click());
}

let uploadInput, uploadZone, uploadPreview, uploadCaption, captionCounter, uploadConfirm;

function resetUpload() {
  pendingImages = []; pendingCategories = []; editingDraftId = null;
  pendingRatio = '3:4';
   pendingAiCommentEnabled = true; 
  pendingAiPrompt = '';
  const aiToggle = document.getElementById('upload-ai-comment-toggle');
  if (aiToggle) aiToggle.checked = true;
  const aiPromptInput = document.getElementById('upload-ai-prompt');
  if (aiPromptInput) aiPromptInput.value = '';

  if (uploadCaption) uploadCaption.value = '';
  if (captionCounter) captionCounter.textContent = '0 / 200';
  if (uploadInput) uploadInput.value = '';
  document.querySelectorAll('#category-row .cat-chip').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#ratio-row .ratio-chip').forEach(b => {
    b.classList.toggle('active', b.dataset.ratio === '3:4');
  });
  renderUploadPreview();
}

function startUploadSimulation(images, caption, categories, ratio, aiPrompt, aiEnabled) {
  const totalMs = 10000 + Math.floor(Math.random() * 5001);
  const stepMs = 50;
  const totalSteps = Math.max(1, Math.floor(totalMs / stepMs));
  const inc = 100 / totalSteps;

  openModal('modal-waiting');
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  fill.style.width = '0%';
  label.textContent = '0%';

  let progress = 0;
  let finished = false;
  const timer = setInterval(() => {
    progress = Math.min(100, progress + inc);
    const disp = Math.floor(progress);
    fill.style.width = disp + '%';
    label.textContent = disp + '%';
    if (progress >= 100) {
      clearInterval(timer);
      if (finished) return;
      finished = true;
      fill.style.width = '100%';
      label.textContent = '100%';
      setTimeout(() => finalizeUpload(images, caption, categories, ratio, aiPrompt, aiEnabled), 200);
    }
  }, stepMs);
}

function finalizeUpload(images, caption, categories, ratio, aiPrompt, aiEnabled) {
  const now = new Date();
  const id = uid();
  const work = {
    id: id, 
    images: images,
    caption: caption || '', // 只存用户写的心情，不包含悄悄话
    aiPrompt: aiPrompt || '', // ★ 把悄悄话单独存到一个新字段里
    categories: Array.isArray(categories) ? categories.slice() : [],
    aspectRatio: ratio || '1:1',
    timestamp: now.toISOString(), likes: calcLikes(), userLiked: false, collected: false,
    aiComments: [], replies: [], displayDate: formatDateLabel(now.toISOString())
  };
   if (aiEnabled) {
    work.aiComments = pickCommentsForWork(work);
  } else {
    work.aiComments = []; // 关了开关，就没有评论
  }
  appData.works.unshift(work);
  if (editingDraftId && Array.isArray(appData.drafts)) {
    const didx = appData.drafts.findIndex(d => d.id === editingDraftId);
    if (didx >= 0) appData.drafts.splice(didx, 1);
    editingDraftId = null;
  }
  closeModal('modal-waiting');
  renderStats(); 
  renderGallery(); 
  updateDraftsBadge();
  saveData(appData);
  showToast('发布成功！');
}

let currentDetailId = null;
let currentSlide = 0;
let carouselImgs = [];

function openDetail(id) {
  const work = appData.works.find(w => w.id === id);
  if (!work) return;
  currentDetailId = id; currentSlide = 0;

  const mask = document.getElementById('modal-detail');
  if (mask) {
    mask.querySelectorAll('*').forEach(el => { el.style.backgroundImage = ''; el.style.background = ''; });
    const modalEl = mask.querySelector('.modal');
    if (modalEl) { modalEl.style.background = '#FFFFFF'; modalEl.style.backgroundImage = 'none'; }
  }

  carouselImgs = work.images || [];
  // 根据作品比例设置详情页轮播样式
  const carouselEl = document.getElementById('detail-carousel');
  if (carouselEl) {
    if (work.aspectRatio === '3:4') {
      carouselEl.classList.add('ratio-3-4');
    } else {
      carouselEl.classList.remove('ratio-3-4');
    }
  }  
  const track = document.getElementById('detail-track');
  track.innerHTML = '';
  track.innerHTML = carouselImgs.map(src => `<img src="${src}" />`).join('');
  track.style.transform = 'translateX(0)';
  track.style.backgroundImage = '';
  renderDots();

  const captionEl = document.getElementById('detail-caption');
  if (work.caption) { captionEl.textContent = work.caption; captionEl.style.display = 'block'; }
  else { captionEl.style.display = 'none'; }

  document.getElementById('detail-time').textContent = `发布于 · ${formatDateLong(work.timestamp)}`;
  renderComments(work.aiComments || [], work);
  syncActions(work);
  openModal('modal-detail');
}

function renderDots() {
  const dots = document.getElementById('detail-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  
  if (!carouselImgs.length || carouselImgs.length === 1) { 
    dots.innerHTML = ''; 
    if(prevBtn) prevBtn.style.display = 'none';
    if(nextBtn) nextBtn.style.display = 'none';
    return; 
  }
  
  
  dots.innerHTML = carouselImgs.map((_, i) =>
    `<span class="${i === currentSlide ? 'active' : ''}" data-index="${i}"></span>`
  ).join('');

  // 给圆点添加点击事件
  dots.querySelectorAll('span').forEach(dot => {
    dot.addEventListener('click', () => {
      currentSlide = Number(dot.dataset.index);
      updateSlide();
    });
  });
}

function renderComments(list, work) {
  const wrap = document.getElementById('comment-list');
  const replies = (work && Array.isArray(work.replies)) ? work.replies : [];
  if (!list.length) {
    wrap.innerHTML = `<div style="font-size:12px;color:var(--text-tertiary);text-align:center;padding:12px 0;">还没有评论</div>`;
    return;
  }
  wrap.innerHTML = list.map(c => {
    const avatarHtml = c.avatarIsImage
      ? `<img src="${escapeHtml(c.avatar)}" alt="" />`
      : escapeHtml(c.avatar);
    const cid = c.commentId || '';
    const commentReplies = cid ? replies.filter(r => r.commentId === cid) : [];
    const repliesHtml = commentReplies.map(r => {
      const rAvatar = r.userAvatarIsImage
        ? `<img src="${escapeHtml(r.userAvatar)}" alt="" />`
        : escapeHtml(r.userAvatar || '我');
      return `
        <div class="reply">
          <div class="reply-avatar">${rAvatar}</div>
          <div class="reply-body">
            <div class="reply-name">${escapeHtml(r.userName || user.username)}</div>
            <div class="reply-text">${escapeHtml(r.content || '')}</div>
            <div class="reply-time">· ${escapeHtml(r.timeLabel || formatRelativeTime(r.timestamp))}</div>
          </div>
        </div>`;
    }).join('');
    return `
    <div class="comment" data-cid="${escapeHtml(cid)}">
      <div class="comment-avatar">${avatarHtml}</div>
      <div class="comment-body">
        <div class="comment-name">${escapeHtml(c.nickname)}</div>
        <div class="comment-text">${escapeHtml(c.content)}</div>
        <div class="comment-time">· ${escapeHtml(c.time || '刚刚')}</div>
        <button class="comment-reply-btn" data-reply-btn="${escapeHtml(cid)}">回复</button>
        <div class="reply-form" data-reply-form="${escapeHtml(cid)}" style="display:none;">
          <input type="text" class="reply-input" data-reply-input="${escapeHtml(cid)}" placeholder="回复 ${escapeHtml(c.nickname)}..." maxlength="80" />
          <button class="reply-send" data-reply-send="${escapeHtml(cid)}">发送</button>
        </div>
        <div class="reply-list" data-reply-list="${escapeHtml(cid)}">${repliesHtml}</div>
      </div>
    </div>`;
  }).join('');
}

function formatRelativeTime(iso) {
  if (!iso) return '刚刚';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  return `${Math.floor(h / 24)}天前`;
}

function syncActions(work) {
  const likeBtn = document.getElementById('act-like');
  const likeLabel = document.getElementById('act-like-label');
  const collectBtn = document.getElementById('act-collect');
  const collectLabel = document.getElementById('act-collect-label');
  const commentLabel = document.getElementById('act-comment-label');
  if (work.userLiked) {
    likeBtn.classList.add('liked');
    likeBtn.querySelector('.ic').textContent = '♥';
    likeLabel.textContent = work.likes;
  } else {
    likeBtn.classList.remove('liked');
    likeBtn.querySelector('.ic').textContent = '♡';
    likeLabel.textContent = work.likes;
  }
  if (work.collected) {
    collectBtn.classList.add('collected');
    collectBtn.querySelector('.ic').textContent = '★';
    collectLabel.textContent = '已收藏';
  } else {
    collectBtn.classList.remove('collected');
    collectBtn.querySelector('.ic').textContent = '☆';
    collectLabel.textContent = '收藏';
  }
  const cnt = (work.aiComments || []).length;
  commentLabel.textContent = cnt > 0 ? `评论 ${cnt}` : '评论';
}

function updateSlide() {
  const track = document.getElementById('detail-track');
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  renderDots();
}

function updateDraftsBadge() {
  const fab = document.getElementById('fab-drafts');
  if (!fab) return;
  let badge = fab.querySelector('.fab-drafts-badge');
  const cnt = (appData.drafts || []).length;
  if (cnt > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'fab-drafts-badge';
      fab.appendChild(badge);
    }
    badge.textContent = String(cnt);
  } else if (badge) badge.remove();
}

function saveDraft() {
  if (!pendingImages.length) { showToast('请至少选择一张图片'); return; }
  const draft = {
    id: 'd-' + uid(), images: pendingImages.slice(),
    caption: uploadCaption.value.trim(), categories: pendingCategories.slice(),
    savedAt: new Date().toISOString()
  };
  if (!Array.isArray(appData.drafts)) appData.drafts = [];
  appData.drafts.unshift(draft);
  saveData(appData);
  closeModal('modal-upload'); resetUpload(); updateDraftsBadge(); showToast('草稿已保存');
}

function deleteDraft(id) {
  if (!Array.isArray(appData.drafts)) return;
  const idx = appData.drafts.findIndex(d => d.id === id);
  if (idx < 0) return;
  appData.drafts.splice(idx, 1);
  saveData(appData); renderDraftsList(); updateDraftsBadge(); showToast('已删除');
}

function prefillDraft(draft) {
  pendingImages = (draft.images || []).slice();
  pendingCategories = Array.isArray(draft.categories) ? draft.categories.slice() : [];
  uploadCaption.value = draft.caption || '';
  captionCounter.textContent = `${(draft.caption || '').length} / 200`;
  document.querySelectorAll('#category-row .cat-chip').forEach(b => {
    b.classList.toggle('active', pendingCategories.indexOf(b.dataset.cat) >= 0);
  });
  editingDraftId = draft.id;
  renderUploadPreview();
  openModal('modal-upload');
}

function renderDraftsList() {
  const wrap = document.getElementById('drafts-list');
  const list = appData.drafts || [];
  if (!list.length) { wrap.innerHTML = `<div class="drafts-empty">还没有草稿</div>`; return; }
  wrap.innerHTML = list.map(d => {
    const thumb = (d.images && d.images[0])
      ? `<div class="draft-thumb" style="background-image:url(${d.images[0]});"></div>`
      : `<div class="draft-thumb">📷</div>`;
    const caption = (d.caption || '').slice(0, 20) || '（无配文）';
    const time = formatDateLabel(d.savedAt);
    return `
      <div class="draft-row" data-draft-id="${escapeHtml(d.id)}">
        ${thumb}
        <div class="draft-info">
          <div class="draft-caption">${escapeHtml(caption)}</div>
          <div class="draft-time">${escapeHtml(time)}</div>
        </div>
        <button class="draft-delete" data-draft-delete="${escapeHtml(d.id)}" aria-label="删除">🗑</button>
      </div>`;
  }).join('');
  wrap.querySelectorAll('.draft-row').forEach(row => {
    row.addEventListener('click', (ev) => {
      if (ev.target.closest('.draft-delete')) return;
      const draft = (appData.drafts || []).find(d => d.id === row.dataset.draftId);
      if (draft) { closeModal('modal-drafts'); prefillDraft(draft); }
    });
  });
  wrap.querySelectorAll('.draft-delete').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      deleteDraft(btn.dataset.draftDelete);
    });
  });
}

function openDraftsModal() { renderDraftsList(); openModal('modal-drafts'); }

/* ============================================================
   初始化 + 事件绑定
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // 事件绑定
  document.querySelectorAll('.modal-mask').forEach(mask => {
    mask.addEventListener('click', (e) => {
      if (e.target === mask) {
        if (mask.id === 'modal-waiting') return;
        closeModal(mask.id);
      }
    });
    const stop = mask.querySelector('[data-stop]');
    if (stop) stop.addEventListener('click', e => e.stopPropagation());
  });

    const btnPickBanner = document.getElementById('btn-pick-banner');
  if (btnPickBanner) btnPickBanner.addEventListener('click', () => document.getElementById('banner-input').click());

  const bannerInput = document.getElementById('banner-input');
  if (bannerInput) bannerInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('请选择图片'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      user.banner = ev.target.result;
      saveUser(user);
      renderUser();
      updateBannerThumb();
      showToast('背景已更新');
    };
    reader.readAsDataURL(file);
    bannerInput.value = '';
  });

  const btnClearBanner = document.getElementById('btn-clear-banner');
  if (btnClearBanner) btnClearBanner.addEventListener('click', () => {
    user.banner = '';
    saveUser(user);
    applyBanner();
    updateBannerThumb();
    showToast('已恢复默认背景');
  });
 

  const editUsernameInput = document.getElementById('edit-username');
  const editBioInput = document.getElementById('edit-bio');
  const bioCounter = document.getElementById('bio-counter');

  document.getElementById('btn-edit').addEventListener('click', () => {
    editUsernameInput.value = user.username;
    editBioInput.value = user.bio;
    bioCounter.textContent = `${(user.bio || '').length} / 60`;
    updateBannerThumb();
    renderThemeSwatches();
    openModal('modal-edit');
    setTimeout(() => editUsernameInput.focus(), 280);
  });

  const btnAiAdd = document.getElementById('btn-ai-add');
  if (btnAiAdd) btnAiAdd.addEventListener('click', openAddFriendModal);


  editBioInput.addEventListener('input', () => { bioCounter.textContent = `${editBioInput.value.length} / 60`; });
  document.getElementById('edit-cancel').addEventListener('click', () => closeModal('modal-edit'));
  document.getElementById('edit-save').addEventListener('click', () => {
    const newName = editUsernameInput.value.trim();
    const newBio = editBioInput.value.trim();
    if (!newName) { showToast('用户名不能为空'); return; }
    user.username = newName;
    user.bio = newBio || '今天开始记录生活';
    saveUser(user); renderUser(); closeModal('modal-edit'); showToast('已保存');
  });

    document.getElementById('btn-reset-data').addEventListener('click', async () => {
    if (!confirm('将清除全部作品、头像、背景、AI 朋友自定义，恢复出厂设置。继续？')) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(FRIENDS_KEY);
      localStorage.removeItem('mmine_style');        
      localStorage.removeItem('mmine_gallery_cols');
      await idbDelete(STORAGE_KEY);   // ★ 新增：清空 IndexedDB
    } catch (e) {}
    document.documentElement.dataset.style = 'default';
    user = Object.assign({}, DEFAULT_USER);
    appData = Object.assign({}, DEFAULT_DATA);
    aiFriends = JSON.parse(JSON.stringify(DEFAULT_AI_FRIENDS));
        applyTheme(DEFAULT_THEME);
    renderThemeSwatches();
    collectedOnly = false;
    closeModal('modal-edit'); renderAll(); showToast('已重置');
  });

  document.getElementById('ai-close').addEventListener('click', () => closeModal('modal-ai'));

  document.getElementById('btn-share').addEventListener('click', () => {
    document.getElementById('share-link').textContent = getShareUrl();
    openModal('modal-share');
  });
  document.getElementById('share-close').addEventListener('click', () => closeModal('modal-share'));
  document.getElementById('share-copy').addEventListener('click', () => showToast('请长按上方链接复制'));

  // 上传相关
  uploadInput = document.getElementById('upload-input');
  uploadZone = document.getElementById('upload-zone');
  uploadPreview = document.getElementById('upload-preview');
  uploadCaption = document.getElementById('upload-caption');
  captionCounter = document.getElementById('caption-counter');
  uploadConfirm = document.getElementById('upload-confirm');

  document.querySelectorAll('#category-row .cat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        pendingCategories = pendingCategories.filter(c => c !== cat);
      } else {
        btn.classList.add('active');
        pendingCategories.push(cat);
      }
    });
  });

  document.querySelectorAll('#ratio-row .ratio-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#ratio-row .ratio-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      pendingRatio = btn.dataset.ratio;
    });
  });

  document.getElementById('fab-add').addEventListener('click', () => { resetUpload(); openModal('modal-upload'); });
  uploadZone.addEventListener('click', () => uploadInput.click());

    // ★ 新增：图片压缩函数
  function compressImage(file, maxSize, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width; let height = img.height;
        if (width > height) { if (width > maxSize) { height *= maxSize / width; width = maxSize; } }
        else { if (height > maxSize) { width *= maxSize / height; height = maxSize; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.7)); 
      };
    };
  }

  uploadInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      if (pendingImages.length >= 9) return;
      // ★ 替换这里，改为调用压缩
      compressImage(file, 1000, function(compressedBase64) {
        pendingImages.push(compressedBase64);
        renderUploadPreview();
      });
    });
    uploadInput.value = '';
  });

  uploadCaption.addEventListener('input', () => { captionCounter.textContent = `${uploadCaption.value.length} / 200`; });
  document.getElementById('upload-cancel').addEventListener('click', () => { closeModal('modal-upload'); resetUpload(); });
	let isPublishing = false; 
  document.getElementById('upload-confirm').addEventListener('click', () => {
    if (isPublishing) return;
    isPublishing = true;      
    setTimeout(() => { isPublishing = false; }, 1500);     
    if (!pendingImages.length) { showToast('请至少选择一张图片'); return; }
    const aiPrompt = document.getElementById('upload-ai-prompt').value.trim();
    const aiEnabled = document.getElementById('upload-ai-comment-toggle').checked;

    const caption = uploadCaption.value.trim();
    const imagesCopy = pendingImages.slice();
    const categoriesCopy = pendingCategories.slice();
    const ratioCopy = pendingRatio;
    closeModal('modal-upload');
    resetUpload();
    setTimeout(() => { startUploadSimulation(imagesCopy, caption, categoriesCopy, ratioCopy, aiPrompt, aiEnabled); }, 50);    
  });

  document.getElementById('upload-save-draft').addEventListener('click', saveDraft);
  const fabDrafts = document.getElementById('fab-drafts');
  if (fabDrafts) fabDrafts.addEventListener('click', openDraftsModal);
  const draftsClose = document.getElementById('drafts-close');
  if (draftsClose) draftsClose.addEventListener('click', () => closeModal('modal-drafts'));

  // 详情页
  document.getElementById('detail-close').addEventListener('click', () => closeModal('modal-detail'));

  document.getElementById('act-like').addEventListener('click', () => {
    const w = appData.works.find(x => x.id === currentDetailId);
    if (!w) return;
    w.userLiked = !w.userLiked;
    w.likes += w.userLiked ? 1 : -1;
    saveData(appData); syncActions(w);
  });

  document.getElementById('act-collect').addEventListener('click', () => {
    const w = appData.works.find(x => x.id === currentDetailId);
    if (!w) return;
    w.collected = !w.collected;
    saveData(appData);
    renderStats();
    syncActions(w);
    showToast(w.collected ? '已收藏' : '已取消收藏');
  });

  document.getElementById('act-comment').addEventListener('click', () => {
    document.getElementById('comment-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('act-delete').addEventListener('click', () => openModal('modal-confirm'));
  document.getElementById('confirm-cancel').addEventListener('click', () => closeModal('modal-confirm'));
  document.getElementById('confirm-ok').addEventListener('click', () => {
    const idx = appData.works.findIndex(x => x.id === currentDetailId);
    if (idx >= 0) {
      appData.works.splice(idx, 1);
      saveData(appData); renderStats(); renderGallery();
    }
    closeModal('modal-confirm'); closeModal('modal-detail'); showToast('已删除');
  });

  (function bindReplyHandlers() {
    const wrap = document.getElementById('comment-list');
    if (!wrap) return;
    wrap.addEventListener('click', (e) => {
      const replyBtn = e.target.closest('[data-reply-btn]');
      if (replyBtn) {
        const cid = replyBtn.dataset.replyBtn;
        const form = wrap.querySelector(`[data-reply-form="${cid}"]`);
        if (form) {
          const visible = form.style.display !== 'none';
          form.style.display = visible ? 'none' : '';
          if (!visible) {
            const inp = form.querySelector('input');
            if (inp) setTimeout(() => inp.focus(), 50);
          }
        }
        return;
      }
      const sendBtn = e.target.closest('[data-reply-send]');
      if (sendBtn) {
        const cid = sendBtn.dataset.replySend;
        const input = wrap.querySelector(`[data-reply-input="${cid}"]`);
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        const w = appData.works.find(x => x.id === currentDetailId);
        if (!w) return;
        if (!Array.isArray(w.replies)) w.replies = [];
        w.replies.push({
          commentId: cid, userId: 'self', userName: user.username || '我',
          userAvatar: user.avatar || '我', userAvatarIsImage: !!user.avatar,
          content: text, timestamp: new Date().toISOString(), timeLabel: '刚刚'
        });
        saveData(appData);
        renderComments(w.aiComments || [], w);
        showToast('已回复');
      }
    });
  })();

  (function bindCarouselSwipe() {
    const carousel = document.getElementById('detail-carousel');
    if (!carousel) return;
    let startX = 0, dx = 0, tracking = false;
    carousel.addEventListener('touchstart', (e) => {
      if (carouselImgs.length <= 1) return;
      startX = e.touches[0].clientX; tracking = true;
    }, { passive: true });
    carousel.addEventListener('touchmove', (e) => { if (tracking) dx = e.touches[0].clientX - startX; }, { passive: true });
    carousel.addEventListener('touchend', () => {
      if (!tracking) return;
      tracking = false;
      if (Math.abs(dx) > 40) {
        if (dx < 0) currentSlide = Math.min(carouselImgs.length - 1, currentSlide + 1);
        else currentSlide = Math.max(0, currentSlide - 1);
        updateSlide();
      }
      dx = 0;
    });
  })();
    document.getElementById('carousel-prev').addEventListener('click', () => {
    if (carouselImgs.length <= 1) return;
    currentSlide = (currentSlide - 1 + carouselImgs.length) % carouselImgs.length;
    updateSlide();
  });

  document.getElementById('carousel-next').addEventListener('click', () => {
    if (carouselImgs.length <= 1) return;
    currentSlide = (currentSlide + 1) % carouselImgs.length;
    updateSlide();
  });

  // ---------- 画廊栏数切换 ----------
  (function initGalleryRatio() {
    const COLS_KEY = 'mmine_gallery_cols';
    const galleryEl = document.getElementById('gallery');
    if (!galleryEl) return;
    
    const savedCols = localStorage.getItem(COLS_KEY) || '3';
    galleryEl.setAttribute('data-cols', savedCols);
    
    document.querySelectorAll('.ratio-btn').forEach(btn => {
      const cols = btn.dataset.cols;
      btn.classList.toggle('active', cols === savedCols);
      
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        galleryEl.setAttribute('data-cols', cols);
        localStorage.setItem(COLS_KEY, cols);
      });
    });
  })();

// 风格切换器初始化
const savedStyle = localStorage.getItem('mmine_style') || 'default';
document.documentElement.dataset.style = savedStyle;
const styleBtns = document.querySelectorAll('.style-btn');
styleBtns.forEach(btn => {
  btn.classList.toggle('active', btn.dataset.styleName === savedStyle);
  btn.addEventListener('click', () => {
    const styleName = btn.dataset.styleName;
    document.documentElement.dataset.style = styleName;
    styleBtns.forEach(b => b.classList.toggle('active', b === btn));
    localStorage.setItem('mmine_style', styleName);

    const isPixel = styleName === 'pixel';
    const validThemes = isPixel ? THEMES_PIXEL : THEMES;
    
    // 智能切换主题
    let targetTheme = appData.theme;
    if (!validThemes[targetTheme]) {
      if (isPixel && targetTheme === 'default') targetTheme = 'pixel-default';
      else if (!isPixel && targetTheme === 'pixel-default') targetTheme = 'default';
      else targetTheme = isPixel ? 'pixel-default' : 'default';
    }
    appData.theme = targetTheme;
    saveData(appData);

    applyTheme(appData.theme);
    renderThemeSwatches();
  });
});

    // 同步绑定所有事件（事件绑定不依赖数据）
  bindAvatarInput();
  bindStatClicks();
  initAddFriendPanel();

  // ★ 异步加载数据后再渲染
  (async function loadAndRender() {
    try {
      appData = await loadData();
    } catch (e) {
      console.warn('数据加载失败，使用默认值', e);
      appData = Object.assign({}, DEFAULT_DATA);
    }
    applyTheme(appData.theme || DEFAULT_THEME);
    renderAll();
    renderThemeSwatches();
    updateDraftsBadge();
  })();
});