// =====================================================
// save.js
// セーブ・ロード（localStorageを使用）
// ブラウザのデータを消すとセーブデータも消える
// =====================================================

const SAVE_KEY = 'rpg_save_v1';

// ゲームデータをセーブする
function saveGame() {
  const data = {
    player:   State.player,
    progress: State.progress,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('セーブ失敗:', e);
    return false;
  }
}

// ゲームデータをロードする
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('ロード失敗:', e);
    return null;
  }
}

// セーブデータが存在するか確認
function hasSaveData() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

// セーブデータを削除する
function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}
