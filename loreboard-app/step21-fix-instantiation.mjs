import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 修复实例化逻辑，确保从 drawerResources 中正确获取定义
const oldInstanceLogic = `// Dropped on canvas
        if (fromDrawer) {
          // From drawer: create new INSTANCES on tabletop (drawer keeps the template)
          // Generate a unique ID for this instance
          const instanceCard = {
            ...originalCard,
            instanceId: \`inst-card-\${Date.now()}\`,
            entityType: 'card',
            x: dragCard.x,
            y: dragCard.y
          }
          tabletopEntities.value.push(instanceCard)
          // Don't remove from drawer - it's a resource library!
        }`;

const newInstanceLogic = `// Dropped on canvas
        if (fromDrawer) {
          // Find the template in drawerResources
          const template = drawerResources.value.find(r => r.id === originalCard.id) || originalCard;
          
          // Create new instance on tabletop
          const instanceCard = {
            ...template,
            instanceId: \`inst-\${template.id}-\${Date.now()}\`,
            definitionId: template.id,
            entityType: 'card',
            x: dragCard.x,
            y: dragCard.y
          };
          tabletopEntities.value.push(instanceCard);
        }`;

code = code.replace(oldInstanceLogic, newInstanceLogic);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed: Correctly instantiating from drawerResources!');
