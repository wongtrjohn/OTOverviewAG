function _extends() {return _extends = Object.assign ? Object.assign.bind() : function (n) {for (var e = 1; e < arguments.length; e++) {var t = arguments[e];for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);}return n;}, _extends.apply(null, arguments);} /* Shared helpers — extracted from the original OT Overview dashboard so
   subway, session-detail, thread-story, and the new full-page recap can
   share parsers and small UI primitives.                                 */

const { useState: useStateH, useMemo: useMemoH, useEffect: useEffectH, useRef: useRefH } = React;


/* ── localStorage persistence hook ─────────────────────────────────────────
   Reads the stored value for THIS key, and re-reads it whenever the key
   changes (e.g. switching session or Study/Meditate mode). This is what
   keeps every session's answers in their own box: without the key-change
   re-read, the hook held the first session's value in memory and then wrote
   it back under the new session's key, so notes "followed" you across tabs.

   NOTE (future Supabase): this hook is the single place that loads/saves a
   session's answers. To move to Supabase, swap the localStorage get/set
   below for a row keyed by (key) — e.g. user_id + session_id + mode. The
   key-change re-read already guarantees the correct row loads on switch.   */
function useLocalStorage(key, defaultVal) {
  const read = (k) => {
    try {
      const s = localStorage.getItem(k);
      return s !== null ? JSON.parse(s) : defaultVal;
    } catch (e) {return defaultVal;}
  };
  /* state carries the key it belongs to, so a key change is detectable. */
  const [state, setState] = useStateH(() => ({ key: key, val: read(key) }));
  let val = state.val;
  if (state.key !== key) {
    /* Key changed since last render → load this key's own value now (no
       stale value, no flash). Conditional setState during render of the
       same component is the supported "reset state on prop change" pattern. */
    val = read(key);
    setState({ key: key, val: val });
  }
  function set(updater) {
    setState((prev) => {
      const base = prev.key === key ? prev.val : read(key);
      const next = typeof updater === 'function' ? updater(base) : updater;
      try {localStorage.setItem(key, JSON.stringify(next));} catch (e) {}
      return { key: key, val: next };
    });
  }
  return [val, set];
}

/* ── Progress ring — small SVG donut showing % completion ─────────────── */
function ProgressRing({ pct, size, strokeW }) {
  const s = size || 40;
  const sw = strokeW || 4;
  const r = (s - sw) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, pct || 0));
  const offset = circ - p / 100 * circ;
  const done = p >= 100;
  return (/*#__PURE__*/
    React.createElement("span", { className: "prog-ring", style: { width: s, height: s }, title: p + '% complete' }, /*#__PURE__*/
    React.createElement("svg", { width: s, height: s, viewBox: "0 0 " + s + " " + s,
      style: { transform: 'rotate(-90deg)', display: 'block' } }, /*#__PURE__*/
    React.createElement("circle", { cx: s / 2, cy: s / 2, r: r, fill: "none", stroke: "#e0d0b0", strokeWidth: sw }), /*#__PURE__*/
    React.createElement("circle", { cx: s / 2, cy: s / 2, r: r, fill: "none",
      stroke: done ? "#4a7c3f" : "#b5894a", strokeWidth: sw,
      strokeDasharray: circ, strokeDashoffset: offset, strokeLinecap: "round" })
    ), /*#__PURE__*/
    React.createElement("span", { className: "prog-ring__label", style: { color: done ? '#4a7c3f' : '#7c6535' } }, p, "%")
    ));

}

/* ── Canonical recap progress ──────────────────────────────────────────
   Progress is tied ONLY to the user-input *blanks* the UI actually renders
   for this session, and reaches 100% when every blank is filled:
     • the four scratchpads — own-division attempt, main point, tension, apply
     • every passage-division question that exists (no phantom q-slots)
     • each cloze blank (OT and/or NT)
   Reveal buttons and thread-picks are deliberately NOT counted, so filling
   the answers alone yields 100%.                                          */
function getSessionProgressData(session, data, mode) {
  session = session || {};
  data = data || {};
  var __med = mode === "meditate";
  const txt = (v) => !!(v && String(v).trim());
  let filled = 0,total = 0;
  const add = (ok) => {total++;if (ok) filled++;};

  /* scratchpads (always rendered) */
  add(txt(data.mp));
  add(txt(data.ten));

  /* apply-this-week: one blank per apply question (Apply Q1/Q2/Q3) */
  const applyQs = session.applyQuestions && session.applyQuestions.length ?
  session.applyQuestions.filter((q) => txt(q)) :
  session.ntApplication ? [session.ntApplication] : [];
  if (applyQs.length) {
    applyQs.forEach((q, i) => add(txt(data['app' + (i + 1)]) || i === 0 && txt(data.app)));
  } else {
    add(txt(data.app));
  }

  /* pause & pray reflection — any ACTS field counts (always rendered) */
  add(txt(data.acts_a) || txt(data.acts_c) || txt(data.acts_t) || txt(data.acts_s) || txt(data.pray));

  /* passage divisions + their actual questions */
  const parseDiv = window.parseDivisions;
  const divisions = (parseDiv ? parseDiv(session.divisions) : []) || [];
  if (divisions.length) {
    if (__med) {
      /* meditate: one reflective prompt input per division (no comprehension Q&A) */
      divisions.forEach((div, i) => {
        const saved = (data.divs || {})[String(i)] || {};
        add(txt(saved.reflect));
      });
    } else {
      if (session.id !== 1) add(txt(data.myDivAttempt));
      const detail = (window.OT_DIVISION_DETAIL || {})[session.id] || [];
      const used = new Set();
      const norm = (s) => (s || '').replace(/\s+/g, '');
      const chapterKey = (s) => {
        const m = (s || '').match(/^([1-3]?\s*[A-Za-z]+)\s+(\d+)/);
        return m ? m[1].replace(/\s+/g, '') + ' ' + m[2] : norm(s);
      };
      divisions.forEach((div, i) => {
        let d = detail.find((x, j) => !used.has(j) && x.range && norm(x.range) === norm(div.range));
        if (!d) d = detail.find((x, j) => !used.has(j) && x.range && chapterKey(x.range) === chapterKey(div.range));
        if (!d && divisions.length === detail.length) d = detail[i] || null;
        if (d) used.add(detail.indexOf(d));
        const qs = d && d.questions ? d.questions.filter((q) => q && q.prompt) : [];
        const n = Math.min(qs.length, 3);
        const saved = (data.divs || {})[String(i)] || {};
        for (let j = 1; j <= n; j++) add(txt(saved['q' + j]));
      });
    }
  }

  /* (cloze removed in v21 — Test Yourself is now a separate flashcard deck) */

  const pct = total > 0 ? Math.round(filled / total * 100) : 0;
  return { pct, filled, total };
}

/* Read this session's saved answers from localStorage, then count blanks. */
/* v29: storage namespace differs per mode so Study and Meditate inputs never collide */
function recapStorageKey(sessionId, mode) {
  return (mode === 'meditate' ? 'OT_RECAP_MED_v1_' : 'OT_RECAP_v1_') + sessionId;
}
function getSessionProgress(sessionId, session, mode) {
  let data = {};
  try {
    const s = localStorage.getItem(recapStorageKey(sessionId, mode));
    if (s) data = JSON.parse(s);
  } catch (e) {}
  return getSessionProgressData(session, data, mode);
}
/* v29: global Study/Meditate preference */
function getRecapMode() {
  try {const m = localStorage.getItem('OT_RECAP_MODE');return m === 'study' ? 'study' : 'meditate';}
  catch (e) {return 'study';}
}
function setRecapMode(m) {
  try {localStorage.setItem('OT_RECAP_MODE', m === 'meditate' ? 'meditate' : 'study');} catch (e) {}
}

window.useLocalStorage = useLocalStorage;
window.ProgressRing = ProgressRing;
window.getSessionProgress = getSessionProgress;
window.recapStorageKey = recapStorageKey;
window.getRecapMode = getRecapMode;
window.setRecapMode = setRecapMode;
window.getSessionProgressData = getSessionProgressData;

/* Parse "range|title\nrange|title" → [{range,title}, ...] */
function parseDivisions(raw) {
  if (!raw) return [];
  return raw.split(/\r?\n/).map((line) => {
    const idx = line.indexOf("|");
    if (idx < 0) return { range: line.trim(), title: "" };
    return { range: line.slice(0, idx).trim(), title: line.slice(idx + 1).trim() };
  }).filter((x) => x.range);
}

/* Parse "label|url\nlabel|url" → [{label,url}, ...] */
function parseFurtherStudy(raw) {
  if (!raw) return [];
  return raw.split(/\r?\n/).map((line) => {
    const idx = line.indexOf("|");
    if (idx < 0) return null;
    const label = line.slice(0, idx).trim();
    const url = line.slice(idx + 1).trim();
    if (!label || !url) return null;
    return { label, url };
  }).filter(Boolean);
}

/* PassageRef — Bible reference chips. Rendered as plain <span> text so that
   RefTagger can add hover-to-read tooltips automatically. RefTagger handles
   the click-to-open-Bible-Gateway behaviour via linksOpenBibleGW:true.      */
function PassageRef({ refs, className }) {
  if (!refs) return null;
  // Normalise unicode dashes so RefTagger recognises verse ranges (5–13 → 5-13).
  const raw = String(refs).replace(/[\u2010-\u2015\u2212]/g, '-');
  const parts = raw.split(/[;]\s*|(?:,\s*(?=[1-3]?\s*[A-Z]))/g).
  map((s) => s.trim()).filter(Boolean);
  // Carry the book name forward to chapter-only segments
  // (e.g. "Hebrews 9:1; 9:11-14" → the 2nd chip becomes "Hebrews 9:11-14")
  // so RefTagger can link every segment.
  let lastBook = '';
  const withBook = parts.map((p) => {
    const m = p.match(/^((?:[1-3]\s+)?[A-Za-z][A-Za-z.]*)\s+\d/);
    if (m) {lastBook = m[1].trim();return p;}
    if (/^\d{1,3}:/.test(p) && lastBook) return lastBook + ' ' + p;
    return p;
  });
  return (/*#__PURE__*/
    React.createElement("span", { className: "passage-refs " + (className || "") },
    withBook.map((p, i) => /*#__PURE__*/
    React.createElement("span", {
      key: i,
      className: "passage-ref",
      title: "Read " + p + " (ESV)",
      style: { cursor: 'pointer' } },
    p)
    )
    ));

}

/* Bible references: hover (desktop) or tap (mobile) shows the ESV passage in a
   popup, fetched from Faithlife's public Biblia CDN via JSONP — the same data
   RefTagger used — driven by our own code since RefTagger v2 no longer tags our
   dynamically-rendered refs. Tapping no longer jumps straight to the website;
   the popup carries a "See more" button to open Bible Gateway. Covers every
   .passage-ref (PassageRef + linkifyRefs). */
(function () {
  if (typeof document === 'undefined' || (typeof window !== 'undefined' && window.__otRefHover)) return;
  if (typeof window !== 'undefined') window.__otRefHover = true;
  var cache = {}, tip = null, hideTimer = null, enterTimer = null, n = 0;
  function bgUrl(ref) { return 'https://www.biblegateway.com/passage/?search=' + encodeURIComponent(ref) + '&version=ESV'; }
  function ensureTip() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.className = 'otref-tip';
    document.body.appendChild(tip);
    tip.addEventListener('mouseenter', function () {clearTimeout(hideTimer);});
    tip.addEventListener('mouseleave', hide);
    return tip;
  }
  function place(span) {
    var r = span.getBoundingClientRect(), t = ensureTip();
    var w = 340;
    t.style.left = Math.max(8, Math.min(window.scrollX + r.left, window.scrollX + window.innerWidth - w - 12)) + 'px';
    t.style.top = (window.scrollY + r.bottom + 8) + 'px';
  }
  function show(span, ref, html) {
    var t = ensureTip();
    t.innerHTML = '<div class="otref-tip__head">' + ref + ' · ESV</div>' +
                  '<div class="otref-tip__body">' + html + '</div>' +
                  '<div class="otref-tip__foot"><a class="otref-tip__more" href="' + bgUrl(ref) + '" target="_blank" rel="noopener">See more on Bible Gateway →</a></div>';
    place(span);
    t.classList.add('is-on');
  }
  function hide() {hideTimer = setTimeout(function () {if (tip) tip.classList.remove('is-on');}, 140);}
  function fetchVerse(ref, cb) {
    if (cache[ref] !== undefined) {cb(cache[ref]);return;}
    var cbName = '__otref_cb_' + n++, s = document.createElement('script'), done = false;
    function cleanup() {try {delete window[cbName];} catch (e) {}if (s.parentNode) s.parentNode.removeChild(s);}
    window[cbName] = function (d) {done = true;cache[ref] = d && d.content || '';cb(cache[ref]);cleanup();};
    s.onerror = function () {if (!done) {cache[ref] = '';cb('');cleanup();}};
    s.src = 'https://reftagger.bibliacdn.com/bible/ESV/' + encodeURIComponent(ref) + '?target=reftagger&callback=' + cbName + '&noInlineStyle=true';
    document.head.appendChild(s);
    setTimeout(function () {if (!done) cleanup();}, 8000);
  }
  document.addEventListener('mouseover', function (e) {
    var span = e.target && e.target.closest ? e.target.closest('.passage-ref') : null;
    if (!span) return;
    clearTimeout(hideTimer);clearTimeout(enterTimer);
    var ref = (span.textContent || '').trim();
    if (!ref) return;
    enterTimer = setTimeout(function () {fetchVerse(ref, function (html) {if (html) show(span, ref, html);});}, 130);
  });
  document.addEventListener('mouseout', function (e) {
    var span = e.target && e.target.closest ? e.target.closest('.passage-ref') : null;
    if (!span) return;
    clearTimeout(enterTimer);hide();
  });
  /* Click / tap shows the popup — it no longer jumps straight to the website
     (the "See more" button in the popup opens Bible Gateway). On mobile, where
     there is no hover, this is how the passage is read. */
  document.addEventListener('click', function (e) {
    var span = e.target && e.target.closest ? e.target.closest('.passage-ref') : null;
    if (span) {
      e.preventDefault();
      clearTimeout(hideTimer);clearTimeout(enterTimer);
      var ref = (span.textContent || '').trim();
      if (ref) fetchVerse(ref, function (html) {show(span, ref, html || '<em>Couldn’t load this passage — use “See more” below.</em>');});
      return;
    }
    if (!(e.target && e.target.closest && e.target.closest('.otref-tip'))) {if (tip) tip.classList.remove('is-on');}
  });
})();

/* Section divider — horizontal rule + chip with label/sub. */
function SectionDivider({ id, label, sub }) {
  return (/*#__PURE__*/
    React.createElement("div", _extends({ className: "secdiv" }, id ? { id } : {}), /*#__PURE__*/
    React.createElement("span", { className: "secdiv__rule" }), /*#__PURE__*/
    React.createElement("div", { className: "secdiv__chip" }, /*#__PURE__*/
    React.createElement("span", { className: "secdiv__label" }, label),
    sub ? /*#__PURE__*/React.createElement("span", { className: "secdiv__sub" }, sub) : null
    ), /*#__PURE__*/
    React.createElement("span", { className: "secdiv__rule" })
    ));

}

/* Mini-map scrubber — timeline above the subway view. */
function ScrubMap({ sessions, selectedSession, onSelectSession }) {
  return (/*#__PURE__*/
    React.createElement("div", { className: "scrubmap", "aria-label": "Session timeline" }, /*#__PURE__*/
    React.createElement("div", { className: "scrubmap__ticks" },
    sessions.map((s) => /*#__PURE__*/
    React.createElement("button", {
      key: s.id,
      className: "scrubmap__tick" + (selectedSession === s.id ? " is-on" : ""),
      onClick: () => onSelectSession(s.id),
      title: `S${String(s.id).padStart(2, '0')} · ${s.topic.split('\n')[0]}` }, /*#__PURE__*/

    React.createElement("span", null, String(s.id).padStart(2, '0'))
    )
    )
    )
    ));

}

/* CountUp — small animated number for the hero legend. */
function CountUp({ to, dur }) {
  const target = to || 0;
  const [n, setN] = useStateH(0);
  useEffectH(() => {
    if (typeof requestAnimationFrame === 'undefined') {setN(target);return;}
    let raf;const D = dur || 750;const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / D);
      setN(Math.round(p * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, n);
}

window.parseDivisions = parseDivisions;
window.parseFurtherStudy = parseFurtherStudy;
window.PassageRef = PassageRef;
window.SectionDivider = SectionDivider;
window.ScrubMap = ScrubMap;
window.CountUp = CountUp;

/* ── v28: backup export / import of all saved answers ─────────────────── */
function OT_exportAnswers() {
  const data = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf('OT_') === 0) data[k] = localStorage.getItem(k);
    }
  } catch (e) {alert('Could not read saved answers: ' + e.message);return;}
  const payload = { app: 'OT_RECAP_BACKUP', version: 1, exported: new Date().toISOString(), data };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const d = new Date();const pad = (n) => String(n).padStart(2, '0');
  a.download = 'ot-recap-answers-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(() => {try {URL.revokeObjectURL(a.href);} catch (e) {}}, 2000);
}
function OT_importAnswers() {
  const input = document.createElement('input');
  input.type = 'file';input.accept = '.json,application/json';
  input.onchange = () => {
    const f = input.files && input.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        if (!payload || payload.app !== 'OT_RECAP_BACKUP' || !payload.data) {alert("That file doesn't look like an OT Recap backup.");return;}
        const keys = Object.keys(payload.data).filter((k) => k.indexOf('OT_') === 0);
        if (!keys.length) {alert('No saved answers found in that file.');return;}
        if (!window.confirm('Import ' + keys.length + ' saved item(s) from ' + (payload.exported ? payload.exported.slice(0, 10) : 'backup') + '? Matching answers on this device will be overwritten.')) return;
        keys.forEach((k) => {try {localStorage.setItem(k, payload.data[k]);} catch (e) {}});
        alert('Backup imported — reloading to show your answers.');
        location.reload();
      } catch (e) {alert('Could not import: ' + e.message);}
    };
    reader.readAsText(f);
  };
  input.click();
}
window.OT_exportAnswers = OT_exportAnswers;
window.OT_importAnswers = OT_importAnswers;