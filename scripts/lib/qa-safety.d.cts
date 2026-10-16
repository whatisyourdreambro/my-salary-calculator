import type { Browser, BrowserContext, BrowserContextOptions, BrowserType, LaunchOptions } from 'playwright-core';
declare const qaSafety: {
  QA_USER_AGENT: string;
  assertLocalQaTarget(value: string, name?: string): string;
  assertQaEnvironment(env?: NodeJS.ProcessEnv): void;
  isAllowedQaRequest(value: string, baseURL: string, method?: string): boolean;
  fetchQaDocument(value: string, baseURL: string, options?: RequestInit): Promise<Response>;
  verifyQaServer(baseURL: string): Promise<void>;
  chromiumQaArgs(baseURL: string, proxyPort: number): string[];
  chromiumQaLaunchOptions(baseURL: string, options: LaunchOptions, proxyPort: number): LaunchOptions;
  startQaDenyProxy(): Promise<{ port: number; close(): Promise<void> }>;
  launchQaBrowser(chromium: BrowserType, baseURL: string, options?: LaunchOptions): Promise<Browser>;
  createQaContext(browser: Browser, baseURL: string, options?: BrowserContextOptions): Promise<BrowserContext>;
  installQaContext(context: BrowserContext, baseURL: string): Promise<BrowserContext>;
};
export = qaSafety;
