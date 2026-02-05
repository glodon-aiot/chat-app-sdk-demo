import { SchemaVersionSortConfig } from './SchemaVersionSortConfig';
import type { SortConfig } from './utils/schema-config';
import { ExternalLink } from './ExternalLink';
import { Tooltip } from './Tooltip';

interface ConfigurationFormProps {
  token: string;
  setToken: (value: string) => void;
  chatType: 'bot' | 'app';
  botId: string;
  setBotId: (value: string) => void;
  appId: string;
  setAppId: (value: string) => void;
  workflowId: string;
  setWorkflowId: (value: string) => void;
  draftMode: string;
  setDraftMode: (value: string) => void;
  apiUrl: string;
  setApiUrl: (value: string) => void;
  logoUrl: string;
  setLogoUrl: (value: string) => void;
  schemaSortConfig: SortConfig;
  setSchemaSortConfig: (config: SortConfig) => void;
  error: string;
}

export const ConfigurationForm = ({
  token,
  setToken,
  chatType,
  botId,
  setBotId,
  appId,
  setAppId,
  workflowId,
  setWorkflowId,
  draftMode,
  setDraftMode,
  apiUrl,
  setApiUrl,
  logoUrl,
  setLogoUrl,
  schemaSortConfig,
  setSchemaSortConfig,
  error,
}: ConfigurationFormProps) => {
  // 从 apiUrl 提取 host
  const getHostFromApiUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.origin;
    } catch {
      return 'https://aiot-dev.glodon.com';
    }
  };

  const apiHost = getHostFromApiUrl(apiUrl);
  return (
    <div>
      <h2 style={{ margin: '0 0 20px 0', color: '#667eea' }}>🔧 配置信息</h2>

      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor="apiurl-input"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          <span>API 根路径</span>
          <Tooltip
            position="right"
            content={
              <div>
                <strong>使用说明：</strong>
                SDK 的 API 根路径，用于连接后端服务。
              </div>
            }
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#f0f0f0',
                color: '#666',
                cursor: 'help',
                fontSize: '12px',
                fontWeight: 'normal',
              }}
            >
              ?
            </span>
          </Tooltip>
        </label>
        <input
          id="apiurl-input"
          type="text"
          value={apiUrl}
          onChange={e => setApiUrl(e.target.value)}
          placeholder="https://copilot.glodon.com/api/cvforce/flow"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor="token-input"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          <span>
            Token<span style={{ color: 'red' }}>*</span>
          </span>
          <Tooltip
            position="right"
            content={
              <div>
                <strong>使用说明：</strong>从环境变量 CHAT_APP_COZE_TOKEN
                读取，或手动输入。访问令牌用于身份验证，请妥善保管。
              </div>
            }
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#f0f0f0',
                color: '#666',
                cursor: 'help',
                fontSize: '12px',
                fontWeight: 'normal',
              }}
            >
              ?
            </span>
          </Tooltip>
        </label>
        <input
          id="token-input"
          type="text"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="请输入您的访问令牌"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {chatType === 'bot' && (
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="botid-input"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            <span>
              Bot ID<span style={{ color: 'red' }}>*</span>
            </span>
            <Tooltip
              position="right"
              content={
                <div>
                  <strong>使用说明：</strong>Bot 模式需要输入 Bot ID。从环境变量
                  CHAT_APP_INDEX_COZE_BOT_ID 读取，或手动输入。Bot
                  模式适用于简单的对话场景。
                </div>
              }
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#f0f0f0',
                  color: '#666',
                  cursor: 'help',
                  fontSize: '12px',
                  fontWeight: 'normal',
                }}
              >
                ?
              </span>
            </Tooltip>
          </label>
          <input
            id="botid-input"
            type="text"
            value={botId}
            onChange={e => setBotId(e.target.value)}
            placeholder="请输入 Bot ID"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {chatType === 'app' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <label
                htmlFor="appid-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: 0,
                }}
              >
                <span>
                  App ID<span style={{ color: 'red' }}>*</span>
                </span>
                <Tooltip
                  position="right"
                  content={
                    <div>
                      <strong>使用说明：</strong>App 模式（推荐）需要输入 App ID
                      和 Workflow ID。App
                      模式支持更复杂的工作流和功能配置。从环境变量
                      CHAT_APP_CHATFLOW_COZE_APP_ID 读取。
                    </div>
                  }
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#f0f0f0',
                      color: '#666',
                      cursor: 'help',
                      fontSize: '12px',
                      fontWeight: 'normal',
                    }}
                  >
                    ?
                  </span>
                </Tooltip>
              </label>
              {appId.trim() && (
                <ExternalLink
                  href={`${apiHost}/portal/gldcv/cvforcepd/fe/#/space/1758636595/project-ide/${appId.trim()}`}
                  title="在系统中打开 App"
                />
              )}
            </div>
            <input
              id="appid-input"
              type="text"
              value={appId}
              onChange={e => setAppId(e.target.value)}
              placeholder="请输入 App ID"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <label
                htmlFor="workflowid-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: 0,
                }}
              >
                <span>
                  Workflow ID<span style={{ color: 'red' }}>*</span>
                </span>
                <Tooltip
                  position="right"
                  content={
                    <div>
                      <strong>使用说明：</strong>Workflow ID
                      指定要使用的具体工作流。从环境变量
                      CHAT_APP_CHATFLOW_COZE_WORKFLOW_ID 读取。
                    </div>
                  }
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#f0f0f0',
                      color: '#666',
                      cursor: 'help',
                      fontSize: '12px',
                      fontWeight: 'normal',
                    }}
                  >
                    ?
                  </span>
                </Tooltip>
              </label>
              {appId.trim() && workflowId.trim() && (
                <ExternalLink
                  href={`${apiHost}/portal/gldcv/cvforcepd/fe/#/space/1758636595/project-ide/${appId.trim()}/workflow/${workflowId.trim()}`}
                  title="在系统中打开 Workflow"
                />
              )}
            </div>
            <input
              id="workflowid-input"
              type="text"
              value={workflowId}
              onChange={e => setWorkflowId(e.target.value)}
              placeholder="请输入 Workflow ID"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              <span>草稿模式</span>
              <Tooltip
                position="right"
                content={
                  <div>
                    <strong>使用说明：</strong>
                    可选配置。开启=草稿模式（用于测试），关闭=发布模式（生产环境）。默认值为草稿模式（开启）。从环境变量
                    CHAT_APP_DRAFT_MODE 读取。
                  </div>
                }
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#f0f0f0',
                    color: '#666',
                    cursor: 'help',
                    fontSize: '12px',
                    fontWeight: 'normal',
                  }}
                >
                  ?
                </span>
              </Tooltip>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <label
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '26px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={draftMode === 'true'}
                  onChange={e => {
                    setDraftMode(e.target.checked ? 'true' : 'false');
                  }}
                  style={{
                    opacity: 0,
                    width: 0,
                    height: 0,
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: draftMode === 'true' ? '#667eea' : '#ccc',
                    borderRadius: '26px',
                    transition: 'background-color 0.3s',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      content: '""',
                      height: '20px',
                      width: '20px',
                      left: '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: 'transform 0.3s',
                      transform:
                        draftMode === 'true'
                          ? 'translateX(24px)'
                          : 'translateX(0)',
                    }}
                  />
                </span>
              </label>
              <span style={{ color: '#666', fontSize: '14px' }}>
                {draftMode === 'true' ? '草稿模式' : '发布模式'}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Logo URL 配置 */}
      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor="logourl-input"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          <span>Logo URL</span>
          <Tooltip
            position="right"
            content={
              <div>
                <strong>使用说明：</strong>
                设置 SDK 聊天窗口的 Logo 图标地址。支持图片 URL 链接。
              </div>
            }
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#f0f0f0',
                color: '#666',
                cursor: 'help',
                fontSize: '12px',
                fontWeight: 'normal',
              }}
            >
              ?
            </span>
          </Tooltip>
        </label>
        <input
          id="logourl-input"
          type="text"
          value={logoUrl}
          onChange={e => setLogoUrl(e.target.value)}
          placeholder="https://minio-dev.glodon.com/opencoze/default_icon/default_agent_icon.png"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
            boxSizing: 'border-box',
          }}
        />
        {logoUrl && (
          <div style={{ marginTop: '8px' }}>
            <img
              src={logoUrl}
              alt="Logo preview"
              style={{
                maxWidth: '100px',
                maxHeight: '100px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '4px',
                background: '#f9f9f9',
              }}
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* JSON 输出排序配置 */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <label
            style={{
              fontWeight: 'bold',
              color: '#333',
              margin: 0,
            }}
          >
            JSON 输出排序配置
          </label>
          <Tooltip
            position="right"
            content={
              <div>
                <strong>JSON 输出根据Schema Version 排序：</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  <li>通过拖拽调整不同数据定义版本的渲染顺序</li>
                  <li>正数区域：正常顺序渲染（renderIndex: 1, 2, 3...）</li>
                  <li>
                    负数区域：延迟渲染，在 chat complete 后渲染（renderIndex:
                    -1, -2, -3...）
                  </li>
                  <li>可以添加自定义数据定义版本，默认项不能删除</li>
                  <li>配置会自动保存到 localStorage</li>
                </ul>
              </div>
            }
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#f0f0f0',
                color: '#666',
                cursor: 'help',
                fontSize: '12px',
                fontWeight: 'normal',
              }}
            >
              ?
            </span>
          </Tooltip>
        </div>
        <SchemaVersionSortConfig
          config={schemaSortConfig}
          onChange={setSchemaSortConfig}
        />
      </div>

      {error ? (
        <div
          style={{
            padding: '12px',
            background: '#ffe6e6',
            border: '1px solid #ff4d4f',
            borderRadius: '6px',
            color: '#d32f2f',
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          ⚠️ {error}
        </div>
      ) : null}
    </div>
  );
};
