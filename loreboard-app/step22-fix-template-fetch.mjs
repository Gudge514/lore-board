import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 修复放置逻辑：直接通过 ID 从 drawerResources 获取模板定义
code = code.replace(
  `// Dropped on canvas
        if (fromDrawer) {
          // From drawer: create new INSTANCES on tabletop (drawer keeps the template)
          // Generate a unique instanceId for this instance, using original ID as base
          const instanceCard = {
            ...originalCard,
            instanceId: \`inst-\${originalCard.id}-\${Date.now()}\`,
            entityType: 'card',
            x: dragCard.x,
            y: dragCard.y
          }
          tabletopEntities.value.push(instanceCard)
          // Don't remove from drawer - it's a resource library!
        }`,
  `// Dropped on canvas
        if (fromDrawer) {
          // 彻底修复：无论传入的 originalCard 结构如何，始终通过 ID 从 drawerResources 获取最新模板
          const template = drawerResources.value.find(r => r.id === originalCard.id);
          
          if (template) {
            const instanceCard = {
              ...template,
              instanceId: \`inst-\${template.id}-\${Date.now()}\`,
              definitionId: template.id,
              entityType: 'card',
              x: dragCard.x,
              y: dragCard.y
            };
            tabletopEntities.value.push(instanceCard);
          } else {
            console.error('❌ Template not found for id:', originalCard.id);
          }
        }`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed: Always fetch template from drawerResources by ID!');
