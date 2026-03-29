import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// Fix startDraggingCard - use instanceId instead of id
code = code.replace(
  /const isFromTabletop = tabletopCards\.value\.some\(c => c\.id === card\.id\)/g,
  `const isFromTabletop = tabletopCards.value.some(c => c.instanceId === card.instanceId)`
);

// Fix the cleanupDrag reference (wrong listener being removed)
code = code.replace(
  /window\.removeEventListener\('mousemove', onDrawerResizeMove\)/g,
  `window.removeEventListener('mousemove', onMouseMove)`
);

// Fix onMouseMove tabletop entity update
code = code.replace(
  /const idx = tabletopCards\.value\.findIndex\(c => c\.id === draggedItem\.value\.originalCard\.id\)/g,
  `const idx = tabletopEntities.value.findIndex(c => c.instanceId === draggedItem.value.originalCard.instanceId)`
);

// Fix tabletopCards.value.splice to tabletopEntities.value.splice
code = code.replace(
  /tabletopCards\.value\.splice\(tableIdx, 1\)/g,
  `tabletopEntities.value.splice(tableIdx, 1)`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed card dragging - using instanceId!');
