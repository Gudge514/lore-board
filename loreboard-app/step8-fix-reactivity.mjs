import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// =====================================================
// 修复响应式问题：使用展开运算符创建新对象，强制触发响应式更新
// =====================================================

// Fix card drag position update - use spread to create new object
code = code.replace(
  `} else {
      // Tabletop drag: find and update the entity in tabletopEntities
      const entity = tabletopEntities.value.find(e => e.instanceId === draggedItem.value.originalCard.instanceId)
      if (entity) {
        entity.x = newX
        entity.y = newY
      }
    }`,
  `} else {
      // Tabletop drag: find and update the entity in tabletopEntities
      const idx = tabletopEntities.value.findIndex(e => e.instanceId === draggedItem.value.originalCard.instanceId)
      if (idx > -1) {
        // Create new object to trigger reactivity
        tabletopEntities.value[idx] = { ...tabletopEntities.value[idx], x: newX, y: newY }
      }
    }`
);

// Fix verb drag position update similarly
code = code.replace(
  `const instance = draggedItem.value.instance
      const entity = tabletopEntities.value.find(e => e.instanceId === instance.instanceId)
      if (entity) {
        entity.x = mouseX - draggedItem.value.offsetX
        entity.y = mouseY - draggedItem.value.offsetY
      }`,
  `const instance = draggedItem.value.instance
      const idx = tabletopEntities.value.findIndex(e => e.instanceId === instance.instanceId)
      if (idx > -1) {
        // Create new object to trigger reactivity
        tabletopEntities.value[idx] = { 
          ...tabletopEntities.value[idx], 
          x: mouseX - draggedItem.value.offsetX, 
          y: mouseY - draggedItem.value.offsetY 
        }
      }`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed reactivity - use spread operator to create new objects!');
