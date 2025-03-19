export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.5.11',
  buildTime: '2025-03-17T15:19:49.859Z', // 编译时会通过 version-sync.js 自动更新
};
