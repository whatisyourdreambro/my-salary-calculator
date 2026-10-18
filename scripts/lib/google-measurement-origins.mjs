// Pinned 2026-10-18 from Google's public supported-domain list (not a collector):
// https://www.google.com/supported_domains
// https://developers.google.com/tag-platform/security/guides/csp
// CSP cannot express www.google.*. Permit only Google's listed www hosts for
// regional measurement images; do not grant these origins scripts or connections.
// Keep this list offline: builds and tests must never fetch measurement resources.
const googleDomainSuffixes = `
com ad ae com.af com.ag al am co.ao com.ar as
at com.au az ba com.bd be bf bg com.bh bi
bj com.bn com.bo com.br bs bt co.bw by com.bz ca
cd cf cg ch ci co.ck cl cm cn com.co
co.cr com.cu cv com.cy cz de dj dk dm com.do
dz com.ec ee com.eg es com.et fi com.fj fm fr
ga ge gg com.gh com.gi gl gm gr com.gt gy
com.hk hn hr ht hu co.id ie co.il im co.in
iq is it je com.jm jo co.jp co.ke com.kh ki
kg co.kr com.kw kz la com.lb li lk co.ls lt
lu lv com.ly co.ma md me mg mk ml com.mm
mn com.mt mu mv mw com.mx com.my co.mz com.na com.ng
com.ni ne nl no com.np nr nu co.nz com.om com.pa
com.pe com.pg com.ph com.pk pl pn com.pr ps pt com.py
com.qa ro ru rw com.sa com.sb sc se com.sg sh
si sk com.sl sn so sm sr st com.sv td
tg co.th com.tj tl tm tn to com.tr tt com.tw
co.tz com.ua co.ug co.uk com.uy co.uz com.vc co.ve co.vi com.vn
vu ws rs co.za co.zm co.zw cat
`.trim().split(/\s+/);

export const googleMeasurementImageOrigins = Object.freeze(
  googleDomainSuffixes.map(suffix => `https://www.google.${suffix}`),
);
