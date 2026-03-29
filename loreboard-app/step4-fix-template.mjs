import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 1. Fix template - canvasVerbs to tabletopVerbs
code = code.replace(/v-for="instance in canvasVerbs"/g, 'v-for="instance in tabletopVerbs"');

// 2. Fix template - card.key from card.id to card.instanceId
code = code.replace(/:key="card\.id"/g, ':key="card.instanceId"');

// 3. Fix onMouseUp - originalCard.id to originalCard.instanceId
code = code.replace(/originalCard\.id/g, 'originalCard.instanceId');

// 4. Fix template - draggedItem.originalCard.id to draggedItem.originalCard.instanceId
code = code.replace(/draggedItem\.originalCard\.id/g, 'draggedItem.originalCard.instanceId');

// 5. Fix template - selectedCardId === card.id to selectedCardId === card.instanceId
code = code.replace(/selectedCardId === card\.id/g, 'selectedCardId === card.instanceId');

// 6. Fix instanceCard creation - use instanceId properly
code = code.replace(
  /id: `\$\{originalCard\.id\}-inst-\$\{Date\.now\(\)\}`/g,
  `instanceId: \`inst-card-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\``
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed template bindings and ID references!');
