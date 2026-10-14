# Prevent live ads during development and QA

The shared `liveAds` guard allows the AdSense loader and manual ad requests only
on HTTPS `moneysalary.com` and `www.moneysalary.com`, in a production build, when
the browser does not identify itself as WebDriver automation.

Local development, local production builds, Cloudflare Pages preview domains,
and WebDriver QA do not load the AdSense script or request manual slots. The
existing ad containers and production placement layout are preserved.

Continue blocking external ad requests in automated QA. The WebDriver check is
an extra precaution, not protection against malicious bots or proof of traffic
validity. Ordinary browsers on the production domain still show live ads;
inspect changes on a local or preview URL and never click live ads to test them.

This preventive change does not establish the cause of an AdSense serving limit
and does not remove the limit. Google evaluates the account separately.
