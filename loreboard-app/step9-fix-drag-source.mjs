import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// =====================================================
// 核心修复：正确判断卡牌来源 - 根据是否有 instanceId 字段
// =====================================================

code = code.replace(
  `// Check if dragging from drawer or tabletop
    // IMPORTANT: Check tabletop FIRST - a card can be in both drawer (as source) and tabletop (as instance)
    const isFromTabletop = tabletopCards.value.some(c => c.instanceId === card.instanceId)
    const isFromDrawer = !isFromTabletop && drawerCards.value.some(c => c.id === card.id)`,
  `// Check if dragging from drawer or tabletop
    // IMPORTANT: Drawer cards have 'id', Tabletop cards have 'instanceId'
    const isFromTabletop = !!card.instanceId && tabletopEntities.value.some(c => c.instanceId === card.instanceId)
    const isFromDrawer = !isFromTabletop`
);

// Also fix the opacity class in template
code = code.replace(
  /draggedItem\.originalCard\.instanceId === card\.id/g,
  `draggedItem.originalCard.instanceId === card.instanceId || draggedItem.originalCard.id === card.id`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed drag source detection - use instanceId presence check!');
