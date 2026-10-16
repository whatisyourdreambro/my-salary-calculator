declare const qaHttp: {
  QA_USER_AGENT: string;
  CANONICAL_PRODUCTION_ORIGIN: string;
  assertProductionQaTarget(value: string, method?: string): string;
  assertProductionQaOrigin(value?: string): string;
  fetchProductionQaDocument(value: string, options?: {
    method?: string;
    headers?: HeadersInit;
    timeoutMs?: number;
    fetchFn?: typeof fetch;
  }): Promise<Response>;
};
export = qaHttp;
