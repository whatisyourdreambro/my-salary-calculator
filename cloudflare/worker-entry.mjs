import generatedWorker from '../.open-next/worker.js';
import { withRequestBodyLimits } from './request-body-limit.mjs';

// Preserve every named adapter export (including its Durable Object classes).
export * from '../.open-next/worker.js';
export default withRequestBodyLimits(generatedWorker);
