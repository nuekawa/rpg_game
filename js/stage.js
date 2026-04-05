// =====================================================
// stage.js
// ステージ定義・ウェーブ管理・報酬・ボス判定
// ステージを追加・編集する場合はここを変更する
// =====================================================

const STAGE_TYPE = {
  main:     'main',
  expFarm:  'expFarm',
  goldFarm: 'goldFarm',
  matFarm:  'matFarm',
  orbFarm:  'orbFarm',
};

// ジョブ経験値の付与量（ウェーブクリアごと）
const JOB_EXP_PER_WAVE       = 45;
const JOB_EXP_PER_BOSS_WAVE  = 75;

// =====================================================
// メインステージ定義（1〜100）
// 10ステージごとにボス
// =====================================================
const MAIN_STAGES = [
  // --- ステージ1〜10：草原エリア ---
  { id:1,  name:'草原の入口',    theme:'草原', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'slime',count:2}],[{enemyId:'slime',count:3}],[{enemyId:'slime',count:2},{enemyId:'goblin',count:1}]],
    rewards:{exp:100, gold:50, matMultiplier:1.0} },
  { id:2,  name:'草原の小道',    theme:'草原', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'goblin',count:2}],[{enemyId:'slime',count:2},{enemyId:'goblin',count:1}],[{enemyId:'goblin',count:3}]],
    rewards:{exp:120, gold:60, matMultiplier:1.0} },
  { id:3,  name:'草原の丘',      theme:'草原', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'wolf',count:1}],[{enemyId:'goblin',count:2},{enemyId:'wolf',count:1}],[{enemyId:'wolf',count:2}]],
    rewards:{exp:140, gold:70, matMultiplier:1.0} },
  { id:4,  name:'草原の廃村',    theme:'草原', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'goblin',count:3}],[{enemyId:'wolf',count:2}],[{enemyId:'goblin',count:2},{enemyId:'wolf',count:1}]],
    rewards:{exp:160, gold:80, matMultiplier:1.0} },
  { id:5,  name:'草原の魔物巣',  theme:'草原', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'wolf',count:2}],[{enemyId:'wolf',count:2},{enemyId:'goblin',count:1}],[{enemyId:'wolf',count:3}]],
    rewards:{exp:180, gold:90, matMultiplier:1.0} },
  { id:6,  name:'草原の夕暮れ',  theme:'草原', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'goblin',count:3}],[{enemyId:'slime',count:3},{enemyId:'goblin',count:1}],[{enemyId:'wolf',count:3}]],
    rewards:{exp:200, gold:100, matMultiplier:1.0} },
  { id:7,  name:'草原の古戦場',  theme:'草原', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'goblin',count:2},{enemyId:'wolf',count:1}],[{enemyId:'wolf',count:3}],[{enemyId:'goblin',count:3},{enemyId:'wolf',count:1}]],
    rewards:{exp:220, gold:110, matMultiplier:1.0} },
  { id:8,  name:'草原の深部',    theme:'草原', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'wolf',count:2},{enemyId:'goblin',count:1}],[{enemyId:'wolf',count:3}],[{enemyId:'wolf',count:2},{enemyId:'goblin',count:2}]],
    rewards:{exp:240, gold:120, matMultiplier:1.0} },
  { id:9,  name:'草原の中心',    theme:'草原', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'wolf',count:3}],[{enemyId:'goblin',count:3},{enemyId:'wolf',count:1}],[{enemyId:'wolf',count:3},{enemyId:'goblin',count:1}]],
    rewards:{exp:260, gold:130, matMultiplier:1.0} },
  { id:10, name:'草原の王【BOSS】', theme:'草原', type:STAGE_TYPE.main, isBoss:true,
    waves:[[{enemyId:'goblin',count:2}],[{enemyId:'wolf',count:2}],[{enemyId:'boss_slimeKing',count:1}]],
    rewards:{exp:800, gold:400, matMultiplier:2.0} },

  // --- ステージ11〜20：森エリア ---
  { id:11, name:'深い森の入口',  theme:'森', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'orc',count:1}],[{enemyId:'orc',count:1},{enemyId:'goblin',count:1}],[{enemyId:'orc',count:2}]],
    rewards:{exp:350, gold:175, matMultiplier:1.0} },
  { id:12, name:'森の小屋',      theme:'森', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'darkElf',count:1}],[{enemyId:'orc',count:1},{enemyId:'darkElf',count:1}],[{enemyId:'darkElf',count:2}]],
    rewards:{exp:380, gold:190, matMultiplier:1.0} },
  { id:13, name:'古木の回廊',    theme:'森', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'orc',count:2}],[{enemyId:'darkElf',count:1},{enemyId:'orc',count:1}],[{enemyId:'orc',count:2},{enemyId:'darkElf',count:1}]],
    rewards:{exp:400, gold:200, matMultiplier:1.0} },
  { id:14, name:'森の聖域',      theme:'森', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'darkElf',count:2}],[{enemyId:'orc',count:1},{enemyId:'darkElf',count:2}],[{enemyId:'darkElf',count:3}]],
    rewards:{exp:420, gold:210, matMultiplier:1.0} },
  { id:15, name:'呪われた森',    theme:'森', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'orc',count:2}],[{enemyId:'darkElf',count:2}],[{enemyId:'orc',count:2},{enemyId:'darkElf',count:1}]],
    rewards:{exp:440, gold:220, matMultiplier:1.0} },
  { id:16, name:'森の魔術師跡',  theme:'森', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'darkElf',count:2}],[{enemyId:'orc',count:2},{enemyId:'darkElf',count:1}],[{enemyId:'darkElf',count:3}]],
    rewards:{exp:460, gold:230, matMultiplier:1.0} },
  { id:17, name:'暗闇の森',      theme:'森', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'orc',count:2},{enemyId:'darkElf',count:1}],[{enemyId:'orc',count:2},{enemyId:'darkElf',count:2}],[{enemyId:'darkElf',count:3},{enemyId:'orc',count:1}]],
    rewards:{exp:480, gold:240, matMultiplier:1.0} },
  { id:18, name:'妖精の廃墟',    theme:'森', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'darkElf',count:3}],[{enemyId:'orc',count:3}],[{enemyId:'darkElf',count:2},{enemyId:'orc',count:2}]],
    rewards:{exp:500, gold:250, matMultiplier:1.0} },
  { id:19, name:'森の最奥',      theme:'森', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'orc',count:3}],[{enemyId:'darkElf',count:3}],[{enemyId:'orc',count:2},{enemyId:'darkElf',count:2}]],
    rewards:{exp:520, gold:260, matMultiplier:1.0} },
  { id:20, name:'森の覇者【BOSS】', theme:'森', type:STAGE_TYPE.main, isBoss:true,
    waves:[[{enemyId:'orc',count:2}],[{enemyId:'darkElf',count:2}],[{enemyId:'boss_orcGeneral',count:1}]],
    rewards:{exp:2000, gold:1000, matMultiplier:2.0} },

  // --- ステージ21〜30：火山エリア ---
  { id:21, name:'火山の麓',      theme:'火山', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'fireSpirit',count:1}],[{enemyId:'fireSpirit',count:2}],[{enemyId:'fireSpirit',count:2},{enemyId:'orc',count:1}]],
    rewards:{exp:600, gold:300, matMultiplier:1.0} },
  { id:22, name:'溶岩地帯',      theme:'火山', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'fireSpirit',count:2}],[{enemyId:'troll',count:1}],[{enemyId:'fireSpirit',count:2},{enemyId:'troll',count:1}]],
    rewards:{exp:650, gold:325, matMultiplier:1.0} },
  { id:23, name:'火山の洞窟',    theme:'火山', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'troll',count:1},{enemyId:'fireSpirit',count:1}],[{enemyId:'troll',count:2}],[{enemyId:'troll',count:2},{enemyId:'fireSpirit',count:1}]],
    rewards:{exp:700, gold:350, matMultiplier:1.0} },
  { id:24, name:'灼熱の回廊',    theme:'火山', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'fireSpirit',count:3}],[{enemyId:'troll',count:2}],[{enemyId:'fireSpirit',count:2},{enemyId:'troll',count:1}]],
    rewards:{exp:750, gold:375, matMultiplier:1.0} },
  { id:25, name:'溶岩の神殿',    theme:'火山', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'troll',count:2}],[{enemyId:'fireSpirit',count:3}],[{enemyId:'troll',count:2},{enemyId:'fireSpirit',count:2}]],
    rewards:{exp:800, gold:400, matMultiplier:1.0} },
  { id:26, name:'炎の回廊',      theme:'火山', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'troll',count:2},{enemyId:'fireSpirit',count:1}],[{enemyId:'troll',count:3}],[{enemyId:'fireSpirit',count:3},{enemyId:'troll',count:1}]],
    rewards:{exp:850, gold:425, matMultiplier:1.0} },
  { id:27, name:'火山の中腹',    theme:'火山', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'fireSpirit',count:3}],[{enemyId:'troll',count:3}],[{enemyId:'fireSpirit',count:2},{enemyId:'troll',count:2}]],
    rewards:{exp:900, gold:450, matMultiplier:1.0} },
  { id:28, name:'溶岩の奥地',    theme:'火山', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'troll',count:3}],[{enemyId:'fireSpirit',count:3},{enemyId:'troll',count:1}],[{enemyId:'troll',count:2},{enemyId:'fireSpirit',count:3}]],
    rewards:{exp:950, gold:475, matMultiplier:1.0} },
  { id:29, name:'火山の頂上付近', theme:'火山', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'troll',count:3}],[{enemyId:'dragon',count:1}],[{enemyId:'troll',count:2},{enemyId:'fireSpirit',count:2}]],
    rewards:{exp:1000, gold:500, matMultiplier:1.0} },
  { id:30, name:'火炎の覇者【BOSS】', theme:'火山', type:STAGE_TYPE.main, isBoss:true,
    waves:[[{enemyId:'troll',count:2}],[{enemyId:'fireSpirit',count:3}],[{enemyId:'boss_darkWizard',count:1}]],
    rewards:{exp:5000, gold:2500, matMultiplier:2.5} },

  // --- ステージ31〜40：氷雪エリア ---
  { id:31, name:'雪原の入口',    theme:'氷雪', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'iceGolem',count:1}],[{enemyId:'iceGolem',count:1},{enemyId:'wolf',count:2}],[{enemyId:'iceGolem',count:2}]],
    rewards:{exp:1100, gold:550, matMultiplier:1.0} },
  { id:32, name:'凍てつく平原',  theme:'氷雪', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'iceGolem',count:2}],[{enemyId:'iceGolem',count:1},{enemyId:'dragon',count:1}],[{enemyId:'iceGolem',count:2},{enemyId:'wolf',count:2}]],
    rewards:{exp:1200, gold:600, matMultiplier:1.0} },
  { id:33, name:'氷の洞窟',      theme:'氷雪', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'iceGolem',count:2}],[{enemyId:'dragon',count:1}],[{enemyId:'iceGolem',count:3}]],
    rewards:{exp:1300, gold:650, matMultiplier:1.0} },
  { id:34, name:'吹雪の回廊',    theme:'氷雪', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'dragon',count:1},{enemyId:'iceGolem',count:1}],[{enemyId:'iceGolem',count:3}],[{enemyId:'dragon',count:1},{enemyId:'iceGolem',count:2}]],
    rewards:{exp:1400, gold:700, matMultiplier:1.0} },
  { id:35, name:'氷結の神殿',    theme:'氷雪', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'iceGolem',count:3}],[{enemyId:'dragon',count:1},{enemyId:'iceGolem',count:2}],[{enemyId:'dragon',count:2}]],
    rewards:{exp:1500, gold:750, matMultiplier:1.0} },
  { id:36, name:'雪山の峰',      theme:'氷雪', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'dragon',count:2}],[{enemyId:'iceGolem',count:3}],[{enemyId:'dragon',count:2},{enemyId:'iceGolem',count:1}]],
    rewards:{exp:1600, gold:800, matMultiplier:1.0} },
  { id:37, name:'永久凍土',      theme:'氷雪', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'iceGolem',count:2},{enemyId:'dragon',count:1}],[{enemyId:'dragon',count:2},{enemyId:'iceGolem',count:1}],[{enemyId:'iceGolem',count:3},{enemyId:'dragon',count:1}]],
    rewards:{exp:1700, gold:850, matMultiplier:1.0} },
  { id:38, name:'氷の宮殿入口',  theme:'氷雪', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'dragon',count:2}],[{enemyId:'iceGolem',count:3},{enemyId:'dragon',count:1}],[{enemyId:'dragon',count:2},{enemyId:'iceGolem',count:2}]],
    rewards:{exp:1800, gold:900, matMultiplier:1.0} },
  { id:39, name:'氷の宮殿深部',  theme:'氷雪', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'dragon',count:2},{enemyId:'iceGolem',count:1}],[{enemyId:'dragon',count:3}],[{enemyId:'iceGolem',count:2},{enemyId:'dragon',count:2}]],
    rewards:{exp:1900, gold:950, matMultiplier:1.0} },
  { id:40, name:'氷の王【BOSS】', theme:'氷雪', type:STAGE_TYPE.main, isBoss:true,
    waves:[[{enemyId:'iceGolem',count:2}],[{enemyId:'dragon',count:2}],[{enemyId:'boss_dragonLord',count:1}]],
    rewards:{exp:10000, gold:5000, matMultiplier:3.0} },

  // --- ステージ41〜50：闇の城エリア ---
  { id:41, name:'闇の城の城壁',  theme:'闇の城', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'vampire_enemy',count:1}],[{enemyId:'vampire_enemy',count:1},{enemyId:'darkElf',count:2}],[{enemyId:'vampire_enemy',count:2}]],
    rewards:{exp:12000, gold:3200, matMultiplier:1.1} },
  { id:42, name:'闇の城の廊下',  theme:'闇の城', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'vampire_enemy',count:2}],[{enemyId:'vampire_enemy',count:1},{enemyId:'dragon',count:1}],[{enemyId:'vampire_enemy',count:2},{enemyId:'darkElf',count:1}]],
    rewards:{exp:14000, gold:3600, matMultiplier:1.15} },
  { id:43, name:'闇の城の地下牢', theme:'闇の城', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'vampire_enemy',count:2}],[{enemyId:'vampire_enemy',count:2},{enemyId:'darkElf',count:1}],[{enemyId:'vampire_enemy',count:3}]],
    rewards:{exp:16000, gold:4000, matMultiplier:1.15} },
  { id:44, name:'闇の謁見室',    theme:'闇の城', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'vampire_enemy',count:3}],[{enemyId:'vampire_enemy',count:2},{enemyId:'dragon',count:1}],[{enemyId:'vampire_enemy',count:3},{enemyId:'darkElf',count:1}]],
    rewards:{exp:18000, gold:4400, matMultiplier:1.2} },
  { id:45, name:'闇の祭壇',      theme:'闇の城', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'vampire_enemy',count:2},{enemyId:'dragon',count:1}],[{enemyId:'vampire_enemy',count:3}],[{enemyId:'dragon',count:2},{enemyId:'vampire_enemy',count:2}]],
    rewards:{exp:21000, gold:5000, matMultiplier:1.2} },
  { id:46, name:'闇の塔',        theme:'闇の城', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'dragon',count:2}],[{enemyId:'vampire_enemy',count:3}],[{enemyId:'dragon',count:2},{enemyId:'vampire_enemy',count:1}]],
    rewards:{exp:24000, gold:5600, matMultiplier:1.25} },
  { id:47, name:'闇の回廊',      theme:'闇の城', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'vampire_enemy',count:3},{enemyId:'darkElf',count:1}],[{enemyId:'dragon',count:2},{enemyId:'vampire_enemy',count:1}],[{enemyId:'vampire_enemy',count:3},{enemyId:'dragon',count:1}]],
    rewards:{exp:27000, gold:6200, matMultiplier:1.25} },
  { id:48, name:'宵闇の間',      theme:'闇の城', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'dragon',count:2},{enemyId:'vampire_enemy',count:1}],[{enemyId:'vampire_enemy',count:3},{enemyId:'dragon',count:1}],[{enemyId:'dragon',count:3}]],
    rewards:{exp:30000, gold:7000, matMultiplier:1.3} },
  { id:49, name:'闇の王の間前',  theme:'闇の城', type:STAGE_TYPE.main, isBoss:false,
    waves:[[{enemyId:'vampire_enemy',count:3}],[{enemyId:'dragon',count:3}],[{enemyId:'vampire_enemy',count:2},{enemyId:'dragon',count:2}]],
    rewards:{exp:34000, gold:8000, matMultiplier:1.35} },
  { id:50, name:'闇の王【BOSS】', theme:'闇の城', type:STAGE_TYPE.main, isBoss:true,
    waves:[[{enemyId:'vampire_enemy',count:3}],[{enemyId:'dragon',count:2},{enemyId:'vampire_enemy',count:1}],[{enemyId:'boss_abyssDragon',count:1}]],
    rewards:{exp:90000, gold:20000, matMultiplier:4.0} },
];

// =====================================================
// 周回ステージ定義
// =====================================================
const FARM_DIFFICULTIES = [
  { rank:1,  label:'Lv1',  expMult:1.0, goldMult:1.0, matMult:1.0, orbMult:1.0, enemyScale:0.40 },
  { rank:2,  label:'Lv2',  expMult:1.2, goldMult:1.2, matMult:1.2, orbMult:1.2, enemyScale:0.57 },
  { rank:3,  label:'Lv3',  expMult:1.5, goldMult:1.4, matMult:1.4, orbMult:1.4, enemyScale:0.82 },
  { rank:4,  label:'Lv4',  expMult:1.8, goldMult:1.6, matMult:1.6, orbMult:1.6, enemyScale:1.17 },
  { rank:5,  label:'Lv5',  expMult:2.2, goldMult:1.8, matMult:1.8, orbMult:1.8, enemyScale:1.67 },
  { rank:6,  label:'Lv6',  expMult:2.8, goldMult:2.0, matMult:2.0, orbMult:2.0, enemyScale:2.40 },
  { rank:7,  label:'Lv7',  expMult:3.5, goldMult:2.2, matMult:2.2, orbMult:2.2, enemyScale:3.42 },
  { rank:8,  label:'Lv8',  expMult:4.5, goldMult:2.4, matMult:2.4, orbMult:2.4, enemyScale:4.88 },
  { rank:9,  label:'Lv9',  expMult:6.0, goldMult:2.6, matMult:2.6, orbMult:2.6, enemyScale:7.00 },
  { rank:10, label:'Lv10（限界）', expMult:8.0, goldMult:2.8, matMult:2.8, orbMult:2.8, enemyScale:10.0 },
];

// 周回ステージの基本定義（4種）
const FARM_STAGE_BASES = [
  {
    id:'training', name:'訓練場', type:STAGE_TYPE.expFarm,
    description:'経験値・ジョブ経験値多め。',
    waves:[[{enemyId:'slime',count:2},{enemyId:'goblin',count:1}],[{enemyId:'wolf',count:2}],[{enemyId:'orc',count:2}]],
    baseExp:500, baseGold:20, baseOrb:0, jobExpMult:2.5,
  },
  {
    id:'treasury', name:'宝物庫', type:STAGE_TYPE.goldFarm,
    description:'お金が多く手に入る。',
    waves:[[{enemyId:'goblin',count:3}],[{enemyId:'orc',count:2}],[{enemyId:'darkElf',count:2}]],
    baseExp:200, baseGold:200, baseOrb:0, jobExpMult:1.0,
  },
  {
    id:'quarry', name:'採掘場', type:STAGE_TYPE.matFarm,
    description:'素材が多く手に入る。',
    waves:[[{enemyId:'slime',count:2},{enemyId:'wolf',count:1}],[{enemyId:'orc',count:2}],[{enemyId:'troll',count:1},{enemyId:'iceGolem',count:1}]],
    baseExp:200, baseGold:30, baseOrb:0, jobExpMult:1.0,
  },
  {
    id:'ordeal', name:'試練の地', type:STAGE_TYPE.orbFarm,
    description:'スキルオーブが多く手に入る。',
    waves:[[{enemyId:'darkElf',count:2}],[{enemyId:'fireSpirit',count:2}],[{enemyId:'vampire_enemy',count:1}]],
    baseExp:300, baseGold:40, baseOrb:6, jobExpMult:1.5,
  },
];

// 難易度込みのステージIDを生成（例: 'training_3' = 訓練場 難易度3）
function getFarmStageId(baseId, rank) {
  return `${baseId}_${rank}`;
}

// 難易度込みのステージデータを生成
function buildFarmStage(base, diff) {
  // 敵のステータスをスケール
  const scaledWaves = base.waves.map(wave =>
    wave.map(e => ({ ...e, scale: diff.enemyScale }))
  );
  return {
    id:          getFarmStageId(base.id, diff.rank),
    name:        `${base.name}【${diff.label}】`,
    type:        base.type,
    description: base.description,
    waves:       scaledWaves,
    isBoss:      false,
    rewards: {
      exp:            Math.floor(base.baseExp  * diff.expMult),
      gold:           Math.floor(base.baseGold * diff.goldMult),
      matMultiplier:  diff.matMult,
      orbBonus:       Math.floor(base.baseOrb  * diff.orbMult),
      jobExpMultiplier: base.jobExpMult,
      expMultiplier:  diff.expMult,
      goldMultiplier: diff.goldMult,
    },
  };
}

const FARM_STAGES = FARM_STAGE_BASES.flatMap(base =>
  FARM_DIFFICULTIES.map(diff => buildFarmStage(base, diff))
);


// ステージIDからステージデータを取得
function getStage(stageId) {
  const main = MAIN_STAGES.find(s => s.id === stageId);
  if (main) return main;
  return FARM_STAGES.find(s => s.id === stageId) || null;
}

function getRecommendedLevelForStage(stage) {
  if (!stage || typeof stage.id !== 'number') return null;
  const id = stage.id;
  if (id <= 10) return 5 + (id - 1) * 2;
  if (id <= 20) return 35 + (id - 11) * 4;
  if (id <= 30) return 80 + (id - 21) * 6;
  if (id <= 40) return 145 + (id - 31) * 7;
  return 220 + (id - 41) * 4;
}

function getBaseStageEnemyExp(stage) {
  if (!stage?.waves) return 0;
  let total = 0;
  stage.waves.forEach(wave => {
    wave.forEach(entry => {
      const enemy = ENEMIES[entry.enemyId];
      if (!enemy) return;
      total += (enemy.exp || 0) * (entry.count || 1);
    });
  });
  return total;
}

function getStageExpMultiplier(stage) {
  if (!stage || stage.type !== STAGE_TYPE.main) return 1.0;

  const recommendedLevel = getRecommendedLevelForStage(stage);
  if (!recommendedLevel) return 1.0;

  const baseEnemyExp = getBaseStageEnemyExp(stage);
  const baseClearExp = stage.rewards?.exp || 0;
  const baseTotalExp = baseEnemyExp + baseClearExp;
  if (baseTotalExp <= 0) return 1.0;

  const targetRunsPerLevel = 2.5;
  const targetExpPerRun = expToNextLevel(recommendedLevel) / targetRunsPerLevel;
  const multiplier = targetExpPerRun / baseTotalExp;
  return Math.max(0.7, Math.min(4.0, multiplier));
}

// ステージクリア時の報酬を計算してプレイヤーに付与する
function applyStageRewards(stage, player, battleDrops) {
  const r = stage.rewards;
  const expMult  = (r.expMultiplier  || 1.0) * getStageExpMultiplier(stage);
  const goldMult = r.goldMultiplier || 1.0;
  const matMult  = r.matMultiplier  || 1.0;
  const jobMult  = r.jobExpMultiplier || 1.0;

  // 基礎報酬
  const expGain  = Math.floor((r.exp  || 0) * expMult);
  const goldGain = Math.floor((r.gold || 0) * goldMult);

  gainExp(player, expGain);
  player.gold += goldGain;

  // ドロップ素材（matMultiplierで増量）
  if (battleDrops) {
    for (const [matId, qty] of Object.entries(battleDrops.materials)) {
      player.materials[matId] = (player.materials[matId] || 0) + Math.floor(qty * matMult);
    }
    for (const [itemId, qty] of Object.entries(battleDrops.items)) {
      addItem(player, itemId, qty);
    }
  }

  // スキルオーブボーナス
  const orbBonus = r.orbBonus || 0;
  if (orbBonus > 0) player.skillOrbs += orbBonus;

  // ジョブ経験値（ステージクリア時、現在のジョブのみ）
  const jobExpGain = Math.floor(JOB_EXP_PER_WAVE * 3 * jobMult);
  gainJobExp(player, player.jobId, jobExpGain);

  return { expGain, goldGain, orbBonus };
}

// 利用可能なメインステージ一覧を返す
function getUnlockedMainStages(progress) {
  const highest = (progress.highestStage || 0) + 1;
  return MAIN_STAGES.filter(s => s.id <= highest);
}
