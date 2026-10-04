import nextHandler from '@cloudflare/next-on-pages/fetch-handler';
import { contract } from '../.vercel/static-company-fastpath.mjs';
import { createStaticCompanyHandler } from './static-company-fastpath.mjs';

export default createStaticCompanyHandler(nextHandler, contract);
