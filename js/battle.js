// =====================================================
// battle.js
// 戦闘進行・ターン管理・ウェーブ管理・ダメージ計算
// =====================================================

const STATUS = {
  poison:     'poison',     // 毎ターン最大HPの5%ダメージ
  paralyze:   'paralyze',   // 25%の確率で行動失敗
  slow:       'slow',       // 速度25%ダウン
  burn:       'burn',       // 毎ターン火属性ダメージ
  freeze:     'freeze',     // 毎ターン氷属性ダメージ
  storm:      'storm',      // 毎ターン風属性ダメージ
  lightRot:   'lightRot',   // 毎ターン光属性ダメージ
  curse:      'curse',      // 毎ターン闇属性ダメージ
  vulnerable: 'vulnerable', // 受けるダメージ25%増
  blind:      'blind',      // 命中率ダウン
  regen:      'regen',      // 毎ターンHP回復
  haste:      'haste',      // 速度25%アップ
  patkUp:     'patkUp',     // 物理攻撃強化
  pdefUp:     'pdefUp',     // 物理防御強化
  matkUp:     'matkUp',     // 魔法攻撃強化
  mdefUp:     'mdefUp',     // 魔法防御強化
  barrier:    'barrier',    // HP手前で発動するバリア
};

// 戦闘状態を初期化する
function initBattle(stage, player) {
  const battle = {
    stage,
    currentWave:  0,
    enemies:      [],
    // 速度ゲージ管理 [{ actor: 'player'|enemyIndex, gauge: number }]
    gauges:       [],
    log:          [],
    phase:        'player', // 'player' | 'enemy' | 'waveEnd' | 'battleEnd'
    result:       null,     // 'win' | 'lose'
    turnCount:    0,
    // 戦闘中に使用したアイテムID（1ターン1個制限）
    usedItemThisTurn: false,
  };
  setupWave(battle, stage, player);
  return battle;
}

// ウェーブをセットアップする
function setupWave(battle, stage, player) {
  const waveData = stage.waves[battle.currentWave];
  battle.enemies = [];
  waveData.forEach(entry => {
    for (let i = 0; i < entry.count; i++) {
      battle.enemies.push(createEnemyInstance(entry.enemyId, entry.scale || 1));
    }
  });
  initGauges(battle, player);
  addLog(battle, `=== ウェーブ ${battle.currentWave + 1} ===`);
}

// 速度ゲージを初期化する
function initGauges(battle, player) {
  const stats = calcFinalStats(player);
  battle.gauges = [];
  // プレイヤー
  battle.gauges.push({ actor: 'player', gauge: 0, speed: stats.speed });
  // 敵
  battle.enemies.forEach((enemy, i) => {
    battle.gauges.push({ actor: i, gauge: 0, speed: enemy.stats.speed });
  });
}

// 次に行動するアクターを返す
// 全員のゲージを速度分加算して、100以上になったものを順に行動させる
function getNextActor(battle, player) {
  // 生存している敵のゲージのみ更新
  const aliveEnemyIndices = battle.enemies
    .map((e, i) => i)
    .filter(i => battle.enemies[i].currentHp > 0);

  // ゲージを加算
  battle.gauges.forEach(g => {
    if (g.actor === 'player') {
      const stats = calcFinalStats(player);
      let speed = stats.speed;
      // 加速・鈍足の補正
      if (hasStatus(player, STATUS.haste)) speed *= 1.25;
      if (hasStatus(player, STATUS.slow))  speed *= 0.75;
      g.speed = speed;
      g.gauge += speed;
    } else {
      if (!aliveEnemyIndices.includes(g.actor)) return;
      let speed = battle.enemies[g.actor].stats.speed;
      if (hasStatusOnEnemy(battle.enemies[g.actor], STATUS.haste)) speed *= 1.25;
      if (hasStatusOnEnemy(battle.enemies[g.actor], STATUS.slow))  speed *= 0.75;
      g.speed = speed;
      g.gauge += speed;
    }
  });

  // ゲージが100以上のものを取り出して行動順にソート
  const ready = battle.gauges
    .filter(g => {
      if (g.actor === 'player') return g.gauge >= 100;
      return aliveEnemyIndices.includes(g.actor) && g.gauge >= 100;
    })
    .sort((a, b) => b.gauge - a.gauge);

  if (ready.length === 0) return null;

  // 行動したアクターのゲージを100減らす
  const acting = ready[0];
  acting.gauge -= 100;
  return acting.actor;
}

// ダメージ計算
// attacker/defenderはステータスオブジェクト（calcFinalStatsの結果 or 敵stats）
function calcDamage(attackerStats, defenderStats, skill, attackerEntity, defenderEntity) {
  // 攻撃種別に応じた攻撃力・防御力を選択
  let atk, def;
  if (skill.attackType === 'physical') {
    atk = attackerStats.patk;
    def = defenderStats.pdef;
  } else if (skill.attackType === 'magical') {
    atk = attackerStats.matk;
    def = defenderStats.mdef;
  } else {
    // 確定ダメージのみ
    return Math.floor(attackerStats.trueDmg + (skill.power || 0));
  }

  // 攻撃強化・防御強化バフ補正
  if (hasStatusOn(attackerEntity, skill.attackType === 'physical' ? STATUS.patkUp : STATUS.matkUp)) {
    atk *= 1.25;
  }
  if (hasStatusOn(defenderEntity, skill.attackType === 'physical' ? STATUS.pdefUp : STATUS.mdefUp)) {
    def *= 1.25;
  }

  // 軽減率（定数1000）
  const mitigation = def / (def + 1000);

  // 属性倍率（多属性スキルは最も有利な属性を採用）
  const elems = skill.elements || (skill.element && skill.element !== 'none' ? [skill.element] : []);
  let elemMult = 1.0;
  if (elems.length > 0) {
    elemMult = Math.max(...elems.map(elem => {
      const atkElem = attackerStats.elemAtk?.[elem] || 1.0;
      const resElem = defenderStats.elemRes?.[elem] || 1.0;
      return atkElem / resElem;
    }));
  }

  // 基本ダメージ
  let damage = Math.floor(atk * (skill.power || 1.0) * (1 - mitigation) * elemMult);

  // 脆弱補正
  if (hasStatusOn(defenderEntity, STATUS.vulnerable)) {
    damage = Math.floor(damage * 1.25);
  }

  // クリティカル判定（スキルのcritBonusを加算）
  let isCrit = false;
  const critRate = (attackerStats.crit || 0) + (skill.critBonus || 0);
  if (Math.random() * 100 < critRate) {
    damage = Math.floor(damage * (attackerStats.critDmg || 1.5));
    isCrit = true;
  }

  // 確定ダメージ加算
  damage += Math.floor(attackerStats.trueDmg || 0);

  // 最低1ダメージ保証
  damage = Math.max(1, damage);

  return { damage, isCrit };
}

// バリア → HP の順にダメージを適用する
function applyDamage(target, damage) {
  if (target.barrier > 0) {
    if (damage <= target.barrier) {
      target.barrier -= damage;
      return;
    }
    damage -= target.barrier;
    target.barrier = 0;
  }
  target.currentHp = Math.max(0, target.currentHp - damage);
}

// 命中判定
function isHit(attackerStats, defenderStats, attackerEntity, defenderEntity) {
  let hit = attackerStats.hit;
  let eva = defenderStats.eva;
  // 暗闇補正（命中率30%ダウン）
  if (hasStatusOn(attackerEntity, STATUS.blind)) hit *= 0.7;
  return Math.random() * 100 < calcHitRate(hit, eva);
}

// 状態異常を付与する
// 同じ種類がある場合はターン数をリセット（延長）
function applyStatus(target, statusType, turns, value) {
  const existing = target.statusEffects.find(s => s.type === statusType);
  if (existing) {
    existing.turnsLeft = turns; // リセット
    if (value !== undefined) existing.value = value;
  } else {
    target.statusEffects.push({ type: statusType, turnsLeft: turns, value: value || 0 });
  }
}

// 状態異常を持っているか確認（プレイヤー・敵共通）
function hasStatusOn(entity, statusType) {
  return (entity.statusEffects || []).some(s => s.type === statusType);
}
function hasStatus(player, statusType) { return hasStatusOn(player, statusType); }
function hasStatusOnEnemy(enemy, statusType) { return hasStatusOn(enemy, statusType); }

// ターン開始時の状態異常処理
function processStatusEffects(actor, battle, isPlayer, playerRef) {
  const effects = actor.statusEffects || [];
  const toRemove = [];

  effects.forEach((effect, idx) => {
    const maxHp = isPlayer ? getMaxHp(playerRef) : actor.stats.hp;
    switch (effect.type) {
      case STATUS.poison:
        const poisonDmg = Math.floor(maxHp * 0.05);
        applyDamage(actor, poisonDmg);
        addLog(battle, `${actor.name || 'プレイヤー'} は毒のダメージを${poisonDmg}受けた！`);
        break;
      case STATUS.burn:
        const burnDmg = Math.max(1, Math.floor(effect.value || 10));
        applyDamage(actor, burnDmg);
        addLog(battle, `${actor.name || 'プレイヤー'} は燃焼ダメージを${burnDmg}受けた！`);
        break;
      case STATUS.freeze:
        const freezeDmg = Math.max(1, Math.floor(effect.value || 10));
        applyDamage(actor, freezeDmg);
        addLog(battle, `${actor.name || 'プレイヤー'} は凍結ダメージを${freezeDmg}受けた！`);
        break;
      case STATUS.storm:
        const stormDmg = Math.max(1, Math.floor(effect.value || 10));
        applyDamage(actor, stormDmg);
        addLog(battle, `${actor.name || 'プレイヤー'} は暴風ダメージを${stormDmg}受けた！`);
        break;
      case STATUS.lightRot:
        const lightDmg = Math.max(1, Math.floor(effect.value || 10));
        applyDamage(actor, lightDmg);
        addLog(battle, `${actor.name || 'プレイヤー'} は光蝕ダメージを${lightDmg}受けた！`);
        break;
      case STATUS.curse:
        const curseDmg = Math.max(1, Math.floor(effect.value || 10));
        applyDamage(actor, curseDmg);
        addLog(battle, `${actor.name || 'プレイヤー'} は呪詛ダメージを${curseDmg}受けた！`);
        break;
      case STATUS.regen:
        const healAmt = Math.max(1, Math.floor(effect.value || 10));
        const beforeHp = actor.currentHp;
        actor.currentHp = Math.min(maxHp, actor.currentHp + healAmt);
        const healed = actor.currentHp - beforeHp;
        if (healed > 0) addLog(battle, `${actor.name || 'プレイヤー'} はリジェネでHP${healed}回復した。`);
        break;
    }
    effect.turnsLeft--;
    if (effect.turnsLeft <= 0) toRemove.push(idx);
  });

  // 期限切れ状態異常を削除（逆順で）
  toRemove.reverse().forEach(idx => effects.splice(idx, 1));
}

// HP自動回復・MP自動回復処理（ターン開始時）
function processAutoRegen(player) {
  const stats = calcFinalStats(player);
  if (stats.hpRegen > 0) {
    player.currentHp = Math.min(getMaxHp(player), Math.floor(player.currentHp) + stats.hpRegen);
  }
  if (stats.mpRegen > 0) {
    player.currentMp = Math.min(getMaxMp(player), Math.floor(player.currentMp) + stats.mpRegen);
  }
}

// 吸血処理
function applyLifeSteal(player, damage) {
  const stats = calcFinalStats(player);
  if (stats.lifeSteal > 0) {
    const heal = Math.floor(damage * stats.lifeSteal / 100);
    if (heal > 0) {
      player.currentHp = Math.min(getMaxHp(player), player.currentHp + heal);
    }
  }
}

// 次のウェーブに進む or 戦闘終了
function advanceWave(battle, stage, player) {
  battle.currentWave++;
  if (battle.currentWave >= stage.waves.length) {
    // 全ウェーブクリア
    battle.phase  = 'battleEnd';
    battle.result = 'win';
    addLog(battle, '=== 戦闘勝利！ ===');
  } else {
    setupWave(battle, stage, player);
  }
}

// 戦闘ログにメッセージを追加する
function addLog(battle, message) {
  battle.log.push(message);
}
