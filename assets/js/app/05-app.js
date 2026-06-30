const { useState: useStateA, useMemo: useMemoA, useEffect: useEffectA } = React;

/* ── Small inline illustrations for each view (used on the Home cards and at the
   bottom of the Introduction). Neutral strokes use currentColor so they read on
   both the dark intro boxes and the light home cards; thread accents are fixed. */
const VIEW_ILLUS = {
  recap: `<svg viewBox="0 0 220 112" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="12" width="140" height="88" rx="9" fill="currentColor" fill-opacity="0.05" stroke="currentColor" stroke-opacity="0.30"/><rect x="40" y="12" width="140" height="20" rx="9" fill="#b5894a"/><rect x="40" y="25" width="140" height="7" fill="#b5894a"/><rect x="50" y="18" width="52" height="7" rx="3.5" fill="#ffffff" fill-opacity="0.92"/><rect x="52" y="45" width="84" height="7" rx="3.5" fill="currentColor" fill-opacity="0.55"/><rect x="52" y="60" width="112" height="5" rx="2.5" fill="currentColor" fill-opacity="0.26"/><rect x="52" y="71" width="104" height="5" rx="2.5" fill="currentColor" fill-opacity="0.26"/><rect x="52" y="82" width="60" height="5" rx="2.5" fill="currentColor" fill-opacity="0.26"/><circle cx="160" cy="80" r="12" stroke="currentColor" stroke-opacity="0.16" stroke-width="4"/><circle cx="160" cy="80" r="12" stroke="#4a7c3f" stroke-width="4" stroke-linecap="round" stroke-dasharray="54 30" transform="rotate(-90 160 80)"/></svg>`,
  bigpicture: `<svg viewBox="0 0 220 112" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-opacity="0.12"><line x1="46" y1="20" x2="46" y2="96"/><line x1="92" y1="20" x2="92" y2="96"/><line x1="138" y1="20" x2="138" y2="96"/><line x1="184" y1="20" x2="184" y2="96"/></g><polyline points="46,36 92,36 138,36 184,36" stroke="#b5894a" stroke-width="4" stroke-linecap="round"/><polyline points="46,58 92,58 138,58 184,58" stroke="#a4423a" stroke-width="4" stroke-linecap="round"/><polyline points="46,80 92,80 138,80 184,80" stroke="#3e6792" stroke-width="4" stroke-linecap="round"/><g>${[36,58,80].map(function(y){return [46,92,138,184].map(function(x){var c=y===36?'#b5894a':y===58?'#a4423a':'#3e6792';return '<circle cx="'+x+'" cy="'+y+'" r="4.5" fill="'+c+'"/>';}).join('');}).join('')}</g></svg>`,
  thread: `<svg viewBox="0 0 220 112" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><line x1="26" y1="22" x2="26" y2="96" stroke="#a4423a" stroke-width="4" stroke-linecap="round"/><circle cx="26" cy="34" r="5" fill="#a4423a"/><circle cx="26" cy="59" r="5" fill="#a4423a"/><circle cx="26" cy="84" r="5" fill="#a4423a"/><text x="42" y="42" font-family="Georgia,serif" font-size="15" font-weight="700" fill="#a4423a">The thread of Salvation</text><text x="42" y="66" font-family="Georgia,serif" font-size="10" letter-spacing="1" fill="currentColor" fill-opacity="0.55">SUB-THREAD</text><text x="42" y="82" font-family="Georgia,serif" font-size="12.5" font-weight="600" fill="currentColor" fill-opacity="0.85">Saved through one Man</text></svg>`,
  matrix: `<svg viewBox="0 0 220 112" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><rect x="34" y="18" width="152" height="19.5" fill="#b5894a" fill-opacity="0.92"/><g fill="#ffffff" fill-opacity="0.85"><rect x="42" y="25" width="18" height="5" rx="2.5"/><rect x="80" y="25" width="18" height="5" rx="2.5"/><rect x="118" y="25" width="18" height="5" rx="2.5"/><rect x="156" y="25" width="18" height="5" rx="2.5"/></g><g fill="none" stroke="currentColor" stroke-opacity="0.28"><rect x="34" y="18" width="152" height="78"/><line x1="72" y1="18" x2="72" y2="96"/><line x1="110" y1="18" x2="110" y2="96"/><line x1="148" y1="18" x2="148" y2="96"/><line x1="34" y1="37.5" x2="186" y2="37.5"/><line x1="34" y1="57" x2="186" y2="57"/><line x1="34" y1="76.5" x2="186" y2="76.5"/></g><g fill="currentColor" fill-opacity="0.42"><rect x="42" y="44" width="22" height="5" rx="2.5"/><rect x="80" y="44" width="22" height="5" rx="2.5"/><rect x="118" y="63" width="22" height="5" rx="2.5"/><rect x="42" y="83" width="22" height="5" rx="2.5"/><rect x="118" y="83" width="18" height="5" rx="2.5"/></g><text x="156" y="51" font-size="13" fill="#a4423a">★</text><text x="156" y="70" font-size="13" fill="#4a7c3f">★</text></svg>`
};
function ViewIllus({ name }) {
  return /*#__PURE__*/React.createElement("div", { className: "view-illus", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: VIEW_ILLUS[name] || "" } });
}

/* Page hero band — a faint session image behind the title under a heavy
   parchment overlay, so each landing screen gets the warmth of the home banner
   while staying fully legible. */
function PageHero({ img, eyebrow, title, sub }) {
  return (/*#__PURE__*/
    React.createElement("div", { className: "hero-band", style: img ? { '--hero-img': 'url("' + img + '")' } : null }, /*#__PURE__*/
    React.createElement("span", { className: "hero-band__glow", "aria-hidden": "true" }),
    eyebrow ? /*#__PURE__*/React.createElement("p", { className: "hero-band__eyebrow" }, eyebrow) : null, /*#__PURE__*/
    React.createElement("h1", { className: "hero-band__title" }, title),
    sub ? /*#__PURE__*/React.createElement("p", { className: "hero-band__sub" }, sub) : null
    ));

}
window.PageHero = PageHero;

/* Re-run RefTagger over a scoped container after dynamic content renders.
   Retries for a few seconds in case RefTagger.js hasn't finished loading. */
function tagRefsNow(scopeSel) {
  let tries = 0;
  (function attempt() {
    try {
      if (typeof refTagger !== 'undefined' && refTagger.tag) {
        const el = scopeSel && document.querySelector(scopeSel) || document.getElementById('root') || document.body;
        if (el) {refTagger.tag(el);return;}
      }
    } catch (_) {}
    if (tries++ < 12) setTimeout(attempt, 400);
  })();
}

/* The Pentateuch-in-Review session is a wrap-up, not a thread-bearing study, so
   it's excluded from the cross-session overview tables (subway / thread / matrix). */
function isReviewSession(s) {
  return !!s && (s.chapter === 'Review' || s.topic === 'Pentateuch in Review');
}

/* Theme order for the subway & matrix overviews: the three threads, then NT
   Fulfilment as the overarching resolution, and the two tension themes
   (God's Character & Intent · Mankind's Sinfulness & Limitations) only when the
   reader chooses to reveal them. */
const TENSION_THEME_IDS = ['intention', 'reality'];
function orderThemesNtOverarching(themes, showTension) {
  const base = themes.filter((t) => !TENSION_THEME_IDS.includes(t.id)); // …kingdom, salvation, promises, nt
  if (!showTension) return base;
  const tension = TENSION_THEME_IDS.map((id) => themes.find((t) => t.id === id)).filter(Boolean);
  return base.concat(tension);
}

/* Reveal bar shown beneath the subway/matrix NT Fulfilment row — expands the two
   tension themes that Christ resolves. */
function TensionRevealToggle({ open, onToggle }) {
  return (/*#__PURE__*/
    React.createElement("button", {
      type: "button",
      className: "tension-reveal-toggle" + (open ? " is-open" : ""),
      onClick: onToggle,
      title: open ? "Hide the tension themes" : "Click to see how Christ resolves the tension between God and Man",
      "aria-expanded": open }, /*#__PURE__*/
    React.createElement("span", { className: "tension-reveal-toggle__glyph", "aria-hidden": "true" }, "✝"), /*#__PURE__*/
    React.createElement("span", { className: "tension-reveal-toggle__text" },
    open ? "Hide the tension" : "Click here to see how Christ resolves the tension"
    )
    ));

}

/* ─── HomeScreen v2 ──────────────────────────────────────────────────── */
function HomeScreen({ sessions, themes, onNavigate, onStartTour, onContinue, onOpenJournal }) {
  let __last = null;
  try {const r = localStorage.getItem('OT_LAST_v1');if (r) __last = JSON.parse(r);} catch (e) {}
  const lastSession = __last && __last.sessionId ? (sessions || []).find((s) => s.id === __last.sessionId) : null;
  const PassageRef = window.PassageRef;
  return (/*#__PURE__*/
    React.createElement("div", { className: "home-screen" }, /*#__PURE__*/
    React.createElement("header", { className: "home-screen__header" }, /*#__PURE__*/
    React.createElement("div", { className: "home-screen__masthead" }, /*#__PURE__*/
    React.createElement("span", { className: "home-screen__masthead-glow", "aria-hidden": "true" }), /*#__PURE__*/
    React.createElement("p", { className: "home-screen__eyebrow" }, /*#__PURE__*/
    React.createElement("span", { className: "dot" }), "OT OVERVIEW", /*#__PURE__*/
    React.createElement("span", { className: "dot", style: { opacity: 0.25 } }), "RECAP EDITION", /*#__PURE__*/
    React.createElement("span", { className: "dot", style: { opacity: 0.25 } }), "PENTATEUCH"
    ), /*#__PURE__*/
    React.createElement("h1", { className: "home-screen__title" }, "OT Overview — God's Kingdom, Salvation and Promises ", /*#__PURE__*/React.createElement("em", null, "fulfilled in Jesus")
    ), /*#__PURE__*/
    React.createElement("p", { className: "home-screen__sub" }, "Three threads \u2014 ", /*#__PURE__*/
    React.createElement("strong", null, "Kingdom"), ", ", /*#__PURE__*/React.createElement("strong", null, "Salvation"), ", and ", /*#__PURE__*/React.createElement("strong", null, "Promises"), " \u2014 woven across twelve sessions from Genesis to Deuteronomy."

    )
    ), /*#__PURE__*/
    React.createElement("button", { className: "home-tour-btn", onClick: () => onStartTour && onStartTour() }, /*#__PURE__*/
    React.createElement("span", { className: "home-tour-btn__icon", "aria-hidden": "true" }, "\u21BB"), "Take the guided tour"

    ),
    React.createElement("div", { className: "home-verse" }, /*#__PURE__*/
    React.createElement("span", { className: "home-verse__glyph", "aria-hidden": "true" }, "✝"), /*#__PURE__*/
    React.createElement("p", { className: "home-verse__text" }, "Why study the OT? To know ", /*#__PURE__*/React.createElement("em", null, "Jesus!")), /*#__PURE__*/
    React.createElement("span", { className: "home-verse__cite" }, PassageRef ? /*#__PURE__*/React.createElement(PassageRef, { refs: "John 5:39" }) : "John 5:39")
    ), /*#__PURE__*/
    React.createElement("div", { className: "home-screen__weave", "aria-hidden": "true" }, /*#__PURE__*/
    React.createElement("svg", { viewBox: "0 0 700 28", xmlns: "http://www.w3.org/2000/svg", preserveAspectRatio: "none" }, /*#__PURE__*/
    React.createElement("path", { d: "M0 7  Q175 3  350 7  Q525 11 700 7", stroke: "#b5894a", strokeWidth: "1.8", fill: "none", strokeLinecap: "round", opacity: "0.65" }), /*#__PURE__*/
    React.createElement("path", { d: "M0 14 Q175 10 350 14 Q525 18 700 14", stroke: "#a4423a", strokeWidth: "1.8", fill: "none", strokeLinecap: "round", opacity: "0.55" }), /*#__PURE__*/
    React.createElement("path", { d: "M0 21 Q175 17 350 21 Q525 25 700 21", stroke: "#3e6792", strokeWidth: "1.8", fill: "none", strokeLinecap: "round", opacity: "0.55" })
    )
    )
    ),

    lastSession && onContinue ? /*#__PURE__*/
    React.createElement("button", { className: "home-continue", onClick: () => onContinue(lastSession.id) }, /*#__PURE__*/
    React.createElement("span", { className: "home-continue__icon", "aria-hidden": "true" }, "\u25B6"), /*#__PURE__*/
    React.createElement("span", { className: "home-continue__body" }, /*#__PURE__*/
    React.createElement("span", { className: "home-continue__label" }, "Continue where you left off"), /*#__PURE__*/
    React.createElement("span", { className: "home-continue__sub" },
    'S' + String(lastSession.id).padStart(2, '0') + ' · ' + (lastSession.book || '') + ' ' + (lastSession.chapter || '') + (lastSession.topic ? ' — ' + lastSession.topic : '')
    )
    ), /*#__PURE__*/
    React.createElement("span", { className: "home-continue__cta" }, "resume \u2192")
    ) :
    null, /*#__PURE__*/

    React.createElement("div", { className: "home-screen__layout" }, /*#__PURE__*/

    React.createElement("button", { className: "home-card home-card--intro-hero", onClick: () => onNavigate('intro') }, /*#__PURE__*/
    React.createElement("span", { className: "home-card__start-tag" }, "START HERE"), /*#__PURE__*/
    React.createElement("span", { className: "home-card__glyph" }, "\u271D"), /*#__PURE__*/
    React.createElement("span", { className: "home-card__title" }, "01 \xB7 Introduction"), /*#__PURE__*/
    React.createElement("p", { className: "home-card__desc" }, "Session 01 \u2014 OT Overview \u2014 The 3 big threads; and why read the OT?"), /*#__PURE__*/
    React.createElement("span", { className: "home-card__cta" }, "read the foundations \u2192")
    ), /*#__PURE__*/


    React.createElement("button", { className: "home-card home-card--featured", onClick: () => onNavigate('recap') }, /*#__PURE__*/
    React.createElement("span", { className: "home-card__glyph" }, "\u21BB"), /*#__PURE__*/
    React.createElement("span", { className: "home-card__title" }, "Recap Mode"), /*#__PURE__*/
    React.createElement("p", { className: "home-card__desc" }, "Missed a session? Work through it step by step with guided questions, thread reveals, cloze tests, and suggested answers."), /*#__PURE__*/
    React.createElement("span", { className: "home-card__cta" }, "start recapping \u2192")
    ), /*#__PURE__*/


    React.createElement("div", { className: "home-screen__section-head" }, /*#__PURE__*/
    React.createElement("h2", { className: "home-screen__section-title" }, "Big Picture View"), /*#__PURE__*/
    React.createElement("p", { className: "home-screen__section-sub" }, "Head here after going through each session or to track a particular thread/NT fulfilment")
    ), /*#__PURE__*/


    React.createElement("div", { className: "home-screen__pair home-screen__pair--trio" }, /*#__PURE__*/
    React.createElement("button", { className: "home-card", onClick: () => onNavigate('bigpicture') }, /*#__PURE__*/
    React.createElement("span", { className: "home-card__glyph" }, "\u229E"), /*#__PURE__*/
    React.createElement("span", { className: "home-card__title" }, "Big Picture View"), /*#__PURE__*/
    React.createElement("p", { className: "home-card__desc" }, "At a glance: See the big threads and NT fulfilment across different sessions."), /*#__PURE__*/
    React.createElement(ViewIllus, { name: "bigpicture" }), /*#__PURE__*/
    React.createElement("span", { className: "home-card__cta" }, "explore the map \u2192")
    ), /*#__PURE__*/
    React.createElement("button", { className: "home-card", onClick: () => onNavigate('threadview', 'thread-view-section') }, /*#__PURE__*/
    React.createElement("span", { className: "home-card__glyph" }, "\u2756"), /*#__PURE__*/
    React.createElement("span", { className: "home-card__title" }, "Thread View"), /*#__PURE__*/
    React.createElement("p", { className: "home-card__desc" }, "Select a thread to explore across different sessions."), /*#__PURE__*/
    React.createElement(ViewIllus, { name: "thread" }), /*#__PURE__*/
    React.createElement("span", { className: "home-card__cta" }, "explore threads \u2192")
    ), /*#__PURE__*/
    React.createElement("button", { className: "home-card", onClick: () => onNavigate('matrix') }, /*#__PURE__*/
    React.createElement("span", { className: "home-card__glyph" }, "\u25A6"), /*#__PURE__*/
    React.createElement("span", { className: "home-card__title" }, "Matrix View"), /*#__PURE__*/
    React.createElement("p", { className: "home-card__desc" }, "Every theme against every session in one grid \u2014 read the whole story point-by-point."), /*#__PURE__*/
    React.createElement(ViewIllus, { name: "matrix" }), /*#__PURE__*/
    React.createElement("span", { className: "home-card__cta" }, "scan the grid \u2192")
    )
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "home-backup" }, /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--journal", onClick: () => onOpenJournal && onOpenJournal() }, /*#__PURE__*/
    React.createElement("span", { className: "rc-btn--journal__icon", "aria-hidden": "true" }, "\u270D"), "My Journal \u2014 Click here to manage what I have written"
    )
    ), /*#__PURE__*/

    React.createElement("footer", { className: "home-screen__foot" }, "\u201CThe purpose of the OT is to know Jesus.\u201D \u2014 John 5:39\u201340, 46", /*#__PURE__*/

    React.createElement("span", { className: "home-screen__esv" }, "Scripture quotations are from the ESV\xAE Bible (The Holy Bible, English Standard Version\xAE), \xA9 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.")
    )
    ));

}

/* ─── SubthemeReveal — click-to-reveal sub-thread box ────────────────── */
function SubthemeReveal({ title, hint, children }) {
  const [open, setOpen] = useStateA(false);
  return (/*#__PURE__*/
    React.createElement("div", { className: "overview-subtheme-reveal" + (open ? " is-open" : "") }, /*#__PURE__*/
    React.createElement("button", { className: "overview-subtheme-reveal__head", onClick: () => setOpen((v) => !v), "aria-expanded": open }, /*#__PURE__*/
    React.createElement("span", { className: "overview-subtheme-reveal__arrow" }, open ? "▾" : "▸"), /*#__PURE__*/
    React.createElement("span", { className: "overview-subtheme-reveal__title" }, title),
    !open ? /*#__PURE__*/React.createElement("span", { className: "overview-subtheme-reveal__cta" }, hint || "click to reveal") : null
    ),
    open ? /*#__PURE__*/React.createElement("div", { className: "overview-subtheme-reveal__body" }, children) : null
    ));

}

/* ─── IntroductionPage ───────────────────────────────────────────────── */

/* ─── IntroTensionPanel ─────────────────────────────────────────────── */
function IntroTensionPanel({ themes }) {
  const PassageRef = window.PassageRef;

  const examples = [
  {
    god: { text: "God is merciful and holy", ref: "Exodus 34:6-7" },
    man: { text: "Man is deeply sinful from the heart.", ref: "Genesis 8:21" }
  },
  {
    god: { text: "God made a very good world under His good rule", ref: "Genesis 1:31" },
    man: { text: "Man rebelled, grasping to be God himself", ref: "Genesis 3:1-7" }
  },
  {
    god: { text: "God binds Himself to His people by covenant", ref: "Genesis 15:17-18" },
    man: { text: "Israel breaks the covenant almost at once", ref: "Exodus 32:7-8" }
  }];


  const questions = [
  "How can a holy God dwell with a deeply sinful people?",
  "How can a holy, just God show mercy to a guilty people?"];


  return (/*#__PURE__*/
    React.createElement("section", { className: "intro-tension", "aria-label": "The tension that drives the story" }, /*#__PURE__*/
    React.createElement("div", { className: "intro-tension__header" }, /*#__PURE__*/
    React.createElement("p", { className: "intro-tension__eyebrow" }, "THE TENSION THAT DRIVES THE STORY"), /*#__PURE__*/
    React.createElement("h2", { className: "intro-tension__title" }, /*#__PURE__*/
    React.createElement("span", { style: { color: "var(--c-intention)" } }, "God’s Character & Intent"),
    " ⇌ ", /*#__PURE__*/
    React.createElement("span", { style: { color: "var(--c-reality)" } }, "Mankind’s Sinfulness & Limitations")
    ), /*#__PURE__*/
    React.createElement("p", { className: "intro-tension__desc" }, "Again and again, who God is and what He intends meets what we actually are. A few examples \u2014 then the questions they raise, and how Christ answers them.",
    " ", /*#__PURE__*/
    React.createElement("em", null, "(Open ", /*#__PURE__*/React.createElement("strong", null, "The Big Picture \u2192 Tension view"), " to see this for every session.)")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "intro-tension__examples" },
    examples.map((ex, i) => /*#__PURE__*/
    React.createElement("div", { key: i, className: "intro-tension__row" }, /*#__PURE__*/
    React.createElement("div", { className: "intro-tension__col intro-tension__col--god" }, /*#__PURE__*/
    React.createElement("span", { className: "intro-tension__col-tag" }, "GOD’S CHARACTER & INTENT"), /*#__PURE__*/
    React.createElement("p", { className: "intro-tension__col-text" }, ex.god.text),
    PassageRef ? /*#__PURE__*/React.createElement(PassageRef, { refs: ex.god.ref, className: "intro-tension__ref" }) : /*#__PURE__*/React.createElement("span", { className: "intro-tension__ref-plain" }, ex.god.ref)
    ), /*#__PURE__*/
    React.createElement("div", { className: "intro-tension__vs", "aria-hidden": "true" }, "⇌"), /*#__PURE__*/
    React.createElement("div", { className: "intro-tension__col intro-tension__col--man" }, /*#__PURE__*/
    React.createElement("span", { className: "intro-tension__col-tag" }, "MANKIND’S SINFULNESS & LIMITATIONS"), /*#__PURE__*/
    React.createElement("p", { className: "intro-tension__col-text" }, ex.man.text),
    PassageRef ? /*#__PURE__*/React.createElement(PassageRef, { refs: ex.man.ref, className: "intro-tension__ref" }) : /*#__PURE__*/React.createElement("span", { className: "intro-tension__ref-plain" }, ex.man.ref)
    )
    )
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "intro-tension__questions" }, /*#__PURE__*/
    React.createElement("span", { className: "intro-tension__q-label" }, "OVERARCHING TENSION QUESTIONS"),
    questions.map((q, i) => /*#__PURE__*/
    React.createElement("p", { key: i, className: "intro-tension__q-item" }, /*#__PURE__*/
    React.createElement("span", { className: "intro-tension__q-badge", "aria-hidden": "true" }, "?"), /*#__PURE__*/
    React.createElement("em", null, q)
    )
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "intro-tension__christ" }, /*#__PURE__*/
    React.createElement("div", { className: "intro-tension__christ-head" }, /*#__PURE__*/
    React.createElement("span", { className: "intro-tension__christ-glyph" }, "✝"), /*#__PURE__*/
    React.createElement("span", { className: "intro-tension__christ-label" }, "ANSWERED IN CHRIST")
    ), /*#__PURE__*/
    React.createElement("p", { className: "intro-tension__christ-text" },
    "God put forward Christ as the propitiation — by His blood — who paid the price of our sinfulness in full, so that God remains just and the justifier of the one who has faith in Jesus. ",
    PassageRef ? /*#__PURE__*/React.createElement(PassageRef, { refs: "Romans 3:23-26", className: "intro-tension__ref" }) : /*#__PURE__*/React.createElement("span", { className: "intro-tension__ref-plain" }, "Romans 3:23-26")
    )
    )
    ));

}

function IntroductionPage({ sessions, themes, onNavigate }) {
  const PassageRef = window.PassageRef;
  const CountUp = window.CountUp;
  const overviewSession = sessions.find((s) => s.id === 1);
  const studySessions = sessions.filter((s) => s.id !== 1);
  const themeCounts = useMemoA(() => {
    const map = {};
    for (const t of themes) map[t.id] = studySessions.filter((s) => (s[t.key] || '').trim().length > 0).length;
    return map;
  }, [studySessions, themes]);

  /* Linkify Bible references in the Introduction */
  useEffectA(() => {
    const t = setTimeout(() => tagRefsNow('.intro-bg'), 220);
    return () => clearTimeout(t);
  }, []);

  return (/*#__PURE__*/
    React.createElement("div", { className: "intro-bg" },
    window.HelpTourButton ? /*#__PURE__*/React.createElement(window.HelpTourButton, { tour: "intro" }) : null, /*#__PURE__*/

    React.createElement("header", { className: "hero" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("p", { className: "hero__eyebrow" }, /*#__PURE__*/
    React.createElement("span", { className: "dot" }), "OT OVERVIEW ", /*#__PURE__*/
    React.createElement("span", { className: "dot", style: { opacity: 0.2 } }), " SIMPLIFIED FOR RECAP ", /*#__PURE__*/React.createElement("span", { className: "dot", style: { opacity: 0.2 } }), " 12 SESSIONS THROUGH THE PENTATEUCH"
    ), /*#__PURE__*/
    React.createElement("h1", null, "OT Overview \u2014 God's Kingdom, Salvation and Promises ", /*#__PURE__*/React.createElement("em", null, "fulfilled in Jesus")), /*#__PURE__*/
    React.createElement("p", { className: "hero__sub" }, "Across twelve sessions from Genesis to Deuteronomy, three great threads \u2014 ", /*#__PURE__*/
    React.createElement("b", null, "God's Kingdom"), ", ", /*#__PURE__*/React.createElement("b", null, "God's Salvation"), ", and ", /*#__PURE__*/React.createElement("b", null, "God's Promises"), " \u2014 weave a single story that finds its fulfilment in ", /*#__PURE__*/React.createElement("b", null, "Jesus"), "."
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "hero__legend" }, /*#__PURE__*/
    React.createElement("h4", null, "The Threads"),
    (() => {
      const renderChip = (t) => /*#__PURE__*/
      React.createElement("span", { key: t.id, className: "theme-chip", style: { '--swatch': `var(--c-${t.id})` } }, /*#__PURE__*/
      React.createElement("span", { className: "theme-chip__sw" }), /*#__PURE__*/
      React.createElement("span", { className: "theme-chip__name" }, t.label), /*#__PURE__*/
      React.createElement("span", { className: "theme-chip__count" }, /*#__PURE__*/React.createElement(CountUp, { to: themeCounts[t.id] || 0 }), "/", studySessions.length)
      );

      const pick = (ids) => themes.filter((t) => ids.includes(t.id));
      return (/*#__PURE__*/
        React.createElement(React.Fragment, null, /*#__PURE__*/
        React.createElement("div", { className: "legend-group" }, /*#__PURE__*/
        React.createElement("span", { className: "legend-group__label" }, "Three great threads"), /*#__PURE__*/
        React.createElement("div", { className: "theme-chips" }, pick(['kingdom', 'salvation', 'promises']).map(renderChip))
        ), /*#__PURE__*/
        React.createElement("div", { className: "legend-group" }, /*#__PURE__*/
        React.createElement("span", { className: "legend-group__label" }, "The tension"), /*#__PURE__*/
        React.createElement("div", { className: "theme-chips" }, pick(['intention', 'reality']).map(renderChip))
        ), /*#__PURE__*/
        React.createElement("div", { className: "legend-group" }, /*#__PURE__*/
        React.createElement("span", { className: "legend-group__label" }, "Answered in Christ"), /*#__PURE__*/
        React.createElement("div", { className: "theme-chips" }, pick(['nt']).map(renderChip))
        )
        ));

    })()
    )
    ), /*#__PURE__*/


    React.createElement("section", { className: "christ-anchor", "aria-label": "Reading the Old Testament through Christ" }, /*#__PURE__*/
    React.createElement("div", { className: "christ-anchor__rail", "aria-hidden": "true" }), /*#__PURE__*/
    React.createElement("div", { className: "christ-anchor__inner" }, /*#__PURE__*/
    React.createElement("div", { className: "christ-anchor__eyebrow" }, /*#__PURE__*/
    React.createElement("span", { className: "christ-anchor__glyph" }, "\u271D"), "THE LENS \xB7 ASK OF EVERY PASSAGE"
    ), /*#__PURE__*/
    React.createElement("h2", { className: "christ-anchor__q" }, "What does this tell me ", /*#__PURE__*/React.createElement("em", null, "about Jesus?")), /*#__PURE__*/
    React.createElement("blockquote", { className: "christ-anchor__quote" }, /*#__PURE__*/
    React.createElement("span", { className: "christ-anchor__quote-mark", "aria-hidden": "true" }, "\u201C"), "You search the Scriptures because you think that in them you have eternal life; and it is they that bear witness about me.", /*#__PURE__*/

    React.createElement("cite", null, "\u2014 John 5:39")
    ), /*#__PURE__*/
    React.createElement("p", { className: "christ-anchor__note" }, "Every session below is read with this question in view. Watch for the",
    ' ', /*#__PURE__*/
    React.createElement("span", { className: "christ-anchor__nt-pill" }, /*#__PURE__*/React.createElement("span", { className: "christ-anchor__nt-glyph" }, "\u271D"), " NT Fulfilment"), ' ', "panels \u2014 they trace how each passage bears witness about Him."

    )
    )
    ),


    overviewSession ? /*#__PURE__*/
    React.createElement("section", { className: "overview-intro", "aria-label": "Session 01 \xB7 OT Overview" }, /*#__PURE__*/
    React.createElement("header", { className: "overview-intro__head" }, /*#__PURE__*/
    React.createElement("div", { className: "overview-intro__meta" }, /*#__PURE__*/
    React.createElement("span", { className: "overview-intro__badge" }, "SESSION 01 \xB7 OVERVIEW"), /*#__PURE__*/
    React.createElement("span", { className: "overview-intro__topic" }, "\u201CWhy OT?\u201D")
    )
    ), /*#__PURE__*/
    React.createElement("blockquote", { className: "overview-intro__thesis" }, /*#__PURE__*/
    React.createElement("span", { className: "overview-intro__qmark", "aria-hidden": "true" }, "\u201C"),
    overviewSession.mainPoint, /*#__PURE__*/
    React.createElement("span", { className: "overview-intro__qmark overview-intro__qmark--end", "aria-hidden": "true" }, "\u201D")
    ), /*#__PURE__*/
    React.createElement("p", { className: "overview-intro__lede" }, "Three threads woven through every page of the Pentateuch \u2014 what Sessions 2\u201312 are about."

    ), /*#__PURE__*/
    React.createElement("div", { className: "overview-intro__threads" },
    ['kingdom', 'salvation', 'promises'].map((tid) => {
      const t = themes.find((th) => th.id === tid);
      const ov = (window.OT_OVERVIEW || {})[tid] || {};
      const ovDesc = ov.desc || '';
      const ovSub = ov.subthread || '';
      const subTitle = tid === 'salvation' ?
      "Sub-thread: God’s pattern of saving His people through one Man" :
      tid === 'promises' ?
      "Sub-thread: God’s Promises revealed through His covenants" :
      null;
      return (/*#__PURE__*/
        React.createElement("article", { key: t.id, className: "overview-thread",
          style: { '--theme-color': `var(--c-${t.id})`, '--theme-soft': `var(--c-${t.id}-soft)` } }, /*#__PURE__*/
        React.createElement("span", { className: "overview-thread__watermark", "aria-hidden": "true" }, t.glyph), /*#__PURE__*/
        React.createElement("div", { className: "overview-thread__head" }, /*#__PURE__*/
        React.createElement("span", { className: "overview-thread__glyph" }, t.glyph), /*#__PURE__*/
        React.createElement("span", { className: "overview-thread__label" }, t.label)
        ),
        ovDesc ? /*#__PURE__*/React.createElement("p", { className: "overview-thread__desc" }, ovDesc) : null,
        ovSub && subTitle ? /*#__PURE__*/
        React.createElement(SubthemeReveal, { title: subTitle }, /*#__PURE__*/React.createElement("p", null, ovSub)) :
        ovSub ? /*#__PURE__*/
        React.createElement("p", { className: "overview-thread__subdesc" }, ovSub) :
        null, /*#__PURE__*/
        React.createElement("div", { className: "overview-thread__refs-wrap" }, /*#__PURE__*/
        React.createElement(SubthemeReveal, { title: "PASSAGES", hint: "click to reveal" },
        PassageRef ? /*#__PURE__*/React.createElement(PassageRef, { refs: overviewSession[t.key], className: "overview-thread__reflinks" }) : null
        )
        )
        ));

    })
    ), /*#__PURE__*/
    React.createElement("footer", { className: "overview-intro__foot" }, /*#__PURE__*/
    React.createElement("span", { className: "overview-intro__arrow", "aria-hidden": "true" }, "\u2193"), /*#__PURE__*/
    React.createElement("span", null, "Sessions 02\u201311 trace these threads from ", /*#__PURE__*/React.createElement("b", null, "Genesis"), " to ", /*#__PURE__*/React.createElement("b", null, "Deuteronomy"), ". Remember to ask of every passage \u2014 ", /*#__PURE__*/React.createElement("em", null, "what does this tell me about Jesus?"))
    )
    ) :
    null, /*#__PURE__*/

    window.ThreadDivider ? /*#__PURE__*/React.createElement(window.ThreadDivider, null) : null, /*#__PURE__*/

    React.createElement(IntroTensionPanel, { themes: themes }), /*#__PURE__*/

    window.ThreadDivider ? /*#__PURE__*/React.createElement(window.ThreadDivider, null) : null, /*#__PURE__*/

    React.createElement("div", { className: "intro-nav-section" }, /*#__PURE__*/
    React.createElement("div", { className: "intro-nav-block" }, /*#__PURE__*/
    React.createElement("h2", { className: "intro-nav-block__heading" }, "\u21BB Recap View"), /*#__PURE__*/
    React.createElement(ViewIllus, { name: "recap" }), /*#__PURE__*/
    React.createElement("p", { className: "intro-nav-block__desc" }, "Missed a session, or want it in detail? Each session explored step by step \u2014 guided questions and prayers."), /*#__PURE__*/
    React.createElement("button", { className: "intro-nav-btn", onClick: () => onNavigate('recap') }, "Go to Recap Mode \u2192")
    ), /*#__PURE__*/
    React.createElement("div", { className: "intro-nav-block" }, /*#__PURE__*/
    React.createElement("h2", { className: "intro-nav-block__heading" }, "\u2586 Big Picture View"), /*#__PURE__*/
    React.createElement(ViewIllus, { name: "bigpicture" }), /*#__PURE__*/
    React.createElement("p", { className: "intro-nav-block__desc" }, "Best after you've been through the sessions \u2014 a subway map of how every session and theme connects."), /*#__PURE__*/
    React.createElement("button", { className: "intro-nav-btn", onClick: () => onNavigate('bigpicture') }, "Go to Big Picture \u2192")
    ), /*#__PURE__*/
    React.createElement("div", { className: "intro-nav-block" }, /*#__PURE__*/
    React.createElement("h2", { className: "intro-nav-block__heading" }, "\u2756 Thread View"), /*#__PURE__*/
    React.createElement(ViewIllus, { name: "thread" }), /*#__PURE__*/
    React.createElement("p", { className: "intro-nav-block__desc" }, "Follow one thread \u2014 like Salvation \u2014 across every session from Genesis to Deuteronomy."), /*#__PURE__*/
    React.createElement("button", { className: "intro-nav-btn", onClick: () => { try { window.__OT_THREAD = 'salvation'; } catch (e) {} onNavigate('threadview', 'thread-view-section'); } }, "Go to Thread View \u2192")
    ), /*#__PURE__*/
    React.createElement("div", { className: "intro-nav-block" }, /*#__PURE__*/
    React.createElement("h2", { className: "intro-nav-block__heading" }, "\u25A6 Matrix View"), /*#__PURE__*/
    React.createElement(ViewIllus, { name: "matrix" }), /*#__PURE__*/
    React.createElement("p", { className: "intro-nav-block__desc" }, "Every theme against every session in one grid \u2014 read the whole story point by point."), /*#__PURE__*/
    React.createElement("button", { className: "intro-nav-btn", onClick: () => onNavigate('matrix') }, "Go to Matrix View \u2192")
    )
    )
    ));

}

/* ─── BigPictureView ─────────────────────────────────────────────────── */
function BigPictureView({ sessions, themes, embedded }) {
  const studySessions = useMemoA(() => sessions.filter((s) => s.id !== 1 && !isReviewSession(s)), [sessions]);
  const [upToId, setUpToId] = useStateA(() => {const ss = sessions.filter((s) => s.id !== 1 && !isReviewSession(s));return ss.length ? ss[ss.length - 1].id : null;});
  const [search, setSearch] = useStateA('');
  const [activeTheme, setActiveTheme] = useStateA(null);
  const [pinnedTheme, setPinnedTheme] = useStateA(null);
  const [boxW, setBoxW] = useStateA(118);
  const [fontScale, setFontScale] = useStateA(1);
  const [showTension, setShowTension] = useStateA(false);
  const BIGPIC_ROWS = [
  { id: 'kingdom', label: "God's Kingdom" },
  { id: 'salvation', label: "God's Salvation" },
  { id: 'promises', label: "God's Promises" },
  { id: 'nt', label: 'NT Fulfilment' },
  { id: 'mainPoint', label: 'Main Point' }];
  const [visibleRows, setVisibleRows] = useStateA(() => ({ kingdom: true, salvation: true, promises: true, nt: true, mainPoint: true }));
  /* Thread rows filtered by the row checkboxes; tension themes appended on
     reveal. "Main Point" toggles the main-point ribbon at the foot of the map. */
  const shownThemes = useMemoA(() => {
    const base = themes.filter((t) => ['kingdom', 'salvation', 'promises', 'nt'].includes(t.id)).filter((t) => visibleRows[t.id] !== false);
    const tension = themes.filter((t) => ['intention', 'reality'].includes(t.id));
    return showTension ? base.concat(tension) : base;
  }, [themes, showTension, visibleRows]);
  const SubwayMap = window.SubwayMap;
  const SearchBox = window.SearchBox;
  const searchMatches = window.searchMatches;

  const filteredBySession = useMemoA(
    () => upToId ? studySessions.filter((s) => s.id <= upToId) : [],
    [studySessions, upToId]
  );
  const searchMatchIds = useMemoA(() => {
    if (!search || !searchMatches) return null;
    return new Set(filteredBySession.filter((s) => searchMatches(s, search)).map((s) => s.id));
  }, [filteredBySession, search]);
  const displaySessions = useMemoA(
    () => searchMatchIds ? filteredBySession.filter((s) => searchMatchIds.has(s.id)) : filteredBySession,
    [filteredBySession, searchMatchIds]
  );

  /* Linkify Bible references once the subway map / content is shown */
  useEffectA(() => {
    if (!upToId) return;
    const t = setTimeout(() => tagRefsNow('.bigpic-page'), 220);
    return () => clearTimeout(t);
  }, [upToId, displaySessions, search, boxW]);

  return (/*#__PURE__*/
    React.createElement("div", { className: "bigpic-page" + (embedded ? " bigpic-page--embedded" : "") },
    !embedded && window.HelpTourButton ? /*#__PURE__*/React.createElement(window.HelpTourButton, { tour: "bigpicture" }) : null, /*#__PURE__*/
    !embedded ? /*#__PURE__*/React.createElement(PageHero, { img: "assets/img/ot-overview.webp", eyebrow: "OT OVERVIEW · BIG PICTURE", title: "The Big Picture", sub: "Every session and theme, woven together across the Pentateuch." }) : null, /*#__PURE__*/
    !embedded ? /*#__PURE__*/
    React.createElement("div", { className: "bigpic-selector" }, /*#__PURE__*/
    React.createElement("label", { className: "bigpic-selector__label", htmlFor: "bigpic-upto" }, "Display the big picture overview until session:"

    ), /*#__PURE__*/
    React.createElement("select", { id: "bigpic-upto", className: "bigpic-selector__select",
      value: upToId || '', onChange: (e) => setUpToId(e.target.value ? parseInt(e.target.value, 10) : null) }, /*#__PURE__*/
    React.createElement("option", { value: "" }, "\u2014 select a session \u2014"),
    studySessions.map((s) => /*#__PURE__*/
    React.createElement("option", { key: s.id, value: s.id }, "Session ", String(s.id).padStart(2, '0'), " \u2014 ", s.topic.split('\n')[0])
    )
    ), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "bigpic-selector__all",
      onClick: () => setUpToId(studySessions.length ? studySessions[studySessions.length - 1].id : null) }, "Display all sessions"

    ), /*#__PURE__*/
    React.createElement("p", { className: "bigpic-selector__hint" }, "(Strongly recommended to go through a study/recap first before seeing where it fits into the overview)")
    ) :
    null, /*#__PURE__*/


    React.createElement("div", { className: "bigpic-legend" }, /*#__PURE__*/
    React.createElement("div", { className: "bigpic-legend__row" }, /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__grid-icon", "aria-hidden": "true" }, "\u229E"), /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__text" }, "Each ", /*#__PURE__*/
    React.createElement("strong", null, "column"), " is ONE session \u2014 each ", /*#__PURE__*/React.createElement("strong", null, "row"), " addresses a specific thread."
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "bigpic-legend__row" }, /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__dots-demo", "aria-label": "Example of big bold dots" }, /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__dot bigpic-legend__dot--primary", style: { "--dc": "oklch(0.52 0.13 75)" } }), /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__dot bigpic-legend__dot--primary", style: { "--dc": "oklch(0.50 0.18 25)" } }), /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__dot bigpic-legend__dot--primary", style: { "--dc": "oklch(0.45 0.14 250)" } })
    ), /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__text" }, "The ", /*#__PURE__*/
    React.createElement("strong", null, "big, bold dots"), " (like those shown) represent the ", /*#__PURE__*/React.createElement("strong", null, "main thread(s)"), " of that particular session."
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "bigpic-legend__row" }, /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__dots-demo", "aria-label": "Example of smaller hollow dots" }, /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__dot", style: { "--dc": "oklch(0.52 0.13 75)" } }), /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__dot", style: { "--dc": "oklch(0.50 0.18 25)" } }), /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__dot", style: { "--dc": "oklch(0.45 0.14 250)" } })
    ), /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__text" }, "Smaller ", /*#__PURE__*/
    React.createElement("strong", null, "hollow dots"), " indicate the thread is present but not the main focus of that session."
    )
    )
    ),

    !upToId ? /*#__PURE__*/
    React.createElement("div", { className: "bigpic-placeholder" }, /*#__PURE__*/
    React.createElement("span", { className: "bigpic-placeholder__icon" }, "\u229E"), /*#__PURE__*/
    React.createElement("p", null, "Please ", /*#__PURE__*/React.createElement("strong", null, "SELECT a session above"), " to see the big picture in previous sessions.")
    ) : /*#__PURE__*/

    React.createElement(React.Fragment, null,
    SearchBox ? /*#__PURE__*/
    React.createElement("div", { className: "bigpic-toolbar" }, /*#__PURE__*/
    React.createElement(SearchBox, { value: search, onChange: setSearch,
      matchCount: searchMatchIds ? searchMatchIds.size : filteredBySession.length,
      total: filteredBySession.length })
    ) :
    null, /*#__PURE__*/
    React.createElement("div", { className: "matrix-sizer" }, /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__label" }, "Box width"), /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__end" }, "Compact"), /*#__PURE__*/
    React.createElement("input", { className: "matrix-sizer__range", type: "range", min: "80", max: "240", step: "10",
      value: boxW, onChange: (e) => setBoxW(parseInt(e.target.value, 10)),
      "aria-label": "Adjust subway map box width" }), /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__end" }, "Wide"), /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__hint" }, "Compact fits more on screen \xB7 Wide is easier to read")
    ), /*#__PURE__*/
    React.createElement("div", { className: "matrix-sizer" }, /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__label" }, "Text size"), /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__end", style: { fontSize: '11px' } }, "A"), /*#__PURE__*/
    React.createElement("input", { className: "matrix-sizer__range", type: "range", min: "80", max: "170", step: "5",
      value: Math.round(fontScale * 100), onChange: (e) => setFontScale(parseInt(e.target.value, 10) / 100),
      "aria-label": "Adjust subway map text size" }), /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__end", style: { fontSize: '19px' } }, "A"), /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__hint" }, "Scales all text in the map")
    ), /*#__PURE__*/
    React.createElement("div", { className: "matrix-rowfilter" }, /*#__PURE__*/
    React.createElement("span", { className: "matrix-rowfilter__label" }, "Show rows:"),
    BIGPIC_ROWS.map((r) => /*#__PURE__*/
    React.createElement("label", { key: r.id, className: "matrix-rowfilter__opt" }, /*#__PURE__*/
    React.createElement("input", { type: "checkbox", checked: visibleRows[r.id] !== false,
      onChange: (e) => setVisibleRows((v) => ({ ...v, [r.id]: e.target.checked })) }),
    r.label
    )
    ),
    React.createElement("span", { className: "matrix-sizer__hint" }, "Main Point toggles the row at the foot of the map")
    ),
    SubwayMap ? /*#__PURE__*/
    React.createElement(SubwayMap, { sessions: displaySessions, themes: shownThemes,
      selectedSession: null, onSelectSession: () => {},
      activeTheme: activeTheme, pinnedTheme: pinnedTheme,
      colW: boxW,
      fontScale: fontScale,
      showMainPoint: visibleRows.mainPoint !== false,
      onHoverTheme: setActiveTheme,
      onPinTheme: (id) => setPinnedTheme(pinnedTheme === id ? null : id),
      labelFooter: /*#__PURE__*/React.createElement(TensionRevealToggle, { open: showTension, onToggle: () => setShowTension((v) => !v) }) }) :
    null
    )

    ));

}
window.BigPictureView = BigPictureView;

/* ─── ThreadViewPage ─────────────────────────────────────────────────── */
function ThreadViewPage({ sessions, themes }) {
  const [activeThread, setActiveThread] = useStateA(function () { try { var t = window.__OT_THREAD; if (t) { delete window.__OT_THREAD; return t; } } catch (e) {} return 'kingdom'; });
  const ThreadStory = window.ThreadStory;
  const TensionTriad = window.TensionTriad;
  const TABS = [
  { id: 'kingdom', label: "God's Kingdom" },
  { id: 'salvation', label: "God's Salvation" },
  { id: 'promises', label: "God's Promises" },
  { id: 'tension', label: "Tension & NT Fulfilment" }];

  const themeObj = themes.find((t) => t.id === activeThread);
  /* The Pentateuch-in-Review wrap-up is excluded from the thread overview. */
  const viewSessions = useMemoA(() => sessions.filter((s) => !isReviewSession(s)), [sessions]);

  /* Linkify Bible references when a thread tab renders / changes */
  useEffectA(() => {
    const t = setTimeout(() => tagRefsNow('.thread-view-page'), 220);
    return () => clearTimeout(t);
  }, [activeThread, sessions]);

  return (/*#__PURE__*/
    React.createElement("div", { className: "thread-view-page" },
    window.HelpTourButton ? /*#__PURE__*/React.createElement(window.HelpTourButton, { tour: "threadview", label: "Need help? Tour the Thread View" }) : null, /*#__PURE__*/
    React.createElement("div", { className: "thread-toggle-bar" },
    TABS.map((tab) => /*#__PURE__*/
    React.createElement("button", { key: tab.id,
      className: "thread-toggle-btn" + (activeThread === tab.id ? " is-active" : ""),
      style: tab.id !== 'tension' ? { '--tab-color': `var(--c-${tab.id})` } : {},
      onClick: () => setActiveThread(tab.id) },
    tab.label
    )
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "thread-view-page__content" },
    activeThread === 'tension' ? /*#__PURE__*/
    React.createElement("div", { className: "tension-view" }, /*#__PURE__*/
    React.createElement("p", { className: "tension-view__lede" }, /*#__PURE__*/
    React.createElement("b", null, "God's intention & character"), " vs ", /*#__PURE__*/React.createElement("b", null, "Mankind's sinfulness & limitations"), " \u2014 and how Christ resolves each tension. Click any session below to explore."
    ),
    viewSessions.map((s) => {
      const intV = (s.intention || '').trim();
      const realV = (s.reality || '').trim();
      const ntV = (s.ntPoint || '').trim();
      if (!intV && !realV && !ntV) return null;
      return (/*#__PURE__*/
        React.createElement("div", { key: s.id, className: "tension-view__session" }, /*#__PURE__*/
        React.createElement("h3", { className: "tension-view__session-head" }, "Session ",
        String(s.id).padStart(2, '0'), " \xB7 ", s.topic.split('\n')[0]
        ),
        TensionTriad ? /*#__PURE__*/React.createElement(TensionTriad, { session: s, themes: themes, onPinTheme: null }) : null
        ));

    })
    ) :
    themeObj && ThreadStory ? /*#__PURE__*/
    React.createElement(ThreadStory, { theme: themeObj, sessions: viewSessions, onSelectSession: () => {} }) :
    null
    )
    ));

}

/* ─── Matrix grid (themes × sessions) ───────────────── */
function Matrix({ sessions, themes, onSelectSession, onPinTheme, activeTheme, pinnedTheme, selectedSession, colW, fontScale, labelFooter }) {
  const shortPassage = window.shortPassage;
  const isPrimary = window.isPrimary;
  const truncate = window.truncate;
  const focus = pinnedTheme || activeTheme;
  return (/*#__PURE__*/
    React.createElement("div", { className: "matrix" }, /*#__PURE__*/
    React.createElement("div", { className: "matrix__inner", style: { '--sess-cols': sessions.length, '--mcol-w': (colW || 180) + 'px', '--matrix-font-scale': fontScale || 1 } }, /*#__PURE__*/
    React.createElement("div", { className: "mhead mhead--corner" }, "Theme \u2193 \xA0\xB7\xA0 Session \u2192"),
    sessions.map((s) => /*#__PURE__*/
    React.createElement("div", {
      key: `h-${s.id}`,
      className: "mhead session",
      onClick: () => onSelectSession && onSelectSession(s.id),
      style: selectedSession === s.id ? { background: 'var(--bg-warm)' } : null },

    String(s.id).padStart(2, '0'), " \xB7 ", shortPassage(s), /*#__PURE__*/
    React.createElement("b", null, (s.topic || '').split('\n')[0])
    )
    ),
    themes.map((t) => /*#__PURE__*/
    React.createElement(React.Fragment, { key: t.id }, /*#__PURE__*/
    React.createElement("div", {
      className: "mlabel",
      style: {
        '--theme-color': `var(--c-${t.id})`,
        opacity: focus && focus !== t.id ? 0.4 : 1,
        background: focus === t.id ? `var(--c-${t.id}-soft)` : 'var(--bg-card-2)'
      },
      onClick: () => onPinTheme && onPinTheme(pinnedTheme === t.id ? null : t.id) }, /*#__PURE__*/

    React.createElement("span", { className: "mlabel__glyph" }, t.glyph),
    t.label
    ),
    sessions.map((s) => {
      const v = s[t.key] || '';
      const has = v.trim().length > 0;
      const prim = has && isPrimary(s, t);
      return (/*#__PURE__*/
        React.createElement("div", {
          key: `c-${t.id}-${s.id}`,
          className: `mcell ${has ? '' : 'is-empty'} ${prim ? 'is-primary' : ''}`,
          style: {
            '--theme-color': `var(--c-${t.id})`,
            '--theme-soft': `var(--c-${t.id}-soft)`,
            opacity: focus && focus !== t.id ? 0.35 : 1
          },
          onClick: () => {if (onPinTheme && has) onPinTheme(t.id);} },

        t.id === 'nt' && s.ntPassage ? /*#__PURE__*/
        React.createElement("div", { className: "mcell__ntref" }, window.linkifyRefs ? window.linkifyRefs(s.ntPassage) : s.ntPassage) :
        null,
        has ? truncate(v, 200) : /*#__PURE__*/React.createElement("span", null, "\u2014")
        ));

    })
    )
    ),
    labelFooter ? /*#__PURE__*/React.createElement("div", { className: "matrix__foot" }, labelFooter) : null
    )
    ));

}

/* ─── MatrixViewPage ───────────────────────────── */
function MatrixViewPage({ sessions, themes }) {
  const studySessions = useMemoA(() => sessions.filter((s) => s.id !== 1 && !isReviewSession(s)), [sessions]);
  const [upToId, setUpToId] = useStateA(() => {const ss = sessions.filter((s) => s.id !== 1 && !isReviewSession(s));return ss.length ? ss[ss.length - 1].id : null;});
  const [activeTheme, setActiveTheme] = useStateA(null);
  const [pinnedTheme, setPinnedTheme] = useStateA(null);
  const [colW, setColW] = useStateA(180);
  const [fontScale, setFontScale] = useStateA(1);
  const [showTension, setShowTension] = useStateA(false);
  const MATRIX_ROWS = [
  { id: 'kingdom', label: "God's Kingdom" },
  { id: 'salvation', label: "God's Salvation" },
  { id: 'promises', label: "God's Promises" },
  { id: 'nt', label: 'NT Fulfilment' },
  { id: 'mainPoint', label: 'Main Point' }];
  const [visibleRows, setVisibleRows] = useStateA(() => ({ kingdom: true, salvation: true, promises: true, nt: true, mainPoint: true }));
  /* Rows: the three threads, NT Fulfilment, then Main Point (rendered like the
     other cells) — filtered by the row checkboxes; the two tension themes are
     appended on demand via the reveal pill. */
  const shownThemes = useMemoA(() => {
    const mainPointTheme = { id: 'mainPoint', key: 'mainPoint', label: 'Main Point', short: 'Main Point', glyph: '◆' };
    const base = themes.filter((t) => ['kingdom', 'salvation', 'promises', 'nt'].includes(t.id)).concat([mainPointTheme]);
    const filtered = base.filter((t) => visibleRows[t.id] !== false);
    const tension = themes.filter((t) => ['intention', 'reality'].includes(t.id));
    return showTension ? filtered.concat(tension) : filtered;
  }, [themes, showTension, visibleRows]);

  const displaySessions = useMemoA(
    () => upToId ? studySessions.filter((s) => s.id <= upToId) : [],
    [studySessions, upToId]
  );

  /* Linkify Bible references (incl. NT Fulfilment) once the grid is shown */
  useEffectA(() => {
    if (!upToId) return;
    const t = setTimeout(() => tagRefsNow('.matrix'), 220);
    return () => clearTimeout(t);
  }, [upToId, displaySessions, colW]);

  return (/*#__PURE__*/
    React.createElement("div", { className: "bigpic-page matrix-page" },
    window.HelpTourButton ? /*#__PURE__*/React.createElement(window.HelpTourButton, { tour: "matrix" }) : null, /*#__PURE__*/
    React.createElement(PageHero, { img: "assets/img/gen1.webp", eyebrow: "OT OVERVIEW · MATRIX", title: "The Matrix", sub: "Every theme against every session, point by point in one grid." }), /*#__PURE__*/
    React.createElement("div", { className: "bigpic-selector" }, /*#__PURE__*/
    React.createElement("label", { className: "bigpic-selector__label", htmlFor: "matrix-upto" }, "Show the matrix grid until session:"

    ), /*#__PURE__*/
    React.createElement("select", { id: "matrix-upto", className: "bigpic-selector__select",
      value: upToId || '', onChange: (e) => setUpToId(e.target.value ? parseInt(e.target.value, 10) : null) }, /*#__PURE__*/
    React.createElement("option", { value: "" }, "\u2014 select a session \u2014"),
    studySessions.map((s) => /*#__PURE__*/
    React.createElement("option", { key: s.id, value: s.id }, "Session ", String(s.id).padStart(2, '0'), " \u2014 ", s.topic.split('\n')[0])
    )
    ), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "bigpic-selector__all",
      onClick: () => setUpToId(studySessions.length ? studySessions[studySessions.length - 1].id : null) }, "Display all sessions"

    ), /*#__PURE__*/
    React.createElement("p", { className: "bigpic-selector__hint" }, "(Strongly recommended to go through a study/recap first before seeing the full grid)")
    ), /*#__PURE__*/

    React.createElement("div", { className: "bigpic-legend" }, /*#__PURE__*/
    React.createElement("div", { className: "bigpic-legend__row" }, /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__grid-icon", "aria-hidden": "true" }, "\u25A6"), /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__text" }, "Each ", /*#__PURE__*/
    React.createElement("strong", null, "column"), " is ONE session \u2014 each ", /*#__PURE__*/React.createElement("strong", null, "row"), " is one thread. Every cell shows that session's point for that thread."
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "bigpic-legend__row" }, /*#__PURE__*/
    React.createElement("span", { className: "matrix-legend__star", "aria-hidden": "true" }, "\u2605"), /*#__PURE__*/
    React.createElement("span", { className: "bigpic-legend__text" }, "A ", /*#__PURE__*/
    React.createElement("strong", null, "star"), " marks the ", /*#__PURE__*/React.createElement("strong", null, "main focus"), " of that session. ", /*#__PURE__*/React.createElement("strong", null, "Click any theme name"), " (or a filled cell) to highlight that thread across all sessions."
    )
    )
    ),

    !upToId ? /*#__PURE__*/
    React.createElement("div", { className: "bigpic-placeholder" }, /*#__PURE__*/
    React.createElement("span", { className: "bigpic-placeholder__icon" }, "\u25A6"), /*#__PURE__*/
    React.createElement("p", null, "Please ", /*#__PURE__*/React.createElement("strong", null, "SELECT a session above"), " to see the thematic grid for the sessions covered so far.")
    ) : /*#__PURE__*/

    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", { className: "matrix-sizer" }, /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__label" }, "Box width"), /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__end" }, "Compact"), /*#__PURE__*/
    React.createElement("input", { className: "matrix-sizer__range", type: "range", min: "130", max: "320", step: "10",
      value: colW, onChange: (e) => setColW(parseInt(e.target.value, 10)),
      "aria-label": "Adjust matrix box width" }), /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__end" }, "Wide"), /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__hint" }, "First column stays pinned as you scroll \u2192")
    ), /*#__PURE__*/
    React.createElement("div", { className: "matrix-sizer" }, /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__label" }, "Text size"), /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__end", style: { fontSize: '11px' } }, "A"), /*#__PURE__*/
    React.createElement("input", { className: "matrix-sizer__range", type: "range", min: "80", max: "170", step: "5",
      value: Math.round(fontScale * 100), onChange: (e) => setFontScale(parseInt(e.target.value, 10) / 100),
      "aria-label": "Adjust matrix text size" }), /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__end", style: { fontSize: '19px' } }, "A"), /*#__PURE__*/
    React.createElement("span", { className: "matrix-sizer__hint" }, "Scales all text in the grid")
    ), /*#__PURE__*/
    React.createElement("div", { className: "matrix-rowfilter" }, /*#__PURE__*/
    React.createElement("span", { className: "matrix-rowfilter__label" }, "Show rows:"),
    MATRIX_ROWS.map((r) => /*#__PURE__*/
    React.createElement("label", { key: r.id, className: "matrix-rowfilter__opt" }, /*#__PURE__*/
    React.createElement("input", { type: "checkbox", checked: visibleRows[r.id] !== false,
      onChange: (e) => setVisibleRows((v) => ({ ...v, [r.id]: e.target.checked })) }),
    r.label
    )
    )
    ), /*#__PURE__*/
    React.createElement(Matrix, {
      sessions: displaySessions,
      themes: shownThemes,
      colW: colW,
      fontScale: fontScale,
      onSelectSession: null,
      onPinTheme: (id) => setPinnedTheme(pinnedTheme === id ? null : id),
      activeTheme: activeTheme,
      pinnedTheme: pinnedTheme,
      selectedSession: null,
      labelFooter: /*#__PURE__*/React.createElement(TensionRevealToggle, { open: showTension, onToggle: () => setShowTension((v) => !v) }) }
    )
    )

    ));

}

/* ─── AppRecap ───────────────────────────────────────────────────────── */
function BigPictureAndThreadPage({ sessions, themes, onNavigate }) {
  return (/*#__PURE__*/
    React.createElement("div", { className: "bigpic-and-thread-page" }, /*#__PURE__*/
    React.createElement("div", { id: "big-picture-section" }, /*#__PURE__*/
    React.createElement(BigPictureView, { sessions: sessions, themes: themes }), /*#__PURE__*/
    React.createElement("div", { className: "combined-recap-cta" }, /*#__PURE__*/
    React.createElement("p", { className: "combined-recap-cta__text" }, "Missed any of the sessions? Or want to visit them in detail?"), /*#__PURE__*/
    React.createElement("button", { className: "intro-nav-btn", onClick: () => onNavigate('recap') }, "Click here to go to Recap Mode \u2192"

    )
    )
    ), /*#__PURE__*/
    window.ThreadDivider ? /*#__PURE__*/React.createElement(window.ThreadDivider, null) : null, /*#__PURE__*/
    React.createElement("div", { id: "thread-view-section", className: "combined-section--thread" }, /*#__PURE__*/
    React.createElement(ThreadViewPage, { sessions: sessions, themes: themes }), /*#__PURE__*/
    React.createElement("div", { className: "combined-recap-cta" }, /*#__PURE__*/
    React.createElement("p", { className: "combined-recap-cta__text" }, "Missed any of the sessions? Or want to visit them in detail?"), /*#__PURE__*/
    React.createElement("button", { className: "intro-nav-btn", onClick: () => onNavigate('recap') }, "Click here to go to Recap Mode \u2192"

    )
    )
    )
    ));

}

function AppRecap() {
  const sessions = window.OT_SESSIONS;
  const themes = window.OT_THEMES;
  /* v28: read any deep link BEFORE first render — in v27 the hash-write
     effect ran first on mount and wiped the incoming hash. */
  const __h = (() => {
    try {
      const p = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
      return { v: p.get('view'), s: parseInt(p.get('s'), 10), m: p.get('m') };
    } catch (e) {return {};}
  })();
  const __valid = ['intro', 'bigpicture', 'threadview', 'matrix', 'recap'];
  /* Session 1 is the Introduction page — a recap deep link of s=1 redirects there. */
  const __initialView = __h.v === 'recap' && __h.s === 1 ?
  'intro' :
  __h.v && __valid.includes(__h.v) ? __h.v === 'threadview' ? 'bigpicture' : __h.v : 'home';
  const [currentView, setCurrentView] = useStateA(__initialView);
  const [tourOpen, setTourOpen] = useStateA(false);
  const [tourId, setTourId] = useStateA('overview');
  const [recapSession, setRecapSession] = useStateA(__h.v === 'recap' && __h.s >= 2 ? __h.s : null);
  const [recapMode, setRecapMode] = useStateA(
    __h.m === 'meditate' || __h.m === 'study' ? __h.m : window.getRecapMode ? window.getRecapMode() : 'meditate'
  );
  const [recapJournal, setRecapJournal] = useStateA(false);

  function navigateTo(dest, scrollId) {
    setRecapJournal(false);
    const view = dest === 'threadview' ? 'bigpicture' : dest;
    if (view !== 'recap') setRecapSession(null);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (scrollId) {
      const tryScroll = (n) => {
        const el = document.getElementById(scrollId);
        if (el) {el.scrollIntoView({ behavior: 'smooth' });} else
        if (n > 0) {setTimeout(() => tryScroll(n - 1), 160);}
      };
      setTimeout(() => tryScroll(6), 220);
    }
  }
  function goHome() {navigateTo('home');}

  /* Write current view to hash for deep-linking */
  useEffectA(() => {
    try {
      let h = currentView !== 'home' ? 'view=' + currentView : '';
      if (currentView === 'recap') {
        if (recapSession) h += '&s=' + recapSession;
        if (recapMode === 'meditate') h += '&m=meditate';
      }
      history.replaceState(null, '', h ? '#' + h : window.location.pathname + window.location.search);
    } catch (_) {}
  }, [currentView, recapSession, recapMode]);

  /* RefTagger for non-recap views */
  useEffectA(() => {
    if (currentView === 'recap') return;
    const t = setTimeout(() => tagRefsNow(), 280);
    return () => clearTimeout(t);
  }, [currentView]);

  useEffectA(() => {
    window.startOTTour = (id) => {setTourId(id || 'overview');setTourOpen(true);};
    return () => {try {delete window.startOTTour;} catch (_) {}};
  }, []);

  useEffectA(() => {
    let seen = false;
    try {seen = !!(window.localStorage && window.localStorage.getItem('OT_TOUR_SEEN_v5'));} catch (_) {seen = false;}
    if (!seen) {setTourId('overview');setTourOpen(true);}
  }, []);

  const SideNav = window.SideNav;
  const GuidedTour = window.GuidedTour;
  const RecapMode = window.RecapMode;

  const chrome = /*#__PURE__*/
  React.createElement(React.Fragment, null,
  SideNav ? /*#__PURE__*/React.createElement(SideNav, { currentView: currentView, onNavigate: navigateTo, recapOpen: currentView === 'recap' }) : null,
  GuidedTour ? /*#__PURE__*/
  React.createElement(GuidedTour, { open: tourOpen, tourId: tourId, onClose: () => setTourOpen(false),
    onNavigate: navigateTo }) :
  null
  );


  if (currentView === 'home') {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(HomeScreen, { sessions: sessions, themes: themes, onNavigate: navigateTo, onStartTour: () => {setTourId('overview');setTourOpen(true);}, onContinue: (sid) => {setRecapSession(sid);navigateTo('recap');}, onOpenJournal: () => {setRecapSession(null);navigateTo('recap');setRecapJournal(true);} }), chrome);
  }
  if (currentView === 'recap') {
    return /*#__PURE__*/React.createElement(React.Fragment, null, RecapMode ? /*#__PURE__*/React.createElement(RecapMode, { sessions: sessions, themes: themes, onExit: goHome, initialSession: recapSession, onSessionChange: setRecapSession, onGotoIntro: () => navigateTo('intro'), initialMode: recapMode, onModeChange: setRecapMode, initialJournalOpen: recapJournal }) : /*#__PURE__*/React.createElement("p", null, "Loading\u2026"), chrome);
  }

  const LABELS = { intro: 'Introduction', bigpicture: 'Big Picture & Thread View', matrix: 'Matrix View' };
  const backBar = /*#__PURE__*/
  React.createElement("div", { className: "home-back-bar" }, /*#__PURE__*/
  React.createElement("button", { className: "rc-btn rc-btn--ghost home-back-bar__btn", onClick: goHome }, "\u2190 home"), /*#__PURE__*/
  React.createElement("span", { className: "home-back-bar__crumb" }, "OT OVERVIEW \xB7 ", (LABELS[currentView] || '').toUpperCase())
  );


  if (currentView === 'intro') {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", { className: "shell" }, backBar, /*#__PURE__*/React.createElement(IntroductionPage, { sessions: sessions, themes: themes, onNavigate: navigateTo })), chrome);
  }
  if (currentView === 'bigpicture') {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", { className: "shell" }, backBar, /*#__PURE__*/React.createElement(BigPictureAndThreadPage, { sessions: sessions, themes: themes, onNavigate: navigateTo })), chrome);
  }
  if (currentView === 'matrix') {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", { className: "shell" }, backBar, /*#__PURE__*/React.createElement(MatrixViewPage, { sessions: sessions, themes: themes })), chrome);
  }
  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(AppRecap, null));