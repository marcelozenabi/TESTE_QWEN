import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, random} from 'remotion';
import {C, splinePath, Vec} from './theme';
import {io, Vignette, Grain, Dust, DrawPath, GlowDefs, LowerBar} from './common';

// Planta técnica do Bandeirante — vista superior
const fuse: Vec[] = [
  [0, -150], [26, -120], [34, -40], [36, 60], [30, 130], [10, 170], [-10, 170], [-30, 130], [-36, 60], [-34, -40], [-26, -120], [0, -150],
];
const wingL: Vec[] = [[-30, -20], [-250, 10], [-268, 34], [-60, 42], [-30, 20]];
const wingR: Vec[] = [[30, -20], [250, 10], [268, 34], [60, 42], [30, 20]];
const stabL: Vec[] = [[-22, 120], [-110, 140], [-116, 154], [-24, 152]];
const stabR: Vec[] = [[22, 120], [110, 140], [116, 154], [24, 152]];

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  // câmera percorre a mesa técnica (parallax em duas camadas)
  const panX = io(frame, 0, 150, 90, -70);
  const panY = io(frame, 0, 150, 130, -110);
  const tilt = io(frame, 0, 150, 10, -6);

  const pBody = io(frame, 8, 55, 0, 1);
  const pWings = io(frame, 30, 80, 0, 1);
  const pTail = io(frame, 60, 100, 0, 1);
  const pEng = io(frame, 80, 118, 0, 1);
  const pGrid = io(frame, 0, 30, 0, 0.9);

  // "caneta" desenhando — ponto que segue o traçado atual
  const penPts: Vec[] = fuse;
  const penProg = Math.min(1, pBody);
  const idx = Math.min(penPts.length - 2, Math.floor(penProg * (penPts.length - 1)));
  const lt = penProg * (penPts.length - 1) - idx;
  const pen: Vec = [
    penPts[idx][0] + (penPts[idx + 1][0] - penPts[idx][0]) * lt,
    penPts[idx][1] + (penPts[idx + 1][1] - penPts[idx][1]) * lt,
  ];

  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, #1a2b38 0%, ${C.blue} 45%, #14212c 100%)`}}>
      {/* mesa de madeira escura nas bordas */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 120% 80% at 50% 45%, transparent 55%, rgba(10,14,17,0.9) 100%)'}} />

      {/* PAPEL TÉCNICO (camada 1 — parallax forte) */}
      <div style={{position: 'absolute', inset: 0, transform: `translate(${panX}px, ${panY}px) rotate(${tilt * 0.12}deg)`}}>
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 340,
            width: 960,
            height: 1150,
            background: `linear-gradient(175deg, #d9cba9 0%, #cdbd97 55%, #c2b189 100%)`,
            boxShadow: '0 40px 90px rgba(0,0,0,0.55), inset 0 0 120px rgba(120,90,40,0.25)',
            transform: 'rotate(-1.6deg)',
            clipPath: 'polygon(0% 1%, 100% 0%, 99.4% 99%, 1% 100%)',
          }}
        >
          <svg viewBox="-330 -220 660 440" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
            {/* malha milimetrada */}
            <defs>
              <pattern id="mm" width="22" height="22" patternUnits="userSpaceOnUse">
                <path d="M22 0H0V22" fill="none" stroke="#8a7648" strokeWidth="0.5" opacity="0.4" />
              </pattern>
              <GlowDefs id="softglow" dev={3} />
            </defs>
            <rect x="-330" y="-220" width="660" height="440" fill="url(#mm)" opacity={pGrid} />
            <g transform="translate(0 -10)">
              {/* eixos */}
              <DrawPath d="M 0 -200 L 0 210" progress={pBody} stroke="#3f5060" width={1} dash="5 6" opacity={0.6} />
              <DrawPath d="M -300 12 L 300 12" progress={pBody} stroke="#3f5060" width={1} dash="5 6" opacity={0.6} />
              {/* fuselagem */}
              <DrawPath d={splinePath(fuse)} progress={pBody} stroke={C.graphite} width={3} />
              {/* asas */}
              <DrawPath d={splinePath(wingL)} progress={pWings} stroke={C.graphite} width={3} />
              <DrawPath d={splinePath(wingR)} progress={pWings} stroke={C.graphite} width={3} />
              {/* empenagem */}
              <DrawPath d={splinePath(stabL)} progress={pTail} stroke={C.graphite} width={2.6} />
              <DrawPath d={splinePath(stabR)} progress={pTail} stroke={C.graphite} width={2.6} />
              {/* nacelas + discos de hélice */}
              <g opacity={pEng}>
                <rect x={-122} y={-16} width={26} height={62} rx={12} fill="none" stroke={C.graphite} strokeWidth={2.6} />
                <rect x={96} y={-16} width={26} height={62} rx={12} fill="none" stroke={C.graphite} strokeWidth={2.6} />
                <circle cx={-109} cy={-14} r={30} fill="none" stroke="#3f5060" strokeWidth={1.4} strokeDasharray="5 6" />
                <circle cx={109} cy={-14} r={30} fill="none" stroke="#3f5060" strokeWidth={1.4} strokeDasharray="5 6" />
              </g>
              {/* janelas */}
              <g opacity={pWings}>
                {Array.from({length: 9}, (_, i) => (
                  <circle key={i} cx={-9} cy={-96 + i * 16} r={3.4} fill="none" stroke={C.graphite} strokeWidth={1.4} />
                ))}
              </g>
              {/* cotas douradas */}
              <g opacity={pEng}>
                <DrawPath d="M -268 78 L 268 78" progress={pEng} stroke={C.gold} width={2} />
                <text x="0" y="102" textAnchor="middle" fill="#5d4a22" fontFamily="'Space Mono', monospace" fontSize="17" letterSpacing="2">
                  EMB-110 BANDEIRANTE — ESCALA 1:80
                </text>
              </g>
              {/* caneta desenhando */}
              {pBody < 1 && (
                <g transform={`translate(${pen[0]} ${pen[1] - 10})`} filter="url(#softglow)">
                  <circle r={5} fill={C.gold} />
                  <line x1="0" y1="0" x2="34" y2="-46" stroke={C.goldBright} strokeWidth={3} strokeLinecap="round" />
                  <circle cx={34} cy={-46} r={3} fill={C.beige} />
                </g>
              )}
            </g>
          </svg>
          {/* mancha de café / envelhecimento */}
          <div style={{position:'absolute', right: 40, top: 60, width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(122,88,40,0.16) 45%, rgba(122,88,40,0.05) 60%, transparent 72%)'}}/>
        </div>
      </div>

      {/* OBJETOS DA MESA (camada 2 — parallax mais fraco) */}
      <div style={{position: 'absolute', inset: 0, transform: `translate(${panX * 0.45}px, ${panY * 0.45}px)`}}>
        <svg width={width} height={height}>
          <defs>
            <linearGradient id="rulerG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#caa25e" />
              <stop offset="1" stopColor="#8a6a35" />
            </linearGradient>
            <linearGradient id="metalG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#cfd6da" />
              <stop offset="0.5" stopColor="#8d979e" />
              <stop offset="1" stopColor="#5c666d" />
            </linearGradient>
          </defs>
          {/* régua dourada */}
          <g transform={`translate(120 ${1560 + io(frame, 0, 150, 30, -20)}) rotate(-8)`}>
            <rect width="720" height="52" rx="6" fill="url(#rulerG)" stroke="#5d4519" strokeWidth="2" />
            {Array.from({length: 24}, (_, i) => (
              <line key={i} x1={20 + i * 30} y1="0" x2={20 + i * 30} y2={i % 5 === 0 ? 26 : 15} stroke="#4a3512" strokeWidth="2" />
            ))}
          </g>
          {/* compasso metálico */}
          <g transform={`translate(880 420) rotate(${io(frame, 0, 150, -14, 10)})`}>
            <line x1="0" y1="0" x2="-46" y2="150" stroke="url(#metalG)" strokeWidth="9" strokeLinecap="round" />
            <line x1="0" y1="0" x2="52" y2="146" stroke="url(#metalG)" strokeWidth="9" strokeLinecap="round" />
            <circle r="12" fill="#b8c2c8" stroke="#4d565c" strokeWidth="3" />
          </g>
          {/* engrenagem mecânica girando */}
          <g transform={`translate(930 ${1620 + io(frame, 0, 150, 20, -30)}) rotate(${frame * 1.4})`}>
            {Array.from({length: 12}, (_, i) => (
              <rect key={i} x={-5} y={-70} width={10} height={22} fill="#7d8890" transform={`rotate(${i * 30})`} />
            ))}
            <circle r={52} fill="#59636b" stroke="#8d979e" strokeWidth={6} />
            <circle r={16} fill="#232c33" />
          </g>
          {/* peças aéreas semicírculo (turbinas estilizadas) */}
          <g transform={`translate(150 480) rotate(${io(frame, 0, 150, 8, -6)})`} opacity={0.95}>
            <circle r={58} fill="none" stroke="#9aa5ac" strokeWidth={10} />
            <circle r={34} fill="none" stroke="#6f7a82" strokeWidth={6} strokeDasharray="10 8" />
            <circle r={10} fill="#8d979e" />
          </g>
        </svg>
      </div>

      <Dust count={16} tint={C.beige} speed={0.5} />

      <LowerBar kicker="ENGENHARIA NACIONAL" title="BRASIL. DÉCADA DE 1960." startFrame={18} big />

      {/* luz dramática varrendo a mesa */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 34% at ${50 + Math.sin(frame / 40) * 16}% ${38 + Math.cos(frame / 50) * 8}%, rgba(244,226,180,0.16) 0%, transparent 70%)`,
          mixBlendMode: 'screen',
        }}
      />
      <Vignette strength={0.7} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
