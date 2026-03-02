import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import {
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'fs';
import { splitVendorChunkPlugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SDK 资源文件路径
const sdkPath = resolve(__dirname, 'node_modules/@glodon-aiot/chat-app-sdk');
const sdkEsPath = resolve(sdkPath, 'es');

// 添加 SDK 资源中间件
function addSdkAssetsMiddleware(middlewares: any) {
  // 拦截 SDK 资源文件请求
  middlewares.use((req, res, next) => {
    if (!req.url) {
      next();
      return;
    }

    // 匹配 SDK 的 JS chunk 文件（如 82.js, 691.js）
    // 支持带 base 路径的请求（如 /chat-app-sdk-demo/assets/82.js 或 /chat-app-sdk-demo/test/assets/82.js）
    // 也支持不带 base 路径的请求（如 /assets/82.js）
    const jsChunkMatch =
      req.url.match(/\/chat-app-sdk-demo(?:\/test)?\/assets\/(\d+\.js)$/) ||
      req.url.match(/\/glodon-aiot-examples\/assets\/(\d+\.js)$/) ||
      req.url.match(/\/assets\/(\d+\.js)$/);
    if (jsChunkMatch) {
      const fileName = jsChunkMatch[1];
      const filePath = resolve(sdkEsPath, fileName);

      if (existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.end(readFileSync(filePath));
        return;
      }
    }

    // 匹配哈希文件名的资源请求（如 054000aa4e72c964.png）
    const hashFileMatch = req.url.match(
      /\/([a-f0-9]{32}\.(png|svg|jpg|jpeg|gif|ttf|woff|woff2|eot))$/i,
    );
    if (hashFileMatch) {
      const fileName = hashFileMatch[1];
      const filePath = resolve(sdkEsPath, fileName);

      if (existsSync(filePath)) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        const contentType: Record<string, string> = {
          png: 'image/png',
          svg: 'image/svg+xml',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif',
          ttf: 'font/ttf',
          woff: 'font/woff',
          woff2: 'font/woff2',
          eot: 'application/vnd.ms-fontobject',
        };
        res.setHeader(
          'Content-Type',
          contentType[ext || ''] || 'application/octet-stream',
        );
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.end(readFileSync(filePath));
        return;
      }
    }

    // 匹配 node_modules 路径的资源请求
    const nodeModulesMatch = req.url.match(
      /\/node_modules\/@glodon-aiot\/chat-app-sdk\/es\/(.+)$/,
    );
    if (nodeModulesMatch) {
      const fileName = nodeModulesMatch[1];
      const filePath = resolve(sdkEsPath, fileName);

      if (existsSync(filePath)) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        const contentType: Record<string, string> = {
          png: 'image/png',
          svg: 'image/svg+xml',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif',
          ttf: 'font/ttf',
          woff: 'font/woff',
          woff2: 'font/woff2',
          eot: 'application/vnd.ms-fontobject',
          js: 'application/javascript',
        };
        res.setHeader(
          'Content-Type',
          contentType[ext || ''] || 'application/octet-stream',
        );
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.end(readFileSync(filePath));
        return;
      }
    }

    next();
  });
}

// 创建插件来处理开发环境和预览模式下的 SDK 资源文件
function sdkAssetsDevPlugin(): Plugin {
  return {
    name: 'sdk-assets-dev-plugin',
    configureServer(server) {
      // 开发环境处理
      addSdkAssetsMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      // 预览模式处理
      addSdkAssetsMiddleware(server.middlewares);
    },
  };
}

// 创建插件来忽略 SDK 中的动态导入警告
// 这个警告是 Vite 的 import-analysis 插件产生的，因为 SDK 使用了 Webpack 风格的动态导入
function ignoreSdkDynamicImportWarningsPlugin(): Plugin {
  let originalWarn: typeof console.warn;

  return {
    name: 'ignore-sdk-dynamic-import-warnings',
    enforce: 'pre',
    // 在 configureServer 中拦截警告
    configureServer(server) {
      // 拦截 Vite 的警告信息（通过 logger）
      if (server.config.logger) {
        const originalLoggerWarn = server.config.logger.warn;
        server.config.logger.warn = (msg, options) => {
          // 过滤掉来自 SDK 的动态导入警告
          const msgStr = typeof msg === 'string' ? msg : String(msg);
          if (
            msgStr.includes('dynamic import cannot be analyzed') &&
            (msgStr.includes('chat-app-sdk') || msgStr.includes('index.esm.js'))
          ) {
            // 忽略这个警告
            return;
          }
          // 其他警告正常输出
          originalLoggerWarn.call(server.config.logger, msg, options);
        };
      }

      // 同时拦截 console.warn（因为某些警告可能直接通过 console 输出）
      originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        const message = args[0]?.toString() || '';
        // 过滤掉来自 SDK 的动态导入警告
        if (
          message.includes('dynamic import cannot be analyzed') &&
          (message.includes('chat-app-sdk') || message.includes('index.esm.js'))
        ) {
          // 忽略这个警告
          return;
        }
        // 其他警告正常输出
        originalWarn.apply(console, args);
      };
    },
    // 在服务器关闭时恢复原始的 console.warn
    buildEnd() {
      if (originalWarn) {
        console.warn = originalWarn;
      }
    },
  };
}

// 创建插件来修复 SDK 中的动态导入路径（用于 GitHub Pages）
// 注意：SDK 已在 build-esm.config.ts 中添加了 publicPath: 'auto'，理论上应该自动处理路径问题
// 此插件作为后备方案，如果 SDK 修复后验证通过，可以移除此插件
function fixSdkDynamicImportsPlugin(): Plugin {
  const basePath =
    process.env.VITE_BASE_PATH ??
    (process.env.NODE_ENV === 'production' ? '/chat-app-sdk-demo/live/' : '/');
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;

  return {
    name: 'fix-sdk-dynamic-imports',
    writeBundle(options, bundle) {
      // 只在生产环境处理；若 base 已是根路径则跳过
      if (process.env.NODE_ENV !== 'production' || normalizedBase === '/') {
        return;
      }

      // 查找 chat-sdk chunk 文件
      const chatSdkChunk = Object.keys(bundle).find(
        fileName =>
          fileName.startsWith('assets/chat-sdk-') && fileName.endsWith('.js'),
      );

      if (!chatSdkChunk) {
        console.warn('⚠️ chat-sdk chunk not found in bundle');
        return;
      }

      const filePath = resolve(options.dir || 'dist', chatSdkChunk);

      if (!existsSync(filePath)) {
        return;
      }

      // 读取文件内容
      let content = readFileSync(filePath, 'utf-8');
      let modified = false;

      // 修复 __webpack_require__.p（public path）的设置
      // 这是最关键的修复：确保 public path 指向正确的 base path
      // 匹配多种可能的格式：
      // - __webpack_require__.p = scriptUrl
      // - a.p = scriptUrl (压缩后)
      // - __webpack_require__.p = scriptUrl.replace(...)
      // - Te.p = a (其中 a 是从 import.meta.url 计算出来的)
      const publicPathPatterns = [
        // 匹配：变量名.p = scriptUrl
        /([a-zA-Z_$][a-zA-Z0-9_$]*\.p)\s*=\s*scriptUrl/g,
        // 匹配：变量名.p = scriptUrl.replace(...)
        /([a-zA-Z_$][a-zA-Z0-9_$]*\.p)\s*=\s*scriptUrl\s*\.\s*replace\([^)]+\)/g,
        // 匹配：变量名.p = a (其中 a 是从 import.meta.url 计算出来的，如 Te.p = a)
        // 这个模式匹配类似：Te.p=a})();(()=>{Te.b=new URL("./",import.meta.url)
        /([a-zA-Z_$][a-zA-Z0-9_$]*\.p)\s*=\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\}\)\s*\)\s*\(\s*\)\s*;\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*new URL\(["']\.\/["'],\s*import\.meta\.url\)/g,
        // 更简单的模式：匹配 .p = 变量名，后面跟着 import.meta.url
        /([a-zA-Z_$][a-zA-Z0-9_$]*\.p)\s*=\s*[a-zA-Z_$][a-zA-Z0-9_$]*(?=[^}]*import\.meta\.url)/g,
      ];

      // 首先尝试匹配 Te.p = a 的模式（从 import.meta.url 计算）
      // 匹配模式：Te.p=a})();(()=>{Te.b=new URL("./",import.meta.url
      // 我们需要找到 .p = 变量名，后面跟着 import.meta.url 的模式
      const tePattern =
        /([a-zA-Z_$][a-zA-Z0-9_$]*\.p)\s*=\s*[a-zA-Z_$][a-zA-Z0-9_$]*\}\)\s*\)\s*\(\s*\)\s*;\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*new URL\(["']\.\/["'],\s*import\.meta\.url\)/;
      if (tePattern.test(content)) {
        content = content.replace(tePattern, (match, varName) => {
          return `${varName} = "${normalizedBase}assets/"`;
        });
        modified = true;
      }

      // 更简单的模式：匹配任何 .p = 变量名，如果后面有 import.meta.url
      // 使用更宽松的匹配，查找 .p = 变量名，然后检查后面是否有 import.meta.url
      const simpleTePattern =
        /([a-zA-Z_$][a-zA-Z0-9_$]*\.p)\s*=\s*[a-zA-Z_$][a-zA-Z0-9_$]*/g;
      const allPMatches2 = content.match(simpleTePattern);
      if (allPMatches2) {
        // 检查每个匹配后面是否有 import.meta.url
        for (const match of allPMatches2) {
          const matchIndex = content.indexOf(match);
          const afterMatch = content.substring(
            matchIndex + match.length,
            matchIndex + match.length + 500,
          );
          if (afterMatch.includes('import.meta.url')) {
            const varNameMatch = match.match(
              /([a-zA-Z_$][a-zA-Z0-9_$]*\.p)\s*=\s*[a-zA-Z_$][a-zA-Z0-9_$]*/,
            );
            if (varNameMatch) {
              const varName = varNameMatch[1];
              // 替换这个特定的匹配
              content = content.replace(
                new RegExp(
                  `(${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*=\\s*[a-zA-Z_$][a-zA-Z0-9_$]*`,
                ),
                `${varName} = "${normalizedBase}assets/"`,
              );
              modified = true;
              break; // 只替换第一个匹配
            }
          }
        }
      }

      // 然后尝试匹配其他模式
      publicPathPatterns.forEach((pattern, index) => {
        if (pattern.test(content)) {
          content = content.replace(pattern, (match, varName) => {
            return `${varName} = "${normalizedBase}assets/"`;
          });
          modified = true;
        }
      });

      // 如果上面的模式都没有匹配到，尝试直接查找并设置所有 .p 变量
      // 匹配：变量名.p = ... (任何赋值)
      const anyPPattern = /([a-zA-Z_$][a-zA-Z0-9_$]*\.p)\s*=\s*[^;]+/g;
      const allPMatches = content.match(anyPPattern);

      // 如果找到了 .p 的赋值，但还没有被修复，尝试直接替换
      if (allPMatches && allPMatches.length > 0 && !modified) {
        // 找到第一个 .p 的变量名
        const firstPMatch = content.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\.p\s*=/);
        if (firstPMatch) {
          const varName = firstPMatch[1];
          // 替换所有该变量的 .p 赋值
          const specificPPattern = new RegExp(
            `(${varName}\\.p)\\s*=\\s*[^;]+`,
            'g',
          );
          content = content.replace(specificPPattern, (match, pVar) => {
            return `${pVar} = "${normalizedBase}assets/"`;
          });
          modified = true;
        }
      }

      // 如果上面的模式都没有匹配到，尝试直接查找并替换 undefined 的情况
      // 匹配：变量名.p + ... 但变量名.p 是 undefined
      const undefinedPattern = /import\("undefined([^"]+)"\)/g;
      if (undefinedPattern.test(content)) {
        content = content.replace(undefinedPattern, (match, path) => {
          // 找到第一个 .p 的变量名
          const pMatch = content.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\.p\s*=/);
          const webpackRequireName = pMatch ? pMatch[1] : '__webpack_require__';
          return `import(${webpackRequireName}.p + "${path}")`;
        });
        modified = true;
      }

      // 修复动态导入路径：将 import("./" + ...) 替换为使用 __webpack_require__.p
      // 匹配模式：import("./" + ...)
      // 替换为：import(__webpack_require__.p + ...)
      // 这样可以确保使用正确的 public path
      const importPattern = /import\("\.\/"\s*\+\s*([^)]+)\)/g;
      if (importPattern.test(content)) {
        content = content.replace(importPattern, (match, pathExpr) => {
          // 提取路径表达式，使用 __webpack_require__.p 作为前缀
          // 需要找到 __webpack_require__ 的变量名（可能是压缩后的）
          // 先尝试找到 .p 的变量名
          const pMatch = content.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\.p\s*=/);
          const webpackRequireName = pMatch ? pMatch[1] : '__webpack_require__';
          return `import(${webpackRequireName}.p + ${pathExpr})`;
        });
        modified = true;
      }

      // 修复 Te.f.j 函数中的动态导入：将 e.p 替换为 Te.p（或找到的变量名）
      // 匹配：import(e.p + Te.u(o)) 或 import(e.p + ...)
      // 问题：e.p 可能是 undefined，导致 import("undefined82.js")
      // 解决：将 e.p 替换为 Te.p（或找到的变量名）
      const dynamicImportEPattern =
        /import\(([a-zA-Z_$][a-zA-Z0-9_$]*)\.p\s*\+\s*([^)]+)\)/g;
      if (dynamicImportEPattern.test(content)) {
        // 找到 Te 变量名（或第一个 .p 的变量名，且已设置为正确的值）
        const teMatch = content.match(
          /([a-zA-Z_$][a-zA-Z0-9_$]*)\.p\s*=\s*"[^"]+"/,
        );
        const teVarName = teMatch ? teMatch[1] : 'Te';

        content = content.replace(
          dynamicImportEPattern,
          (match, varName, rest) => {
            // 如果 varName 不是 Te（或找到的变量名），替换为 Te（或找到的变量名）
            // 这样可以确保使用正确的 publicPath
            if (varName !== teVarName) {
              return `import(${teVarName}.p + ${rest})`;
            }
            return match;
          },
        );
        modified = true;
      }

      // 修复 undefined 的情况：import("undefined82.js") -> import(__webpack_require__.p + "82.js")
      const undefinedImportPattern = /import\("undefined([^"]+)"\)/g;
      if (undefinedImportPattern.test(content)) {
        content = content.replace(undefinedImportPattern, (match, path) => {
          // 找到第一个 .p 的变量名
          const pMatch = content.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\.p\s*=/);
          const webpackRequireName = pMatch ? pMatch[1] : '__webpack_require__';
          return `import(${webpackRequireName}.p + "${path}")`;
        });
        modified = true;
      }

      // 如果修改了内容，写入文件
      if (modified) {
        writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Fixed dynamic import paths in ${chatSdkChunk}`);
      }
    },
  };
}

// 获取 SDK es 目录中的所有资源文件
function getSdkAssets(): Array<{ src: string; dest: string }> {
  if (!existsSync(sdkEsPath)) {
    return [];
  }

  const assets: Array<{ src: string; dest: string }> = [];
  const files = readdirSync(sdkEsPath);

  files.forEach(file => {
    const filePath = resolve(sdkEsPath, file);
    const stat = statSync(filePath);

    if (stat.isFile()) {
      const ext = file.split('.').pop()?.toLowerCase();
      // 复制资源文件和 JS chunk 文件（排除主入口文件）
      if (
        [
          'png',
          'svg',
          'jpg',
          'jpeg',
          'gif',
          'ttf',
          'woff',
          'woff2',
          'eot',
          'js', // 包含 JS chunk 文件
        ].includes(ext || '') &&
        file !== 'index.esm.js' && // 排除主入口文件
        file !== 'ui.esm.js' // 排除 UI 入口文件
      ) {
        assets.push({
          src: `node_modules/@glodon-aiot/chat-app-sdk/es/${file}`, // 相对路径
          dest: 'assets', // 复制到 dist/assets 目录
        });
      }
    }
  });

  return assets;
}

export default defineConfig({
  // GitHub Pages：使用 VITE_BASE_PATH（CI 设置），默认生产环境为 /chat-app-sdk-demo/live/
  base:
    process.env.VITE_BASE_PATH ??
    (process.env.NODE_ENV === 'production' ? '/chat-app-sdk-demo/live/' : '/'),
  plugins: [
    react(),
    sdkAssetsDevPlugin(), // 开发环境资源处理插件
    ignoreSdkDynamicImportWarningsPlugin(), // 忽略 SDK 动态导入警告
    // 自动分离 vendor chunk（node_modules 依赖）
    splitVendorChunkPlugin(),
    // 构建时复制 SDK 资源文件到 dist 目录
    viteStaticCopy({
      targets: getSdkAssets(),
    }),
    // 修复 SDK 中的动态导入路径（用于 GitHub Pages）
    fixSdkDynamicImportsPlugin(),
  ],
  resolve: {
    // 使用 node_modules 中的包，不配置任何外部源码别名
  },
  // 配置资源处理：确保所有静态资源文件被正确处理
  assetsInclude: [
    '**/*.svg',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.ttf',
    '**/*.woff',
    '**/*.woff2',
    '**/*.eot',
  ],
  // 配置依赖优化
  optimizeDeps: {
    // 排除 SDK 的预构建，因为 SDK 中包含了 webpack 特定的代码
    exclude: ['@glodon-aiot/chat-app-sdk'],
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      // 允许访问项目根目录的父目录，以便访问 node_modules 中的包资源
      // 这解决了访问 chat-app-sdk 构建输出目录中图片资源的 403 错误
      allow: [
        // 项目根目录
        __dirname,
        // 父目录（frontend）
        resolve(__dirname, '..'),
        // 允许访问 packages 目录（chat-app-sdk 的构建输出）
        resolve(__dirname, '..', '..', 'packages'),
        // 允许访问 node_modules（如果需要）
        resolve(__dirname, '..', '..', 'node_modules'),
      ],
    },
  },
  build: {
    outDir: process.env.VITE_OUT_DIR || 'dist',
    sourcemap: false, // 生产环境禁用 sourcemap 以减小文件大小
    // 启用代码压缩（使用 esbuild，更快）
    minify: 'esbuild',
    // 配置 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000, // 1MB
    rollupOptions: {
      // 过滤掉来自 SDK 的动态导入警告
      onwarn(warning, warn) {
        // 忽略来自 SDK 的动态导入警告
        if (
          warning.message &&
          warning.message.includes('dynamic import cannot be analyzed') &&
          (warning.message.includes('chat-app-sdk') ||
            warning.message.includes('index.esm.js'))
        ) {
          return;
        }
        // 其他警告正常输出
        warn(warning);
      },
      output: {
        // 手动配置代码分割策略
        manualChunks: id => {
          // 将 chat-app-sdk 单独打包
          if (id.includes('@glodon-aiot/chat-app-sdk')) {
            return 'chat-sdk';
          }
          // 将 React 相关依赖单独打包
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // 将其他 node_modules 依赖打包到 vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // 配置 chunk 文件命名
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: assetInfo => {
          // SVG 文件保持原文件名
          if (assetInfo.name && assetInfo.name.endsWith('.svg')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
