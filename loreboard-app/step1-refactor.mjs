import fs from 'fs';

let code = fs.readFileSync('src/App.vue', 'utf8');

// Replace the data model section - with CRLF line endings
const oldData = `// --- Data Models (MVP Fake State) ---\r
\r
// 1. Hand (Drawer): What the Sensei starts with\r
const drawerCards = ref([\r
  { id: 'c1', type: 'dynamic', label: 'Google CSE API Key', aspects: ['key', 'tool'], duration: null },\r
  { id: 'c2', type: 'static', label: 'Unprocessed HTML source', aspects: ['raw_data', 'text'], duration: 120 },\r
  { id: 'c3', type: 'secret', label: 'Stripe Test Token', aspects: ['key', 'finance'], duration: null },\r
  { id: 'c4', type: 'nemesis', label: 'Rate Limit Blocked', aspects: ['error', 'blocker'], duration: null }\r
])\r
\r
// 2. Tabletop (Canvas): Where things are moved/dropped\r
const tabletopCards = ref([\r
  { id: 't1', type: 'static', label: 'Initial Lore Fragment', aspects: ['knowledge'], duration: null, x: 100, y: 100 }\r
])\r
\r
// 3. Verb Definitions (Templates in drawer)\r
const verbDefinitions = ref([\r
  { id: 'v1', type: 'study', icon: '🧠', label: 'Extract Lore', requiredAspects: ['raw_data', 'text'] },\r
  { id: 'v2', type: 'work', icon: '⚒️', label: 'Execute Task', requiredAspects: ['tool'] },\r
  { id: 'v3', type: 'explore', icon: '🕵️', label: 'Deep Search', requiredAspects: ['key'] }\r
])\r
\r
// 3b. Canvas Verb Instances (dragged from drawer to canvas)\r
const canvasVerbs = ref([\r
  { instanceId: 'cv1', definitionId: 'v1', state: 'IDLE', slottedCards: [], x: 100, y: 300 },\r
  { instanceId: 'cv2', definitionId: 'v2', state: 'IDLE', slottedCards: [], x: 100, y: 450 },\r
  { instanceId: 'cv3', definitionId: 'v3', state: 'IDLE', slottedCards: [], x: 100, y: 600 }\r
])\r
\r
// Helper to get full verb data (merge definition + instance)\r
const getCanvasVerb = (instance) => {\r
  const def = verbDefinitions.value.find(d => d.id === instance.definitionId)\r
  return { ...def, ...instance, id: instance.instanceId }\r
}`;

const newData = `// --- Unified Entity Model ---\r
  // Both Cards and Verbs are Resources: Cards = materials, Verbs = contracts\r
  \r
  // 1. Drawer: Resource Library (infinite templates)\r
  const drawerResources = ref([\r
    // Cards (raw materials)\r
    { id: 'card-c1', entityType: 'card', type: 'dynamic', label: 'Google CSE API Key', aspects: ['key', 'tool'], duration: null },\r
    { id: 'card-c2', entityType: 'card', type: 'static', label: 'Unprocessed HTML source', aspects: ['raw_data', 'text'], duration: 120 },\r
    { id: 'card-c3', entityType: 'card', type: 'secret', label: 'Stripe Test Token', aspects: ['key', 'finance'], duration: null },\r
    { id: 'card-c4', entityType: 'card', type: 'nemesis', label: 'Rate Limit Blocked', aspects: ['error', 'blocker'], duration: null },\r
    // Verbs (contracts)\r
    { id: 'verb-v1', entityType: 'verb', type: 'study', icon: '🧠', label: 'Extract Lore', requiredAspects: ['raw_data', 'text'] },\r
    { id: 'verb-v2', entityType: 'verb', type: 'work', icon: '⚒️', label: 'Execute Task', requiredAspects: ['tool'] },\r
    { id: 'verb-v3', entityType: 'verb', type: 'explore', icon: '🕵️', label: 'Deep Search', requiredAspects: ['key'] }\r
  ])\r
  \r
  // 2. Tabletop: Resource Instances\r
  const tabletopEntities = ref([\r
    { instanceId: 'inst-t1', definitionId: 'card-c2', entityType: 'card', type: 'static', label: 'Unprocessed HTML source', aspects: ['raw_data', 'text'], duration: 120, x: 100, y: 100 },\r
    { instanceId: 'inst-v1', definitionId: 'verb-v1', entityType: 'verb', type: 'study', icon: '🧠', label: 'Extract Lore', requiredAspects: ['raw_data', 'text'], state: 'IDLE', slottedCards: [], x: 100, y: 300 },\r
    { instanceId: 'inst-v2', definitionId: 'verb-v2', entityType: 'verb', type: 'work', icon: '⚒️', label: 'Execute Task', requiredAspects: ['tool'], state: 'IDLE', slottedCards: [], x: 100, y: 450 },\r
    { instanceId: 'inst-v3', definitionId: 'verb-v3', entityType: 'verb', type: 'explore', icon: '🕵️', label: 'Deep Search', requiredAspects: ['key'], state: 'IDLE', slottedCards: [], x: 100, y: 600 }\r
  ])\r
  \r
  // Helper: Get full entity\r
  const getFullEntity = (instance) => {\r
    const def = drawerResources.value.find(d => d.id === instance.definitionId)\r
    return { ...def, ...instance, id: instance.instanceId }\r
  }\r
  \r
  // Backward-compatible computed aliases\r
  const drawerCards = computed(() => drawerResources.value.filter(r => r.entityType === 'card'))\r
  const drawerVerbs = computed(() => drawerResources.value.filter(r => r.entityType === 'verb'))\r
  const tabletopCards = computed(() => tabletopEntities.value.filter(e => e.entityType === 'card'))\r
  const tabletopVerbs = computed(() => tabletopEntities.value.filter(e => e.entityType === 'verb'))`;

if (code.includes(oldData)) {
  code = code.replace(oldData, newData);
  
  // Replace references
  code = code.replace(/verbDefinitions\.value/g, 'drawerVerbs.value');
  code = code.replace(/canvasVerbs\.value/g, 'tabletopVerbs.value');
  code = code.replace(/getCanvasVerb/g, 'getFullEntity');
  
  fs.writeFileSync('src/App.vue', code);
  console.log('✅ Step 1 complete: Data model refactored');
} else {
  console.log('❌ Could not find exact data model section');
  // Try to find what's different
  const idx = code.indexOf('// --- Data Models');
  console.log('Found at index:', idx);
  console.log('Next 500 chars:', JSON.stringify(code.substring(idx, idx + 500)));
}
