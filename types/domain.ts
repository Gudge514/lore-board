/**
 * LoreBoard 核心领域模型 (Domain Model)
 * 基于《密教模拟器》隐喻的 AI 资源编排架构
 */

// ==========================================
// 1. 卡牌与资源 (Cards & Resources)
// ==========================================

export type CardClass = 'dynamic' | 'static' | 'secret' | 'error' | 'token';

/**
 * 实体卡牌：代表系统中的一切资源（输入、输出、状态、报错）
 */
export interface Card {
  id: string;                  // 唯一标识 UUID
  name: string;                // 卡牌名称，如 "Brave Search API Key" 或 "429 Rate Limit"
  description: string;         // 卡牌描述
  class: CardClass;            // 资源大类
  tags: string[];              // 标签系统，核心匹配机制。如 ['type:credential', 'provider:search']
  
  // 衰减机制 (Decay Mechanics)
  isEphemeral: boolean;        // 是否为临时资源（会衰减）
  expiresAt?: number;          // 倒计时时间戳 (Unix Timestamp)，为空则永久存在
  
  // 实际负载
  payload: any;                // 实际的数据载荷（如文件路径、API Token 值、JSON 数据等）
}

// ==========================================
// 2. 动词与契约 (Verbs & Contracts)
// ==========================================

/**
 * 插槽约束规则：定义哪些卡牌可以被放入插槽
 */
export interface SlotConstraint {
  requireTags: string[];       // 必须包含的标签（如 ['type:markdown']）
  forbidTags?: string[];       // 禁止包含的标签（如 ['status:error']）
  maxCards?: number;           // 允许放入的最大卡牌数（默认 1）
}

/**
 * 动词插槽：用来放置卡牌的框框
 */
export interface Slot {
  id: string;                  // 插槽 ID，如 "input_doc", "auth_token"
  name: string;                // 插槽显示名称
  description: string;         // 提示用户放入什么卡牌
  constraint: SlotConstraint;  // 匹配契约
  cards: Card[];               // 当前已放入的卡牌
}

/**
 * 磁吸与燃烧机制 (Magnet & Token Burn)
 * 用于常驻 Agent 定期消耗资源
 */
export interface MagnetConfig {
  consumeTags: string[];       // 要吸走并销毁的卡牌标签（如 ['type:token', 'provider:openai']）
  intervalMs: number;          // 吸取周期
  isStarving: boolean;         // 如果没吸到卡，是否进入饥饿停工状态
}

/**
 * 动词（任务模板）：代表一种可执行的操作
 */
export interface Verb {
  id: string;                  // 如 "academic-deep-research"
  name: string;                // 显示名称，如 "学术深度研究"
  description: string;         // 动词说明
  
  slots: Slot[];               // 暴露的插槽列表
  
  // 经验契约 (Contract)
  expectedDurationMs: number;  // 预期耗时，超时则可能掉落【异常卡牌】
  
  magnet?: MagnetConfig;       // 磁吸配置（如果是常驻服务）
}

// ==========================================
// 3. 执行实例与桌面 (Operations & Tabletop)
// ==========================================

export type OperationStatus = 'idle' | 'running' | 'completed' | 'failed' | 'pending_approval';

/**
 * 任务实例：填满插槽后点击“点火”生成的运行态
 */
export interface Operation {
  id: string;                  // 实例 UUID
  verbId: string;              // 关联的动词模板 ID
  status: OperationStatus;     // 当前状态
  
  startTime: number;
  progress: number;            // 0-100
  
  inputs: Record<string, Card[]>; // 快照：当时点火时放入每个 Slot 的卡牌
  outputs: Card[];             // 任务结束后掉落在桌面上的新卡牌
}

/**
 * 桌面（当前工作区上下文）
 */
export interface Tabletop {
  activeOperations: Operation[]; // 正在运行的动词/任务
  cardsOnTable: Card[];          // 散落在桌面上（未归档进抽屉）的卡牌
}
