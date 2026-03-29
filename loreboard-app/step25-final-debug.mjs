import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 注入深度调试日志
code = code.replace(
  `// From drawer: create new INSTANCES on tabletop (drawer keeps the template)
          // Generate a unique instanceId for this instance, using original ID as base
          const instanceCard = {
            ...originalCard,
            instanceId: \`inst-\${originalCard.id}-\${Date.now()}\`,
            entityType: 'card',
            x: dragCard.x,
            y: dragCard.y
          }
          tabletopEntities.value.push(instanceCard)
          // Don't remove from drawer - it's a resource library!`,
  `// From drawer: create new INSTANCES on tabletop (drawer keeps the template)
          // Generate a unique instanceId for this instance, using original ID as base
          const template = drawerResources.value.find(r => r.id === originalCard.id) || originalCard;
          console.log('DEBUG: Template found:', template);
          
          const instanceCard = {
            ...template,
            instanceId: \`inst-\${template.id}-\${Date.now()}\`,
            entityType: 'card',
            x: dragCard.x,
            y: dragCard.y
          }
          console.log('DEBUG: Pushing instanceCard:', instanceCard);
          tabletopEntities.value.push(instanceCard)
          // Don't remove from drawer - it's a resource library!`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Added final deep debug logs!');
