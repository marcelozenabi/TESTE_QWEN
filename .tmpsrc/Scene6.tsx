import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, random} from 'remotion';
import {C} from './theme';
import {io, Vignette, Grain, Dust, GlowDefs} from './common';

const SideMini: React.FC<{frame: number; scale?: number}> = ({frame, scale = 1}) => (
  <g transform={`scale(${scale})`} fill="#0e161c" stroke={C.goldBright} strokeWidth={2.4} strokeLinejoin="round">
    <path d="M -230 0 C -226 -24 -180 -36 -110 -38 L 120 -36 C 178 -32 212 -18 226 0 C 212 16 178 28 120 30 L -110 32 C -180 30 -226 20 -230 0 Z" />
    <path d="M -178 -24 C -226 -84 -238 -122 -226 -132 L -196 -132 C -184 -98 -166 -58 -156 -28 Z" />
    <path d="M -182 -10 L -282 -26 L -280 -14 L -184 6 Z" />
    <path d="M -36 18 L 118 22 L 92 50 L -64 44 Z" />
    <path d="M 84 -2 C 118 -4 138 8 140 18 L 134 36 C 114 40 94 34 86 24 Z" />
    <g transform={`rotate(${(frame * 55) % 360} 146 14)`}>
      <ellipse cx={146} cy={14} rx={3} ry={40} fill={C.beige} opacity={0.85} stroke="none" />
    </g>
    <ellipse cx={146} cy={14} rx={5} ry={42} fill={C.beige} opacity={0.16} stroke="none" />
  </g>
);

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  // câmera subindo junto com o avião atravessando nuvens
  const rise = io(frame, 0, 150, 0, 1);
  const planeY = 900 - rise * 220 + Math.sin(frame / 14) * 14;
  const planeX = width / 2 + Math.sin(frame / 34) * 60;
  const bank = Math.sin(frame / 26) * 5;

  // sol nascendo atrás
  const sunRise = io(frame, 20, 120, 0, 1);
  const sunY = 1080 - sunRise * 260;

  // camadas de nuvens com velocidades diferentes (parallax)
  const cloudLayer = (yBase: number, speed: number, op: number, sc: number, tint: string, n = 5) => (
    <svg width={width} height={height} style={{position: 'absolute', transform: `translateY(${rise * speed * 260}px)`}}>
      {Array.from({length: n}, (_, i) => {
        const x = ((random(i * 17 + yBase) * 1400 - ((frame * speed * 6) % 1600)) % 1600 + 1600) % 1600 - 260;
        const y = yBase + random(i * 3 + yBase) * 160;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${sc * (0.7 + random(i + yBase) * 0.7)})`} opacity={op}>
            <ellipse cx="0" cy="0" rx="230" ry="52" fill={tint} />
            <ellipse cx="-120" cy="-22" rx="130" ry="42" fill={tint} />
            <ellipse cx="130" cy="-16" rx="150" ry="46" fill={tint} />
          </g>
        );
      })}
    </svg>
  );

  const spA = spring({frame: frame - 22, fps, config: {damping: 200, stiffness: 110}});
  const spB = spring({frame: frame - 62, fps, config: {damping: 190, stiffness: 130}});
  const flash = io(frame, 60, 66, 0, 0.5) * io(frame, 66, 84, 0.5, 0);
  const spEnd = spring({frame: frame - 112, fps, config: {damping: 200, stiffness: 90}});

  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, #0f1b24 0%, ${C.blueDeep} 34%, #3a4a52 62%, #8a6a3f 82%, ${C.gold} 100%)`}}>
      {/* sol dourado */}
      <div
        style={{
          position: 'absolute',
          left: width / 2 - 340,
          top: sunY - 340,
          width: 680,
          height: 680,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,232,180,0.95) 0%, rgba(240,201,138,0.5) 30%, rgba(212,164,95,0.12) 55%, transparent 72%)',
          filter: 'blur(2px)',
        }}
      />
      {/* raios do sol girando lentamente */}
      <svg width={width} height={height} style={{position: 'absolute', opacity: 0.22 * sunRise, mixBlendMode: 'screen'}}>
        <g transform={`translate(${width / 2} ${sunY}) rotate(${frame * 0.12})`}>
          {Array.from({length: 12}, (_, i) => (
            <polygon key={i} points="0,0 -26,-900 26,-900" fill={C.goldBright} opacity={0.35} transform={`rotate(${i * 30})`} />
          ))}
        </g>
      </svg>

      {cloudLayer(1180, 1.6, 0.5, 1.1, '#2c3d49')}
      {cloudLayer(940, 1.1, 0.42, 0.9, '#33475a', 4)}

      {/* AVIÃO central */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${io(frame, 0, 150, 1.04, 1.18)})`}}>
        <svg width={width} height={height}>
          <GlowDefs dev={8} />
          <g transform={`translate(${planeX} ${planeY}) rotate(${-4 + bank})`} filter="url(#goldglow)">
            <SideMini frame={frame} scale={1.15} />
          </g>
        </svg>
      </div>

      {cloudLayer(620, 0.55, 0.34, 0.7, '#243544', 4)}
      {cloudLayer(360, 0.3, 0.22, 0.55, '#1b2a38', 3)}

      <Dust count={18} tint={C.goldBright} speed={0.5} up />

      {/* TEXTOS finais */}
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center'}}>
        <div style={{marginBottom: 300, textAlign: 'center'}}>
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: 84,
              color: '#F4EAD5',
              letterSpacing: 2,
              opacity: spA,
              transform: `translateY(${(1 - spA) * 40}px)`,
              textShadow: '0 6px 34px rgba(0,0,0,0.85)',
            }}
          >
            PRIMEIRO, O AVIÃO.
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: 84,
              color: C.gold,
              letterSpacing: 2,
              opacity: spB,
              transform: `translateY(${(1 - spB) * 40}px) scale(${0.94 + spB * 0.06})`,
              textShadow: '0 0 40px rgba(212,164,95,0.5), 0 6px 30px rgba(0,0,0,0.85)',
            }}
          >
            DEPOIS, A EMPRESA.
          </div>
        </div>
        {/* encerramento */}
        <div
          style={{
            position: 'absolute',
            bottom: 420,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            opacity: spEnd,
            transform: `scale(${0.9 + spEnd * 0.1})`,
          }}
        >
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 34,
              letterSpacing: 14,
              color: C.goldBright,
              borderTop: `2px solid ${C.gold}`,
              borderBottom: `2px solid ${C.gold}`,
              padding: '18px 40px 18px 54px',
              background: 'rgba(10,16,20,0.55)',
              textShadow: '0 0 26px rgba(212,164,95,0.6)',
            }}
          >
            GIGANTES NACIONAIS
          </div>
        </div>
      </AbsoluteFill>

      {/* flash dourado na virada dos textos */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 55%, rgba(255,230,180,${flash}) 0%, transparent 60%)`, mixBlendMode: 'screen'}} />

      <Vignette strength={0.6} />
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};
