import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// =====================================================
// 修复 startDraggingCard - 简化判断逻辑
// =====================================================

code = code.replace(
  `// Check if dragging from drawer or tabletop
    // IMPORTANT: Check tabletop FIRST - a card can be in both drawer (as source) and tabletop (as instance)
    const isFromTabletop = tabletopCards.value.some(c => c.instanceId === card.instanceId)
    const isFromDrawer = !isFromTabletop && drawerCards.value.some(c => c.id === card.id)`,
  `// Check if dragging from drawer or tabletop
    // Drawer cards have ONLY 'id', Tabletop cards have 'instanceId'
    const isFromTabletop = !!card.instanceId`
);

// =====================================================
// 修复 onMouseMove - 确保使用正确的 entity 查找
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
      // Tabletop drag: update the entity position
      const entity = tabletopEntities.value.find(e => e.instanceId === draggedItem.value.originalCard.instanceId)
      if (entity) {
        entity.x = newX
        entity.y = newY
      }
    }`
);

// =====================================================
// 修复 onMouseUp - 确保删除逻辑正确
// =====================================================

code = code.replace(
  `// From tabletop: remove from tabletop (card returns to drawer)
              const tableIdx = tabletopEntities.value.findIndex(c => c.instanceId === originalCard.instanceId)
              if (tableIdx > -1) {
                tabletopEntities.value.splice(tableIdx, 1)
              }`,
  `// From tabletop: remove from tabletop (card returns to drawer)
              const tableIdx = tabletopEntities.value.findIndex(e => e.instanceId === originalCard.instanceId)
              if (tableIdx > -1) {
                tabletopEntities.value.splice(tableIdx, 1)
              }`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed entire drag chain - simplified source detection and entity lookup!');
