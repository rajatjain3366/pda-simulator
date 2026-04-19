import React, { useMemo } from 'react';

/* ─────────────────────────────────────────────────────────────── *
 *  StateDiagram — SVG-based PDA state diagram with:
 *    • Blueprint dot-grid background
 *    • Pill-shaped, readable foreignObject labels
 *    • Curved edges with bidirectional offset
 *    • Wide self-loops with high arc clearance
 *    • Glowing current-state highlight
 * ─────────────────────────────────────────────────────────────── */

export default function StateDiagram({ rules, currentState, startState, acceptStates }) {
  const NODE_RADIUS = 32;

  // 1. Unique states → circular layout
  const nodes = useMemo(() => {
    const stateSet = new Set([startState]);
    if (acceptStates) acceptStates.forEach(s => stateSet.add(s));
    if (rules) rules.forEach(r => { stateSet.add(r.currentState); stateSet.add(r.nextState); });

    const states = Array.from(stateSet).sort();

    return states.map((st, i) => {
      if (states.length === 1) return { id: st, x: 400, y: 300 };
      const angle = (i / states.length) * 2 * Math.PI + Math.PI;
      return { id: st, x: 400 + Math.cos(angle) * 220, y: 300 + Math.sin(angle) * 160 };
    });
  }, [rules, startState, acceptStates]);

  const nodeMap = useMemo(() => {
    const m = {};
    nodes.forEach(n => (m[n.id] = n));
    return m;
  }, [nodes]);

  // 2. Group → deduplicated label arrays
  const edges = useMemo(() => {
    const groups = {};
    if (!rules) return [];
    rules.forEach(rule => {
      const key = `${rule.currentState}|${rule.nextState}`;
      if (!groups[key]) groups[key] = new Set();
      const pushStr = rule.pushSymbols || 'ε';
      const input    = rule.inputSymbol === 'e' || rule.inputSymbol === 'ε' ? 'ε' : rule.inputSymbol;
      groups[key].add(`${input}, ${rule.stackTop} → ${pushStr.replace(/\s+/g, ' ')}`);
    });
    return Object.entries(groups).map(([key, set]) => {
      const [from, to] = key.split('|');
      return { from, to, labels: Array.from(set) };
    });
  }, [rules]);

  return (
    <div className="w-full rounded-3xl border border-slate-700/60 bg-slate-950 overflow-hidden relative flex justify-center shadow-[inset_0_0_60px_rgba(6,182,212,0.04)] min-h-[420px]">
      <svg
        className="w-full h-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
        style={{ minHeight: 420 }}
      >
        <defs>
          {/* Blueprint dot-grid pattern */}
          <pattern id="dotgrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(99,102,241,0.18)" />
          </pattern>

          {/* Arrow markers */}
          <marker id="arr"         markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 9 3, 0 6" fill="#64748b" />
          </marker>
          <marker id="arr-active"  markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 9 3, 0 6" fill="#22d3ee" />
          </marker>

          {/* Glow filter for the active node */}
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Blueprint background */}
        <rect width="800" height="600" fill="url(#dotgrid)" />

        {/* Subtle vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(2,6,23,0.6)" />
        </radialGradient>
        <rect width="800" height="600" fill="url(#vignette)" />

        {/* ── Edges ─────────────────────────────────────────── */}
        {edges.map((edge, idx) => {
          const src = nodeMap[edge.from];
          const tgt = nodeMap[edge.to];
          if (!src || !tgt) return null;

          const isActive  = edge.from === currentState || edge.to === currentState;
          const stroke    = isActive ? '#22d3ee' : '#475569';
          const marker    = isActive ? 'url(#arr-active)' : 'url(#arr)';

          /* ── Self-loop ── */
          if (edge.from === edge.to) {
            const lx = src.x - 14, ly = src.y - NODE_RADIUS - 1;
            const ex = src.x + 14, ey = src.y - NODE_RADIUS - 1;
            const d  = `M ${lx} ${ly} C ${src.x - 70} ${src.y - 150}, ${src.x + 70} ${src.y - 150}, ${ex} ${ey}`;
            return (
              <g key={`e-${idx}`}>
                <path d={d} fill="none" stroke={stroke} strokeWidth="1.8" markerEnd={marker} />
                {/* label */}
                <foreignObject x={src.x - 100} y={src.y - 185} width="200" height="80" overflow="visible" pointerEvents="none">
                  <div xmlns="http://www.w3.org/1999/xhtml" style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>
                    <LabelBadge labels={edge.labels} isActive={isActive} />
                  </div>
                </foreignObject>
              </g>
            );
          }

          /* ── Bidirectional / unidirectional ── */
          const hasReverse = edges.some(e => e.from === edge.to && e.to === edge.from);
          const dx = tgt.x - src.x, dy = tgt.y - src.y;
          const dist = Math.hypot(dx, dy) || 1;

          let cpX, cpY, lx, ly;
          if (hasReverse) {
            const off = 65;
            const px = -dy / dist, py = dx / dist;
            const mx = (src.x + tgt.x) / 2, my = (src.y + tgt.y) / 2;
            cpX = mx + px * off; cpY = my + py * off;
            lx  = mx + px * (off * 0.55); ly  = my + py * (off * 0.55);
          } else {
            cpX = (src.x + tgt.x) / 2; cpY = (src.y + tgt.y) / 2;
            lx = cpX; ly = cpY;
          }

          const da  = Math.atan2(tgt.y - cpY, tgt.x - cpX);
          const ex  = tgt.x - Math.cos(da) * (NODE_RADIUS + 2);
          const ey  = tgt.y - Math.sin(da) * (NODE_RADIUS + 2);
          const sa  = Math.atan2(cpY - src.y, cpX - src.x);
          const sx  = src.x + Math.cos(sa) * (NODE_RADIUS + 2);
          const sy  = src.y + Math.sin(sa) * (NODE_RADIUS + 2);
          const d   = `M ${sx} ${sy} Q ${cpX} ${cpY} ${ex} ${ey}`;

          return (
            <g key={`e-${idx}`}>
              <path d={d} fill="none" stroke={stroke} strokeWidth="1.8" markerEnd={marker} />
              <foreignObject x={lx - 110} y={ly - 55} width="220" height="110" overflow="visible" pointerEvents="none">
                <div xmlns="http://www.w3.org/1999/xhtml" style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>
                  <LabelBadge labels={edge.labels} isActive={isActive} />
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* ── Nodes ─────────────────────────────────────────── */}
        {nodes.map(node => {
          const isCurrent = node.id === currentState;
          const isAccept  = acceptStates && acceptStates.includes(node.id);
          const isStart   = node.id === startState;

          return (
            <g key={`n-${node.id}`}>
              {/* Start arrow */}
              {isStart && (
                <g>
                  <line
                    x1={node.x - NODE_RADIUS - 44} y1={node.y}
                    x2={node.x - NODE_RADIUS - 4}  y2={node.y}
                    stroke="#64748b" strokeWidth="1.8" markerEnd="url(#arr)"
                  />
                  <text x={node.x - NODE_RADIUS - 50} y={node.y - 8} fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="monospace">start</text>
                </g>
              )}

              {/* Glow ring for current */}
              {isCurrent && (
                <circle cx={node.x} cy={node.y}
                  r={NODE_RADIUS + (isAccept ? 10 : 4)}
                  fill="none" stroke="#22d3ee" strokeWidth="5" opacity="0.35"
                  filter="url(#node-glow)"
                />
              )}

              {/* Accept outer ring */}
              {isAccept && (
                <circle cx={node.x} cy={node.y}
                  r={NODE_RADIUS + 6}
                  fill="none" stroke={isCurrent ? '#22d3ee' : '#4ade80'} strokeWidth="2"
                />
              )}

              {/* Node fill */}
              <circle
                cx={node.x} cy={node.y} r={NODE_RADIUS}
                fill={isCurrent ? '#0c2a3a' : '#0f172a'}
                stroke={isCurrent ? '#22d3ee' : isAccept ? '#4ade80' : '#334155'}
                strokeWidth="2.5"
              />

              {/* State label — always white so never invisible */}
              <text
                x={node.x} y={node.y}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={node.id.length > 6 ? 10 : 13}
                fontWeight="700"
                fontFamily="'Courier New', monospace"
                fill={isCurrent ? '#ffffff' : '#e2e8f0'}
              >
                {node.id}
              </text>
            </g>
          );
        })}

        {/* "Empty" placeholder */}
        {nodes.length === 0 && (
          <text x="400" y="300" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="14">
            Load rules to see the state diagram
          </text>
        )}
      </svg>
    </div>
  );
}

/* ─── Edge-label pill badge ─────────────────────────────────── */
function LabelBadge({ labels, isActive }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      padding: '5px 10px',
      borderRadius: '999px',
      border: `1px solid ${isActive ? 'rgba(34,211,238,0.5)' : 'rgba(100,116,139,0.5)'}`,
      background: isActive ? 'rgba(8,51,68,0.92)' : 'rgba(15,23,42,0.88)',
      backdropFilter: 'blur(8px)',
      boxShadow: isActive ? '0 0 12px rgba(34,211,238,0.3)' : '0 2px 8px rgba(0,0,0,0.5)',
      fontSize: '10px',
      fontFamily: "'Courier New', monospace",
      fontWeight: isActive ? 700 : 500,
      color: isActive ? '#cffafe' : '#cbd5e1',
      whiteSpace: 'nowrap',
      textAlign: 'center',
    }}>
      {labels.map((lbl, i) => <span key={i}>{lbl}</span>)}
    </div>
  );
}
