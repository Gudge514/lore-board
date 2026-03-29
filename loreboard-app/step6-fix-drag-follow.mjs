import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// =====================================================
// 核心修复：拖拽跟随 - 更新 tabletopEntities 而不是 computed 的 tabletopCards
// =====================================================

code = code.replace(
  /tabletopCards\.value\[idx\]\.x = newX/g,
  `tabletopEntities.value[idx].x = newX`
);

code = code.replace(
  /tabletopCards\.value\[idx\]\.y = newY/g,
  `tabletopEntities.value[idx].y = newY`
);

// =====================================================
// 修复 Verb 拖拽跟随 - 同样更新 tabletopEntities
// =====================================================

code = code.replace(
  /tabletopVerbs\.value\[idx\]\.x = mouseX/g,
  `tabletopEntities.value[idx].x = mouseX`
);

code = code.replace(
  /tabletopVerbs\.value\[idx\]\.y = mouseY/g,
  `tabletopEntities.value[idx].y = mouseY`
);

// =====================================================
// 修复选中逻辑 - 确保使用 instanceId
// =====================================================

// Fix onCardSelect
code = code.replace(
  /const onCardSelect = \(cardId\) => \{[\s\S]*?selectedCardId\.value = cardId[\s\S]*?\}/,
  `const onCardSelect = ({ cardId }) => {
    if (selectedCardId.value === cardId) {
      selectedCardId.value = null
    } else {
      selectedCardId.value = cardId
    }
  }`
);

// Fix onVerbSelect  
code = code.replace(
  /const onVerbSelect = \(verbId\) => \{[\s\S]*?selectedVerbId\.value = verbId[\s\S]*?\}/,
  `const onVerbSelect = ({ verbId }) => {
    if (selectedVerbId.value === verbId) {
      selectedVerbId.value = null
    } else {
      selectedVerbId.value = verbId
    }
  }`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed: drag follow (tabletopEntities), selection logic!');
