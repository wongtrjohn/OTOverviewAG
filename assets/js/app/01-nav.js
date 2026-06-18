/* Side navigation, search box, and guided tour for the Recap edition. */

const { useState: useStateN, useEffect: useEffectN, useRef: useRefN } = React;

/* ───────── SearchBox + searchMatches ───────── */

function SearchBox({ value, onChange, matchCount, total }) {
  return (/*#__PURE__*/
    React.createElement("div", { className: "searchbox" }, /*#__PURE__*/
    React.createElement("span", { className: "searchbox__icon", "aria-hidden": "true" }, "\u2315"), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      className: "searchbox__input",
      placeholder: "Search \u2014 try 'passover', 'high priest', 'covenant'\u2026",
      value: value,
      onChange: (e) => onChange(e.target.value) }
    ),
    value ? /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("span", { className: "searchbox__count" }, matchCount, "/", total), /*#__PURE__*/
    React.createElement("button", { className: "searchbox__clear", onClick: () => onChange(""), "aria-label": "Clear" }, "\xD7")
    ) :
    null
    ));

}

function searchMatches(s, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  const haystack = [
  s.book, s.chapter, s.topic, s.mainPoint, s.purpose,
  s.kingdom, s.salvation, s.promises, s.intention, s.reality,
  s.ntPoint, s.ntPassage, s.keyVerse, s.recapAnswer, s.divisions, s.character, s.sin].
  filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(needle);
}

/* ───────── SideNav ───────── */

function SideNav({ currentView, onNavigate, recapOpen }) {
  const [mobileOpen, setMobileOpen] = useStateN(false);
  const [hovered, setHovered] = useStateN(false);
  const isRecap = recapOpen || currentView === 'recap';

  function go(dest) {
    if (isRecap && dest !== 'home') return;
    if (onNavigate) onNavigate(dest);
    setMobileOpen(false);
    setHovered(false);
  }

  const navItems = [
  { id: 'home', glyph: '⌂', label: 'Home', sub: 'Mode chooser' },
  { id: 'intro', glyph: '✦', label: 'Introduction', sub: 'Session 01 · Foundations' },
  { id: 'recap', glyph: '↻', label: 'Recap Mode', sub: 'Guided session recap' },
  { id: 'bigpicture', glyph: '▆', label: 'The Big Picture', sub: 'Subway map' },
  { id: 'threadview', glyph: '❖', label: 'Thread View', sub: 'Follow a thread' },
  { id: 'matrix', glyph: '▦', label: 'Matrix View', sub: 'Themes × sessions grid' }];


  return (/*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("button", { className: "sidenav-fab", onClick: () => setMobileOpen(true), "aria-label": "Open section menu" }, /*#__PURE__*/
    React.createElement("span", { className: "sidenav-fab__icon" }, "\u2261"), /*#__PURE__*/
    React.createElement("span", { className: "sidenav-fab__txt" }, "Jump to")
    ),
    mobileOpen ? /*#__PURE__*/React.createElement("div", { className: "sidenav__scrim", onClick: () => setMobileOpen(false) }) : null, /*#__PURE__*/
    React.createElement("nav", {
      className: "sidenav" + (mobileOpen ? " is-mobile-open" : "") + (hovered ? " is-hovered" : ""),
      "aria-label": "Jump to section",
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false) }, /*#__PURE__*/

    React.createElement("div", { className: "sidenav__topline" }, /*#__PURE__*/
    React.createElement("span", { className: "sidenav__title" }, "Jump to"), /*#__PURE__*/
    React.createElement("button", { className: "sidenav__close", onClick: () => setMobileOpen(false), "aria-label": "Close menu" }, "\xD7")
    ),
    navItems.map((item) => {
      const isActive = currentView === item.id;
      const isDisabled = isRecap && item.id !== 'home';
      return (/*#__PURE__*/
        React.createElement("button", { key: item.id,
          className: "sidenav__item" + (isActive ? " is-active" : "") + (isDisabled ? " is-disabled" : ""),
          onClick: () => go(item.id),
          title: isDisabled ? "Exit Recap Mode to navigate" : item.label }, /*#__PURE__*/

        React.createElement("span", { className: "sidenav__glyph" }, item.glyph), /*#__PURE__*/
        React.createElement("span", { className: "sidenav__body" }, /*#__PURE__*/
        React.createElement("span", { className: "sidenav__label" }, item.label), /*#__PURE__*/
        React.createElement("span", { className: "sidenav__sel" }, isDisabled ? "exit recap to navigate" : item.sub)
        )
        ));

    })
    )
    ));

}

/* ───────── Guided Tours (overview + per-page) ───────── */

const OT_TOURS = {
  /* The original whole-app tour, opened from the Mode Chooser. */
  overview: [
  { glyph: "✦", view: "home", target: ".home-screen__layout",
    title: "Welcome — this is your Mode Chooser",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "This home page is your ", /*#__PURE__*/React.createElement("b", null, "Mode Chooser"), ": four ways into the same Old Testament story. I'll open each one so you can see what it's for \u2014 just press ", /*#__PURE__*/React.createElement("b", null, "Next"), ".") },

  { glyph: "✝", view: "intro", target: ".overview-intro",
    title: "1 · Introduction — start here",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "The ", /*#__PURE__*/React.createElement("b", null, "Introduction"), " lays the foundations: the three great threads \u2014 Kingdom, Salvation, Promises \u2014 the tension between God's character and Man's reality, and why we read the Old Testament at all. ", /*#__PURE__*/React.createElement("b", null, "Begin here.")) },

  { glyph: "↻", view: "recap", target: ".rc-picker",
    title: "2 · Recap Mode — catch up on a session",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Missed a session, or want it in detail? ", /*#__PURE__*/React.createElement("b", null, "Pick any session"), " and Recap Mode walks you through it step by step \u2014 guided questions, thread reveals, flashcards, and suggested answers.") },

  { glyph: "⊞", view: "bigpicture", scrollId: "big-picture-section", target: ".bigpic-selector",
    title: "3 · Big Picture View — the whole map",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "The whole story as one ", /*#__PURE__*/React.createElement("b", null, "subway map"), " \u2014 each column a session, each row a thread. See how every session and its NT fulfilment connect. Best ", /*#__PURE__*/React.createElement("b", null, "after"), " you've worked through the sessions.") },

  { glyph: "❖", view: "threadview", scrollId: "thread-view-section", target: ".thread-toggle-bar",
    title: "4 · Thread View — follow one thread",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "Pick a single thread"), " \u2014 Kingdom, Salvation, Promises, or Tension & NT Fulfilment \u2014 and trace it across every session from Genesis to Deuteronomy.") },

  { glyph: "▦", view: "matrix", target: ".bigpic-selector",
    title: "5 · Matrix View — the whole grid",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Want it all in one table? ", /*#__PURE__*/React.createElement("b", null, "Matrix View"), " lays every theme against every session \u2014 each cell is that session's point for that thread, and a ", /*#__PURE__*/React.createElement("b", null, "\u2605"), " marks its main focus. ", /*#__PURE__*/React.createElement("b", null, "Click a theme name"), " to highlight that thread across the whole grid.") },

  { glyph: "≡", view: "home", peekNav: true, targets: [".sidenav", ".sidenav-fab"],
    title: "The left menu — jump anywhere, anytime",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "This menu on the left lets you ", /*#__PURE__*/React.createElement("b", null, "jump straight to"), " any mode \u2014 the Introduction, Recap Mode, the Big Picture, or Thread View \u2014 from wherever you are. On a phone, tap the ", /*#__PURE__*/React.createElement("b", null, "Jump to"), " tab on the left edge.") },

  { glyph: "→", view: "home", target: ".home-screen__layout",
    title: "Recommended flow",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "A simple path through it all: ", /*#__PURE__*/React.createElement("b", null, "1. Introduction"), " for the foundations \u2192 ", /*#__PURE__*/React.createElement("b", null, "2. Recap Mode"), " for any sessions you've missed or want to revisit \u2192 ", /*#__PURE__*/React.createElement("b", null, "3. Big Picture View"), " when you want to step back and see how it all fits. Each page also has its own ", /*#__PURE__*/React.createElement("b", null, "\u201CNeed help?\u201D"), " tour button at the top.") }],


  /* ── Introduction page ── */
  intro: [
  { glyph: "✝", view: "intro", target: ".overview-intro",
    title: "Introduction — the big idea",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "This first block sums up the ", /*#__PURE__*/React.createElement("b", null, "whole Old Testament in one sentence"), ": God saving His people back into His Kingdom, through His Promises. Everything else hangs off this.") },
  { glyph: "❖", view: "intro", target: ".overview-intro__threads", openSelector: ".overview-subtheme-reveal__head",
    title: "The three threads — click to reveal",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Kingdom, Salvation and Promises run through every session. Boxes like this say ", /*#__PURE__*/React.createElement("b", null, "\u201Cclick to reveal\u201D"), " \u2014 I've opened one for you as an example. Tap the heading again to close it.") },
  { glyph: "⇌", view: "intro", target: ".intro-tension",
    title: "The tension that drives the story",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "The engine of the storyline: ", /*#__PURE__*/React.createElement("b", null, "God's character & intent"), " set against ", /*#__PURE__*/React.createElement("b", null, "Man's reality"), ". Hold this tension in mind \u2014 it's resolved only in Christ.") },
  { glyph: "→", view: "intro", target: ".intro-nav-section",
    title: "Where to go next",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "From here, head into ", /*#__PURE__*/React.createElement("b", null, "Recap Mode"), " to work a session, or the ", /*#__PURE__*/React.createElement("b", null, "Big Picture"), " to see how it all fits together.") }],


  /* ── Recap Mode (session picker, then a peek inside a session) ── */
  recap: [
  { glyph: "↻", view: "recap", target: ".rc-picker__list",
    title: "Recap Mode — pick a session",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Each row is one session. The ", /*#__PURE__*/React.createElement("b", null, "ring on the right"), " shows how much of that session you've filled in. Tap a row to open the guided recap.") },
  { glyph: "✍", view: "recap", target: ".rc-btn--journal",
    title: "My Reflective Journal",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Everything you write across all sessions is gathered here \u2014 and you can ", /*#__PURE__*/React.createElement("b", null, "Export to Excel"), " (one sheet per session) from the journal page.") },
  { glyph: "▤", view: "recap", target: ".rc-fcov",
    title: "Flashcard Overview → Recall Dashboard",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "This box summarises your flashcard recall. ", /*#__PURE__*/React.createElement("b", null, "Click it"), " to open the full ", /*#__PURE__*/React.createElement("b", null, "Recall Dashboard"), " with per-session and per-card-type stats and all your saved answers.") },
  { glyph: "⬚", view: "recap", clickSelector: ".rc-picker__list li:nth-child(2) .rc-picker__row", target: ".rc-session",
    title: "Inside a session — Session 02 · Creation",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "I've opened ", /*#__PURE__*/React.createElement("b", null, "Session 02 \u2014 Creation"), " as an example. A recap walks you from the ", /*#__PURE__*/React.createElement("b", null, "starting question"), " through divisions, main point, threads, tension & NT, and ends with a ", /*#__PURE__*/React.createElement("b", null, "flashcard \u201CTest Yourself.\u201D"), " Tap any numbered box to reveal it.") },
  { glyph: "✎", view: "recap", openSelector: ".rc-tile--apply .rc-tile__head", target: ".rc-tile--apply",
    title: "Apply to Me — don't rush this one",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "This is where the passage meets your life. ", /*#__PURE__*/React.createElement("b", null, "Take your time here"), " and write honestly. Truth we only understand stays in the head; truth we ", /*#__PURE__*/React.createElement("b", null, "apply"), " begins to take root in the heart.") },
  { glyph: "✦", view: "recap", openSelector: ".rc-tile--pray .rc-tile__head", target: ".rc-tile--pray",
    title: "Pause & Pray — let it sink in",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "End by bringing it to God. ", /*#__PURE__*/React.createElement("b", null, "Linger here in prayer"), " \u2014 adore, confess, thank, and ask. This is how God's truths move from the page into our hearts and slowly change us.") }],


  /* ── Big Picture View ── */
  bigpicture: [
  { glyph: "⊞", view: "bigpicture", scrollId: "big-picture-section", target: ".bigpic-selector",
    title: "Big Picture — choose your range",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "This now shows ", /*#__PURE__*/React.createElement("b", null, "all sessions by default"), ". Use this selector to stop the map at any session \u2014 handy if you're only up to a certain week.") },
  { glyph: "◍", view: "bigpicture", target: ".bigpic-legend",
    title: "How to read the map",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Each ", /*#__PURE__*/React.createElement("b", null, "column"), " is a session; each ", /*#__PURE__*/React.createElement("b", null, "row"), " is a thread. Bold dots mark where a thread is a session's main focus.") },
  { glyph: "❖", view: "bigpicture", scrollId: "thread-view-section", target: ".thread-toggle-bar",
    title: "Switch to Thread View below",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Scroll on for ", /*#__PURE__*/React.createElement("b", null, "Thread View"), " \u2014 follow a single thread across every session. There's a separate help button there too.") }],


  /* ── Thread View ── */
  threadview: [
  { glyph: "❖", view: "threadview", scrollId: "thread-view-section", target: ".thread-toggle-bar",
    title: "Thread View — pick one thread",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Choose ", /*#__PURE__*/React.createElement("b", null, "Kingdom, Salvation, Promises"), ", or ", /*#__PURE__*/React.createElement("b", null, "Tension & NT Fulfilment"), ", then trace just that one thread from Genesis to Deuteronomy.") },
  { glyph: "↻", view: "threadview", scrollId: "thread-view-section", clickSelector: ".thread-toggle-bar .thread-toggle-btn:nth-child(3)", target: ".thread-view-page",
    title: "Follow a thread across sessions",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "I've opened the ", /*#__PURE__*/React.createElement("b", null, "Promises"), " thread. Each card is one session's take on it, in order \u2014 a clean way to watch a single idea develop over time.") },
  { glyph: "↳", view: "threadview", scrollId: "thread-view-section", target: ".subtheme--cov",
    title: "Promises has a sub-thread",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Within a thread you'll often find a ", /*#__PURE__*/React.createElement("b", null, "sub-thread"), ". Here it's ", /*#__PURE__*/React.createElement("b", null, "The Covenants across the Pentateuch"), " \u2014 God ", /*#__PURE__*/React.createElement("b", null, "makes"), " His promises, ", /*#__PURE__*/React.createElement("b", null, "seals"), " them by His own hand, and gives ", /*#__PURE__*/React.createElement("b", null, "signs"), " that point forward to Christ.") }],


  /* ── Matrix View ── */
  matrix: [
  { glyph: "▦", view: "matrix", target: ".bigpic-selector",
    title: "Matrix View — choose your range",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Shows ", /*#__PURE__*/React.createElement("b", null, "all sessions by default"), ". Use the selector to limit the grid to the sessions you've covered so far.") },
  { glyph: "▦", view: "matrix", target: ".matrix",
    title: "Every theme × every session",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Each cell is a session's point for one thread; a ", /*#__PURE__*/React.createElement("b", null, "\u2605"), " marks that session's main focus. The first column stays pinned as you scroll across.") },
  { glyph: "⚖", view: "matrix", target: ".matrix-sizer",
    title: "Adjust the layout",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Drag ", /*#__PURE__*/React.createElement("b", null, "Box width"), " to fit more on screen (Compact) or make cells easier to read (Wide).") }],


  /* ── Recall Dashboard (lives inside Recap Mode) ── */
  recall: [
  { glyph: "▤", target: ".rc-mdash__stats",
    title: "Recall Dashboard — your totals",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "At a glance: ", /*#__PURE__*/React.createElement("b", null, "total cards"), ", how many you've ", /*#__PURE__*/React.createElement("b", null, "reviewed"), ", your ", /*#__PURE__*/React.createElement("b", null, "average mastery"), ", and how many sessions are going strong.") },
  { glyph: "◧", target: ".rc-mdash__sessions",
    title: "Session Mastery",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "One tile per session. The ", /*#__PURE__*/React.createElement("b", null, "colored bar"), " shows mastery (red \u2192 still learning, green \u2192 strong), based on how you rated each card.") },
  { glyph: "◆", target: ".rc-mdash__types",
    title: "By Card Type",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "See which ", /*#__PURE__*/React.createElement("b", null, "kinds"), " of cards you know best \u2014 Mini Summary, Main Point, Threads, Tension, NT Fulfilment, Apply.") },
  { glyph: "✎", target: ".rc-minputs", openSelector: ".rc-minputs .rc-collapse__head",
    title: "Your saved answers",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Every flashcard answer you've written is stored here, grouped by session. Each session also has a ", /*#__PURE__*/React.createElement("b", null, "Reset Flashcards"), " button. I've expanded one as an example.") }]

};
window.OT_TOURS = OT_TOURS;

/* When a per-page tour ends, optionally click this to undo any in-tour navigation
   (e.g. the Recap tour opens a session, so we step back to the picker). */
const OT_TOUR_RETURN = { recap: ".rc-session__bar .rc-btn--ghost" };

function GuidedTour({ open, onClose, onNavigate, tourId }) {
  const steps = OT_TOURS[tourId] || OT_TOURS.overview;
  const [step, setStep] = useStateN(0);

  /* reset to first step whenever a tour opens or the tour changes */
  useEffectN(() => {if (open) setStep(0);}, [open, tourId]);

  useEffectN(() => {
    if (!open) return;
    const s = steps[Math.min(step, steps.length - 1)];
    if (s.view && onNavigate) onNavigate(s.view, s.scrollId);
    let el = null,peekEl = null,fabEl = null;
    const timers = [];

    function highlight() {
      const sels = s.targets || (s.target ? [s.target] : []);
      for (const sel of sels) {
        const cand = document.querySelector(sel);
        if (cand && cand.offsetParent !== null) {el = cand;break;}
        if (cand && !el) el = cand;
      }
      if (s.peekNav) {
        peekEl = document.querySelector('.sidenav');
        if (peekEl) peekEl.classList.add('is-peek');
        fabEl = document.querySelector('.sidenav-fab');
        if (fabEl) fabEl.classList.add('is-flash');
      }
      if (el) {
        el.classList.add('tour-highlight');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    const t = setTimeout(() => {
      /* optional: navigate by clicking (e.g. open a session) */
      if (s.clickSelector) {
        const ce = document.querySelector(s.clickSelector);
        if (ce && ce.offsetParent !== null) ce.click();
      }
      const t2 = setTimeout(() => {
        /* optional: open a click-to-reveal box as an example */
        if (s.openSelector) {
          const oe = document.querySelector(s.openSelector);
          if (oe && oe.getAttribute('aria-expanded') === 'false') oe.click();
        }
        const t3 = setTimeout(highlight, s.openSelector ? 220 : 0);
        timers.push(t3);
      }, s.clickSelector ? 420 : 0);
      timers.push(t2);
    }, 480);
    timers.push(t);

    return () => {
      timers.forEach(clearTimeout);
      if (el) el.classList.remove('tour-highlight');
      if (peekEl) peekEl.classList.remove('is-peek');
      if (fabEl) fabEl.classList.remove('is-flash');
    };
  }, [open, step, tourId]);

  if (!open) return null;
  const s = steps[Math.min(step, steps.length - 1)];

  function finish() {
    try {if (window.localStorage) window.localStorage.setItem('OT_TOUR_SEEN_v5', '1');} catch (_) {}
    if ((tourId === 'overview' || !tourId) && onNavigate) {
      onNavigate('home');
    } else {
      /* return to the top of the page where the Help button was clicked */
      const rsel = OT_TOUR_RETURN[tourId];
      let clicked = false;
      if (rsel) {const rb = document.querySelector(rsel);if (rb) {rb.click();clicked = true;}}
      setTimeout(() => {
        try {window.scrollTo({ top: 0, behavior: 'smooth' });} catch (_) {window.scrollTo(0, 0);}
      }, clicked ? 440 : 60);
    }
    setStep(0);
    onClose();
  }

  return (/*#__PURE__*/
    React.createElement("div", { className: "tourdock", role: "dialog", "aria-label": "Guided tour" }, /*#__PURE__*/
    React.createElement("div", { className: "tourdock__card" }, /*#__PURE__*/
    React.createElement("div", { className: "tourdock__head" }, /*#__PURE__*/
    React.createElement("span", { className: "tourdock__glyph" }, s.glyph), /*#__PURE__*/
    React.createElement("span", { className: "tourdock__step" }, "STEP ", step + 1, " / ", steps.length), /*#__PURE__*/
    React.createElement("button", { className: "tourdock__close", onClick: finish, "aria-label": "Close tour" }, "\xD7")
    ), /*#__PURE__*/
    React.createElement("h3", { className: "tourdock__title" }, s.title), /*#__PURE__*/
    React.createElement("p", { className: "tourdock__body" }, s.body), /*#__PURE__*/
    React.createElement("div", { className: "tourdock__dots" },
    steps.map((_, i) => /*#__PURE__*/
    React.createElement("button", { key: i, className: "tour__dot" + (i === step ? " is-on" : ""), onClick: () => setStep(i), "aria-label": "Step " + (i + 1) })
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "tourdock__foot" }, /*#__PURE__*/
    React.createElement("button", { className: "rc-btn", onClick: () => step === 0 ? finish() : setStep(step - 1) }, step === 0 ? "Skip" : "← Back"),
    step < steps.length - 1 ? /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--primary", onClick: () => setStep(step + 1) }, "Next \u2192") : /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--primary", onClick: finish }, "Done \u2713")
    )
    )
    ));

}

/* Small "Need help?" button placed at the top of each page/section. */
function HelpTourButton({ tour, label }) {
  return (/*#__PURE__*/
    React.createElement("div", { className: "help-tour" }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "help-tour__btn", onClick: () => {if (window.startOTTour) window.startOTTour(tour);} }, /*#__PURE__*/
    React.createElement("span", { className: "help-tour__icon", "aria-hidden": "true" }, "?"),
    label || "Need help? Click here for a tour of this page"
    )
    ));

}
window.HelpTourButton = HelpTourButton;

window.SearchBox = SearchBox;
window.searchMatches = searchMatches;
window.SideNav = SideNav;
window.GuidedTour = GuidedTour;