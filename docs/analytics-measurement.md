# Analytics measurement contract

The measurement update separates user actions, visible results, ad requests, and partner banner impressions. It does not change ad positions or ad load.

## Calculation events

Events with `measurement_version=2` use a calculator within one pathname visit as the counting unit. Navigation away and back starts a new visit. Component remounts within the same visit do not start another funnel.

| Event | Meaning |
|---|---|
| `calc_start` | First trusted interaction with eligible calculator controls |
| `result_view` | First valid result visible in the viewport; `result_origin` distinguishes `default` from `user` |
| `calc_success` | First valid, current result visible after a trusted user interaction |

The home salary calculator also requires an explicit completed calculation matching the current inputs. Restoring shared inputs or viewing defaults is not a successful user calculation. Repeated calculations do not create additional successes in the same visit. Do not compare the legacy input-idle `calc_submit` count directly with the new success count.

Initial coverage: home salary calculator, shared `SimpleCalculatorView` calculators, Samsung bonus pool and personal calculators, and the Chuseok bonus mini calculator. Other independent calculators are not included in this success funnel. Do not use all site visits as the denominator for this subset.

Calculation events contain calculator type, sanitized page path, measurement version, and result origin where applicable. Amounts, income bands, family details, and result payloads are excluded. Custom event URLs remove calculation/share payloads and preserve campaign attribution parameters. Automatic Google tag events are separate and require their own URL-redaction verification; this wrapper is not proof that all automatic telemetry has been sanitized.

## Advertising and partner events

- `ad_request_attempt`: a manual slot is about to push an AdSense request. This is not a served impression.
- `ad_request_error`: that push threw an exception. No error text or input data is included.
- `ad_filled` / `ad_unfilled`: the existing slot status observer; these are not revenue or viewability measurements.
- `coupang_impression`: an actual rendered banner reaches 50% viewport intersection with positive dimensions. Empty fallback wrappers are excluded. `banner_size` and `category` come from the rendered banner, matching click dimensions. The legacy `size_key` alias now reflects actual size.
- `affiliate_impression`: an offer card reaches 50% viewport intersection. Observers restart when pathname or offer changes; callbacks from disposed observers are ignored.

These partner events describe site observations. Partner-recognized clicks, purchases, approvals, and commissions remain separate data sources.

## Analysis and rollout

Register event-scoped definitions for `calc_type`, `measurement_version`, `result_origin`, `slot_kind`, `position`, `offer_id`, `vertical`, and `banner_size` as needed in the reporting property. `calc_success` may be a key event with no default monetary value. Do not assign fictional revenue to calculation or partner clicks.

Record the deployment boundary before comparing measurements. Revenue remains the source platform's reported amount; GA views and AdSense pageviews have different definitions. URL-prefix channels overlap and must not be added together as independent revenue.

Verify defaults, invalid input, accepted input, a visible current result, repeated input, and navigation away/back before using the funnel. Confirm received event parameters after deployment. Hold ad load steady while establishing the new measurement baseline, then change one ad setting per experiment.
