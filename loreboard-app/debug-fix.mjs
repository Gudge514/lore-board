import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 使用正则表达式来替换，不依赖精确的换行符
const regex = /\/\/ Tabletop drag: find and update the card in tabletopCards array for reactivity[\s\S]*?tabletopEntities\.value\[idx\]\.y = newY[\s\S]*?\}/;

const replacement = `// Tabletop drag: update entity position directly
      const entity = tabletopEntities.value.find(e => e.instanceId === draggedItem.value.originalCard.instanceId)
      if (entity) {
        entity.x = newX
        entity.y = newY
      }`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  console.log('✅ Fixed onMouseMove tabletop drag using regex');
} else {
  console.log('❌ Regex did not match');
}

// Also fix verb drag
const verbRegex = /\/\/ Dragging existing canvas instance: update position[\s\S]*?tabletopEntities\.value\[idx\]\.y = mouseY - draggedItem\.value\.offsetY[\s\S]*?\}/;

const verbReplacement = `// Dragging existing canvas instance: update position
      const entity = tabletopEntities.value.find(e => e.instanceId === draggedItem.value.instance.instanceId)
      if (entity) {
        entity.x = mouseX - draggedItem.value.offsetX
        entity.y = mouseY - draggedItem.value.offsetY
      }`;

if (verbRegex.test(code)) {
  code = code.replace(verbRegex, verbReplacement);
  console.log('✅ Fixed onMouseMove verb drag using regex');
} else {
  console.log('❌ Verb regex did not match');
}

fs.writeFileSync('src/App.vue', code);
