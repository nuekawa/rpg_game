// =====================================================
// job.js
// ジョブ定義（Lv4/8/10のみスキル習得、他はステータス増加）
// =====================================================

function jobExpToNextLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
}

const JOBS = {
  knight: {
    id:'knight', name:'ナイト', category:'physical',
    description:'物理攻撃特化。高い攻撃力で敵を叩きのめす。',
    statBonus:{ patk:15, pdef:5 },
    levels:{
      1:  { type:'job',       statBonus:{ patk:15 } },
      2:  { type:'job',       statBonus:{ patk_pct:5, pdef:10 } },
      3:  { type:'job',       statBonus:{ patk:20, crit:2 } },
      4:  { type:'universal', skillId:'slash',        statBonus:{ patk:25 } },
      5:  { type:'job',       statBonus:{ patk_pct:8, pdef_pct:5 } },
      6:  { type:'job',       statBonus:{ patk:30, speed:5 } },
      7:  { type:'job',       statBonus:{ patk_pct:10, crit:3 } },
      8:  { type:'universal', skillId:'powerStrike',  statBonus:{ patk:40 } },
      9:  { type:'job',       statBonus:{ patk_pct:12, pdef_pct:8 } },
      10: { type:'master',    skillId:'knight_master',statBonus:{ patk_pct:20, pdef_pct:10 } },
    },
  },
  paladin: {
    id:'paladin', name:'パラディン', category:'physical',
    description:'物理防御特化。堅牢な守りで敵の攻撃を受け止める。',
    statBonus:{ pdef:20, hp:100 },
    levels:{
      1:  { type:'job',       statBonus:{ pdef:20, hp:80 } },
      2:  { type:'job',       statBonus:{ pdef_pct:5, hpRegen:5 } },
      3:  { type:'job',       statBonus:{ pdef:25, mdef:10 } },
      4:  { type:'universal', skillId:'shield',         statBonus:{ pdef:30 } },
      5:  { type:'job',       statBonus:{ pdef_pct:8, hp:150 } },
      6:  { type:'job',       statBonus:{ pdef:35, hpRegen:8 } },
      7:  { type:'job',       statBonus:{ pdef_pct:12, mdef:20 } },
      8:  { type:'universal', skillId:'holyShield',     statBonus:{ pdef:50 } },
      9:  { type:'job',       statBonus:{ pdef_pct:15, mdef_pct:8 } },
      10: { type:'master',    skillId:'paladin_master', statBonus:{ pdef_pct:25, mdef_pct:12, hp_pct:10 } },
    },
  },
  monk: {
    id:'monk', name:'モンク', category:'physical',
    description:'HP特化。圧倒的な生命力で戦場に立ち続ける。',
    statBonus:{ hp:300, patk:5 },
    levels:{
      1:  { type:'job',       statBonus:{ hp:150 } },
      2:  { type:'job',       statBonus:{ hp_pct:5, hpRegen:8 } },
      3:  { type:'job',       statBonus:{ hp:200, patk:10 } },
      4:  { type:'universal', skillId:'ironFist',    statBonus:{ hp:250 } },
      5:  { type:'job',       statBonus:{ hp_pct:10, hpRegen:15 } },
      6:  { type:'job',       statBonus:{ hp:300, pdef:15 } },
      7:  { type:'job',       statBonus:{ hp_pct:15, patk_pct:5 } },
      8:  { type:'universal', skillId:'chakra',      statBonus:{ hp:400 } },
      9:  { type:'job',       statBonus:{ hp_pct:20, hpRegen:25 } },
      10: { type:'master',    skillId:'monk_master', statBonus:{ hp_pct:30, patk_pct:10 } },
    },
  },
  ninja: {
    id:'ninja', name:'忍者', category:'physical',
    description:'クリティカル特化。急所を突いた一撃で敵を仕留める。',
    statBonus:{ crit:10, speed:20 },
    levels:{
      1:  { type:'job',       statBonus:{ crit:5, speed:8 } },
      2:  { type:'job',       statBonus:{ critDmg:0.1, eva:10 } },
      3:  { type:'job',       statBonus:{ crit:8, speed:10 } },
      4:  { type:'universal', skillId:'shadowStrike',  statBonus:{ crit:10 } },
      5:  { type:'job',       statBonus:{ critDmg:0.15, speed:12 } },
      6:  { type:'job',       statBonus:{ crit:12, eva:15 } },
      7:  { type:'job',       statBonus:{ critDmg:0.2, speed:15 } },
      8:  { type:'universal', skillId:'assassination', statBonus:{ crit:15 } },
      9:  { type:'job',       statBonus:{ critDmg:0.25, speed:18 } },
      10: { type:'master',    skillId:'ninja_master',  statBonus:{ crit:20, critDmg:0.5, speed:25 } },
    },
  },
  holyKnight: {
    id:'holyKnight', name:'聖騎士', category:'physical',
    description:'光属性物理攻撃が得意。神聖なる力で敵を討つ。',
    statBonus:{ patk:10, elemAtk:{ light:1.3 } },
    levels:{
      1:  { type:'job',       statBonus:{ patk:12, hpRegen:5 } },
      2:  { type:'job',       statBonus:{ elemAtk_light_pct:10, pdef:10 } },
      3:  { type:'job',       statBonus:{ patk:18, elemRes_light_pct:10 } },
      4:  { type:'universal', skillId:'holyBlade',        statBonus:{ patk:22 } },
      5:  { type:'job',       statBonus:{ elemAtk_light_pct:15, patk_pct:5 } },
      6:  { type:'job',       statBonus:{ patk:28, hpRegen:10 } },
      7:  { type:'job',       statBonus:{ elemAtk_light_pct:20, pdef_pct:5 } },
      8:  { type:'universal', skillId:'divineCleave',     statBonus:{ patk:35 } },
      9:  { type:'job',       statBonus:{ elemAtk_light_pct:25, patk_pct:8 } },
      10: { type:'master',    skillId:'holyKnight_master',statBonus:{ patk_pct:15, elemAtk_light_pct:30, elemRes_light_pct:20 } },
    },
  },
  darkKnight: {
    id:'darkKnight', name:'暗黒騎士', category:'physical',
    description:'闇属性物理攻撃が得意。暗黒の力を振るう剣士。',
    statBonus:{ patk:10, elemAtk:{ dark:1.3 } },
    levels:{
      1:  { type:'job',       statBonus:{ patk:12, lifeSteal:2 } },
      2:  { type:'job',       statBonus:{ elemAtk_dark_pct:10, patk:8 } },
      3:  { type:'job',       statBonus:{ patk:18, elemRes_dark_pct:10 } },
      4:  { type:'universal', skillId:'darkBlade',        statBonus:{ patk:22 } },
      5:  { type:'job',       statBonus:{ elemAtk_dark_pct:15, lifeSteal:4 } },
      6:  { type:'job',       statBonus:{ patk:28, elemRes_dark_pct:15 } },
      7:  { type:'job',       statBonus:{ elemAtk_dark_pct:20, patk_pct:5 } },
      8:  { type:'universal', skillId:'shadowCleave',     statBonus:{ patk:35 } },
      9:  { type:'job',       statBonus:{ elemAtk_dark_pct:25, lifeSteal:8 } },
      10: { type:'master',    skillId:'darkKnight_master',statBonus:{ patk_pct:15, elemAtk_dark_pct:30, lifeSteal:12 } },
    },
  },
  magicSword: {
    id:'magicSword', name:'魔法剣士', category:'physical',
    description:'火・氷・風属性物理攻撃が得意。魔力を刃に宿す。',
    statBonus:{ patk:8, matk:8 },
    levels:{
      1:  { type:'job',       statBonus:{ patk:10, matk:10 } },
      2:  { type:'job',       statBonus:{ elemAtk_fire_pct:8, elemAtk_ice_pct:8 } },
      3:  { type:'job',       statBonus:{ patk:15, elemAtk_wind_pct:8 } },
      4:  { type:'universal', skillId:'fireBlade',        statBonus:{ patk:18, matk:18 } },
      5:  { type:'job',       statBonus:{ patk_pct:5, matk_pct:5, elemAtk_fire_pct:10 } },
      6:  { type:'job',       statBonus:{ elemAtk_ice_pct:12, elemAtk_wind_pct:12 } },
      7:  { type:'job',       statBonus:{ patk_pct:8, matk_pct:8 } },
      8:  { type:'universal', skillId:'elementalBlade',   statBonus:{ patk:30, matk:30 } },
      9:  { type:'job',       statBonus:{ elemAtk_fire_pct:18, elemAtk_ice_pct:18, elemAtk_wind_pct:18 } },
      10: { type:'master',    skillId:'magicSword_master',statBonus:{ patk_pct:15, matk_pct:15, elemAtk_fire_pct:22, elemAtk_ice_pct:22, elemAtk_wind_pct:22 } },
    },
  },
  vampire: {
    id:'vampire', name:'吸血鬼', category:'physical',
    description:'吸血特化。与えたダメージの一部をHPとして吸収する。',
    statBonus:{ lifeSteal:10, patk:8 },
    levels:{
      1:  { type:'job',       statBonus:{ lifeSteal:4, patk:10 } },
      2:  { type:'job',       statBonus:{ lifeSteal:5, hp:80 } },
      3:  { type:'job',       statBonus:{ patk:15, manaSteal:3 } },
      4:  { type:'universal', skillId:'bloodSuck',     statBonus:{ lifeSteal:6 } },
      5:  { type:'job',       statBonus:{ lifeSteal:8, patk_pct:5 } },
      6:  { type:'job',       statBonus:{ patk:22, manaSteal:5 } },
      7:  { type:'job',       statBonus:{ lifeSteal:10, hp_pct:8 } },
      8:  { type:'universal', skillId:'drainTouch',    statBonus:{ lifeSteal:12 } },
      9:  { type:'job',       statBonus:{ lifeSteal:15, manaSteal:8 } },
      10: { type:'master',    skillId:'vampire_master',statBonus:{ lifeSteal:20, manaSteal:12, patk_pct:10 } },
    },
  },
  archer: {
    id:'archer', name:'弓使い', category:'physical',
    description:'回避率特化。素早い身のこなしで攻撃を躱す。',
    statBonus:{ eva:20, speed:15 },
    levels:{
      1:  { type:'job',       statBonus:{ eva:10, speed:6 } },
      2:  { type:'job',       statBonus:{ eva:12, hit:10 } },
      3:  { type:'job',       statBonus:{ speed:10, eva:14 } },
      4:  { type:'universal', skillId:'quickShot',   statBonus:{ eva:16 } },
      5:  { type:'job',       statBonus:{ speed:14, crit:5 } },
      6:  { type:'job',       statBonus:{ eva:20, hit:15 } },
      7:  { type:'job',       statBonus:{ speed:18, eva:22 } },
      8:  { type:'universal', skillId:'multiShot',   statBonus:{ eva:25 } },
      9:  { type:'job',       statBonus:{ speed:22, crit:8 } },
      10: { type:'master',    skillId:'archer_master',statBonus:{ eva:40, speed:28, crit:12 } },
    },
  },
  hunter: {
    id:'hunter', name:'狩人', category:'physical',
    description:'命中率特化。確実に急所を捉える精密な攻撃を得意とする。',
    statBonus:{ hit:30, patk:5 },
    levels:{
      1:  { type:'job',       statBonus:{ hit:18, patk:8 } },
      2:  { type:'job',       statBonus:{ hit:22, crit:3 } },
      3:  { type:'job',       statBonus:{ patk:12, hit:25 } },
      4:  { type:'universal', skillId:'trueShot',     statBonus:{ hit:28 } },
      5:  { type:'job',       statBonus:{ hit:32, patk_pct:5 } },
      6:  { type:'job',       statBonus:{ crit:6, hit:35 } },
      7:  { type:'job',       statBonus:{ patk_pct:8, hit:38 } },
      8:  { type:'universal', skillId:'deadeye',      statBonus:{ hit:42 } },
      9:  { type:'job',       statBonus:{ hit:48, crit:10 } },
      10: { type:'master',    skillId:'hunter_master',statBonus:{ hit:55, patk_pct:12, crit:12 } },
    },
  },
  dancer: {
    id:'dancer', name:'踊り子', category:'other',
    description:'魔法防御特化。舞踏の力で魔法攻撃を和らげる。',
    statBonus:{ mdef:20, speed:10 },
    levels:{
      1:  { type:'job',       statBonus:{ mdef:15, speed:5 } },
      2:  { type:'job',       statBonus:{ mdef_pct:5, mpRegen:3 } },
      3:  { type:'job',       statBonus:{ mdef:20, speed:8 } },
      4:  { type:'universal', skillId:'enchantDance', statBonus:{ mdef:25 } },
      5:  { type:'job',       statBonus:{ mdef_pct:8, mpRegen:5 } },
      6:  { type:'job',       statBonus:{ mdef:30, speed:10 } },
      7:  { type:'job',       statBonus:{ mdef_pct:12, mp:80 } },
      8:  { type:'universal', skillId:'wardingDance', statBonus:{ mdef:38 } },
      9:  { type:'job',       statBonus:{ mdef_pct:15, mpRegen:8 } },
      10: { type:'master',    skillId:'dancer_master',statBonus:{ mdef_pct:25, speed:18, mpRegen:10 } },
    },
  },
  blackMage: {
    id:'blackMage', name:'黒魔導士', category:'magic',
    description:'火・氷・風呪文が得意。強力な攻撃魔法で敵を焼き払う。',
    statBonus:{ matk:15, elemAtk:{ fire:1.2, ice:1.2, wind:1.2 } },
    levels:{
      1:  { type:'job',       statBonus:{ matk:15, mp:30 } },
      2:  { type:'job',       statBonus:{ matk_pct:5, elemAtk_fire_pct:8 } },
      3:  { type:'job',       statBonus:{ matk:20, elemAtk_ice_pct:8 } },
      4:  { type:'universal', skillId:'fireball',         statBonus:{ matk:25 } },
      5:  { type:'job',       statBonus:{ matk_pct:8, elemAtk_wind_pct:10 } },
      6:  { type:'job',       statBonus:{ matk:32, mp:60 } },
      7:  { type:'job',       statBonus:{ matk_pct:12, elemAtk_fire_pct:12 } },
      8:  { type:'universal', skillId:'inferno',          statBonus:{ matk:42 } },
      9:  { type:'job',       statBonus:{ matk_pct:15, elemAtk_ice_pct:15, elemAtk_wind_pct:15 } },
      10: { type:'master',    skillId:'blackMage_master', statBonus:{ matk_pct:25, elemAtk_fire_pct:22, elemAtk_ice_pct:22, elemAtk_wind_pct:22 } },
    },
  },
  whiteMage: {
    id:'whiteMage', name:'白魔導士', category:'magic',
    description:'回復・防御呪文が得意。仲間を癒し、守護する。',
    statBonus:{ mdef:10, hpRegen:5 },
    levels:{
      1:  { type:'job',       statBonus:{ mdef:12, hpRegen:6 } },
      2:  { type:'job',       statBonus:{ hpRegen:8, mpRegen:3 } },
      3:  { type:'job',       statBonus:{ mdef:16, hp:100 } },
      4:  { type:'universal', skillId:'cure',            statBonus:{ mdef:20 } },
      5:  { type:'job',       statBonus:{ mdef_pct:8, hpRegen:12 } },
      6:  { type:'job',       statBonus:{ mdef:26, mpRegen:5 } },
      7:  { type:'job',       statBonus:{ mdef_pct:12, hp:150 } },
      8:  { type:'universal', skillId:'fullCure',        statBonus:{ mdef:34 } },
      9:  { type:'job',       statBonus:{ mdef_pct:16, hpRegen:20 } },
      10: { type:'master',    skillId:'whiteMage_master',statBonus:{ mdef_pct:22, hpRegen:30, mpRegen:10 } },
    },
  },
  sage: {
    id:'sage', name:'賢者', category:'magic',
    description:'魔法攻撃力特化。あらゆる魔法の威力を極限まで高める。',
    statBonus:{ matk:20, mp:50 },
    levels:{
      1:  { type:'job',       statBonus:{ matk:18, mp:40 } },
      2:  { type:'job',       statBonus:{ matk_pct:6, mpRegen:4 } },
      3:  { type:'job',       statBonus:{ matk:25, mp:60 } },
      4:  { type:'universal', skillId:'arcaneBlast',  statBonus:{ matk:30 } },
      5:  { type:'job',       statBonus:{ matk_pct:10, mp:80 } },
      6:  { type:'job',       statBonus:{ matk:40, mpRegen:6 } },
      7:  { type:'job',       statBonus:{ matk_pct:14, mp:100 } },
      8:  { type:'universal', skillId:'manaOverflow', statBonus:{ matk:55 } },
      9:  { type:'job',       statBonus:{ matk_pct:18, mpRegen:9 } },
      10: { type:'master',    skillId:'sage_master',  statBonus:{ matk_pct:30, mp_pct:20, mpRegen:12 } },
    },
  },
  timeMage: {
    id:'timeMage', name:'時魔導士', category:'magic',
    description:'時間を操る呪文を使いこなす。速度と遅延の魔法が得意。',
    statBonus:{ speed:10, mpRegen:3 },
    levels:{
      1:  { type:'job',       statBonus:{ speed:4,  mpRegen:2 } },
      2:  { type:'job',       statBonus:{ speed:5,  eva:8 } },
      3:  { type:'job',       statBonus:{ speed:6,  mpRegen:4 } },
      4:  { type:'universal', skillId:'haste',          statBonus:{ speed:7 } },
      5:  { type:'job',       statBonus:{ speed:8,  mp:60 } },
      6:  { type:'job',       statBonus:{ speed:9,  mpRegen:6 } },
      7:  { type:'job',       statBonus:{ speed:10, eva:15 } },
      8:  { type:'universal', skillId:'stopwatch',      statBonus:{ speed:12 } },
      9:  { type:'job',       statBonus:{ speed:13, mpRegen:8 } },
      10: { type:'master',    skillId:'timeMage_master',statBonus:{ speed:16, mpRegen:12, eva:18 } },
    },
  },
  spiritMage: {
    id:'spiritMage', name:'精霊術師', category:'magic',
    description:'光属性魔法が得意。精霊の力を借りて聖なる呪文を操る。',
    statBonus:{ matk:12, elemAtk:{ light:1.3 } },
    levels:{
      1:  { type:'job',       statBonus:{ matk:14, mpRegen:3 } },
      2:  { type:'job',       statBonus:{ elemAtk_light_pct:10, mdef:10 } },
      3:  { type:'job',       statBonus:{ matk:20, elemRes_light_pct:10 } },
      4:  { type:'universal', skillId:'holySpell',       statBonus:{ matk:25 } },
      5:  { type:'job',       statBonus:{ matk_pct:8, elemAtk_light_pct:15 } },
      6:  { type:'job',       statBonus:{ matk:32, elemRes_light_pct:15 } },
      7:  { type:'job',       statBonus:{ matk_pct:12, elemAtk_light_pct:20 } },
      8:  { type:'universal', skillId:'divineRay',       statBonus:{ matk:42 } },
      9:  { type:'job',       statBonus:{ matk_pct:16, elemAtk_light_pct:25 } },
      10: { type:'master',    skillId:'spiritMage_master',statBonus:{ matk_pct:24, elemAtk_light_pct:35, elemRes_light_pct:22 } },
    },
  },
  darkMage: {
    id:'darkMage', name:'暗黒術師', category:'magic',
    description:'闇属性魔法が得意。呪いと暗黒の呪文を操る。',
    statBonus:{ matk:12, elemAtk:{ dark:1.3 } },
    levels:{
      1:  { type:'job',       statBonus:{ matk:14, lifeSteal:2 } },
      2:  { type:'job',       statBonus:{ elemAtk_dark_pct:10, matk:8 } },
      3:  { type:'job',       statBonus:{ matk:20, elemRes_dark_pct:10 } },
      4:  { type:'universal', skillId:'darkSpell',       statBonus:{ matk:25 } },
      5:  { type:'job',       statBonus:{ matk_pct:8, elemAtk_dark_pct:15 } },
      6:  { type:'job',       statBonus:{ matk:32, lifeSteal:5 } },
      7:  { type:'job',       statBonus:{ matk_pct:12, elemAtk_dark_pct:20 } },
      8:  { type:'universal', skillId:'voidBlast',       statBonus:{ matk:42 } },
      9:  { type:'job',       statBonus:{ matk_pct:16, elemAtk_dark_pct:25 } },
      10: { type:'master',    skillId:'darkMage_master', statBonus:{ matk_pct:24, elemAtk_dark_pct:35, lifeSteal:10 } },
    },
  },
  astrologer: {
    id:'astrologer', name:'占星術師', category:'magic',
    description:'バリア特化。星の力を借りて強固な防壁を張る。',
    statBonus:{ mdef:15, hp:50 },
    levels:{
      1:  { type:'job',       statBonus:{ mdef:18, hp:60 } },
      2:  { type:'job',       statBonus:{ mdef_pct:5, mpRegen:3 } },
      3:  { type:'job',       statBonus:{ mdef:24, hp:100 } },
      4:  { type:'universal', skillId:'starBarrier',     statBonus:{ mdef:28 } },
      5:  { type:'job',       statBonus:{ mdef_pct:10, hp:120 } },
      6:  { type:'job',       statBonus:{ mdef:35, mpRegen:5 } },
      7:  { type:'job',       statBonus:{ mdef_pct:15, hp_pct:8 } },
      8:  { type:'universal', skillId:'stellarWall',     statBonus:{ mdef:45 } },
      9:  { type:'job',       statBonus:{ mdef_pct:18, mpRegen:8 } },
      10: { type:'master',    skillId:'astrologer_master',statBonus:{ mdef_pct:28, hp_pct:12, mpRegen:12 } },
    },
  },
};

function gainJobExp(player, jobId, amount) {
  if (!player.jobProgress[jobId]) return false;
  const progress = player.jobProgress[jobId];
  if (progress.level >= 10) return false;
  progress.exp += amount;
  let leveledUp = false;
  while (progress.level < 10 && progress.exp >= jobExpToNextLevel(progress.level)) {
    progress.exp -= jobExpToNextLevel(progress.level);
    progress.level++;
    const reward = JOBS[jobId]?.levels[progress.level];
    if (reward?.skillId && !player.learnedSkills.includes(reward.skillId)) {
      player.learnedSkills.push(reward.skillId);
    }
    if (reward?.statBonus) applyJobLevelStatBonus(player, reward.statBonus);
    leveledUp = true;
  }
  return leveledUp;
}

function applyJobLevelStatBonus(player, bonus) {
  const b = player.baseStats;
  for (const key in bonus) {
    const val = bonus[key];
    if (key.endsWith('_pct')) {
      const statKey = key.replace('_pct', '');
      if (statKey.startsWith('elemAtk_')) {
        const elem = statKey.replace('elemAtk_', '');
        if (b.elemAtk[elem] !== undefined) b.elemAtk[elem] += val / 100;
      } else if (statKey.startsWith('elemRes_')) {
        const elem = statKey.replace('elemRes_', '');
        if (b.elemRes[elem] !== undefined) b.elemRes[elem] += val / 100;
      } else {
        if (b[statKey] !== undefined) b[statKey] += Math.floor(b[statKey] * val / 100);
      }
    } else if (key.startsWith('elemAtk_')) {
      const elem = key.replace('elemAtk_', '');
      if (b.elemAtk[elem] !== undefined) b.elemAtk[elem] += val;
    } else if (key.startsWith('elemRes_')) {
      const elem = key.replace('elemRes_', '');
      if (b.elemRes[elem] !== undefined) b.elemRes[elem] += val;
    } else {
      if (b[key] !== undefined) b[key] += val;
    }
  }
}

function getJobStatBonus(jobId, jobLevel) {
  const job = JOBS[jobId];
  if (!job) return {};
  const bonus = { ...job.statBonus };
  const scale = 1 + (jobLevel - 1) * 0.1;
  const result = {};
  for (const key in bonus) {
    if (key === 'elemAtk' || key === 'elemRes') {
      result[key] = {};
      for (const elem in bonus[key]) result[key][elem] = bonus[key][elem];
    } else {
      result[key] = Math.floor(bonus[key] * scale);
    }
  }
  return result;
}

// マスター済みジョブのボーナスを集計する
// 各マスタージョブの statBonus の20%を追加付与
function getMasterBonuses(player) {
  const bonus = {};
  for (const jobId in player.jobProgress) {
    if (!isJobMastered(player, jobId)) continue;
    const job = JOBS[jobId];
    if (!job?.statBonus) continue;
    for (const [key, val] of Object.entries(job.statBonus)) {
      if (key === 'elemAtk' || key === 'elemRes') {
        if (!bonus[key]) bonus[key] = {};
        for (const elem in val) {
          // val[elem] は倍率（例: 1.3）。追加ボーナスは超過分の20%
          const existing = bonus[key][elem] || 1;
          bonus[key][elem] = existing * (1 + (val[elem] - 1) * 0.2);
        }
      } else {
        bonus[key] = (bonus[key] || 0) + Math.floor(val * 0.2);
      }
    }
  }
  return bonus;
}
function isJobMastered(player, jobId) { return player.jobProgress[jobId]?.level >= 10; }
