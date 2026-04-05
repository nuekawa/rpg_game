// =====================================================
// ui.js
// 画面遷移・共通UI・メインメニューの描画
// =====================================================

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  const el = document.getElementById('screen-' + screenId);
  if (el) el.classList.remove('hidden');
  State.currentScreen = screenId;
}

function renderMenu() {
  showScreen('menu');
  renderStatusBar();
  renderTab(State.currentTab);
}

// 左カラム：全ステータスを表示
function renderStatusBar() {
  const p = State.player;
  if (!p) return;
  const s      = calcFinalStats(p);
  const base   = p.baseStats;
  const hpPct  = Math.max(0, Math.min(100, p.currentHp / s.hp * 100));
  const mpPct  = Math.max(0, Math.min(100, p.currentMp / s.mp * 100));
  const expPct = Math.max(0, Math.min(100, p.exp / expToNextLevel(p.level) * 100));
  const jp     = p.jobProgress[p.jobId];
  const jobExpPct = jp.level >= 10 ? 100
    : Math.max(0, Math.min(100, jp.exp / jobExpToNextLevel(jp.level) * 100));

  // 装備ボーナス（表示用）
  const eq = getTotalEquipBonus(p);

  function statRow(label, baseVal, totalVal) {
    const diff = Math.round(totalVal - baseVal);
    const diffStr = diff > 0 ? `<td class="bonus">+${diff}</td>` : `<td></td>`;
    return `<tr><td>${label}</td><td>${Math.round(totalVal)}</td>${diffStr}</tr>`;
  }
  function statRowF(label, baseVal, totalVal, digits) {
    const diff = parseFloat((totalVal - baseVal).toFixed(digits));
    const diffStr = diff > 0 ? `<td class="bonus">+${diff.toFixed(digits)}</td>` : `<td></td>`;
    return `<tr><td>${label}</td><td>${totalVal.toFixed(digits)}</td>${diffStr}</tr>`;
  }
  function elemRow(label, base, total) {
    return `<tr><td>${label}</td><td>${total.toFixed(2)}x</td><td></td></tr>`;
  }

  document.getElementById('status-bar').innerHTML = `
    <div class="status-name">${p.name} <span class="lv">Lv.${p.level}</span></div>
    <div class="status-job">[${JOBS[p.jobId]?.name || p.jobId} Lv.${jp.level}${jp.level >= 10 ? ' MASTER' : ''}]</div>

    <div class="status-bars">
      <div class="bar-row">
        <span class="bar-label">HP</span>
        <div class="bar-bg"><div class="bar-fill hp-fill" style="width:${hpPct}%"></div></div>
        <span class="bar-val">${p.currentHp}/${s.hp}</span>
      </div>
      <div class="bar-row">
        <span class="bar-label">MP</span>
        <div class="bar-bg"><div class="bar-fill mp-fill" style="width:${mpPct}%"></div></div>
        <span class="bar-val">${p.currentMp}/${s.mp}</span>
      </div>
      ${p.barrier > 0 ? `<div style="font-size:12px;color:var(--info);">バリア: ${p.barrier}</div>` : ''}
      <div class="bar-row">
        <span class="bar-label">EXP</span>
        <div class="bar-bg"><div class="bar-fill exp-fill" style="width:${expPct}%"></div></div>
        <span class="bar-val">${p.exp}/${expToNextLevel(p.level)}</span>
      </div>
      <div class="bar-row">
        <span class="bar-label">JOB</span>
        <div class="bar-bg"><div class="bar-fill job-fill" style="width:${jobExpPct}%"></div></div>
        <span class="bar-val">${jp.level >= 10 ? 'MASTER' : `${jp.exp}/${jobExpToNextLevel(jp.level)}`}</span>
      </div>
    </div>

    <div class="status-gold">G: ${formatNum(p.gold)}　Orb: ${p.skillOrbs}</div>

    <div class="stat-section">攻撃</div>
    <table class="stat-table">
      ${statRow('物理攻撃力', base.patk, s.patk)}
      ${statRow('魔法攻撃力', base.matk, s.matk)}
      ${statRow('命中', base.hit, s.hit)}
      ${statRow('クリ率 %', base.crit, s.crit)}
      ${statRowF('クリ倍率', base.critDmg, s.critDmg, 2)}
      ${statRow('確定ダメージ', base.trueDmg, s.trueDmg)}
    </table>

    <div class="stat-section">防御</div>
    <table class="stat-table">
      ${statRow('物理防御力', base.pdef, s.pdef)}
      ${statRow('魔法防御力', base.mdef, s.mdef)}
      ${statRow('回避', base.eva, s.eva)}
    </table>

    <div class="stat-section">速度・回復</div>
    <table class="stat-table">
      ${statRow('速度', base.speed, s.speed)}
      ${statRow('HP自動回復', base.hpRegen, s.hpRegen)}
      ${statRow('MP自動回復', base.mpRegen, s.mpRegen)}
      ${statRow('吸血率 %', base.lifeSteal, s.lifeSteal)}
      ${statRow('マナ吸収 %', base.manaSteal, s.manaSteal)}
    </table>

    <div class="stat-section">属性適正</div>
    <table class="stat-table">
      ${elemRow('火', base.elemAtk.fire, s.elemAtk.fire)}
      ${elemRow('氷', base.elemAtk.ice, s.elemAtk.ice)}
      ${elemRow('風', base.elemAtk.wind, s.elemAtk.wind)}
      ${elemRow('光', base.elemAtk.light, s.elemAtk.light)}
      ${elemRow('闇', base.elemAtk.dark, s.elemAtk.dark)}
    </table>

    <div class="stat-section">属性耐性</div>
    <table class="stat-table">
      ${elemRow('火', base.elemRes.fire, s.elemRes.fire)}
      ${elemRow('氷', base.elemRes.ice, s.elemRes.ice)}
      ${elemRow('風', base.elemRes.wind, s.elemRes.wind)}
      ${elemRow('光', base.elemRes.light, s.elemRes.light)}
      ${elemRow('闇', base.elemRes.dark, s.elemRes.dark)}
    </table>

    ${(p.statusEffects || []).length > 0 ? `
      <div class="stat-section">状態異常</div>
      <div class="status-tags">
        ${p.statusEffects.map(s =>
          `<span class="status-tag" style="color:${statusColor(s.type)}">${statusLabel(s.type)}(${s.turnsLeft})</span>`
        ).join('')}
      </div>` : ''}
  `;
}

// タブ切り替え
function switchTab(tabName) {
  State.currentTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  renderTab(tabName);
}

function renderTab(tabName) {
  const body = document.getElementById('tab-body');
  if (!body) return;
  switch (tabName) {
    case 'adventure':  renderAdventureTab(body); break;
    case 'skill':      renderSkillTab(body);      break;
    case 'job':        renderJobTab(body);         break;
    case 'equipment':  renderEquipmentTab(body);   break;
    case 'craft':      renderCraftTab(body);       break;
    case 'shop':       renderShopTab(body);        break;
    case 'item':       renderItemTab(body);        break;
    case 'config':     renderConfigTab(body);      break;
    default:           body.innerHTML = '';
  }
}

// ========== 冒険タブ ==========
function renderAdventureTab(container) {
  const progress = State.progress;
  const mainStages = [...getUnlockedMainStages(progress)].reverse(); // 高いLvが上

  let html = '';

  // 周回ステージを最上部に
  html += `<div class="section-title">周回ステージ</div>`;
  FARM_STAGE_BASES.forEach(base => {
    html += `<div class="farm-stage-group">
      <div class="farm-stage-group-title">${base.name}　<span class="dim" style="font-size:12px;">${base.description}</span></div>
      <div class="farm-difficulty-grid">
        ${FARM_DIFFICULTIES.map(diff => {
          const id = getFarmStageId(base.id, diff.rank);
          return `<button class="farm-diff-btn" onclick="startStage('${id}')">${diff.label}</button>`;
        }).join('')}
      </div>
    </div>`;
  });

  html += `<div class="section-title" style="margin-top:16px;">メインステージ</div>`;
  html += `<div class="stage-list">`;
  mainStages.forEach(stage => {
    const cleared = progress.clearedStages.includes(stage.id);
    html += `
      <div class="stage-item ${stage.isBoss ? 'boss-stage' : ''}">
        <div class="stage-info">
          <span class="stage-id">St.${stage.id}</span>
          <span class="stage-name">${stage.name}</span>
          ${cleared ? '<span class="cleared-badge">CLEAR</span>' : ''}
          ${stage.isBoss ? '<span style="font-size:11px;color:var(--warn);">BOSS</span>' : ''}
        </div>
        <button class="btn-primary btn-small" onclick="startStage(${stage.id})">出発</button>
      </div>`;
  });
  html += `</div>`;

  container.innerHTML = html;
}

// ========== コンフィグタブ ==========
function renderConfigTab(container) {
  container.innerHTML = `
    <div class="section-title">セーブ / ロード</div>
    <div class="config-row">
      <button class="btn-primary" onclick="manualSave()">手動セーブ</button>
      <span id="save-msg" class="dim" style="margin-left:10px;font-size:12px;"></span>
    </div>
    <div class="config-row" style="margin-top:8px;">
      <button class="btn-primary" onclick="manualLoad()">ロード</button>
    </div>
    <div class="section-title" style="margin-top:20px;">データ</div>
    <div class="config-row">
      <button class="btn-danger" onclick="confirmDeleteSave()">データ消去</button>
    </div>
    <div id="delete-confirm" class="hidden" style="margin-top:10px;color:var(--danger);font-size:13px;">
      本当に消去しますか？この操作は取り消せません。<br>
      <div style="display:flex;gap:8px;margin-top:6px;">
        <button class="btn-danger" onclick="deleteSaveData()">消去する</button>
        <button class="btn-secondary" onclick="cancelDelete()">キャンセル</button>
      </div>
    </div>
  `;
}

function manualSave() {
  saveGame();
  const msg = document.getElementById('save-msg');
  if (msg) { msg.textContent = '保存しました。'; setTimeout(() => msg.textContent = '', 2000); }
}

function manualLoad() {
  const data = loadGame();
  if (data) { State.player = data.player; State.progress = data.progress; renderMenu(); }
}

function confirmDeleteSave() {
  document.getElementById('delete-confirm')?.classList.remove('hidden');
}
function cancelDelete() {
  document.getElementById('delete-confirm')?.classList.add('hidden');
}
function deleteSaveData() {
  deleteSave();
  State.player   = createPlayer('主人公');
  State.progress = { highestStage: 0, clearedStages: [] };
  showScreen('title');
  renderTitleScreen();
}

// ========== ユーティリティ ==========
function formatNum(n) { return Math.floor(n).toLocaleString(); }

function statusLabel(type) {
  const m = {
    poison:'毒', paralyze:'麻痺', slow:'鈍足', burn:'燃焼', freeze:'凍結',
    storm:'暴風', lightRot:'光蝕', curse:'呪詛', vulnerable:'脆弱', blind:'暗闇',
    regen:'リジェネ', haste:'加速', patkUp:'物攻↑', pdefUp:'物防↑',
    matkUp:'魔攻↑', mdefUp:'魔防↑', barrier:'バリア',
  };
  return m[type] || type;
}

function statusColor(type) {
  const debuffs = ['poison','paralyze','slow','burn','freeze','storm','lightRot','curse','vulnerable','blind'];
  return debuffs.includes(type) ? 'var(--danger)' : 'var(--accent)';
}

function initUI() { renderTitleScreen(); }

function renderTitleScreen() {
  const el = document.getElementById('screen-title');
  if (!el) return;
  el.innerHTML = `
    <div class="title-container">
      <div class="title-logo">RPG</div>
      <div class="title-sub">育成型テキストRPG</div>
      <div class="title-btns">
        ${hasSaveData() ? `<button class="btn-title" onclick="continueGame()">続きから</button>` : ''}
        <button class="btn-title" onclick="showNameInput()">はじめから</button>
      </div>
    </div>
  `;
  showScreen('title');
}

function showNameInput() {
  document.getElementById('screen-title').innerHTML = `
    <div class="title-container">
      <div class="title-sub">キャラクター名を入力</div>
      <input id="name-input" type="text" maxlength="12" placeholder="主人公"
        style="margin:14px 0;padding:8px 12px;background:var(--bg-input);border:1px solid var(--border);
               color:var(--text);font-family:inherit;font-size:15px;width:220px;display:block;margin-left:auto;margin-right:auto;">
      <button class="btn-title" onclick="startNewGame()" style="margin-top:8px;">決定</button>
    </div>
  `;
  setTimeout(() => document.getElementById('name-input')?.focus(), 50);
}

function startNewGame() {
  const name = document.getElementById('name-input')?.value.trim() || '主人公';
  State.player   = createPlayer(name);
  State.progress = { highestStage: 0, clearedStages: [] };
  const initSkill = JOBS['knight']?.levels[1]?.skillId;
  if (initSkill) State.player.learnedSkills.push(initSkill);
  saveGame();
  renderMenu();
}

function continueGame() {
  const data = loadGame();
  if (data) { State.player = data.player; State.progress = data.progress; renderMenu(); }
}

// ダイアログ
function showDialog(html) {
  let overlay = document.getElementById('dialog-overlay');
  if (!overlay) { overlay = document.createElement('div'); overlay.id = 'dialog-overlay'; document.body.appendChild(overlay); }
  overlay.innerHTML = `<div class="dialog-box">${html}</div>`;
  overlay.classList.remove('hidden');
}
function closeDialog() { document.getElementById('dialog-overlay')?.classList.add('hidden'); }

// トースト
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) { toast = document.createElement('div'); toast.id = 'toast'; document.body.appendChild(toast); }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}
