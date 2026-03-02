import { useState, useRef, useEffect } from 'react';
import {
  loadConfigFromStorage,
  saveConfigToStorage,
} from './utils/schema-config';
import {
  loadFormConfigFromStorage,
  saveFormConfigToStorage,
  type FormConfig,
} from './utils/form-config';
import { NetworkSwitchWrapper } from './NetworkSwitch';
import { registerWebComponents } from './registerWebComponents';
import { ConfigurationForm } from './ConfigurationForm';
import { InitializationSuccess } from './InitializationSuccess';
import { CustomJsonItem } from './CustomJsonItem';

// 注册 Web Components
registerWebComponents();

interface DemoPageProps {
  onInitialized?: () => void;
}

export const DemoPage = ({ onInitialized }: DemoPageProps) => {
  // 从 localStorage 加载表单配置
  const initialFormConfig = loadFormConfigFromStorage();

  const [token, setToken] = useState(initialFormConfig.token);
  const [chatType] = useState<'bot' | 'app'>(initialFormConfig.chatType);
  const [botId, setBotId] = useState(initialFormConfig.botId);
  const [appId, setAppId] = useState(initialFormConfig.appId);
  const [workflowId, setWorkflowId] = useState(initialFormConfig.workflowId);
  const [draftMode, setDraftMode] = useState<string>(
    initialFormConfig.draftMode,
  );
  const [apiUrl, setApiUrl] = useState<string>(initialFormConfig.apiUrl);
  const [logoUrl, setLogoUrl] = useState<string>(initialFormConfig.logoUrl);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingSdk, setIsLoadingSdk] = useState(false);
  const [connectNetwork, setConnectNetwork] = useState<number>(
    initialFormConfig.connectNetwork,
  );
  const connectNetworkRef = useRef<number>(initialFormConfig.connectNetwork);
  const clientRef = useRef<any>(null);
  const [schemaSortConfig, setSchemaSortConfig] = useState(() =>
    loadConfigFromStorage(),
  );

  // 当 Schema Version 配置改变时保存到 localStorage
  useEffect(() => {
    saveConfigToStorage(schemaSortConfig);
  }, [schemaSortConfig]);

  // 同步 connectNetworkRef
  useEffect(() => {
    connectNetworkRef.current = connectNetwork;
  }, [connectNetwork]);

  // 当表单配置改变时保存到 localStorage
  useEffect(() => {
    const formConfig: FormConfig = {
      token,
      chatType,
      botId,
      appId,
      workflowId,
      draftMode,
      connectNetwork,
      apiUrl,
      logoUrl,
    };
    saveFormConfigToStorage(formConfig);
  }, [
    token,
    chatType,
    botId,
    appId,
    workflowId,
    draftMode,
    connectNetwork,
    apiUrl,
    logoUrl,
  ]);

  const canInitialize =
    token.trim() !== '' &&
    (chatType === 'bot'
      ? botId.trim() !== ''
      : appId.trim() !== '' && workflowId.trim() !== '');

  const initializeClient = async () => {
    // 检查浏览器支持
    if (!window.customElements) {
      alert(
        '当前浏览器不支持 Web Components，请使用现代浏览器（Chrome 54+, Firefox 63+, Safari 10.1+）',
      );
      return;
    }

    // 验证输入
    if (!token.trim()) {
      setError('请输入访问令牌（Token）');
      return;
    }

    if (chatType === 'bot' && !botId.trim()) {
      setError('请输入 Bot ID');
      return;
    }

    if (chatType === 'app') {
      if (!appId.trim()) {
        setError('请输入 App ID');
        return;
      }
      if (!workflowId.trim()) {
        setError('请输入 Workflow ID');
        return;
      }
    }

    setError('');
    setIsLoadingSdk(true);
    console.log('🚀 Loading SDK and initializing WebChatClient...');

    try {
      // 动态导入 SDK
      await import('@glodon-aiot/chat-app-sdk');
      console.log('✅ SDK loaded successfully');

      // 从全局变量获取 WebChatClient（因为 ESM 导出有问题）
      const WebChatClient = (window as any).GlodonAIoT?.WebChatClient;
      if (!WebChatClient) {
        throw new Error('WebChatClient is not available. Please check if the SDK is loaded correctly.');
      }

      // 构建配置对象
      const config: any = {
        type: chatType === 'app' ? 'app' : undefined,
      };

      if (chatType === 'bot') {
        config.botId = botId.trim();
      } else {
        const draftModeValue =
          draftMode === 'true'
            ? true
            : draftMode === 'false'
              ? false
              : undefined;
        connectNetworkRef.current = connectNetwork;
        config.appInfo = {
          appId: appId.trim(),
          workflowId: workflowId.trim(),
          ...(draftModeValue !== undefined && { draft_mode: draftModeValue }),
          parameters: {
            SETTING: {
              ENABLE_NETWORK: connectNetwork,
            },
          },
        };
      }

      // 初始化 WebChatClient
      const client = new WebChatClient({
        env: 'test',
        apiUrl: apiUrl.trim(),
        config,
        auth: {
          type: 'token' as const,
          token: token.trim(),
          onRefreshToken: () => token.trim(),
        },
        extra: {
          webChat: {
            test: 'webcomponent-demo',
          },
        },
        ui: {
          base: {
            lang: 'zh-CN',
            layout: 'pc',
            zIndex: 1000,
            icon:
              logoUrl.trim() ||
              'https://minio-dev.glodon.com/opencoze/default_icon/default_agent_icon.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=IELEY0R9LRLA4IQI60T1%2F20251231%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251231T033702Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=8760f1429d02997191248194fd15228b61f91a1e6e71a12b2d2a2fd3d96c8eca',
          },
          asstBtn: {
            isNeed: true,
          },
          chatBot: {
            uploadable: true,
            isNeedClearContext: false,
            isNeedClearMessage: false,
            isNeedAddNewConversation: false,
            isNeedFunctionCallMessage: true,
            width: 1000,
          },
          showUserInfo: false,
          uiKitCustomWebComponents: {
            JsonItem: 'demo-json-item',
          },
          getMessageRenderIndex: CustomJsonItem.getJSONOutputMessageRenderIndex,
          header: {
            isShow: true,
            isNeedClose: true,
            isNeedLogo: true,
          },
          conversations: {
            isNeed: true,
          },
          input: {
            renderChatInputRightActions: () => {
              if (
                connectNetworkRef.current === null ||
                connectNetworkRef.current === undefined
              ) {
                connectNetworkRef.current = connectNetwork;
              }
              return (
                <NetworkSwitchWrapper
                  connectNetworkRef={connectNetworkRef}
                  setConnectNetwork={value => {
                    setConnectNetwork(value);
                    connectNetworkRef.current = value;
                  }}
                  clientRef={clientRef}
                  chatType={chatType}
                />
              );
            },
            inputMode: 'multi-line',
          },
          footer: {
            isShow: false,
          },
        },
      });

      clientRef.current = client;
      setIsInitialized(true);
      setIsLoadingSdk(false);
      console.log('✅ WebChatClient initialized with Web Components!');

      if (onInitialized) {
        onInitialized();
      }
    } catch (err) {
      console.error('❌ Initialization error:', err);
      setIsLoadingSdk(false);
      setError(
        `初始化失败: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  console.log('----------------DemoPage----------------');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* 左侧：配置表单 */}
        <div
          style={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <ConfigurationForm
            token={token}
            setToken={setToken}
            chatType={chatType}
            botId={botId}
            setBotId={setBotId}
            appId={appId}
            setAppId={setAppId}
            workflowId={workflowId}
            setWorkflowId={setWorkflowId}
            draftMode={draftMode}
            setDraftMode={setDraftMode}
            apiUrl={apiUrl}
            setApiUrl={setApiUrl}
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            schemaSortConfig={schemaSortConfig}
            setSchemaSortConfig={setSchemaSortConfig}
            error={error}
          />
        </div>

        {/* 右侧：预览区域 */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {!isInitialized ? (
            <div
              style={{
                padding: '60px 40px',
                textAlign: 'center',
                color: '#999',
                fontSize: '15px',
                background: '#fafafa',
                borderRadius: '8px',
                border: '1px dashed #e0e0e0',
                flex: 1,
                height: '100%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <p style={{ margin: 0 }}>
                请在左侧配置SDK参数并点击"初始化聊天客户端"按钮
              </p>
              {!canInitialize && (
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#ff9800',
                  }}
                >
                  请填写必填字段
                  {chatType === 'bot' ? '（Token、Bot ID）' : '（Token、App ID、Workflow ID）'}
                </p>
              )}
              <button
                onClick={initializeClient}
                disabled={isLoadingSdk || !canInitialize}
                style={{
                  padding: '14px 28px',
                  background:
                    isLoadingSdk || !canInitialize
                      ? '#ccc'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor:
                    isLoadingSdk || !canInitialize ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  opacity: isLoadingSdk || !canInitialize ? 0.7 : 1,
                }}
                onMouseOver={e => {
                  if (!isLoadingSdk && canInitialize) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 12px rgba(0,0,0,0.2)';
                  }
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isLoadingSdk ? '⏳ 正在加载 SDK...' : '🚀 初始化聊天客户端'}
              </button>
            </div>
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <InitializationSuccess />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
