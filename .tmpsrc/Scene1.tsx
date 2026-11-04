import React from 'react';
import {AbsoluteFill, useCurrentFrame, spring, useVideoConfig} from 'remotion';
import {C} from './theme';
import {io, Vignette, Grain, Dust, DrawPath, GlowDefs} from './common';
import {BandeiranteFront} from './Bandeirante';

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, height, width} = useVideoConfig();

  // câmera: avanço lento em direção à aeronave
  const zoom = io(frame, 0, 120, 1.32, 1.62);
  const camY = io(frame, 0, 120, 40, -60);

  // progresso de desenho das linhas (cada grupo tem sua janela)
  const pFus = io(frame, 4, 42, 0, 1);
  const pWing = io(frame, 18, 62, 0, 1);
  const pProp = io(frame, 34, 78, 0, 1);
  const pTail = io(frame, 44, 88, 0, 1);
  const pDim = io(frame, 58, 118, 0, 1);

  // scanner de construção varrendo a tela
  const scanY = io(frame, 0, 96, 250, 1250, (t) => t);

  const flicker = 0.82 + 0.18 * Math.sin(frame * 0.55) * Math.sin(frame * 0.21);

  // textos em duas etapas com spring
  const sp1 = spring({frame: frame - 26, fps, config: {damping: 200, stiffness: 120, mass: 0.7}});
  const sp2 = spring({frame: frame - 58, fps, config: {damping: 170, stiffness: 150, mass: 0.8}});
  const shudder = frame >= 56 && frame < 64 ? Math.sin((frame - 56) * 2.4) * 6 : 0;

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 50% 40%, ${C.blueDeep} 0%, #0a131a 70%, #05090c 100%)`}}>
      {/* grade técnica de fundo */}
      <AbsoluteFill style={{opacity: 0.16}}>
        <svg width={width} height={height}>
          <defs>
            <pattern id="grid1" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M60 0H0V60" fill="none" stroke={C.beige} strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="1080" height="1920" fill="url(#grid1)" />
        </svg>
      </AbsoluteFill>

      {/* AERONAVE — desenho técnico luminoso */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            transform: `scale(${zoom}) translateY(${camY}px)`,
            filter: `brightness(${flicker + 0.2})`,
          }}
        >
          <svg width="1000" height="700" viewBox="-500 -260 1000 700">
            <GlowDefs dev={6} />
            {/* eixo central */}
            <DrawPath d="M 0 -220 L 0 420" progress={pFus} stroke={C.beige} width={1.4} dash="4 10" opacity={0.5} />
            <g transform="translate(0 40)">
              <BandeiranteFront variant="line" stroke={C.gold} glow />
              {/* sobreposição de traçado controlado por draw-on */}
            </g>
            {/* linhas de cota */}
            <g opacity={pDim}>
              <DrawPath d="M -320 205 L 320 205" progress={pDim} stroke={C.beige} width={1.6} opacity={0.75} />
              <DrawPath d="M -320 195 L -320 215" progress={pDim} stroke={C.beige} width={1.6} opacity={0.75} />
              <DrawPath d="M 320 195 L 320 215" progress={pDim} stroke={C.beige} width={1.6} opacity={0.75} />
              <text x="0" y="240" textAnchor="middle" fill={C.beige} fontFamily="'Space Mono', monospace" fontSize="26" letterSpacing="4">
                ENVERGADURA 15,8 m
              </text>
              <DrawPath d="M -372 -180 L -372 300" progress={pDim} stroke={C.beige} width={1.2} dash="3 9" opacity={0.4} />
            </g>
          </svg>
        </div>
      </AbsoluteFill>

      {/* máscara de revelação: as linhas só aparecem dentro da faixa do scanner */}
      <svg width={width} height={height} style={{position: 'absolute'}}>
        <rect x="0" y={scanY} width="1080" height="4" fill={C.goldBright} opacity={frame < 100 ? 0.5 : 0}>
        </rect>
      </svg>

      <Dust count={20} tint={C.gold} speed={0.7} />

      {/* TEXTO — duas etapas */}
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center'}}>
        <div style={{marginBottom: 430, textAlign: 'center', transform: `translateX(${shudder}px)`}}>
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: 96,
              lineHeight: 1.02,
              color: '#F4EAD5',
              letterSpacing: 2,
              textShadow: '0 6px 40px rgba(0,0,0,0.9)',
              clipPath: `inset(0 ${(1 - sp1) * 100}% 0 0)`,
            }}
          >
            ESTE AVIÃO
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: 88,
              lineHeight: 1.02,
              color: C.gold,
              letterSpacing: 1,
              textShadow: '0 0 34px rgba(212,164,95,0.45), 0 6px 30px rgba(0,0,0,0.9)',
              clipPath: `inset(0 ${(1 - sp2) * 100}% 0 0)`,
            }}
          >
            VEIO ANTES DA EMBRAER.
          </div>
        </div>
      </AbsoluteFill>

      <Vignette strength={0.75} />
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};
