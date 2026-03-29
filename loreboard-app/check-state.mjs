import fs from 'fs';
let code = fs.readFileSync('src/App.vue', 'utf8');

// 注入一个检查当前状态的辅助函数，可以在控制台调用
code = code.replace(
  `const toggleDrawer = () => {`,
  `window.debugState = () => {
    console.log('--- Canvas State Report ---');
    console.log('DrawerResources (Templates):', drawerResources.value.length);
    console.log('TabletopEntities (Instances):', tabletopEntities.value.length);
    tabletopEntities.value.forEach((e, i) => {
        console.log(\`[\${i}] \${e.entityType} - ID: \${e.instanceId}, Definition: \${e.definitionId}, Pos: (\${e.x}, \${e.y})\`);
    });
  };
  const toggleDrawer = () => {`
);

fs.writeFileSync('src/App.vue', code);
console.log('? Added debugState function for Console inspection!');
