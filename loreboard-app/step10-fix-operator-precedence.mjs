import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// =====================================================
// 修复模板中的运算符优先级问题 - 添加括号保护
// =====================================================

code = code.replace(
  `:class="{ 'opacity-50': draggedItem && draggedItem.fromDrawer && draggedItem.originalCard.instanceId === card.instanceId || draggedItem.originalCard.id === card.id }"`,
  `:class="{ 'opacity-50': draggedItem && draggedItem.fromDrawer && (draggedItem.originalCard.instanceId === card.instanceId || draggedItem.originalCard.id === card.id) }"`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed operator precedence in template!');
