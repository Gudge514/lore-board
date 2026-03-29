import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 使用展开运算符强制触发响应式更新
code = code.replace(
  /\/\/ Tabletop drag: update entity position directly[\s\S]*?if \(entity\) \{[\s\S]*?entity\.x = newX[\s\S]*?entity\.y = newY[\s\S]*?\}/,
  `// Tabletop drag: update entity position with spread for reactivity
      const idx = tabletopEntities.value.findIndex(e => e.instanceId === draggedItem.value.originalCard.instanceId)
      if (idx > -1) {
        tabletopEntities.value[idx] = { ...tabletopEntities.value[idx], x: newX, y: newY }
      }`
);

code = code.replace(
  /\/\/ Dragging existing canvas instance: update position[\s\S]*?if \(entity\) \{[\s\S]*?entity\.x = mouseX - draggedItem\.value\.offsetX[\s\S]*?entity\.y = mouseY - draggedItem\.value\.offsetY[\s\S]*?\}/,
  `// Dragging existing canvas instance: update position with spread for reactivity
      const idx = tabletopEntities.value.findIndex(e => e.instanceId === draggedItem.value.instance.instanceId)
      if (idx > -1) {
        tabletopEntities.value[idx] = { 
          ...tabletopEntities.value[idx], 
          x: mouseX - draggedItem.value.offsetX, 
          y: mouseY - draggedItem.value.offsetY 
        }
      }`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Fixed with spread operator for reactivity!');
