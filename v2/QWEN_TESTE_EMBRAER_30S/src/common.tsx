import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  random,
} from 'remotion';
import {C} from './theme';

// interpolate com clamp + easing padrão cinematográfico
export const io = (
  f: number,
  inA: number,
  inB: number,
  outA: number,
  outB: number,
  ease: (t: number) => number = Easing.out(Easing.cubic),
) =>
  interpolate(f, [inA, inB], [outA, outB], {
    easing: ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

// Fundo com vinheta cinematográfica
export const Vignette: React.FC<{strength?: number; color?: string}> = ({
  strength = 0.62,
  color = '#000',
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 125% 95% at 50% 42%, transparent 42%, ${color}${Math.round(
        strength * 255,
      )
        .toString(16)
        .padStart(2, '0')} 100%)`,
      pointerEvents: 'none',
    }}
  />
);

// textura de grão de filme determinística
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.05}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);
  const dots = Array.from({length: 90}, (_, i) => ({
    x: random(seed * 91 + i) * 1080,
    y: random(seed * 37 + i * 7) * 1920,
    r: 0.8 + random(seed + i * 13) * 1.6,
  }));
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      <svg width="1080" height="1920">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={i % 3 === 0 ? C.beige : '#000'} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// Barra de "broadcast" inferior com legenda do documentário
export const LowerBar: React.FC<{
  kicker: string;
  title: string;
  startFrame: number;
  accent?: string;
  big?: boolean;
}> = ({kicker, title, startFrame, accent = C.gold, big}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  if (local < 0) return null;
  const barIn = io(local, 0, 14, 0, 1);
  const kickOp = io(local, 4, 14, 0, 1);
  const titleP = io(local, 8, 26, 0, 1);
  const chars = title.length;
  const shown = Math.floor(titleP * chars);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end'}}>
      <div
        style={{
          position: 'absolute',
          bottom: 300,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 60px',
        }}
      >
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: big ? 30 : 27,
            letterSpacing: 8,
            color: accent,
            opacity: kickOp,
            textTransform: 'uppercase',
            textShadow: '0 2px 14px rgba(0,0,0,0.8)',
            transform: `translateY(${(1 - barIn) * 26}px)`,
            textAlign: 'center',
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            marginTop: 16,
            height: 3,
            width: `${barIn * 100}%`,
            maxWidth: 560,
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          }}
        />
        <div
          style={{
            marginTop: 22,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: big ? 66 : 58,
            lineHeight: 1.12,
            color: '#F4EAD5',
            letterSpacing: 1,
            textAlign: 'center',
            textShadow: '0 4px 26px rgba(0,0,0,0.85)',
            minHeight: 80,
          }}
        >
          {title.slice(0, shown)}
          {shown < chars && local % 20 < 12 ? (
            <span style={{color: accent}}>▌</span>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Revelação de linha técnica (stroke draw-on)
export const DrawPath: React.FC<{
  d: string;
  progress: number; // 0..1
  stroke?: string;
  width?: number;
  dash?: string;
  opacity?: number;
  glow?: boolean;
}> = ({d, progress, stroke = C.gold, width = 3, dash, opacity = 1, glow}) => {
  const len = 3000;
  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeDasharray={dash ?? `${len}`}
      strokeDashoffset={dash ? 0 : len * (1 - Math.max(0, Math.min(1, progress)))}
      opacity={opacity}
      strokeLinecap="round"
      filter={glow ? 'url(#goldglow)' : undefined}
    />
  );
};

export const GlowDefs: React.FC<{id?: string; dev?: number}> = ({id = 'goldglow', dev = 7}) => (
  <defs>
    <filter id={id} x="-70%" y="-70%" width="240%" height="240%">
      <feGaussianBlur stdDeviation={dev} result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

// partículas de poeira/luz flutuando (profundidade)
export const Dust: React.FC<{count?: number; tint?: string; speed?: number; up?: boolean}> = ({
  count = 26,
  tint = C.beige,
  speed = 1,
  up = true,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width="1080" height="1920">
        {Array.from({length: count}, (_, i) => {
          const bx = random(i * 3 + 1) * 1080;
          const by = random(i * 7 + 2) * 1920;
          const s = 1 + random(i * 11) * 3.2;
          const drift = ((frame * speed * (up ? -1 : 1) * (0.4 + random(i) * 0.8)) % 1920 + 1920) % 1920;
          const y = (by + drift) % 1920;
          const x = bx + Math.sin((frame + i * 40) / 40) * 22;
          return (
            <circle key={i} cx={x} cy={y} r={s} fill={tint} opacity={0.05 + random(i * 5) * 0.12} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const TitleChip: React.FC<{startFrame: number; endFrame?: number}> = ({
  startFrame,
  endFrame = 900,
}) => {
  const frame = useCurrentFrame();
  const op = io(frame, startFrame, startFrame + 12, 0, 1) * io(frame, endFrame - 10, endFrame, 1, 0);
  return (
    <div
      style={{
        position: 'absolute',
        top: 96,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: op,
      }}
    >
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 22,
          letterSpacing: 10,
          color: C.gold,
          border: `1px solid ${C.gold}55`,
          padding: '10px 26px 10px 34px',
          background: 'rgba(14,26,34,0.55)',
          backdropFilter: 'blur(2px)',
        }}
      >
        GIGANTES NACIONAIS
      </div>
    </div>
  );
};
