/** Bounded bare-domain suffix policy, not the full root-zone list.
 * Source: https://data.iana.org/TLD/tlds-alpha-by-domain.txt
 * Snapshot: Version 2026102300, updated 2026-10-23 07:07:01 UTC.
 * Includes 248 ASCII two-letter TLDs, 63 selected general TLDs and 8 IDN TLDs.
 * Explicit schemes/www are handled separately; unlisted bare suffixes may pass.
 */
export default {
  tlds: "ac accountant ad ae af ag agency ai al am ao app aq ar art as at au aw ax az ba bank bb bd be bf bg bh bi biz bj blog bm bn bo br bs bt business bv bw by bz ca cc cd cf cg ch ci ck cl click cloud cm cn co com company consulting cr credit cu cv cw cx cy cz de design dev digital dj dk dm do dz ec edu ee eg email er es et eu fi finance financial fj fk fm fo fr ga gb gd ge gf gg gh gi gl global gm gn gov gp gq gr group gs gt gu gw gy help hk hm hn hr ht hu id ie il im in info insurance int io iq ir is it je jm jo jp ke kg kh ki km kn kp kr kw ky kz la law lb lc legal li link live lk loan loans lr ls lt lu lv ly ma mc md me media mg mh mil mk ml mm mn mo money mp mq mr ms mt mu mv mw mx my mz na name nc ne net network news nf ng ni nl no np nr nu nz om one online org pa page pe pf pg ph pk pl pm pn pr pro ps pt pw py qa re ro rs ru rw sa sb sc sd se services sg sh shop si site sj sk sl sm sn so social solutions space sr ss st store su support sv sx sy sz tax tc td tech tf tg th tj tk tl tm tn to today tools top tr tt tv tw tz ua ug uk us uy uz va vc ve vg vi vn vu website wf work world ws xn--3e0b707e xn--fiqs8s xn--fiqz9s xn--j6w193g xn--kprw13d xn--kpry57d xn--mk1bu44c xn--p1ai xyz ye yt za zm zw".split(" "),
};
