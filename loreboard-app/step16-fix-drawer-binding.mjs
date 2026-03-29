import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// Fix drawer card v-for key
code = code.replace(
  /v-for="card in filteredDrawerCards"\n\s*:key="card\.instanceId"/g,
  `v-for="card in filteredDrawerCards"
                  :key="card.id"`
);

// Fix drawer card selection state binding
code = code.replace(
  /:is-selected="selectedCardId === card.instanceId"/g,
  `:is-selected="selectedCardId === card.id"`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed drawer v-for keys and selection!');
