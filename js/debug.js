// =====================================================
// debug.js
// デバッグメニュー
// オフにするには DEBUG_ENABLED を false にする
// =====================================================

const DEBUG_ENABLED = false;

// デバッグメニューのDOM要素を生成して画面に追加する
function initDebugMenu() {
  if (!DEBUG_ENABLED) return;

  const panel = document.createElement('div');
  panel.id = 'debug-panel';
  panel.style.cssText = `
    position: fixed; bottom: 0; right: 0; width: 280px;
    background: #111; border: 1px solid #444; color: #0f0;
    font-family: monospace; font-size: 12px; z-index: 9999;
  `;

  panel.innerHTML = `
    <div id="debug-header" style="background:#222;padding:4px 8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
      <span>🛠 DEBUG</span>
      <span id="debug-toggle">[-]</span>
    </div>
    <div id="debug-body" style="padding:8px;display:flex;flex-direction:column;gap:6px;">
      <div style="color:#aaa;font-size:11px;margin-bottom:2px;">--- プレイヤー操作 ---</div>
      <button class="dbg-btn" onclick="debugAddGold()">ゴールド +10000</button>
      <button class="dbg-btn" onclick="debugAddExp()">経験値 +99999</button>
      <button class="dbg-btn" onclick="debugAddJobExp()">ジョブ経験値 +9999（現在のジョブ）</button>
      <button class="dbg-btn" onclick="debugMaxAllJobs()">全ジョブ Lv10</button>
      <button class="dbg-btn" onclick="debugAddSkillOrbs()">スキルオーブ +100</button>
      <button class="dbg-btn" onclick="debugAddAllMaterials()">全素材 +20</button>
      <button class="dbg-btn" onclick="debugAddAllItems()">全アイテム +10</button>
      <button class="dbg-btn" onclick="debugFullHeal()">HP・MP 全回復</button>
      <button class="dbg-btn" onclick="debugClearStatus()">状態異常クリア</button>
      <div style="color:#aaa;font-size:11px;margin-top:4px;margin-bottom:2px;">--- ステージ操作 ---</div>
      <button class="dbg-btn" onclick="debugUnlockAllStages()">全ステージ解放</button>
      <div style="color:#aaa;font-size:11px;margin-top:4px;margin-bottom:2px;">--- 表示 ---</div>
      <div id="debug-info" style="color:#0f0;font-size:11px;line-height:1.6;white-space:pre;"></div>
    </div>
  `;

  // ボタンのスタイル
  const style = document.createElement('style');
  style.textContent = `
    .dbg-btn {
      background: #222; color: #0f0; border: 1px solid #333;
      padding: 3px 8px; cursor: pointer; font-family: monospace;
      font-size: 11px; text-align: left; width: 100%;
    }
    .dbg-btn:hover { background: #333; }
  `;
  document.head.appendChild(style);
  document.body.appendChild(panel);

  // 折りたたみ
  const header = document.getElementById('debug-header');
  const body   = document.getElementById('debug-body');
  const toggle = document.getElementById('debug-toggle');
  header.addEventListener('click', () => {
    const hidden = body.style.display === 'none';
    body.style.display = hidden ? 'flex' : 'none';
    toggle.textContent  = hidden ? '[-]' : '[+]';
  });

  // 定期的に情報を更新
  setInterval(updateDebugInfo, 500);
}

function updateDebugInfo() {
  if (!DEBUG_ENABLED) return;
  const el = document.getElementById('debug-info');
  if (!el || !State.player) return;
  const p = State.player;
  const stats = calcFinalStats(p);
  el.textContent = [
    `Lv: ${p.level}  EXP: ${p.exp}/${expToNextLevel(p.level)}`,
    `HP: ${p.currentHp}/${stats.hp}  MP: ${p.currentMp}/${stats.mp}`,
    `Gold: ${p.gold}  Orbs: ${p.skillOrbs}`,
    `Job: ${JOBS[p.jobId]?.name || p.jobId} Lv${p.jobProgress[p.jobId]?.level}`,
    `Screen: ${State.currentScreen}`,
  ].join('\n');
}

// ========== デバッグ操作関数 ==========

function debugAddGold() {
  if (!State.player) return;
  State.player.gold += 10000;
  renderCurrentScreen();
}

function debugAddExp() {
  if (!State.player) return;
  gainExp(State.player, 99999);
  renderCurrentScreen();
}

function debugAddJobExp() {
  if (!State.player) return;
  gainJobExp(State.player, State.player.jobId, 9999);
  renderCurrentScreen();
}

function debugMaxAllJobs() {
  if (!State.player) return;
  for (const jobId in State.player.jobProgress) {
    State.player.jobProgress[jobId].level = 10;
    State.player.jobProgress[jobId].exp   = 0;
    // 全スキルを習得済みにする
    const job = JOBS[jobId];
    if (job) {
      for (let lv = 1; lv <= 10; lv++) {
        const skillId = job.levels[lv]?.skillId;
        if (skillId && !State.player.learnedSkills.includes(skillId)) {
          State.player.learnedSkills.push(skillId);
        }
      }
    }
  }
  renderCurrentScreen();
}

function debugAddSkillOrbs() {
  if (!State.player) return;
  State.player.skillOrbs += 100;
  renderCurrentScreen();
}

function debugAddAllMaterials() {
  if (!State.player) return;
  for (const matId in MATERIALS) {
    State.player.materials[matId] = (State.player.materials[matId] || 0) + 20;
  }
  renderCurrentScreen();
}

function debugAddAllItems() {
  if (!State.player) return;
  for (const itemId in ITEMS) {
    addItem(State.player, itemId, 10);
  }
  renderCurrentScreen();
}

function debugFullHeal() {
  if (!State.player) return;
  State.player.currentHp = getMaxHp(State.player);
  State.player.currentMp = getMaxMp(State.player);
  renderCurrentScreen();
}

function debugClearStatus() {
  if (!State.player) return;
  State.player.statusEffects = [];
  renderCurrentScreen();
}

function debugUnlockAllStages() {
  if (!State.progress) return;
  State.progress.highestStage = 100;
  renderCurrentScreen();
}

// 現在の画面を再描画（UIが実装されたら呼ばれる）
function renderCurrentScreen() {
  if (typeof renderMenu === 'function') renderMenu();
}
