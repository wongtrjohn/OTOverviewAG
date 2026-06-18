/* RecapMode — the full-page, session-selectable recap experience.

   Flow:
   1. Landing: a vertical list of "S## · Book Chapter · Topic" for the user
      to pick from (no glance-at-everything wall of cards like before).
   2. Selected: a comprehensive, top-to-bottom guided recap of one session:
      • Starting Question
      • Before you begin… (contextTone)
      • Passage Divisions click-to-reveal, then ONE CARD PER DIVISION,
        clickable; each card opens Q1-Q3 (prompt → user types → show hint →
        reveal suggested answer) and a Mini Summary click-to-reveal at the
        end of each division.
      • Main Point — type your guess, then reveal (bold + Key Verse).
      • 3 Threads — pick which threads you think this passage covers,
        then reveal Kingdom / Salvation / Promises content in separate boxes.
      • Tension & Christ Fulfilment — type how the study applies to NT
        believers, then reveal God's Character & Intent vs Man's Reality
        and Christ's fulfilment.
      • Apply This Week click-to-reveal.
      • Recap — Test Yourself (cloze fill-in-the-blanks).
      • Further Study Links.                                            */

const { useState: useStateR, useMemo: useMemoR, useEffect: useEffectR } = React;

/* ────────────────── small helpers ────────────────── */

function CR_Collapsible({ label, hint, kind, defaultOpen, children, onToggle, step }) {
  const [open, setOpen] = useStateR(!!defaultOpen);
  function toggleOpen() {setOpen((v) => {const nv = !v;if (onToggle) onToggle(nv);return nv;});}
  return (/*#__PURE__*/
    React.createElement("section", { className: "rc-collapse" + (open ? " is-open" : "") + (kind ? " rc-collapse--" + kind : "") }, /*#__PURE__*/
    React.createElement("button", { className: "rc-collapse__head", onClick: toggleOpen, "aria-expanded": open },
    step ? /*#__PURE__*/React.createElement("span", { className: "rc-collapse__step", "aria-hidden": "true" }, step) : null, /*#__PURE__*/
    React.createElement("span", { className: "rc-collapse__chev" }, open ? "▾" : "▸"), /*#__PURE__*/
    React.createElement("span", { className: "rc-collapse__label" }, label),
    !open && hint ? /*#__PURE__*/React.createElement("span", { className: "rc-collapse__hint" }, hint) : null
    ),
    open ? /*#__PURE__*/React.createElement("div", { className: "rc-collapse__body" }, children) : null
    ));

}

/* Reveal-answer pill — click to reveal the suggested answer (3B). */
function CR_RevealAnswer({ answer }) {
  const [shown, setShown] = useStateR(false);
  if (!answer) return null;
  return (/*#__PURE__*/
    React.createElement("div", { className: "rc-revealans" },
    !shown ? /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--primary", onClick: () => setShown(true) }, "Reveal suggested answer \u2192"

    ) : /*#__PURE__*/

    React.createElement("div", { className: "rc-revealans__box" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-revealans__label" }, "SUGGESTED ANSWER"), /*#__PURE__*/
    React.createElement("p", { className: "rc-revealans__text" }, answer), /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--ghost rc-btn--sm", onClick: () => setShown(false) }, "hide")
    )

    ));

}

/* A scratchpad — labelled textarea the user types their attempt into. */
function CR_Scratchpad({ label, placeholder, value, onChange, rows }) {
  return (/*#__PURE__*/
    React.createElement("label", { className: "rc-scratch" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-scratch__label" }, label), /*#__PURE__*/
    React.createElement("textarea", {
      className: "rc-scratch__field",
      rows: rows || 3,
      placeholder: placeholder || "Type your attempt here… (just for you, never stored on a server)",
      value: value,
      onChange: (e) => onChange(e.target.value) }
    )
    ));

}

/* ────────────────── Division Q&A card ────────────────── */

function CR_QuestionRow({ idx, q, initValue, onAttemptChange }) {
  const [attempt, setAttempt] = useStateR(initValue || "");
  const [showHint, setShowHint] = useStateR(false);
  const [showAnswer, setShowAnswer] = useStateR(false);
  if (!q || !q.prompt) return null;
  function handleChange(v) {setAttempt(v);if (onAttemptChange) onAttemptChange(v);}
  return (/*#__PURE__*/
    React.createElement("div", { className: "rc-question" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-question__head" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-question__num" }, "Q", idx), /*#__PURE__*/
    React.createElement("p", { className: "rc-question__prompt" }, q.prompt)
    ), /*#__PURE__*/
    React.createElement("textarea", {
      className: "rc-question__field",
      rows: 2,
      placeholder: "Your answer\u2026",
      value: attempt,
      onChange: (e) => handleChange(e.target.value) }
    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-question__btnrow" },
    q.hint ? /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--ghost", onClick: () => setShowHint((v) => !v) },
    showHint ? "Hide hint" : "Show hint"
    ) :
    null,
    q.answer ? /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--primary", onClick: () => setShowAnswer((v) => !v) },
    showAnswer ? "Hide answer" : "Finished typing? Click here."
    ) :
    null
    ),
    showHint && q.hint ? /*#__PURE__*/
    React.createElement("p", { className: "rc-question__hint" }, "\uD83D\uDCA1 ", q.hint) :
    null,
    showHint && q.image ? /*#__PURE__*/
    React.createElement("figure", { className: "rc-question__image" }, /*#__PURE__*/
    React.createElement("img", { src: q.image, alt: q.imageAlt || '', loading: "lazy" }),
    q.imageAlt ? /*#__PURE__*/React.createElement("figcaption", null, q.imageAlt) : null
    ) :
    null,
    showAnswer && q.answer ? /*#__PURE__*/
    React.createElement("div", { className: "rc-question__answer" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-question__answer-label" }, "Suggested answer"), /*#__PURE__*/
    React.createElement("p", null, q.answer)
    ) :
    null
    ));

}

function CR_DivisionCard({ div, detail, sessionId, index, divSaved, onDivSave }) {
  const [open, setOpen] = useStateR(false);
  const PassageRef = window.PassageRef;
  const questions = detail && detail.questions ? detail.questions.filter((q) => q && q.prompt) : [];
  const summary = detail && detail.summary;
  const saved = divSaved || {};
  function handleQChange(qIdx, val) {
    if (onDivSave) onDivSave({ ...saved, ['q' + (qIdx + 1)]: val });
  }
  /* re-tag Bible refs when card opens */
  useEffectR(() => {
    if (open) {
      const t = setTimeout(() => {
        try {
          if (typeof refTagger !== 'undefined' && refTagger.tag) {
            const el = document.querySelector('.rc-mode__body') || document.body;
            refTagger.tag(el);
          }
        } catch (_) {}
      }, 180);
      return () => clearTimeout(t);
    }
  }, [open]);
  return (/*#__PURE__*/
    React.createElement("article", { className: "rc-divcard" + (open ? " is-open" : "") }, /*#__PURE__*/
    React.createElement("button", { className: "rc-divcard__head", onClick: () => setOpen((v) => !v), "aria-expanded": open }, /*#__PURE__*/
    React.createElement("span", { className: "rc-divcard__chev" }, open ? "▾" : "▸"), /*#__PURE__*/
    React.createElement("span", { className: "rc-divcard__index" }, "Division ", index), /*#__PURE__*/
    React.createElement("span", { className: "rc-divcard__range" },
    PassageRef ? /*#__PURE__*/React.createElement(PassageRef, { refs: div.range }) : div.range
    ),
    div.title ? /*#__PURE__*/React.createElement("span", { className: "rc-divcard__title" }, div.title) : null,
    !open ? /*#__PURE__*/React.createElement("span", { className: "rc-divcard__cta" }, "click to open questions \u2192") : null
    ),
    open ? /*#__PURE__*/
    React.createElement("div", { className: "rc-divcard__body" },
    questions.length ? /*#__PURE__*/
    React.createElement("div", { className: "rc-divcard__questions" },
    questions.slice(0, 3).map((q, i) => /*#__PURE__*/
    React.createElement(CR_QuestionRow, { key: i, idx: i + 1, q: q,
      initValue: saved['q' + (i + 1)] || '',
      onAttemptChange: (v) => handleQChange(i, v) })
    )
    ) : /*#__PURE__*/

    React.createElement("p", { className: "rc-divcard__empty" }, "No prompted questions for this division yet \u2014 fill in ", /*#__PURE__*/
    React.createElement("b", null, "Division Questions"), " in the data file to populate."
    ), /*#__PURE__*/

    React.createElement(CR_Collapsible, { label: `Mini Summary — ${div.title || div.range}`, kind: "summary",
      hint: saved.sumRevealed ? "click to hide" : "click to reveal",
      defaultOpen: !!saved.sumRevealed,
      onToggle: (o) => {if (onDivSave) onDivSave({ sumRevealed: o });} },
    summary ? /*#__PURE__*/
    React.createElement("p", { className: "rc-divcard__summary" }, summary) : /*#__PURE__*/

    React.createElement("p", { className: "rc-divcard__empty" }, "No Mini Summary written for this division yet.")

    )
    ) :
    null
    ));

}

/* ────────────────── 3 Threads (user-picks-then-reveal) ────────────────── */

function CR_ThreadsBlock({ session, themes, initPicked, initRevealed, onChange }) {
  const [picked, setPicked] = useStateR(() => new Set(initPicked || []));
  const [revealed, setRevealed] = useStateR(!!initRevealed);
  const threadIds = ['kingdom', 'salvation', 'promises'];
  const threadObjs = threadIds.map((id) => themes.find((t) => t.id === id)).filter(Boolean);
  function togglePick(id) {
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      if (onChange) onChange({ picked: [...next], revealed });
      return next;
    });
  }
  function handleReveal() {
    setRevealed(true);
    if (onChange) onChange({ picked: [...picked], revealed: true });
  }
  return (/*#__PURE__*/
    React.createElement("div", { className: "rc-threads" }, /*#__PURE__*/
    React.createElement("p", { className: "rc-threads__lede" }, "Before revealing, pick which of the 3 threads you think this passage covers."

    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-threads__picker" },
    threadObjs.map((t) => /*#__PURE__*/
    React.createElement("button", {
      key: t.id,
      type: "button",
      className: "rc-threadchip" + (picked.has(t.id) ? " is-on" : ""),
      style: { '--theme-color': `var(--c-${t.id})`, '--theme-soft': `var(--c-${t.id}-soft)` },
      onClick: () => togglePick(t.id) }, /*#__PURE__*/

    React.createElement("span", { className: "rc-threadchip__check", "aria-hidden": "true" }, picked.has(t.id) ? "✓" : ""), /*#__PURE__*/
    React.createElement("span", { className: "rc-threadchip__glyph" }, t.glyph), /*#__PURE__*/
    React.createElement("span", { className: "rc-threadchip__label" }, t.label)
    )
    )
    ),
    !revealed ? /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--primary rc-btn--lg", onClick: handleReveal }, "Reveal related threads \u2192"

    ) : /*#__PURE__*/

    React.createElement("div", { className: "rc-threads__reveal" },
    threadObjs.map((t) => {
      const content = (session[t.key] || '').trim();
      const isPresent = !!content;
      const wasPicked = picked.has(t.id);
      return (/*#__PURE__*/
        React.createElement("article", {
          key: t.id,
          className: "rc-threadbox" + (
          isPresent ? " is-present" : " is-absent") + (
          wasPicked && isPresent ? " is-correct" : "") + (
          wasPicked && !isPresent ? " is-wrong" : ""),
          style: { '--theme-color': `var(--c-${t.id})`, '--theme-soft': `var(--c-${t.id}-soft)` } }, /*#__PURE__*/

        React.createElement("header", { className: "rc-threadbox__head" }, /*#__PURE__*/
        React.createElement("span", { className: "rc-threadbox__glyph" }, t.glyph), /*#__PURE__*/
        React.createElement("span", { className: "rc-threadbox__label" }, t.label),
        isPresent ? /*#__PURE__*/
        React.createElement("span", { className: "rc-threadbox__tag" }, "in this passage") : /*#__PURE__*/
        React.createElement("span", { className: "rc-threadbox__tag is-absent" }, "not foregrounded here"),
        wasPicked && isPresent ? /*#__PURE__*/React.createElement("span", { className: "rc-threadbox__judge is-good" }, "\u2713 correct") : null,
        wasPicked && !isPresent ? /*#__PURE__*/React.createElement("span", { className: "rc-threadbox__judge is-bad" }, "\u2014 not in this one") : null
        ),
        isPresent ? /*#__PURE__*/
        React.createElement("p", { className: "rc-threadbox__body" }, content) : /*#__PURE__*/

        React.createElement("p", { className: "rc-threadbox__empty" }, "This thread isn't foregrounded in this passage \u2014 it's developed elsewhere in the OT.")

        ));

    })
    )

    ));

}

/* ────────────────── Cloze (test-yourself) ────────────────── */

function CR_ClozeRow({ label, word, context, initGuess, initChecked, onChange }) {
  const [guess, setGuess] = useStateR(initGuess || "");
  const [checked, setChecked] = useStateR(!!initChecked);
  if (!word || !context) return null;
  const norm = (s) => (s || "").trim().toLowerCase();
  const correct = checked && norm(guess) === norm(word);
  function handleCheck() {
    setChecked(true);
    if (onChange) onChange({ guess, correct: norm(guess) === norm(word) });
  }
  return (/*#__PURE__*/
    React.createElement("div", { className: "rc-cloze" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-cloze__row" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-cloze__label" }, label), /*#__PURE__*/
    React.createElement("p", { className: "rc-cloze__context" }, context)
    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-cloze__inputrow" }, /*#__PURE__*/
    React.createElement("input", {
      className: "rc-cloze__input" + (checked && !correct ? " is-wrong" : "") + (correct ? " is-right" : ""),
      placeholder: "type the missing word\u2026",
      value: guess,
      onChange: (e) => {setGuess(e.target.value);setChecked(false);if (onChange) onChange({ guess: e.target.value, correct: false });},
      onKeyDown: (e) => {if (e.key === 'Enter') handleCheck();} }
    ), /*#__PURE__*/
    React.createElement("button", { className: "rc-btn", onClick: handleCheck }, "Check"),
    checked && !correct ? /*#__PURE__*/React.createElement("span", { className: "rc-cloze__answer" }, "answer \xB7 ", /*#__PURE__*/React.createElement("b", null, word)) : null,
    correct ? /*#__PURE__*/React.createElement("span", { className: "rc-cloze__ok" }, "\u2713 correct") : null
    )
    ));

}

/* ────────────────── Section Tile (design box style) ────────────────── */
function CR_SectionTile({ tone, step, label, sublabel, defaultOpen, children }) {
  const [open, setOpen] = useStateR(!!defaultOpen);
  return (/*#__PURE__*/
    React.createElement("article", { className: "rc-tile rc-tile--" + tone + (open ? " is-open" : "") }, /*#__PURE__*/
    React.createElement("button", { className: "rc-tile__head", onClick: () => setOpen((v) => !v), "aria-expanded": open }, /*#__PURE__*/
    React.createElement("span", { className: "rc-tile__step", "aria-hidden": "true" }, step), /*#__PURE__*/
    React.createElement("span", { className: "rc-tile__textcol" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-tile__label" }, label),
    sublabel ? /*#__PURE__*/React.createElement("span", { className: "rc-tile__sub" }, sublabel) : null
    ), /*#__PURE__*/
    React.createElement("span", { className: "rc-tile__act" }, open ? "close ×" : "open →")
    ),
    open ? /*#__PURE__*/React.createElement("div", { className: "rc-tile__body" }, children) : null
    ));

}

/* ────────────────── ACTS Prayer (input-style Pause & Pray) ───────────── */
function CR_ACTSPrayer({ session, sd, patch }) {
  const bk = `${session.book || ''} ${session.chapter || ''}`.trim();
  const steps = [
  { letter: 'A', label: 'Adore', key: 'acts_a', color: 'var(--c-kingdom)',
    prompt: session.actsAdore || `As you reflect on ${session.topic} (${bk}), what does this passage reveal about God’s character that you can praise Him for?`,
    placeholder: 'Lord, I praise you for…' },
  { letter: 'C', label: 'Confess', key: 'acts_c', color: 'var(--c-salvation)',
    prompt: session.actsConfess || `In light of what you’ve studied, where have you fallen short of God’s design? Where have you resisted His good rule?`,
    placeholder: 'I confess that I…' },
  { letter: 'T', label: 'Thank', key: 'acts_t', color: 'var(--c-nt)',
    prompt: session.actsThank || `What can you thank God for in light of this passage — especially how Christ fulfils what you’ve studied?`,
    placeholder: 'Thank you, Father, for…' },
  { letter: 'S', label: 'Supplicate', key: 'acts_s', color: 'var(--c-promises)',
    prompt: session.actsSupplicate || `What do you need from God as you apply this truth to your life this week?`,
    placeholder: 'Help me to…' }];

  const [activeStep, setActiveStep] = useStateR(null);
  const anyWritten = steps.some((st) => (sd[st.key] || '').trim().length > 0);
  return (/*#__PURE__*/
    React.createElement("div", { className: "rc-acts" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-acts__stillness" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-acts__breath-circle", "aria-hidden": "true" }), /*#__PURE__*/
    React.createElement("p", { className: "rc-acts__stillness-text" }, "Take a breath. Let the passage settle in your heart before you pray.")
    ), /*#__PURE__*/
    React.createElement("p", { className: "rc-acts__lede" }, "Walk through each prompt below. Write freely, or simply sit and pray silently. Your prayers are saved in your browser \u2014 they\u2019ll be here when you return."), /*#__PURE__*/
    React.createElement("div", { className: "rc-acts__steps" },
    steps.map((step, i) => {
      const isOpen = activeStep === i;
      const val = sd[step.key] || '';
      const hasContent = val.trim().length > 0;
      return (/*#__PURE__*/
        React.createElement("div", { key: i, className: "rc-acts__step" + (isOpen ? " is-open" : "") + (hasContent ? " has-content" : ""),
          style: { '--step-color': step.color } }, /*#__PURE__*/
        React.createElement("button", { className: "rc-acts__step-head", onClick: () => setActiveStep(isOpen ? null : i) }, /*#__PURE__*/
        React.createElement("span", { className: "rc-acts__step-badge" }, step.letter), /*#__PURE__*/
        React.createElement("span", { className: "rc-acts__step-label" }, step.label),
        hasContent && !isOpen ? /*#__PURE__*/React.createElement("span", { className: "rc-acts__step-done" }, "\u2713 written") : null, /*#__PURE__*/
        React.createElement("span", { className: "rc-acts__step-chev" }, isOpen ? '▾' : '▸')
        ),
        isOpen ? /*#__PURE__*/
        React.createElement("div", { className: "rc-acts__step-body" }, /*#__PURE__*/
        React.createElement("p", { className: "rc-acts__step-prompt" }, step.prompt), /*#__PURE__*/
        React.createElement("textarea", { className: "rc-acts__step-field", rows: 3, placeholder: step.placeholder,
          value: val, onChange: (e) => patch({ [step.key]: e.target.value }) }),
        val ? /*#__PURE__*/React.createElement("span", { className: "rc-acts__step-saved" }, "\u2713 saved to your browser") : null
        ) :
        null
        ));

    })
    ),
    anyWritten ? /*#__PURE__*/
    React.createElement("div", { className: "rc-acts__saved-note" }, "\u2713 Your prayers are saved \u2014 they\u2019ll be here when you come back.") :
    null
    ));

}

/* ────────────────── Main recap-per-session view ────────────────── */

function CR_SessionRecap({ session, sessions, themes, onBack, mode }) {
  const meditate = mode === "meditate";
  const renderMultiline = window.renderMultiline;
  const PassageRef = window.PassageRef;
  const parseDivisions = window.parseDivisions;
  const parseFurtherStudy = window.parseFurtherStudy;

  const detail = (window.OT_DIVISION_DETAIL || {})[session.id] || [];
  const divisions = parseDivisions(session.divisions);
  // pair each parsed division with its detail entry
  // 1. Try exact match by range (whitespace-insensitive)
  // 2. Fall back to chapter-prefix match (e.g. "Exodus 32:1-24" → Q&A row with range "Exodus 32")
  // 3. Fall back to positional index (only when counts match)
  const usedDetails = new Set();
  const norm = (s) => (s || '').replace(/\s+/g, '');
  // Pull the "Book Chapter" prefix from a range string (handles "Exodus 32:1-24", "Genesis 8-9", etc.)
  const chapterKey = (s) => {
    const m = (s || '').match(/^([1-3]?\s*[A-Za-z]+)\s+(\d+)/);
    return m ? m[1].replace(/\s+/g, '') + ' ' + m[2] : norm(s);
  };
  const pairedDivisions = divisions.map((div, i) => {
    let d = detail.find((x, j) => !usedDetails.has(j) && x.range && norm(x.range) === norm(div.range));
    if (!d) {
      d = detail.find((x, j) => !usedDetails.has(j) && x.range && chapterKey(x.range) === chapterKey(div.range));
    }
    if (!d && divisions.length === detail.length) d = detail[i] || null;
    if (d) usedDetails.add(detail.indexOf(d));
    return { div, detail: d };
  });

  /* ── Persistent session data (localStorage) ─────────────────────── */
  const useLocalStorage = window.useLocalStorage;
  const defaultSD = {
    mp: '', mpR: false, ten: '', tenR: false, app: '',
    app1: '', app2: '', app3: '', pray: '',
    acts_a: '', acts_c: '', acts_t: '', acts_s: '',
    divs: {}, tPicked: [], tReveal: false,
    cz1: '', cz1ok: false, cz2: '', cz2ok: false,
    myDivAttempt: ''
  };
  const [sd, setSd] = useLocalStorage(window.recapStorageKey ? window.recapStorageKey(session.id, mode) : 'OT_RECAP_v1_' + session.id, defaultSD);
  function patch(u) {setSd((prev) => ({ ...prev, ...u }));}
  function patchDiv(divIdx, u) {
    setSd((prev) => ({
      ...prev,
      divs: { ...prev.divs, [String(divIdx)]: { ...(prev.divs[String(divIdx)] || {}), ...u } }
    }));
  }
  /* convenience aliases (keep JSX readable) */
  const mpAttempt = sd.mp || '';
  const mpRevealed = !!sd.mpR;
  const tensionAttempt = sd.ten || '';
  const tensionRevealed = !!sd.tenR;
  const applyAttempt = sd.app || '';

  /* ── progress: tied to the user-input blanks, identical to the picker ── */
  const ProgressRing = window.ProgressRing;
  const progressPct = window.getSessionProgressData ?
  window.getSessionProgressData(session, sd, mode).pct :
  0;
  function handleReset() {
    const msg = meditate ?
    'Reset your Meditate & Reflect notes for this session? This cannot be undone. (Your Study mode answers are kept separately and are not affected.)' :
    'Reset all your Study answers for this session? This also clears your flashcard answers. This cannot be undone. (Your Meditate notes are kept separately and are not affected.)';
    if (window.confirm(msg)) {
      setSd(defaultSD);
      if (!meditate) {try {localStorage.removeItem('OT_FLASH_v1_' + session.id);} catch (e) {}}
      if (typeof window !== 'undefined') window.location.reload();
    }
  }

  /* Scroll to top whenever a new session is opened. */
  useEffectR(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
  }, [session.id]);

  const furtherStudy = parseFurtherStudy(session.furtherStudy);

  return (/*#__PURE__*/
    React.createElement("article", { className: "rc-session" }, /*#__PURE__*/


    React.createElement("header", { className: "rc-session__bar" }, /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--ghost", onClick: onBack }, "\u2190 back to session list"), /*#__PURE__*/
    React.createElement("span", { className: "rc-session__crumb" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-session__num" }, "SESSION ", String(session.id).padStart(2, '0')), /*#__PURE__*/
    React.createElement("span", { className: "rc-session__dot" }, "\xB7"), /*#__PURE__*/
    React.createElement("span", { className: "rc-session__book" }, session.book, " ", session.chapter), /*#__PURE__*/
    React.createElement("span", { className: "rc-session__dot" }, "\xB7"), /*#__PURE__*/
    React.createElement("span", { className: "rc-session__topic" }, session.topic)
    )
    ),


    ProgressRing ? /*#__PURE__*/
    React.createElement("div", { className: "rc-session__progress-bar" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-session__progress-label" }, "Session progress"), /*#__PURE__*/
    React.createElement(ProgressRing, { pct: progressPct, size: 44, strokeW: 4 }), /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--ghost rc-btn--sm", onClick: handleReset }, "Reset Answers")
    ) :
    null,



    session.image ? /*#__PURE__*/
    React.createElement("div", { className: "rc-session__banner", style: { backgroundImage: `url("${session.image}")` } }, /*#__PURE__*/
    React.createElement("div", { className: "rc-session__banner-fade", "aria-hidden": "true" }), /*#__PURE__*/
    React.createElement("div", { className: "rc-session__banner-text" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-session__banner-num" }, "SESSION ", String(session.id).padStart(2, '0')), /*#__PURE__*/
    React.createElement("span", { className: "rc-session__banner-topic" }, session.topic), /*#__PURE__*/
    React.createElement("span", { className: "rc-session__banner-passage" }, session.book, " ", session.chapter)
    )
    ) :
    null, /*#__PURE__*/


    React.createElement("section", { className: "rc-starter" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-starter__eyebrow" }, "THE STARTING QUESTION"), /*#__PURE__*/
    React.createElement("h2", { className: "rc-starter__q" }, session.recapQuestion || "(No starting question set for this session.)"), /*#__PURE__*/
    React.createElement("p", { className: "rc-starter__lede" }, "Pause for a beat. What's your first guess? You can revisit this as you work through the passage."),
    session.recapAnswer ? /*#__PURE__*/
    React.createElement(CR_RevealAnswer, { answer: session.recapAnswer }) :
    null
    ),


    (() => {
      const prevSession = (sessions || []).find((s) => s.id === session.id - 1);
      if (!prevSession || !prevSession.mainPoint) return null;
      return (/*#__PURE__*/
        React.createElement(CR_Collapsible, {
          label: "↩ Previous Session's Main Point — Session " + String(prevSession.id).padStart(2, '0') + ' · ' + prevSession.topic.split('\n')[0],
          kind: "prev-mp",
          hint: "click to recall before you begin" }, /*#__PURE__*/
        React.createElement("div", { className: "rc-prevmp" }, /*#__PURE__*/
        React.createElement("span", { className: "rc-prevmp__session-label" }, "Session ", String(prevSession.id).padStart(2, '0'), " Main Point"), /*#__PURE__*/
        React.createElement("blockquote", { className: "rc-prevmp__text" }, prevSession.mainPoint)
        )
        ));

    })(),


    session.prayFor && session.prayFor.trim() ? /*#__PURE__*/
    React.createElement("div", { className: "rc-prayfor" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-prayfor__label" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-prayfor__icon", "aria-hidden": "true" }, "\uD83D\uDE4F"), "Before we begin, pray for:"

    ), /*#__PURE__*/
    React.createElement("p", { className: "rc-prayfor__text" }, session.prayFor ? session.prayFor.charAt(0).toUpperCase() + session.prayFor.slice(1) : '')
    ) :
    null,


    session.contextTone && session.contextTone.trim() ? /*#__PURE__*/
    React.createElement("aside", { className: "rc-context" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-context__label" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-context__icon", "aria-hidden": "true" }, "\u2723"), "Before you begin\u2026"

    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-context__body" },
    renderMultiline ? renderMultiline(session.contextTone) : /*#__PURE__*/React.createElement("p", null, session.contextTone)
    )
    ) : /*#__PURE__*/

    React.createElement("aside", { className: "rc-context rc-context--empty" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-context__label" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-context__icon", "aria-hidden": "true" }, "\u2723"), "Before you begin\u2026"

    ), /*#__PURE__*/
    React.createElement("p", { className: "rc-context__empty" }, "No context note recorded yet for this session.")
    ),



    meditate ? /*#__PURE__*/
    React.createElement("section", { className: "rc-stillness" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-stillness__eyebrow" }, "BE STILL"), /*#__PURE__*/
    React.createElement("p", { className: "rc-stillness__lede" }, "Before you read and reflect, set aside a moment of quiet. Breathe slowly. Ask God to meet you in His word \u2014 then begin, unhurried."


    ), /*#__PURE__*/
    React.createElement(CR_ReflectionTimer, { label: "Stillness before the Word", presets: [1, 2, 3, 5] })
    ) :
    null, /*#__PURE__*/


    React.createElement("p", { className: "rc-tilegrid__lede" }, meditate ? "Move through each section gently — there's no need to finish in one sitting." : "Pick a section to work through."), /*#__PURE__*/
    React.createElement("div", { className: "rc-tilegrid" },


    divisions.length ? /*#__PURE__*/
    React.createElement(CR_SectionTile, { tone: "divisions", step: "01", label: "Divisions",
      sublabel: `Walk the passage in ${divisions.length} ${divisions.length === 1 ? 'piece' : 'pieces'}` },
    meditate ? /*#__PURE__*/
    React.createElement("p", { className: "rc-divisions__lede rc-divisions__lede--med" }, "Read the passage once through, unhurried. Let the shape of it settle before you move on.") :
    session.id !== 1 ? /*#__PURE__*/
    React.createElement("p", { className: "rc-divisions__lede" }, "Try to divide the passage yourself first, after reading it once through!") :
    null,
    !meditate && session.id !== 1 ? /*#__PURE__*/
    React.createElement(CR_Scratchpad, {
      label: "Write your own division attempt here first:",
      placeholder: "How would you divide this passage? Write your attempt before revealing below\u2026",
      value: sd.myDivAttempt || '',
      onChange: (v) => patch({ myDivAttempt: v }),
      rows: 3 }
    ) :
    null, /*#__PURE__*/
    React.createElement(CR_Collapsible, { label: meditate ? "The passage, in its movements" : "Reveal the assigned passage divisions", kind: "divisions", hint: "click to reveal", defaultOpen: meditate }, /*#__PURE__*/
    React.createElement("ol", { className: "rc-divisions__list" },
    divisions.map((d, i) => /*#__PURE__*/
    React.createElement("li", { key: i, className: "rc-divisions__listitem" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-divisions__listidx" }, i + 1), /*#__PURE__*/
    React.createElement("span", { className: "rc-divisions__listrange" },
    PassageRef ? /*#__PURE__*/React.createElement(PassageRef, { refs: d.range }) : d.range
    ),
    d.title ? /*#__PURE__*/React.createElement("span", { className: "rc-divisions__listtitle" }, "\u2014 ", d.title) : null
    )
    )
    )
    ),

    meditate ? /*#__PURE__*/
    React.createElement("div", { className: "rc-divisions__cards" },
    pairedDivisions.map(({ div, detail }, i) => /*#__PURE__*/
    React.createElement(CR_MeditativeDivision, { key: i, div: div, detail: detail, index: i + 1, session: session,
      divSaved: (sd.divs || {})[String(i)] || {},
      onDivSave: (u) => patchDiv(i, u) })
    )
    ) : /*#__PURE__*/

    React.createElement(CR_Collapsible, { label: "Divisions & Questions", kind: "divisions-all", hint: "click to reveal all divisions and questions" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-divisions__cards" },
    pairedDivisions.map(({ div, detail }, i) => /*#__PURE__*/
    React.createElement(CR_DivisionCard, { key: i, div: div, detail: detail, index: i + 1, sessionId: session.id,
      divSaved: (sd.divs || {})[String(i)] || {},
      onDivSave: (u) => patchDiv(i, u) })
    )
    )
    )

    ) :
    null, /*#__PURE__*/


    React.createElement(CR_SectionTile, { tone: "mainpoint", step: "02", label: "Main Point", sublabel: "The one big idea of the passage" },
    (() => {
      const revealedSummaries = pairedDivisions.
      map(({ div, detail }, i) => ({ div, detail, saved: (sd.divs || {})[String(i)] || {} })).
      filter((x) => x.saved.sumRevealed && x.detail && x.detail.summary);
      return (/*#__PURE__*/
        React.createElement("div", { className: "rc-mp-summaries" }, /*#__PURE__*/
        React.createElement("span", { className: "rc-mp-summaries__label" }, "Mini Summaries you\u2019ve revealed so far"),
        revealedSummaries.length ?
        revealedSummaries.map((x, i) => /*#__PURE__*/
        React.createElement("div", { key: i, className: "rc-mp-summaries__item" }, /*#__PURE__*/
        React.createElement("span", { className: "rc-mp-summaries__div" }, x.div.title || x.div.range), /*#__PURE__*/
        React.createElement("p", { className: "rc-mp-summaries__text" }, x.detail.summary)
        )
        ) : /*#__PURE__*/

        React.createElement("p", { className: "rc-mp-summaries__placeholder" }, "Mini summaries you\u2019ve revealed will appear here.")

        ));

    })(), /*#__PURE__*/
    React.createElement(CR_Scratchpad, {
      label: "What do you think the main point of this passage is?",
      placeholder: "Write the one-sentence Main Point as you see it\u2026",
      value: mpAttempt,
      onChange: (v) => patch({ mp: v }),
      rows: 3 }
    ),
    !mpRevealed ? /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--primary rc-btn--lg", onClick: () => patch({ mpR: true }) }, "Reveal main point \u2192"

    ) : /*#__PURE__*/

    React.createElement("div", { className: "rc-mainpoint__reveal" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-mainpoint__line" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-mainpoint__label" }, "MAIN POINT"), /*#__PURE__*/
    React.createElement("blockquote", { className: "rc-mainpoint__text" },
    renderMultiline ? renderMultiline(session.mainPoint) : /*#__PURE__*/React.createElement("p", null, session.mainPoint)
    )
    ),
    session.keyVerse ? /*#__PURE__*/
    React.createElement("div", { className: "rc-mainpoint__verse" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-mainpoint__verse-label" }, "KEY VERSE"), /*#__PURE__*/
    React.createElement("p", null, session.keyVerse)
    ) :
    null
    )

    ), /*#__PURE__*/


    React.createElement(CR_SectionTile, { tone: "threads", step: "03", label: "3 Threads", sublabel: "Kingdom \xB7 Salvation \xB7 Promises" }, /*#__PURE__*/
    React.createElement(CR_ThreadsBlock, { session: session, themes: themes,
      initPicked: sd.tPicked || [],
      initRevealed: !!sd.tReveal,
      onChange: (t) => patch({ tPicked: t.picked, tReveal: t.revealed }) })
    ), /*#__PURE__*/


    React.createElement(CR_SectionTile, { tone: "tension", step: "04", label: "Tension & New Testament", sublabel: "God\u2019s intent vs man\u2019s reality, and how Christ resolves it" }, /*#__PURE__*/
    React.createElement(CR_Scratchpad, {
      label: "How do you think this study applies to us as New Testament believers?",
      placeholder: "Write your reflection \u2014 God's intent vs man's reality, and how Christ resolves it\u2026",
      value: tensionAttempt,
      onChange: (v) => patch({ ten: v }),
      rows: 4 }
    ),
    !tensionRevealed ? /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--primary rc-btn--lg", onClick: () => patch({ tenR: true }) }, "Reveal tension & fulfilment \u2192"

    ) : /*#__PURE__*/

    React.createElement("div", { className: "rc-tension__reveal" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-tension__pair" }, /*#__PURE__*/
    React.createElement("article", { className: "rc-tension__cell rc-tension__cell--intent" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-tension__label" }, "God's Character & Intent"), /*#__PURE__*/
    React.createElement("p", null, session.intention || /*#__PURE__*/React.createElement("em", { className: "rc-tension__empty" }, "\u2014 not foregrounded in this passage \u2014"))
    ), /*#__PURE__*/
    React.createElement("span", { className: "rc-tension__sep", "aria-hidden": "true" }, "\u21C4"), /*#__PURE__*/
    React.createElement("article", { className: "rc-tension__cell rc-tension__cell--reality" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-tension__label" }, "Man's Reality"), /*#__PURE__*/
    React.createElement("p", null, session.reality || /*#__PURE__*/React.createElement("em", { className: "rc-tension__empty" }, "\u2014 not foregrounded in this passage \u2014"))
    )
    ),
    session.ntPoint ? /*#__PURE__*/
    React.createElement("article", { className: "rc-tension__cell rc-tension__cell--resolve" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-tension__resolve-glyph", "aria-hidden": "true" }, "\u271D"), /*#__PURE__*/
    React.createElement("div", { className: "rc-tension__resolve-body" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-tension__label" }, "Christ Fulfilment \u2014 the resolution"), /*#__PURE__*/
    React.createElement("p", null,
    session.ntPoint,
    session.ntPassage ? /*#__PURE__*/
    React.createElement(React.Fragment, null, " \xB7 ", PassageRef ? /*#__PURE__*/React.createElement(PassageRef, { refs: session.ntPassage }) : session.ntPassage) :
    null
    )
    )
    ) :
    null
    )

    ), /*#__PURE__*/


    React.createElement(CR_SectionTile, { tone: "apply", step: "05", label: "Apply to Me", sublabel: "Take it from the passage into your week" },
    (() => {
      const applyQs = session.applyQuestions && session.applyQuestions.length ?
      session.applyQuestions.filter((q) => q && String(q).trim()) :
      session.ntApplication ? [session.ntApplication] : [];
      if (!applyQs.length) return /*#__PURE__*/React.createElement("p", { className: "rc-apply__empty" }, "No application prompt written for this session yet.");
      return (/*#__PURE__*/
        React.createElement("div", { className: "rc-apply__list" }, /*#__PURE__*/
        React.createElement("p", { className: "rc-apply__intro" }, "Take a minute to reflect and pray about the passage. Write your thoughts below and continue in prayer with another member."),
        applyQs.map((q, i) => /*#__PURE__*/
        React.createElement("div", { key: i, className: "rc-apply__qblock" }, /*#__PURE__*/
        React.createElement("p", { className: "rc-apply__text" },
        applyQs.length > 1 ? /*#__PURE__*/React.createElement("span", { className: "rc-apply__qnum" }, i + 1) : null,
        q
        ), /*#__PURE__*/
        React.createElement("textarea", {
          className: "rc-apply__input",
          rows: 3,
          placeholder: "Write your answer here \u2014 it's saved locally in your browser.",
          value: sd['app' + (i + 1)] || (i === 0 ? sd.app || '' : ''),
          onChange: (e) => patch({ ['app' + (i + 1)]: e.target.value }) }
        )
        )
        )
        ));

    })()
    ), /*#__PURE__*/


    React.createElement(CR_SectionTile, { tone: "pray", step: "06", label: "Pause & Pray", sublabel: meditate ? "Set aside time to pray it back to God" : "Turn what you’ve learned into prayer" }, /*#__PURE__*/
    React.createElement(CR_ACTSPrayer, { session: session, sd: sd, patch: patch }),
    meditate ? /*#__PURE__*/React.createElement(CR_PrayerTime, { session: session }) : null
    ),


    !meditate ? (() => {
      const fcards = window.buildFlashcards(session, themes);
      if (!fcards.length) return null;
      return (/*#__PURE__*/
        React.createElement(CR_SectionTile, { tone: "recap", step: "07", label: "Test Yourself", sublabel: `Flip ${fcards.length} flashcards — casual recall` }, /*#__PURE__*/
        React.createElement(CR_FlashcardDeck, { session: session, themes: themes })
        ));

    })() : null

    ),


    furtherStudy.length ? /*#__PURE__*/
    React.createElement("section", { className: "rc-furtherstudy" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-furtherstudy__label" }, "FURTHER STUDY"), /*#__PURE__*/
    React.createElement("div", { className: "rc-furtherstudy__chips" },
    furtherStudy.map((it, i) => /*#__PURE__*/
    React.createElement("a", { key: i, className: "rc-furtherstudy__chip", href: it.url, target: "_blank", rel: "noopener noreferrer" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-furtherstudy__glyph" }, "\u2197"), /*#__PURE__*/
    React.createElement("span", null, it.label)
    )
    )
    )
    ) :
    null, /*#__PURE__*/


    React.createElement(CR_Collapsible, {
      kind: "at-a-glance",
      label: /*#__PURE__*/
      React.createElement("span", { className: "rc-glance-label" }, /*#__PURE__*/
      React.createElement("span", { className: "rc-glance-label__l1" }, "Done with the Recap?"), /*#__PURE__*/
      React.createElement("span", { className: "rc-glance-label__l2" }, "Click here to reveal a Summary of the Session"), /*#__PURE__*/
      React.createElement("span", { className: "rc-glance-label__l3" }, "Session ", String(session.id).padStart(2, '0'), " : ", session.topic.split('\n')[0], " \u2014 At a Glance")
      ) },


    (() => {
      const SessionDetail = window.SessionDetail;
      if (!SessionDetail) return /*#__PURE__*/React.createElement("p", { className: "rc-divcard__empty" }, "Session overview not available.");
      return (/*#__PURE__*/
        React.createElement(SessionDetail, {
          session: session,
          sessions: sessions || [session],
          themes: themes,
          onSelectSession: () => {},
          onPinTheme: () => {} }
        ));

    })()
    ), /*#__PURE__*/


    React.createElement("footer", { className: "rc-session__foot" }, /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--ghost rc-btn--lg", onClick: onBack }, "\u2190 back to session list")
    )
    ));

}

/* ────────────────── Landing — session picker ────────────────── */

function CR_Picker({ sessions, themes, mode, onPick, onOpenJournal }) {
  const ProgressRing = window.ProgressRing;
  const getSessionProgress = window.getSessionProgress;
  const meditate = mode === 'meditate';

  /* overall progress across the recap sessions (2–12), in the active mode */
  const recapSessions = (sessions || []).filter((s) => s.id >= 2);
  const overall = recapSessions.reduce((acc, s) => {
    const p = getSessionProgress(s.id, s, mode);
    return { filled: acc.filled + p.filled, total: acc.total + p.total };
  }, { filled: 0, total: 0 });
  const overallPct = overall.total > 0 ? Math.round(overall.filled / overall.total * 100) : 0;

  const sessionOne = (sessions || []).find((s) => s.id === 1);
  const readReflect = (sessions || []).filter((s) => s.id >= 2 && s.id <= 11);
  const reviewReflect = (sessions || []).filter((s) => s.id === 12);

  function Row({ s }) {
    const prog = getSessionProgress(s.id, s, mode);
    return (/*#__PURE__*/
      React.createElement("li", null, /*#__PURE__*/
      React.createElement("button", { className: "rc-picker__row", onClick: () => onPick(s.id) }, /*#__PURE__*/
      React.createElement("span", { className: "rc-picker__num" }, String(s.id).padStart(2, '0')),
      s.image ? /*#__PURE__*/
      React.createElement("span", { className: "rc-picker__thumb", style: { backgroundImage: `url("${s.image}")` }, "aria-hidden": "true" }) : /*#__PURE__*/

      React.createElement("span", { className: "rc-picker__thumb rc-picker__thumb--empty", "aria-hidden": "true" }, s.book?.[0] || '·'), /*#__PURE__*/

      React.createElement("span", { className: "rc-picker__body" }, /*#__PURE__*/
      React.createElement("span", { className: "rc-picker__topic" }, s.topic), /*#__PURE__*/
      React.createElement("span", { className: "rc-picker__passage" }, s.book, s.chapter ? ` · ${s.chapter}` : '')
      ),
      ProgressRing ? /*#__PURE__*/
      React.createElement("span", { className: "rc-picker__prog", onClick: (e) => e.stopPropagation() }, /*#__PURE__*/
      React.createElement(ProgressRing, { pct: prog.pct, size: 38, strokeW: 4 })
      ) : /*#__PURE__*/

      React.createElement("span", { className: "rc-picker__cta" }, "open this session \u2192")

      )
      ));

  }

  return (/*#__PURE__*/
    React.createElement("section", { className: "rc-picker" },
    window.HelpTourButton ? /*#__PURE__*/React.createElement(window.HelpTourButton, { tour: "recap", label: "Need help? Take a tour of Recap Mode" }) : null, /*#__PURE__*/
    React.createElement("header", { className: "rc-picker__head" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-picker__head-top" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__eyebrow" }, "RECAP MODE \xB7 ", meditate ? 'MEDITATE & REFLECT' : 'STUDY & REFLECT'), /*#__PURE__*/
    React.createElement("h1", { className: "rc-picker__title" }, "Which session would you like to ", meditate ? 'sit with' : 'recap', "?")
    ),
    ProgressRing ? /*#__PURE__*/
    React.createElement("div", { className: "rc-picker__overall" }, /*#__PURE__*/
    React.createElement(ProgressRing, { pct: overallPct, size: 56, strokeW: 5 }), /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__overall-label" }, "overall", /*#__PURE__*/React.createElement("br", null), "progress")
    ) :
    null
    ),
    meditate ? /*#__PURE__*/
    React.createElement("p", { className: "rc-picker__lede" }, /*#__PURE__*/
    React.createElement("strong", { className: "rc-picker__lede-em" }, /*#__PURE__*/React.createElement("em", null, "Finished studying a session already?")), " This mode focuses on dwelling on the truths learnt during the session and spending time with God intentionally. Fewer and more intentional questions. Your notes here are kept separate from Study mode."
    ) : /*#__PURE__*/

    React.createElement("p", { className: "rc-picker__lede" }, "Study & Reflect walks you through each session in depth \u2014 guided questions, thread reveals, and flashcards. Pick one session at a time; your answers are saved locally in this browser."

    ),

    onOpenJournal ? /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--journal", onClick: onOpenJournal }, /*#__PURE__*/
    React.createElement("span", { className: "rc-btn--journal__icon", "aria-hidden": "true" }, "\u270D"), "My Reflective Journal"

    ) :
    null
    ),


    sessionOne ? /*#__PURE__*/
    React.createElement("button", { className: "rc-picker__introrow", onClick: () => onPick(1) }, /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__num" }, "01"), /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__body" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__topic" }, "Introduction \u2014 start here"), /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__passage" }, "The 3 big threads \xB7 why read the Old Testament?")
    ), /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__cta" }, "go to the Introduction \u2192")
    ) :
    null, /*#__PURE__*/


    React.createElement("div", { className: "rc-picker__group" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-picker__grouphead" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__groupglyph", "aria-hidden": "true" }, "\uD83D\uDCD6"), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__grouptitle" }, "Read & Reflect"), /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__groupsub" }, "Sessions 02\u201311 \xB7 Genesis \u2192 Deuteronomy")
    )
    ), /*#__PURE__*/
    React.createElement("ol", { className: "rc-picker__list" },
    readReflect.map((s) => /*#__PURE__*/React.createElement(Row, { key: s.id, s: s }))
    )
    ),


    reviewReflect.length ? /*#__PURE__*/
    React.createElement("div", { className: "rc-picker__group rc-picker__group--review" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-picker__grouphead" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__groupglyph", "aria-hidden": "true" }, "\u2756"), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__grouptitle" }, "Review & Reflect"), /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__groupsub" }, "Session 12 \xB7 the whole Pentateuch in one view")
    )
    ), /*#__PURE__*/
    React.createElement("ol", { className: "rc-picker__list" },
    reviewReflect.map((s) => /*#__PURE__*/React.createElement(Row, { key: s.id, s: s }))
    )
    ) :
    null
    ));

}

/* ────────────────── My Reflective Journal (rollup) ────────────────── */

function CR_JournalRollup({ sessions, onBack }) {
  function readSD(id) {
    try {const raw = localStorage.getItem('OT_RECAP_v1_' + id);return raw ? JSON.parse(raw) : {};}
    catch (e) {return {};}
  }
  const rows = (sessions || []).map((s) => {
    const sd = readSD(s.id);
    const applyQs = s.applyQuestions && s.applyQuestions.length ?
    s.applyQuestions :
    s.ntApplication ? [s.ntApplication] : [];
    const groups = [];
    const reflect = [];
    if (sd.mp && String(sd.mp).trim()) reflect.push({ label: 'Main Point — your guess', value: sd.mp });
    if (sd.ten && String(sd.ten).trim()) reflect.push({ label: 'Tension & NT — your reflection', value: sd.ten });
    if (sd.myDivAttempt && String(sd.myDivAttempt).trim()) reflect.push({ label: 'Passage divisions — your attempt', value: sd.myDivAttempt });
    if (reflect.length) groups.push({ group: 'Reflections', color: 'var(--c-promises)', items: reflect });
    const apply = [];
    ['app1', 'app2', 'app3'].forEach((k, i) => {
      const v = sd[k] || (i === 0 ? sd.app : '');
      if (v && String(v).trim()) apply.push({ label: applyQs[i] ? 'Q' + (i + 1) + ' · ' + applyQs[i] : 'Apply ' + (i + 1), value: v });
    });
    if (apply.length) groups.push({ group: 'Apply to Me', color: 'var(--c-nt)', items: apply });
    const pray = [];
    [['acts_a', 'Adore'], ['acts_c', 'Confess'], ['acts_t', 'Thank'], ['acts_s', 'Supplicate']].forEach(([k, lab]) => {
      if (sd[k] && String(sd[k]).trim()) pray.push({ label: lab, value: sd[k] });
    });
    if (sd.pray && String(sd.pray).trim()) pray.push({ label: 'Prayer', value: sd.pray });
    if (pray.length) groups.push({ group: 'Pause & Pray', color: 'var(--c-intention)', items: pray });
    return { session: s, groups };
  }).filter((r) => r.groups.length);

  return (/*#__PURE__*/
    React.createElement("section", { className: "rc-journal" }, /*#__PURE__*/
    React.createElement("header", { className: "rc-journal__bar" }, /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--ghost", onClick: onBack }, "\u2190 back to session list"), /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--journal rc-btn--export", onClick: () => window.exportJournalXlsx(sessions) }, /*#__PURE__*/
    React.createElement("span", { className: "rc-btn--journal__icon", "aria-hidden": "true" }, "\u2913"), "Export to Excel"

    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-journal__intro" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__eyebrow" }, "MY REFLECTIVE JOURNAL"), /*#__PURE__*/
    React.createElement("h2", { className: "rc-journal__title" }, "Everything you\u2019ve written"), /*#__PURE__*/
    React.createElement("p", { className: "rc-journal__lede" }, "All your personal reflections, prayers, and commitments \u2014 collected from every session. Everything stays in your browser only."


    )
    ),
    !rows.length ? /*#__PURE__*/
    React.createElement("div", { className: "rc-journal__empty" }, /*#__PURE__*/
    React.createElement("p", null, "No journal entries yet."), /*#__PURE__*/
    React.createElement("p", null, "Open a session and write in the ", /*#__PURE__*/React.createElement("b", null, "Apply to Me"), " or ", /*#__PURE__*/React.createElement("b", null, "Pause & Pray"), " sections to start your journal.")
    ) : /*#__PURE__*/

    React.createElement("div", { className: "rc-journal__entries" },
    rows.map(({ session, groups }) => /*#__PURE__*/
    React.createElement("article", { key: session.id, className: "rc-journal__session" }, /*#__PURE__*/
    React.createElement("header", { className: "rc-journal__session-head" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__session-num" }, "S", String(session.id).padStart(2, '0')), /*#__PURE__*/
    React.createElement("div", { className: "rc-journal__session-text" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__session-topic" }, session.topic), /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__session-passage" }, session.book, " ", session.chapter)
    )
    ),
    groups.map((g, gi) => /*#__PURE__*/
    React.createElement("div", { key: gi, className: "rc-journal__group" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__group-label" }, g.group), /*#__PURE__*/
    React.createElement("div", { className: "rc-journal__group-fields" },
    g.items.map((fld, i) => /*#__PURE__*/
    React.createElement("div", { key: i, className: "rc-journal__field", style: { '--field-color': g.color } }, /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__field-label" }, fld.label), /*#__PURE__*/
    React.createElement("p", { className: "rc-journal__field-value" }, fld.value)
    )
    )
    )
    )
    )
    )
    )
    )

    ));

}

/* ────────────────── Outer component ────────────────── */

function RecapMode({ sessions, themes, onExit, initialSession, onSessionChange, onGotoIntro, initialMode, onModeChange }) {
  const [selected, setSelected] = useStateR(initialSession || null);
  const [journalOpen, setJournalOpen] = useStateR(false);
  const [mode, setMode] = useStateR(initialMode || (window.getRecapMode ? window.getRecapMode() : 'meditate'));
  const session = selected ? sessions.find((s) => s.id === selected) : null;

  /* persist + broadcast mode (for deep-link hash) */
  function chooseMode(m) {
    setMode(m);
    if (window.setRecapMode) window.setRecapMode(m);
    if (onModeChange) onModeChange(m);
  }

  /* picking a session — Session 1 is the Introduction, which lives on its own page */
  function pick(id) {
    if (id === 1) {if (onGotoIntro) onGotoIntro();return;}
    setSelected(id);
  }

  /* v28: sync selection out (deep-link hash) + remember the last-opened
     session so the Home screen can offer "Continue where you left off". */
  useEffectR(() => {
    if (onSessionChange) onSessionChange(selected || null);
    if (selected) {
      try {localStorage.setItem('OT_LAST_v1', JSON.stringify({ sessionId: selected, ts: Date.now() }));} catch (e) {}
    }
  }, [selected]);

  useEffectR(() => {
    document.body.classList.add('is-recap-mode');
    return () => document.body.classList.remove('is-recap-mode');
  }, []);

  /* ── RefTagger: re-tag whenever the session changes ── */
  useEffectR(() => {
    let timer;
    function tag() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          if (typeof refTagger !== 'undefined' && refTagger.tag) {
            const el = document.querySelector('.rc-mode__body') || document.body;
            refTagger.tag(el);
          }
        } catch (_) {}
      }, 250);
    }
    tag();
    const body = document.querySelector('.rc-mode__body');
    if (!body) return () => clearTimeout(timer);
    let tagging = false;
    const obs = new MutationObserver(() => {
      if (tagging) return;
      tagging = true;
      tag();
      setTimeout(() => {tagging = false;}, 600);
    });
    obs.observe(body, { childList: true, subtree: true });
    return () => {obs.disconnect();clearTimeout(timer);};
  }, [selected, mode]);

  return (/*#__PURE__*/
    React.createElement("div", { className: "rc-mode rc-mode--" + mode, role: "region", "aria-label": "Recap Mode" }, /*#__PURE__*/
    React.createElement("header", { className: "rc-mode__topbar" }, /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--ghost", onClick: onExit }, "\u2190 exit recap mode"

    ), /*#__PURE__*/
    React.createElement("span", { className: "rc-mode__title" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-mode__glyph" }, "\u21BB"), "Recap Mode"

    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-modetoggle", role: "group", "aria-label": "Choose recap mode" }, /*#__PURE__*/
    React.createElement("button", {
      type: "button",
      className: "rc-modetoggle__btn" + (mode === 'study' ? ' is-active' : ''),
      "aria-pressed": mode === 'study',
      onClick: () => chooseMode('study') }, /*#__PURE__*/
    React.createElement("span", { className: "rc-modetoggle__glyph", "aria-hidden": "true" }, "\u270E"), "Study & Reflect"

    ), /*#__PURE__*/
    React.createElement("button", {
      type: "button",
      className: "rc-modetoggle__btn" + (mode === 'meditate' ? ' is-active' : ''),
      "aria-pressed": mode === 'meditate',
      onClick: () => chooseMode('meditate') }, /*#__PURE__*/
    React.createElement("span", { className: "rc-modetoggle__glyph", "aria-hidden": "true" }, "\u2740"), "Meditate & Reflect"

    )
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "rc-mode__body" },
    journalOpen ? /*#__PURE__*/
    React.createElement(CR_JournalRollup, { sessions: sessions, onBack: () => setJournalOpen(false) }) :
    !session ? /*#__PURE__*/
    React.createElement(CR_Picker, { sessions: sessions, themes: themes, mode: mode, onPick: pick, onOpenJournal: () => setJournalOpen(true) }) :
    session.id === 12 ? /*#__PURE__*/
    React.createElement(CR_ReviewReflect, { session: session, sessions: sessions, themes: themes, mode: mode, onBack: () => setSelected(null) }) : /*#__PURE__*/

    React.createElement(CR_SessionRecap, { session: session, sessions: sessions, themes: themes, mode: mode, onBack: () => setSelected(null) })

    )
    ));

}

/* ══════════════════════════════════════════════════════════════════════
   RECAP MODE ADD-ONS (v21)
   1. Flashcards for learning  (replaces the old cloze "Test Yourself")
   2. Flashcard Overview        (landing-page summary box)
   3. Reflective Journal → Excel export  (one sheet per session + README)
   All data is derived from window.OT_SESSIONS / OT_DIVISION_DETAIL, which
   are generated from the "Data Entry" workbook. Editable per-card hints are
   read from the new Data-Entry hint columns with graceful fallbacks.
   ══════════════════════════════════════════════════════════════════════ */

/* ───────────── Flashcard builder ─────────────
   Produces the ordered deck for one session, following the 6 categories:
   1 mini-summaries · 2 main-point (fill the second half) · 3 threads ·
   4 tension (only if BOTH sides present) · 5 Christ-fulfilment / NT-add ·
   6 apply-to-me questions.                                              */
function buildFlashcards(session, themes) {
  if (!session) return [];
  const cards = [];
  const t = (v) => v && String(v).trim() ? String(v).trim() : '';
  const sNum = 'S' + String(session.id).padStart(2, '0');
  const passage = (session.book || '') + (session.chapter ? ' ' + session.chapter : '');
  const detail = (window.OT_DIVISION_DETAIL || {})[session.id] || [];

  /* 1 · Mini summaries of each division */
  detail.forEach((d, i) => {
    if (t(d.summary)) {
      cards.push({
        id: 'sum' + i, type: 'summary', typeLabel: 'Mini Summary', glyph: '▤',
        color: 'var(--c-kingdom)', soft: 'var(--c-kingdom-soft)', sNum, passage,
        front: 'In a sentence or two, sum up this division.',
        sub: (d.title ? '“' + d.title + '”' : '') + (d.range ? (d.title ? ' — ' : '') + d.range : ''),
        back: d.summary, verse: '',
        hint: t(d.summaryHint) || (t(d.range) ? 'Re-read ' + d.range : 'Look back at the passage-divisions section.')
      });
    }
  });

  /* 2 · Main point — finish the second half of the sentence */
  if (t(session.mainPoint)) {
    const mp = t(session.mainPoint);
    const words = mp.split(/\s+/);
    const cut = Math.max(1, Math.ceil(words.length / 2));
    const firstHalf = words.slice(0, cut).join(' ');
    cards.push({
      id: 'mp', type: 'mainpoint', typeLabel: 'Main Point', glyph: '◉',
      color: 'var(--ink)', soft: 'var(--bg-card-2)', sNum, passage,
      front: 'Finish the main point: “' + firstHalf + ' …”',
      sub: 'Complete the sentence in your own words.',
      back: mp, verse: t(session.keyVerse),
      hint: t(session.hintMainPoint) || (t(session.keyVerse) ?
      'Key verse — ' + t(session.keyVerse).split(/[-–—]/)[0].trim() :
      'It pulls the whole passage into one idea.')
    });
  }

  /* 3 · Threads — what exactly does each present thread say here */
  ['kingdom', 'salvation', 'promises'].forEach((tid) => {
    const content = t(session[tid]);
    if (content) {
      const th = (themes || []).find((x) => x.id === tid) || { label: tid, short: tid, glyph: '', blurb: '' };
      cards.push({
        id: 'thr_' + tid, type: 'thread', typeLabel: th.short || th.label, glyph: th.glyph || '◆',
        color: 'var(--c-' + tid + ')', soft: 'var(--c-' + tid + '-soft)', sNum, passage,
        front: 'The “' + (th.label || tid) + '” thread runs through this passage — what exactly does it say here?',
        sub: 'Recall this thread in your own words.',
        back: content, verse: '',
        hint: t(session.hintThreads) || t(th.blurb) || 'Think about how this passage advances that storyline.'
      });
    }
  });

  /* 4 · Tension — only when BOTH God's intent and man's reality are present */
  const intent = t(session.intention),reality = t(session.reality);
  const bothTension = !!(intent && reality);
  if (bothTension) {
    cards.push({
      id: 'tension', type: 'tension', typeLabel: 'Tension', glyph: '⇄',
      color: 'var(--c-intention)', soft: 'var(--c-intention-soft)', sNum, passage,
      front: 'What is the tension here — God’s character & intent vs man’s reality?',
      sub: 'Name both sides.',
      back: 'God’s Character & Intent —\n' + intent + '\n\nMan’s Reality —\n' + reality,
      verse: '',
      hint: t(session.hintTension) || 'One side is what God designed; the other is where man actually ended up.'
    });
  }

  /* 5 · Christ fulfilment (both tension parts) / NT addition (otherwise) */
  if (t(session.ntPoint) || t(session.ntPassage)) {
    cards.push({
      id: 'nt', type: 'fulfilment',
      typeLabel: bothTension ? 'Christ Fulfilment' : 'NT Fulfilment', glyph: '✝',
      color: 'var(--c-nt)', soft: 'var(--c-nt-soft)', sNum, passage,
      front: bothTension ?
      'How does Christ fulfil and resolve this tension?' :
      'How does the New Testament add to this session?',
      sub: t(session.ntPassage),
      back: t(session.ntPoint) || 'See the New-Testament passage above.',
      verse: t(session.ntPassage),
      hint: t(session.hintNt) || (t(session.ntPassage) ? 'Look at ' + t(session.ntPassage) : 'Look to how Jesus completes the story.')
    });
  }

  /* 6 · Apply-to-me questions (personal — the blank IS the answer) */
  const applyQs = session.applyQuestions && session.applyQuestions.length ?
  session.applyQuestions.filter((q) => t(q)) :
  t(session.ntApplication) ? [t(session.ntApplication)] : [];
  applyQs.forEach((q, i) => {
    cards.push({
      id: 'app' + i, type: 'apply', typeLabel: 'Apply to Me', glyph: '✎',
      color: 'var(--c-apply)', soft: 'var(--c-apply-soft)', sNum, passage,
      front: q, sub: 'A question for you — write your own response.',
      back: '', personal: true, verse: t(session.prayFor) ? 'Pray for: ' + t(session.prayFor) : '',
      hint: t(session.hintApply) || 'There’s no “right” answer — be honest and specific.'
    });
  });

  return cards;
}
window.buildFlashcards = buildFlashcards;

/* ───────────── Flashcard deck (the flip-card runner) ───────────── */
function CR_FlashcardDeck({ session, themes }) {
  const useLS = window.useLocalStorage;
  const cards = useMemoR(() => window.buildFlashcards(session, themes), [session.id]);
  const [fd, setFd] = useLS('OT_FLASH_v1_' + session.id, {});
  const [idx, setIdx] = useStateR(0);
  const [flipped, setFlip] = useStateR(false);
  const [hintOpen, setHint] = useStateR(false);

  if (!cards.length) {
    return /*#__PURE__*/React.createElement("p", { className: "rc-fc__empty" }, "No flashcards for this session yet \u2014 add content in the Data Entry tab to generate them.");
  }

  const card = cards[Math.min(idx, cards.length - 1)];
  const saved = fd[card.id] || {};
  function patchCard(u) {setFd((prev) => ({ ...prev, [card.id]: { ...(prev[card.id] || {}), ...u } }));}
  function goto(n) {setFlip(false);setHint(false);setIdx((i) => Math.max(0, Math.min(cards.length - 1, i + n)));}
  function jump(i) {setFlip(false);setHint(false);setIdx(i);}

  return (/*#__PURE__*/
    React.createElement("div", { className: "rc-fc" }, /*#__PURE__*/

    React.createElement("div", { className: "rc-fc__topbar" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-fc__brand" }, "\u25A4 FLIP FLASHCARDS"), /*#__PURE__*/
    React.createElement("span", { className: "rc-fc__brand-sub" }, "Casual recall \u2014 tap a card to flip. Nothing is scored.")
    ), /*#__PURE__*/


    React.createElement("div", { className: "rc-fc__meta" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-fc__count" }, idx + 1, " of ", cards.length), /*#__PURE__*/
    React.createElement("span", { className: "rc-fc__type", style: { color: card.color } }, card.glyph, " ", card.typeLabel.toUpperCase())
    ), /*#__PURE__*/


    React.createElement("div", {
      className: "rc-fccard" + (flipped ? " is-flipped" : ""),
      style: { '--fc-color': card.color, '--fc-soft': card.soft },
      onClick: () => setFlip((f) => !f),
      role: "button", tabIndex: 0 },

    !flipped ? /*#__PURE__*/
    React.createElement("div", { className: "rc-fccard__face rc-fccard__front" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-fccard__head" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-fccard__badge" }, card.glyph, " ", card.typeLabel), /*#__PURE__*/
    React.createElement("span", { className: "rc-fccard__loc" }, card.sNum, " \xB7 ", card.passage)
    ), /*#__PURE__*/
    React.createElement("p", { className: "rc-fccard__q" }, card.front),
    card.sub ? /*#__PURE__*/React.createElement("p", { className: "rc-fccard__sub" }, card.sub) : null, /*#__PURE__*/
    React.createElement("textarea", {
      className: "rc-fccard__blank", rows: 2, placeholder: "Say it in your head, or jot a note\u2026",
      value: saved.ans || '',
      onClick: (e) => e.stopPropagation(),
      onChange: (e) => patchCard({ ans: e.target.value }) }
    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-fccard__hint", onClick: (e) => e.stopPropagation() },
    hintOpen ? /*#__PURE__*/
    React.createElement("p", { className: "rc-fccard__hinttext" }, /*#__PURE__*/React.createElement("span", { className: "rc-fccard__hintlab" }, "HINT"), " ", card.hint) : /*#__PURE__*/
    React.createElement("button", { type: "button", className: "rc-fc__hintbtn", onClick: () => setHint(true) }, "Show hint")
    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-fccard__flipcue" }, "TAP TO REVEAL \u2192")
    ) : /*#__PURE__*/

    React.createElement("div", { className: "rc-fccard__face rc-fccard__back" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-fccard__head" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-fccard__badge rc-fccard__badge--answer" }, "ANSWER"), /*#__PURE__*/
    React.createElement("span", { className: "rc-fccard__loc" }, card.glyph, " ", card.typeLabel)
    ),
    card.personal ? /*#__PURE__*/
    React.createElement("div", { className: "rc-fccard__abody" }, /*#__PURE__*/
    React.createElement("p", { className: "rc-fccard__personal" }, "This one\u2019s personal \u2014 here\u2019s what you wrote:"), /*#__PURE__*/
    React.createElement("p", { className: "rc-fccard__yourans" }, saved.ans && saved.ans.trim() ? saved.ans : /*#__PURE__*/React.createElement("em", null, "(nothing written yet)"))
    ) : /*#__PURE__*/

    React.createElement("p", { className: "rc-fccard__a" }, card.back),

    card.verse ? /*#__PURE__*/React.createElement("div", { className: "rc-fccard__verse" }, card.verse) : null, /*#__PURE__*/
    React.createElement("div", { className: "rc-fccard__flipcue" }, "TAP TO FLIP BACK")
    )

    ), /*#__PURE__*/


    React.createElement("div", { className: "rc-fc__controls" }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "rc-btn rc-btn--ghost", disabled: idx === 0, onClick: () => goto(-1) }, "\u2190 Previous"), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "rc-btn", onClick: () => setFlip((f) => !f) }, flipped ? 'Flip back' : 'Flip card'), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "rc-btn rc-btn--ghost", disabled: idx === cards.length - 1, onClick: () => goto(1) }, "Next \u2192")
    ), /*#__PURE__*/


    React.createElement("div", { className: "rc-fc__dots" },
    cards.map((c, i) => /*#__PURE__*/
    React.createElement("span", { key: i,
      className: "rc-fcdot" + (i === idx ? ' is-cur' : ''),
      onClick: () => jump(i), role: "button", tabIndex: 0, "aria-label": 'card ' + (i + 1) })
    )
    )
    ));

}
window.CR_FlashcardDeck = CR_FlashcardDeck;


/* ───────────── Reflective Journal → Excel export ─────────────
   Collects the same data the Journal page renders, then writes a real
   .xlsx (README sheet first/active, one sheet per session).            */
function collectJournal(sessions) {
  function readSD(id) {
    try {const raw = localStorage.getItem('OT_RECAP_v1_' + id);return raw ? JSON.parse(raw) : {};}
    catch (e) {return {};}
  }
  const T = (v) => v && String(v).trim() ? String(v).trim() : '';
  return (sessions || []).map((s) => {
    const sd = readSD(s.id);
    const applyQs = s.applyQuestions && s.applyQuestions.length ?
    s.applyQuestions :
    s.ntApplication ? [s.ntApplication] : [];
    const groups = [];
    const reflect = [];
    if (T(sd.mp)) reflect.push(['Main Point — your guess', sd.mp]);
    if (T(sd.ten)) reflect.push(['Tension & NT — your reflection', sd.ten]);
    if (T(sd.myDivAttempt)) reflect.push(['Passage divisions — your attempt', sd.myDivAttempt]);
    if (reflect.length) groups.push(['Reflections', reflect]);
    const apply = [];
    ['app1', 'app2', 'app3'].forEach((k, i) => {
      const v = sd[k] || (i === 0 ? sd.app : '');
      if (T(v)) apply.push([applyQs[i] ? 'Q' + (i + 1) + ' · ' + applyQs[i] : 'Apply ' + (i + 1), v]);
    });
    if (apply.length) groups.push(['Apply to Me', apply]);
    const pray = [];
    [['acts_a', 'Adore'], ['acts_c', 'Confess'], ['acts_t', 'Thank'], ['acts_s', 'Supplicate']].forEach(([k, lab]) => {
      if (T(sd[k])) pray.push([lab, sd[k]]);
    });
    if (T(sd.pray)) pray.push(['Prayer', sd.pray]);
    if (pray.length) groups.push(['Pause & Pray', pray]);
    return { session: s, groups };
  }).filter((r) => r.groups.length);
}
window.collectJournal = collectJournal;

/* -- tiny dependency-free XLSX writer (store-only zip + inline strings) -- */
function _xlsxEsc(s) {
  return String(s == null ? '' : s).
  replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').
  replace(/"/g, '&quot;').
  replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}
function _colLetter(n) {
  let s = '';
  while (n > 0) {const m = (n - 1) % 26;s = String.fromCharCode(65 + m) + s;n = Math.floor((n - 1) / 26);}
  return s;
}
function _sheetXml(rows) {
  let body = '';
  rows.forEach((row, ri) => {
    const cells = row.cells || row;
    let rowXml = '';
    cells.forEach((cell, ci) => {
      const val = cell && typeof cell === 'object' ? cell.v : cell;
      const style = cell && typeof cell === 'object' && cell.s ? cell.s : 0;
      if (val === '' || val == null) return;
      const ref = _colLetter(ci + 1) + (ri + 1);
      rowXml += '<c r="' + ref + '" t="inlineStr"' + (style ? ' s="' + style + '"' : '') +
      '><is><t xml:space="preserve">' + _xlsxEsc(val) + '</t></is></c>';
    });
    body += '<row r="' + (ri + 1) + '">' + rowXml + '</row>';
  });
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<cols><col min="1" max="1" width="34" customWidth="1"/><col min="2" max="2" width="80" customWidth="1"/></cols>' +
  '<sheetData>' + body + '</sheetData></worksheet>';
}
function _crc32(bytes) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i++) {
    let c = (crc ^ bytes[i]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? c >>> 1 ^ 0xEDB88320 : c >>> 1;
    crc = crc >>> 8 ^ c;
  }
  return (crc ^ -1) >>> 0;
}
function _zipStore(files) {
  const enc = new TextEncoder();
  const u16 = (n) => [n & 0xff, n >> 8 & 0xff];
  const u32 = (n) => [n & 0xff, n >> 8 & 0xff, n >> 16 & 0xff, n >> 24 & 0xff];
  const chunks = [];const central = [];let offset = 0;
  files.forEach((f) => {
    const nameB = enc.encode(f.name);
    const data = f.data instanceof Uint8Array ? f.data : enc.encode(f.data);
    const crc = _crc32(data);const sz = data.length;
    const local = [].concat([0x50, 0x4b, 0x03, 0x04], u16(20), u16(0), u16(0), u16(0), u16(0),
    u32(crc), u32(sz), u32(sz), u16(nameB.length), u16(0));
    chunks.push(new Uint8Array(local), nameB, data);
    const cen = [].concat([0x50, 0x4b, 0x01, 0x02], u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
    u32(crc), u32(sz), u32(sz), u16(nameB.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset));
    central.push(new Uint8Array(cen), nameB);
    offset += local.length + nameB.length + sz;
  });
  let cdSize = 0;central.forEach((a) => cdSize += a.length);
  const eocd = [].concat([0x50, 0x4b, 0x05, 0x06], u16(0), u16(0),
  u16(files.length), u16(files.length), u32(cdSize), u32(offset), u16(0));
  const parts = chunks.concat(central, [new Uint8Array(eocd)]);
  let total = 0;parts.forEach((p) => total += p.length);
  const out = new Uint8Array(total);let pos = 0;
  parts.forEach((p) => {out.set(p, pos);pos += p.length;});
  return out;
}
function _stylesXml() {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<fonts count="3">' +
  '<font><sz val="11"/><name val="Calibri"/></font>' +
  '<font><b/><sz val="11"/><name val="Calibri"/></font>' +
  '<font><b/><sz val="14"/><name val="Calibri"/></font>' +
  '</fonts>' +
  '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
  '<fill><patternFill patternType="solid"><fgColor rgb="FFF1E7CF"/><bgColor indexed="64"/></patternFill></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="5">' +
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
  '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>' +
  '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
  '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>' +
  '</cellXfs>' +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
  '</styleSheet>';
}
function _safeSheetName(name, used) {
  let n = String(name).replace(/[\\\/\?\*\[\]:]/g, ' ').slice(0, 31).trim() || 'Sheet';
  let base = n,i = 2;
  while (used[n]) {n = (base.slice(0, 28) + ' ' + i).slice(0, 31);i++;}
  used[n] = true;return n;
}
function exportJournalXlsx(sessions) {
  const rowsData = window.collectJournal(sessions);
  const sheets = [];

  const today = new Date().toISOString().slice(0, 10);
  const readme = [
  [{ v: 'My Reflective Journal — OT Overview Recap', s: 3 }],
  [{ v: 'Exported ' + today, s: 0 }],
  [''],
  [{ v: 'How to use this workbook', s: 1 }],
  [{ v: 'Each session you have written in has its OWN sheet (tab).', s: 0 }],
  [{ v: 'Use the sheet tabs at the BOTTOM of this window to switch between sessions.', s: 0 }],
  [{ v: 'Inside each sheet your entries are grouped: Reflections, Apply to Me, and Pause & Pray.', s: 0 }],
  [''],
  [{ v: 'Sessions included in this export', s: 1 }],
  [{ v: 'Session', s: 4 }, { v: 'Entries written', s: 4 }]];

  rowsData.forEach((r) => {
    let count = 0;r.groups.forEach((g) => count += g[1].length);
    readme.push([
    { v: 'S' + String(r.session.id).padStart(2, '0') + ' · ' + r.session.topic + ' (' + (r.session.book || '') + ' ' + (r.session.chapter || '') + ')', s: 0 },
    { v: count, s: 0 }]
    );
  });
  if (!rowsData.length) readme.push([{ v: '(No journal entries yet — write in a session’s Apply to Me or Pause & Pray sections.)', s: 2 }]);
  sheets.push({ name: 'README', rows: readme });

  rowsData.forEach((r) => {
    const rows = [];
    rows.push([{ v: 'S' + String(r.session.id).padStart(2, '0') + ' · ' + r.session.topic, s: 3 }]);
    rows.push([{ v: (r.session.book || '') + ' ' + (r.session.chapter || ''), s: 0 }]);
    rows.push(['']);
    r.groups.forEach((g) => {
      rows.push([{ v: g[0], s: 4 }, { v: 'Your Answer', s: 4 }]);
      g[1].forEach(([label, value]) => rows.push([{ v: label, s: 2 }, { v: value, s: 2 }]));
      rows.push(['']);
    });
    sheets.push({ name: 'S' + String(r.session.id).padStart(2, '0') + ' ' + r.session.topic, rows: rows });
  });

  const used = {};
  const sheetMeta = sheets.map((sh, i) => ({ file: 'sheet' + (i + 1) + '.xml', name: _safeSheetName(sh.name, used), xml: _sheetXml(sh.rows) }));
  const files = [];
  files.push({ name: '[Content_Types].xml',
    data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    sheetMeta.map((m) => '<Override PartName="/xl/worksheets/' + m.file + '" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('') +
    '</Types>' });
  files.push({ name: '_rels/.rels',
    data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>' });
  files.push({ name: 'xl/workbook.xml',
    data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<bookViews><workbookView activeTab="0" firstSheet="0"/></bookViews>' +
    '<sheets>' + sheetMeta.map((m, i) => '<sheet name="' + _xlsxEsc(m.name) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join('') + '</sheets>' +
    '</workbook>' });
  files.push({ name: 'xl/_rels/workbook.xml.rels',
    data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    sheetMeta.map((m, i) => '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/' + m.file + '"/>').join('') +
    '<Relationship Id="rId' + (sheetMeta.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '</Relationships>' });
  files.push({ name: 'xl/styles.xml', data: _stylesXml() });
  sheetMeta.forEach((m) => files.push({ name: 'xl/worksheets/' + m.file, data: m.xml }));

  const zip = _zipStore(files);
  const blob = new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;a.download = 'My Reflective Journal ' + today + '.xlsx';
  document.body.appendChild(a);a.click();
  setTimeout(() => {document.body.removeChild(a);URL.revokeObjectURL(url);}, 1500);
}
window.exportJournalXlsx = exportJournalXlsx;



/* ══════════════════════════════════════════════════════════════════════
   v29 — Meditate & Reflect components
   ══════════════════════════════════════════════════════════════════════ */

/* A single reflective prompt the reader sits with (no right/wrong answer).
   Prompt text is data-overridable (detail.meditatePrompt / session.reflectionFocus)
   with a gentle generic fallback, so all edits can still live in Data Entry. */
function CR_MeditativeDivision({ div, detail, session, index, divSaved, onDivSave }) {
  const [open, setOpen] = useStateR(index === 1);
  const PassageRef = window.PassageRef;
  const saved = divSaved || {};
  const summary = detail && detail.summary;
  const t = (v) => v && String(v).trim() ? String(v).trim() : '';
  const FALLBACKS = [
  'Read this slowly, even aloud. What does it show you about God — His character, His heart toward His people?',
  'Sit with this part of the passage. Where do you see yourself in it, and what is your honest response to God?',
  'What one phrase here do you want to carry with you today? Tell God why.'];

  const prompt = t(detail && detail.meditatePrompt) || t(session.reflectionFocus) || FALLBACKS[(index - 1) % FALLBACKS.length];
  useEffectR(() => {
    if (open) {
      const tm = setTimeout(() => {try {if (typeof refTagger !== 'undefined' && refTagger.tag) {const el = document.querySelector('.rc-mode__body') || document.body;refTagger.tag(el);}} catch (_) {}}, 180);
      return () => clearTimeout(tm);
    }
  }, [open]);
  return (/*#__PURE__*/
    React.createElement("article", { className: "rc-divcard rc-divcard--med" + (open ? " is-open" : "") }, /*#__PURE__*/
    React.createElement("button", { className: "rc-divcard__head", onClick: () => setOpen((v) => !v), "aria-expanded": open }, /*#__PURE__*/
    React.createElement("span", { className: "rc-divcard__chev" }, open ? "▾" : "▸"), /*#__PURE__*/
    React.createElement("span", { className: "rc-divcard__index" }, index), /*#__PURE__*/
    React.createElement("span", { className: "rc-divcard__range" }, PassageRef ? /*#__PURE__*/React.createElement(PassageRef, { refs: div.range }) : div.range),
    div.title ? /*#__PURE__*/React.createElement("span", { className: "rc-divcard__title" }, div.title) : null
    ),
    open ? /*#__PURE__*/
    React.createElement("div", { className: "rc-divcard__body" }, /*#__PURE__*/
    React.createElement(CR_Collapsible, { label: `Mini Summary — ${div.title || div.range}`, kind: "summary",
      hint: saved.sumRevealed ? "click to hide" : "click to reveal",
      defaultOpen: !!saved.sumRevealed,
      onToggle: (o) => {if (onDivSave) onDivSave({ sumRevealed: o });} },
    summary ? /*#__PURE__*/React.createElement("p", { className: "rc-divcard__summary" }, summary) : /*#__PURE__*/
    React.createElement("p", { className: "rc-divcard__empty" }, "No Mini Summary written for this division yet.")
    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-medprompt" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-medprompt__label" }, "DWELL"), /*#__PURE__*/
    React.createElement("p", { className: "rc-medprompt__text" }, prompt), /*#__PURE__*/
    React.createElement("textarea", {
      className: "rc-medprompt__field", rows: 3,
      placeholder: "Write a sentence or two if you'd like \u2014 just for you, saved locally.",
      value: saved.reflect || '',
      onChange: (e) => {if (onDivSave) onDivSave({ ...saved, reflect: e.target.value });} }
    )
    )
    ) :
    null
    ));

}
window.CR_MeditativeDivision = CR_MeditativeDivision;

/* A simple, calm countdown timer for deliberate reflection. No audio (stays
   quiet and autoplay-safe); finishing shows a gentle "time's up" state. */
function CR_ReflectionTimer({ label, presets }) {
  const opts = presets && presets.length ? presets : [1, 2, 3, 5];
  const [mins, setMins] = useStateR(opts[0]);
  const [left, setLeft] = useStateR(opts[0] * 60);
  const [running, setRunning] = useStateR(false);
  const [done, setDone] = useStateR(false);

  useEffectR(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {setRunning(false);setDone(true);return 0;}
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function choose(m) {setMins(m);setLeft(m * 60);setRunning(false);setDone(false);}
  function startPause() {if (done) {setLeft(mins * 60);setDone(false);setRunning(true);return;}setRunning((r) => !r);}
  function reset() {setLeft(mins * 60);setRunning(false);setDone(false);}

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const total = mins * 60;
  const pct = total ? Math.round((total - left) / total * 100) : 0;

  return (/*#__PURE__*/
    React.createElement("div", { className: "rc-timer" + (done ? " is-done" : "") + (running ? " is-running" : "") }, /*#__PURE__*/
    React.createElement("div", { className: "rc-timer__top" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-timer__label" }, label || 'Reflection timer'), /*#__PURE__*/
    React.createElement("div", { className: "rc-timer__presets", role: "group", "aria-label": "Choose minutes" },
    opts.map((m) => /*#__PURE__*/
    React.createElement("button", { key: m, type: "button",
      className: "rc-timer__preset" + (m === mins ? " is-active" : ""),
      onClick: () => choose(m) }, m, "m")
    )
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-timer__clock", "aria-live": "polite" },
    done ? /*#__PURE__*/React.createElement("span", { className: "rc-timer__doneword" }, "Time\u2019s up \u2014 rest in it.") : /*#__PURE__*/
    React.createElement("span", { className: "rc-timer__digits" }, mm, ":", ss)
    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-timer__track" }, /*#__PURE__*/React.createElement("span", { className: "rc-timer__fill", style: { width: pct + '%' } })), /*#__PURE__*/
    React.createElement("div", { className: "rc-timer__controls" }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "rc-btn rc-btn--primary", onClick: startPause },
    done ? 'Again' : running ? 'Pause' : left < total ? 'Resume' : 'Begin'
    ), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "rc-btn rc-btn--ghost rc-btn--sm", onClick: reset }, "Reset")
    )
    ));

}
window.CR_ReflectionTimer = CR_ReflectionTimer;

/* Set-aside prayer time — frames the timer for prayer and surfaces this
   session's prayer focus (session.prayFor) if present. */
function CR_PrayerTime({ session }) {
  const t = (v) => v && String(v).trim() ? String(v).trim() : '';
  const prayFor = t(session && session.prayFor);
  return (/*#__PURE__*/
    React.createElement("div", { className: "rc-praytime" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-praytime__head" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-praytime__icon", "aria-hidden": "true" }, "\uD83D\uDE4F"), /*#__PURE__*/
    React.createElement("span", { className: "rc-praytime__title" }, "Set aside time to pray")
    ), /*#__PURE__*/
    React.createElement("p", { className: "rc-praytime__lede" }, "Don\u2019t rush past this. Take the passage back to God in your own words \u2014 adoring, confessing, thanking, asking.",


    prayFor ? /*#__PURE__*/React.createElement(React.Fragment, null, " Carry this with you: ", /*#__PURE__*/React.createElement("b", null, prayFor.charAt(0).toUpperCase() + prayFor.slice(1)), ".") : null
    ), /*#__PURE__*/
    React.createElement(CR_ReflectionTimer, { label: "Time to pray", presets: [2, 3, 5, 10] })
    ));

}
window.CR_PrayerTime = CR_PrayerTime;

/* ══════════════════════════════════════════════════════════════════════
   v29 — Session 12: "Review & Reflect"
   Content is condensed to a brief summary + a big-picture view of the
   whole Pentateuch; the weight is on reflection and prayer.
   ══════════════════════════════════════════════════════════════════════ */
function CR_ReviewReflect({ session, sessions, themes, mode, onBack }) {
  const renderMultiline = window.renderMultiline;
  const useLocalStorage = window.useLocalStorage;
  const PassageRef = window.PassageRef;
  const t = (v) => v && String(v).trim() ? String(v).trim() : '';
  const defaultSD = { app: '', app1: '', app2: '', app3: '', acts_a: '', acts_c: '', acts_t: '', acts_s: '', pray: '' };
  const [sd, setSd] = useLocalStorage(window.recapStorageKey ? window.recapStorageKey(session.id, mode) : 'OT_RECAP_v1_' + session.id, defaultSD);
  function patch(u) {setSd((prev) => ({ ...prev, ...u }));}

  useEffectR(() => {if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });}, [session.id]);

  const arcs = window.OT_ARCS || [];
  const story = (sessions || []).filter((s) => s.id >= 2 && s.id <= 11);
  const applyQs = session.applyQuestions && session.applyQuestions.length ?
  session.applyQuestions.filter((q) => t(q)) :
  t(session.ntApplication) ? [session.ntApplication] : [];

  /* v29: placeholder reflective + prayer prompts — overridable from Data Entry
     (session.reviewQuestions / session.prayerPrompts as newline- or array-lists),
     with gentle generic fallbacks so the sections always have something to hold. */
  const asList = (v) => Array.isArray(v) ? v.filter((x) => t(x)) :
  t(v) ? String(v).split(/\n+/).map((x) => x.trim()).filter(Boolean) : [];
  const reviewQs = asList(session.reviewQuestions);
  const reviewQsShown = reviewQs.length ? reviewQs : [
  'Looking back over Genesis to Deuteronomy, where did you most clearly see God\u2019s character and intent?',
  'Where did you see man\u2019s reality \u2014 our sin and need \u2014 most sharply, and how does Christ answer it?',
  'What is the one truth from this whole study you most want to carry forward? Why?'];

  const prayerPrompts = asList(session.prayerPrompts);
  const prayerPromptsShown = prayerPrompts.length ? prayerPrompts : [
  'Adore God for who He has shown Himself to be across the Pentateuch.',
  'Confess where you have lived as though His rule were not good.',
  'Thank Him for Christ, who fulfils every promise.',
  'Ask Him to keep forming this story in you.'];

  const usingPlaceholders = !reviewQs.length || !prayerPrompts.length;

  return (/*#__PURE__*/
    React.createElement("article", { className: "rc-session rc-review2" }, /*#__PURE__*/
    React.createElement("header", { className: "rc-session__bar" }, /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--ghost", onClick: onBack }, "\u2190 back to session list"), /*#__PURE__*/
    React.createElement("span", { className: "rc-session__crumb" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-session__num" }, "SESSION 12"), /*#__PURE__*/
    React.createElement("span", { className: "rc-session__dot" }, "\xB7"), /*#__PURE__*/
    React.createElement("span", { className: "rc-session__topic" }, "Review & Reflect")
    )
    ), /*#__PURE__*/

    React.createElement("section", { className: "rc-review2__hero" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-review2__eyebrow" }, "REVIEW & REFLECT"), /*#__PURE__*/
    React.createElement("h1", { className: "rc-review2__title" }, session.topic || 'The whole story, in one view'),
    t(session.mainPoint) ? /*#__PURE__*/
    React.createElement("blockquote", { className: "rc-review2__mainpoint" }, renderMultiline ? renderMultiline(session.mainPoint) : session.mainPoint) :
    null,
    t(session.keyVerse) ? /*#__PURE__*/React.createElement("p", { className: "rc-review2__verse" }, session.keyVerse) : null
    ), /*#__PURE__*/


    React.createElement("section", { className: "rc-bigpic" }, /*#__PURE__*/
    React.createElement("h2", { className: "rc-bigpic__h" }, "The big picture \u2014 Genesis to Deuteronomy"), /*#__PURE__*/
    React.createElement("p", { className: "rc-bigpic__lede" }, "Read back over the whole journey. Don\u2019t study it line by line \u2014 let the shape of God\u2019s plan come into view."),
    arcs.map((arc) => {
      const inArc = story.filter((s) => s.id >= arc.startSession && s.id <= arc.endSession);
      if (!inArc.length) return null;
      return (/*#__PURE__*/
        React.createElement("div", { key: arc.id, className: "rc-bigpic__arc rc-bigpic__arc--" + arc.id }, /*#__PURE__*/
        React.createElement("div", { className: "rc-bigpic__archead" }, /*#__PURE__*/
        React.createElement("span", { className: "rc-bigpic__arclabel" }, arc.label),
        arc.hint ? /*#__PURE__*/React.createElement("span", { className: "rc-bigpic__archint" }, arc.hint) : null
        ), /*#__PURE__*/
        React.createElement("ol", { className: "rc-bigpic__list" },
        inArc.map((s) => /*#__PURE__*/
        React.createElement("li", { key: s.id, className: "rc-bigpic__item" }, /*#__PURE__*/
        React.createElement("span", { className: "rc-bigpic__num" }, String(s.id).padStart(2, '0')), /*#__PURE__*/
        React.createElement("span", { className: "rc-bigpic__body" }, /*#__PURE__*/
        React.createElement("span", { className: "rc-bigpic__topic" }, s.book, " ", s.chapter, " \xB7 ", s.topic),
        t(s.mainPoint) ? /*#__PURE__*/React.createElement("span", { className: "rc-bigpic__point" }, s.mainPoint) : null
        )
        )
        )
        )
        ));

    })
    ), /*#__PURE__*/


    React.createElement("section", { className: "rc-stillness" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-stillness__eyebrow" }, "BE STILL"), /*#__PURE__*/
    React.createElement("p", { className: "rc-stillness__lede" }, "Having seen the whole sweep of the story, pause. Where has God met you across these sessions? Sit with it before you respond."), /*#__PURE__*/
    React.createElement(CR_ReflectionTimer, { label: "Reflect on the whole journey", presets: [2, 3, 5, 10] })
    ), /*#__PURE__*/


    React.createElement("section", { className: "rc-review2__qs" }, /*#__PURE__*/
    React.createElement("h2", { className: "rc-review2__apply-h" }, "Questions to sit with"),
    !reviewQs.length ? /*#__PURE__*/
    React.createElement("p", { className: "rc-review2__note" }, "These are starter prompts \u2014 add your own under ", /*#__PURE__*/React.createElement("b", null, "reviewQuestions"), " in the Data Entry tab to tailor them.") :
    null,
    reviewQsShown.map((q, i) => /*#__PURE__*/
    React.createElement("div", { key: i, className: "rc-apply__qblock" }, /*#__PURE__*/
    React.createElement("p", { className: "rc-apply__text" }, /*#__PURE__*/React.createElement("span", { className: "rc-apply__qnum" }, i + 1), q), /*#__PURE__*/
    React.createElement("textarea", { className: "rc-apply__input", rows: 3,
      placeholder: "Write your response here \u2014 saved locally in your browser.",
      value: sd['rev' + (i + 1)] || '',
      onChange: (e) => patch({ ['rev' + (i + 1)]: e.target.value }) })
    )
    )
    ),


    applyQs.length ? /*#__PURE__*/
    React.createElement("section", { className: "rc-review2__apply" }, /*#__PURE__*/
    React.createElement("h2", { className: "rc-review2__apply-h" }, "Reflect & respond"),
    applyQs.map((q, i) => /*#__PURE__*/
    React.createElement("div", { key: i, className: "rc-apply__qblock" }, /*#__PURE__*/
    React.createElement("p", { className: "rc-apply__text" }, applyQs.length > 1 ? /*#__PURE__*/React.createElement("span", { className: "rc-apply__qnum" }, i + 1) : null, q), /*#__PURE__*/
    React.createElement("textarea", { className: "rc-apply__input", rows: 3,
      placeholder: "Write your response here \u2014 saved locally in your browser.",
      value: sd['app' + (i + 1)] || (i === 0 ? sd.app || '' : ''),
      onChange: (e) => patch({ ['app' + (i + 1)]: e.target.value }) })
    )
    )
    ) :
    null, /*#__PURE__*/


    React.createElement("section", { className: "rc-review2__pray" }, /*#__PURE__*/
    React.createElement("h2", { className: "rc-review2__pray-h" }, "Pause & pray"), /*#__PURE__*/
    React.createElement("div", { className: "rc-prompts" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-prompts__label" }, "PROMPTS TO PRAY THROUGH"),
    !prayerPrompts.length ? /*#__PURE__*/
    React.createElement("p", { className: "rc-review2__note" }, "Starter prompts \u2014 add your own under ", /*#__PURE__*/React.createElement("b", null, "prayerPrompts"), " in the Data Entry tab.") :
    null, /*#__PURE__*/
    React.createElement("ul", { className: "rc-prompts__list" },
    prayerPromptsShown.map((pp, i) => /*#__PURE__*/
    React.createElement("li", { key: i, className: "rc-prompts__item" }, pp)
    )
    )
    ), /*#__PURE__*/
    React.createElement(CR_ACTSPrayer, { session: session, sd: sd, patch: patch }), /*#__PURE__*/
    React.createElement(CR_PrayerTime, { session: session })
    )
    ));

}
window.CR_ReviewReflect = CR_ReviewReflect;


window.RecapMode = RecapMode;