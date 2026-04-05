// =====================================================
// main.js
// エントリーポイント・初期化・画面遷移
// =====================================================

function init() {
  // デバッグメニュー初期化
  if (typeof initDebugMenu === 'function') initDebugMenu();
  initUI();
}

// ステージに挑戦する
function startStage(stageId) {
  const stage = getStage(stageId);
  if (!stage) { showToast('ステージが見つかりません。'); return; }

  // プレイヤーのHP・MPを全回復してから挑戦
  State.player.currentHp = getMaxHp(State.player);
  State.player.currentMp = getMaxMp(State.player);
  State.player.barrier   = 0;
  State.player.statusEffects = [];

  State.currentStage = stage;
  State.battle = initBattle(stage, State.player);

  renderBattleScreen();
  addLog(State.battle, `${stage.name} に挑戦！`);
  updateBattleUI();
  scrollBattleLog();
}

window.addEventListener('DOMContentLoaded', init);
