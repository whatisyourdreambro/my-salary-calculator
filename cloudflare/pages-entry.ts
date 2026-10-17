import { createPagesHandler, transformShareDocument } from './pages-router.mjs';
import { withRequestBodyLimits } from './request-body-limit.mjs';
import { handlePagesDynamic } from './pages-dynamic';
import { handlePagesOg } from './pages-og';
import { resolveSalaryRedirect } from '../src/lib/salaryRedirect';
import { getPagesShareModel, renderShareIslandHtml } from '../src/lib/pagesShare';

// The verified packager injects this value; no deployment/environment data is read.
declare const __MSY_PAGES_MANIFEST__: Record<string, unknown>;
const handler = createPagesHandler(__MSY_PAGES_MANIFEST__, {
  dynamic: handlePagesDynamic,
  salaryRedirect: resolveSalaryRedirect,
  og: handlePagesOg,
  share: (request: Request, response: Response) => transformShareDocument(request, response, {
    getModel: getPagesShareModel, renderIsland: renderShareIslandHtml,
  }),
});
export default withRequestBodyLimits(handler);
