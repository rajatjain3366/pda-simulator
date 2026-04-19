import React, { useMemo } from 'react';

export default function StateDiagram({ rules, currentState, startState, acceptStates }) {
  // 1. Gather distinct states and setup circle layout relative to viewBox 800x600
  const nodes = useMemo(() => {
    const stateSet = new Set([startState]);
    if (acceptStates) acceptStates.forEach(s => stateSet.add(s));
    if (rules) {
      rules.forEach(r => {
        stateSet.add(r.currentState);
        stateSet.add(r.nextState);
      });
    }

    const states = Array.from(stateSet).sort();
    
    return states.map((st, i) => {
      // Center single node, otherwise distribute
      if (states.length === 1) return { id: st, x: 400, y: 300 };
      
      // Shift so the first is usually at the top or leftmost
      const angle = (i / states.length) * 2 * Math.PI + Math.PI; 
      // Using Math.PI makes index 0 start on the left side, typical for flow diagrams
      
      return {
        id: st,
        x: 400 + Math.cos(angle) * 220,
        y: 300 + Math.sin(angle) * 160
      };
    });
  }, [rules, startState, acceptStates]);

  const nodeMap = useMemo(() => {
    const map = {};
    nodes.forEach(n => map[n.id] = n);
    return map;
  }, [nodes]);

  // 2. Group edges
  const edges = useMemo(() => {
    const groups = {};
    if (!rules) return [];

    rules.forEach((rule) => {
      const key = `${rule.currentState}|${rule.nextState}`;
      if (!groups[key]) groups[key] = [];
      
      const pushStr = rule.pushSymbols || 'ε';
      const pop = rule.stackTop;
      const input = rule.inputSymbol === 'e' || rule.inputSymbol === 'ε' ? 'ε' : rule.inputSymbol;
      
      // Format: "input, pop → push"
      groups[key].push(`${input}, ${pop} → ${pushStr.replace(/\s+/g, '')}`);
    });

    return Object.entries(groups).map(([key, labels]) => {
      const [from, to] = key.split('|');
      return { from, to, labels: Array.from(new Set(labels)) }; // Deduplicate identical visually
    });
  }, [rules]);

  // View settings
  const NODE_RADIUS = 30;

  return (
    <div className="w-full bg-slate-950/50 rounded-3xl border border-slate-800 overflow-hidden text-slate-200 shadow-inner relative flex justify-center min-h-[400px]">
      <svg className="w-full h-full max-h-[600px]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrowhead" markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 9 3, 0 6" fill="#94a3b8" />
          </marker>
          <marker id="arrowhead-current" markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 9 3, 0 6" fill="#06b6d4" />
          </marker>
        </defs>

        {/* 3. Draw Edges */}
        {edges.map((edge, idx) => {
          const source = nodeMap[edge.from];
          const target = nodeMap[edge.to];
          if (!source || !target) return null;

          const isActive = edge.from === currentState || edge.to === currentState;
          const strokeColor = isActive ? "#06b6d4" : "#475569";
          const markerId = isActive ? "url(#arrowhead-current)" : "url(#arrowhead)";

          // Self Loop
          if (edge.from === edge.to) {
            const startX = source.x - 12;
            const startY = source.y - NODE_RADIUS - 2;
            const endX = source.x + 12;
            const endY = source.y - NODE_RADIUS - 2;
            
            // Loop goes up and around
            const pathData = `M ${startX} ${startY} C ${source.x - 60} ${source.y - 130}, ${source.x + 60} ${source.y - 130}, ${endX} ${endY}`;
            
            return (
              <g key={`edge-${idx}`}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2"
                  markerEnd={markerId}
                  className="transition-all duration-300"
                />
                <foreignObject
                  x={source.x - 100}
                  y={source.y - 145}
                  width="200"
                  height="100"
                  className="overflow-visible pointer-events-none"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <LabelBadge labels={edge.labels} isActive={isActive} />
                  </div>
                </foreignObject>
              </g>
            );
          }

          // Unidirectional / Bidirectional
          const hasReverse = edges.some(e => e.from === edge.to && e.to === edge.from);
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.hypot(dx, dy);
          
          let cpX, cpY, labelX, labelY;
          
          if (hasReverse) {
             // Curve apart
             const offset = 60; // How far it arcs outwards
             const pX = -dy / dist;
             const pY = dx / dist;
             
             const midX = (source.x + target.x) / 2;
             const midY = (source.y + target.y) / 2;
             
             cpX = midX + pX * offset;
             cpY = midY + pY * offset;
             
             labelX = midX + pX * (offset / 2);
             labelY = midY + pY * (offset / 2);
          } else {
             // Straight line - still use quadratic equation for consistency but curve is 0
             cpX = (source.x + target.x) / 2;
             cpY = (source.y + target.y) / 2;
             labelX = cpX;
             labelY = cpY;
          }

          const destAngle = Math.atan2(target.y - cpY, target.x - cpX);
          const endX = target.x - Math.cos(destAngle) * (NODE_RADIUS + 2);
          const endY = target.y - Math.sin(destAngle) * (NODE_RADIUS + 2);
          
          const srcAngle = Math.atan2(cpY - source.y, cpX - source.x);
          const startX = source.x + Math.cos(srcAngle) * (NODE_RADIUS + 2);
          const startY = source.y + Math.sin(srcAngle) * (NODE_RADIUS + 2);
          
          const pathData = `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`;
          
          return (
            <g key={`edge-${idx}`}>
              <path
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                markerEnd={markerId}
                className="transition-all duration-300"
              />
              <foreignObject
                x={labelX - 100}
                y={labelY - 50}
                width="200"
                height="100"
                className="overflow-visible pointer-events-none"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <LabelBadge labels={edge.labels} isActive={isActive} />
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* 4. Draw Nodes */}
        {nodes.map(node => {
          const isCurrent = node.id === currentState;
          const isAccept = acceptStates && acceptStates.includes(node.id);
          const isStart = node.id === startState;

          return (
            <g key={`node-${node.id}`} className="transition-all duration-300">
              {/* Start State entry arrow */}
              {isStart && (
                 <g>
                   <path
                     d={`M ${node.x - NODE_RADIUS - 40} ${node.y} L ${node.x - NODE_RADIUS - 5} ${node.y}`}
                     fill="none"
                     stroke="#64748b"
                     strokeWidth="2"
                     markerEnd="url(#arrowhead)"
                   />
                   <text x={node.x - NODE_RADIUS - 45} y={node.y - 8} fill="#94a3b8" fontSize="12" className="select-none font-medium text-center">Start</text>
                 </g>
              )}

              {/* Accept double circle */}
              {isAccept && (
                <circle cx={node.x} cy={node.y} r={NODE_RADIUS + 6} fill="none" stroke={isCurrent ? "#06b6d4" : "#334155"} strokeWidth="2" />
              )}
              
              {/* Circle glow underneath if current */}
              {isCurrent && (
                <circle cx={node.x} cy={node.y} r={NODE_RADIUS + (isAccept ? 6 : 0)} stroke="#06b6d4" strokeWidth="6" className="animate-pulse opacity-50" fill="none" />
              )}

              {/* Main Node Shape */}
              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS}
                fill="#0f172a" // slate-900
                stroke={isCurrent ? "#22d3ee" : "#334155"} // cyan-400 or slate-700
                strokeWidth="3"
                className="shadow-2xl"
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dy=".3em"
                fill={isCurrent ? "#ffffff" : "#cbd5e1"}
                className={`select-none font-bold ${isCurrent ? 'text-lg' : 'text-base'}`}
              >
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Sleek Pill-shaped Badge for grouped edge labels
function LabelBadge({ labels, isActive }) {
  return (
    <div className={`pointer-events-auto flex flex-col gap-0.5 rounded-2xl px-3 py-1.5 backdrop-blur-md border shadow-lg transition-colors duration-300 ${
      isActive 
        ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-50' 
        : 'bg-slate-800/60 border-slate-700/50 text-slate-300'
    }`}>
      {labels.map((lbl, i) => (
        <span key={i} className={`text-[11px] font-mono leading-tight text-center whitespace-nowrap ${isActive ? 'font-semibold' : 'font-medium'}`}>
          {lbl}
        </span>
      ))}
    </div>
  );
}
