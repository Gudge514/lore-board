import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 注入更详细的调试信息
code = code.replace(
  `if (template) {
            const instanceCard = {
              ...template,
              instanceId: \`inst-\${template.id}-\${Date.now()}\`,
              definitionId: template.id,
              entityType: 'card',
              x: dragCard.x,
              y: dragCard.y
            };
            tabletopEntities.value.push(instanceCard);
          }`,
  `if (template) {
            console.log('DEBUG: Found template for:', template.id);
            const instanceCard = {
              ...template,
              instanceId: \`inst-\${template.id}-\${Date.now()}\`,
              definitionId: template.id,
              entityType: 'card',
              x: dragCard.x,
              y: dragCard.y
            };
            console.log('DEBUG: Generated instanceCard:', instanceCard);
            tabletopEntities.value.push(instanceCard);
          } else {
            console.error('DEBUG: Template NOT found for originalCard:', originalCard);
          }`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Added detailed instantiation debug logs!');
