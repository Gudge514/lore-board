import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// 找到 push 逻辑，注入调试信息
code = code.replace(
  `tabletopEntities.value.push(instanceCard);`,
  `console.log('DEBUG: Final instanceCard to push:', instanceCard);
          tabletopEntities.value.push(instanceCard);`
);

fs.writeFileSync('src/App.vue', code);
console.log('✅ Added final debug log before push!');
