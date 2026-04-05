// =====================================================
// equipment.js
// 装備定義・クラフト・再ロール・売却・お気に入り
// =====================================================

const EQUIP_CATEGORY = { weapon:'weapon', armor:'armor', acc:'acc' };
const EQUIP_CATEGORY_NAME = { weapon:'武器', armor:'防具', acc:'アクセサリー' };

// 素材定義（14Tier）
const MATERIALS = {
  wood:        { id:'wood',        name:'木',             tier:1 },
  stone:       { id:'stone',       name:'石',             tier:2 },
  copper:      { id:'copper',      name:'銅',             tier:3 },
  bronze:      { id:'bronze',      name:'青銅',           tier:4 },
  iron:        { id:'iron',        name:'鉄',             tier:5 },
  steel:       { id:'steel',       name:'鋼鉄',           tier:6 },
  silver:      { id:'silver',      name:'銀',             tier:7 },
  gold:        { id:'gold',        name:'金',             tier:8 },
  platinum:    { id:'platinum',    name:'プラチナ',       tier:9 },
  magicIron:   { id:'magicIron',   name:'魔鉄',           tier:10 },
  starIron:    { id:'starIron',    name:'星鉄',           tier:11 },
  mythril:     { id:'mythril',     name:'ミスリル',       tier:12 },
  orichalcum:  { id:'orichalcum',  name:'オリハルコン',   tier:13 },
  adamantite:  { id:'adamantite',  name:'アダマンタイト', tier:14 },
};

// カテゴリ別ボーナスプール
const BONUS_POOL = {
  weapon: [
    { type:'patk',          label:'物理攻撃力',     weight:3 },
    { type:'matk',          label:'魔法攻撃力',     weight:3 },
    { type:'crit',          label:'クリティカル率', weight:3 },
    { type:'critDmg',       label:'クリティカル倍率', weight:3 },
    { type:'hit',           label:'命中',           weight:3 },
    { type:'trueDmg',       label:'確定ダメージ',   weight:3 },
    { type:'lifeSteal',     label:'吸血率',         weight:3 },
    { type:'speed',         label:'速度',           weight:3 },
    { type:'elemAtk_fire',  label:'火適正',         weight:1 },
    { type:'elemAtk_ice',   label:'氷適正',         weight:1 },
    { type:'elemAtk_wind',  label:'風適正',         weight:1 },
    { type:'elemAtk_light', label:'光適正',         weight:1 },
    { type:'elemAtk_dark',  label:'闇適正',         weight:1 },
  ],
  armor: [
    { type:'pdef',          label:'物理防御力',     weight:3 },
    { type:'mdef',          label:'魔法防御力',     weight:3 },
    { type:'hp',            label:'HP',             weight:3 },
    { type:'mp',            label:'MP',             weight:3 },
    { type:'hpRegen',       label:'HP自動回復',     weight:3 },
    { type:'mpRegen',       label:'MP自動回復',     weight:3 },
    { type:'eva',           label:'回避',           weight:3 },
    { type:'speed',         label:'速度',           weight:3 },
    { type:'elemRes_fire',  label:'火耐性',         weight:1 },
    { type:'elemRes_ice',   label:'氷耐性',         weight:1 },
    { type:'elemRes_wind',  label:'風耐性',         weight:1 },
    { type:'elemRes_light', label:'光耐性',         weight:1 },
    { type:'elemRes_dark',  label:'闇耐性',         weight:1 },
  ],
  acc: [
    { type:'patk',          label:'物理攻撃力',     weight:3 },
    { type:'matk',          label:'魔法攻撃力',     weight:3 },
    { type:'pdef',          label:'物理防御力',     weight:3 },
    { type:'mdef',          label:'魔法防御力',     weight:3 },
    { type:'hp',            label:'HP',             weight:3 },
    { type:'speed',         label:'速度',           weight:3 },
    { type:'crit',          label:'クリティカル率', weight:3 },
    { type:'lifeSteal',     label:'吸血率',         weight:3 },
    { type:'manaSteal',     label:'マナ吸収率',     weight:3 },
    { type:'hpRegen',       label:'HP自動回復',     weight:3 },
    { type:'elemAtk_fire',  label:'火適正',         weight:1 },
    { type:'elemAtk_dark',  label:'闇適正',         weight:1 },
    { type:'elemAtk_light', label:'光適正',         weight:1 },
    { type:'elemRes_fire',  label:'火耐性',         weight:1 },
    { type:'elemRes_dark',  label:'闇耐性',         weight:1 },
  ],
};

// Tierに応じた数値範囲
// 低Tierの装備も実用的になるよう緩やかなスケーリングに調整
function getBonusRange(bonusType, tier) {
  // 1. 属性適正・耐性の処理
  if (bonusType.startsWith('elemAtk_') || bonusType.startsWith('elemRes_')) {
    const scale = Math.pow(tier / 7, 1.20);
    const min = parseFloat((0.07 * scale).toFixed(3));
    const max = parseFloat((0.22 * scale).toFixed(3));
    return [min, max];
  }

  // 2. 通常ステータスのベース値（T7基準を25%引き上げ）
  const base = {
    patk: [15, 42], matk: [15, 42], pdef: [15, 42], mdef: [15, 42],
    hp: [112, 300], mp: [38, 110], crit: [2, 5], critDmg: [0.10, 0.30],
    hit: [12, 34], eva: [10, 26], speed: [10, 28], hpRegen: [10, 28],
    mpRegen: [5, 16], lifeSteal: [2, 6], manaSteal: [2, 6], trueDmg: [15, 55],
  };

  const range = base[bonusType] || [12, 36];
  const scale = Math.pow(tier / 7, 1.35);

  // 3. 整数系ステータスのみ Math.floor を適用する
  // ※ critDmg のように小数が必要なステータスがある場合はここでも分岐が必要
  if (bonusType === 'critDmg') {
    return [
      parseFloat((range[0] * scale).toFixed(2)),
      parseFloat((range[1] * scale).toFixed(2))
    ];
  }

  return [
    Math.max(1, Math.floor(range[0] * scale)),
    Math.max(2, Math.floor(range[1] * scale)),
  ];
}

// カテゴリ・Tierの数値幅一覧を返す（UI表示用）
function getBonusRangeTable(category, tier) {
  return BONUS_POOL[category].map(b => {
    const [min, max] = getBonusRange(b.type, tier);
    return { ...b, min, max };
  });
}

// ボーナス値を型に応じて丸める
function roundBonusValue(type, raw) {
  if (type.startsWith('elem')) return parseFloat(raw.toFixed(3));
  if (type === 'critDmg')      return parseFloat(raw.toFixed(2));
  return Math.floor(raw); // 整数系（hpRegen等）は必ず整数
}

// ランダム効果を4つ生成する（属性適正・耐性は weight:1、他は weight:3 でレアリティ差あり）
function rollBonuses(category, tier) {
  const pool = [...BONUS_POOL[category]];
  const bonuses = [];
  for (let i = 0; i < 4; i++) {
    if (pool.length === 0) break;
    const totalWeight = pool.reduce((s, b) => s + b.weight, 0);
    let rand = Math.random() * totalWeight;
    let idx = pool.length - 1;
    for (let j = 0; j < pool.length; j++) {
      rand -= pool[j].weight;
      if (rand <= 0) { idx = j; break; }
    }
    const bonus = pool.splice(idx, 1)[0];
    const [min, max] = getBonusRange(bonus.type, tier);
    const raw = min + Math.random() * (max - min);
    bonuses.push({
      type:  bonus.type,
      label: bonus.label,
      value: roundBonusValue(bonus.type, raw),
    });
  }
  return bonuses;
}

// 数値のみを再ロール（効果の種類は変えず、数値だけ振り直す）
function rerollValues(equipment) {
  equipment.bonuses = equipment.bonuses.map(b => {
    const [min, max] = getBonusRange(b.type, equipment.tier);
    const raw = min + Math.random() * (max - min);
    return { ...b, value: roundBonusValue(b.type, raw) };
  });
  return equipment;
}

// 装備をクラフトする（素材×5を消費）
function craftEquipment(player, materialId, category) {
  const material = MATERIALS[materialId];
  if (!material) return { success:false, message:'素材が存在しません。' };
  const held = player.materials[materialId] || 0;
  if (held < 5) return { success:false, message:`素材が足りません（${held}/5）。` };

  player.materials[materialId] -= 5;
  const bonuses = rollBonuses(category, material.tier);
  const equipment = {
    id:        `${materialId}_${category}_${Date.now()}`,
    name:      `${material.name}の${EQUIP_CATEGORY_NAME[category]}`,
    category,
    materialId,
    tier:      material.tier,
    bonuses,
    favorite:  false,
  };

  if (!player.equipInventory) player.equipInventory = [];
  player.equipInventory.push(equipment);
  return { success:true, equipment };
}

// 再ロール（効果種類固定、数値ランダム）
// fixedIndices: 固定する効果のインデックス（最大fixCount個）
function rerollEquipment(player, equipment, fixedIndices, rerollItemId) {
  const consumed = consumeItem(player, rerollItemId, 1);
  if (!consumed) return { success:false, message:'再錬アイテムがありません。' };

  const item = ITEMS[rerollItemId];

  if (item?.rerollValuesOnly) {
    // 数値のみ再ロール
    const fixCount = item.fixCount || 0;
    const actual   = (fixedIndices || []).slice(0, fixCount);
    equipment.bonuses = equipment.bonuses.map((b, i) => {
      if (actual.includes(i)) return b;
      const [min, max] = getBonusRange(b.type, equipment.tier);
      const raw = min + Math.random() * (max - min);
      return { ...b, value: roundBonusValue(b.type, raw) };
    });
  } else {
    // 効果種類ごと再ロール（既存の再錬）
    const fixCount = item?.fixCount || 1;
    const actual   = (fixedIndices || []).slice(0, fixCount);
    const newBonuses = rollBonuses(equipment.category, equipment.tier);
    equipment.bonuses = equipment.bonuses.map((b, i) =>
      actual.includes(i) ? b : (newBonuses.shift() || b)
    );
  }
  return { success:true, equipment };
}

// お気に入り切り替え
function toggleFavorite(player, equipId) {
  const equip = (player.equipInventory || []).find(e => e.id === equipId);
  if (!equip) return;
  equip.favorite = !equip.favorite;
}

// 装備を売却する（ゴールドを返す）
function sellEquipment(player, equipId) {
  const inv   = player.equipInventory || [];
  const idx   = inv.findIndex(e => e.id === equipId);
  if (idx < 0) return { success:false, message:'装備が見つかりません。' };

  const equip = inv[idx];

  // 装備中の場合は売れない
  const isEquipped = Object.values(player.equipment).flat().some(e => e?.id === equipId);
  if (isEquipped) return { success:false, message:'装備中のアイテムは売却できません。' };

  // 売値 = Tier × 100 × ボーナス合計の簡易計算
  const sellPrice = calcSellPrice(equip);
  player.gold += sellPrice;
  player.equipInventory.splice(idx, 1);
  return { success:true, gold:sellPrice };
}

// 売値計算
function calcSellPrice(equip) {
  const base = equip.tier * 100;
  const bonusSum = equip.bonuses.reduce((s, b) => s + b.value, 0);
  return Math.floor(base + bonusSum * 5);
}

// 装備を装着する
function equipItem(player, equipmentId, category, slotIndex) {
  const equip = (player.equipInventory || []).find(e => e.id === equipmentId);
  if (!equip || equip.category !== category) return false;
  if (slotIndex < 0 || slotIndex >= player.equipment[category].length) return false;
  // 同じ装備が別スロットに既に入っている場合は外す（重複装備を防止）
  for (const cat of Object.keys(player.equipment)) {
    player.equipment[cat] = player.equipment[cat].map(s => s?.id === equipmentId ? null : s);
  }
  player.equipment[category][slotIndex] = equip;
  return true;
}

// 素材を換金する
function sellMaterial(player, matId, qty) {
  const mat = MATERIALS[matId];
  if (!mat) return { success: false, message: '素材が存在しません。' };
  const held = player.materials[matId] || 0;
  if (held < qty) return { success: false, message: `素材が足りません（${held}個所持）。` };
  const priceEach = Math.floor(30 * Math.pow(2, mat.tier - 1));
  player.materials[matId] -= qty;
  player.gold += priceEach * qty;
  return { success: true, gold: priceEach * qty };
}

// 素材をアップグレードする（T1-7: 2個→1個、T8-13: 3個→1個）
function upgradeMaterial(player, matId) {
  const mat = MATERIALS[matId];
  if (!mat) return { success: false, message: '素材が存在しません。' };
  if (mat.tier >= 14) return { success: false, message: 'これ以上アップグレードできません。' };
  const needed = mat.tier < 8 ? 2 : 3;
  const held = player.materials[matId] || 0;
  if (held < needed) return { success: false, message: `素材が足りません（${held}/${needed}）。` };
  const nextMat = Object.values(MATERIALS).find(m => m.tier === mat.tier + 1);
  if (!nextMat) return { success: false, message: '上位素材が見つかりません。' };
  player.materials[matId] -= needed;
  player.materials[nextMat.id] = (player.materials[nextMat.id] || 0) + 1;
  return { success: true, result: nextMat, needed };
}

// 素材1個あたりの換金額を返す
function getMaterialSellPrice(mat) {
  return Math.floor(30 * Math.pow(2, mat.tier - 1));
}

// 装備を外す
function unequipItem(player, category, slotIndex) {
  const slots = player.equipment[category];
  if (slotIndex < 0 || slotIndex >= slots.length) return false;
  slots[slotIndex] = null;
  return true;
}

// 装備ボーナスの合計を返す
function getTotalEquipBonus(player) {
  const total = {};
  const allSlots = [
    ...player.equipment.weapon,
    ...player.equipment.armor,
    ...player.equipment.acc,
  ];
  allSlots.forEach(equip => {
    if (!equip) return;
    equip.bonuses.forEach(bonus => {
      total[bonus.type] = (total[bonus.type] || 0) + bonus.value;
    });
  });
  return total;
}

// 装備ボーナスをcalcFinalStatsで使いやすい形に変換する
// elemAtk_fire などを elemAtk.fire として返す
function parseEquipBonusForStats(equipBonus) {
  const result = {};
  for (const [key, val] of Object.entries(equipBonus)) {
    if (key.startsWith('elemAtk_')) {
      if (!result.elemAtk) result.elemAtk = {};
      result.elemAtk[key.replace('elemAtk_', '')] = (result.elemAtk[key.replace('elemAtk_', '')] || 0) + val;
    } else if (key.startsWith('elemRes_')) {
      if (!result.elemRes) result.elemRes = {};
      result.elemRes[key.replace('elemRes_', '')] = (result.elemRes[key.replace('elemRes_', '')] || 0) + val;
    } else {
      result[key] = (result[key] || 0) + val;
    }
  }
  return result;
}
