import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// =====================================================
// 修复：抽屉卡牌实例化逻辑
// 抽屉卡牌只有 id 字段，没有 instanceId
// =====================================================

code = code.replace(
  `// From drawer: create new INSTANCES on tabletop (drawer keeps the template)
          // Generate a unique ID for this instance
          const instanceCard = {
            ...originalCard,
            id: \`\${originalCard.instanceId}-inst-\${Date.now()}\`, // Unique instance ID
            x: dragCard.x,
            y: dragCard.y
          }`,
  `// From drawer: create new INSTANCES on tabletop (drawer keeps the template)
          // Generate a unique instanceId for this instance
          const instanceCard = {
            ...originalCard,
            instanceId: \`inst-\${originalCard.id}-\${Date.now()}\`,
            entityType: 'card',
            x: dragCard.x,
            y: dragCard.y
          }`
);

// =====================================================
// 修复：onMouseUp 中桌面卡牌返回抽屉的判断
// 应该用 instanceId 而不是 id
// =====================================================

code = code.replace(
  `const tableIdx = tabletopEntities.value.findIndex(c => c.instanceId === originalCard.instanceId)`,
  `const tableIdx = tabletopEntities.value.findIndex(c => c.instanceId === originalCard.instanceId)`
);

// =====================================================
// 修复：startDraggingCard 中的来源判断
// 简化为检查是否有 instanceId 字段
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

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed drawer-to-tabletop card instantiation logic!');
