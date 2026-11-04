import {AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import React from 'react';
import {C} from './theme';
import {Grain, Vignette} from './common';

const F = (n: number) => ({fontFamily: "'Montserrat', sans-serif", fontWeight: n});
const easeMap: Record<string, (t: number) => number> = {
  'ease-out': Easing.out(Easing.cubic),
  'ease-in-out': Easing.inOut(Easing.ease),
  cubic: Easing.inOut(Easing.cubic),
};
const io = (v: number, ins: number[], outs: number[], _u?: unknown, ease?: string) =>
  interpolate(v, ins, outs, {
    easing: ease ? easeMap[ease] : undefined,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

// ---------- shared cinematic overlays ----------
const Look: React.FC<{vig?: number}> = ({vig = 0.55}) => (
  <>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 45%, rgba(6,8,10,0.55) 78%, rgba(4,5,7,0.92) 100%)',
        mixBlendMode: 'multiply',
      }}
    />
    <Vignette strength={vig} />
    {/* anamorphic-ish warm grade */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(180deg, rgba(212,164,95,0.10) 0%, rgba(0,0,0,0) 30%, rgba(20,40,55,0.18) 100%)',
        mixBlendMode: 'overlay',
      }}
    />
    <Grain opacity={0.07} />
  </>
);

// Dust motes with parallax depth for the workshop scene
const Motes: React.FC<{count?: number; layer?: number}> = ({count = 26, layer = 0}) => {
  const frame = useCurrentFrame();
  const items = React.useMemo(() => {
    const arr = [];
    let s = 9871 + layer * 131;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    for (let i = 0; i < count; i++) {
      arr.push({x: rnd() * 1080, y: rnd() * 1920, r: 1.2 + rnd() * (layer === 2 ? 4 : 2), a: 0.08 + rnd() * 0.22, sp: 0.3 + rnd() * 0.9});
    }
    return arr;
  }, [count, layer]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {items.map((m, i) => {
        const drift = ((frame * m.sp + i * 37) % 2200) - 140;
        const x = m.x + Math.sin((frame + i * 40) / 60) * (6 + layer * 5);
        const y = m.y - drift * 0.25 + Math.cos((frame + i * 30) / 80) * 4;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: m.r * 2,
              height: m.r * 2,
              borderRadius: '50%',
              background: `rgba(240,205,150,${m.a})`,
              filter: layer === 2 ? 'blur(2.5px)' : layer === 1 ? 'blur(1px)' : 'none',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Volumetric light shafts (scene 1 & 3)
const Shafts: React.FC<{angle?: number; intensity?: number}> = ({angle = -18, intensity = 1}) => {
  const frame = useCurrentFrame();
  const flick = 0.9 + 0.1 * Math.sin(frame / 23);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {[0, 1, 2].map((k) => (
        <div
          key={k}
          style={{
            position: 'absolute',
            top: '-20%',
            left: `${8 + k * 26}%`,
            width: `${10 + k * 4}%`,
            height: '150%',
            transform: `rotate(${angle}deg) skewX(${6 - k * 3}deg) translateX(${Math.sin(frame / 47 + k) * 8}px)`,
            background: `linear-gradient(180deg, rgba(244,206,150,${0.16 * intensity * flick}) 0%, rgba(244,206,150,0) 75%)`,
            filter: 'blur(14px)',
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Elegant small caption
const Caption: React.FC<{
  text: string;
  start: number;
  size?: number;
  top?: number | string;
  weight?: number;
  tracking?: number;
  gold?: boolean;
}> = ({text, start, size = 44, top = 'auto', weight = 700, tracking = 10, gold = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const o = io(frame, [start, start + 9], [0, 1]);
  const words = text.split(' ');
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: size * 0.34,
        opacity: o,
        pointerEvents: 'none',
      }}
    >
      {words.map((w, i) => {
        const wi = spring({frame: frame - start - i * 2, fps, config: {damping: 17, stiffness: 150}});
        return (
          <span
            key={i}
            style={{
              ...F(weight),
              fontSize: size,
              letterSpacing: tracking,
              color: gold ? C.goldBright : C.beige,
              transform: `translateY(${(1 - wi) * 26}px) scale(${0.94 + 0.06 * wi})`,
              opacity: wi,
              textShadow: '0 2px 18px rgba(0,0,0,0.75), 0 0 34px rgba(212,164,95,0.22)',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// thin elegant rule line that draws in
const Rule: React.FC<{start: number; width?: number; top: number | string}> = ({start, width = 420, top}) => {
  const frame = useCurrentFrame();
  const p = io(frame, [start, start + 16], [0, 1], undefined, 'ease-out');
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top,
        height: 2,
        width: width * p,
        transform: 'translateX(-50%)',
        background: `linear-gradient(90deg, rgba(212,164,95,0) 0%, ${C.gold} 30%, ${C.gold} 70%, rgba(212,164,95,0) 100%)`,
        boxShadow: '0 0 14px rgba(212,164,95,0.55)',
      }}
    />
  );
};

// ================= SCENE 1 — WORKSHOP DESK (frames 0..90) =================
const SceneWorkshop: React.FC = () => {
  const frame = useCurrentFrame();
  // camera: slow lateral dolly + push-in, eased
  const t = io(frame, [0, 90], [0, 1], undefined, 'cubic');
  const zoom = 1.16 + t * 0.1;
  const panX = (0.5 - t) * 74;
  const panY = -t * 46;
  // hand-drawn animated blueprint overlay lines (SVG stroke build-on)
  const drawP = io(frame, [8, 78], [0, 1], undefined, 'ease-in-out');
  return (
    <AbsoluteFill style={{background: '#141009'}}>
      {/* deep background: blurred desk photo (out of focus plate) */}
      <div style={{position: 'absolute', inset: -60, filter: 'blur(26px) brightness(0.5) saturate(0.7)', transform: `scale(${zoom * 0.985}) translate(${panX * 0.4}px,${panY * 0.4}px)`}}>
        <Img src={staticFile('v2_workshop_desk.jpg')} style={{width: '112%', height: '112%', objectFit: 'cover', objectPosition: '42% 30%'}} />
      </div>
      {/* main sharp plate */}
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom}) translate(${panX}px,${panY}px)`, transformOrigin: '46% 34%', filter: 'saturate(0.72) contrast(1.06)'}}>
          <Img src={staticFile('v2_workshop_desk.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '44% 26%'}} />
        </div>
      </div>
      {/* foreground animated technical overlay drawn on the sheet */}
      <svg
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', transform: `scale(${zoom}) translate(${panX}px,${panY}px)`, mixBlendMode: 'multiply', opacity: 0.9}}
      >
        <g fill="none" stroke="#3a2f20" strokeWidth={3} strokeLinecap="round">
          {/* callout circles + leader lines appearing as camera passes */}
          {[
            {cx: 300, cy: 560, r: 74, at: 0.25},
            {cx: 640, cy: 700, r: 58, at: 0.55},
            {cx: 520, cy: 1420, r: 66, at: 0.8},
          ].map((c, i) => {
            const lp = io(drawP, [c.at - 0.12, c.at + 0.1], [0, 1]);
            return (
              <g key={i} opacity={lp}>
                <circle cx={c.cx} cy={c.cy} r={c.r} strokeDasharray={2 * Math.PI * c.r} strokeDashoffset={2 * Math.PI * c.r * (1 - lp)} stroke="#8a6a35" />
                <line x1={c.cx + c.r * 0.72} y1={c.cy - c.r * 0.72} x2={c.cx + c.r * 2.1} y2={c.cy - c.r * 1.9} stroke="#8a6a35" strokeWidth={2} strokeDasharray={400} strokeDashoffset={400 * (1 - lp)} />
              </g>
            );
          })}
        </g>
      </svg>
      {/* defocused foreground paper corner (parallax near layer) */}
      <div
        style={{
          position: 'absolute',
          bottom: -140 + io(frame, [0, 90], [0, 40]) ,
          right: -180,
          width: 620,
          height: 460,
          transform: `rotate(-14deg) translate(${-panX * 1.8}px, ${-panY * 1.6}px)`,
          background: 'linear-gradient(160deg, #d9c9a6 0%, #b7a37c 100%)',
          filter: 'blur(9px) brightness(0.5)',
          borderRadius: 8,
          boxShadow: '0 -20px 60px rgba(0,0,0,0.6)',
        }}
      />
      <Shafts intensity={1.15} />
      <Motes count={20} layer={0} />
      <Motes count={14} layer={2} />
      {/* warm exposure bloom pulsing subtly */}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 24% 12%, rgba(255,196,110,0.20) 0%, rgba(0,0,0,0) 55%)', mixBlendMode: 'screen'}} />
      <Caption text="BRASIL, 1968" start={26} size={52} top="12.5%" tracking={14} />
      <Rule start={40} top="calc(12.5% + 92px)" width={360} />
      <div
        style={{
          position: 'absolute',
          top: 'calc(12.5% + 118px)',
          left: 0,
          right: 0,
          textAlign: 'center',
          ...F(500),
          fontSize: 27,
          letterSpacing: 7,
          color: 'rgba(229,211,182,0.78)',
          opacity: io(frame, [44, 58], [0, 1]),
          textShadow: '0 2px 12px rgba(0,0,0,0.8)',
        }}
      >
        OFICINA AERONÁUTICA · CTA
      </div>
      <Look vig={0.6} />
    </AbsoluteFill>
  );
};

// ================= SCENE 2 — REVEAL DO BANDEIRANTE (frames 78..174) =================
const SceneReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame; // sequence starts ~78
  // wipe-in mask opening from center diagonal
  const wipe = io(local, [0, 16], [0, 1], undefined, 'ease-out');
  // camera: arc push toward plane
  const t = io(local, [0, 96], [0, 1], undefined, 'cubic');
  const zoom = 1.05 + t * 0.14;
  const dx = (0.5 - t) * 40;
  const dy = -10 + t * 58;
  const parallaxBack = io(local, [0, 96], [1.12, 1.02]);
  return (
    <AbsoluteFill style={{background: C.blueDark}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `polygon(${50 - 55 * wipe}% 0%, ${50 + 55 * wipe}% 0%, ${50 + 58 * wipe}% 100%, ${50 - 58 * wipe}% 100%)`,
        }}
      >
        {/* back atmospheric plate (blurred full photo) */}
        <div style={{position: 'absolute', inset: -80, filter: 'blur(20px) brightness(0.42) saturate(0.6)', transform: `scale(${parallaxBack})`}}>
          <Img src={staticFile('v2_plane_full.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 42%'}} />
        </div>
        {/* hero cutout plate */}
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom}) translate(${dx}px,${dy}px)`, transformOrigin: '50% 55%'}}>
            <Img src={staticFile('v2_plane_hero.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 46%'}} />
          </div>
        </div>
        {/* sun flare streak */}
        <div
          style={{
            position: 'absolute',
            left: '-10%',
            top: '58%',
            width: '120%',
            height: 3,
            background: 'linear-gradient(90deg, rgba(240,201,138,0) 0%, rgba(240,201,138,0.75) 35%, rgba(255,240,210,0.95) 50%, rgba(240,201,138,0.7) 65%, rgba(240,201,138,0) 100%)',
            filter: 'blur(2px)',
            transform: `rotate(-6deg) scaleX(${io(local, [10, 40], [0.2, 1], undefined, 'ease-out')})`,
            opacity: io(local, [10, 30, 70, 96], [0, 0.9, 0.75, 0.35]),
          }}
        />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 72%, rgba(212,164,95,0.22) 0%, rgba(0,0,0,0) 60%)', mixBlendMode: 'screen'}} />
        <Motes count={12} layer={1} />
        <Caption text="O AVIÃO VEIO PRIMEIRO." start={30} size={58} top="70.5%" tracking={6} />
        <Rule start={44} top="calc(70.5% - 44px)" width={300} />
      </div>
      <Look vig={0.5} />
    </AbsoluteFill>
  );
};

// ================= SCENE 3 — GANCHO FINAL / INDÚSTRIA (frames 168..240) =================
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  // hard-cut feel: fast settle zoom
  const settle = spring({frame, fps: 30, config: {damping: 20, stiffness: 200}});
  const t = io(frame, [0, 72], [0, 1], undefined, 'cubic');
  const zoom = (1.22 - 0.1 * t) * (0.97 + 0.03 * settle);
  // industrial silhouette skyline rising behind
  const rise = io(frame, [6, 40], [0, 1], undefined, 'ease-out');
  return (
    <AbsoluteFill style={{background: '#0c1216'}}>
      {/* sky dawn gradient */}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1b2c3a 0%, #33465a 34%, #8a6a44 68%, #d9a866 88%, #f3cf94 100%)', opacity: io(frame, [0, 20], [0.55, 1])}} />
      {/* moving cloud layers (parallax) */}
      {[{top: '18%', op: 0.5, sp: 0.55, sc: 1.3}, {top: '34%', op: 0.35, sp: 0.9, sc: 1.0}, {top: '52%', op: 0.28, sp: 1.5, sc: 0.8}].map((c, i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: c.top, opacity: c.op, transform: `translateX(${((frame * c.sp * 2.2) % 1300) - 220}px)`}}>
          <div style={{width: 900, height: 130, marginLeft: -450, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(240,220,190,0.85) 0%, rgba(240,220,190,0) 70%)', filter: `blur(${14 + i * 6}px) scale(${c.sc})`}} />
          <div style={{width: 700, height: 110, marginLeft: 620, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(245,228,200,0.8) 0%, rgba(245,228,200,0) 70%)', filter: `blur(${16 + i * 5}px)`}} />
        </div>
      ))}
      {/* aircraft crossing (cutout photo, slight banking) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '26%',
          transform: `translateX(${interpolate(frame, [0, 72], [-620, 120], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px) translateY(${Math.sin(frame / 14) * 8}px) rotate(${2 + Math.sin(frame / 18) * 1.6}deg) scale(${zoom * 0.72})`,
          transformOrigin: '50% 50%',
          filter: 'drop-shadow(0 26px 40px rgba(0,0,0,0.55)) saturate(0.8)',
        }}
      >
        <Img src={staticFile('v2_plane_hero.jpg')} style={{width: 1500, height: 1500, objectFit: 'contain', objectPosition: '50% 62%', marginLeft: -210, maskImage: 'radial-gradient(ellipse 46% 30% at 50% 62%, black 62%, transparent 76%)', WebkitMaskImage: 'radial-gradient(ellipse 46% 30% at 50% 62%, black 62%, transparent 76%)'}} />
      </div>
      {/* factory hangars silhouette growing from engineering lines */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: '34%'}}>
        <svg viewBox="0 0 1080 650" preserveAspectRatio="none" style={{width: '100%', height: '100%', display: 'block'}}>
          <defs>
            <linearGradient id="sil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c262e" />
              <stop offset="100%" stopColor="#0a0e12" />
            </linearGradient>
          </defs>
          <g transform={`translate(0 ${650 - 650 * rise})`}>
            <path d="M0,650 L0,430 L120,430 L120,360 L200,330 L200,430 L330,430 L330,300 Q430,210 530,300 L530,430 L660,430 L660,380 L780,380 L780,430 L900,430 L900,340 L940,320 L980,340 L980,430 L1080,430 L1080,650 Z" fill="url(#sil)" />
            {/* crane towers */}
            <rect x={252} y={180} width={10} height={250} fill="#141c22" />
            <rect x={196} y={180} width={120} height={9} fill="#141c22" />
            <rect x={706} y={226} width={9} height={204} fill="#141c22" />
            <rect x={654} y={226} width={112} height={8} fill="#141c22" />
            {/* lit windows */}
            {[360, 396, 432, 468].map((x, i) => (
              <rect key={i} x={x} y={470} width={16} height={22} fill="#e8b56a" opacity={0.85} />
            ))}
            {[60, 96, 700, 736, 830].map((x, i) => (
              <rect key={i} x={x} y={486} width={14} height={18} fill="#d4955f" opacity={0.7} />
            ))}
          </g>
        </svg>
      </div>
      {/* golden horizon glow behind silhouettes */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: '18%', height: '26%', background: 'radial-gradient(ellipse at 50% 100%, rgba(244,196,120,0.5) 0%, rgba(244,196,120,0) 70%)', mixBlendMode: 'screen'}} />
      {/* impact title with cut flash */}
      {(() => {
        const start = 14;
        const flash = io(frame, [start, start + 3, start + 12], [0, 0.5, 0]);
        const l1 = spring({frame: frame - start, fps: 30, config: {damping: 15, stiffness: 170}});
        const l2 = spring({frame: frame - start - 10, fps: 30, config: {damping: 15, stiffness: 170}});
        const line = (txt: string, p: number, delay: number, size: number, gold: boolean) => {
          const vis = io(frame, [delay, delay + 6], [0, 1]);
          return (
            <div style={{opacity: vis, transform: `translateY(${(1 - p) * 60}px) scale(${0.9 + 0.1 * p})`, filter: p < 1 ? `blur(${(1 - p) * 6}px)` : 'none'}}>
              <span style={{...F(800), fontSize: size, letterSpacing: 4, color: gold ? C.goldBright : '#f4ead6', textShadow: '0 4px 26px rgba(0,0,0,0.8)'}}>{txt}</span>
            </div>
          );
        };
        return (
          <div style={{position: 'absolute', left: 0, right: 0, top: '58%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
            {line('ANTES DA', l1, start, 74, false)}
            {line('EMBRAER EXISTIR.', l2, start + 10, 74, true)}
            <div style={{...F(600), fontSize: 30, letterSpacing: 12, color: 'rgba(229,211,182,0.85)', marginTop: 26, opacity: io(frame, [46, 58], [0, 1]), textShadow: '0 2px 14px rgba(0,0,0,0.8)'}}>
              GIGANTES NACIONAIS
            </div>
            <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.5, pointerEvents: 'none'}} />
          </div>
        );
      })()}
      <Shafts angle={14} intensity={0.7} />
      <Motes count={10} layer={2} />
      <Look vig={0.55} />
    </AbsoluteFill>
  );
};

// ================= MAIN COMPOSITION =================
export const EmbraerCinematicV2Comp: React.FC = () => {
  const frame = useCurrentFrame();
  void frame;
  return (
    <AbsoluteFill style={{backgroundColor: '#0b0f12'}}>
      {/* Scenes with overlapping cinematic transitions */}
      <SequenceLike from={0} duration={96}>
        <SceneWorkshop />
      </SequenceLike>
      <SequenceLike from={78} duration={102}>
        <SceneReveal />
      </SequenceLike>
      <SequenceLike from={168} duration={72}>
        <SceneHook />
      </SequenceLike>
      {/* audio: whoosh on transition 1, riser into reveal, boom + bell on final hook */}
      <Audio src={staticFile('swish.wav')} volume={0.5} startFrom={0} />
      <Audio src={staticFile('whoosh.wav')} volume={0.55} startFrom={76} />
      <Audio src={staticFile('riser.wav')} volume={0.3} startFrom={120} />
      <Audio src={staticFile('boom.wav')} volume={0.6} startFrom={180} />
      <Audio src={staticFile('bell.wav')} volume={0.25} startFrom={196} />
      <Audio src={staticFile('ambient.wav')} volume={0.16} startFrom={0} />
      {/* final fade to black last 8 frames */}
      <AbsoluteFill style={{background: '#05070a', opacity: io(frame, [232, 240], [0, 0.9]), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

// tiny local wrapper to avoid importing Sequence separately
import {Sequence} from 'remotion';
const SequenceLike: React.FC<{from: number; duration: number; children: React.ReactNode}> = ({from, duration, children}) => (
  <Sequence from={from} durationInFrames={duration} layout="none" name={`seq-${from}`}>
    {children}
  </Sequence>
);
