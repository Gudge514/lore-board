import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// Step 2: Update all tabletopCards.value.push to tabletopEntities.value.push with proper entity structure
// This is a complex replacement - we need to wrap the pushed objects properly

// For now, let's just replace the simple pushes and flag the complex ones for manual review

// 1. Simple push of existing card object
code = code.replace(
  /tabletopCards\.value\.push\(removedCard\)/g,
  `// TODO: Convert removedCard to entity format\n        tabletopEntities.value.push(removedCard)`
);

code = code.replace(
  /tabletopCards\.value\.push\(\.\.\.slotted\)/g,
  `// TODO: Convert slotted cards to entity format\n        tabletopEntities.value.push(...slotted)`
);

code = code.replace(
  /tabletopCards\.value\.push\(\.\.\.instance\.slottedCards\)/g,
  `// TODO: Convert slotted cards to entity format\n        tabletopEntities.value.push(...instance.slottedCards)`
);

code = code.replace(
  /tabletopCards\.value\.push\(instanceCard\)/g,
  `tabletopEntities.value.push(instanceCard)`
);

code = code.replace(
  /tabletopCards\.value\.push\(\{ \.\.\.cardData, x: e\.clientX - 200, y: e\.clientY - 200 \}\)/g,
  `tabletopEntities.value.push({ ...cardData, x: e.clientX - 200, y: e.clientY - 200 })`
);

code = code.replace(
  /tabletopCards\.value\.push\(bouncedCard\)/g,
  `tabletopEntities.value.push(bouncedCard)`
);

code = code.replace(
  /tabletopCards\.value\.push\(clearedCard\)/g,
  `tabletopEntities.value.push(clearedCard)`
);

// 2. Replace findIndex on tabletopCards
code = code.replace(
  /tabletopCards\.value\.findIndex\(c => c\.id ===/g,
  `tabletopEntities.value.findIndex(c => c.instanceId ===`
);

// 3. Replace verbs.value with drawerVerbs.value (for consistency)
code = code.replace(
  /verbs\.value\.find\(v => v\.id ===/g,
  `drawerVerbs.value.find(v => v.id ===`
);

code = code.replace(
  /verbs\.value\.forEach/g,
  `drawerVerbs.value.forEach`
);

code = code.replace(
  /verbs\.value\.splice/g,
  `tabletopEntities.value.splice`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Step 2 complete: Updated array operations');
