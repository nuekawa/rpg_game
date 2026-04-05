// =====================================================
// item.js
// アイテム定義・所持管理・使用処理
// =====================================================

const ITEM_TYPE = {
  consumable: 'consumable', // 消耗品
  rare:       'rare',       // レアアイテム（再ロール用）
  seed:       'seed',       // ステータス永続強化
};

const ITEMS = {
  // ========== 回復アイテム ==========
  potion: {
    id: 'potion', name: 'ポーション', type: ITEM_TYPE.consumable,
    usableInBattle: true, usableInMenu: true,
    description: 'HPを300回復する。',
    effect(player) { player.currentHp = Math.min(getMaxHp(player), player.currentHp + 300); },
    buyPrice: 50,
  },
  hiPotion: {
    id: 'hiPotion', name: 'ハイポーション', type: ITEM_TYPE.consumable,
    usableInBattle: true, usableInMenu: true,
    description: 'HPを1000回復する。',
    effect(player) { player.currentHp = Math.min(getMaxHp(player), player.currentHp + 1000); },
    buyPrice: 200,
  },
  megaPotion: {
    id: 'megaPotion', name: 'メガポーション', type: ITEM_TYPE.consumable,
    usableInBattle: true, usableInMenu: true,
    description: 'HPを最大値の50%回復する。',
    effect(player) { player.currentHp = Math.min(getMaxHp(player), player.currentHp + Math.floor(getMaxHp(player) * 0.5)); },
    buyPrice: 500,
  },
  elixir: {
    id: 'elixir', name: 'エリクサー', type: ITEM_TYPE.consumable,
    usableInBattle: true, usableInMenu: true,
    description: 'HPとMPを全回復する。',
    effect(player) { player.currentHp = getMaxHp(player); player.currentMp = getMaxMp(player); },
    buyPrice: 2000,
  },
  ether: {
    id: 'ether', name: 'エーテル', type: ITEM_TYPE.consumable,
    usableInBattle: true, usableInMenu: true,
    description: 'MPを100回復する。',
    effect(player) { player.currentMp = Math.min(getMaxMp(player), player.currentMp + 100); },
    buyPrice: 100,
  },
  hiEther: {
    id: 'hiEther', name: 'ハイエーテル', type: ITEM_TYPE.consumable,
    usableInBattle: true, usableInMenu: true,
    description: 'MPを500回復する。',
    effect(player) { player.currentMp = Math.min(getMaxMp(player), player.currentMp + 500); },
    buyPrice: 400,
  },
  // ========== 状態異常回復 ==========
  antidote: {
    id: 'antidote', name: '毒消し', type: ITEM_TYPE.consumable,
    usableInBattle: true, usableInMenu: true,
    description: '毒・燃焼・凍結・暴風・光蝕・呪詛を解除する。',
    effect(player) {
      const dotTypes = ['poison','burn','freeze','storm','lightRot','curse'];
      player.statusEffects = player.statusEffects.filter(s => !dotTypes.includes(s.type));
    },
    buyPrice: 80,
  },
  remedy: {
    id: 'remedy', name: 'リメディ', type: ITEM_TYPE.consumable,
    usableInBattle: true, usableInMenu: true,
    description: '全ての状態異常を解除する。',
    effect(player) { player.statusEffects = []; },
    buyPrice: 500,
  },
  // ========== 強化アイテム ==========
  powerDrink: {
    id: 'powerDrink', name: 'パワードリンク', type: ITEM_TYPE.consumable,
    usableInBattle: true, usableInMenu: false,
    description: '物理攻撃強化を3ターン付与する。',
    effect(player) { applyStatus(player, STATUS.patkUp, 3, 0); },
    buyPrice: 150,
  },
  guardDrink: {
    id: 'guardDrink', name: 'ガードドリンク', type: ITEM_TYPE.consumable,
    usableInBattle: true, usableInMenu: false,
    description: '物理・魔法防御強化を3ターン付与する。',
    effect(player) { applyStatus(player, STATUS.pdefUp, 3, 0); applyStatus(player, STATUS.mdefUp, 3, 0); },
    buyPrice: 150,
  },
  speedDrink: {
    id: 'speedDrink', name: 'スピードドリンク', type: ITEM_TYPE.consumable,
    usableInBattle: true, usableInMenu: false,
    description: '加速を3ターン付与する。',
    effect(player) { applyStatus(player, STATUS.haste, 3, 0); },
    buyPrice: 200,
  },
  // ========== ステータス永続強化アイテム ==========
  hpSeed: {
    id: 'hpSeed', name: '体力の種', type: ITEM_TYPE.seed,
    usableInBattle: false, usableInMenu: true,
    description: '最大HPを永続的に +100 増加する。',
    effect(player) { player.baseStats.hp += 100; player.currentHp = Math.min(player.currentHp + 100, getMaxHp(player)); },
    buyPrice: 5000,
  },
  mpSeed: {
    id: 'mpSeed', name: '魔力の種', type: ITEM_TYPE.seed,
    usableInBattle: false, usableInMenu: true,
    description: '最大MPを永続的に +50 増加する。',
    effect(player) { player.baseStats.mp += 50; player.currentMp = Math.min(player.currentMp + 50, getMaxMp(player)); },
    buyPrice: 5000,
  },
  strengthSeed: {
    id: 'strengthSeed', name: '力の種', type: ITEM_TYPE.seed,
    usableInBattle: false, usableInMenu: true,
    description: '物理攻撃力を永続的に +5 増加する。',
    effect(player) { player.baseStats.patk += 5; },
    buyPrice: 8000,
  },
  intelligenceSeed: {
    id: 'intelligenceSeed', name: '知力の種', type: ITEM_TYPE.seed,
    usableInBattle: false, usableInMenu: true,
    description: '魔法攻撃力を永続的に +5 増加する。',
    effect(player) { player.baseStats.matk += 5; },
    buyPrice: 8000,
  },
  enduranceSeed: {
    id: 'enduranceSeed', name: '堅牢の種', type: ITEM_TYPE.seed,
    usableInBattle: false, usableInMenu: true,
    description: '物理防御力を永続的に +3 増加する。',
    effect(player) { player.baseStats.pdef += 3; },
    buyPrice: 6000,
  },
  resilienceSeed: {
    id: 'resilienceSeed', name: '魔防の種', type: ITEM_TYPE.seed,
    usableInBattle: false, usableInMenu: true,
    description: '魔法防御力を永続的に +3 増加する。',
    effect(player) { player.baseStats.mdef += 3; },
    buyPrice: 6000,
  },
  agilitySeed: {
    id: 'agilitySeed', name: '俊敏の種', type: ITEM_TYPE.seed,
    usableInBattle: false, usableInMenu: true,
    description: '速度を永続的に +1 増加する。',
    effect(player) { player.baseStats.speed += 1; },
    buyPrice: 10000,
  },
  luckSeed: {
    id: 'luckSeed', name: '幸運の種', type: ITEM_TYPE.seed,
    usableInBattle: false, usableInMenu: true,
    description: 'クリティカル率を永続的に +0.5% 増加する。',
    effect(player) { player.baseStats.crit += 0.5; },
    buyPrice: 12000,
  },
  critDmgSeed: {
    id: 'critDmgSeed', name: 'クリティカルの種', type: ITEM_TYPE.seed,
    usableInBattle: false, usableInMenu: true,
    description: 'クリティカル倍率を永続的に +1% 増加する。',
    effect(player) { player.baseStats.critDmg += 0.01; },
    buyPrice: 12000,
  },
  // ========== 再ロールアイテム（効果種類ごと）==========
  rerollStone: {
    id: 'rerollStone', name: '再錬の石', type: ITEM_TYPE.rare,
    usableInBattle: false, usableInMenu: true,
    description: '装備の効果種類を1つ固定して残りを振り直す。',
    fixCount: 1, rerollValuesOnly: false,
    buyPrice: 1000,
  },
  rerollCrystal: {
    id: 'rerollCrystal', name: '再錬の水晶', type: ITEM_TYPE.rare,
    usableInBattle: false, usableInMenu: true,
    description: '装備の効果種類を2つ固定して残りを振り直す。',
    fixCount: 2, rerollValuesOnly: false,
    buyPrice: 3000,
  },
  // ========== 再ロールアイテム（数値のみ）==========
  valueOrb: {
    id: 'valueOrb', name: '数値錬成珠', type: ITEM_TYPE.rare,
    usableInBattle: false, usableInMenu: true,
    description: '装備の効果種類はそのままに、数値だけを全て振り直す。',
    fixCount: 0, rerollValuesOnly: true,
    buyPrice: 600,
  },
  /*valueOrbFixed1: {
    id: 'valueOrbFixed1', name: '数値錬成珠・一固', type: ITEM_TYPE.rare,
    usableInBattle: false, usableInMenu: true,
    description: '装備の数値を1つ固定して残りの数値を振り直す。',
    fixCount: 1, rerollValuesOnly: true,
    buyPrice: 1500,
  },
  valueOrbFixed2: {
    id: 'valueOrbFixed2', name: '数値錬成珠・二固', type: ITEM_TYPE.rare,
    usableInBattle: false, usableInMenu: true,
    description: '装備の数値を2つ固定して残りの数値を振り直す。',
    fixCount: 2, rerollValuesOnly: true,
    buyPrice: 4000,
  },*/
};

// アイテムを使用する
function useItem(player, itemId) {
  const item = ITEMS[itemId];
  if (!item) return { success: false, message: 'アイテムが存在しません。' };
  const count = getItemCount(player, itemId);
  if (count <= 0) return { success: false, message: 'アイテムを所持していません。' };
  if (item.effect) item.effect(player);
  consumeItem(player, itemId, 1);
  return { success: true };
}

// アイテムを取得（インベントリに追加）
function addItem(player, itemId, qty = 1) {
  const entry = player.inventory.find(i => i.itemId === itemId);
  if (entry) {
    entry.qty += qty;
  } else {
    player.inventory.push({ itemId, qty });
  }
}

// アイテムを消費
function consumeItem(player, itemId, qty = 1) {
  const entry = player.inventory.find(i => i.itemId === itemId);
  if (!entry || entry.qty < qty) return false;
  entry.qty -= qty;
  if (entry.qty <= 0) {
    player.inventory = player.inventory.filter(i => i.itemId !== itemId);
  }
  return true;
}

// アイテムの所持数を返す
function getItemCount(player, itemId) {
  const entry = player.inventory.find(i => i.itemId === itemId);
  return entry ? entry.qty : 0;
}
