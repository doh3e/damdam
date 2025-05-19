'use client';

import { useEffect } from 'react';
import { register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

/**
 * @file frontend/src/app/providers/AudioEncoderInitializer.tsx
 * @description 애플리케이션 시작 시 WAV 오디오 인코더를 등록하는 클라이언트 컴포넌트입니다.
 * `extendable-media-recorder`가 WAV 형식으로 직접 녹음할 수 있도록 설정합니다.
 * 이 컴포넌트는 애플리케이션의 최상위 레벨(예: RootLayout)에서 한 번만 렌더링되어야 합니다.
 */

/**
 * `AudioEncoderInitializer` 컴포넌트.
 * 이 컴포넌트는 UI를 렌더링하지 않으며, 오직 오디오 인코더 등록이라는 사이드 이펙트만 수행합니다.
 * @returns {null} 이 컴포넌트는 UI를 렌더링하지 않으므로 null을 반환합니다.
 */
const AudioEncoderInitializer = (): null => {
  useEffect(() => {
    /**
     * WAV 인코더를 비동기적으로 등록합니다.
     * 이 함수는 컴포넌트가 마운트될 때 한 번만 실행됩니다.
     */
    const initializeAudioEncoder = async () => {
      try {
        // extendable-media-recorder-wav-encoder의 connect 함수를 호출하여 인코더 연결 설정을 가져옵니다.
        const encoderConfig = await connect();
        // extendable-media-recorder의 register 함수를 사용하여 WAV 인코더를 등록합니다.
        await register(encoderConfig);
        console.log('WAV audio encoder registered successfully.');
      } catch (error) {
        console.error('Failed to register WAV audio encoder:', error);
        // 여기에 사용자에게 알림을 보내거나, 오류 리포팅 서비스를 호출하는 등의 추가적인 오류 처리 로직을 넣을 수 있습니다.
      }
    };

    initializeAudioEncoder();
  }, []); // 빈 의존성 배열을 사용하여 마운트 시 한 번만 실행되도록 합니다.

  return null; // 이 컴포넌트는 UI를 직접 렌더링하지 않습니다.
};

export default AudioEncoderInitializer;
