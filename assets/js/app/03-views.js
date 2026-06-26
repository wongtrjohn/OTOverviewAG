function _extends() {return _extends = Object.assign ? Object.assign.bind() : function (n) {for (var e = 1; e < arguments.length; e++) {var t = arguments[e];for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);}return n;}, _extends.apply(null, arguments);}function kbd(fn) {return { role: 'button', tabIndex: 0, onKeyDown: function (e) {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault();fn(e);}} };}

/* Detail panel + Thread story panel */
const { useMemo: useMemoD } = React;

function SessionDetail({ session, sessions, themes, onSelectSession, onPinTheme }) {
  if (!session) return null;
  const idx = sessions.findIndex((s) => s.id === session.id);
  const prev = idx > 0 ? sessions[idx - 1] : null;
  const next = idx < sessions.length - 1 ? sessions[idx + 1] : null;
  const hasImage = !!session.image;

  return (/*#__PURE__*/
    React.createElement("section", { className: `detail ${hasImage ? 'has-image' : ''}` },
    hasImage ? /*#__PURE__*/
    React.createElement("div", { className: "detail__hero", style: { backgroundImage: `url("${session.image}")` } }, /*#__PURE__*/
    React.createElement("div", { className: "detail__hero-nav" }, /*#__PURE__*/
    React.createElement("button", { className: "navbtn", onClick: () => prev && onSelectSession(prev.id), disabled: !prev }, "\u2190 prev"), /*#__PURE__*/
    React.createElement("button", { className: "navbtn", onClick: () => next && onSelectSession(next.id), disabled: !next }, "next \u2192"), /*#__PURE__*/
    React.createElement("button", { className: "navbtn", onClick: () => onSelectSession(null), title: "close" }, "\u2715")
    ), /*#__PURE__*/
    React.createElement("div", { className: "detail__hero-content" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { className: "detail__hero-num" }, "SESSION ", String(session.id).padStart(2, '0'), " \xB7 ", session.book), /*#__PURE__*/
    React.createElement("h2", { className: "detail__hero-title" }, longPassage(session)), /*#__PURE__*/
    React.createElement("div", { className: "detail__hero-topic" }, session.topic)
    ),
    session.mainPoint ? /*#__PURE__*/
    React.createElement("div", { className: "detail__hero-mp" }, session.mainPoint) :
    null
    )
    ) : /*#__PURE__*/

    React.createElement("div", { className: "detail__head detail__head--nomp" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { className: "detail__num" }, "Session ", String(session.id).padStart(2, '0')), /*#__PURE__*/
    React.createElement("h2", { className: "detail__title" }, longPassage(session)), /*#__PURE__*/
    React.createElement("div", { className: "detail__topic" }, session.topic)
    ), /*#__PURE__*/
    React.createElement("div", { className: "detail__nav" }, /*#__PURE__*/
    React.createElement("button", { className: "navbtn", onClick: () => prev && onSelectSession(prev.id), disabled: !prev }, "\u2190 prev"), /*#__PURE__*/
    React.createElement("button", { className: "navbtn", onClick: () => next && onSelectSession(next.id), disabled: !next }, "next \u2192")
    )
    ),


    session.contextTone && session.contextTone.trim() ? /*#__PURE__*/
    React.createElement("aside", { className: "context-note", "aria-label": "Before you begin \u2014 important context and tone for this session" }, /*#__PURE__*/
    React.createElement("div", { className: "context-note__label" }, /*#__PURE__*/
    React.createElement("span", { className: "context-note__icon", "aria-hidden": "true" }, "\u2723"), "Before you begin\u2026"

    ), /*#__PURE__*/
    React.createElement("div", { className: "context-note__body" },
    renderMultiline(session.contextTone)
    )
    ) :
    null,

    session.mainPoint ? /*#__PURE__*/
    React.createElement("aside", { className: "mainpoint", "aria-label": "Main point of this session" }, /*#__PURE__*/
    React.createElement("div", { className: "mainpoint__label" }, /*#__PURE__*/
    React.createElement("span", { className: "mainpoint__bullet" }, "\u25C6"), "Main Point"

    ), /*#__PURE__*/
    React.createElement("blockquote", { className: "mainpoint__text" },
    renderMultiline(session.mainPoint)
    )
    ) :
    null, /*#__PURE__*/

    React.createElement(TensionTriad, { session: session, themes: themes, onPinTheme: onPinTheme }),

    (() => {
      const others = themes.filter((t) => !['intention', 'reality', 'nt'].includes(t.id));
      const anyHas = others.some((t) => (session[t.key] || '').trim().length > 0);
      if (!anyHas) return null;
      return (/*#__PURE__*/
        React.createElement("div", { className: "othersect" }, /*#__PURE__*/
        React.createElement("div", { className: "othersect__rule" }, /*#__PURE__*/
        React.createElement("span", { className: "othersect__label" }, "Other threads in this passage")
        ), /*#__PURE__*/
        React.createElement("div", { className: "theme-grid theme-grid--others" },
        others.map((t) => {
          const v = session[t.key] || '';
          const has = v.trim().length > 0;
          const prim = isPrimary(session, t);
          if (!has) return null;
          return (/*#__PURE__*/
            React.createElement("article", {
              key: t.id,
              className: `tcard ${prim ? 'is-primary' : ''}`,
              style: {
                '--theme-color': `var(--c-${t.id})`,
                '--theme-soft': `var(--c-${t.id}-soft)`
              },
              onClick: () => onPinTheme(t.id) }, /*#__PURE__*/

            React.createElement("div", { className: "tcard__head" }, /*#__PURE__*/
            React.createElement("span", { className: "tcard__glyph" }, t.glyph), /*#__PURE__*/
            React.createElement("span", { className: "tcard__tag" }, t.tag),
            prim ? /*#__PURE__*/React.createElement("span", { className: "tcard__title" }, "primary focus") : null
            ), /*#__PURE__*/
            React.createElement("div", { className: `tcard__body ${session.id === 1 ? 'is-mono' : ''}` },
            renderMultiline(v)
            )
            ));

        })
        )
        ));

    })()

    ));

}

function TensionTriad({ session, themes, onPinTheme }) {
  const intent = themes.find((t) => t.id === 'intention');
  const reality = themes.find((t) => t.id === 'reality');
  const nt = themes.find((t) => t.id === 'nt');
  const intV = (session.intention || '').trim();
  const realV = (session.reality || '').trim();
  const ntV = (session.ntPoint || '').trim();
  if (!intV && !realV && !ntV) return null;

  const isMono = session.id === 1; // OT Overview session uses scripture-list mono style
  const hasTension = intV || realV;

  return (/*#__PURE__*/
    React.createElement("section", { className: "triad", "aria-label": "New Testament fulfilment, and the tension it resolves" }, /*#__PURE__*/
    React.createElement("header", { className: "triad__header" }, /*#__PURE__*/
    React.createElement("span", { className: "triad__eyebrow" }, "New Testament Fulfilment"), /*#__PURE__*/
    React.createElement("h3", { className: "triad__title" }, /*#__PURE__*/
    React.createElement("span", { style: { color: 'var(--c-nt)' } }, "How this passage points to Christ")
    )
    ), /*#__PURE__*/

    React.createElement("article", {
      className: `triad__nt ${ntV ? '' : 'is-empty'} ${onPinTheme ? 'is-clickable' : ''}`,
      style: { '--theme-color': 'var(--c-nt)', '--theme-soft': 'var(--c-nt-soft)' },
      onClick: (e) => {if (onPinTheme) {e.stopPropagation();onPinTheme('nt');}} }, /*#__PURE__*/

    React.createElement("div", { className: "triad__nt-ask" }, /*#__PURE__*/
    React.createElement("span", { className: "triad__nt-ask-glyph" }, "\u271D"), /*#__PURE__*/
    React.createElement("span", { className: "triad__nt-ask-text" }, "What does this tell me ", /*#__PURE__*/
    React.createElement("em", null, "about Jesus?")
    ), /*#__PURE__*/
    React.createElement("span", { className: "triad__nt-ask-cite" }, "John 5:39")
    ), /*#__PURE__*/
    React.createElement("div", { className: "triad__nt-head" }, /*#__PURE__*/
    React.createElement("span", { className: "triad__glyph" }, nt.glyph), /*#__PURE__*/
    React.createElement("span", { className: "triad__tag" }, nt.tag), /*#__PURE__*/
    React.createElement("span", { className: "triad__label" }, nt.label),
    session.ntPassage ? /*#__PURE__*/
    React.createElement("span", { className: "tcard__ntref", style: { marginLeft: 'auto' } }, linkifyRefs(session.ntPassage)) :
    null
    ), /*#__PURE__*/
    React.createElement("div", { className: `triad__body ${isMono ? 'is-mono' : ''}` },
    ntV ? renderMultiline(ntV) : /*#__PURE__*/React.createElement("p", { className: "triad__empty" }, "\u2014 no NT fulfilment recorded \u2014")
    )
    ),

    hasTension ? /*#__PURE__*/
    React.createElement("details", { className: "triad__reveal" }, /*#__PURE__*/
    React.createElement("summary", { className: "triad__reveal-summary" }, /*#__PURE__*/
    React.createElement("span", { className: "triad__reveal-glyph", "aria-hidden": "true" }, "\u21CC"), /*#__PURE__*/
    React.createElement("span", { className: "triad__reveal-text" }, "See the tension this resolves"), /*#__PURE__*/
    React.createElement("span", { className: "triad__reveal-sub" }, /*#__PURE__*/
    React.createElement("span", { style: { color: 'var(--c-intention)' } }, "God's Character & Intent"), " vs ", /*#__PURE__*/
    React.createElement("span", { style: { color: 'var(--c-reality)' } }, "Mankind's Sinfulness & Limitations")
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "triad__rail" }, /*#__PURE__*/
    React.createElement("article", {
      className: `triad__col triad__col--intent ${intV ? '' : 'is-empty'} ${onPinTheme ? 'is-clickable' : ''}`,
      style: { '--theme-color': 'var(--c-intention)', '--theme-soft': 'var(--c-intention-soft)' },
      onClick: (e) => {if (onPinTheme) {e.stopPropagation();onPinTheme('intention');}} }, /*#__PURE__*/

    React.createElement("div", { className: "triad__col-head" }, /*#__PURE__*/
    React.createElement("span", { className: "triad__glyph" }, intent.glyph), /*#__PURE__*/
    React.createElement("span", { className: "triad__tag" }, intent.tag), /*#__PURE__*/
    React.createElement("span", { className: "triad__label" }, intent.label)
    ), /*#__PURE__*/
    React.createElement("div", { className: `triad__body ${isMono ? 'is-mono' : ''}` },
    intV ? renderMultiline(intV) : /*#__PURE__*/React.createElement("p", { className: "triad__empty" }, "\u2014 not foregrounded in this passage \u2014")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "triad__vs", "aria-hidden": "true" }, /*#__PURE__*/
    React.createElement("span", { className: "triad__vs-bar" }), /*#__PURE__*/
    React.createElement("span", { className: "triad__vs-label" }, "vs"), /*#__PURE__*/
    React.createElement("span", { className: "triad__vs-bar" })
    ), /*#__PURE__*/

    React.createElement("article", {
      className: `triad__col triad__col--reality ${realV ? '' : 'is-empty'} ${onPinTheme ? 'is-clickable' : ''}`,
      style: { '--theme-color': 'var(--c-reality)', '--theme-soft': 'var(--c-reality-soft)' },
      onClick: (e) => {if (onPinTheme) {e.stopPropagation();onPinTheme('reality');}} }, /*#__PURE__*/

    React.createElement("div", { className: "triad__col-head" }, /*#__PURE__*/
    React.createElement("span", { className: "triad__glyph" }, reality.glyph), /*#__PURE__*/
    React.createElement("span", { className: "triad__tag" }, reality.tag), /*#__PURE__*/
    React.createElement("span", { className: "triad__label" }, reality.label)
    ), /*#__PURE__*/
    React.createElement("div", { className: `triad__body ${isMono ? 'is-mono' : ''}` },
    realV ? renderMultiline(realV) : /*#__PURE__*/React.createElement("p", { className: "triad__empty" }, "\u2014 not foregrounded in this passage \u2014")
    )
    )
    )
    ) :
    null
    ));

}


function linkifyRefs(text) {
  if (!text || typeof text !== 'string') return text;
  const BOOKS = "Genesis|Gen|Exodus|Exod|Ex|Leviticus|Lev|Numbers|Num|Deuteronomy|Deut|Joshua|Josh|Judges|Judg|Ruth|Samuel|Sam|Kings|Chronicles|Chron|Ezra|Nehemiah|Neh|Esther|Esth|Job|Psalms|Psalm|Ps|Proverbs|Prov|Ecclesiastes|Eccl|Song|Isaiah|Isa|Jeremiah|Jer|Lamentations|Lam|Ezekiel|Ezek|Daniel|Dan|Hosea|Hos|Joel|Amos|Obadiah|Obad|Jonah|Micah|Mic|Nahum|Nah|Habakkuk|Hab|Zephaniah|Zeph|Haggai|Hag|Zechariah|Zech|Malachi|Mal|Matthew|Matt|Mark|Luke|John|Acts|Romans|Rom|Corinthians|Cor|Galatians|Gal|Ephesians|Eph|Philippians|Phil|Colossians|Col|Thessalonians|Thess|Timothy|Tim|Titus|Philemon|Phlm|Hebrews|Heb|James|Jas|Peter|Pet|Jude|Revelation|Rev";
  const re = new RegExp("((?:[1-3]\\s)?(?:" + BOOKS + ")\\.?)\\s(\\d+(?:[-–]\\d+)?(?::\\d+(?:[-–]\\d+)?)?(?:\\s?[,&]\\s?\\d+(?:[-–]\\d+)?(?::\\d+(?:[-–]\\d+)?)?)*)", "g");
  const out = [];let last = 0,m,key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const ref = m[0];
    out.push(
      React.createElement("span", {
        key: "r" + key++,
        className: "passage-ref passage-ref--inline",
        style: { cursor: "pointer" },
        onClick: function (e) {e.stopPropagation();}
      }, ref)
    );
    last = m.index + ref.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.length ? out : text;
}

function renderMultiline(s) {
  if (!s) return null;
  return s.split(/\n+/).map((line, i) => /*#__PURE__*/
  React.createElement("p", { key: i }, linkifyRefs(line))
  );
}


function covSignIcon(label) {
  const l = (label || '').toLowerCase();
  const common = { viewBox: "0 0 24 24", className: "covicon", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  if (l.indexOf('rainbow') >= 0) return (/*#__PURE__*/
    React.createElement("svg", common, /*#__PURE__*/React.createElement("path", { d: "M3 19a9 9 0 0 1 18 0" }), /*#__PURE__*/React.createElement("path", { d: "M6 19a6 6 0 0 1 12 0" }), /*#__PURE__*/React.createElement("path", { d: "M9 19a3 3 0 0 1 6 0" })));

  if (l.indexOf('circumcis') >= 0) return (/*#__PURE__*/
    React.createElement("svg", common, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "7" }), /*#__PURE__*/React.createElement("path", { d: "M12 5v4" })));

  if (l.indexOf('passover') >= 0) return (/*#__PURE__*/
    React.createElement("svg", common, /*#__PURE__*/React.createElement("path", { d: "M6 21V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v15" }), /*#__PURE__*/React.createElement("path", { d: "M6 21h12" }), /*#__PURE__*/React.createElement("path", { d: "M9 21v-4h6v4" })));

  if (l.indexOf('sabbath') >= 0) return (/*#__PURE__*/
    React.createElement("svg", common, /*#__PURE__*/React.createElement("path", { d: "M12 3c2 3 3 5 3 7a3 3 0 0 1-6 0c0-2 1-4 3-7Z" }), /*#__PURE__*/React.createElement("path", { d: "M8 21h8" }), /*#__PURE__*/React.createElement("path", { d: "M12 17v4" })));

  return null;
}

function ThreadStory({ theme, sessions, onSelectSession }) {
  if (!theme) return null;
  const subthemes = (window.OT_SUBTHEMES || []).filter((st) => st.parent === theme.id);
  return (/*#__PURE__*/
    React.createElement("section", { className: "thread", style: { '--theme-color': `var(--c-${theme.id})`, '--theme-soft': `var(--c-${theme.id}-soft)` } }, /*#__PURE__*/
    React.createElement("span", { className: "thread__watermark", "aria-hidden": "true" }, theme.glyph), /*#__PURE__*/
    React.createElement("div", { className: "thread__head" }, /*#__PURE__*/
    React.createElement("span", { className: "thread__tag" }, theme.tag), /*#__PURE__*/
    React.createElement("h2", { className: "thread__title" }, "The thread of ", /*#__PURE__*/
    React.createElement("em", null, theme.label.replace("God's ", '').replace("Man's ", '').replace("NT ", ''))
    ), /*#__PURE__*/
    React.createElement("p", { className: "thread__blurb" }, theme.blurb),
    theme.id === 'salvation' ? /*#__PURE__*/
    React.createElement("div", { className: "scarlet" }, /*#__PURE__*/
    React.createElement("span", { className: "scarlet__line", "aria-hidden": "true" }), /*#__PURE__*/
    React.createElement("p", { className: "scarlet__note" }, "Follow the ", /*#__PURE__*/React.createElement("b", null, "scarlet thread"), " \u2014 the blood that saves, from the Passover lamb to the Day of Atonement, fulfilled once for all at the cross.")
    ) :
    null
    ),

    subthemes.map((st) => /*#__PURE__*/
    React.createElement("aside", { key: st.id, className: "subtheme", "aria-label": `Sub-thread: ${st.title}` }, /*#__PURE__*/
    React.createElement("header", { className: "subtheme__head" }, /*#__PURE__*/
    React.createElement("span", { className: "subtheme__eyebrow" }, /*#__PURE__*/
    React.createElement("span", { className: "subtheme__hook", "aria-hidden": "true" }, "\u21B3"), "A SUB-THREAD WITHIN ",
    theme.tag
    ), /*#__PURE__*/
    React.createElement("h3", { className: "subtheme__title" }, st.title), /*#__PURE__*/
    React.createElement("p", { className: "subtheme__blurb" }, st.blurb)
    ), /*#__PURE__*/
    React.createElement("div", { className: "subtheme__figures" },
    st.figures.map((f, i) => /*#__PURE__*/
    React.createElement("button", {
      key: i,
      className: "subfig",
      onClick: () => onSelectSession(f.session) }, /*#__PURE__*/

    React.createElement("div", { className: "subfig__head" }, /*#__PURE__*/
    React.createElement("span", { className: "subfig__num" }, String(i + 1).padStart(2, '0')), /*#__PURE__*/
    React.createElement("span", { className: "subfig__name" }, f.name), /*#__PURE__*/
    React.createElement("span", { className: "subfig__sess" }, "S", String(f.session).padStart(2, '0'), " \xB7 ", f.passage)
    ), /*#__PURE__*/
    React.createElement("div", { className: "subfig__role" }, f.role), /*#__PURE__*/
    React.createElement("div", { className: "subfig__note" }, f.note)
    )
    )
    ),
    st.resolution ? /*#__PURE__*/
    React.createElement("div", { className: "subtheme__resolution" }, /*#__PURE__*/
    React.createElement("div", { className: "subtheme__resolution-arrow", "aria-hidden": "true" }, "\u2193"), /*#__PURE__*/
    React.createElement("div", { className: "subtheme__resolution-body" }, /*#__PURE__*/
    React.createElement("span", { className: "subtheme__resolution-label" }, st.resolution.label), /*#__PURE__*/
    React.createElement("p", { className: "subtheme__resolution-text" }, st.resolution.text)
    )
    ) :
    null
    )
    ),

    theme.id === 'promises' && (window.OT_COVENANTS || []).length ? /*#__PURE__*/
    React.createElement("aside", { className: "subtheme subtheme--cov", "aria-label": "Sub-thread: The Covenants" }, /*#__PURE__*/
    React.createElement("header", { className: "subtheme__head" }, /*#__PURE__*/
    React.createElement("span", { className: "subtheme__eyebrow" }, /*#__PURE__*/
    React.createElement("span", { className: "subtheme__hook", "aria-hidden": "true" }, "\u21B3"), "A SUB-THREAD WITHIN ",
    theme.tag
    ), /*#__PURE__*/
    React.createElement("h3", { className: "subtheme__title" }, "The Covenants across the Pentateuch"), /*#__PURE__*/
    React.createElement("p", { className: "subtheme__blurb" }, "God's promises take concrete shape in covenants \u2014 He ", /*#__PURE__*/React.createElement("b", null, "makes"), " them, ", /*#__PURE__*/React.createElement("b", null, "seals"), " them by His own hand, and gives ", /*#__PURE__*/React.createElement("b", null, "signs"), " that point forward to Christ.")
    ), /*#__PURE__*/
    React.createElement("div", { className: "covsub" },
    (window.OT_COVENANTS || []).map((c, ci) => /*#__PURE__*/
    React.createElement("article", { key: c.id, className: "covsub__stage", style: { '--cov-accent': `var(--c-${c.accent})`, '--cov-soft': `var(--c-${c.accent}-soft)` } }, /*#__PURE__*/
    React.createElement("div", { className: "covsub__stagehead" }, /*#__PURE__*/
    React.createElement("span", { className: "covsub__stagenum" }, ci + 1), /*#__PURE__*/
    React.createElement("div", { className: "covsub__stagemeta" }, /*#__PURE__*/
    React.createElement("h4", { className: "covsub__stagetitle" }, c.title),
    c.blurb ? /*#__PURE__*/React.createElement("p", { className: "covsub__stageblurb" }, c.blurb) : null
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "covsub__items" },
    c.items.map((it, i) => {
      const sessIds = it.sessions || (it.session ? [it.session] : []);
      return (/*#__PURE__*/
        React.createElement("button", { key: i, className: "covchip", onClick: () => sessIds.length && onSelectSession(sessIds[0]) },
        c.id === 'signs' ? covSignIcon(it.label) : null, /*#__PURE__*/
        React.createElement("span", { className: "covchip__label" },
        it.label.split('\n').map((line, li) => /*#__PURE__*/
        React.createElement("span", { key: li, className: "covchip__line" }, line)
        )
        ), /*#__PURE__*/
        React.createElement("span", { className: "covchip__meta" }, /*#__PURE__*/
        React.createElement("span", { className: "covchip__passage" }, it.passage), /*#__PURE__*/
        React.createElement("span", { className: "covchip__sessions" },
        sessIds.map((sid, si) => /*#__PURE__*/
        React.createElement("span", { key: sid },
        si > 0 ? /*#__PURE__*/React.createElement("span", { className: "covchip__sep" }, "\xB7") : null, "S",
        String(sid).padStart(2, '0')
        )
        )
        )
        ),
        it.sub ? /*#__PURE__*/React.createElement("span", { className: "covchip__sub" }, it.sub) : null,
        c.id === 'signs' ? (() => {
          const ntSess = sessions.find((s) => sessIds.includes(s.id));
          return ntSess && ntSess.ntPoint ? /*#__PURE__*/
          React.createElement("span", { className: "covchip__nt", title: "Fulfilled in Christ — " + ntSess.ntPoint + (ntSess.ntPassage ? " · " + ntSess.ntPassage : "") }, /*#__PURE__*/
          React.createElement("span", { className: "covchip__nt-glyph", "aria-hidden": "true" }, "\u271D"), /*#__PURE__*/
          React.createElement("span", { className: "covchip__nt-text" }, ntSess.ntPoint)
          ) :
          null;
        })() : null
        ));

    })
    )
    )
    )
    )
    ) :
    null, /*#__PURE__*/

    React.createElement("div", { className: "thread__stops" },
    sessions.map((s) => {
      const v = s[theme.key] || '';
      const has = v.trim().length > 0;
      const prim = isPrimary(s, theme);
      return (/*#__PURE__*/
        React.createElement("article", _extends({
          key: s.id,
          className: `tstop ${has ? '' : 'is-empty'} ${prim ? 'is-primary' : ''}` },
        kbd(() => onSelectSession(s.id)), {
          onClick: () => onSelectSession(s.id) }), /*#__PURE__*/

        React.createElement("div", { className: "tstop__num" }, "Session ",
        String(s.id).padStart(2, '0'), /*#__PURE__*/
        React.createElement("b", null, shortPassage(s))
        ),
        s.image ? /*#__PURE__*/
        React.createElement("div", { className: "tstop__thumb", style: { backgroundImage: `url("${s.image}")` } }) : /*#__PURE__*/

        React.createElement("div", { className: "tstop__thumb is-placeholder" }, theme.glyph), /*#__PURE__*/

        React.createElement("div", { className: "tstop__body" }, /*#__PURE__*/
        React.createElement("div", { className: "tstop__topic" }, s.topic),
        has ? /*#__PURE__*/
        React.createElement(React.Fragment, null,
        theme.id === 'nt' && s.ntPassage ? /*#__PURE__*/
        React.createElement("div", { className: "tcard__ntref", style: { marginBottom: 8 } }, s.ntPassage) :
        null,
        renderMultiline(v)
        ) : /*#__PURE__*/

        React.createElement(React.Fragment, null, "\u2014 ", theme.short.toLowerCase(), " is not foregrounded in this session \u2014")

        )
        ));

    })
    )
    ));

}

window.SessionDetail = SessionDetail;
window.ThreadStory = ThreadStory;
window.TensionTriad = TensionTriad;
window.renderMultiline = renderMultiline;
window.linkifyRefs = linkifyRefs;