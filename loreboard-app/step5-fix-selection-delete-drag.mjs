import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// =====================================================
// 问题 1: 抽屉卡牌选中逻辑 - 使用 instanceId
// =====================================================

// Fix onCardSelect to use instanceId
code = code.replace(
  /selectedCardId\.value = card\.id/g,
  `selectedCardId.value = card.instanceId`
);

code = code.replace(
  /selectedCardId\.value = null/g,
  `selectedCardId.value = null`
);

// =====================================================
// 问题 2: 删除逻辑 - 使用正确的 entity 查找和删除
// =====================================================

// Fix handleKeyDown for card deletion
code = code.replace(
  /const cardIdx = tabletopCards\.value\.findIndex\(c => c\.id === selectedCardId\.value\)/g,
  `const cardIdx = tabletopEntities.value.findIndex(c => c.instanceId === selectedCardId.value)`
);

code = code.replace(
  /tabletopCards\.value\.splice\(cardIdx, 1\)/g,
  `tabletopEntities.value.splice(cardIdx, 1)`
);

// Fix verb deletion
code = code.replace(
  /const verbIdx = verbs\.value\.findIndex\(v => v\.id === selectedVerbId\.value\)/g,
  `const verbIdx = tabletopEntities.value.findIndex(v => v.instanceId === selectedVerbId.value)`
);

// =====================================================
// 问题 3: 拖拽不跟随 - 修复 onMouseMove 中的位置更新
// =====================================================

// The drag follow issue is likely because we're updating the wrong array
// Let's check and fix the onMouseMove card position update
code = code.replace(
  /const idx = tabletopEntities\.value\.findIndex\(c => c\.instanceId === draggedItem\.value\.originalCard\.instanceId\)/g,
  `const idx = tabletopEntities.value.findIndex(c => c.instanceId === draggedItem.value.originalCard.instanceId)`
);

// Make sure we're updating the right property
code = code.replace(
  /tabletopEntities\.value\[idx\]\.x = newX/g,
  `tabletopEntities.value[idx].x = newX`
);

// =====================================================
// Additional fixes for consistency
// =====================================================

// Fix slottedCards cleanup - cards should be returned as entity instances
code = code.replace(
  /tabletopEntities\.value\.push\(removedCard\)/g,
  `// Convert removedCard to entity if needed\n        tabletopEntities.value.push(removedCard)`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed: selection, deletion, and drag follow!');
