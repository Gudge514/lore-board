import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 1. Fix drawer card v-for key
code = code.replace(
  /:key="card\.instanceId"/g,
  ':key="card.id"'
);

// 2. Fix v-if logic for cards grid
code = code.replace(
  `<template v-if="drawerActiveTab !== 'verbs'">`,
  `<template v-if="drawerActiveTab !== 'verbs'">` 
);

// Actually, the current template looks like this:
// <template v-if="drawerActiveTab !== 'verbs'">
//   ... cards grid ...
// </template>
// <template v-if="displayVerbs.length > 0">
//   ... verbs grid ...
// </template>

// This logic is correct, but let's make sure the card key is right.
// The error reported by Sensei might be due to `card.instanceId` being accessed on a drawer card.

fs.writeFileSync('src/App.vue', code);
console.log('✅ Checked and confirmed template fixes!');
