import {Composition} from 'remotion';
import React from 'react';
import {Embraer30s} from './Embraer30s';
import {EmbraerCinematicV2Comp} from './EmbraerCinematicV2';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Embraer30s"
        component={Embraer30s}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EmbraerCinematicV2"
        component={EmbraerCinematicV2Comp}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
