// =====================================================
// ui_training.js
// スキル・ジョブ・装備・クラフト・ショップ・アイテムタブ
// =====================================================

// ========== スキルタブ ==========
function renderSkillTab(container) {
  const p = State.player;
  const learned = p.learnedSkills.map(id => SKILLS[id]).filter(Boolean);

  let html = `<div class="section-title">セット中スキル</div>`;
  html += `<div class="skill-slots">`;
  for (let i = 0; i < 4; i++) {
    const skillId = p.equippedSkills[i];
    const skill   = skillId ? SKILLS[skillId] : null;
    html += `<div class="skill-slot" ondragover="event.preventDefault()" ondrop="dropSkill(event,${i})">
      <div class="slot-num">${i + 1}</div>
      ${skill ? `
        <div class="slot-skill">
          <div class="skill-name">${skill.name}</div>
          <div class="dim" style="font-size:11px;">MP:${skill.mpCost || 0}　強化Lv:${p.skillLevels[skillId] || 0}</div>
        </div>
        <button class="btn-small" onclick="unsetSkill(State.player,${i});renderMenu()">外す</button>
      ` : `<span class="dim">-- 空き --</span>`}
    </div>`;
  }
  html += `</div>`;

  html += `<div class="section-title" style="margin-top:12px;">習得済みスキル</div>`;
  if (learned.length === 0) {
    html += `<div class="dim">まだスキルを習得していません。ジョブを育てましょう。</div>`;
  } else {
    html += `<div class="skill-list">`;
    learned.forEach(skill => {
      if (skill.passive) return; // パッシブはリストに出さない
      const lv   = p.skillLevels[skill.id] || 0;
      const cost = lv + 1;
      const mult = getSkillPowerMultiplier(p, skill.id);
      const equipped = p.equippedSkills.includes(skill.id);
      html += `
        <div class="skill-card ${equipped ? 'equipped' : ''}">
          <div class="skill-header">
            <span class="skill-name">${skill.name}</span>
            ${equipped ? '<span class="equipped-badge">セット中</span>' : ''}
          </div>
          <div class="skill-desc">${skill.description}</div>
          <div class="skill-meta">
            <span>MP: ${skill.mpCost || 0}</span>
            ${skill.element !== 'none' ? `<span>属性: ${elemLabel(skill.element)}</span>` : ''}
            <span>強化Lv: ${lv}（威力×${mult.toFixed(1)}）</span>
          </div>
          <div class="skill-meta" style="margin-top:2px;">
            <span style="color:var(--mp);">消費MP: ${getSkillMpCost(p, skill.id)}</span>
          </div>
          <div class="skill-actions">
            <button class="btn-small" onclick="openSetSkillDialog('${skill.id}')">セット</button>
            <div class="skill-lv-controls">
              <button class="btn-small" onclick="doDowngradeSkill('${skill.id}')">▼</button>
              <span class="skill-lv-display">強化Lv ${lv}</span>
              <button class="btn-small btn-primary" onclick="doUpgradeSkill('${skill.id}')">▲ オーブ×${cost}</button>
            </div>
          </div>
        </div>`;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
}

function openSetSkillDialog(skillId) {
  const p = State.player;
  const choices = [0,1,2,3].map(i =>
    `<button class="btn-primary" style="margin:4px;" onclick="doSetSkill('${skillId}',${i})">スロット${i+1}${p.equippedSkills[i] ? '（上書き）' : ''}</button>`
  ).join('');
  showDialog(`<div>セットするスロットを選択<br><br>${choices}<br><button class="btn-secondary" onclick="closeDialog()" style="margin-top:8px;">キャンセル</button></div>`);
}

function doSetSkill(skillId, slotIndex) {
  setSkill(State.player, slotIndex, skillId);
  closeDialog();
  renderMenu();
}

function doUpgradeSkill(skillId) {
  const result = upgradeSkill(State.player, skillId);
  if (!result.success) { showToast(result.message); return; }
  showToast(`${SKILLS[skillId].name} を強化しました！（Lv ${result.newLevel}）`);
  renderMenu();
}

function doDowngradeSkill(skillId) {
  const result = downgradeSkill(State.player, skillId);
  if (!result.success) { showToast(result.message); return; }
  showToast(`${SKILLS[skillId].name} をLvダウンしました。（Lv ${result.newLevel}）`);
  renderMenu();
}

function dropSkill(event, slotIndex) {
  const skillId = event.dataTransfer.getData('skillId');
  if (!skillId) return;
  setSkill(State.player, slotIndex, skillId);
  renderMenu();
}

// ========== ジョブタブ ==========
function renderJobTab(container) {
  const p = State.player;

  let html = `<div class="section-title">ジョブ変更</div>`;
  html += `<div class="job-grid">`;
  Object.values(JOBS).forEach(job => {
    const progress  = p.jobProgress[job.id];
    const isCurrent = p.jobId === job.id;
    const mastered  = progress.level >= 10;
    const jobExpPct = mastered ? 100 : Math.min(100, progress.exp / jobExpToNextLevel(progress.level) * 100);

    html += `
      <div class="job-card ${isCurrent ? 'current-job' : ''} ${mastered ? 'mastered' : ''}">
        <div class="job-header">
          <span class="job-name">${job.name}</span>
          ${isCurrent ? '<span class="current-badge">現在</span>' : ''}
          ${mastered  ? '<span class="master-badge">MASTER</span>' : ''}
        </div>
        <div class="job-desc dim">${job.description}</div>
        <div class="job-level">Lv ${progress.level} / 10</div>
        <div class="bar-bg" style="margin:4px 0;">
          <div class="bar-fill job-fill" style="width:${jobExpPct}%"></div>
        </div>
        <div class="dim" style="font-size:11px;">
          ${mastered ? 'マスター済み' : `${progress.exp} / ${jobExpToNextLevel(progress.level)}`}
        </div>
        <div class="job-skills">
          ${[1,2,3,4,5,6,7,8,9,10].map(lv => {
            const reward  = job.levels[lv];
            const learned = p.learnedSkills.includes(reward?.skillId);
            const skill   = reward?.skillId ? SKILLS[reward.skillId] : null;
            const sb = reward?.statBonus;
            const sbHtml = sb ? Object.entries(sb).map(([k,v]) => {
              const label = k.replace('_pct','%').replace('patk','物攻').replace('matk','魔攻').replace('pdef','物防').replace('mdef','魔防').replace('hp','HP').replace('mp','MP').replace('speed','速度').replace('crit','暴率').replace('critDmg','暴倍').replace('eva','回避').replace('hit','命中').replace('hpRegen','HP回').replace('mpRegen','MP回').replace('lifeSteal','吸血').replace('manaSteal','吸MP');
              return `<span class="job-stat-tag">+${v}${label}</span>`;
            }).join('') : '';
            const typeLabel = reward?.type === 'master' ? '[MASTER]' : '';
            return `<div class="job-skill-row ${learned ? 'learned' : 'locked'} ${lv === 10 ? 'master-skill' : ''}">
              <span class="job-lv-badge">Lv${lv}</span>
              <div style="flex:1;">
                <div>
                  ${skill ? `<span>${skill.name}</span> ` : ''}
                  <span class="dim" style="font-size:10px;">${typeLabel}</span>
                </div>
                ${sbHtml ? `<div class="job-stat-bonus">${sbHtml}</div>` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>
        ${!isCurrent ? `<button class="btn-primary" style="margin-top:6px;width:100%;" onclick="changeJob('${job.id}')">このジョブに変更</button>` : ''}
      </div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function changeJob(jobId) {
  State.player.jobId = jobId;
  showToast(`ジョブを ${JOBS[jobId].name} に変更しました。`);
  renderMenu();
}

// ========== 装備タブ ==========
function renderEquipmentTab(container) {
  const p   = State.player;
  const inv = p.equipInventory || [];

  const slotDefs = [
    { cat:'weapon', label:'武器', count:2 },
    { cat:'armor',  label:'防具', count:3 },
    { cat:'acc',    label:'アクセサリー', count:3 },
  ];

  let html = `<div class="section-title">装備スロット</div>`;
  html += `<div class="equip-slots">`;
  slotDefs.forEach(({ cat, label, count }) => {
    for (let i = 0; i < count; i++) {
      const equipped = p.equipment[cat][i];
      html += `
        <div class="equip-slot-row">
          <span class="slot-label">${label} ${i+1}</span>
          <div class="equip-slot-info">
            ${equipped ? `
              <span class="equip-name">${equipped.favorite ? '★ ' : ''}${equipped.name}</span>
              <span class="tier-badge tier-${equipped.tier}">T${equipped.tier}</span>
              <button class="btn-small" onclick="showEquipDetail('${equipped.id}')">詳細</button>
              <button class="btn-small" onclick="doUnequip('${cat}',${i})">外す</button>
            ` : `<span class="dim">なし</span>
              <button class="btn-small btn-primary" onclick="showEquipList('${cat}',${i})">装備する</button>`}
          </div>
        </div>`;
    }
  });
  html += `</div>`;

  const sorted = [...inv].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return b.tier - a.tier;
  });

  const sellableCount = inv.filter(e => !e.favorite && !Object.values(p.equipment).flat().some(s => s?.id === e.id)).length;
  html += `<div class="section-title" style="margin-top:14px;">所持装備（${inv.length}個）</div>`;
  if (sellableCount > 0) {
    html += `<button class="btn-sell" style="margin-bottom:8px;padding:6px 14px;" onclick="doBulkSell()">お気に入り以外を一括売却（${sellableCount}個）</button>`;
  }
  if (inv.length === 0) {
    html += `<div class="dim">装備を所持していません。クラフトで作りましょう。</div>`;
  } else {
    html += `<div class="equip-inv-list">`;
    // カテゴリ別に表示
    ['weapon', 'armor', 'acc'].forEach(cat => {
      const catItems = sorted.filter(e => e.category === cat);
      if (catItems.length === 0) return;
      html += `<div class="equip-category-section">
        <div class="equip-category-title">${EQUIP_CATEGORY_NAME[cat]}（${catItems.length}個）</div>
        <div class="equip-inv-list">`;
      catItems.forEach(equip => {
        const isEquipped = Object.values(p.equipment).flat().some(e => e?.id === equip.id);
        const sellPrice  = calcSellPrice(equip);
        html += `
          <div class="equip-inv-card ${isEquipped ? 'equipped' : ''} ${equip.favorite ? 'favorite' : ''}">
            <div class="equip-inv-header">
              <span class="equip-name">${equip.favorite ? '★ ' : ''}${equip.name}</span>
              <span class="tier-badge tier-${equip.tier}">Tier${equip.tier}</span>
              ${isEquipped ? '<span class="equipped-badge">装備中</span>' : ''}
            </div>
            <div class="equip-bonuses">
              ${equip.bonuses.map(b => `<span class="bonus-tag">${b.label} <strong>+${formatBonusVal(b)}</strong></span>`).join('')}
            </div>
            <div class="equip-actions">
              <button class="btn-small" onclick="showEquipDetail('${equip.id}')">詳細/再ロール</button>
              <button class="btn-small ${equip.favorite ? 'fav-on' : ''}" onclick="doToggleFavorite('${equip.id}')">
                ${equip.favorite ? '★ 解除' : '☆ お気に入り'}
              </button>
              ${!isEquipped ? `<button class="btn-small btn-sell" onclick="doSell('${equip.id}')">売却 ${formatNum(sellPrice)}G</button>` : ''}
            </div>
          </div>`;
      });
      html += `</div></div>`; // equip-inv-list / equip-category-section
    });
  }

  container.innerHTML = html;
}

function showEquipDetail(equipId) {
  const p     = State.player;
  const equip = (p.equipInventory || []).find(e => e.id === equipId);
  if (!equip) return;

  const rerollItems = p.inventory.filter(i => ITEMS[i.itemId]?.fixCount !== undefined);
  const rangeTable  = getBonusRangeTable(equip.category, equip.tier);
  const isEquipped  = Object.values(p.equipment).flat().some(e => e?.id === equipId);
  const sellPrice   = calcSellPrice(equip);

  // 数値幅テーブル
  const rangeHtml = `
    <div class="section-title" style="margin-top:10px;">この装備の数値幅（Tier${equip.tier}）</div>
    <table class="stat-table" style="font-size:11px;">
      ${rangeTable.map(r => {
        const isElem = r.type.startsWith('elemAtk_') || r.type.startsWith('elemRes_');
        const minStr = isElem ? (r.min * 100).toFixed(1) + '%' : r.min;
        const maxStr = isElem ? (r.max * 100).toFixed(1) + '%' : r.max;
        return `<tr><td>${r.label}</td><td style="color:var(--dim)">${minStr} 〜 ${maxStr}</td></tr>`;
      }).join('')}
    </table>`;

  // 再ロールUI
  let rerollHtml = '';
  if (rerollItems.length > 0) {
    rerollHtml = `
      <div class="section-title" style="margin-top:10px;">再ロール</div>
      <div class="dim" style="font-size:12px;margin-bottom:6px;">固定する効果を選択（アイテムの固定数まで）</div>
      <div id="fix-select">
        ${equip.bonuses.map((b,i) => `
          <label style="display:flex;align-items:center;gap:6px;margin:4px 0;font-size:13px;">
            <input type="checkbox" id="fix-${i}" value="${i}">
            <span>${b.label}</span>
            <strong style="color:var(--accent)">+${formatBonusVal(b)}</strong>
          </label>`).join('')}
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;margin-top:8px;">
        ${rerollItems.map(ri => `
          <button class="btn-primary" onclick="doReroll('${equipId}','${ri.itemId}')">
            ${ITEMS[ri.itemId].name}で再ロール（所持:${ri.qty}）
          </button>`).join('')}
      </div>`;
  }

  showDialog(`
    <div>
      <div class="equip-name" style="font-size:16px;">${equip.favorite ? '★ ' : ''}${equip.name}</div>
      <div style="display:flex;gap:8px;margin:4px 0 10px;align-items:center;">
        <span class="tier-badge tier-${equip.tier}">Tier${equip.tier}</span>
        <span class="dim">${EQUIP_CATEGORY_NAME[equip.category]}</span>
        ${isEquipped ? '<span class="equipped-badge">装備中</span>' : ''}
      </div>
      <div class="section-title">現在の効果</div>
      <div class="equip-bonuses" style="margin:6px 0;">
        ${equip.bonuses.map(b => `
          <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #2a2a2a;">
            <span>${b.label}</span>
            <strong style="color:var(--accent)">+${formatBonusVal(b)}</strong>
          </div>`).join('')}
      </div>
      ${rangeHtml}
      ${rerollHtml}
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
        <button class="btn-small ${equip.favorite ? 'fav-on' : ''}" onclick="doToggleFavorite('${equipId}');showEquipDetail('${equipId}')">
          ${equip.favorite ? '★ お気に入り解除' : '☆ お気に入り登録'}
        </button>
        ${!isEquipped ? `<button class="btn-small btn-sell" onclick="doSellFromDialog('${equipId}')">売却 ${formatNum(sellPrice)}G</button>` : ''}
        <button class="btn-secondary btn-small" onclick="closeDialog()" style="margin-left:auto;">閉じる</button>
      </div>
    </div>
  `);
}

function doReroll(equipId, itemId) {
  const p     = State.player;
  const equip = (p.equipInventory || []).find(e => e.id === equipId);
  if (!equip) return;
  const fixedIndices = [];
  equip.bonuses.forEach((_, i) => {
    if (document.getElementById(`fix-${i}`)?.checked) fixedIndices.push(i);
  });
  const result = rerollEquipment(p, equip, fixedIndices, itemId);
  if (!result.success) { showToast(result.message); return; }
  showToast('再ロールしました！');
  showEquipDetail(equipId);
}

function doToggleFavorite(equipId) {
  toggleFavorite(State.player, equipId);
  renderMenu();
}

function doSell(equipId) {
  if (!confirm(`この装備を売却しますか？`)) return;
  const result = sellEquipment(State.player, equipId);
  if (!result.success) { showToast(result.message); return; }
  showToast(`売却しました（+${formatNum(result.gold)}G）`);
  renderMenu();
}

function doBulkSell() {
  const p = State.player;
  const inv = p.equipInventory || [];
  const targets = inv.filter(e =>
    !e.favorite && !Object.values(p.equipment).flat().some(s => s?.id === e.id)
  );
  if (targets.length === 0) { showToast('売却できる装備がありません。'); return; }
  let totalGold = 0;
  targets.forEach(e => {
    totalGold += calcSellPrice(e);
  });
  if (!confirm(`お気に入り以外の装備 ${targets.length}個 を売却します。\n合計 ${formatNum(totalGold)}G を獲得しますか？`)) return;
  targets.forEach(e => sellEquipment(p, e.id));
  showToast(`${targets.length}個を売却しました（+${formatNum(totalGold)}G）`);
  renderMenu();
}

function doSellFromDialog(equipId) {
  const result = sellEquipment(State.player, equipId);
  if (!result.success) { showToast(result.message); return; }
  closeDialog();
  showToast(`売却しました（+${formatNum(result.gold)}G）`);
  renderMenu();
}

function showEquipList(cat, slotIndex) {
  const p   = State.player;
  const inv = (p.equipInventory || []).filter(e => e.category === cat);
  if (inv.length === 0) { showToast('装備できるアイテムがありません。'); return; }

  // お気に入り→Tier高い順にソート
  const sorted = [...inv].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return b.tier - a.tier;
  });

  const html = `
    <div>
      <div class="section-title">${EQUIP_CATEGORY_NAME[cat]}を選択</div>
      <div class="equip-inv-list" style="max-height:320px;overflow-y:auto;">
        ${sorted.map(equip => `
          <div class="equip-inv-card" style="cursor:pointer;" onclick="doEquip('${equip.id}','${cat}',${slotIndex})">
            <div class="equip-inv-header">
              <span class="equip-name">${equip.favorite ? '★ ' : ''}${equip.name}</span>
              <span class="tier-badge tier-${equip.tier}">Tier${equip.tier}</span>
            </div>
            <div class="equip-bonuses">
              ${equip.bonuses.map(b => `<span class="bonus-tag">${b.label} <strong>+${formatBonusVal(b)}</strong></span>`).join('')}
            </div>
          </div>`).join('')}
      </div>
      <button class="btn-secondary" onclick="closeDialog()" style="margin-top:10px;">キャンセル</button>
    </div>
  `;
  showDialog(html);
}

function doEquip(equipId, cat, slotIndex) {
  equipItem(State.player, equipId, cat, slotIndex);
  closeDialog();
  renderMenu();
}

function doUnequip(cat, slotIndex) {
  unequipItem(State.player, cat, slotIndex);
  renderMenu();
}

function formatBonusVal(b) {
  if (b.type === 'critDmg') return b.value.toFixed(2);
  if (b.type.startsWith('elemAtk_') || b.type.startsWith('elemRes_')) {
    return (b.value * 100).toFixed(1) + '%';
  }
  return Math.floor(b.value);
}


// ========== クラフトタブ ==========
function renderCraftTab(container) {
  const p = State.player;
  const cats = [
    { id:'weapon', label:'武器' },
    { id:'armor',  label:'防具' },
    { id:'acc',    label:'アクセサリー' },
  ];

  let html = `<div class="section-title">所持素材</div>`;
  html += `<div class="material-grid">`;
  Object.values(MATERIALS).forEach(mat => {
    const qty = p.materials[mat.id] || 0;
    html += `
      <div class="material-card ${qty >= 5 ? 'craftable' : ''}">
        <div class="mat-name">${mat.name}</div>
        <div class="mat-tier dim">Tier${mat.tier}</div>
        <div class="mat-qty ${qty >= 5 ? '' : 'dim'}">${qty} / 5</div>
      </div>`;
  });
  html += `</div>`;

  html += `<div class="section-title" style="margin-top:12px;">クラフト</div>`;
  html += `<div class="craft-list">`;
  Object.values(MATERIALS).forEach(mat => {
    const qty = p.materials[mat.id] || 0;
    if (qty < 5) return;
    html += `
      <div class="craft-item">
        <div class="mat-name">${mat.name}（所持:${qty}）</div>
        <div class="craft-btns">
          ${cats.map(cat => `
            <button class="btn-primary" onclick="doCraft('${mat.id}','${cat.id}')">
              ${cat.label}を作る
            </button>`).join('')}
        </div>
      </div>`;
  });
  if (!Object.values(MATERIALS).some(m => (p.materials[m.id] || 0) >= 5)) {
    html += `<div class="dim">素材が5個以上あるとクラフトできます。</div>`;
  }
  html += `</div>`;

  // ========== 素材換金・昇華 ==========
  const hasMatsForExchange = Object.values(MATERIALS).some(m => (p.materials[m.id] || 0) > 0);
  html += `<div class="section-title" style="margin-top:16px;">素材の換金・昇華</div>`;
  if (!hasMatsForExchange) {
    html += `<div class="dim">素材を所持していません。</div>`;
  } else {
    html += `<div class="craft-list">`;
    Object.values(MATERIALS).forEach(mat => {
      const qty = p.materials[mat.id] || 0;
      if (qty === 0) return;
      const priceEach = getMaterialSellPrice(mat);
      const upgradeNeeded = mat.tier < 8 ? 2 : 3;
      const canUpgrade = mat.tier < 14 && qty >= upgradeNeeded;
      const nextMat = mat.tier < 14 ? Object.values(MATERIALS).find(m => m.tier === mat.tier + 1) : null;
      html += `
        <div class="craft-item">
          <div class="mat-name">${mat.name}（所持:${qty}）　<span class="dim" style="font-size:11px;">T${mat.tier} / 1個=${formatNum(priceEach)}G</span></div>
          <div class="craft-btns">
            <button class="btn-small btn-sell" onclick="doSellMaterial('${mat.id}',1)">換金×1</button>
            ${qty >= 5  ? `<button class="btn-small btn-sell" onclick="doSellMaterial('${mat.id}',5)">換金×5</button>` : ''}
            ${qty >= 10 ? `<button class="btn-small btn-sell" onclick="doSellMaterial('${mat.id}',10)">換金×10</button>` : ''}
            ${canUpgrade ? `<button class="btn-small btn-primary" onclick="doUpgradeMaterial('${mat.id}')">昇華（×${upgradeNeeded}→${nextMat.name}×1）</button>` : ''}
          </div>
        </div>`;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
}

function doCraft(materialId, category) {
  const result = craftEquipment(State.player, materialId, category);
  if (!result.success) { showToast(result.message); return; }
  const e = result.equipment;
  showToast(`${e.name} を作成しました！`);
  renderMenu();
}

function doSellMaterial(matId, qty) {
  const result = sellMaterial(State.player, matId, qty);
  if (!result.success) { showToast(result.message); return; }
  showToast(`${MATERIALS[matId].name}×${qty} を換金しました（+${formatNum(result.gold)}G）`);
  renderMenu();
}

function doUpgradeMaterial(matId) {
  const result = upgradeMaterial(State.player, matId);
  if (!result.success) { showToast(result.message); return; }
  showToast(`${MATERIALS[matId].name}×3 → ${result.result.name}×1 に昇華しました！`);
  renderMenu();
}

// ========== ショップタブ ==========
function renderShopTab(container) {
  const p = State.player;

  const shopSections = [
    {
      label: 'ステータス強化',
      items: ['hpSeed','mpSeed','strengthSeed','intelligenceSeed','enduranceSeed','resilienceSeed','agilitySeed','luckSeed','critDmgSeed'],
    },
    {
      label: '装備錬成',
      items: ['rerollStone','rerollCrystal','valueOrb'],
    },
  ];

  let html = `<div class="section-title">ショップ <span class="dim">（所持金: ${formatNum(p.gold)} G）</span></div>`;
  shopSections.forEach(({ label, items }) => {
    html += `<div class="section-sub-title" style="margin:8px 0 4px;font-size:12px;color:#aaa;">─── ${label} ───</div>`;
    html += `<div class="shop-list">`;
    items.forEach(itemId => {
      const item = ITEMS[itemId];
      if (!item) return;
      const canBuy = p.gold >= item.buyPrice;
      html += `
        <div class="shop-item">
          <div class="shop-item-info">
            <span class="item-name">${item.name}</span>
            <span class="dim" style="font-size:11px;">${item.description}</span>
          </div>
          <div class="shop-item-buy">
            <span class="item-price">${formatNum(item.buyPrice)} G</span>
            <button class="btn-primary ${canBuy ? '' : 'disabled'}"
              onclick="${canBuy ? `buyItem('${itemId}')` : ''}">購入</button>
          </div>
        </div>`;
    });
    html += `</div>`;
  });
  container.innerHTML = html;
}

function buyItem(itemId) {
  const p    = State.player;
  const item = ITEMS[itemId];
  if (!item || p.gold < item.buyPrice) { showToast('お金が足りません。'); return; }
  p.gold -= item.buyPrice;
  addItem(p, itemId, 1);
  showToast(`${item.name} を購入しました。`);
  renderMenu();
}

// ========== アイテムタブ ==========
function renderItemTab(container) {
  const p = State.player;

  let html = `<div class="section-title">所持アイテム</div>`;
  if (p.inventory.length === 0) {
    html += `<div class="dim">アイテムを所持していません。</div>`;
  } else {
    html += `<div class="item-list">`;
    p.inventory.forEach(({ itemId, qty }) => {
      const item = ITEMS[itemId];
      if (!item) return;
      const useBtn = item.usableInMenu
        ? `<button class="btn-primary" onclick="doUseItem('${itemId}')">使用</button>`
        : '';
      html += `
        <div class="item-card">
          <div class="item-info">
            <span class="item-name">${item.name}</span>
            <span class="dim">×${qty}</span>
            <span class="dim" style="font-size:11px;margin-left:8px;">${item.description}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="dim" style="font-size:12px;">${item.usableInBattle ? '戦闘中使用可' : ''}</span>
            ${useBtn}
          </div>
        </div>`;
    });
    html += `</div>`;
  }

  // 素材一覧
  html += `<div class="section-title" style="margin-top:12px;">素材</div>`;
  const hasMats = Object.values(MATERIALS).some(m => (p.materials[m.id] || 0) > 0);
  if (!hasMats) {
    html += `<div class="dim">素材を所持していません。</div>`;
  } else {
    html += `<div class="material-grid">`;
    Object.values(MATERIALS).forEach(mat => {
      const qty = p.materials[mat.id] || 0;
      if (qty === 0) return;
      html += `
        <div class="material-card">
          <div class="mat-name">${mat.name}</div>
          <div class="mat-tier dim">Tier${mat.tier}</div>
          <div class="mat-qty">${qty}</div>
        </div>`;
    });
    html += `</div>`;
  }

  // スキルオーブ
  html += `<div class="section-title" style="margin-top:12px;">スキルオーブ</div>`;
  html += `<div class="dim">所持数: ${p.skillOrbs} 個</div>`;

  container.innerHTML = html;
}

function doUseItem(itemId) {
  const result = useItem(State.player, itemId);
  if (!result.success) { showToast(result.message); return; }
  showToast(`${ITEMS[itemId].name} を使用しました。`);
  renderMenu();
}

// ========== 属性ラベル ==========
function elemLabel(elem) {
  const labels = { fire:'火', ice:'氷', wind:'風', light:'光', dark:'闇', none:'無' };
  return labels[elem] || elem;
}

// ========== ダイアログ ==========
function showDialog(html) {
  let overlay = document.getElementById('dialog-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'dialog-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `<div class="dialog-box">${html}</div>`;
  overlay.classList.remove('hidden');
}

function closeDialog() {
  document.getElementById('dialog-overlay')?.classList.add('hidden');
}

// ========== トースト通知 ==========
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}
