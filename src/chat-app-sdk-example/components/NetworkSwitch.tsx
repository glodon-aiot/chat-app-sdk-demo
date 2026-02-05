import React from 'react';
import { createPortal } from 'react-dom';
import { AutoIcon, EnableIcon, DisableIcon } from './icons/NetworkIcons';

// 联网搜索模式类型
// 0: 不联网；1: 自动联网；2: 必须联网
export type NetworkSearchMode = 0 | 1 | 2;

// 将 number 转换为 NetworkSearchMode
// 0: 不联网；1: 自动联网；2: 必须联网
export const numberToMode = (value: number): NetworkSearchMode => {
  if (value === 1) {
    return 1;
  } // 自动联网
  if (value === 2) {
    return 2;
  } // 必须联网
  return 0; // 默认不联网
};

export const modeToNumber = (mode: NetworkSearchMode): number => mode;

// 联网搜索下拉菜单组件 - 使用类组件避免 hooks 错误
class NetworkSwitchClass extends React.Component<
  {
    mode: NetworkSearchMode;
    onChange: (mode: NetworkSearchMode) => void;
  },
  {
    isOpen: boolean;
    dropdownPosition: { top: number; left: number } | null;
    currentMode: NetworkSearchMode; // 添加内部 state 来立即反映变化
  }
> {
  private buttonRef: React.RefObject<HTMLButtonElement>;
  private containerRef: React.RefObject<HTMLDivElement>;
  private clickOutsideHandler: ((event: MouseEvent) => void) | null = null;

  constructor(props: {
    mode: NetworkSearchMode;
    onChange: (mode: NetworkSearchMode) => void;
  }) {
    super(props);
    this.state = {
      isOpen: false,
      dropdownPosition: null,
      currentMode: props.mode, // 初始化时使用 prop 的值
    };
    this.buttonRef = React.createRef();
    this.containerRef = React.createRef();
  }

  componentDidUpdate(
    prevProps: { mode: NetworkSearchMode },
    prevState: { isOpen: boolean; currentMode: NetworkSearchMode },
  ) {
    // 当 prop 变化时同步到内部 state
    if (prevProps.mode !== this.props.mode) {
      this.setState({ currentMode: this.props.mode });
    }
    // 计算下拉菜单位置（向上弹出）
    if (this.state.isOpen && !prevState.isOpen && this.buttonRef.current) {
      const rect = this.buttonRef.current.getBoundingClientRect();
      this.setState({
        dropdownPosition: {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
        },
      });
    }

    // 点击外部关闭下拉菜单
    if (this.state.isOpen && !prevState.isOpen) {
      this.clickOutsideHandler = (event: MouseEvent) => {
        if (
          this.containerRef.current &&
          !this.containerRef.current.contains(event.target as Node) &&
          !(event.target as Element)?.closest('[data-network-dropdown]')
        ) {
          this.setState({ isOpen: false });
        }
      };
      document.addEventListener('mousedown', this.clickOutsideHandler);
    } else if (
      !this.state.isOpen &&
      prevState.isOpen &&
      this.clickOutsideHandler
    ) {
      document.removeEventListener('mousedown', this.clickOutsideHandler);
      this.clickOutsideHandler = null;
    }
  }

  componentWillUnmount() {
    if (this.clickOutsideHandler) {
      document.removeEventListener('mousedown', this.clickOutsideHandler);
    }
  }

  getModeText = (m: NetworkSearchMode) => {
    switch (m) {
      case 0:
        return '关闭联网搜索';
      case 1:
        return '自动联网搜索';
      case 2:
        return '必须联网搜索';
      default:
        return '联网搜索';
    }
  };

  getModeIcon = (m: NetworkSearchMode) => {
    const iconStyle = { width: '16px', height: '16px', flexShrink: 0 };
    switch (m) {
      case 0:
        return React.createElement(DisableIcon, { style: iconStyle });
      case 1:
        return React.createElement(AutoIcon, { style: iconStyle });
      case 2:
        return React.createElement(EnableIcon, { style: iconStyle });
      default:
        return React.createElement(DisableIcon, { style: iconStyle });
    }
  };

  render() {
    const { onChange } = this.props;
    const { isOpen, dropdownPosition, currentMode } = this.state;
    // 使用内部 state 来显示当前模式，这样当用户选择新选项时可以立即更新
    const mode = currentMode;

    const options: Array<{ value: NetworkSearchMode; label: string }> = [
      { value: 0, label: '关闭联网搜索' },
      { value: 1, label: '自动联网搜索' },
      { value: 2, label: '必须联网搜索' },
    ];

    const dropdownContent =
      isOpen && dropdownPosition
        ? createPortal(
            React.createElement(
              'div',
              {
                'data-network-dropdown': true,
                ref: this.containerRef,
                style: {
                  position: 'absolute',
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  padding: '4px',
                  minWidth: '160px',
                  zIndex: 10000,
                  transform: 'translateY(calc(-100% - 4px))',
                },
              },
              options.map(option => {
                const isSelected = mode === option.value;
                return React.createElement(
                  'div',
                  {
                    key: option.value,
                    onClick: () => {
                      // 立即更新内部 state，使 UI 立即反映变化
                      this.setState({
                        currentMode: option.value,
                        isOpen: false
                      });
                      // 然后调用 onChange 更新外部 state
                      onChange(option.value);
                    },
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: '#333',
                      backgroundColor: isSelected
                        ? 'rgba(102, 126, 234, 0.1)'
                        : 'transparent',
                      transition: 'background-color 0.2s',
                    },
                    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor =
                          'rgba(0, 0, 0, 0.05)';
                      }
                    },
                    onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    },
                  },
                  this.getModeIcon(option.value),
                  React.createElement('span', null, option.label),
                );
              }),
            ),
            document.body,
          )
        : null;

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'div',
        {
          style: {
            position: 'relative',
            display: 'inline-block',
          },
        },
        React.createElement(
          'button',
          {
            ref: this.buttonRef,
            type: 'button',
            onClick: () => this.setState({ isOpen: !isOpen }),
            title: this.getModeText(mode),
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '4px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: '#333',
              transition: 'background-color 0.2s',
              width: '24px',
              height: '24px',
            },
            onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            },
            onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            },
          },
          this.getModeIcon(mode),
        ),
      ),
      dropdownContent,
    );
  }
}

// 联网搜索下拉菜单组件 - 包装类组件为函数组件
export const NetworkSwitch = ({
  mode,
  onChange,
}: {
  mode: NetworkSearchMode;
  onChange: (mode: NetworkSearchMode) => void;
}) => {
  // 使用 React.createElement 确保使用正确的 React 实例
  return React.createElement(NetworkSwitchClass, { mode, onChange });
};

// 联网开关包装组件，用于在闭包中访问最新的 state
// 不使用 hooks，直接使用 ref 的值，避免在不同 React 上下文中的 hooks 错误
export const NetworkSwitchWrapper = ({
  connectNetworkRef,
  setConnectNetwork,
  clientRef,
  chatType,
}: {
  connectNetworkRef: React.MutableRefObject<number>;
  setConnectNetwork: (value: number) => void;
  clientRef: React.MutableRefObject<any>; // 使用 any 因为动态导入
  chatType: 'bot' | 'app';
}) => {
  // 直接从 ref 读取当前值，不使用 state
  const currentMode = numberToMode(connectNetworkRef.current);

  const handleChange = (newMode: NetworkSearchMode) => {
    console.log('NetworkSwitchWrapper onChange:', newMode);
    // 更新外部 state 和 ref
    const newValue = modeToNumber(newMode);
    setConnectNetwork(newValue);
    connectNetworkRef.current = newValue;

    // 更新客户端配置中的参数 - 这是关键！
    // 直接修改对象属性，保持引用不变，这样 non-iframe-app 能立即获取到最新值
    if (clientRef.current && chatType === 'app') {
      const currentConfig = clientRef.current.options?.config;
      if (currentConfig?.appInfo) {
        // 确保 parameters 对象存在
        if (!currentConfig.appInfo.parameters) {
          currentConfig.appInfo.parameters = {};
        }
        // 确保 SETTING 对象存在
        if (!currentConfig.appInfo.parameters.SETTING) {
          currentConfig.appInfo.parameters.SETTING = {};
        }
        // 直接修改对象属性，保持引用不变
        // 这样 non-iframe-app 中的 parameters 引用会立即反映变化
        // 0: 不联网；1: 自动联网；2: 必须联网
        (
          currentConfig.appInfo.parameters.SETTING as Record<string, unknown>
        ).ENABLE_NETWORK = newValue;

        console.log(
          '✅ 联网搜索模式已更新:',
          newMode,
          '参数: SETTING.ENABLE_NETWORK =',
          newValue,
          '(0: 不联网；1: 自动联网；2: 必须联网)',
          '完整 parameters:',
          JSON.stringify(currentConfig.appInfo.parameters, null, 2),
        );
      }
    }
  };

  // 使用 React.createElement 确保使用正确的 React 实例
  return React.createElement(NetworkSwitch, {
    mode: currentMode,
    onChange: handleChange,
  });
};

