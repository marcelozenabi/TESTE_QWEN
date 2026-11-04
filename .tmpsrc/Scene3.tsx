import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, random} from 'remotion';
import {C} from './theme';
import {io, Vignette, Grain, Dust, GlowDefs} from './common';

// Aeronave lateral estilizada (EMB-110: turboélice bimotor, asa baixa, nariz arredondado)
const SidePlane: React.FC<{frame: number; gear: number}> = ({frame, gear}) => {
  return (
    <g>
      {/* sombra projetada handled outside */}
      {/* fuselagem */}
      <path
        d="M -260 0 C -258 -34 -220 -46 -150 -48 L 150 -46 C 210 -44 246 -30 258 -8 L 262 4 C 250 26 210 36 150 37 L -160 38 C -224 36 -258 22 -260 0 Z"
        fill="url(#fuseSide)"
        stroke="#0d1418"
        strokeWidth={2.5}
      />
      {/* faixa de janelas */}
      <path d="M -140 -20 L 190 -18" stroke="#2b3a46" strokeWidth={10} strokeLinecap="round" opacity={0.0} />
      {Array.from({length: 11}, (_, i) => (
        <rect key={i} x={-130 + i * 30} y={-24} width={13} height={13} rx={4} fill="#1c2c38" stroke="#0d1418" strokeWidth={1} />
      ))}
      {/* cockpit */}
      <path d="M 200 -30 C 224 -28 240 -16 246 -4 L 208 -4 C 202 -14 200 -22 200 -30 Z" fill="#16242f" stroke="#0d1418" strokeWidth={2} />
      {/* deriva */}
      <path d="M -210 -30 C -268 -96 -282 -140 -268 -150 L -232 -150 C -214 -110 -196 -66 -184 -34 Z" fill="url(#finSide)" stroke="#0d1418" strokeWidth={2.5} />
      <path d="M -262 -140 L -186 -128 L -188 -116 L -258 -126 Z" fill="#D4A45F" opacity={0.85} />
      {/* estabilizador */}
      <path d="M -212 -18 L -320 -34 L -318 -20 L -214 2 Z" fill="url(#fuseSide)" stroke="#0d1418" strokeWidth={2} />
      {/* asa próxima (perspectiva) */}
      <path d="M -30 26 L 150 30 L 118 62 L -60 56 Z" fill="url(#wingSide)" stroke="#0d1418" strokeWidth={2.5} />
      {/* nacela do motor */}
      <path d="M 96 -6 C 130 -8 152 2 156 16 L 150 40 C 128 46 104 42 96 30 Z" fill="url(#nacSide)" stroke="#0d1418" strokeWidth={2.5} />
      {/* hélice girando */}
      <g transform="translate(158 18)">
        <ellipse rx={7} ry={58} fill="#cfd8dd" opacity={0.28} />
        <g transform={`rotate(${(frame * 46) % 360})`}>
          {[0, 90].map((a) => (
            <ellipse key={a} rx={4} ry={56} fill="#141b20" opacity={0.9} transform={`rotate(${a})`} />
          ))}
        </g>
        <circle r={9} fill="#2a343b" stroke="#0d1418" strokeWidth={2} />
      </g>
      {/* trem de pouso retrátil */}
      <g opacity={gear}>
        <line x1={130} y1={40} x2={130} y2={74} stroke="#0d1418" strokeWidth={7} />
        <circle cx={130} cy={80} r={13} fill="#14181b" stroke="#2f3a41" strokeWidth={3} />
        <line x1={-150} y1={38} x2={-150} y2={70} stroke="#0d1418" strokeWidth={6} />
        <circle cx={-150} cy={76} r={11} fill="#14181b" stroke="#2f3a41" strokeWidth={3} />
      </g>
      <defs>
        <linearGradient id="fuseSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f0e4" />
          <stop offset="0.55" stopColor="#ddd5c2" />
          <stop offset="1" stopColor="#7f8278" />
        </linearGradient>
        <linearGradient id="wingSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6dfcc" />
          <stop offset="1" stopColor="#8b8f86" />
        </linearGradient>
        <linearGradient id="nacSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e9e3d2" />
          <stop offset="1" stopColor="#8f8a7c" />
        </linearGradient>
        <linearGradient id="finSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe8d8" />
          <stop offset="1" stopColor="#a9a291" />
        </linearGradient>
      </defs>
    </g>
  );
};

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  // fase 0..1 — corrida na pista até rotação; depois decolagem
  const roll = io(frame, 0, 60, 0, 1);
  const rotate = io(frame, 58, 84, 0, 1);
  const climb = io(frame, 80, 150, 0, 1);

  // posição do avião (mundo): começa à esquerda fora, acelera
  const planeX = io(frame, 0, 60, -180, 320, (t) => t * t) + io(frame, 60, 150, 0, 260);
  const groundY = 1430;
  const planeY = groundY - 150 - climb * 620 - Math.pow(roll, 2) * 0;
  const pitch = -rotate * 14 - climb * 4 + Math.sin(frame / 9) * 0.8;

  // câmera acompanha com leve atraso e zoom out
  const camX = io(frame, 0, 150, 0, -140);
  const camZoom = io(frame, 0, 150, 1.12, 0.92);
  const skyReveal = io(frame, 40, 96, 0, 1);

  // pista em perspectiva: linhas correndo
  const speed = io(frame, 0, 60, 6, 46) + climb * 30;
  const dashOff = -(frame * speed) % 240;

  const sp1 = spring({frame: frame - 18, fps, config: {damping: 200, stiffness: 130}});
  const sp2 = spring({frame: frame - 92, fps, config: {damping: 200, stiffness: 130}});

  return (
    <AbsoluteFill style={{background: '#0c141b'}}>
      {/* CÉU com profundidade (revelado na decolagem) */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${camZoom}) translateX(${camX}px)`}}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, #16242f 0%, #213748 ${38 + skyReveal * 10}%, #33505f 62%, #4a5a52 74%, #2c3a33 82%)`,
          }}
        />
        {/* sol baixo atrás */}
        <div
          style={{
            position: 'absolute',
            left: 640,
            top: 940,
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(240,201,138,0.5) 0%, rgba(212,164,95,0.16) 42%, transparent 70%)',
            filter: 'blur(6px)',
            opacity: skyReveal,
          }}
        />
        {/* montanhas distantes (parallax lento) */}
        <svg width={width} height={height} style={{position: 'absolute', transform: `translateX(${camX * -0.25}px)`}}>
          <path d="M -100 1330 L 180 1180 L 380 1300 L 620 1150 L 860 1290 L 1180 1200 L 1250 1330 Z" fill="#1a2c36" opacity={0.9 * skyReveal} />
          <path d="M -100 1360 L 240 1260 L 520 1350 L 820 1240 L 1180 1340 L 1250 1400 L -100 1400 Z" fill="#152430" opacity={skyReveal} />
        </svg>

        {/* hangar e torre ao fundo */}
        <svg width={width} height={height} style={{position: 'absolute', transform: `translateX(${camX * -0.4}px)`}} opacity={skyReveal}>
          <rect x="70" y="1180" width="360" height="150" rx="8" fill="#101b23" />
          <path d="M 60 1180 Q 250 1090 440 1180 Z" fill="#0d1720" />
          <rect x="900" y="1080" width="46" height="250" fill="#101b23" />
          <rect x="880" y="1060" width="86" height="46" rx="6" fill="#16242e" />
          <circle cx="923" cy="1052" r="6" fill={C.goldBright} opacity={0.5 + 0.5 * Math.sin(frame / 6)} />
        </svg>

        {/* PISTA em perspectiva forçada */}
        <svg width={width} height={height} style={{position: 'absolute'}}>
          <defs>
            <GlowDefs id="goldglow" dev={5} />
            <linearGradient id="runway" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#39434a" />
              <stop offset="1" stopColor="#1c2429" />
            </linearGradient>
          </defs>
          <polygon points="40,1920 1040,1920 760,1408 320,1408" fill="url(#runway)" />
          <polygon points="320,1408 760,1408 764,1418 316,1418" fill="#46525a" opacity={0.8} />
          {/* linhas centrais correndo em direção à câmera */}
          {Array.from({length: 9}, (_, i) => {
            const p = ((i * 240 + dashOff) % 2160) / 2160; // 0 longe -> 1 perto
            const z = 0.08 + p * p * 1.4;
            const y = 1410 + p * p * 500;
            const w = 10 + z * 46;
            return (
              <rect key={i} x={540 - w / 2} y={y} width={w} height={12 + z * 40} fill="#dfe6ea" opacity={0.28 + p * 0.5} rx={2} />
            );
          })}
          {/* luzes de pista */}
          {Array.from({length: 7}, (_, i) => {
            const p = ((i * 320 + dashOff * 0.8) % 2240) / 2240;
            const y = 1408 + p * p * 470;
            const s = 3 + p * 9;
            return (
              <React.Fragment key={i}>
                <circle cx={330 - p * 250} cy={y} r={s} fill={C.goldBright} opacity={0.5 + p * 0.4} filter="url(#goldglow)" />
                <circle cx={750 + p * 250} cy={y} r={s} fill={C.goldBright} opacity={0.5 + p * 0.4} filter="url(#goldglow)" />
              </React.Fragment>
            );
          })}
        </svg>

        {/* AVIÃO + sombra dinâmica */}
        <div style={{position: 'absolute', inset: 0}}>
          <svg width={width} height={height}>
            <ellipse
              cx={planeX + camX * 0}
              cy={Math.min(groundY + 60, planeY + 130 + climb * 320)}
              rx={200 - climb * 90}
              ry={26 - climb * 14}
              fill="#000"
              opacity={0.42 - climb * 0.25}
            />
            <g transform={`translate(${planeX} ${planeY}) rotate(${pitch}) scale(${1 + roll * 0.12})`}>
              <SidePlane frame={frame} gear={io(frame, 66, 88, 1, 0)} />
            </g>
            {/* fumaça dos pneus no toque/rotação */}
            {frame > 44 && frame < 78 &&
              Array.from({length: 8}, (_, i) => {
                const age = (frame - 44 - i * 3) / 30;
                if (age < 0 || age > 1) return null;
                return (
                  <circle
                    key={i}
                    cx={planeX - 150 - age * 260 - random(i) * 40}
                    cy={groundY + 40 - age * 60}
                    r={14 + age * 60}
                    fill="#cfd6da"
                    opacity={(1 - age) * 0.16}
                  />
                );
              })}
          </svg>
        </div>
      </div>

      <Dust count={14} tint={C.beige} speed={0.9} />

      {/* TEXTOS da cena */}
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center'}}>
        <div style={{marginBottom: 380, textAlign: 'center'}}>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 30,
              letterSpacing: 9,
              color: C.gold,
              opacity: sp1,
              textShadow: '0 2px 16px rgba(0,0,0,0.85)',
            }}
          >
            22 DE OUTUBRO DE 1968
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: 64,
              color: '#F4EAD5',
              letterSpacing: 2,
              opacity: sp2,
              transform: `translateY(${(1 - sp2) * 30}px)`,
              textShadow: '0 6px 30px rgba(0,0,0,0.9)',
            }}
          >
            PRIMEIRO VOO DE TESTE
          </div>
        </div>
      </AbsoluteFill>

      <Vignette strength={0.68} />
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};
