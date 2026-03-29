import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// =====================================================
// 修复 1: 卡牌实例化 - 正确生成 instanceId
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
            instanceId: \`inst-card-\${Date.now()}\`,
            entityType: 'card',
            x: dragCard.x,
            y: dragCard.y
          }`
);

// =====================================================
// 修复 2: Verb 拖拽视觉 - 渲染 dragInstance 而不是 definition
// =====================================================

code = code.replace(
  `<Verb v-if="draggedItem.type === 'verb-definition'" :verb="draggedItem.definition" />`,
  `<Verb v-if="draggedItem.type === 'verb-definition'" :verb="{ ...draggedItem.definition, ...draggedItem.dragInstance }" />`
);

// =====================================================
// 修复 3: Verb 放置到桌面 - 使用 tabletopEntities 而不是 tabletopVerbs
// =====================================================

code = code.replace(
  `// Dropped on canvas
      if (draggedItem.value.type === 'verb-definition') {
        // Create new instance on canvas
        tabletopVerbs.value.push({ ...draggedItem.value.dragInstance })
      }`,
  `// Dropped on canvas
      if (draggedItem.value.type === 'verb-definition') {
        // Create new instance on canvas
        tabletopEntities.value.push({ ...draggedItem.value.dragInstance })
      }`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed: card instantiation, verb drag visual, and verb placement!');
