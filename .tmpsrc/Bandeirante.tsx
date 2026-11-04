import React from 'react';

type Props = {
  variant: 'line' | 'solid';
  stroke?: string;
  glow?: boolean;
};

// Vista frontal estilizada do EMB-110 Bandeirante (turboélice bimotor, asa baixa)
export const BandeiranteFront: React.FC<Props> = ({ variant, stroke = '#D4A45F', glow }) => {
  const line = variant === 'line';
  const bodyFill = line ? 'none' : 'url(#fuseGrad)';
  const wingFill = line ? 'none' : 'url(#wingGrad)';
  const sw = line ? 3 : 1.5;
  const lineStroke = stroke;
  const solidStroke = '#0e1a22';
  const s = line ? lineStroke : solidStroke;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {glow ? (
        <defs>
          <filter id="goldglow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      ) : null}
      <g filter={glow ? 'url(#goldglow)' : undefined}>
        {/* asas */}
        <path
          d="M -38 -6 L -300 34 L -300 46 L -38 12 Z"
          fill={wingFill}
          stroke={s}
          strokeWidth={sw}
        />
        <path
          d="M 38 -6 L 300 34 L 300 46 L 38 12 Z"
          fill={wingFill}
          stroke={s}
          strokeWidth={sw}
        />
        {/* estabilizador horizontal */}
        <path
          d="M -16 66 L -118 96 L -118 104 L -16 80 Z"
          fill={wingFill}
          stroke={s}
          strokeWidth={sw}
        />
        <path
          d="M 16 66 L 118 96 L 118 104 L 16 80 Z"
          fill={wingFill}
          stroke={s}
          strokeWidth={sw}
        />
        {/* deriva */}
        <path
          d="M -7 -4 C -11 -66 11 -66 7 -4 Z"
          fill={line ? 'none' : 'url(#finGrad)'}
          stroke={s}
          strokeWidth={sw}
        />
        {/* fuselagem */}
        <ellipse cx="0" cy="34" rx="37" ry="47" fill={bodyFill} stroke={s} strokeWidth={sw} />
        {!line && (
          <ellipse cx="0" cy="34" rx="37" ry="47" fill="url(#fuseShade)" opacity="0.55" />
        )}
        {/* cockpit */}
        <path
          d="M -17 8 C -13 -1 13 -1 17 8 C 9 13 -9 13 -17 8 Z"
          fill={line ? 'none' : '#1c3040'}
          stroke={s}
          strokeWidth={line ? sw : 1.2}
        />
        {/* nacelas dos motores */}
        <rect x="-150" y="-16" width="34" height="58" rx="16" fill={line ? 'none' : 'url(#nacGrad)'} stroke={s} strokeWidth={sw} />
        <rect x="116" y="-16" width="34" height="58" rx="16" fill={line ? 'none' : 'url(#nacGrad)'} stroke={s} strokeWidth={sw} />
        {/* hélices (discos + pás) */}
        {[-133, 133].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy={6} r={44} fill={line ? 'none' : '#dfe8ee'} opacity={line ? 1 : 0.14} stroke={s} strokeWidth={line ? sw : 1} strokeDasharray={line ? '10 8' : '6 6'} />
            <circle cx={cx} cy={6} r={6} fill={line ? 'none' : '#22272B'} stroke={s} strokeWidth={sw} />
          </g>
        ))}
        {/* trem de pouso (apenas sólido) */}
        {!line && (
          <g stroke="#0e1a22" strokeWidth={4}>
            <line x1="-133" y1="40" x2="-133" y2="72" />
            <line x1="133" y1="40" x2="133" y2="72" />
            <line x1="0" y1="78" x2="0" y2="96" />
            <circle cx="-133" cy="78" r="9" fill="#11181d" />
            <circle cx="133" cy="78" r="9" fill="#11181d" />
            <circle cx="0" cy="102" r="8" fill="#11181d" />
          </g>
        )}
        {/* detalhes de painel */}
        {line && (
          <g stroke={stroke} strokeWidth={1.4} opacity={0.75}>
            <line x1="-38" y1="34" x2="-133" y2="34" />
            <line x1="38" y1="34" x2="133" y2="34" />
            <ellipse cx="0" cy="34" rx="20" ry="30" fill="none" strokeDasharray="6 7" />
            <line x1="-300" y1="40" x2="-300" y2="86" strokeDasharray="4 6" />
            <line x1="300" y1="40" x2="300" y2="86" strokeDasharray="4 6" />
            <line x1="-260" y1="30" x2="-260" y2="76" strokeDasharray="4 6" />
            <line x1="260" y1="30" x2="260" y2="76" strokeDasharray="4 6" />
          </g>
        )}
      </g>
      {!line && (
        <defs>
          <linearGradient id="fuseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2efe6" />
            <stop offset="0.55" stopColor="#d9d2c2" />
            <stop offset="1" stopColor="#8f8a7c" />
          </linearGradient>
          <radialGradient id="fuseShade" cx="0.8" cy="0.85" r="1">
            <stop offset="0" stopColor="#000000" stopOpacity="0.7" />
            <stop offset="0.6" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e8e2d3" />
            <stop offset="1" stopColor="#9aa0a0" />
          </linearGradient>
          <linearGradient id="nacGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f4f1e8" />
            <stop offset="1" stopColor="#9b968a" />
          </linearGradient>
          <linearGradient id="finGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#e8e2d3" />
            <stop offset="1" stopColor="#a89a80" />
          </linearGradient>
        </defs>
      )}
    </g>
  );
};

// Hélice animada em vista lateral/quadra — rotaciona com o frame
export const Prop: React.FC<{
  cx: number;
  cy: number;
  r: number;
  frame: number;
  color?: string;
  blur?: boolean;
}> = ({ cx, cy, r, frame, color = '#101619', blur }) => {
  const rot = (frame * 40) % 360;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {blur && <circle r={r} fill={color} opacity={0.1} />}
      <g transform={`rotate(${rot})`}>
        {[0, 60, 120].map((a) => (
          <ellipse
            key={a}
            rx={r * 0.09}
            ry={r}
            fill={color}
            opacity={0.85}
            transform={`rotate(${a})`}
          />
        ))}
      </g>
      <circle r={r * 0.1} fill={color} />
    </g>
  );
};
