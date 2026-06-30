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
      • New Testament Fulfilment — type how the study applies to NT
        believers; Christ's fulfilment shows directly, with God's Character
        & Intent vs Mankind's Sinfulness & Limitations in an optional reveal.
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
const CR_TILE_GLYPH = { divisions: '§', mainpoint: '◆', threads: '❖', tension: '✝', apply: '✎', pray: '✦', recap: '↻' };
function CR_SectionTile({ tone, step, label, sublabel, defaultOpen, children }) {
  const [open, setOpen] = useStateR(!!defaultOpen);
  return (/*#__PURE__*/
    React.createElement("article", { className: "rc-tile rc-tile--" + tone + (open ? " is-open" : "") }, /*#__PURE__*/
    React.createElement("span", { className: "rc-tile__watermark", "aria-hidden": "true" }, CR_TILE_GLYPH[tone] || '✦'), /*#__PURE__*/
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
/* Meditate-mode "Pause & Pray": a free prayer ("Commit to God", default) that
   can be toggled to the guided ACTS prayer. Both keep the "take a breath" lede. */
function CR_MeditatePray({ session, sd, patch }) {
  const guided = sd.prayMode === 'acts';
  return (
    React.createElement("div", { className: "rc-medpray" },
    guided ?
    React.createElement(React.Fragment, null,
    React.createElement("button", { className: "rc-medpray__switch", onClick: () => patch({ prayMode: 'commit' }) }, "← Back to writing a prayer"),
    React.createElement(CR_ACTSPrayer, { session: session, sd: sd, patch: patch })
    ) :
    React.createElement(React.Fragment, null,
    React.createElement("div", { className: "rc-acts__stillness" },
    React.createElement("div", { className: "rc-acts__breath-circle", "aria-hidden": "true" }),
    React.createElement("p", { className: "rc-acts__stillness-text" }, "Take a breath. Let the passage settle in your heart before you pray.")
    ),
    React.createElement("p", { className: "rc-medpray__lede" }, "Pause to give thanks and hear what God is saying to you now. Write a prayer in response to Him below, committing this time into His hands."),
    React.createElement("textarea", { className: "rc-medpray__field", rows: 8, placeholder: "Write your prayer here — it’s saved in your browser.", value: sd.commitPrayer || '', onChange: (e) => patch({ commitPrayer: e.target.value }) }),
    (sd.commitPrayer || '').trim() ? React.createElement("span", { className: "rc-acts__step-saved" }, "✓ saved to your browser") : null,
    React.createElement("button", { className: "rc-medpray__switch rc-medpray__switch--guided", onClick: () => patch({ prayMode: 'acts' }) }, "Click here to follow a guided prayer time — Adore, Confess, Thank and Supplicate")
    )
    ));

}

/* Meditate-mode body — given mini-summaries + main point (no blanks), an OT and
   an NT reflective question, the NT link shown directly (with the tension —
   God's intent vs mankind's sinfulness & limitations — in an optional reveal
   when both are present), and Pause & Pray. No flashcards, no further-study,
   no at-a-glance. */
function CR_MeditateBody({ session, sd, patch, themes, pairedDivisions }) {
  const T = (v) => v && String(v).trim() ? String(v).trim() : '';
  const hasTension = !!(T(session.intention) && T(session.reality));
  const summaries = (pairedDivisions || []).map((p) => p.detail).filter((d) => d && T(d.summary));
  const otQ = T(session.otReflectQuestion) || "As you sit with this passage, what does it show you about God — and about yourself?";
  const ntQ = T(session.ntReflectQuestion) || "How does Christ fulfil what you’ve read here, and what does that stir in you?";
  return (
    React.createElement(React.Fragment, null,
    React.createElement("p", { className: "rc-tilegrid__lede" }, "Move through each section gently — there’s no need to finish in one sitting."),
    React.createElement("div", { className: "rc-tilegrid" },

    React.createElement(CR_SectionTile, { tone: "divisions", step: "01", label: "Mini Summaries", sublabel: "The passage, section by section", defaultOpen: true },
    summaries.length ?
    React.createElement("div", { className: "rc-medsum" },
    summaries.map((d, i) =>
    React.createElement("div", { key: i, className: "rc-medsum__item" },
    React.createElement("span", { className: "rc-medsum__div" }, d.title || d.range || ('Section ' + (i + 1))),
    React.createElement("p", { className: "rc-medsum__text" }, d.summary)
    ))
    ) :
    React.createElement("p", { className: "rc-medsum__empty" }, "No mini-summaries recorded for this session yet.")
    ),

    React.createElement(CR_SectionTile, { tone: "mainpoint", step: "02", label: "Main Point", sublabel: "The one big idea of the passage", defaultOpen: true },
    React.createElement("blockquote", { className: "rc-mainpoint__text rc-mainpoint__text--given" },
    renderMultiline ? renderMultiline(session.mainPoint) : React.createElement("p", null, session.mainPoint)
    ),
    session.keyVerse ?
    React.createElement("div", { className: "rc-mainpoint__verse" },
    React.createElement("span", { className: "rc-mainpoint__verse-label" }, "KEY VERSE"),
    React.createElement("p", null, session.keyVerse)
    ) : null
    ),

    React.createElement(CR_SectionTile, { tone: "threads", step: "03", label: "Reflect — Old Testament", sublabel: "Sit with the passage before God", defaultOpen: true },
    React.createElement("p", { className: "rc-medq__prompt" }, otQ),
    React.createElement("textarea", { className: "rc-medq__field", rows: 4, placeholder: "Write your reflection here — it’s saved in your browser.", value: sd.otReflect || '', onChange: (e) => patch({ otReflect: e.target.value }) }),
    (sd.otReflect || '').trim() ? React.createElement("span", { className: "rc-acts__step-saved" }, "✓ saved to your browser") : null
    ),

    React.createElement(CR_SectionTile, { tone: "tension", step: "04", label: "New Testament Fulfilment", sublabel: "How Christ fulfils this passage", defaultOpen: true },
    session.ntPoint ?
    React.createElement("article", { className: "rc-tension__cell rc-tension__cell--resolve" },
    React.createElement("span", { className: "rc-tension__resolve-glyph", "aria-hidden": "true" }, "✝"),
    React.createElement("div", { className: "rc-tension__resolve-body" },
    React.createElement("span", { className: "rc-tension__label" }, "Christ Fulfilment"),
    React.createElement("p", null, session.ntPoint,
    session.ntPassage ? React.createElement(React.Fragment, null, " \xB7 ", PassageRef ? React.createElement(PassageRef, { refs: session.ntPassage }) : session.ntPassage) : null
    )
    )
    ) :
    React.createElement("p", { className: "rc-tension__empty" }, "No New Testament link recorded for this session yet."),
    hasTension ?
    React.createElement(CR_Collapsible, { kind: "tension", hint: "click to reveal", label: "See the tension this resolves — God's Character & Intent vs Mankind's Sinfulness & Limitations" },
    React.createElement("div", { className: "rc-tension__pair rc-tension__pair--reveal" },
    React.createElement("article", { className: "rc-tension__cell rc-tension__cell--intent" },
    React.createElement("span", { className: "rc-tension__label" }, "God's Character & Intent"),
    React.createElement("p", null, session.intention)
    ),
    React.createElement("span", { className: "rc-tension__sep", "aria-hidden": "true" }, "⇄"),
    React.createElement("article", { className: "rc-tension__cell rc-tension__cell--reality" },
    React.createElement("span", { className: "rc-tension__label" }, "Mankind's Sinfulness & Limitations"),
    React.createElement("p", null, session.reality)
    )
    )
    ) : null
    ),

    React.createElement(CR_SectionTile, { tone: "apply", step: "05", label: "Reflect — New Testament", sublabel: "How does Christ meet you here?", defaultOpen: true },
    React.createElement("p", { className: "rc-medq__prompt" }, ntQ),
    React.createElement("textarea", { className: "rc-medq__field", rows: 4, placeholder: "Write your reflection here — it’s saved in your browser.", value: sd.ntReflect || '', onChange: (e) => patch({ ntReflect: e.target.value }) }),
    (sd.ntReflect || '').trim() ? React.createElement("span", { className: "rc-acts__step-saved" }, "✓ saved to your browser") : null
    ),

    React.createElement(CR_SectionTile, { tone: "pray", step: "06", label: "Pause & Pray", sublabel: "Set aside time to pray it back to God", defaultOpen: true },
    React.createElement(CR_MeditatePray, { session: session, sd: sd, patch: patch }),
    React.createElement(CR_PrayerTime, { session: session })
    )

    )
    ));

}

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

  const [openMap, setOpenMap] = useStateR(() => ({}));
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
      const isOpen = !!openMap[i];
      const val = sd[step.key] || '';
      const hasContent = val.trim().length > 0;
      return (/*#__PURE__*/
        React.createElement("div", { key: i, className: "rc-acts__step" + (isOpen ? " is-open" : "") + (hasContent ? " has-content" : ""),
          style: { '--step-color': step.color } }, /*#__PURE__*/
        React.createElement("button", { className: "rc-acts__step-head", onClick: () => setOpenMap((m) => Object.assign({}, m, { [i]: !m[i] })) }, /*#__PURE__*/
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
    myDivAttempt: '',
    otReflect: '', ntReflect: '', commitPrayer: '', prayMode: 'commit'
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
    'Reset all your Study answers for this session? This cannot be undone. (Your Meditate notes are kept separately and are not affected.)';
    if (window.confirm(msg)) {
      setSd(defaultSD);
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


    !meditate ? /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
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
    )
    ) : null,



    meditate ? /*#__PURE__*/
    React.createElement("section", { className: "rc-stillness" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-stillness__eyebrow" }, "BE STILL"), /*#__PURE__*/
    React.createElement("p", { className: "rc-stillness__lede" }, "Before you read and reflect, set aside a moment of quiet. Breathe slowly. Ask God to meet you in His word \u2014 then begin, unhurried."


    )
    ) :
    null, /*#__PURE__*/

    meditate ? /*#__PURE__*/
    React.createElement(CR_MeditateBody, { session: session, sd: sd, patch: patch, themes: themes, pairedDivisions: pairedDivisions }) :
    null, /*#__PURE__*/


    !meditate ? /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("p", { className: "rc-tilegrid__lede" }, "Pick a section to work through."), /*#__PURE__*/
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


    React.createElement(CR_SectionTile, { tone: "tension", step: "04", label: "New Testament Fulfilment", sublabel: "How this passage applies to us, resolved in Christ" }, /*#__PURE__*/
    React.createElement(CR_Scratchpad, {
      label: "How do you think this study applies to us as New Testament believers?",
      placeholder: "Write your reflection \u2014 how does Christ fulfil this passage for us today?\u2026",
      value: tensionAttempt,
      onChange: (v) => patch({ ten: v }),
      rows: 4 }
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
    ) : /*#__PURE__*/
    React.createElement("p", { className: "rc-tension__empty" }, "No New Testament link recorded for this session yet."),
    session.intention || session.reality ? /*#__PURE__*/
    React.createElement(CR_Collapsible, { kind: "tension", hint: "click to reveal", label: "See the tension this resolves \u2014 God's Character & Intent vs Mankind's Sinfulness & Limitations" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-tension__pair rc-tension__pair--reveal" }, /*#__PURE__*/
    React.createElement("article", { className: "rc-tension__cell rc-tension__cell--intent" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-tension__label" }, "God's Character & Intent"), /*#__PURE__*/
    React.createElement("p", null, session.intention || /*#__PURE__*/React.createElement("em", { className: "rc-tension__empty" }, "\u2014 not foregrounded in this passage \u2014"))
    ), /*#__PURE__*/
    React.createElement("span", { className: "rc-tension__sep", "aria-hidden": "true" }, "\u21C4"), /*#__PURE__*/
    React.createElement("article", { className: "rc-tension__cell rc-tension__cell--reality" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-tension__label" }, "Mankind's Sinfulness & Limitations"), /*#__PURE__*/
    React.createElement("p", null, session.reality || /*#__PURE__*/React.createElement("em", { className: "rc-tension__empty" }, "\u2014 not foregrounded in this passage \u2014"))
    )
    )
    ) :
    null

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
    )

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
    )
    ) : null, /*#__PURE__*/


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
      meditate ? (
      (window.sessionHasAnyInput && window.sessionHasAnyInput(s.id, mode)) ? /*#__PURE__*/
      React.createElement("span", { className: "rc-picker__visited", onClick: (e) => e.stopPropagation() }, /*#__PURE__*/
      React.createElement("span", { className: "rc-picker__visited-dot", "aria-hidden": "true" }), "Visited") :
      null) :
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
    window.HelpTourButton ? /*#__PURE__*/React.createElement(window.HelpTourButton, { tour: "recap", label: "Tour" }) : null, /*#__PURE__*/
    React.createElement("header", { className: "rc-picker__head" },
    ProgressRing && !meditate ? /*#__PURE__*/
    React.createElement("div", { className: "rc-picker__overall" }, /*#__PURE__*/
    React.createElement(ProgressRing, { pct: overallPct, size: 52, strokeW: 5 }), /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__overall-label" }, "overall", /*#__PURE__*/React.createElement("br", null), "progress")
    ) :
    null, /*#__PURE__*/
    React.createElement("div", { className: "rc-picker__masthead hero-band", style: { '--hero-img': 'url("assets/img/gen1.webp")' } }, /*#__PURE__*/
    React.createElement("span", { className: "hero-band__glow", "aria-hidden": "true" }), /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__eyebrow" }, "RECAP MODE"), /*#__PURE__*/
    React.createElement("h1", { className: "rc-picker__title" }, meditate ? "Meditate & Reflect Mode" : "Study & Reflect Mode"), /*#__PURE__*/
    React.createElement("p", { className: "rc-picker__modesub" }, meditate ? "For those who have been through a session." : "For working through a session in depth."), /*#__PURE__*/
    !meditate ? /*#__PURE__*/
    React.createElement("p", { className: "rc-picker__modewarn" }, "Note: Strongly recommended to study God’s Word in depth with others.") :
    null, /*#__PURE__*/
    React.createElement("details", { className: "rc-picker__more" }, /*#__PURE__*/
    React.createElement("summary", { className: "rc-picker__more-summary" }, "More details"), /*#__PURE__*/
    React.createElement("ul", { className: "rc-picker__more-list" },
    meditate ? [/*#__PURE__*/
    React.createElement("li", { key: "a" }, /*#__PURE__*/React.createElement("b", null, "Aim:"), " Spend time with God intentionally over the main truths of each session."), /*#__PURE__*/
    React.createElement("li", { key: "b" }, "Fewer and more intentional questions."), /*#__PURE__*/
    React.createElement("li", { key: "c" }, "Notes kept separate from Study & Reflect mode.")] : [/*#__PURE__*/
    React.createElement("li", { key: "a" }, /*#__PURE__*/React.createElement("b", null, "Aim:"), " In depth study of God’s Word with a time of reflection."), /*#__PURE__*/
    React.createElement("li", { key: "d" }, "Set aside a considerable amount of time to work through the sessions in depth and reflect."), /*#__PURE__*/
    React.createElement("li", { key: "b" }, "Guided questions, with thread and answer reveals, one session at a time."), /*#__PURE__*/
    React.createElement("li", { key: "c" }, "Notes kept separate from Meditate & Reflect mode.")]
    )
    )
    ), /*#__PURE__*/

    onOpenJournal ? /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--journal", onClick: onOpenJournal }, /*#__PURE__*/
    React.createElement("span", { className: "rc-btn--journal__icon", "aria-hidden": "true" }, "\u270D"), "My Journal \u2014 Click here to manage what I have written"

    ) :
    null
    ),


    sessionOne ? /*#__PURE__*/
    React.createElement("button", { className: "rc-picker__introrow", onClick: () => onPick(1) }, /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__num" }, "01"), /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__body" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-picker__topic" }, "Introduction \u2014 Why OT?")
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

/* recapJournalGroups: turns ONE session's saved answers (sd) into labelled,
   grouped entries. Shared by the on-screen Journal and the Excel export so the
   two never drift. Returns [] when nothing has been written. */
function recapJournalGroups(s, sd) {
  s = s || {};sd = sd || {};
  const T = (v) => v && String(v).trim() ? String(v).trim() : '';
  const applyQs = s.applyQuestions && s.applyQuestions.length ?
  s.applyQuestions :
  s.ntApplication ? [s.ntApplication] : [];
  const groups = [];
  const reflect = [];
  if (T(sd.mp)) reflect.push({ label: 'Main Point — your guess', value: T(sd.mp) });
  if (T(sd.ten)) reflect.push({ label: 'Tension & NT — your reflection', value: T(sd.ten) });
  if (T(sd.myDivAttempt)) reflect.push({ label: 'Passage divisions — your attempt', value: T(sd.myDivAttempt) });
  if (T(sd.otReflect)) reflect.push({ label: 'Old Testament reflection', value: T(sd.otReflect) });
  if (T(sd.ntReflect)) reflect.push({ label: 'New Testament reflection', value: T(sd.ntReflect) });
  if (reflect.length) groups.push({ group: 'Reflections', color: 'var(--c-promises)', items: reflect });
  const apply = [];
  ['app1', 'app2', 'app3'].forEach((k, i) => {
    const v = sd[k] || (i === 0 ? sd.app : '');
    if (T(v)) apply.push({ label: applyQs[i] ? 'Q' + (i + 1) + ' · ' + applyQs[i] : 'Apply ' + (i + 1), value: T(v) });
  });
  if (apply.length) groups.push({ group: 'Apply to Me', color: 'var(--c-nt)', items: apply });
  const pray = [];
  [['acts_a', 'Adore'], ['acts_c', 'Confess'], ['acts_t', 'Thank'], ['acts_s', 'Supplicate']].forEach(([k, lab]) => {
    if (T(sd[k])) pray.push({ label: lab, value: T(sd[k]) });
  });
  if (T(sd.pray)) pray.push({ label: 'Prayer', value: T(sd.pray) });
  if (T(sd.commitPrayer)) pray.push({ label: 'Prayer (Commit to God)', value: T(sd.commitPrayer) });
  if (pray.length) groups.push({ group: 'Pause & Pray', color: 'var(--c-intention)', items: pray });
  return groups;
}
window.recapJournalGroups = recapJournalGroups;

/* Groups kept when the "Apply & Pray only" filter is on. */
const JOURNAL_FOCUS_GROUPS = ['Apply to Me', 'Pause & Pray'];

function CR_JournalRollup({ sessions, onBack }) {
  const [applyPrayOnly, setApplyPrayOnly] = useStateR(false);
  const [helpOpen, setHelpOpen] = useStateR(false);

  function readSD(id, mode) {
    try {
      const key = window.recapStorageKey ? window.recapStorageKey(id, mode) :
      (mode === 'meditate' ? 'OT_RECAP_MED_v1_' : 'OT_RECAP_v1_') + id;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {return {};}
  }
  const MODES = [['study', 'Study'], ['meditate', 'Meditate']];
  const rows = (sessions || []).map((s) => {
    const blocks = [];
    MODES.forEach(([m, modeLabel]) => {
      let groups = recapJournalGroups(s, readSD(s.id, m));
      if (applyPrayOnly) groups = groups.filter((g) => JOURNAL_FOCUS_GROUPS.indexOf(g.group) !== -1);
      if (groups.length) blocks.push({ mode: m, modeLabel: modeLabel, groups: groups });
    });
    return { session: s, blocks };
  }).filter((r) => r.blocks.length);

  return (/*#__PURE__*/
    React.createElement("section", { className: "rc-journal" }, /*#__PURE__*/
    React.createElement("header", { className: "rc-journal__bar" }, /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--ghost", onClick: onBack }, "\u2190 back to session list"), /*#__PURE__*/
    React.createElement("div", { className: "rc-journal__actions" }, /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--primary rc-btn--sm", onClick: () => window.OT_exportAnswers && window.OT_exportAnswers(), title: "Save a backup file of all your answers" }, "\u2b07 Export backup"), /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--primary rc-btn--sm", onClick: () => window.OT_importAnswers && window.OT_importAnswers(), title: "Restore answers from a backup file" }, "\u2b06 Import backup"), /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--journal rc-btn--export rc-btn--sm", onClick: () => window.exportJournalXlsx(sessions), title: "Download a readable Excel copy" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-btn--journal__icon", "aria-hidden": "true" }, "\u2913"), "Excel"
    ), /*#__PURE__*/
    React.createElement("button", { className: "rc-journal__help-btn", onClick: () => setHelpOpen((v) => !v), "aria-expanded": helpOpen, "aria-label": "How this journal works — saving and moving your answers" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__help-q", "aria-hidden": "true" }, "?"), /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__help-btn-txt" }, helpOpen ? "Close" : "How this works"))
    )
    ),
    helpOpen ? /*#__PURE__*/
    React.createElement("div", { className: "rc-journal__help", role: "region", "aria-label": "How this journal works" }, /*#__PURE__*/
    React.createElement("button", { className: "rc-journal__help-close", onClick: () => setHelpOpen(false), "aria-label": "Close help" }, "\u2715"), /*#__PURE__*/
    React.createElement("h3", { className: "rc-journal__help-title" }, "How your Journal works"), /*#__PURE__*/
    React.createElement("ul", { className: "rc-journal__help-list" }, /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "What you see here \u2014 "), "every answer you\u2019ve typed across all sessions, gathered in one place and grouped by session. Both ", /*#__PURE__*/React.createElement("b", null, "Study"), " and ", /*#__PURE__*/React.createElement("b", null, "Meditate"), " entries are shown, each tagged with its mode."), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Apply & Pray only \u2014 "), "flip the toggle to hide everything except your ", /*#__PURE__*/React.createElement("b", null, "Apply to Me"), " commitments and ", /*#__PURE__*/React.createElement("b", null, "Pause & Pray"), " prayers \u2014 handy for a quick devotional review."), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Export backup \u2014 "), "saves a single ", /*#__PURE__*/React.createElement("b", null, ".json"), " file with ", /*#__PURE__*/React.createElement("em", null, "all"), " your answers. Keep it safe, or use it to move your journal to another device or browser."), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Import backup \u2014 "), "loads a ", /*#__PURE__*/React.createElement("b", null, ".json"), " file you exported earlier (e.g. on your phone) back into this browser. You\u2019ll be asked to confirm before anything changes."), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Excel \u2014 "), "downloads a readable spreadsheet (one sheet per session) for printing or sharing. It ", /*#__PURE__*/React.createElement("em", null, "cannot"), " be imported back \u2014 use ", /*#__PURE__*/React.createElement("b", null, "Export backup"), " to switch devices."), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Editing \u2014 "), "to change or add to an entry, open that session and edit it there."), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Privacy \u2014 "), "your answers live only in this browser. Nothing is uploaded anywhere unless you choose to share a backup file yourself.")
    )
    ) :
    null, /*#__PURE__*/
    React.createElement("div", { className: "rc-journal__intro" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__eyebrow" }, "MY JOURNAL"), /*#__PURE__*/
    React.createElement("h2", { className: "rc-journal__title" }, "View & manage all my inputs"), /*#__PURE__*/
    React.createElement("p", { className: "rc-journal__lede" }, "Everything you\u2019ve written \u2014 reflections, commitments, and prayers \u2014 collected from every session, in both Study and Meditate mode. It all stays in this browser unless you export a backup."), /*#__PURE__*/
    React.createElement("div", { className: "rc-journal__toggle" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__toggle-label" }, "Show"), /*#__PURE__*/
    React.createElement("div", { className: "rc-segmented", role: "group", "aria-label": "Filter journal entries" }, /*#__PURE__*/
    React.createElement("button", { className: "rc-segmented__btn" + (applyPrayOnly ? '' : ' is-active'), "aria-pressed": !applyPrayOnly, onClick: () => setApplyPrayOnly(false) }, "Everything"), /*#__PURE__*/
    React.createElement("button", { className: "rc-segmented__btn" + (applyPrayOnly ? ' is-active' : ''), "aria-pressed": applyPrayOnly, onClick: () => setApplyPrayOnly(true) }, "Apply & Pray only")
    )
    )
    ),
    !rows.length ? /*#__PURE__*/
    React.createElement("div", { className: "rc-journal__empty" }, /*#__PURE__*/
    React.createElement("p", null, applyPrayOnly ? "No \u201cApply to Me\u201d or \u201cPause & Pray\u201d entries yet." : "No journal entries yet."), /*#__PURE__*/
    React.createElement("p", null, "Open a session and write in the ", /*#__PURE__*/React.createElement("b", null, "Apply to Me"), " or ", /*#__PURE__*/React.createElement("b", null, "Pause & Pray"), " sections to start your journal.")
    ) : /*#__PURE__*/

    React.createElement("div", { className: "rc-journal__entries" },
    rows.map(({ session, blocks }) => /*#__PURE__*/
    React.createElement("article", { key: session.id, className: "rc-journal__session" }, /*#__PURE__*/
    React.createElement("header", { className: "rc-journal__session-head" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__session-num" }, "S", String(session.id).padStart(2, '0')), /*#__PURE__*/
    React.createElement("div", { className: "rc-journal__session-text" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__session-topic" }, session.topic), /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__session-passage" }, session.book, " ", session.chapter)
    )
    ),
    blocks.map(({ mode, modeLabel, groups }) => /*#__PURE__*/
    React.createElement("div", { key: mode, className: "rc-journal__modeblock" },
    blocks.length > 1 || mode === 'meditate' ? /*#__PURE__*/
    React.createElement("span", { className: "rc-journal__modetag rc-journal__modetag--" + mode }, modeLabel, " mode") :
    null,
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
    )
    )

    ));

}

/* ────────────────── Outer component ────────────────── */

function RecapMode({ sessions, themes, onExit, initialSession, onSessionChange, onGotoIntro, initialMode, onModeChange, initialJournalOpen }) {
  const [selected, setSelected] = useStateR(initialSession || null);
  const [journalOpen, setJournalOpen] = useStateR(!!initialJournalOpen);
  const [mode, setMode] = useStateR(initialMode || (window.getRecapMode ? window.getRecapMode() : 'meditate'));
  const [studyNotice, setStudyNotice] = useStateR(false);
  const session = selected ? sessions.find((s) => s.id === selected) : null;

  /* persist + broadcast mode (for deep-link hash) */
  function chooseMode(m) {
    /* Switching from Meditate & Reflect → Study & Reflect surfaces a one-time
       reminder that in-depth study is best done alongside someone else. */
    if (m === 'study' && mode === 'meditate') setStudyNotice(true);
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
    React.createElement("div", { className: "rc-mode rc-mode--" + mode, role: "region", "aria-label": "Recap Mode" },
    studyNotice ? ReactDOM.createPortal( /*#__PURE__*/
    React.createElement("div", { className: "rc-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "rc-modal-title", onClick: () => setStudyNotice(false) }, /*#__PURE__*/
    React.createElement("div", { className: "rc-modal__box", onClick: (e) => e.stopPropagation() }, /*#__PURE__*/
    React.createElement("h2", { id: "rc-modal-title", className: "rc-modal__title" }, "Study & Reflect Mode"), /*#__PURE__*/
    React.createElement("p", { className: "rc-modal__body" }, "Note: This mode is for studying God’s Word in depth. It is strongly recommended to study God’s Word in depth with someone else who has been through the study before."), /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-modal__ok", onClick: () => setStudyNotice(false) }, "Got it")
    )
    ), document.body) :
    null, /*#__PURE__*/
    React.createElement("header", { className: "rc-mode__topbar" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-mode__topnav" }, /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--ghost", onClick: onExit }, "\u2190 exit recap mode"),
    session && !journalOpen ? /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--backlist", onClick: () => setSelected(null) }, "\u2261 back to session list") :
    null
    ), /*#__PURE__*/
    React.createElement("span", { className: "rc-mode__title" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-mode__glyph" }, "\u21BB"), "Recap Mode"

    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-modetoggle-wrap" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-modetoggle__label" }, "Toggle Between 2 Modes here:"), /*#__PURE__*/
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
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "rc-mode__body" },
    journalOpen ? /*#__PURE__*/
    React.createElement(CR_JournalRollup, { sessions: sessions, onBack: () => setJournalOpen(false) }) :
    !session ? /*#__PURE__*/
    React.createElement(CR_Picker, { sessions: sessions, themes: themes, mode: mode, onPick: pick, onOpenJournal: () => setJournalOpen(true) }) :
    session.id === 12 ? /*#__PURE__*/
    React.createElement(CR_ReviewReflect, { key: 'meditate:' + session.id, session: session, sessions: sessions, themes: themes, mode: 'meditate', onBack: () => setSelected(null) }) : /*#__PURE__*/

    React.createElement(CR_SessionRecap, { key: mode + ':' + session.id, session: session, sessions: sessions, themes: themes, mode: mode, onBack: () => setSelected(null) })

    )
    ));

}

/* Flashcards ("Test Yourself") were removed from the app on 2026-06-23.
   The full feature is archived in archive/flashcards.js (with restore notes). */


/* ───────────── Reflective Journal → Excel export ─────────────
   Collects the same data the Journal page renders, then writes a real
   .xlsx (README sheet first/active, one sheet per session).            */
function collectJournal(sessions) {
  function readSD(id, mode) {
    try {
      const key = window.recapStorageKey ? window.recapStorageKey(id, mode) :
      (mode === 'meditate' ? 'OT_RECAP_MED_v1_' : 'OT_RECAP_v1_') + id;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {return {};}
  }
  const MODES = [['study', 'Study'], ['meditate', 'Meditate']];
  return (sessions || []).map((s) => {
    const groups = [];
    MODES.forEach(([m, modeLabel]) => {
      recapJournalGroups(s, readSD(s.id, m)).forEach((g) => {
        groups.push([g.group + ' · ' + modeLabel + ' mode', g.items.map((it) => [it.label, it.value])]);
      });
    });
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
    React.createElement("p", { className: "rc-praytime__journal" }, "Your reflection and prayers can be revisited in ", /*#__PURE__*/React.createElement("b", null, "“My Journal”"), ".")
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

  /* Highlight one word inside a question, coloured by its thread. */
  function hl(text, word, thread) {
    const parts = String(text).split(word);
    const out = [];
    parts.forEach((p, i) => {
      if (p) out.push(p);
      if (i < parts.length - 1) out.push(
      React.createElement("strong", { key: 'h' + i, className: "rc-rev__hl rc-rev__hl--" + thread }, word));
    });
    return out;
  }
  const refEl = (r) => PassageRef ? React.createElement(PassageRef, { refs: r }) : r;

  const otQs = [
  { text: "How have you grown in appreciation of God’s pattern of Salvation throughout these books?", word: "Salvation", thread: "salvation", key: "otrev1" },
  { text: "What has struck you about God’s character as we read about his covenants and Promises to his people?", word: "Promises", thread: "promises", key: "otrev2" },
  { text: "How has what we’ve seen helped you to long for God’s Kingdom?", word: "Kingdom", thread: "kingdom", key: "otrev3" }];

  const tensionQs = [
  "How can the holy God dwell with sinful humanity?",
  "How can merciful and gracious Yahweh also justly visit the sins of the guilty — all at the same time?"];

  const hebItems = [
  { t: "The Better Tent", ref: "Hebrews 8:1-6", note: "The earthly tabernacle was only a copy and shadow of the real thing. Christ now ministers in the true, heavenly sanctuary set up by the Lord, not by man." },
  { t: "The Better Covenant", ref: "Hebrews 8:7-13", note: "The first covenant was broken by the people. Christ mediates a new and better covenant — God's law written on our hearts, and our sins remembered no more." },
  { t: "The Better High Priest", ref: "Hebrews 9:11-27", note: "Where the old priests had to repeat their offerings again and again, Christ entered the Most Holy Place once for all by His own blood, securing an eternal redemption." },
  { t: "The Better Sacrifice", ref: "Hebrews 10:12-14", note: "The blood of bulls and goats could never truly take away sin. Christ's single sacrifice, offered once, perfects for all time those who are being made holy." },
  { t: "Better and Confident access to God", ref: "Hebrews 10:19-22", note: "Because of all the above — the curtain torn open in His flesh — we may now draw near to God with full confidence through the blood of Jesus.", full: true }];

  const kingdomItems = [
  { t: "Law fulfilled", ref: "Matthew 5:17", note: "Christ came not to abolish the Law and the Prophets but to fulfil them — perfectly keeping the law and embodying everything it pointed forward to." },
  { t: "God’s kingdom order established through a fulfilled law", ref: "Romans 8:3-4", note: "What the law, weakened by our sinful flesh, could never do, God did by sending His own Son. Now the law's righteous requirement is fulfilled in us who walk by the Spirit — His good kingdom order being restored." }];

  return (/*#__PURE__*/
    React.createElement("article", { className: "rc-session rc-review2" }, /*#__PURE__*/
    React.createElement("header", { className: "rc-session__bar" }, /*#__PURE__*/
    React.createElement("button", { className: "rc-btn rc-btn--ghost", onClick: onBack }, "← back to session list"), /*#__PURE__*/
    React.createElement("span", { className: "rc-session__crumb" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-session__num" }, "SESSION 12"), /*#__PURE__*/
    React.createElement("span", { className: "rc-session__dot" }, "\xB7"), /*#__PURE__*/
    React.createElement("span", { className: "rc-session__topic" }, "Pentateuch Review")
    )
    ), /*#__PURE__*/

    React.createElement("section", { className: "rc-review2__hero" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-review2__eyebrow" }, "MEDITATE & REFLECT \xB7 PENTATEUCH REVIEW"), /*#__PURE__*/
    React.createElement("h1", { className: "rc-review2__title" }, session.topic || 'The whole story, in one view'),
    t(session.mainPoint) ? /*#__PURE__*/
    React.createElement("blockquote", { className: "rc-review2__mainpoint" }, renderMultiline ? renderMultiline(session.mainPoint) : session.mainPoint) :
    null,
    t(session.keyVerse) ? /*#__PURE__*/React.createElement("p", { className: "rc-review2__verse" }, session.keyVerse) : null
    ), /*#__PURE__*/


    React.createElement("section", { className: "rc-review2__bigpic" }, /*#__PURE__*/
    React.createElement("h2", { className: "rc-bigpic__h" }, "The Big Picture — the whole Pentateuch in one view"), /*#__PURE__*/
    React.createElement("p", { className: "rc-bigpic__nav" }, "Freely navigate this big picture view by mousing over the dots, then reflect on the 3 questions below."),
    window.BigPictureView ? /*#__PURE__*/
    React.createElement(window.BigPictureView, { sessions: sessions, themes: themes, embedded: true }) : /*#__PURE__*/
    React.createElement("p", { className: "rc-medsum__empty" }, "Big Picture view unavailable.")
    ), /*#__PURE__*/


    React.createElement("div", { className: "rc-tilegrid" }, /*#__PURE__*/

    React.createElement(CR_SectionTile, { tone: "threads", step: "01", label: "Reflect — Old Testament", sublabel: "Sit with the whole journey before God", defaultOpen: true },
    otQs.map((q) => /*#__PURE__*/
    React.createElement("div", { key: q.key, className: "rc-medq__block" }, /*#__PURE__*/
    React.createElement("p", { className: "rc-medq__prompt" }, hl(q.text, q.word, q.thread)), /*#__PURE__*/
    React.createElement("textarea", { className: "rc-medq__field", rows: 3, placeholder: "Write your reflection here — it’s saved in your browser.", value: sd[q.key] || '', onChange: (e) => patch({ [q.key]: e.target.value }) }),
    (sd[q.key] || '').trim() ? /*#__PURE__*/React.createElement("span", { className: "rc-acts__step-saved" }, "✓ saved to your browser") : null
    ))
    ), /*#__PURE__*/

    React.createElement(CR_SectionTile, { tone: "tension", step: "02", label: "New Testament Fulfilment — Tensions", sublabel: "The two great questions of the Pentateuch", defaultOpen: true }, /*#__PURE__*/
    React.createElement("div", { className: "rc-ntbox rc-ntbox--tension" }, /*#__PURE__*/
    React.createElement("ul", { className: "rc-ntbox__qs" },
    tensionQs.map((q, i) => /*#__PURE__*/React.createElement("li", { key: i, className: "rc-ntbox__q" }, q))
    ), /*#__PURE__*/
    React.createElement("blockquote", { className: "rc-ntbox__verse" }, "“For from his fullness we have all received, grace upon grace. For the law was given through Moses; grace and truth came through Jesus Christ.” (John 1:16-17).")
    )
    ), /*#__PURE__*/

    React.createElement(CR_SectionTile, { tone: "tension", step: "03", label: "New Testament Fulfilment — Salvation through Christ", sublabel: "Click each to reveal where Christ fulfils it", defaultOpen: true }, /*#__PURE__*/
    React.createElement("div", { className: "rc-ntbox rc-ntbox--salv" },
    hebItems.map((h, i) => /*#__PURE__*/
    React.createElement(CR_Collapsible, { key: i, kind: "reveal", hint: "click to reveal", label: h.t }, /*#__PURE__*/
    React.createElement("p", { className: "rc-ntbox__note" }, h.note), /*#__PURE__*/
    React.createElement("p", { className: "rc-ntbox__reveal" }, refEl(h.ref)),
    h.full ? /*#__PURE__*/
    React.createElement("blockquote", { className: "rc-ntbox__fullverse" }, /*#__PURE__*/
    React.createElement("mark", { className: "rc-ntbox__mk" }, "Therefore"),
    ", brothers, since we have confidence to enter the holy places by the blood of Jesus, by the new and living way that he opened for us through the curtain, that is, through his flesh, and since we have a great priest over the house of God, ", /*#__PURE__*/
    React.createElement("mark", { className: "rc-ntbox__mk rc-ntbox__mk--key" }, "let us draw near with a true heart in full assurance of faith"),
    ", with our hearts sprinkled clean from an evil conscience and our bodies washed with pure water.", /*#__PURE__*/
    React.createElement("cite", { className: "rc-ntbox__fullverse-cite" }, "Hebrews 10:19-22, ESV")
    ) :
    null
    )), /*#__PURE__*/
    React.createElement("div", { className: "rc-ntbox__summary" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-ntbox__summary-label" }, "Summary — how the Pentateuch teaches us about God’s work to save us from our sins:"), /*#__PURE__*/
    React.createElement("p", null, "Because of the Better Tent, that our Better Priest entered into, with Himself the Better Sacrifice, we have a Better Covenant written on our hearts…"), /*#__PURE__*/
    React.createElement("p", null, "So draw near to God with our Better Access to the Father through Christ!")
    )
    )
    ), /*#__PURE__*/

    React.createElement(CR_SectionTile, { tone: "tension", step: "04", label: "New Testament Fulfilment — God’s promised Kingdom", sublabel: "The law fulfilled in Christ", defaultOpen: true }, /*#__PURE__*/
    React.createElement("div", { className: "rc-ntbox rc-ntbox--kingdom" }, /*#__PURE__*/
    React.createElement("ul", { className: "rc-ntbox__list" },
    kingdomItems.map((k, i) => /*#__PURE__*/
    React.createElement("li", { key: i, className: "rc-ntbox__item" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-ntbox__item-t" }, k.t), /*#__PURE__*/
    React.createElement("span", { className: "rc-ntbox__item-ref" }, refEl(k.ref)), /*#__PURE__*/
    React.createElement("p", { className: "rc-ntbox__item-note" }, k.note)
    ))
    )
    )
    ), /*#__PURE__*/

    React.createElement(CR_SectionTile, { tone: "apply", step: "05", label: "Reflection — New Testament", sublabel: "How has Christ met you across this journey?", defaultOpen: true }, /*#__PURE__*/
    React.createElement("p", { className: "rc-medq__prompt" }, "Share one aspect of the journey so far in the OT that has impacted your heart — what about our God have you seen anew or refreshed?"), /*#__PURE__*/
    React.createElement("textarea", { className: "rc-medq__field", rows: 4, placeholder: "Write your reflection here — it’s saved in your browser.", value: sd.ntrev || '', onChange: (e) => patch({ ntrev: e.target.value }) }),
    (sd.ntrev || '').trim() ? /*#__PURE__*/React.createElement("span", { className: "rc-acts__step-saved" }, "✓ saved to your browser") : null
    ), /*#__PURE__*/

    React.createElement(CR_SectionTile, { tone: "pray", step: "06", label: "Pause & Pray", sublabel: "Set aside time to pray it back to God", defaultOpen: true }, /*#__PURE__*/
    React.createElement(CR_MeditatePray, { session: session, sd: sd, patch: patch }), /*#__PURE__*/
    React.createElement(CR_PrayerTime, { session: session })
    )

    )
    ));

}
window.CR_ReviewReflect = CR_ReviewReflect;


window.RecapMode = RecapMode;