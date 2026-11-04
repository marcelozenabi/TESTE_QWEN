import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, random} from 'remotion';
import {C} from './theme';
import {io, Vignette, Grain, Dust, GlowDefs, LowerBar} from './common';

// Técnico estilizado (silhueta simples com capacete) — escala pequena
const Worker: React.FC<{x: number; y: number; s: number; phase: number; frame: number; tint?: string}> = ({
  x,
  y,
  s,
  phase,
  frame,
  tint = '#131c24',
}) => {
  const bob = Math.sin(frame / 9 + phase) * 3 * s;
  const arm = Math.sin(frame / 7 + phase) * 0.5;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <circle cx={0} cy={-86} r={16} fill={tint} />
      <rect x={-16} y={-74} width={32} height={52} rx={10} fill={tint} />
      <rect x={-13} y={-24} width={11} height={30} rx={5} fill={tint} />
      <rect x={2} y={-24} width={11} height={30} rx={5} fill={tint} />
      <line x1={14} y1={-62} x2={34 + arm * 16} y2={-44 + arm * 20} stroke={tint} strokeWidth={9} strokeLinecap="round" />
      <line x1={-14} y1={-62} x2={-30} y2={-40} stroke={tint} strokeWidth={9} strokeLinecap="round" />
    </g>
  );
};

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  // câmera lateral percorrendo a linha de produção
  const panX = io(frame, 0, 150, 120, -420);
  const camY = io(frame, 0, 150, 0, -40);

  // esteira deslocando fuselagens pela tela
  const beltSpeed = 3.2;
  const beltOff = -(frame * beltSpeed) % 560;

  const weldOn = frame % 46 < 9;
  const sparkSeed = Math.floor(frame / 3);

  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, #18262f 0%, ${C.blue} 40%, #1d2a31 100%)`}}>
      {/* paredes/hangar ao fundo (parallax fraco) */}
      <div style={{position: 'absolute', inset: 0, transform: `translate(${panX * 0.25}px, ${camY * 0.3}px)`}}>
        <svg width={width} height={height}>
          <defs>
            <GlowDefs id="goldglow" dev={6} />
            <linearGradient id="winG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3d5666" />
              <stop offset="1" stopColor="#22303b" />
            </linearGradient>
          </defs>
          {Array.from({length: 8}, (_, i) => (
            <rect key={i} x={60 + i * 150} y={300} width={90} height={220} rx={6} fill="url(#winG)" stroke="#0f1a21" strokeWidth={4} />
          ))}
          {/* vigas do telhado */}
          {Array.from({length: 10}, (_, i) => (
            <line key={i} x1={i * 130 - 40} y1={210} x2={i * 130 + 90} y2={140} stroke="#0f1a21" strokeWidth={10} />
          ))}
          <line x1="-100" y1="220" x2="1300" y2="220" stroke="#0f1a21" strokeWidth={14} />
        </svg>
      </div>

      {/* LUZES DO HANGAR (feixes volumétricos) */}
      <div style={{position: 'absolute', inset: 0, opacity: 0.5, transform: `translate(${panX * 0.4}px, 0)`}}>
        <svg width={width} height={height}>
          {Array.from({length: 5}, (_, i) => {
            const x = 140 + i * 240;
            return (
              <polygon key={i} points={`${x},180 ${x + 30},180 ${x + 190},1000 ${x - 130},1000`} fill="rgba(240,222,170,0.05)" />
            );
          })}
        </svg>
      </div>

      {/* CAMADA PRINCIPAL — linha de produção */}
      <div style={{position: 'absolute', inset: 0, transform: `translate(${panX}px, ${camY}px)`}}>
        <svg width={width + 600} height={height} style={{position: 'absolute', left: -200}}>
          <defs>
            <linearGradient id="fuseG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#efe8d8" />
              <stop offset="0.6" stopColor="#cdc6b2" />
              <stop offset="1" stopColor="#7e8379" />
            </linearGradient>
            <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2a343b" />
              <stop offset="1" stopColor="#151d22" />
            </linearGradient>
          </defs>

          {/* piso */}
          <rect x="-300" y="1500" width="2200" height="420" fill="url(#floorG)" />
          {Array.from({length: 16}, (_, i) => (
            <line key={i} x1={-300 + i * 150} y1="1500" x2={-300 + i * 150 - 60} y2="1920" stroke="#0d1318" strokeWidth="6" opacity="0.6" />
          ))}
          {/* faixa de segurança amarela */}
          <rect x="-300" y="1488" width="2200" height="12" fill={C.gold} opacity="0.55" />

          {/* guindaste suspenso percorrendo */}
          <g transform={`translate(${600 + Math.sin(frame / 46) * 320} 0)`}>
            <line x1="0" y1="140" x2="0" y2="560" stroke="#3c474e" strokeWidth="10" />
            <rect x="-120" y="120" width="240" height="34" rx="8" fill="#232e35" stroke="#48555e" strokeWidth="3" />
            <line x1="0" y1="560" x2="0" y2="640" stroke="#48555e" strokeWidth="4" />
            {/* seção de fuselagem suspensa */}
            <g transform="translate(0 660)">
              <path d="M -150 0 C -150 -34 -80 -50 0 -50 C 80 -50 150 -34 150 0 C 150 34 80 50 0 50 C -80 50 -150 34 -150 0 Z" fill="url(#fuseG)" stroke="#10181d" strokeWidth="3" />
              {Array.from({length: 6}, (_, i) => (
                <rect key={i} x={-110 + i * 42} y={-26} width={16} height={16} rx={4} fill="#1c2c38" stroke="#10181d" strokeWidth={1.5} />
              ))}
            </g>
          </g>

          {/* ESTEIRA com 3 fuselagens em estágios diferentes */}
          <rect x="-300" y="1240" width="2200" height="26" fill="#39454d" />
          {Array.from({length: 14}, (_, i) => (
            <rect key={i} x={-300 + ((i * 560 * 0 + beltOff + i * 160) % 2240)} y="1246" width={70} height={14} rx={7} fill="#20292f" />
          ))}

          {[0, 1, 2].map((k) => {
            const baseX = 200 + k * 560 + beltOff;
            const stage = k; // 0 só esqueleto, 1 meio, 2 completo
            const x = ((baseX % 2240) + 2240) % 2240;
            return (
              <g key={k} transform={`translate(${x - 200} 1150)`}>
                {/* sombra na esteira */}
                <ellipse cx="0" cy="86" rx="190" ry="14" fill="#000" opacity="0.35" />
                {/* esqueleto da fuselagem */}
                <path
                  d="M -180 0 C -180 -30 -110 -46 -20 -46 L 120 -44 C 168 -40 190 -22 194 0 C 186 20 160 34 120 36 L -20 40 C -110 38 -180 26 -180 0 Z"
                  fill={stage >= 1 ? 'url(#fuseG)' : 'none'}
                  stroke={stage >= 1 ? '#10181d' : C.beige}
                  strokeWidth={stage >= 1 ? 3 : 2}
                  opacity={stage >= 1 ? 1 : 0.7}
                />
                {/* nervuras (sempre visíveis — aspecto de montagem) */}
                {Array.from({length: 9}, (_, i) => (
                  <path
                    key={i}
                    d={`M ${-150 + i * 36} ${-40 + Math.abs(4 - i) * 2} Q ${-150 + i * 36 + 8} 0 ${-150 + i * 36} ${38 - Math.abs(4 - i) * 2}`}
                    stroke={C.beige}
                    strokeWidth={1.4}
                    fill="none"
                    opacity={stage === 0 ? 0.8 : 0.28}
                  />
                ))}
                {/* janelas apenas nos estágios avançados */}
                {stage >= 1 &&
                  Array.from({length: 7}, (_, i) => (
                    <rect key={i} x={-130 + i * 40} y={-24} width={16} height={16} rx={4} fill="#1c2c38" stroke="#10181d" strokeWidth={1.5} />
                  ))}
                {/* asas instaladas no estágio final */}
                {stage === 2 && (
                  <>
                    <path d="M -30 10 L 120 16 L 96 44 L -50 38 Z" fill="url(#fuseG)" stroke="#10181d" strokeWidth={3} />
                    <path d="M 60 -40 C 92 -42 112 -32 116 -18 L 112 4 C 92 10 70 4 62 -8 Z" fill="url(#fuseG)" stroke="#10181d" strokeWidth={3} />
                    <ellipse cx={122} cy={-8} rx={5} ry={40} fill="#cfd8dd" opacity={0.3} />
                  </>
                )}
                {/* faíscas de solda no estágio 0/1 */}
                {weldOn && stage < 2 && (
                  <g>
                    {Array.from({length: 7}, (_, i) => {
                      const a = random(sparkSeed * 10 + i + k) * Math.PI * 2;
                      const r = 14 + random(i + k * 3 + sparkSeed) * 34;
                      return (
                        <line
                          key={i}
                          x1={-150}
                          y1={-6}
                          x2={-150 + Math.cos(a) * r}
                          y2={-6 + Math.sin(a) * r}
                          stroke={C.goldBright}
                          strokeWidth={2.5}
                          filter="url(#goldglow)"
                        />
                      );
                    })}
                    <circle cx={-150} cy={-6} r={7} fill="#fff7dd" filter="url(#goldglow)" />
                  </g>
                )}
              </g>
            );
          })}

          {/* técnicos ao longo da linha */}
          <Worker x={120} y={1480} s={1.5} phase={0} frame={frame} />
          <Worker x={640} y={1480} s={1.6} phase={2} frame={frame} tint="#1a2530" />
          <Worker x={1180} y={1480} s={1.5} phase={4} frame={frame} />
          <Worker x={1640} y={1480} s={1.4} phase={1} frame={frame} tint="#1a2530" />

          {/* carrinhos e peças */}
          <g transform="translate(420 1440)">
            <rect x="-60" y="-50" width="120" height="50" rx="6" fill="#2c3841" stroke="#48555e" strokeWidth="3" />
            <circle cx="-40" cy="8" r="12" fill="#141c22" stroke="#48555e" strokeWidth="3" />
            <circle cx="40" cy="8" r="12" fill="#141c22" stroke="#48555e" strokeWidth="3" />
            <rect x="-46" y="-74" width="92" height="22" rx="5" fill={C.graphite} stroke="#48555e" strokeWidth="2" />
          </g>
          <g transform="translate(980 1448)">
            {Array.from({length: 4}, (_, i) => (
              <rect key={i} x={-70} y={-24 - i * 26} width={140} height={22} rx={4} fill={i % 2 ? '#33404a' : '#26313a'} stroke="#48555e" strokeWidth={2} />
            ))}
          </g>
        </svg>
      </div>

      <Dust count={22} tint={C.beige} speed={0.6} />

      <LowerBar kicker="PRODUÇÃO EM SÉRIE" title="A EMPRESA NASCEU PARA PRODUZIR O AVIÃO EM SÉRIE." startFrame={12} />

      <Vignette strength={0.66} />
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};
