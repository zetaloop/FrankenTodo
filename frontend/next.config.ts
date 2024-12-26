import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '',
  // 路由调试配置
  // 请在 src/app/layout.tsx 中启用 DebugRouterProvider
  //
  // webpack: (config) => {
  //   config.optimization = {  // 禁用压缩
  //     ...config.optimization,
  //     minimize: false,
  //     moduleIds: 'named',
  //     chunkIds: 'named',
  //     mangleExports: false,
  //   }
  //   return config
  // },
  // productionBrowserSourceMaps: true,  // 启用源码映射
};

export default nextConfig;
