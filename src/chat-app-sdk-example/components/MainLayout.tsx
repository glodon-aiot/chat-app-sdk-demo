import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const isDemoPage = (pathname: string) => pathname === '/demo';

const isTestEnv = (import.meta.env.BASE_URL ?? '').includes('/test/');

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [showGithubTooltip, setShowGithubTooltip] = useState(false);
  const [showCopilotTooltip, setShowCopilotTooltip] = useState(false);
  const [showNpmTooltip, setShowNpmTooltip] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDemo = isDemoPage(location.pathname);

  const tabs = [
    { key: 'intro', path: '/', label: '介绍', icon: '📋' },
    { key: 'quickstart', path: '/quickstart', label: '快速开始', icon: '🚀' },
    { key: 'demo', path: '/demo', label: 'Demo 演示', icon: '⚙️' },
    {
      key: 'webcomponents',
      path: '/webcomponents',
      label: 'Web Components',
      icon: '🧩',
    },
    { key: 'browser', path: '/browser', label: '浏览器兼容性', icon: '🌐' },
    { key: 'docs', path: '/docs', label: '配置文档', icon: '📖' },
    { key: 'api', path: '/api', label: 'API参考', icon: '<>' },
  ];

  const activeTab =
    tabs.find(tab => tab.path === location.pathname)?.key || 'intro';

  return (
    <div
      style={{
        height: '100vh',
        background: '#f5f5f5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          background: 'white',
          borderBottom: '1px solid #e0e0e0',
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}favicon.png`}
            alt="Logo"
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333',
              lineHeight: '1.4',
            }}
          >
            {isTestEnv ? '【测试环境】' : ''}@glodon-aiot/chat-app-sdk
          </h1>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Copilot链接 */}
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
            }}
            onMouseEnter={() => setShowCopilotTooltip(true)}
            onMouseLeave={() => setShowCopilotTooltip(false)}
          >
            <a
              href="https://copilot.glodon.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: showCopilotTooltip ? '#f0f0f0' : 'transparent',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
            >
              <img
                src="https://www.glodon.com/favicon.ico?v=1"
                alt="Copilot"
                style={{
                  width: '20px',
                  height: '20px',
                  filter: 'grayscale(100%)',
                  opacity: 0.7,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.opacity = '0.7';
                }}
              />
            </a>
            {showCopilotTooltip && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '8px',
                  padding: '6px 12px',
                  background: '#333',
                  color: 'white',
                  fontSize: '12px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  zIndex: 1000,
                  pointerEvents: 'none',
                }}
              >
                访问广联达行业AI平台
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderBottom: '4px solid #333',
                  }}
                />
              </div>
            )}
          </div>

          {/* npm链接 */}
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
            }}
            onMouseEnter={() => setShowNpmTooltip(true)}
            onMouseLeave={() => setShowNpmTooltip(false)}
          >
            <a
              href="https://www.npmjs.com/package/@glodon-aiot/chat-app-sdk"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: showNpmTooltip ? '#f0f0f0' : 'transparent',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
            >
              <img
                src="https://static-production.npmjs.com/b0f1a8318363185cc2ea6a40ac23eeb2.png"
                alt="npm"
                style={{
                  width: '20px',
                  height: '20px',
                  filter: 'grayscale(100%)',
                  opacity: 0.7,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.opacity = '0.7';
                }}
              />
            </a>
            {showNpmTooltip && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '8px',
                  padding: '6px 12px',
                  background: '#333',
                  color: 'white',
                  fontSize: '12px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  zIndex: 1000,
                  pointerEvents: 'none',
                }}
              >
                查看npm
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderBottom: '4px solid #333',
                  }}
                />
              </div>
            )}
          </div>

          {/* GitHub链接 */}
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
            }}
            onMouseEnter={() => setShowGithubTooltip(true)}
            onMouseLeave={() => setShowGithubTooltip(false)}
          >
            <a
              href="https://github.com/Aruna1990/glodon-aiot-examples"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: showGithubTooltip ? '#f0f0f0' : 'transparent',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="#666"
                style={{ display: 'inline-block' }}
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>
            {showGithubTooltip && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '8px',
                  padding: '6px 12px',
                  background: '#333',
                  color: 'white',
                  fontSize: '12px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  zIndex: 1000,
                  pointerEvents: 'none',
                }}
              >
                查看GitHub
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderBottom: '4px solid #333',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Left Sider - Fixed */}
      <div
        style={{
          position: 'fixed',
          top: '64px', // Header height (16px padding * 2 + ~32px content)
          left: 0,
          width: '240px',
          height: 'calc(100vh - 64px)',
          background: 'white',
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          zIndex: 10,
        }}
      >
        {/* Navigation Menu */}
        <nav
          style={{
            flex: 1,
            padding: '16px 0',
          }}
        >
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: activeTab === tab.key ? '#e6f7ff' : 'transparent',
                border: 'none',
                borderLeft:
                  activeTab === tab.key
                    ? '3px solid #1890ff'
                    : '3px solid transparent',
                color: activeTab === tab.key ? '#1890ff' : '#666',
                fontSize: '14px',
                fontWeight: activeTab === tab.key ? '600' : '400',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                transition: 'all 0.2s',
                marginLeft: activeTab === tab.key ? '0' : '3px',
              }}
              onMouseOver={e => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.background = '#f5f5f5';
                  e.currentTarget.style.color = '#1890ff';
                }
              }}
              onMouseOut={e => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#666';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: '240px',
          height: '100vh',
          overflow: isDemo ? 'hidden' : 'auto',
          background: 'white',
        }}
      >
        <div
          style={{
            padding: '16px',
            height: isDemo ? '100%' : 'auto',
            overflow: isDemo ? 'hidden' : 'visible',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
