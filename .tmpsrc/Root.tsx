import {registerRoot, Composition} from 'remotion';
import {Embraer30s} from './Embraer30s';

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
    </>
  );
};

registerRoot(RemotionRoot);
