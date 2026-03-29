import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 修复绑定逻辑，增加对 originalCard 的非空检查
code = code.replace(
  `:class="{ 'opacity-50': draggedItem && draggedItem.fromDrawer && (draggedItem.originalCard.instanceId === card.instanceId || draggedItem.originalCard.id === card.id) }"`,
  `:class="{ 'opacity-50': draggedItem && draggedItem.fromDrawer && draggedItem.originalCard && (draggedItem.originalCard.instanceId === card.instanceId || draggedItem.originalCard.id === card.id) }"`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed: Added null check for draggedItem.originalCard in opacity class!');
