// Schema Version 排序配置类型定义
import { getStorageEnvSuffix } from './storage-env';

export interface SchemaVersionConfig {
  schemaVersion: string;
  renderIndex: number;
}

export interface SortConfig {
  positive: SchemaVersionConfig[]; // renderIndex > 0
  negative: SchemaVersionConfig[]; // renderIndex < 0
}

const STORAGE_KEY = '数据定义版本_sort_config' + getStorageEnvSuffix();

const DEFAULT_CONFIG: SortConfig = {
  positive: [
    { schemaVersion: 'cvforce.knowledge.refrence.v1', renderIndex: 9 },
  ],
  negative: [{ schemaVersion: 'cvforce.search.result.v1', renderIndex: -1 }],
};

// 默认的 数据定义版本（不能删除）
export const DEFAULT_SCHEMA_VERSIONS = [
  'cvforce.knowledge.refrence.v1',
  'cvforce.search.result.v1',
];

// localStorage 工具函数
export const loadConfigFromStorage = (): SortConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 验证数据结构
      if (
        parsed.positive &&
        Array.isArray(parsed.positive) &&
        parsed.negative &&
        Array.isArray(parsed.negative)
      ) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load config from localStorage:', e);
  }
  return DEFAULT_CONFIG;
};

export const saveConfigToStorage = (config: SortConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config to localStorage:', e);
  }
};

// 重新计算 renderIndex（基于顺序）
export const recalculateRenderIndices = (config: SortConfig): SortConfig => {
  const positive = config.positive.map((item, index) => ({
    ...item,
    renderIndex: index + 1, // 1, 2, 3...
  }));
  const negative = config.negative.map((item, index) => ({
    ...item,
    renderIndex: -(index + 1), // -1, -2, -3...
  }));
  return { positive, negative };
};

