import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 1. 在拖拽逻辑中强制为抽屉卡牌生成正确的 instanceId
code = code.replace(
  `// From drawer: create new INSTANCES on tabletop (drawer keeps the template)
          // Generate a unique instanceId for this instance
          const instanceCard = {
            ...originalCard,
            instanceId: \`inst-card-\${Date.now()}\`,
            entityType: 'card',
            x: dragCard.x,
            y: dragCard.y
          }`,
  `// From drawer: create new INSTANCES on tabletop (drawer keeps the template)
          // Generate a unique instanceId for this instance, using original ID as base
          const instanceCard = {
            ...originalCard,
            instanceId: \`inst-\${originalCard.id}-\${Date.now()}\`,
            entityType: 'card',
            x: dragCard.x,
            y: dragCard.y
          }`
);

// 2. 检查 App.vue 中的 v-for 绑定是否都用了 instanceId
code = code.replace(
  /:key="card\.id"/g,
  ':key="card.instanceId"'
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed: instanceId generation and template bindings!');
