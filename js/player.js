// =====================================================
// player.js
// キャラクターの基本データ・レベルアップ・ステータス計算
// =====================================================

function createPlayer(name) {
  return {
    name: name || '主人公',
    level: 1,
    exp: 0,

    baseStats: {
      hp:      600,
      mp:      150,
      patk:    20,
      matk:    20,
      pdef:    10,
      mdef:    10,
      hit:     100,
      eva:     20,
      crit:    5,
      critDmg: 1.5,
      speed:   100,
      hpRegen: 0,
      mpRegen: 2,
      lifeSteal: 0,
      manaSteal: 0,
      trueDmg:   0,
      elemAtk: { fire: 1.0, ice: 1.0, wind: 1.0, light: 1.0, dark: 1.0 },
      elemRes: { fire: 1.0, ice: 1.0, wind: 1.0, light: 1.0, dark: 1.0 },
    },

    currentHp: 600,
    currentMp: 150,
    barrier: 0,
    statusEffects: [],

    jobId: 'knight',

    jobProgress: {
      knight:     { level: 1, exp: 0 },
      paladin:    { level: 1, exp: 0 },
      monk:       { level: 1, exp: 0 },
      ninja:      { level: 1, exp: 0 },
      holyKnight: { level: 1, exp: 0 },
      darkKnight: { level: 1, exp: 0 },
      magicSword: { level: 1, exp: 0 },
      vampire:    { level: 1, exp: 0 },
      archer:     { level: 1, exp: 0 },
      hunter:     { level: 1, exp: 0 },
      dancer:     { level: 1, exp: 0 },
      blackMage:  { level: 1, exp: 0 },
      whiteMage:  { level: 1, exp: 0 },
      sage:       { level: 1, exp: 0 },
      timeMage:   { level: 1, exp: 0 },
      spiritMage: { level: 1, exp: 0 },
      darkMage:   { level: 1, exp: 0 },
      astrologer: { level: 1, exp: 0 },
    },

    learnedSkills: [],
    equippedSkills: [null, null, null, null],
    skillLevels: {},

    equipment: {
      weapon: [null, null],
      armor:  [null, null, null],
      acc:    [null, null, null],
    },

    inventory: [],
    gold: 0,
    materials: {},
    skillOrbs: 0,
  };
}

// 次のレベルに必要な経験値
function expToNextLevel(level) {
  return Math.floor(120 * Math.pow(level, 1.60));
}

// 経験値を加算してレベルアップ処理、レベルアップしたらtrueを返す
function gainExp(player, amount) {
  player.exp += amount;
  let leveledUp = false;
  while (player.exp >= expToNextLevel(player.level)) {
    player.exp -= expToNextLevel(player.level);
    player.level++;
    levelUpStats(player);
    leveledUp = true;
  }
  return leveledUp;
}

// レベルアップ時のステータス上昇（ランダム±20%）
function levelUpStats(player) {
  function rand(base) {
    const min = Math.floor(base * 0.88);
    const max = Math.floor(base * 1.12);
    return min + Math.floor(Math.random() * (max - min + 1));
  }
  player.baseStats.hp    += rand(58);
  player.baseStats.mp    += rand(12);
  player.baseStats.patk  += rand(5);
  player.baseStats.matk  += rand(5);
  player.baseStats.pdef  += rand(5);
  player.baseStats.mdef  += rand(5);
  player.baseStats.hit   += rand(1);
  if (Math.random() < 0.30) player.baseStats.eva += 1;
  if (Math.random() < 0.18) player.baseStats.crit += 1;
  if (Math.random() < 0.45) player.baseStats.speed += 1;
}

// 命中率を計算する（%）
// 適正レベル（差0）で90%、差が大きいと最大95%・最低60%
function calcHitRate(hit, eva) {
  const diff = hit - eva;
  const rate = 90 + 10 * diff / (Math.abs(diff) + 100);
  return Math.min(95, Math.max(60, rate));
}

// 最終ステータスを計算して返す（装備・ジョブ・パッシブ込み）
function calcFinalStats(player) {
  const base = player.baseStats;
  // parseEquipBonusForStats で elemAtk_fire → elemAtk.fire に変換してから使う
  const equipBonus  = parseEquipBonusForStats(getTotalEquipBonus(player));
  const jobBonus    = getJobStatBonus(player.jobId, player.jobProgress[player.jobId].level);
  const masterBonus = getMasterBonuses(player);

  function sum(key) {
    return (base[key] || 0) + (equipBonus[key] || 0) + (jobBonus[key] || 0) + (masterBonus[key] || 0);
  }

  return {
    hp:        Math.floor(sum('hp')),
    mp:        Math.floor(sum('mp')),
    patk:      Math.floor(sum('patk')),
    matk:      Math.floor(sum('matk')),
    pdef:      Math.floor(sum('pdef')),
    mdef:      Math.floor(sum('mdef')),
    hit:       Math.floor(sum('hit')),
    eva:       Math.floor(sum('eva')),
    crit:      Math.floor(sum('crit')),
    critDmg:   base.critDmg + (equipBonus.critDmg || 0) + (jobBonus.critDmg || 0) + (masterBonus.critDmg || 0),
    speed:     Math.floor(sum('speed')),
    hpRegen:   Math.floor(sum('hpRegen')),
    mpRegen:   Math.floor(sum('mpRegen')),
    lifeSteal: Math.floor(sum('lifeSteal')),
    manaSteal: Math.floor(sum('manaSteal')),
    trueDmg:   Math.floor(sum('trueDmg')),
    elemAtk: {
      // 装備ボーナスは加算（+0.3）、ジョブ/マスターボーナスは乗算（×1.3）
      fire:  (base.elemAtk.fire  + (equipBonus.elemAtk?.fire  || 0)) * (jobBonus.elemAtk?.fire  || 1) * (masterBonus.elemAtk?.fire  || 1),
      ice:   (base.elemAtk.ice   + (equipBonus.elemAtk?.ice   || 0)) * (jobBonus.elemAtk?.ice   || 1) * (masterBonus.elemAtk?.ice   || 1),
      wind:  (base.elemAtk.wind  + (equipBonus.elemAtk?.wind  || 0)) * (jobBonus.elemAtk?.wind  || 1) * (masterBonus.elemAtk?.wind  || 1),
      light: (base.elemAtk.light + (equipBonus.elemAtk?.light || 0)) * (jobBonus.elemAtk?.light || 1) * (masterBonus.elemAtk?.light || 1),
      dark:  (base.elemAtk.dark  + (equipBonus.elemAtk?.dark  || 0)) * (jobBonus.elemAtk?.dark  || 1) * (masterBonus.elemAtk?.dark  || 1),
    },
    elemRes: {
      fire:  (base.elemRes.fire  + (equipBonus.elemRes?.fire  || 0)) * (jobBonus.elemRes?.fire  || 1) * (masterBonus.elemRes?.fire  || 1),
      ice:   (base.elemRes.ice   + (equipBonus.elemRes?.ice   || 0)) * (jobBonus.elemRes?.ice   || 1) * (masterBonus.elemRes?.ice   || 1),
      wind:  (base.elemRes.wind  + (equipBonus.elemRes?.wind  || 0)) * (jobBonus.elemRes?.wind  || 1) * (masterBonus.elemRes?.wind  || 1),
      light: (base.elemRes.light + (equipBonus.elemRes?.light || 0)) * (jobBonus.elemRes?.light || 1) * (masterBonus.elemRes?.light || 1),
      dark:  (base.elemRes.dark  + (equipBonus.elemRes?.dark  || 0)) * (jobBonus.elemRes?.dark  || 1) * (masterBonus.elemRes?.dark  || 1),
    },
  };
}

function getMaxHp(player) { return calcFinalStats(player).hp; }
function getMaxMp(player) { return calcFinalStats(player).mp; }
