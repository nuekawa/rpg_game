// =====================================================
// state.js
// ゲーム全体の状態を一元管理する
// 他のモジュールはここから状態を読み書きする
// =====================================================

const State = {

  // 現在の画面
  // 'title' | 'menu' | 'battle'
  currentScreen: 'title',

  // メインメニューの現在のタブ
  // 'adventure' | 'skill' | 'job' | 'equipment' | 'craft' | 'shop' | 'item' | 'config'
  currentTab: 'adventure',

  // プレイヤーデータ
  player: null,

  // 現在の戦闘状態
  battle: null,

  // 現在選択中のステージ
  currentStage: null,

  // ゲームフラグ・進行状況
  progress: {
    highestStage: 0,     // クリアした最高ステージ
    clearedStages: [],   // クリア済みステージIDリスト
  },

};
