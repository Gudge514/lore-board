# LoreBoard V0.1 (MVP) 拆解计划

## 阶段 1：骨架与物理法则 (Foundation & Layout) - **当前阶段**
- [x] 初始化 Vue 3 + Tailwind CSS 脚手架
- [x] 开发实体卡牌组件 (`Card.vue`)：支持类型、倒计时、方面 (Aspects) 的视觉呈现。
- [ ] 开发动词插槽组件 (`Verb.vue`)：作为容器，接收拖拽的卡牌，具备空闲、吸附、处理中三种状态。
- [ ] 搭建四宫格布局 (`App.vue`)：左侧资源抽屉，中央自由桌面 (Tabletop Canvas)。

## 阶段 2：交互与校验 (Drag, Drop & Validate)
- [ ] 实现 HTML5 拖拽事件的绑定（从 Drawer 拖到 Tabletop，从 Tabletop 拖进 Verb 插槽）。
- [ ] 插槽校验逻辑 (Aspect Validation)：比如【合成】动词的插槽只接受拥有 `document` 或 `knowledge` 标签的卡牌。

## 阶段 3：仪式引擎 (The Ritual Engine)
- [ ] 点火机制 (Ignite)：卡牌填满插槽后，点击执行，动词进入转圈倒计时。
- [ ] 卡牌衰减与消耗：倒计时结束后，原卡牌被销毁（或耗尽），动词产出（掉落）新的结果卡牌到桌面上。

## 阶段 4：边缘系统 (Ephemeral & Nemesis)
- [ ] 临时授权衰减：带有 `duration` 的卡牌在桌面上随时间流逝，超时后变灰销毁。
- [ ] 副作用降临：模拟生成红色的【异常卡牌】，验证消除机制。