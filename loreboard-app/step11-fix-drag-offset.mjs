import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// =====================================================
// 修复 1: onMouseMove 中卡牌拖拽 - 使用展开运算符创建新对象
// =====================================================

code = code.replace(
  `} else {
      // Tabletop drag: find and update the card in tabletopCards array for reactivity
      const idx = tabletopEntities.value.findIndex(c => c.instanceId === draggedItem.value.originalCard.instanceId)
      if (idx > -1) {
        tabletopEntities.value[idx].x = newX
        tabletopEntities.value[idx].y = newY
      }
    }`,
  `} else {
      // Tabletop drag: find and update the entity
      const idx = tabletopEntities.value.findIndex(e => e.instanceId === draggedItem.value.originalCard.instanceId)
      if (idx > -1) {
        tabletopEntities.value[idx] = { ...tabletopEntities.value[idx], x: newX, y: newY }
      }
    }`
);

// =====================================================
// 修复 2: onMouseMove 中 Verb 拖拽 - 直接在 tabletopEntities 中查找
// =====================================================

code = code.replace(
  `} else if (draggedItem.value.type === 'verb-instance') {
      // Dragging existing canvas instance: update position
      const instance = draggedItem.value.instance
      const idx = tabletopVerbs.value.findIndex(cv => cv.instanceId === instance.instanceId)
      if (idx > -1) {
        tabletopEntities.value[idx].x = mouseX - draggedItem.value.offsetX
        tabletopEntities.value[idx].y = mouseY - draggedItem.value.offsetY
      }
    }`,
  `} else if (draggedItem.value.type === 'verb-instance') {
      // Dragging existing canvas instance: update position
      const idx = tabletopEntities.value.findIndex(e => e.instanceId === draggedItem.value.instance.instanceId)
      if (idx > -1) {
        tabletopEntities.value[idx] = { 
          ...tabletopEntities.value[idx], 
          x: mouseX - draggedItem.value.offsetX, 
          y: mouseY - draggedItem.value.offsetY 
        }
      }
    }`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed drag offset - use correct entity lookup and spread operator!');
