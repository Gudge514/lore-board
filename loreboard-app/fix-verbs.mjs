import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 统计替换数量
let count = 0;

// 1. tabletopVerbs.value.forEach → tabletopVerbs.value.forEach (computed 可以读取，不能修改)
// 这些是读取操作，保留不变

// 2. tabletopVerbs.value.find → 保留（读取操作）

// 3. tabletopVerbs.value.findIndex + splice → 需要改成 tabletopEntities
// 这是修改操作，必须改

const patterns = [
  // Pattern 1: findIndex + splice on tabletopVerbs
  {
    regex: /const idx = tabletopVerbs\.value\.findIndex\(cv => cv\.instanceId === ([\w.]+)\)\s*if \(idx > -1\) \{[\s\S]*?tabletopVerbs\.value\.splice\(idx, 1\)/,
    replacement: (match, p1) => {
      return match
        .replace('tabletopVerbs.value.findIndex', 'tabletopEntities.value.findIndex')
        .replace('tabletopVerbs.value.splice', 'tabletopEntities.value.splice')
        .replace('const instance = tabletopVerbs.value[idx]', 'const instance = tabletopEntities.value[idx]');
    }
  },
  // Pattern 2: tabletopVerbs.value.push → tabletopEntities.value.push
  {
    regex: /tabletopVerbs\.value\.push\(\{ \.\.\.draggedItem\.value\.dragInstance \}\)/g,
    replacement: 'tabletopEntities.value.push({ ...draggedItem.value.dragInstance })'
  }
];

patterns.forEach(({ regex, replacement }) => {
  const matches = code.match(regex);
  if (matches) {
    count++;
    if (typeof replacement === 'function') {
      code = code.replace(regex, replacement);
    } else {
      code = code.replace(regex, replacement);
    }
    console.log(`✅ Applied pattern ${count}`);
  }
});

fs.writeFileSync('src/App.vue', code);
console.log(`\nTotal patterns applied: ${count}`);
