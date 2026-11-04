import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {C} from './theme';
import {io, Vignette, Grain, Dust, GlowDefs} from './common';

// Silhueta lateral simplificada para o "fly-by" de transição
const PlaneSilhouette: React.FC<{frame: number}> = ({frame}) => (
  <g fill="#0c1319" stroke={C.gold} strokeWidth={2}>
    <path d="M -240 0 C -236 -26 -190 -38 -120 -40 L 130 -38 C 190 -34 226 -20 240 0 C 226 18 190 30 130 32 L -120 34 C -190 32 -236 20 -240 0 Z" />
    <path d="M -190 -26 C -240 -90 -252 -130 -240 -140 L -208 -140 C -194 -104 -176 -62 -166 -30 Z" />
    <path d="M -196 -12 L -300 -28 L -298 -16 L -198 4 Z" />
    <path d="M -40 20 L 130 24 L 100 54 L -70 48 Z" />
    <path d="M 90 -2 C 126 -4 146 8 148 20 L 142 40 C 120 44 100 38 92 26 Z" />
    <ellipse cx={152} cy={16} rx={6} ry={46} fill={C.gold} opacity={0.25} stroke="none" />
    <g transform={`rotate(${(frame * 60) % 360} 152 16)`}>
      <ellipse cx={152} cy={16} rx={3} ry={44} fill={C.beige} opacity={0.8} stroke="none" />
    </g>
  </g>
);

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  // avião cruza a tela e "puxa" a linha do tempo
  const flyP = io(frame, 0, 52, 0, 1, (t) => t * t + 0.3 * t);
  const planeX = -320 + flyP * (width + 640);
  const planeY = 560 - Math.sin(flyP * Math.PI) * 120;

  // linha do tempo desenhada
  const tlP = io(frame, 34, 74, 0, 1);
  const y1968 = 780;
  const y1969 = 1180;

  const sp68 = spring({frame: frame - 44, fps, config: {damping: 200, stiffness: 120}});
  const spArrow = io(frame, 60, 84, 0, 1);
  const sp69 = spring({frame: frame - 78, fps, config: {damping: 180, stiffness: 140}});

  // estrutura industrial emerge das linhas
  const build = io(frame, 88, 148, 0, 1);
  const hangarH = build * 560;
  const roofP = io(frame, 118, 150, 0, 1);
  const craneA = Math.sin(frame / 26) * 7;

  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, #0b1319 0%, ${C.blueDeep} 55%, #101922 100%)`}}>
      {/* grade de fundo com leve movimento */}
      <AbsoluteFill style={{opacity: 0.1, transform: `translateY(${io(frame, 0, 150, 0, -40)}px)`}}>
        <svg width={width} height={height}>
          <defs>
            <pattern id="grid4" width="72" height="72" patternUnits="userSpaceOnUse">
              <path d="M72 0H0V72" fill="none" stroke={C.beige} strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="1080" height="1920" fill="url(#grid4)" />
        </svg>
      </AbsoluteFill>

      {/* AVIÃO cruzando (fly-by) */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${io(frame, 0, 150, 1.06, 0.96)})`}}>
        <svg width={width} height={height}>
          <GlowDefs dev={5} />
          <g transform={`translate(${planeX} ${planeY}) rotate(${-6 + Math.sin(flyP * Math.PI) * 8}) scale(0.72)`}>
            <PlaneSilhouette frame={frame} />
          </g>
          {/* rastro luminoso */}
          {flyP > 0.05 && (
            <line
              x1={Math.max(-40, planeX - 620)}
              y1={planeY + 12}
              x2={planeX - 200}
              y2={planeY + 12}
              stroke={`url(#trailG)`}
              strokeWidth={5}
              opacity={0.8}
              filter="url(#goldglow)"
            />
          )}
          <defs>
            <linearGradient id="trailG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={C.gold} stopOpacity="0" />
              <stop offset="1" stopColor={C.goldBright} stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* LINHA DO TEMPO vertical */}
      <svg width={width} height={height} style={{position: 'absolute'}}>
        <line x1="540" y1={y1968} x2="540" y2={y1968 + (y1969 - y1968 + 120) * tlP} stroke={C.gold} strokeWidth={4} opacity={0.9} filter="url(#goldglow)" />
        {/* nó 1968 */}
        <g opacity={sp68} transform={`translate(540 ${y1968}) scale(${0.6 + sp68 * 0.4})`}>
          <circle r={16} fill="#0b1319" stroke={C.gold} strokeWidth={4} />
          <circle r={5} fill={C.goldBright} />
          <text x={-40} y={-34} textAnchor="end" fill="#F4EAD5" fontFamily="'Montserrat', sans-serif" fontWeight="800" fontSize={78}>
            1968
          </text>
          <text x={-40} y={0} textAnchor="end" fill={C.beige} fontFamily="'Space Mono', monospace" fontSize={22} letterSpacing={3} opacity={0.75}>
            PRIMEIRO VOO
          </text>
        </g>
        {/* seta do meio */}
        <g opacity={spArrow} transform={`translate(540 ${(y1968 + y1969) / 2})`}>
          <path d="M -14 -26 L 14 0 L -14 26 M 14 0 L -20 0" fill="none" stroke={C.goldBright} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" filter="url(#goldglow)" />
        </g>
        {/* nó 1969 */}
        <g opacity={sp69} transform={`translate(540 ${y1969}) scale(${0.6 + sp69 * 0.4})`}>
          <circle r={20} fill={C.gold} stroke={C.goldBright} strokeWidth={4} filter="url(#goldglow)" />
          <circle r={7} fill="#0b1319" />
          <text x={46} y={-30} fill="#F4EAD5" fontFamily="'Montserrat', sans-serif" fontWeight="800" fontSize={78}>
            1969
          </text>
          <text x={46} y={4} fill={C.gold} fontFamily="'Space Mono', monospace" fontSize={22} letterSpacing={3}>
            19 DE AGOSTO
          </text>
        </g>
      </svg>

      {/* ESTRUTURA INDUSTRIAL emergindo por baixo */}
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 620, overflow: 'hidden'}}>
        <svg width={width} height={620} viewBox="0 0 1080 620">
          {/* galpão crescendo de linhas */}
          <g stroke={C.beige} strokeWidth={3} fill="none" opacity={0.9}>
            <line x1="120" y1="620" x2="120" y2={620 - hangarH * 0.62} />
            <line x1="960" y1="620" x2="960" y2={620 - hangarH * 0.62} />
            <line x1="300" y1="620" x2="300" y2={620 - hangarH * 0.8} />
            <line x1="780" y1="620" x2="780" y2={620 - hangarH * 0.8} />
            {/* telhado curvo revelado progressivamente */}
            <path d="M 90 300 Q 540 120 990 300" strokeDasharray="1900" strokeDashoffset={1900 * (1 - roofP)} stroke={C.gold} />
            <path d="M 130 320 Q 540 160 950 320" strokeDasharray="1800" strokeDashoffset={1800 * (1 - roofP)} opacity={0.6} />
          </g>
          {/* treliças internas */}
          <g stroke={C.beige} strokeWidth={1.6} opacity={build * 0.8}>
            {Array.from({length: 9}, (_, i) => {
              const x = 140 + i * 100;
              return (
                <g key={i}>
                  <line x1={x} y1={620} x2={x} y2={340 - Math.abs(4 - i) * -18} />
                  <line x1={x} y1={620} x2={x + 100} y2={380} />
                </g>
              );
            })}
            <line x1="120" y1="420" x2="960" y2="420" />
          </g>
          {/* guindaste balançando */}
          <g transform={`translate(640 300) rotate(${craneA})`} opacity={roofP}>
            <line x1="0" y1="0" x2="-180" y2="60" stroke={C.gold} strokeWidth={5} />
            <line x1="-180" y1="60" x2="-180" y2="150" stroke={C.beige} strokeWidth={2.5} />
            <rect x="-196" y="150" width="32" height="22" fill={C.graphite} stroke={C.beige} strokeWidth={2} />
          </g>
          <rect x="620" y="290" width="40" height="330" fill="#131f28" stroke={C.beige} strokeWidth={2.5} opacity={roofP} />
          {/* piso industrial */}
          <rect x="0" y="600" width="1080" height="20" fill={C.graphite} opacity={build} />
        </svg>
      </div>

      <Dust count={18} tint={C.gold} speed={0.8} />

      {/* texto principal da cena */}
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center'}}>
        <div style={{marginBottom: 60, textAlign: 'center'}}>
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: 72,
              color: C.gold,
              letterSpacing: 3,
              opacity: sp69,
              transform: `translateY(${(1 - sp69) * 26}px)`,
              textShadow: '0 0 30px rgba(212,164,95,0.4), 0 6px 26px rgba(0,0,0,0.9)',
            }}
          >
            NASCE A EMBRAER
          </div>
        </div>
      </AbsoluteFill>

      <Vignette strength={0.7} />
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};
