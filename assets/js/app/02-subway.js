/* Subway-map view — 6 theme tracks × 12 session-stations */
const { useState, useMemo, useEffect, useRef } = React;

function hasContent(session, theme) {
  const v = session[theme.key];
  return typeof v === 'string' && v.trim().length > 0;
}

function isPrimary(session, theme) {
  if (!session.highlight) return false;
  // 'highlight' may name one OR two threads, e.g. "Promises & Kingdom".
  const parts = String(session.highlight).toLowerCase().split(/\s*(?:&|,|\/| and )\s*/).map((p) => p.trim()).filter(Boolean);
  return parts.includes(String(theme.short).toLowerCase()) || parts.includes(theme.id);
}

function previewText(session, theme) {
  let v = session[theme.key] || '';
  if (theme.id === 'nt') {
    const ref = session.ntPassage || '';
    v = (ref ? ref + ' — ' : '') + v;
  }
  return v.replace(/\s+/g, ' ').trim();
}

function SubwayMap({ sessions, themes, selectedSession, onSelectSession, activeTheme, pinnedTheme, onHoverTheme, onPinTheme, colW, labelFooter }) {
  const tracksRef = useRef(null);
  const [trackBox, setTrackBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      const el = tracksRef.current;
      if (!el) return;
      setTrackBox({ w: el.clientWidth, h: el.clientHeight });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Re-measure when the box-width slider, column count, or row count (themes)
  // changes so the SVG rails stay aligned — e.g. when the tension rows reveal.
  useEffect(() => {
    const el = tracksRef.current;
    if (el) setTrackBox({ w: el.clientWidth, h: el.clientHeight });
  }, [colW, sessions.length, themes.length]);

  // Build SVG rails per theme
  const rails = useMemo(() => {
    const { w, h } = trackBox;
    if (!w || !h) return [];
    const colW = w / sessions.length;
    const rowH = h / themes.length;
    return themes.map((theme, ti) => {
      const y = rowH * (ti + 0.5);
      // Find sessions where this theme has content
      const pts = sessions.map((s, si) => ({
        si,
        x: colW * (si + 0.5),
        y,
        on: hasContent(s, theme),
        primary: isPrimary(s, theme)
      }));
      // Build path: line segments between consecutive 'on' points
      // To make rails feel continuous, we connect *all* on points with a single line
      const onPts = pts.filter((p) => p.on);
      let path = '';
      if (onPts.length >= 2) {
        path = `M ${onPts[0].x} ${onPts[0].y}` +
        onPts.slice(1).map((p) => ` L ${p.x} ${p.y}`).join('');
      }
      return { theme, y, path, pts };
    });
  }, [trackBox, sessions, themes]);

  const focusTheme = pinnedTheme || activeTheme;

  return (/*#__PURE__*/
    React.createElement("div", { className: "subway-wrap" }, /*#__PURE__*/
    React.createElement("div", { className: "subway", style: { '--sess-cols': sessions.length, '--theme-rows': themes.length, '--subway-w': 200 + sessions.length * (colW || 118) + 'px' } }, /*#__PURE__*/
    React.createElement("div", { className: "subway__inner" }, /*#__PURE__*/

    React.createElement("div", null), /*#__PURE__*/

    React.createElement("div", { className: "subway__cols" },
    sessions.map((s, i) => {
      const isSel = selectedSession === s.id;
      return (/*#__PURE__*/
        React.createElement("div", {
          key: s.id,
          className: `scol ${isSel ? 'is-selected' : ''}`,
          onClick: () => onSelectSession(s.id) }, /*#__PURE__*/

        React.createElement("div", { className: "scol__num" }, "SESSION ", String(s.id).padStart(2, '0')), /*#__PURE__*/
        React.createElement("div", { className: "scol__passage" },
        shortPassage(s)
        ), /*#__PURE__*/
        React.createElement("div", { className: "scol__topic" }, s.topic)
        ));

    })
    ), /*#__PURE__*/


    React.createElement("div", { className: "subway__labels" },
    themes.map((t) => {
      const isAct = focusTheme === t.id;
      const isDim = focusTheme && focusTheme !== t.id;
      return (/*#__PURE__*/
        React.createElement("div", {
          key: t.id,
          className: `tlabel ${isAct ? 'is-active' : ''} ${isDim ? 'is-dim' : ''}`,
          style: { '--theme-color': `var(--c-${t.id})` },
          onMouseEnter: () => onHoverTheme(t.id),
          onMouseLeave: () => onHoverTheme(null),
          onClick: () => onPinTheme(pinnedTheme === t.id ? null : t.id) }, /*#__PURE__*/

        React.createElement("span", { className: "tlabel__glyph" }, t.glyph), /*#__PURE__*/
        React.createElement("span", { className: "tlabel__name" }, t.label)
        ));

    }),
    labelFooter || null
    ), /*#__PURE__*/


    React.createElement("div", { className: "subway__tracks", ref: tracksRef, style: { gridColumn: 2 } }, /*#__PURE__*/
    React.createElement("svg", { className: "subway__svg", viewBox: `0 0 ${trackBox.w || 100} ${trackBox.h || 100}`, preserveAspectRatio: "none" },
    rails.map((r) => {
      const isAct = focusTheme === r.theme.id;
      const isDim = focusTheme && focusTheme !== r.theme.id;
      return (/*#__PURE__*/
        React.createElement("path", {
          key: r.theme.id,
          className: "srail" + (isAct ? " is-active" : ""),
          d: r.path,
          pathLength: 1,
          fill: "none",
          stroke: `var(--c-${r.theme.id})`,
          strokeWidth: isAct ? 5 : 3.5,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          opacity: isDim ? 0.12 : 1,
          style: { transition: 'opacity 220ms ease, stroke-width 220ms ease' } }
        ));

    })
    ),


    themes.map((t, ti) =>
    sessions.map((s, si) => {
      const on = hasContent(s, t);
      const prim = on && isPrimary(s, t);
      const isAct = focusTheme === t.id;
      const isDim = focusTheme && focusTheme !== t.id;
      const isSelSession = selectedSession === s.id;
      return (/*#__PURE__*/
        React.createElement("div", {
          key: `${t.id}-${s.id}`,
          className: `station ${on ? '' : 'is-empty'} ${prim ? 'is-primary' : ''} ${isAct && on ? 'is-thread-on' : ''} ${isDim ? 'is-dim' : ''} ${isSelSession && on ? 'is-selected' : ''}`,
          style: {
            gridRow: ti + 1,
            gridColumn: si + 1,
            '--station-color': `var(--c-${t.id})`
          },
          onClick: () => {
            onSelectSession(s.id);
            if (on) onPinTheme(t.id);
          },
          onMouseEnter: () => on && onHoverTheme(t.id),
          onMouseLeave: () => onHoverTheme(null) }, /*#__PURE__*/

        React.createElement("div", { className: "station__dot" }),
        on && /*#__PURE__*/
        React.createElement("div", { className: "station__tip" }, /*#__PURE__*/
        React.createElement("b", null, t.label, " \u2014 Session ", s.id),
        previewText(s, t).slice(0, 180),
        previewText(s, t).length > 180 ? '…' : ''
        )

        ));

    })
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "mp-ribbon" }, /*#__PURE__*/
    React.createElement("div", { className: "mp-ribbon__label" }, "Main point \u25E2"), /*#__PURE__*/
    React.createElement("div", { className: "mp-ribbon__row" },
    sessions.map((s) => /*#__PURE__*/
    React.createElement("div", {
      key: s.id,
      className: `mp-cell ${selectedSession === s.id ? 'is-selected' : ''}`,
      onClick: () => onSelectSession(s.id),
      title: s.mainPoint },

    s.mainPoint ? s.mainPoint : /*#__PURE__*/React.createElement("span", { style: { opacity: 0.4 } }, "\u2014")
    )
    )
    )
    )
    )
    ));

}

function truncate(s, n) {
  if (!s) return '';
  s = s.replace(/\s+/g, ' ').trim();
  if (s.length <= n) return s;
  return s.slice(0, n).replace(/[,\s]+\S*$/, '') + '…';
}

const BOOK_SHORT = {
  'Genesis': 'Gen',
  'Exodus': 'Ex',
  'Leviticus': 'Lev',
  'Numbers': 'Num',
  'Deuteronomy': 'Deut'
};
function shortPassage(s) {
  if (!s) return '';
  if (s.book === 'OT Overview') return 'Why OT?';
  if (s.book === 'Pentateuch Review') return 'Pentateuch';
  const book = BOOK_SHORT[s.book] || s.book;
  const nums = (s.chapter || '').match(/\d+/g) || [];
  let chap = s.chapter || '';
  if (/,/.test(s.chapter || '') && nums.length >= 2) {
    chap = `${nums[0]}\u2013${nums[nums.length - 1]}`;
  }
  return `${book} ${chap}`.trim();
}
function longPassage(s) {
  if (!s) return '';
  if (s.book === 'OT Overview') return 'Why the Old Testament?';
  if (s.book === 'Pentateuch Review') return 'Pentateuch Review';
  return `${s.book} ${s.chapter}`.trim();
}

window.SubwayMap = SubwayMap;
window.hasContent = hasContent;
window.isPrimary = isPrimary;
window.previewText = previewText;
window.truncate = truncate;
window.shortPassage = shortPassage;
window.longPassage = longPassage;