/**
 * 根据当前部署环境返回 localStorage key 后缀，使生产(live)与测试(test)环境数据隔离。
 * 构建时 base 为 /chat-app-sdk-demo/test/ 则为测试环境，否则为生产环境。
 */
export function getStorageEnvSuffix(): string {
  const base = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '';
  return base.includes('/test/') ? '_test' : '_live';
}
