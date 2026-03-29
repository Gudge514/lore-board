import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 在 startDraggingCard 的最开始打印所有重要信息
code = code.replace(
  `const startDraggingCard = (card, event) => {`,
  `const startDraggingCard = (card, event) => {
    console.log('DEBUG: Card object passed to startDraggingCard:', card);
    console.log('DEBUG: card.id:', card.id, 'card.instanceId:', card.instanceId);
    // Prevent multiple drag handlers`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Added deep debug logs for startDraggingCard!');
