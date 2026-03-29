import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 注入 debug log
code = code.replace(
  `const startDraggingCard = (card, event) => {`,
  `const startDraggingCard = (card, event) => {
    console.log('Dragging card:', card.id, card.label, card);`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Added drag debug logs!');
