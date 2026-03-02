# Chat App SDK - Web Components Example

This is an example project demonstrating how to use Web Components with `@glodon-aiot/chat-app-sdk`.

## Features

- ✅ Web Components integration
- ✅ Custom JsonItem component
- ✅ Custom ContentBox component
- ✅ Search result display
- ✅ Knowledge reference display
- ✅ Network search toggle

## Getting Started

### Prerequisites

- Node.js >= 18
- npm/pnpm/yarn

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your configuration:
```env
VITE_CHAT_APP_COZE_TOKEN=your-token
VITE_CHAT_APP_CHATFLOW_COZE_APP_ID=your-app-id
VITE_CHAT_APP_CHATFLOW_COZE_WORKFLOW_ID=your-workflow-id
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Deploy to GitHub Pages

项目已配置自动部署到 GitHub Pages。每次推送到 `main` 分支时，GitHub Actions 会自动构建并部署项目。

**访问地址：**
- GitHub Pages: https://glodon-aiot.github.io/chat-app-sdk-demo/live/#/demo

**手动部署步骤：**

1. 确保 GitHub Pages 已启用：
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"

2. 推送代码到 main 分支：
   ```bash
   git push origin main
   ```

3. 查看部署状态：
   - 进入仓库 Actions 标签页
   - 查看 "Deploy to GitHub Pages" 工作流状态

**本地预览构建结果：**

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── WebComponentDemo/
│   │   └── index.tsx              # Main demo component
│   ├── search-result-list.ts      # Search result Web Component
│   ├── knowledge-reference-list.ts # Knowledge reference Web Component
│   └── index.ts                   # Exports
├── App.tsx                        # Root component
└── main.tsx                       # Entry point
```

## Usage

This example demonstrates:

1. **Custom JsonItem Component**: Shows how to create a custom JsonItem using Web Components
2. **Custom ContentBox Component**: Shows how to customize the content box
3. **Search Results**: Displays search results using Web Components
4. **Knowledge References**: Displays knowledge base references

## Learn More

- [Chat App SDK 介绍](https://glodon-aiot.github.io/chat-app-sdk-demo/live/#/demo)
- [Web Components Guide](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

