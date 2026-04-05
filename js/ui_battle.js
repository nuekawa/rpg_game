// =====================================================
// ui_battle.js
// 戦闘画面のUI描画・操作
// =====================================================

// 戦闘画面を初期化して描画する
function renderBattleScreen() {
  showScreen('battle');
  const el = document.getElementById('screen-battle');
  if (!el) return;
  el.innerHTML = `
    <div id="battle-wrap">
      <div id="battle-header">
        <span id="battle-stage-name"></span>
        <span id="battle-wave"></span>
      </div>
      <div id="enemy-area"></div>
      <div id="battle-log-wrap">
        <div id="battle-log"></div>
      </div>
      <div id="player-area"></div>
      <div id="action-area"></div>
    </div>
  `;
  updateBattleUI();
  // オートバトルループ開始
  const { battle, player } = State;
  if (battle && player && battle.phase !== 'battleEnd') {
    setTimeout(() => executePlayerAutoAction(battle, player), 500);
  }
}

// 戦闘UI全体を更新する
function updateBattleUI() {
  const battle = State.battle;
  const player = State.player;
  if (!battle || !player) return;

  // ヘッダー
  const stageEl = document.getElementById('battle-stage-name');
  const waveEl  = document.getElementById('battle-wave');
  if (stageEl) stageEl.textContent = battle.stage?.name || '';
  if (waveEl)  waveEl.textContent  = `ウェーブ ${battle.currentWave + 1} / ${battle.stage?.waves?.length || 1}`;

  updateEnemyArea(battle);
  updatePlayerArea(player, battle);
  updateActionArea(player, battle);
  scrollBattleLog();
}

// 敵エリアを更新する
function updateEnemyArea(battle) {
  const el = document.getElementById('enemy-area');
  if (!el) return;
  el.innerHTML = battle.enemies.map((enemy, i) => {
    const hpPct = Math.max(0, Math.min(100, enemy.currentHp / enemy.stats.hp * 100));
    const isDead = enemy.currentHp <= 0;
    return `
      <div class="enemy-card ${isDead ? 'dead' : ''}">
        <div class="enemy-name">${enemy.name}${enemy.isBoss ? ' ⚠' : ''}</div>
        <div class="bar-row">
          <span class="bar-label">HP</span>
          <div class="bar-bg"><div class="bar-fill hp-fill" style="width:${hpPct}%"></div></div>
          <span class="bar-val">${enemy.currentHp} / ${enemy.stats.hp}</span>
        </div>
        ${enemy.barrier > 0 ? `<div class="dim" style="font-size:11px;">バリア: ${enemy.barrier}</div>` : ''}
        <div class="status-tags">
          ${(enemy.statusEffects || []).map(s =>
            `<span class="status-tag" style="color:${statusColor(s.type)}">${statusLabel(s.type)}(${s.turnsLeft})</span>`
          ).join('')}
        </div>
      </div>`;
  }).join('');
}

// プレイヤーエリアを更新する
function updatePlayerArea(player, battle) {
  const el = document.getElementById('player-area');
  if (!el) return;
  const stats  = calcFinalStats(player);
  const hpPct  = Math.max(0, Math.min(100, player.currentHp / stats.hp * 100));
  const mpPct  = Math.max(0, Math.min(100, player.currentMp / stats.mp * 100));

  el.innerHTML = `
    <div class="player-status-bar">
      <div class="player-name">${player.name}</div>
      <div class="bar-row">
        <span class="bar-label">HP</span>
        <div class="bar-bg"><div class="bar-fill hp-fill" style="width:${hpPct}%"></div></div>
        <span class="bar-val">${player.currentHp} / ${stats.hp}</span>
      </div>
      <div class="bar-row">
        <span class="bar-label">MP</span>
        <div class="bar-bg"><div class="bar-fill mp-fill" style="width:${mpPct}%"></div></div>
        <span class="bar-val">${player.currentMp} / ${stats.mp}</span>
      </div>
      ${player.barrier > 0 ? `<div class="dim" style="font-size:11px;">バリア: ${player.barrier}</div>` : ''}
      <div class="status-tags">
        ${(player.statusEffects || []).map(s =>
          `<span class="status-tag" style="color:${statusColor(s.type)}">${statusLabel(s.type)}(${s.turnsLeft})</span>`
        ).join('')}
      </div>
    </div>
  `;
}

// 行動エリアを更新する（オートバトル版）
function updateActionArea(player, battle) {
  const el = document.getElementById('action-area');
  if (!el) return;

  // 結果画面
  if (battle.result === 'win')  { renderBattleWin(battle.totalDrops); return; }
  if (battle.result === 'lose') { renderBattleLose(); return; }
  if (battle.result === 'flee') { renderBattleFlee(); return; }

  // 装備スキル一覧を表示（参照用、クリック不可）
  const skillLines = player.equippedSkills.map((id, i) => {
    if (!id || !SKILLS[id]) return `<span class="dim">スロット${i+1}: --</span>`;
    const skill = SKILLS[id];
    const mp = getSkillMpCost(player, id);
    const lv = player.skillLevels[id] || 0;
    const ok = player.currentMp >= mp;
    return `<span style="color:${ok ? 'inherit' : 'var(--dim,#666)'}">
      ${skill.name}${lv > 0 ? ` Lv${lv}` : ''} <span style="font-size:10px;color:var(--mp);">MP:${mp}</span>
    </span>`;
  }).join('　');

  el.innerHTML = `
    <div style="padding:6px 0;">
      <div class="dim" style="font-size:11px;margin-bottom:4px;">
        通常攻撃 50% ／ 各スキル 12.5%
      </div>
      <div style="font-size:11px;margin-bottom:8px;">${skillLines}</div>
      <button class="btn-flee" onclick="playerFlee()">逃走</button>
    </div>
  `;
}

// オートバトル：プレイヤーの自動行動
// 通常攻撃50%、スキル各スロット12.5%（MPが足りない/未設定なら通常攻撃にフォールバック）
function executePlayerAutoAction(battle, player) {
  if (battle.phase === 'battleEnd') return;

  // 状態異常・自動回復
  processStatusEffects(player, battle, true, player);
  processAutoRegen(player);

  if (player.currentHp <= 0) {
    battle.phase = 'battleEnd'; battle.result = 'lose';
    addLog(battle, '=== 戦闘敗北 ===');
    updateBattleUI(); scrollBattleLog();
    setTimeout(renderBattleLose, 600);
    return;
  }

  const aliveEnemies = battle.enemies.filter(e => e.currentHp > 0);
  if (aliveEnemies.length === 0) return;
  const target     = aliveEnemies[0];
  const playerStats = calcFinalStats(player);

  // 行動抽選: [0,0.5)=通常攻撃 / [0.5,0.625)=slot0 / [0.625,0.75)=slot1 / [0.75,0.875)=slot2 / [0.875,1.0)=slot3
  const rand = Math.random();
  let chosenSkillId = null;
  if (rand >= 0.5) {
    const slotIdx = Math.floor((rand - 0.5) / 0.125); // 0~3
    const sid = player.equippedSkills[Math.min(slotIdx, 3)];
    if (sid && SKILLS[sid] && !SKILLS[sid].passive && player.currentMp >= getSkillMpCost(player, sid)) {
      chosenSkillId = sid;
    }
  }

  if (chosenSkillId === null) {
    // 通常攻撃
    const normalSkill = { attackType:'physical', element:'none', power:1.0 };
    executeAttack(player, playerStats, target, normalSkill, battle, '攻撃');
  } else {
    const skill = SKILLS[chosenSkillId];
    let effectiveSkill = skill;
    if (skill.mpDrainPower) {
      const consumedMp = player.currentMp;
      player.currentMp = 0;
      const powerBoost = 1 + consumedMp / Math.max(1, getMaxMp(player));
      effectiveSkill = { ...skill, power: skill.power * powerBoost };
      addLog(battle, `MP ${consumedMp} を全消費して魔力を解放！`);
    } else {
      player.currentMp -= getSkillMpCost(player, chosenSkillId);
    }

    if (!effectiveSkill.attackType || effectiveSkill.attackType === 'none') {
      executeUtilitySkill(player, playerStats, effectiveSkill, battle, aliveEnemies);
    } else if (effectiveSkill.target === 'all') {
      aliveEnemies.forEach(enemy => {
        executeAttack(player, playerStats, enemy, effectiveSkill, battle, effectiveSkill.name, true);
      });
      addLog(battle, `${effectiveSkill.name} で全敵を攻撃した！`);
    } else {
      executeAttack(player, playerStats, target, effectiveSkill, battle, effectiveSkill.name);
    }
  }

  // プレイヤーゲージをリセット
  const pg = battle.gauges.find(g => g.actor === 'player');
  if (pg) pg.gauge = 0;

  checkWaveEnd(battle, player);
  updateBattleUI();
  scrollBattleLog();

  if (battle.phase !== 'battleEnd' && battle.result !== 'win') {
    battle.phase = 'enemy';
    setTimeout(() => processNextGaugeTurn(battle, player), 300);
  }
}

// 攻撃処理
function executeAttack(attacker, attackerStats, target, skill, battle, skillName, silent) {
  // 麻痺チェック
  if (hasStatusOn(attacker, STATUS.paralyze) && Math.random() < 0.25) {
    if (!silent) addLog(battle, `${attacker.name || 'プレイヤー'} は麻痺で行動できなかった！`);
    return;
  }

  // hitBonus: スキル固有の命中補正を一時適用
  const effectiveAttackerStats = skill.hitBonus
    ? { ...attackerStats, hit: attackerStats.hit + skill.hitBonus }
    : attackerStats;

  const hits = skill.hits || 1;
  for (let h = 0; h < hits; h++) {
    // 命中判定
    if (!skill.guaranteed && !isHit(effectiveAttackerStats, target.stats, attacker, target)) {
      addLog(battle, `${skillName} はミスした！`);
      continue;
    }

    const result = calcDamage(effectiveAttackerStats, target.stats, skill, attacker, target);
    const dmg    = (typeof result === 'object') ? result.damage : result;
    const isCrit = (typeof result === 'object') ? result.isCrit : false;

    applyDamage(target, dmg);

    // パッシブ吸血
    if (attacker === State.player) applyLifeSteal(State.player, dmg);

    // スキル固有の吸血ボーナス（lifeStealBonus）
    if (attacker === State.player && skill.lifeStealBonus) {
      const steal = Math.floor(dmg * skill.lifeStealBonus / 100);
      if (steal > 0) {
        State.player.currentHp = Math.min(getMaxHp(State.player), State.player.currentHp + steal);
        if (!silent) addLog(battle, `HP を ${steal} 吸収した！`);
      }
    }

    if (!silent || h === 0) {
      addLog(battle, `${isCrit ? '【会心】' : ''}${skillName} → ${target.name} に ${dmg} ダメージ！${target.currentHp <= 0 ? '　撃破！' : ''}`);
    }

    // 状態異常付与
    if (skill.statusEffect && target.currentHp > 0) {
      const se = skill.statusEffect;
      if (!se.target || se.target === 'enemy') {
        applyStatus(target, se.type, se.turns, se.value || 0);
        addLog(battle, `${target.name} に ${statusLabel(se.type)} を付与した。`);
      }
    }
    if (skill.statusEffect2 && target.currentHp > 0) {
      const se2 = skill.statusEffect2;
      if (!se2.target || se2.target === 'enemy') {
        applyStatus(target, se2.type, se2.turns, se2.value || 0);
      }
    }
    if (skill.statusEffect3 && target.currentHp > 0) {
      const se3 = skill.statusEffect3;
      if (!se3.target || se3.target === 'enemy') {
        applyStatus(target, se3.type, se3.turns, se3.value || 0);
      }
    }

    if (target.currentHp <= 0) break;
  }
}

// 非攻撃スキル処理（バフ・回復・状態異常付与）
function executeUtilitySkill(player, playerStats, skill, battle, aliveEnemies) {
  addLog(battle, `${skill.name} を使用した。`);

  // HP回復（割合固定 + 実数値スケール）
  if (skill.healHpPct || skill.healHpFlat) {
    const skillMult = getSkillPowerMultiplier(player, skill.id);
    const pctHeal   = skill.healHpPct  ? Math.floor(getMaxHp(player) * skill.healHpPct / 100) : 0;
    const flatHeal  = skill.healHpFlat ? Math.floor(skill.healHpFlat * skillMult) : 0;
    const totalHeal = pctHeal + flatHeal;
    player.currentHp = Math.min(getMaxHp(player), player.currentHp + totalHeal);
    addLog(battle, `HP を ${totalHeal} 回復した。`);
  }
  // MP回復（割合固定 + 実数値スケール）
  if (skill.healMpPct || skill.healMpFlat) {
    const skillMult = getSkillPowerMultiplier(player, skill.id);
    const pctHeal   = skill.healMpPct  ? Math.floor(getMaxMp(player) * skill.healMpPct / 100) : 0;
    const flatHeal  = skill.healMpFlat ? Math.floor(skill.healMpFlat * skillMult) : 0;
    const totalHeal = pctHeal + flatHeal;
    player.currentMp = Math.min(getMaxMp(player), player.currentMp + totalHeal);
    if (totalHeal > 0) addLog(battle, `MP を ${totalHeal} 回復した。`);
  }
  // バリア付与
  if (skill.barrierMult) {
    const barrier = Math.floor(playerStats.matk * skill.barrierMult);
    player.barrier += barrier;
    addLog(battle, `バリア ${barrier} を張った。`);
  }
  if (skill.barrierHpMult) {
    const barrier = Math.floor(getMaxHp(player) * skill.barrierHpMult);
    player.barrier += barrier;
    addLog(battle, `バリア ${barrier} を張った。`);
  }
  // 全回復
  if (skill.fullRestore) {
    player.currentHp = getMaxHp(player);
    player.currentMp = getMaxMp(player);
    addLog(battle, `HP・MPを全回復した。`);
  }
  // デバフ解除
  if (skill.clearDebuffs) {
    const debuffs = ['poison','paralyze','slow','burn','freeze','storm','lightRot','curse','vulnerable','blind'];
    player.statusEffects = player.statusEffects.filter(s => !debuffs.includes(s.type));
    addLog(battle, `デバフを解除した。`);
  }
  // 自身へのバフ
  if (skill.statusEffect) {
    const se = skill.statusEffect;
    if (!se.target || se.target === 'self') {
      applyStatus(player, se.type, se.turns, se.value || 0);
      addLog(battle, `${statusLabel(se.type)} を得た。`);
    } else if (se.target === 'enemy') {
      aliveEnemies.forEach(e => applyStatus(e, se.type, se.turns, se.value || 0));
      addLog(battle, `全敵に ${statusLabel(se.type)} を付与した。`);
    }
  }
  if (skill.statusEffect2) {
    const se2 = skill.statusEffect2;
    if (!se2.target || se2.target === 'self') {
      applyStatus(player, se2.type, se2.turns, se2.value || 0);
    } else if (se2.target === 'enemy') {
      aliveEnemies.forEach(e => applyStatus(e, se2.type, se2.turns, se2.value || 0));
    }
  }
  // allBuffs: 全能力強化（物攻・魔攻・物防・魔防）を4T付与
  if (skill.allBuffs) {
    [STATUS.patkUp, STATUS.pdefUp, STATUS.matkUp, STATUS.mdefUp].forEach(buff => {
      applyStatus(player, buff, 4, 0);
    });
    addLog(battle, `全能力強化を得た。`);
  }
  // selfHaste: 加速をN T付与（timeMage_master など）
  if (skill.selfHaste) {
    applyStatus(player, STATUS.haste, skill.selfHaste, 0);
    addLog(battle, `加速 を ${skill.selfHaste}T 得た。`);
  }
}

// ゲージシステムによる次ターン処理
// プレイヤーが行動後、ゲージを進めて次に行動すべきアクターを処理する
function processNextGaugeTurn(battle, player) {
  if (battle.phase === 'battleEnd') return;

  const aliveIdx = battle.enemies.map((e, i) => i).filter(i => battle.enemies[i].currentHp > 0);

  if (aliveIdx.length === 0) {
    battle.phase = 'player';
    updateBattleUI(); scrollBattleLog();
    return;
  }

  // 誰かがゲージ100以上になるまで進める
  const anyReady = () => {
    const pg = battle.gauges.find(g => g.actor === 'player');
    if (pg && pg.gauge >= 100) return true;
    return battle.gauges.some(g => g.actor !== 'player' && aliveIdx.includes(g.actor) && g.gauge >= 100);
  };

  if (!anyReady()) {
    const pStats = calcFinalStats(player);
    let pSpd = pStats.speed;
    if (hasStatus(player, STATUS.haste)) pSpd *= 1.25;
    if (hasStatus(player, STATUS.slow))  pSpd *= 0.75;
    pSpd = Math.max(1, pSpd);

    const actors = [];
    const pg = battle.gauges.find(g => g.actor === 'player');
    if (pg) actors.push({ g: pg, spd: pSpd });
    aliveIdx.forEach(i => {
      const eg = battle.gauges.find(g => g.actor === i);
      if (!eg) return;
      let es = battle.enemies[i].stats.speed;
      if (hasStatusOnEnemy(battle.enemies[i], STATUS.haste)) es *= 1.25;
      if (hasStatusOnEnemy(battle.enemies[i], STATUS.slow))  es *= 0.75;
      actors.push({ g: eg, spd: Math.max(1, es) });
    });

    // 次に誰かが100に達するまでの最小ティック数
    const ticks = Math.min(...actors.map(a => Math.ceil((100 - a.g.gauge) / a.spd)));
    actors.forEach(a => { a.g.gauge += a.spd * ticks; });
  }

  // ゲージが高い順に並べて次のアクターを決定
  const ready = battle.gauges
    .filter(g => g.actor === 'player' ? g.gauge >= 100 : (aliveIdx.includes(g.actor) && g.gauge >= 100))
    .sort((a, b) => b.gauge - a.gauge);

  if (ready.length === 0) {
    battle.phase = 'player'; updateBattleUI(); scrollBattleLog();
    return;
  }

  const next = ready[0];
  next.gauge -= 100;

  // プレイヤーターン → 自動行動を遅延実行
  if (next.actor === 'player') {
    battle.phase = 'player';
    updateBattleUI(); scrollBattleLog();
    setTimeout(() => executePlayerAutoAction(battle, player), 400);
    return;
  }

  // 敵のターン
  const enemy = battle.enemies[next.actor];

  // 敵の状態異常処理
  processStatusEffects(enemy, battle, false, null);
  if (enemy.currentHp <= 0) {
    addLog(battle, `${enemy.name} は状態異常でやられた！`);
    checkWaveEnd(battle, player);
    if (battle.phase === 'battleEnd') { updateBattleUI(); scrollBattleLog(); return; }
    updateBattleUI(); scrollBattleLog();
    setTimeout(() => processNextGaugeTurn(battle, player), 200);
    return;
  }

  // 行動決定・実行
  const action = decideEnemyAction(enemy);
  if (action.type === 'attack') {
    executeEnemyAttack(enemy, enemy.stats, player, { attackType:'physical', element:'none', power:1.0 }, battle, `${enemy.name}の攻撃`);
  } else if (action.type === 'skill') {
    const eSkill = ENEMY_SKILLS[action.skillId];
    if (eSkill) executeEnemyAttack(enemy, enemy.stats, player, eSkill, battle, `${enemy.name}の${eSkill.name}`);
  }

  if (player.currentHp <= 0) {
    battle.phase = 'battleEnd'; battle.result = 'lose';
    addLog(battle, '=== 戦闘敗北 ===');
    updateBattleUI(); scrollBattleLog();
    setTimeout(renderBattleLose, 600);
    return;
  }

  updateBattleUI(); scrollBattleLog();
  setTimeout(() => processNextGaugeTurn(battle, player), 300);
}

// 敵の攻撃処理
function executeEnemyAttack(enemy, enemyStats, player, skill, battle, skillName) {
  if (hasStatusOn(enemy, STATUS.paralyze) && Math.random() < 0.25) {
    addLog(battle, `${enemy.name} は麻痺で行動できなかった！`);
    return;
  }

  // selfBuff スキル（war_cry など）：自身にバフを付与して終了
  if (skill.selfBuff) {
    const buffMap = { patk: STATUS.patkUp, matk: STATUS.matkUp, pdef: STATUS.pdefUp, mdef: STATUS.mdefUp };
    const buffType = buffMap[skill.selfBuff];
    if (buffType) {
      applyStatus(enemy, buffType, 3, 0);
      addLog(battle, `${skillName}！ ${enemy.name} は${statusLabel(buffType)}を得た！`);
    }
    return;
  }

  const playerStats = calcFinalStats(player);
  if (!isHit(enemyStats, playerStats, enemy, player)) {
    addLog(battle, `${skillName} はミスした！`);
    return;
  }

  const result = calcDamage(enemyStats, playerStats, skill, enemy, player);
  const dmg    = result.damage || result;
  const isCrit = result.isCrit;
  applyDamage(player, dmg);

  addLog(battle, `${isCrit ? '【会心】' : ''}${skillName} → ${dmg} ダメージ！`);

  // 状態異常付与（プレイヤーへ）
  if (skill.statusEffect && player.currentHp > 0) {
    const se = skill.statusEffect;
    if (se.target === 'player' || !se.target || se.target === 'enemy') {
      applyStatus(player, se.type, se.turns, se.value || 0);
      addLog(battle, `${statusLabel(se.type)} になった！`);
    }
  }

  if (player.currentHp <= 0) {
    battle.phase  = 'battleEnd';
    battle.result = 'lose';
    addLog(battle, '=== 戦闘敗北 ===');
  }
}

// ウェーブ終了チェック
function checkWaveEnd(battle, player) {
  const allDead = battle.enemies.every(e => e.currentHp <= 0);
  if (!allDead) return;

  // 累積ドロップ集計（勝利画面用）
  if (!battle.totalDrops) battle.totalDrops = { materials:{}, items:{}, skillOrbs:0, exp:0, gold:0 };

  // ドロップ処理
  battle.enemies.forEach(enemy => {
    const drops = rollDrops(enemy);
    applyDrops(player, drops);

    // ログ表示
    for (const [matId, qty] of Object.entries(drops.materials)) {
      if (qty > 0) {
        addLog(battle, `　${MATERIALS[matId]?.name || matId} ×${qty} を入手！`);
        battle.totalDrops.materials[matId] = (battle.totalDrops.materials[matId] || 0) + qty;
      }
    }
    for (const [itemId, qty] of Object.entries(drops.items)) {
      if (qty > 0) {
        addLog(battle, `　${ITEMS[itemId]?.name || itemId} ×${qty} を入手！`);
        battle.totalDrops.items[itemId] = (battle.totalDrops.items[itemId] || 0) + qty;
      }
    }
    if (drops.skillOrbs > 0) {
      addLog(battle, `　スキルオーブ ×${drops.skillOrbs} を入手！`);
      battle.totalDrops.skillOrbs += drops.skillOrbs;
    }

    // 経験値・ゴールド
    const enemyExpGain = Math.floor((enemy.exp || 0) * getStageExpMultiplier(battle.stage));
    gainExp(player, enemyExpGain);
    player.gold += enemy.gold || 0;
    battle.totalDrops.exp  += enemyExpGain;
    battle.totalDrops.gold += enemy.gold || 0;

  });

  // ジョブ経験値（ウェーブクリアごとに1回、現在のジョブのみ）
  const isBossWave = battle.enemies.some(e => e.isBoss);
  const jobExp = isBossWave ? JOB_EXP_PER_BOSS_WAVE : JOB_EXP_PER_WAVE;
  gainJobExp(player, player.jobId, jobExp);

  advanceWave(battle, battle.stage, player);

  if (battle.result === 'win') {
    const stageId = battle.stage.id;
    if (!State.progress.clearedStages.includes(stageId)) State.progress.clearedStages.push(stageId);
    if (typeof stageId === 'number' && stageId > State.progress.highestStage) State.progress.highestStage = stageId;
    const rewards = applyStageRewards(battle.stage, player, { materials:{}, items:{} });
    battle.totalDrops.exp  += rewards.expGain;
    battle.totalDrops.gold += rewards.goldGain;
    if (rewards.orbBonus > 0) battle.totalDrops.skillOrbs += rewards.orbBonus;
    addLog(battle, `ステージクリア報酬: EXP+${rewards.expGain} / Gold+${rewards.goldGain}`);
    saveGame();
    setTimeout(() => renderBattleWin(battle.totalDrops), 600);
  }
}

// 戦闘勝利画面
function renderBattleWin(totalDrops) {
  const el = document.getElementById('action-area');
  if (!el) return;

  let rewardHtml = '';
  if (totalDrops) {
    const lines = [];
    if (totalDrops.exp  > 0) lines.push(`EXP  +${formatNum(totalDrops.exp)}`);
    if (totalDrops.gold > 0) lines.push(`Gold +${formatNum(totalDrops.gold)}`);
    if (totalDrops.skillOrbs > 0) lines.push(`スキルオーブ ×${totalDrops.skillOrbs}`);
    for (const [matId, qty] of Object.entries(totalDrops.materials)) {
      if (qty > 0) lines.push(`${MATERIALS[matId]?.name || matId} ×${qty}`);
    }
    for (const [itemId, qty] of Object.entries(totalDrops.items)) {
      if (qty > 0) lines.push(`${ITEMS[itemId]?.name || itemId} ×${qty}`);
    }
    if (lines.length > 0) {
      rewardHtml = `<div class="reward-list">${lines.map(l => `<div class="reward-line">${l}</div>`).join('')}</div>`;
    }
  }

  el.innerHTML = `
    <div class="battle-result win">
      <div class="result-title">⚡ STAGE CLEAR ⚡</div>
      ${rewardHtml}
      <button class="btn-primary" onclick="exitBattle()" style="margin-top:12px;">メニューに戻る</button>
    </div>
  `;
}

// 戦闘敗北画面
function renderBattleLose() {
  const el = document.getElementById('action-area');
  if (!el) return;
  el.innerHTML = `
    <div class="battle-result lose">
      <div class="result-title">— DEFEATED —</div>
      <div class="result-desc">戦闘に敗れました。ペナルティはありません。</div>
      <button class="btn-primary" onclick="exitBattle()" style="margin-top:12px;">メニューに戻る</button>
    </div>
  `;
}

// 逃走処理（100%成功）
function playerFlee() {
  const battle = State.battle;
  if (!battle || battle.phase === 'battleEnd') return;
  battle.phase  = 'battleEnd';
  battle.result = 'flee';
  addLog(battle, '逃走した。');
  updateBattleUI();
  scrollBattleLog();
  setTimeout(renderBattleFlee, 400);
}

// 逃走画面
function renderBattleFlee() {
  const el = document.getElementById('action-area');
  if (!el) return;
  el.innerHTML = `
    <div class="battle-result lose">
      <div class="result-title">— 逃走 —</div>
      <div class="result-desc">戦闘から逃げ出した。ペナルティはありません。</div>
      <button class="btn-primary" onclick="exitBattle()" style="margin-top:12px;">メニューに戻る</button>
    </div>
  `;
}

function exitBattle() {
  State.battle = null;
  renderMenu();
}

// 戦闘ログをスクロール
function scrollBattleLog() {
  const el = document.getElementById('battle-log');
  if (!el || !State.battle) return;
  // 最新50件だけ表示
  const logs = State.battle.log.slice(-50);
  el.innerHTML = logs.map(l => `<div class="log-line">${l}</div>`).join('');
  el.scrollTop = el.scrollHeight;
}

