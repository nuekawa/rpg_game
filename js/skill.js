// =====================================================
// skill.js
// スキル定義（Lv4/8/10のみ習得、他はステータス増加）
// 割合+実数値スキル：実数値のみスケール
// =====================================================

const ELEMENTS = { none:'none', fire:'fire', ice:'ice', wind:'wind', light:'light', dark:'dark' };
const ATTACK_TYPE = { physical:'physical', magical:'magical', true:'true' };
const TARGET = { self:'self', single:'single', all:'all' };

// MP消費計算：基本MPCost + 強化Lv × scaleMp
// 割合回復スキル：healHpPct（固定）+ healHpFlat（スケール対象）
const SKILLS = {

  // ========== ナイト ==========
  slash: { id:'slash', name:'斬撃',
    mpCost:20, scaleMp:3, element:'none', attackType:'physical', target:'single', power:1.6,
    description:'物理攻撃で敵単体に1.6倍ダメージ。' },
  powerStrike: { id:'powerStrike', name:'パワーストライク',
    mpCost:50, scaleMp:8, element:'none', attackType:'physical', target:'single', power:2.8,
    description:'物理攻撃で敵単体に2.8倍ダメージ。脆弱を2T付与。', statusEffect:{type:'vulnerable',turns:2} },
  knight_master: { id:'knight_master', name:'覇王の一撃',
    mpCost:120, scaleMp:15, element:'none', attackType:'physical', target:'single', power:6.0,
    description:'【MASTER】物理攻撃で敵単体に6.0倍の超強力ダメージ。脆弱3T付与。', statusEffect:{type:'vulnerable',turns:3} },

  // ========== パラディン ==========
  shield: { id:'shield', name:'シールド',
    mpCost:30, scaleMp:4, element:'none', attackType:'none', target:'self',
    description:'自身に物理防御強化3T付与。', statusEffect:{type:'pdefUp',turns:3} },
  holyShield: { id:'holyShield', name:'ホーリーシールド',
    mpCost:60, scaleMp:8, element:'light', attackType:'none', target:'self',
    description:'バリアを張る（魔法攻撃力×3）。物理・魔法防御強化3T付与。', barrierMult:3.0, statusEffect:{type:'pdefUp',turns:3}, statusEffect2:{type:'mdefUp',turns:3} },
  paladin_master: { id:'paladin_master', name:'神盾',
    mpCost:150, scaleMp:20, element:'light', attackType:'none', target:'self',
    description:'【MASTER】超強力バリア（最大HP×0.6）＋全防御強化4T付与。', barrierHpMult:0.6, statusEffect:{type:'pdefUp',turns:4}, statusEffect2:{type:'mdefUp',turns:4} },

  // ========== モンク ==========
  ironFist: { id:'ironFist', name:'アイアンフィスト',
    mpCost:25, scaleMp:4, element:'none', attackType:'physical', target:'single', power:1.8,
    description:'素手で敵単体に1.8倍ダメージ。' },
  chakra: { id:'chakra', name:'チャクラ',
    mpCost:50, scaleMp:6, element:'none', attackType:'none', target:'self',
    description:'HPを最大値の25%＋実数値回復。リジェネ3T付与。',
    healHpPct:25, healHpFlat:100, statusEffect:{type:'regen',turns:3,value:50} },
  monk_master: { id:'monk_master', name:'覇気放出',
    mpCost:100, scaleMp:12, element:'none', attackType:'physical', target:'all', power:3.5,
    description:'【MASTER】全敵に3.5倍ダメージ。自身に物理攻撃強化4T付与。', statusEffect:{type:'patkUp',turns:4} },

  // ========== 忍者 ==========
  shadowStrike: { id:'shadowStrike', name:'シャドウストライク',
    mpCost:30, scaleMp:5, element:'none', attackType:'physical', target:'single', power:1.8, critBonus:25,
    description:'敵単体に1.8倍ダメージ。クリティカル率+25%。' },
  assassination: { id:'assassination', name:'アサシネーション',
    mpCost:70, scaleMp:10, element:'none', attackType:'physical', target:'single', power:4.0, critBonus:60,
    description:'敵単体に4.0倍ダメージ。クリティカル率+60%。' },
  ninja_master: { id:'ninja_master', name:'千刃',
    mpCost:130, scaleMp:15, element:'none', attackType:'physical', target:'single', power:1.2, hits:8, critBonus:40,
    description:'【MASTER】敵単体に1.2倍×8回ダメージ。クリティカル率+40%。' },

  // ========== 聖騎士 ==========
  holyBlade: { id:'holyBlade', name:'ホーリーブレード',
    mpCost:35, scaleMp:5, element:'light', attackType:'physical', target:'single', power:1.8,
    description:'光属性物理攻撃で敵単体に1.8倍ダメージ。光蝕2T付与。', statusEffect:{type:'lightRot',turns:2,value:30} },
  divineCleave: { id:'divineCleave', name:'ディバインクリーブ',
    mpCost:70, scaleMp:10, element:'light', attackType:'physical', target:'all', power:1.6,
    description:'光属性物理攻撃で全敵に1.6倍ダメージ。光蝕3T付与。', statusEffect:{type:'lightRot',turns:3,value:40} },
  holyKnight_master: { id:'holyKnight_master', name:'天光断',
    mpCost:150, scaleMp:18, element:'light', attackType:'physical', target:'all', power:3.0,
    description:'【MASTER】光属性物理で全敵に3.0倍ダメージ。光蝕4T＋脆弱3T付与。', statusEffect:{type:'lightRot',turns:4,value:60}, statusEffect2:{type:'vulnerable',turns:3} },

  // ========== 暗黒騎士 ==========
  darkBlade: { id:'darkBlade', name:'ダークブレード',
    mpCost:35, scaleMp:5, element:'dark', attackType:'physical', target:'single', power:1.8,
    description:'闇属性物理攻撃で敵単体に1.8倍ダメージ。呪詛2T付与。', statusEffect:{type:'curse',turns:2,value:30} },
  shadowCleave: { id:'shadowCleave', name:'シャドウクリーブ',
    mpCost:70, scaleMp:10, element:'dark', attackType:'physical', target:'all', power:1.6,
    description:'闇属性物理攻撃で全敵に1.6倍ダメージ。呪詛3T付与。', statusEffect:{type:'curse',turns:3,value:40} },
  darkKnight_master: { id:'darkKnight_master', name:'奈落断',
    mpCost:150, scaleMp:18, element:'dark', attackType:'physical', target:'all', power:3.0,
    description:'【MASTER】闇属性物理で全敵に3.0倍ダメージ。呪詛4T＋脆弱3T付与。', statusEffect:{type:'curse',turns:4,value:60}, statusEffect2:{type:'vulnerable',turns:3} },

  // ========== 魔法剣士 ==========
  fireBlade: { id:'fireBlade', name:'ファイアブレード',
    mpCost:35, scaleMp:5, element:'fire', attackType:'physical', target:'single', power:1.8,
    description:'火属性物理攻撃で敵単体に1.8倍ダメージ。燃焼2T付与。', statusEffect:{type:'burn',turns:2,value:25} },
  elementalBlade: { id:'elementalBlade', name:'エレメンタルブレード',
    mpCost:80, scaleMp:10, element:'fire', elements:['fire','ice','wind'], attackType:'physical', target:'all', power:2.0,
    description:'火・氷・風属性で全敵に2.0倍ダメージ。燃焼・凍結・暴風3T付与。',
    statusEffect:{type:'burn',turns:3,value:25}, statusEffect2:{type:'freeze',turns:3,value:20}, statusEffect3:{type:'storm',turns:3,value:20} },
  magicSword_master: { id:'magicSword_master', name:'三属元素斬',
    mpCost:160, scaleMp:20, element:'fire', elements:['fire','ice','wind'], attackType:'physical', target:'all', power:3.5,
    description:'【MASTER】三属性で全敵に3.5倍ダメージ。全属性状態異常4T付与。',
    statusEffect:{type:'burn',turns:4,value:40}, statusEffect2:{type:'freeze',turns:4,value:35}, statusEffect3:{type:'storm',turns:4,value:35} },

  // ========== 吸血鬼 ==========
  bloodSuck: { id:'bloodSuck', name:'ブラッドサック',
    mpCost:30, scaleMp:4, element:'dark', attackType:'physical', target:'single', power:1.6, lifeStealBonus:60,
    description:'敵単体に1.6倍ダメージ。ダメージの60%をHP吸収。' },
  drainTouch: { id:'drainTouch', name:'ドレインタッチ',
    mpCost:60, scaleMp:8, element:'dark', attackType:'magical', target:'single', power:1.5, lifeStealBonus:100,
    description:'魔法攻撃で敵単体に1.5倍ダメージ。ダメージの100%をHP吸収。' },
  vampire_master: { id:'vampire_master', name:'血の宴',
    mpCost:140, scaleMp:18, element:'dark', attackType:'physical', target:'all', power:2.5, lifeStealBonus:80,
    description:'【MASTER】全敵に2.5倍ダメージ。ダメージの80%をHP吸収。' },

  // ========== 弓使い ==========
  quickShot: { id:'quickShot', name:'クイックショット',
    mpCost:20, scaleMp:3, element:'none', attackType:'physical', target:'single', power:1.4,
    description:'素早く矢を放ち敵単体に1.4倍ダメージ。' },
  multiShot: { id:'multiShot', name:'マルチショット',
    mpCost:60, scaleMp:8, element:'none', attackType:'physical', target:'all', power:1.3,
    description:'全敵に1.3倍ダメージ。自身に加速2T付与。', statusEffect:{type:'haste',turns:2} },
  archer_master: { id:'archer_master', name:'幻矢',
    mpCost:120, scaleMp:15, element:'none', attackType:'physical', target:'single', power:5.0, critBonus:50,
    description:'【MASTER】敵単体に5.0倍ダメージ。クリティカル率+50%。' },

  // ========== 狩人 ==========
  trueShot: { id:'trueShot', name:'トゥルーショット',
    mpCost:25, scaleMp:4, element:'none', attackType:'physical', target:'single', power:1.7, hitBonus:40,
    description:'必中に近い精度で敵単体に1.7倍ダメージ（命中+40）。' },
  deadeye: { id:'deadeye', name:'デッドアイ',
    mpCost:65, scaleMp:9, element:'none', attackType:'physical', target:'single', power:3.0, hitBonus:60, critBonus:35,
    description:'敵単体に3.0倍ダメージ（命中+60、クリ率+35%）。脆弱3T付与。', statusEffect:{type:'vulnerable',turns:3} },
  hunter_master: { id:'hunter_master', name:'神眼一矢',
    mpCost:140, scaleMp:18, element:'none', attackType:'physical', target:'single', power:6.0, guaranteed:true,
    description:'【MASTER】敵単体に6.0倍の必中ダメージ。脆弱4T付与。', statusEffect:{type:'vulnerable',turns:4} },

  // ========== 踊り子 ==========
  enchantDance: { id:'enchantDance', name:'エンチャントダンス',
    mpCost:30, scaleMp:4, element:'none', attackType:'none', target:'self',
    description:'魔法防御強化3T＋加速2T付与。', statusEffect:{type:'mdefUp',turns:3}, statusEffect2:{type:'haste',turns:2} },
  wardingDance: { id:'wardingDance', name:'ウォーディングダンス',
    mpCost:65, scaleMp:8, element:'none', attackType:'none', target:'self',
    description:'物理・魔法防御強化4T＋バリア付与（魔法攻撃力×2）。', statusEffect:{type:'pdefUp',turns:4}, statusEffect2:{type:'mdefUp',turns:4}, barrierMult:2.0 },
  dancer_master: { id:'dancer_master', name:'天上の舞',
    mpCost:100, scaleMp:12, element:'none', attackType:'none', target:'self',
    description:'【MASTER】全バフ4T付与＋HP・MPを40%＋実数値回復。', healHpPct:40, healHpFlat:300, healMpPct:40, healMpFlat:100, allBuffs:true },

  // ========== 黒魔導士 ==========
  fireball: { id:'fireball', name:'ファイアボール',
    mpCost:35, scaleMp:5, element:'fire', attackType:'magical', target:'all', power:1.5,
    description:'火属性魔法で全敵に1.5倍ダメージ。燃焼3T付与。', statusEffect:{type:'burn',turns:3,value:30} },
  inferno: { id:'inferno', name:'インフェルノ',
    mpCost:80, scaleMp:12, element:'fire', attackType:'magical', target:'all', power:3.0,
    description:'強力な火属性魔法で全敵に3.0倍ダメージ。燃焼4T付与。', statusEffect:{type:'burn',turns:4,value:50} },
  blackMage_master: { id:'blackMage_master', name:'メテオ',
    mpCost:180, scaleMp:25, element:'fire', elements:['fire','ice','wind'], attackType:'magical', target:'all', power:6.0,
    description:'【MASTER】超強力な火属性魔法で全敵に6.0倍ダメージ。燃焼・凍結・暴風5T付与。',
    statusEffect:{type:'burn',turns:5,value:60}, statusEffect2:{type:'freeze',turns:5,value:50}, statusEffect3:{type:'storm',turns:5,value:50} },

  // ========== 白魔導士 ==========
  cure: { id:'cure', name:'ケアル',
    mpCost:30, scaleMp:4, element:'none', attackType:'none', target:'self',
    description:'HPを最大値の30%＋実数値回復。', healHpPct:30, healHpFlat:80 },
  fullCure: { id:'fullCure', name:'フルキュア',
    mpCost:70, scaleMp:10, element:'none', attackType:'none', target:'self',
    description:'HPを最大値の60%＋実数値回復。全デバフ解除。', healHpPct:60, healHpFlat:300, clearDebuffs:true },
  whiteMage_master: { id:'whiteMage_master', name:'奇跡の光',
    mpCost:0, scaleMp:0, element:'light', attackType:'none', target:'self',
    description:'【MASTER】HP・MPを70%＋実数値全回復。全デバフ解除＋大バリア付与。', healHpPct:70, healHpFlat:1000, healMpPct:70, healMpFlat:300, clearDebuffs:true, barrierHpMult:0.4 },

  // ========== 賢者 ==========
  arcaneBlast: { id:'arcaneBlast', name:'アルカンブラスト',
    mpCost:50, scaleMp:7, element:'none', attackType:'magical', target:'single', power:3.0,
    description:'純粋な魔力で敵単体に3.0倍ダメージ。魔法攻撃強化3T付与。', statusEffect:{type:'matkUp',turns:3} },
  manaOverflow: { id:'manaOverflow', name:'マナオーバーフロー',
    mpCost:100, scaleMp:15, element:'none', attackType:'magical', target:'all', power:4.0,
    description:'魔力を爆発させ全敵に4.0倍ダメージ。魔法攻撃強化4T付与。', statusEffect:{type:'matkUp',turns:4} },
  sage_master: { id:'sage_master', name:'魔力解放',
    mpCost:0, scaleMp:0, element:'none', attackType:'magical', target:'all', power:7.0,
    description:'【MASTER】全MPを消費して全敵に超強力ダメージ（消費MPが多いほど威力UP）。', mpDrainPower:true },

  // ========== 時魔導士 ==========
  haste: { id:'haste', name:'ヘイスト',
    mpCost:30, scaleMp:4, element:'none', attackType:'none', target:'self',
    description:'自身に加速3T付与（速度25%UP）。', statusEffect:{type:'haste',turns:3} },
  stopwatch: { id:'stopwatch', name:'ストップウォッチ',
    mpCost:65, scaleMp:9, element:'none', attackType:'none', target:'single',
    description:'全敵に麻痺2T＋鈍足3T付与。', statusEffect:{type:'paralyze',turns:2,target:'enemy'}, statusEffect2:{type:'slow',turns:3,target:'enemy'} },
  timeMage_master: { id:'timeMage_master', name:'タイムストップ',
    mpCost:150, scaleMp:20, element:'none', attackType:'none', target:'all',
    description:'【MASTER】全敵に麻痺4T＋鈍足4T付与。自身に加速4T付与。', statusEffect:{type:'paralyze',turns:4,target:'enemy'}, statusEffect2:{type:'slow',turns:4,target:'enemy'}, selfHaste:4 },

  // ========== 精霊術師 ==========
  holySpell: { id:'holySpell', name:'ホーリースペル',
    mpCost:40, scaleMp:6, element:'light', attackType:'magical', target:'single', power:2.0,
    description:'光属性魔法で敵単体に2.0倍ダメージ。光蝕3T付与。', statusEffect:{type:'lightRot',turns:3,value:35} },
  divineRay: { id:'divineRay', name:'ディバインレイ',
    mpCost:85, scaleMp:12, element:'light', attackType:'magical', target:'all', power:2.5,
    description:'光属性魔法で全敵に2.5倍ダメージ。光蝕4T付与。', statusEffect:{type:'lightRot',turns:4,value:50} },
  spiritMage_master: { id:'spiritMage_master', name:'聖光爆炎',
    mpCost:180, scaleMp:25, element:'light', attackType:'magical', target:'all', power:6.0,
    description:'【MASTER】光属性魔法で全敵に6.0倍ダメージ。光蝕5T付与。', statusEffect:{type:'lightRot',turns:5,value:80} },

  // ========== 暗黒術師 ==========
  darkSpell: { id:'darkSpell', name:'ダークスペル',
    mpCost:40, scaleMp:6, element:'dark', attackType:'magical', target:'single', power:2.0,
    description:'闇属性魔法で敵単体に2.0倍ダメージ。呪詛3T付与。', statusEffect:{type:'curse',turns:3,value:35} },
  voidBlast: { id:'voidBlast', name:'ヴォイドブラスト',
    mpCost:85, scaleMp:12, element:'dark', attackType:'magical', target:'all', power:2.5,
    description:'闇属性魔法で全敵に2.5倍ダメージ。呪詛4T付与。', statusEffect:{type:'curse',turns:4,value:50} },
  darkMage_master: { id:'darkMage_master', name:'奈落の業炎',
    mpCost:180, scaleMp:25, element:'dark', attackType:'magical', target:'all', power:6.0,
    description:'【MASTER】闇属性魔法で全敵に6.0倍ダメージ。呪詛5T付与。', statusEffect:{type:'curse',turns:5,value:80} },

  // ========== 占星術師 ==========
  starBarrier: { id:'starBarrier', name:'スターバリア',
    mpCost:40, scaleMp:5, element:'none', attackType:'none', target:'self',
    description:'バリアを張る（最大HP×0.25）。魔法防御強化3T付与。', barrierHpMult:0.25, statusEffect:{type:'mdefUp',turns:3} },
  stellarWall: { id:'stellarWall', name:'ステラウォール',
    mpCost:90, scaleMp:12, element:'none', attackType:'none', target:'self',
    description:'超強力バリア（最大HP×0.5）＋全防御強化4T付与。', barrierHpMult:0.5, statusEffect:{type:'pdefUp',turns:4}, statusEffect2:{type:'mdefUp',turns:4} },
  astrologer_master: { id:'astrologer_master', name:'星霊城塞',
    mpCost:160, scaleMp:20, element:'none', attackType:'none', target:'self',
    description:'【MASTER】バリア（最大HP×1.2）＋全バフ4T付与。', barrierHpMult:1.2, allBuffs:true },
};

// スキルのMP消費量（強化Lv込み）
function getSkillMpCost(player, skillId) {
  const skill = SKILLS[skillId];
  if (!skill) return 0;
  const lv = player.skillLevels[skillId] || 0;
  return (skill.mpCost || 0) + (skill.scaleMp || 0) * lv;
}

// スキル強化倍率（威力のみ）
function getSkillPowerMultiplier(player, skillId) {
  const lv = player.skillLevels[skillId] || 0;
  return 1 + lv * 0.1;
}

// スキル強化（スキルオーブ消費）
// 消費量 = 強化後Lv（Lv0→1で1個、Lv1→2で2個）
function upgradeSkill(player, skillId) {
  const currentLv = player.skillLevels[skillId] || 0;
  const cost = currentLv + 1;
  if (player.skillOrbs < cost) {
    return { success:false, message:`スキルオーブが足りません（必要:${cost}個、所持:${player.skillOrbs}個）。` };
  }
  player.skillOrbs -= cost;
  player.skillLevels[skillId] = currentLv + 1;
  return { success:true, newLevel:currentLv + 1 };
}

// スキルレベルダウン（オーブは戻らない）
function downgradeSkill(player, skillId) {
  const currentLv = player.skillLevels[skillId] || 0;
  if (currentLv <= 0) return { success:false, message:'すでにLv0です。' };
  player.skillLevels[skillId] = currentLv - 1;
  return { success:true, newLevel:currentLv - 1 };
}

// 4枠スロットにセット
function setSkill(player, slotIndex, skillId) {
  if (slotIndex < 0 || slotIndex > 3) return false;
  if (!player.learnedSkills.includes(skillId)) return false;
  player.equippedSkills = player.equippedSkills.map(s => s === skillId ? null : s);
  player.equippedSkills[slotIndex] = skillId;
  return true;
}

function unsetSkill(player, slotIndex) {
  if (slotIndex < 0 || slotIndex > 3) return false;
  player.equippedSkills[slotIndex] = null;
  return true;
}
