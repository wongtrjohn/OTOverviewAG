/* ══════════════════════════════════════════════════════════════════════
   ARCHIVED — Flashcards ("Test Yourself") feature.  NOT loaded by the app.
   Removed from the live site on 2026-06-23. Kept here so it can be restored.

   WHAT THIS WAS
   - A study-mode "Test Yourself" section tile that built a flip-card deck for
     the session (mini-summaries, main point, threads, tension, NT fulfilment,
     apply-to-me). Casual recall; answers saved per session under
     localStorage key  OT_FLASH_v1_<sessionId>  (nothing scored).

   HOW TO RESTORE
   1. Load this file in index.html (after assets/js/app/04-recap.js):
        <script src="archive/flashcards.js"></script>
      (or paste buildFlashcards + CR_FlashcardDeck back into 04-recap.js).
   2. Re-add the "Test Yourself" tile inside CR_SessionRecap's study tilegrid,
      after the "Pause & Pray" tile:

        !meditate ? (() => {
          const fcards = window.buildFlashcards(session, themes);
          if (!fcards.length) return null;
          return (
            React.createElement(CR_SectionTile, { tone: "recap", step: "07", label: "Test Yourself", sublabel: `Flip ${fcards.length} flashcards — casual recall` },
            React.createElement(CR_FlashcardDeck, { session: session, themes: themes })
            ));
        })() : null,

   3. (Optional) Re-add the reset cleanup in handleReset():
        if (!meditate) { try { localStorage.removeItem('OT_FLASH_v1_' + session.id); } catch (e) {} }
   4. The flashcard CSS (.rc-fc__*, .rc-fccard__*, .rc-fcdot) is still present in
      index.html — it was left in place, so no CSS changes are needed to restore.
   5. (Optional) The old guided-tour steps that pointed at a Recall Dashboard
      (.rc-fcov / .rc-mdash) were already orphaned before removal and are not
      included here.
   ══════════════════════════════════════════════════════════════════════ */

const { useState: useStateR, useMemo: useMemoR } = React;

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
    return /*#__PURE__*/React.createElement("p", { className: "rc-fc__empty" }, "No flashcards for this session yet — add content in the Data Entry tab to generate them.");
  }

  const card = cards[Math.min(idx, cards.length - 1)];
  const saved = fd[card.id] || {};
  function patchCard(u) {setFd((prev) => ({ ...prev, [card.id]: { ...(prev[card.id] || {}), ...u } }));}
  function goto(n) {setFlip(false);setHint(false);setIdx((i) => Math.max(0, Math.min(cards.length - 1, i + n)));}
  function jump(i) {setFlip(false);setHint(false);setIdx(i);}

  return (/*#__PURE__*/
    React.createElement("div", { className: "rc-fc" }, /*#__PURE__*/

    React.createElement("div", { className: "rc-fc__topbar" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-fc__brand" }, "▤ FLIP FLASHCARDS"), /*#__PURE__*/
    React.createElement("span", { className: "rc-fc__brand-sub" }, "Casual recall — tap a card to flip. Nothing is scored.")
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
      className: "rc-fccard__blank", rows: 2, placeholder: "Say it in your head, or jot a note…",
      value: saved.ans || '',
      onClick: (e) => e.stopPropagation(),
      onChange: (e) => patchCard({ ans: e.target.value }) }
    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-fccard__hint", onClick: (e) => e.stopPropagation() },
    hintOpen ? /*#__PURE__*/
    React.createElement("p", { className: "rc-fccard__hinttext" }, /*#__PURE__*/React.createElement("span", { className: "rc-fccard__hintlab" }, "HINT"), " ", card.hint) : /*#__PURE__*/
    React.createElement("button", { type: "button", className: "rc-fc__hintbtn", onClick: () => setHint(true) }, "Show hint")
    ), /*#__PURE__*/
    React.createElement("div", { className: "rc-fccard__flipcue" }, "TAP TO REVEAL →")
    ) : /*#__PURE__*/

    React.createElement("div", { className: "rc-fccard__face rc-fccard__back" }, /*#__PURE__*/
    React.createElement("div", { className: "rc-fccard__head" }, /*#__PURE__*/
    React.createElement("span", { className: "rc-fccard__badge rc-fccard__badge--answer" }, "ANSWER"), /*#__PURE__*/
    React.createElement("span", { className: "rc-fccard__loc" }, card.glyph, " ", card.typeLabel)
    ),
    card.personal ? /*#__PURE__*/
    React.createElement("div", { className: "rc-fccard__abody" }, /*#__PURE__*/
    React.createElement("p", { className: "rc-fccard__personal" }, "This one’s personal — here’s what you wrote:"), /*#__PURE__*/
    React.createElement("p", { className: "rc-fccard__yourans" }, saved.ans && saved.ans.trim() ? saved.ans : /*#__PURE__*/React.createElement("em", null, "(nothing written yet)"))
    ) : /*#__PURE__*/

    React.createElement("p", { className: "rc-fccard__a" }, card.back),

    card.verse ? /*#__PURE__*/React.createElement("div", { className: "rc-fccard__verse" }, card.verse) : null, /*#__PURE__*/
    React.createElement("div", { className: "rc-fccard__flipcue" }, "TAP TO FLIP BACK")
    )

    ), /*#__PURE__*/


    React.createElement("div", { className: "rc-fc__controls" }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "rc-btn rc-btn--ghost", disabled: idx === 0, onClick: () => goto(-1) }, "← Previous"), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "rc-btn", onClick: () => setFlip((f) => !f) }, flipped ? 'Flip back' : 'Flip card'), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "rc-btn rc-btn--ghost", disabled: idx === cards.length - 1, onClick: () => goto(1) }, "Next →")
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
