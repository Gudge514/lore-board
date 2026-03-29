import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// =====================================================
// 核心修复：onMouseMove 中直接在 tabletopEntities 中查找，而不是用过滤后的索引
// =====================================================

// Fix the tabletop drag position update
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
      // Tabletop drag: find and update the entity in tabletopEntities
      const entity = tabletopEntities.value.find(e => e.instanceId === draggedItem.value.originalCard.instanceId)
      if (entity) {
        entity.x = newX
        entity.y = newY
      }
    }`
);

// Fix verb drag position update similarly
code = code.replace(
  `const instance = draggedItem.value.instance
      const idx = tabletopVerbs.value.findIndex(cv => cv.instanceId === instance.instanceId)
      if (idx > -1) {
        tabletopEntities.value[idx].x = mouseX - draggedItem.value.offsetX
        tabletopEntities.value[idx].y = mouseY - draggedItem.value.offsetY
      }`,
  `const instance = draggedItem.value.instance
      const entity = tabletopEntities.value.find(e => e.instanceId === instance.instanceId)
      if (entity) {
        entity.x = mouseX - draggedItem.value.offsetX
        entity.y = mouseY - draggedItem.value.offsetY
      }`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed index mismatch - use find() instead of findIndex()!');
