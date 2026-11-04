import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  Easing,
} from 'remotion';
import {C} from './theme';
import {io, Grain} from './common';
import {Scene1} from './Scene1';
import {Scene2} from './Scene2';
import {Scene3} from './Scene3';
import {Scene4} from './Scene4';
import {Scene5} from './Scene5';
import {Scene6} from './Scene6';

const SCENES = [
  {from: 0, dur: 120}, // cena 1  (0-4s)
  {from: 120, dur: 150}, // cena 2 (4-9s)
  {from: 270, dur: 150}, // cena 3 (9-14s)
  {from: 420, dur: 150}, // cena 4 (14-19s)
  {from: 570, dur: 180}, // cena 5 (19-25s)
  {from: 750, dur: 150}, // cena 6 (25-30s)
];

// Transição cinematográfica entre cenas: varredura de luz + máscara diagonal + fade
const Transition: React.FC<{entering: boolean}> = ({entering}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const p = io(frame, 0, durationInFrames, 0, 1, (t) => t);
  // sweep position
  const x = -400 + p * 1880;
  const flashOp = Math.sin(p * Math.PI);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* máscara diagonal varrendo */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          left: 0,
          width: 1080,
          height: 2320,
          transform: `translateX(${x}px) skewX(-14deg)`,
          background: `linear-gradient(90deg, transparent 0%, rgba(212,164,95,0.10) 40%, ${C.blueDeep} 55%, #0a1218 62%, transparent 100%)`,
        }}
      />
      {/* linha luminosa na frente da varredura */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          left: 0,
          width: 90,
          height: 2320,
          transform: `translateX(${x + 560}px) skewX(-14deg)`,
          background: `linear-gradient(90deg, transparent, rgba(240,201,138,${0.75 * flashOp}), transparent)`,
          filter: 'blur(6px)',
        }}
      />
      {/* flash global sutil */}
      <AbsoluteFill style={{background: `rgba(240,220,170,${flashOp * 0.12})`}} />
    </AbsoluteFill>
  );
};

const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const op = io(frame, 0, durationInFrames, 0, 1);
  return <AbsoluteFill style={{background: '#04070a', opacity: op}} />;
};

export const Embraer30s: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const SceneComps = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];

  // narração — frames iniciais de cada segmento
  const voStarts = [5, 148, 295, 450, 560, 675];

  return (
    <AbsoluteFill style={{backgroundColor: '#04070a'}}>
      {SCENES.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur}>
          {React.createElement(SceneComps[i])}
        </Sequence>
      ))}

      {/* transições nas junções */}
      {[120, 270, 420, 570, 750].map((f, i) => (
        <Sequence key={`tr${i}`} from={f - 12} durationInFrames={24}>
          <Transition entering />
        </Sequence>
      ))}

      {/* vinheta final com fade para preto */}
      <Sequence from={884} durationInFrames={16}>
        <FadeOut />
      </Sequence>

      {/* ===== ÁUDIO ===== */}
      {/* trilha ambiente grave */}
      <Audio src={staticFile('ambient.wav')} volume={0.5} startFrom={0} />
      {/* narração em pt-BR (edge-tts) */}
      {voStarts.map((f, i) => (
        <Audio key={`vo${i}`} src={staticFile(`vo${i + 1}.wav`)} startFrom={f} volume={1} />
      ))}
      {/* SFX sincronizados */}
      <Audio src={staticFile('boom.wav')} startFrom={56} volume={0.75} />
      <Audio src={staticFile('whoosh.wav')} startFrom={112} volume={0.55} />
      <Audio src={staticFile('tick.wav')} startFrom={130} volume={0.5} />
      <Audio src={staticFile('riser.wav')} startFrom={242} volume={0.4} />
      <Audio src={staticFile('engine.wav')} startFrom={272} volume={0.55} />
      <Audio src={staticFile('swish.wav')} startFrom={410} volume={0.6} />
      <Audio src={staticFile('boom.wav')} startFrom={498} volume={0.6} />
      <Audio src={staticFile('swish.wav')} startFrom={562} volume={0.5} />
      <Audio src={staticFile('whoosh.wav')} startFrom={742} volume={0.5} />
      <Audio src={staticFile('bell.wav')} startFrom={812} volume={0.55} />

      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
