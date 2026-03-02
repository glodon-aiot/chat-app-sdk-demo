// 表单配置类型定义和 localStorage 工具函数

export interface FormConfig {
  token: string;
  chatType: 'bot' | 'app';
  botId: string;
  appId: string;
  workflowId: string;
  draftMode: string;
  connectNetwork: number;
  apiUrl: string;
  logoUrl: string;
}

const FORM_STORAGE_KEY = 'webcomponent_demo_form_config';

const DEFAULT_FORM_CONFIG: FormConfig = {
  token: '',
  chatType: 'app',
  botId: '',
  appId: '',
  workflowId: '',
  draftMode: 'true',
  connectNetwork: 0,
  apiUrl: 'https://copilot.glodon.com/api/cvforce/flow',
  logoUrl:
    'https://cv-cdn.obs.cn-north-4.myhuaweicloud.com/glodon/images/chatlogo.png',
};

export const loadFormConfigFromStorage = (): FormConfig => {
  try {
    const stored = localStorage.getItem(FORM_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 验证数据结构并合并默认值
      return {
        ...DEFAULT_FORM_CONFIG,
        ...parsed,
        // 确保类型正确
        chatType: parsed.chatType === 'bot' ? 'bot' : 'app',
        connectNetwork:
          typeof parsed.connectNetwork === 'number' ? parsed.connectNetwork : 0,
        // 如果 draftMode 为空，使用默认值 'true'
        draftMode: parsed.draftMode || 'true',
        // 如果 apiUrl 为空，使用默认值
        apiUrl: parsed.apiUrl || DEFAULT_FORM_CONFIG.apiUrl,
        // 如果 logoUrl 为空，使用默认值
        logoUrl: parsed.logoUrl || DEFAULT_FORM_CONFIG.logoUrl,
      };
    }
  } catch (e) {
    console.error('Failed to load form config from localStorage:', e);
  }
  return DEFAULT_FORM_CONFIG;
};

export const saveFormConfigToStorage = (config: FormConfig): void => {
  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save form config to localStorage:', e);
  }
};

