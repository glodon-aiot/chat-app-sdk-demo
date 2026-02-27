/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

interface WebSearchItem {
  title?: string;
  snippet?: string;
  link?: string;
  datePublished?: string;
  icon?: string;
  site_name?: string;
}

interface KnowledgeReferenceItem {
  output?: string;
  fileName?: string;
  knowledgeName?: string;
  fileUrl?: string;
}

interface MergedReferenceData {
  knowledgeReferences?: KnowledgeReferenceItem[];
  webSearch?: WebSearchItem[];
}

interface WindowWithMarked extends Window {
  marked?: {
    parse: (
      text: string,
      options?: { breaks?: boolean; gfm?: boolean },
    ) => string;
  };
}

/**
 * MergedReferenceList Web Component
 *
 * 独立的合并参考来源列表组件，用于展示 app.reference.merged_result.v1 格式的合并参考结果
 *
 * 数据格式：
 * {
 *   knowledgeReferences: [
 *     {
 *       output: string,        // 文档内容/摘要（支持 Markdown）
 *       fileName: string,       // 文件名
 *       knowledgeName: string, // 知识库名称
 *       fileUrl: string        // 文件链接
 *     }
 *   ],
 *   webSearch: [
 *     {
 *       title: string,         // 标题
 *       snippet: string,       // 摘要/简介
 *       link: string,          // 链接
 *       datePublished: string, // 发布日期
 *       icon?: string          // 网站图标（可选）
 *       site_name?: string    // 网站名称（可选）
 *     }
 *   ]
 * }
 *
 * 使用方式：
 * const mergedList = document.createElement('merged-reference-list');
 * mergedList.setData({ knowledgeReferences: [...], webSearch: [...] });
 * document.body.appendChild(mergedList);
 */
export class MergedReferenceList extends HTMLElement {
  private data?: MergedReferenceData;
  private drawerElement: HTMLElement | null = null;
  private maskElement: HTMLElement | null = null;
  private styleElement: HTMLStyleElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    console.log('[MergedReferenceList] connected');
    this.loadMarkedIfNeeded();
    this.createDrawer();
    this.render();
  }

  disconnectedCallback() {
    console.log('[MergedReferenceList] disconnected');
    this.removeDrawer();
  }

  /**
   * 创建抽屉元素并添加到 body
   */
  private createDrawer() {
    // 创建样式元素
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'merged-reference-list-drawer-styles';
      document.head.appendChild(this.styleElement);
    }

    // 创建遮罩层
    if (!this.maskElement) {
      this.maskElement = document.createElement('div');
      this.maskElement.className = 'merged-reference-list-drawer-mask';
      this.maskElement.setAttribute(
        'data-component-id',
        this.getAttribute('data-id') || '',
      );
      document.body.appendChild(this.maskElement);
    }

    // 创建抽屉元素
    if (!this.drawerElement) {
      this.drawerElement = document.createElement('div');
      this.drawerElement.className = 'merged-reference-list-drawer';
      this.drawerElement.setAttribute(
        'data-component-id',
        this.getAttribute('data-id') || '',
      );
      document.body.appendChild(this.drawerElement);
    }
  }

  /**
   * 移除抽屉元素
   */
  private removeDrawer() {
    if (this.drawerElement && this.drawerElement.parentNode) {
      this.drawerElement.parentNode.removeChild(this.drawerElement);
      this.drawerElement = null;
    }
    if (this.maskElement && this.maskElement.parentNode) {
      this.maskElement.parentNode.removeChild(this.maskElement);
      this.maskElement = null;
    }
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }

  /**
   * 设置合并参考数据
   * @param data 合并参考数据对象
   */
  setData(data: MergedReferenceData): void {
    this.data = data;
    this.render();
  }

  /**
   * 动态加载 marked.js 库
   */
  private loadMarkedIfNeeded(): void {
    const win = window as WindowWithMarked;
    if (typeof win.marked !== 'undefined') {
      return; // 已经加载
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    script.onload = (): void => {
      console.log('[MergedReferenceList] marked.js loaded');
      this.render(); // 重新渲染以应用 Markdown
    };
    document.head.appendChild(script);
  }

  /**
   * Markdown 渲染函数
   * @param text Markdown 文本
   * @returns 渲染后的 HTML 字符串
   */
  private renderMarkdown(text: string): string {
    if (!text) {
      return '';
    }

    const win = window as WindowWithMarked;
    const { marked } = win;
    if (typeof marked !== 'undefined' && marked.parse) {
      try {
        return marked.parse(text, { breaks: true, gfm: true });
      } catch (error) {
        console.error('Markdown parse error:', error);
        return this.escapeHtml(text).replace(/\n/g, '<br>');
      }
    }
    // Fallback: 简单的文本处理
    return this.escapeHtml(text).replace(/\n/g, '<br>');
  }

  /**
   * HTML 转义，防止 XSS
   * @param text 需要转义的文本
   * @returns 转义后的文本
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 获取网站图标 URL
   * @param link 网站链接
   * @param providedIcon 提供的图标 URL（可选）
   * @returns 图标 URL
   */
  private getFaviconUrl(link: string, providedIcon?: string): string {
    if (providedIcon) {
      return providedIcon;
    }

    try {
      const urlObj = new URL(link);
      return `${urlObj.origin}/favicon.ico`;
    } catch (error) {
      console.warn('[MergedReferenceList] Failed to parse URL:', error);
      return '';
    }
  }

  /**
   * 从 URL 提取网站名称（域名）
   * @param link 网站链接
   * @param siteName 提供的网站名称（可选）
   * @returns 网站名称
   */
  private getSiteName(link: string, siteName?: string): string {
    if (siteName) {
      return siteName;
    }

    if (!link) {
      return '';
    }

    try {
      const urlObj = new URL(link);
      // 移除 www. 前缀
      let hostname = urlObj.hostname.replace(/^www\./i, '');
      return hostname;
    } catch (error) {
      console.warn(
        '[MergedReferenceList] Failed to parse URL for site name:',
        error,
      );
      return link;
    }
  }

  /**
   * 根据文件 URL 获取文档类型图标
   * @param fileUrl 文件 URL
   * @returns 文档类型图标的 SVG 字符串
   */
  private getDocumentIcon(fileUrl?: string): string {
    // 从 fileUrl 中提取文件扩展名
    let ext = '';
    if (fileUrl) {
      try {
        // 尝试解析 URL
        const url = new URL(fileUrl);
        const pathname = url.pathname;
        const lastDotIndex = pathname.lastIndexOf('.');
        if (lastDotIndex !== -1 && lastDotIndex < pathname.length - 1) {
          ext = pathname.substring(lastDotIndex + 1).toLowerCase();
          // 移除可能的查询参数
          ext = ext.split('?')[0].split('#')[0];
        }
      } catch (e) {
        // 如果不是有效的 URL，尝试直接解析路径
        const lastDotIndex = fileUrl.lastIndexOf('.');
        if (lastDotIndex !== -1 && lastDotIndex < fileUrl.length - 1) {
          ext = fileUrl.substring(lastDotIndex + 1).toLowerCase();
          // 移除可能的查询参数
          ext = ext.split('?')[0].split('#')[0];
        }
      }
    }
    const extUpper = ext.toUpperCase();

    // 根据扩展名确定背景颜色
    let iconColor = '#FF4D4F'; // 默认红色
    let textColor = 'white'; // 默认白色文字

    if (ext === 'pdf') {
      iconColor = '#FF4D4F'; // 红色
    } else if (ext === 'doc' || ext === 'docx') {
      iconColor = '#2B579A'; // Word 蓝色
    } else if (ext === 'xls' || ext === 'xlsx') {
      iconColor = '#217346'; // Excel 绿色
    } else if (ext === 'ppt' || ext === 'pptx') {
      iconColor = '#D04423'; // PowerPoint 橙色
    } else if (ext === 'txt') {
      iconColor = '#666666'; // 灰色
    } else if (ext === 'xml') {
      iconColor = '#FF6600'; // 橙色
    } else if (ext === 'json') {
      iconColor = '#F7DF1E'; // JSON 黄色
      textColor = '#000'; // 黑色文字
    } else if (ext === 'js' || ext === 'jsx') {
      iconColor = '#F7DF1E'; // JavaScript 黄色
      textColor = '#000'; // 黑色文字
    } else if (
      ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'].includes(ext)
    ) {
      iconColor = '#4CAF50'; // 图片绿色
    }

    // 显示文件扩展名（最多3个字符，如果超过则截断）
    const displayText = extUpper.slice(0, 3);

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="none">
        <path d="M3 2C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V5.41421C14 5.149 13.8946 4.89464 13.7071 4.70711L11.2929 2.29289C11.1054 2.10536 10.851 2 10.5858 2H3Z" fill="${iconColor}" stroke="${iconColor}" stroke-width="0.5"/>
        <path d="M11 2V5H14" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="8" y="10.5" font-family="Arial, sans-serif" font-size="5.5" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${displayText || 'DOC'}</text>
      </svg>
    `;
  }

  /**
   * 打开抽屉
   */
  private openDrawer() {
    if (this.drawerElement) {
      this.drawerElement.classList.add('drawer-open');
    }
    if (this.maskElement) {
      this.maskElement.classList.add('mask-visible');
    }
  }

  /**
   * 关闭抽屉
   */
  private closeDrawer() {
    if (this.drawerElement) {
      this.drawerElement.classList.remove('drawer-open');
    }
    if (this.maskElement) {
      this.maskElement.classList.remove('mask-visible');
    }
  }

  /**
   * 渲染组件
   */
  render(): void {
    if (!this.shadowRoot) {
      return;
    }

    const data = this.data || { knowledgeReferences: [], webSearch: [] };
    const knowledgeReferences = data.knowledgeReferences || [];
    const webSearch = data.webSearch || [];
    const totalCount = knowledgeReferences.length + webSearch.length;

    if (!totalCount) {
      return;
    }

    // 链接图标 SVG（紫色）
    const linkIconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M7.05 9.35C6.9 9.35 6.8 9.3 6.7 9.2C6.1 8.6 5.75 7.8 5.75 6.95C5.75 6.1 6.1 5.3 6.7 4.7L9.55 1.85C10.15 1.25 10.95 0.9 11.8 0.9C12.65 0.9 13.45 1.25 14.05 1.85C15.3 3.1 15.3 5.1 14.05 6.35L12.75 7.65C12.55 7.85 12.25 7.85 12.05 7.65C11.85 7.45 11.85 7.15 12.05 6.95L13.35 5.65C14.2 4.8 14.2 3.4 13.35 2.55C12.95 2.15 12.4 1.9 11.8 1.9C11.2 1.9 10.65 2.15 10.25 2.55L7.4 5.4C7 5.8 6.75 6.35 6.75 6.95C6.75 7.55 7 8.1 7.4 8.5C7.6 8.7 7.6 9 7.4 9.2C7.3 9.3 7.2 9.35 7.05 9.35Z" fill="#B752EA"/>
        <path d="M4.2 14.9C3.4 14.9 2.55 14.6 1.95 13.95C1.35 13.35 1 12.55 1 11.7C1 10.85 1.35 10.05 1.95 9.45L3.25 8.15C3.45 7.95 3.75 7.95 3.95 8.15C4.15 8.35 4.15 8.65 3.95 8.85L2.65 10.15C2.25 10.55 2 11.1 2 11.7C2 12.3 2.25 12.85 2.65 13.25C3.5 14.1 4.9 14.1 5.75 13.25L8.6 10.4C9 10 9.25 9.45 9.25 8.85C9.25 8.25 9 7.7 8.6 7.3C8.4 7.1 8.4 6.8 8.6 6.6C8.8 6.4 9.1 6.4 9.3 6.6C9.9 7.2 10.25 8 10.25 8.85C10.25 9.7 9.9 10.5 9.3 11.1L6.45 13.95C5.85 14.55 5 14.9 4.2 14.9Z" fill="#B752EA"/>
      </svg>
    `;

    // 渲染按钮到 shadow DOM
    this.shadowRoot.innerHTML = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .reference-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: transparent;
          border: none;
          cursor: pointer;
          user-select: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .link-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .button-text {
          font-size: 14px;
          color: #B752EA;
          font-weight: 400;
        }
      </style>
      <div class="reference-button" id="reference-button">
        <div class="link-icon">${linkIconSvg}</div>
        <span class="button-text">共${totalCount}个参考来源</span>
      </div>
    `;

    // 渲染抽屉样式到 document.head
    if (this.styleElement) {
      this.styleElement.textContent = `
        .merged-reference-list-drawer-mask {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 2147483646;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .merged-reference-list-drawer-mask.mask-visible {
          opacity: 1;
          visibility: visible;
        }
        .merged-reference-list-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 480px;
          max-width: 90vw;
          background: #ffffff;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
          z-index: 2147483647;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .merged-reference-list-drawer.drawer-open {
          transform: translateX(0);
        }
        .merged-reference-list-drawer .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
          flex-shrink: 0;
          background: #ffffff;
        }
        .merged-reference-list-drawer .drawer-title {
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }
        .merged-reference-list-drawer .drawer-close {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
          color: #999;
          font-size: 20px;
          line-height: 1;
          border: none;
          background: transparent;
          padding: 0;
        }
        .merged-reference-list-drawer .drawer-close:hover {
          background-color: #f5f5f5;
          color: #666;
        }
        .merged-reference-list-drawer .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }
        .merged-reference-list-drawer .section {
          padding: 0 16px;
        }
        .merged-reference-list-drawer .section-title {
          font-size: 14px;
          font-weight: 500;
          color: #666;
          padding: 16px 4px 12px 4px;
          margin: 0;
        }
        .merged-reference-list-drawer .divider {
          height: 1px;
          background: #f0f0f0;
          margin: 0 16px;
        }
        .merged-reference-list-drawer .result-item {
          padding: 16px 0 0 0;
          transition: background-color 0.2s;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .merged-reference-list-drawer .result-item:last-child {
          padding-bottom: 16px;
        }
        .merged-reference-list-drawer .result-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          margin-top: 2px;
          border-radius: 2px;
          object-fit: contain;
        }
        .merged-reference-list-drawer .result-icon-placeholder {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          margin-top: 2px;
          background: #e8e8e8;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #999;
        }
        .merged-reference-list-drawer .result-icon-circle {
          width: 8px;
          height: 8px;
          flex-shrink: 0;
          margin-top: 6px;
          border-radius: 50%;
          background: #8B4513;
        }
        .merged-reference-list-drawer .result-icon-document {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .merged-reference-list-drawer .result-content {
          flex: 1;
          min-width: 0;
        }
        .merged-reference-list-drawer .result-header {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 6px;
        }
        .merged-reference-list-drawer .result-index {
          font-weight: 600;
          color: #666;
          flex-shrink: 0;
        }
        .merged-reference-list-drawer .result-title {
          font-size: 15px;
          font-weight: 500;
          color: #333;
          line-height: 1.4;
          flex: 1;
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .merged-reference-list-drawer .result-title-link {
          color: #1890ff;
        }
        .merged-reference-list-drawer .result-title-link:hover {
          text-decoration: underline;
        }
        .merged-reference-list-drawer .result-date {
          font-size: 12px;
          color: #999;
          flex-shrink: 0;
        }
        .merged-reference-list-drawer .result-snippet {
          font-size: 13px;
          color: #666;
          line-height: 1.6;
          word-break: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .merged-reference-list-drawer .result-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          line-height: 1.5;
          color: #B752EA;
          text-decoration: none;
          margin-top: 4px;
          width: fit-content;
        }
        .merged-reference-list-drawer .result-link:hover {
          text-decoration: underline;
        }
        .merged-reference-list-drawer .result-link-icon {
          width: 12px;
          height: 12px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .merged-reference-list-drawer .result-link span {
          line-height: 1.5;
        }
        .merged-reference-list-drawer .knowledge-header {
          font-size: 13px;
          font-weight: 500;
          color: #333;
          margin-bottom: 8px;
        }
        .merged-reference-list-drawer .knowledge-output {
          font-size: 13px;
          color: #666;
          line-height: 1.6;
          word-break: break-word;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .merged-reference-list-drawer .knowledge-output > *:first-child {
          margin-top: 0;
        }
        .merged-reference-list-drawer .knowledge-output h1,
        .merged-reference-list-drawer .knowledge-output h2,
        .merged-reference-list-drawer .knowledge-output h3,
        .merged-reference-list-drawer .knowledge-output h4,
        .merged-reference-list-drawer .knowledge-output h5,
        .merged-reference-list-drawer .knowledge-output h6 {
          margin: 0.8em 0 0.4em 0;
          font-weight: 600;
          line-height: 1.4;
          color: #333;
        }
        .merged-reference-list-drawer .knowledge-output h1:first-child,
        .merged-reference-list-drawer .knowledge-output h2:first-child,
        .merged-reference-list-drawer .knowledge-output h3:first-child,
        .merged-reference-list-drawer .knowledge-output h4:first-child,
        .merged-reference-list-drawer .knowledge-output h5:first-child,
        .merged-reference-list-drawer .knowledge-output h6:first-child {
          margin-top: 0;
        }
        .merged-reference-list-drawer .knowledge-output p {
          margin: 0.6em 0;
          line-height: 1.7;
        }
        .merged-reference-list-drawer .knowledge-output p:first-child {
          margin-top: 0;
        }
        .merged-reference-list-drawer .knowledge-output code {
          background: #f0f0f0;
          color: #e83e8c;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', 'Consolas', monospace;
          font-size: 0.9em;
        }
        .merged-reference-list-drawer .knowledge-output pre {
          background: #f6f8fa;
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 0.8em 0;
          border: 1px solid #e1e4e8;
        }
        .merged-reference-list-drawer .knowledge-output pre code {
          background: none;
          color: #333;
          padding: 0;
          border-radius: 0;
        }
        .merged-reference-list-drawer .knowledge-output a {
          color: #1890ff;
          text-decoration: none;
        }
        .merged-reference-list-drawer .knowledge-output a:hover {
          text-decoration: underline;
        }
      `;
    }

    // 渲染抽屉内容到 document.body
    if (this.drawerElement) {
      let itemIndex = 0;

      const webSearchHtml =
        webSearch.length > 0
          ? `
        <div class="section">
          ${webSearch
            .map(result => {
              itemIndex++;
              const iconUrl = this.getFaviconUrl(
                result.link || '',
                result.icon,
              );
              const siteName = this.getSiteName(
                result.link || '',
                result.site_name,
              );
              return `
            <div class="result-item">
              ${
                iconUrl
                  ? `<img src="${iconUrl}" class="result-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                     <div class="result-icon-placeholder" style="display: none;">🌐</div>`
                  : '<div class="result-icon-placeholder">🌐</div>'
              }
              <div class="result-content">
                <div class="result-header">
                  <span class="result-title">${this.escapeHtml(result.title || '无标题')}</span>
                </div>
                ${result.snippet ? `<div class="result-snippet">${this.escapeHtml(result.snippet)}</div>` : ''}
                ${
                  result.link
                    ? `
                  <a href="${result.link}" target="_blank" rel="noopener noreferrer" class="result-link">
                    <div class="result-link-icon">${linkIconSvg}</div>
                    <span>${this.escapeHtml(siteName || result.link)}</span>
                  </a>
                `
                    : ''
                }
              </div>
            </div>
          `;
            })
            .join('')}
        </div>
      `
          : '';

      const knowledgeReferencesHtml =
        knowledgeReferences.length > 0
          ? `
        ${webSearch.length > 0 ? '<div class="divider"></div>' : ''}
        <div class="section">
          ${knowledgeReferences
            .map(result => {
              itemIndex++;
              const knowledgeTitle = result.knowledgeName
                ? `"${this.escapeHtml(result.knowledgeName)}"知识文件`
                : '知识文件';
              const docIcon = this.getDocumentIcon(result.fileUrl);
              return `
            <div class="result-item">
              <div class="result-icon-document">${docIcon}</div>
              <div class="result-content">
                <div class="knowledge-header">${knowledgeTitle}</div>
                ${result.output ? `<div class="knowledge-output">${this.renderMarkdown(result.output)}</div>` : ''}
                ${
                  result.fileUrl
                    ? `
                  <a href="https://aiot-dev.glodon.com/portal/_/cvforcepd/doc-viewer/?url=${encodeURIComponent(result.fileUrl)}" target="_blank" rel="noopener noreferrer" class="result-link" onclick="event.stopPropagation();">
                    <div class="result-link-icon">${docIcon}</div>
                    <span>${this.escapeHtml(result.fileName || '这是一个知识文件')}</span>
                  </a>
                `
                    : result.fileName
                      ? `
                  <div class="result-link" style="cursor: default; color: #B752EA;">
                    <div class="result-link-icon">${docIcon}</div>
                    <span>${this.escapeHtml(result.fileName)}</span>
                  </div>
                `
                      : ''
                }
              </div>
            </div>
          `;
            })
            .join('')}
        </div>
      `
          : '';

      this.drawerElement.innerHTML = `
        <div class="drawer-header">
          <div class="drawer-title">参考来源</div>
          <button class="drawer-close" id="drawer-close" aria-label="关闭">×</button>
        </div>
        <div class="drawer-content">
          ${webSearchHtml}
          ${knowledgeReferencesHtml}
        </div>
      `;
    }

    // 绑定事件
    const button = this.shadowRoot.querySelector('#reference-button');
    if (button) {
      button.addEventListener('click', () => this.openDrawer());
    }

    const closeBtn = this.drawerElement?.querySelector('#drawer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDrawer());
    }

    // 绑定遮罩层点击事件
    if (this.maskElement) {
      this.maskElement.addEventListener('click', () => this.closeDrawer());
    }
  }
}

