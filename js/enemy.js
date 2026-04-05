// =====================================================
// enemy.js - 敵定義（最序盤を緩和・経験値調整済み）
// ステージ50で999Lv目標：敵1体の経験値を大幅増加
// =====================================================

const ENEMIES = {
  // ========== 序盤（St.1〜10）弱め ==========
  slime: {
    id:'slime', name:'スライム',
    stats:{ hp:80, mp:0, patk:8, matk:0, pdef:3, mdef:3, hit:75, eva:5, crit:2, critDmg:1.5, speed:60,
      hpRegen:0, mpRegen:0, lifeSteal:0, manaSteal:0, trueDmg:0,
      elemAtk:{fire:1,ice:1,wind:1,light:1,dark:1}, elemRes:{fire:1,ice:1.5,wind:1,light:1,dark:1} },
    exp:200, gold:8,
    drops:[{materialId:'wood',chance:0.85,count:1},{materialId:'wood',chance:0.4,count:1},{skillOrb:true,chance:0.10,count:1}],
    actions:[{type:'attack',weight:1}],
  },
  goblin: {
    id:'goblin', name:'ゴブリン',
    stats:{ hp:120, mp:0, patk:12, matk:0, pdef:5, mdef:3, hit:80, eva:6, crit:3, critDmg:1.5, speed:85,
      hpRegen:0, mpRegen:0, lifeSteal:0, manaSteal:0, trueDmg:0,
      elemAtk:{fire:1,ice:1,wind:1,light:1,dark:1}, elemRes:{fire:1,ice:1,wind:1,light:1,dark:1} },
    exp:300, gold:12,
    drops:[{materialId:'stone',chance:0.70,count:1},{materialId:'wood',chance:0.45,count:1},{skillOrb:true,chance:0.12,count:1}],
    actions:[{type:'attack',weight:2},{type:'skill',skillId:'double_attack',weight:1}],
  },
  wolf: {
    id:'wolf', name:'ウルフ',
    stats:{ hp:150, mp:0, patk:16, matk:0, pdef:4, mdef:5, hit:85, eva:10, crit:5, critDmg:1.6, speed:100,
      hpRegen:0, mpRegen:0, lifeSteal:0, manaSteal:0, trueDmg:0,
      elemAtk:{fire:1,ice:1,wind:1,light:1,dark:1}, elemRes:{fire:1,ice:0.8,wind:1,light:1,dark:1} },
    exp:400, gold:16,
    drops:[{materialId:'stone',chance:0.75,count:1},{materialId:'copper',chance:0.25,count:1},{skillOrb:true,chance:0.14,count:1}],
    actions:[{type:'attack',weight:2},{type:'skill',skillId:'bite',weight:1}],
  },

  // ========== 中盤（St.11〜30）==========
  orc: {
    id:'orc', name:'オーク',
    stats:{ hp:600, mp:0, patk:35, matk:0, pdef:18, mdef:8, hit:80, eva:6, crit:3, critDmg:1.5, speed:75,
      hpRegen:0, mpRegen:0, lifeSteal:0, manaSteal:0, trueDmg:0,
      elemAtk:{fire:1,ice:1,wind:1,light:1,dark:1}, elemRes:{fire:1,ice:1,wind:1,light:1,dark:1} },
    exp:1200, gold:40,
    drops:[{materialId:'copper',chance:0.80,count:1},{materialId:'bronze',chance:0.30,count:1},{skillOrb:true,chance:0.18,count:1}],
    actions:[{type:'attack',weight:2},{type:'skill',skillId:'heavy_strike',weight:1}],
  },
  darkElf: {
    id:'darkElf', name:'ダークエルフ',
    stats:{ hp:500, mp:100, patk:18, matk:40, pdef:8, mdef:18, hit:88, eva:14, crit:8, critDmg:1.7, speed:98,
      hpRegen:0, mpRegen:5, lifeSteal:0, manaSteal:0, trueDmg:0,
      elemAtk:{fire:1,ice:1,wind:1,light:0.7,dark:1.3}, elemRes:{fire:1,ice:1,wind:1,light:0.7,dark:1.3} },
    exp:1500, gold:50,
    drops:[{materialId:'copper',chance:0.70,count:1},{materialId:'bronze',chance:0.25,count:1},{skillOrb:true,chance:0.18,count:1}],
    actions:[{type:'attack',weight:1},{type:'skill',skillId:'dark_bolt',weight:2}],
  },
  fireSpirit: {
    id:'fireSpirit', name:'炎の精霊',
    stats:{ hp:450, mp:150, patk:8, matk:45, pdef:4, mdef:22, hit:86, eva:12, crit:7, critDmg:1.6, speed:102,
      hpRegen:0, mpRegen:8, lifeSteal:0, manaSteal:0, trueDmg:0,
      elemAtk:{fire:1.5,ice:0.5,wind:1,light:1,dark:1}, elemRes:{fire:2,ice:0.5,wind:1,light:1,dark:1} },
    exp:1600, gold:55,
    drops:[{materialId:'bronze',chance:0.75,count:1},{materialId:'iron',chance:0.30,count:1},{skillOrb:true,chance:0.20,count:1}],
    actions:[{type:'skill',skillId:'fire_breath',weight:2},{type:'skill',skillId:'ember',weight:1}],
  },

  // ========== 後半（St.31〜50）==========
  troll: {
    id:'troll', name:'トロール',
    stats:{ hp:2500, mp:0, patk:80, matk:0, pdef:50, mdef:20, hit:76, eva:4, crit:4, critDmg:1.5, speed:62,
      hpRegen:30, mpRegen:0, lifeSteal:0, manaSteal:0, trueDmg:0,
      elemAtk:{fire:1,ice:1,wind:1,light:1,dark:1}, elemRes:{fire:0.8,ice:1.2,wind:1,light:1,dark:1} },
    exp:3500, gold:80,
    drops:[{materialId:'iron',chance:0.80,count:1},{materialId:'steel',chance:0.35,count:1},{skillOrb:true,chance:0.20,count:1}],
    actions:[{type:'attack',weight:2},{type:'skill',skillId:'club_smash',weight:1}],
  },
  iceGolem: {
    id:'iceGolem', name:'アイスゴーレム',
    stats:{ hp:2000, mp:50, patk:70, matk:70, pdef:60, mdef:60, hit:78, eva:4, crit:3, critDmg:1.5, speed:58,
      hpRegen:0, mpRegen:0, lifeSteal:0, manaSteal:0, trueDmg:0,
      elemAtk:{fire:0.5,ice:1.5,wind:1,light:1,dark:1}, elemRes:{fire:0.5,ice:2,wind:1,light:1,dark:1} },
    exp:4000, gold:90,
    drops:[{materialId:'iron',chance:0.70,count:1},{materialId:'steel',chance:0.40,count:1},{skillOrb:true,chance:0.20,count:1}],
    actions:[{type:'attack',weight:1},{type:'skill',skillId:'ice_slam',weight:2}],
  },
  vampire_enemy: {
    id:'vampire_enemy', name:'ヴァンパイア',
    stats:{ hp:11000, mp:260, patk:300, matk:280, pdef:180, mdef:220, hit:108, eva:20, crit:16, critDmg:2.0, speed:132,
      hpRegen:40, mpRegen:12, lifeSteal:18, manaSteal:0, trueDmg:0,
      elemAtk:{fire:1,ice:1,wind:1,light:0.5,dark:1.5}, elemRes:{fire:1,ice:1,wind:1,light:0.5,dark:1.5} },
    exp:18000, gold:520,
    drops:[{materialId:'steel',chance:0.80,count:2},{materialId:'silver',chance:0.40,count:1},{itemId:'rerollStone',chance:0.12,count:1},{skillOrb:true,chance:0.30,count:2}],
    actions:[{type:'attack',weight:1},{type:'skill',skillId:'drain',weight:2},{type:'skill',skillId:'dark_bolt',weight:1}],
  },
  dragon: {
    id:'dragon', name:'ドラゴン',
    stats:{ hp:18000, mp:260, patk:420, matk:360, pdef:260, mdef:240, hit:102, eva:12, crit:12, critDmg:2.0, speed:124,
      hpRegen:140, mpRegen:10, lifeSteal:0, manaSteal:0, trueDmg:0,
      elemAtk:{fire:1.5,ice:0.5,wind:1,light:1,dark:1}, elemRes:{fire:2,ice:0.5,wind:1,light:1,dark:1} },
    exp:26000, gold:760,
    drops:[{materialId:'silver',chance:0.80,count:2},{materialId:'gold',chance:0.45,count:1},{itemId:'rerollStone',chance:0.20,count:1},{skillOrb:true,chance:0.32,count:2}],
    actions:[{type:'attack',weight:1},{type:'skill',skillId:'fire_breath',weight:2},{type:'skill',skillId:'wing_gust',weight:1}],
  },

  // ========== ボス ==========
  boss_slimeKing: {
    id:'boss_slimeKing', name:'スライムキング', isBoss:true,
    stats:{ hp:1500, mp:100, patk:30, matk:20, pdef:18, mdef:18, hit:82, eva:8, crit:4, critDmg:1.7, speed:78,
      hpRegen:8, mpRegen:3, lifeSteal:0, manaSteal:0, trueDmg:0,
      elemAtk:{fire:1,ice:1.2,wind:1,light:1,dark:1}, elemRes:{fire:1,ice:1.5,wind:1,light:1,dark:1} },
    exp:8000, gold:200,
    drops:[{materialId:'copper',chance:1.0,count:5},{materialId:'stone',chance:1.0,count:3},{itemId:'hiPotion',chance:1.0,count:2},{itemId:'rerollStone',chance:0.5,count:1}],
    actions:[{type:'attack',weight:2},{type:'skill',skillId:'acid_splash',weight:1}],
  },
  boss_orcGeneral: {
    id:'boss_orcGeneral', name:'オーク将軍', isBoss:true,
    stats:{ hp:8000, mp:60, patk:140, matk:25, pdef:100, mdef:40, hit:83, eva:7, crit:7, critDmg:1.8, speed:82,
      hpRegen:25, mpRegen:0, lifeSteal:0, manaSteal:0, trueDmg:0,
      elemAtk:{fire:1,ice:1,wind:1,light:1,dark:1}, elemRes:{fire:1,ice:1,wind:1,light:1,dark:1} },
    exp:25000, gold:600,
    drops:[{materialId:'iron',chance:1.0,count:5},{materialId:'bronze',chance:1.0,count:3},{itemId:'megaPotion',chance:1.0,count:2},{itemId:'rerollStone',chance:0.6,count:1}],
    actions:[{type:'attack',weight:2},{type:'skill',skillId:'heavy_strike',weight:1},{type:'skill',skillId:'war_cry',weight:1}],
  },
  boss_darkWizard: {
    id:'boss_darkWizard', name:'闇の魔導士', isBoss:true,
    stats:{ hp:12000, mp:500, patk:40, matk:220, pdef:40, mdef:130, hit:90, eva:12, crit:14, critDmg:2.0, speed:108,
      hpRegen:0, mpRegen:20, lifeSteal:0, manaSteal:0, trueDmg:0,
      elemAtk:{fire:1,ice:1,wind:1,light:0.5,dark:1.8}, elemRes:{fire:1,ice:1,wind:1,light:0.5,dark:2} },
    exp:40000, gold:1000,
    drops:[{materialId:'steel',chance:1.0,count:5},{materialId:'silver',chance:1.0,count:2},{itemId:'rerollCrystal',chance:0.4,count:1},{itemId:'elixir',chance:0.7,count:1}],
    actions:[{type:'skill',skillId:'dark_bolt',weight:2},{type:'skill',skillId:'curse_all',weight:1},{type:'attack',weight:1}],
  },
  boss_dragonLord: {
    id:'boss_dragonLord', name:'ドラゴンロード', isBoss:true,
    stats:{ hp:70000, mp:600, patk:560, matk:500, pdef:360, mdef:340, hit:104, eva:14, crit:16, critDmg:2.2, speed:132,
      hpRegen:260, mpRegen:18, lifeSteal:0, manaSteal:0, trueDmg:0,
      elemAtk:{fire:2,ice:0.3,wind:1,light:1,dark:1}, elemRes:{fire:2.5,ice:0.3,wind:1,light:1,dark:1} },
    exp:180000, gold:6000,
    drops:[{materialId:'mythril',chance:1.0,count:5},{materialId:'gold',chance:1.0,count:3},{itemId:'rerollCrystal',chance:0.85,count:1},{itemId:'elixir',chance:1.0,count:2}],
    actions:[{type:'attack',weight:1},{type:'skill',skillId:'fire_breath',weight:2},{type:'skill',skillId:'dragon_roar',weight:1}],
  },
  boss_abyssDragon: {
    id:'boss_abyssDragon', name:'深淵竜ドラゴン', isBoss:true,
    stats:{ hp:120000, mp:700, patk:820, matk:720, pdef:540, mdef:500, hit:112, eva:16, crit:18, critDmg:2.3, speed:144,
      hpRegen:320, mpRegen:22, lifeSteal:0, manaSteal:0, trueDmg:40,
      elemAtk:{fire:2.2,ice:0.3,wind:1.2,light:1,dark:1.2}, elemRes:{fire:2.8,ice:0.3,wind:1.1,light:1,dark:1.2} },
    exp:320000, gold:12000,
    drops:[{materialId:'mythril',chance:1.0,count:6},{materialId:'orichalcum',chance:1.0,count:2},{itemId:'rerollCrystal',chance:1.0,count:2},{itemId:'elixir',chance:1.0,count:3},{skillOrb:true,chance:1.0,count:8}],
    actions:[{type:'attack',weight:1},{type:'skill',skillId:'fire_breath',weight:2},{type:'skill',skillId:'wing_gust',weight:1},{type:'skill',skillId:'dragon_roar',weight:1}],
  },
};

const ENEMY_SKILLS = {
  double_attack: { name:'二連撃',      attackType:'physical', power:0.7, hits:2, element:'none', statusEffect:null },
  bite:          { name:'噛みつき',    attackType:'physical', power:1.2, element:'none', statusEffect:{type:'poison',turns:2,value:0} },
  heavy_strike:  { name:'強打',        attackType:'physical', power:1.8, element:'none', statusEffect:{type:'vulnerable',turns:2,value:0} },
  dark_bolt:     { name:'闇の矢',      attackType:'magical',  power:1.4, element:'dark', statusEffect:{type:'curse',turns:2,value:20} },
  fire_breath:   { name:'炎のブレス',  attackType:'magical',  power:1.7, element:'fire', target:'all', statusEffect:{type:'burn',turns:3,value:25} },
  ember:         { name:'火の粉',      attackType:'magical',  power:0.9, element:'fire', statusEffect:{type:'burn',turns:2,value:15} },
  club_smash:    { name:'クラブスマッシュ', attackType:'physical', power:2.2, element:'none', statusEffect:{type:'slow',turns:2,value:0} },
  ice_slam:      { name:'アイスラム',  attackType:'physical', power:1.7, element:'ice',  statusEffect:{type:'freeze',turns:2,value:20} },
  wing_gust:     { name:'ウィングガスト', attackType:'physical', power:1.1, element:'wind', target:'all', statusEffect:{type:'storm',turns:2,value:20} },
  drain:         { name:'ドレイン',    attackType:'magical',  power:1.2, element:'dark', lifeStealBonus:80, statusEffect:null },
  acid_splash:   { name:'アシッドスプラッシュ', attackType:'magical', power:0.9, element:'none', target:'all', statusEffect:{type:'vulnerable',turns:3,value:0} },
  war_cry:       { name:'ウォークライ', attackType:'none', element:'none', selfBuff:'patk', statusEffect:null },
  curse_all:     { name:'呪いの言葉', attackType:'none', element:'dark', target:'player', statusEffect:{type:'curse',turns:3,value:30} },
  dragon_roar:   { name:'ドラゴンロア', attackType:'none', element:'none', target:'player', statusEffect:{type:'paralyze',turns:2,value:0} },
};

function scaleEnemyStats(stats, scale) {
  if (scale === 1) {
    return { ...stats, elemAtk:{ ...stats.elemAtk }, elemRes:{ ...stats.elemRes } };
  }

  return {
    ...stats,
    hp: Math.floor(stats.hp * Math.pow(scale, 1.35)),
    mp: Math.floor((stats.mp || 0) * Math.pow(scale, 1.12)),
    patk: Math.floor(stats.patk * Math.pow(scale, 1.16)),
    matk: Math.floor(stats.matk * Math.pow(scale, 1.16)),
    pdef: Math.floor(stats.pdef * Math.pow(scale, 1.12)),
    mdef: Math.floor(stats.mdef * Math.pow(scale, 1.12)),
    hit: Math.floor(stats.hit * (1 + (scale - 1) * 0.18)),
    eva: Math.floor(stats.eva * (1 + (scale - 1) * 0.08)),
    crit: Math.floor(stats.crit * (1 + (scale - 1) * 0.15)),
    critDmg: parseFloat((stats.critDmg + Math.max(0, scale - 1) * 0.05).toFixed(2)),
    speed: Math.floor(stats.speed * (1 + (scale - 1) * 0.12)),
    hpRegen: Math.floor((stats.hpRegen || 0) * Math.pow(scale, 1.2)),
    mpRegen: Math.floor((stats.mpRegen || 0) * Math.pow(scale, 1.12)),
    lifeSteal: stats.lifeSteal || 0,
    manaSteal: stats.manaSteal || 0,
    trueDmg: Math.floor((stats.trueDmg || 0) * Math.pow(scale, 1.16)),
    elemAtk:{ ...stats.elemAtk },
    elemRes:{ ...stats.elemRes },
  };
}

function createEnemyInstance(enemyId, scale = 1) {
  const def = ENEMIES[enemyId];
  if (!def) return null;
  const scaledStats = scaleEnemyStats(def.stats, scale);
  return {
    ...def,
    stats:         scaledStats,
    currentHp:     scaledStats.hp,
    currentMp:     scaledStats.mp || 0,
    barrier:       0,
    statusEffects: [],
  };
}

function decideEnemyAction(enemy) {
  const actions = enemy.actions || [{ type:'attack', weight:1 }];
  const total = actions.reduce((s, a) => s + a.weight, 0);
  let rand = Math.random() * total;
  for (const a of actions) { rand -= a.weight; if (rand <= 0) return a; }
  return actions[actions.length - 1];
}

function rollDrops(enemy) {
  const drops = { materials:{}, items:{}, skillOrbs:0 };
  (enemy.drops || []).forEach(drop => {
    if (Math.random() < drop.chance) {
      if (drop.materialId)  drops.materials[drop.materialId] = (drops.materials[drop.materialId] || 0) + (drop.count || 1);
      else if (drop.itemId) drops.items[drop.itemId] = (drops.items[drop.itemId] || 0) + (drop.count || 1);
      else if (drop.skillOrb) drops.skillOrbs += (drop.count || 1);
    }
  });
  return drops;
}

function applyDrops(player, drops) {
  for (const [id, qty] of Object.entries(drops.materials)) player.materials[id] = (player.materials[id] || 0) + qty;
  for (const [id, qty] of Object.entries(drops.items)) addItem(player, id, qty);
  if (drops.skillOrbs > 0) player.skillOrbs += drops.skillOrbs;
}
