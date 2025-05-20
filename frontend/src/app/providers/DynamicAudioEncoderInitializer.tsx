'use client';

import dynamic from 'next/dynamic';

// AudioEncoderInitializer를 동적으로 임포트하고, 서버 사이드 렌더링(ssr)을 비활성화합니다.
const AudioEncoderInitializer = dynamic(
  () => import('./AudioEncoderInitializer'), // 경로 수정됨
  { ssr: false }
);

const DynamicAudioEncoderInitializer = () => {
  return <AudioEncoderInitializer />;
};

export default DynamicAudioEncoderInitializer;
