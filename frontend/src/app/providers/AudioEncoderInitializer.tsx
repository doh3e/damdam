'use client';

import { useEffect, useRef } from 'react';
// import dynamic from 'next/dynamic'; // next/dynamic 제거

// 기존 import 주석 처리
// import { register } from 'extendable-media-recorder';
// import { connect } from 'extendable-media-recorder-wav-encoder';

// Zustand 스토어 import
import { useAppSetupStore } from '@/app/store/appSetupStore'; // 경로 확인

/**
 * @file frontend/src/app/providers/AudioEncoderInitializer.tsx
 * @description 애플리케이션 시작 시 WAV 오디오 인코더를 등록하고, 그 상태를 전역으로 관리하는 클라이언트 컴포넌트입니다.
 * `extendable-media-recorder`가 WAV 형식으로 직접 녹음할 수 있도록 설정합니다.
 * 이 컴포넌트는 애플리케이션의 최상위 레벨(예: RootLayout)에서 한 번만 렌더링되어야 합니다.
 */

/**
 * `AudioEncoderInitializer` 컴포넌트.
 * 이 컴포넌트는 UI를 렌더링하지 않으며, 오직 오디오 인코더 등록이라는 사이드 이펙트만 수행합니다.
 * @returns {null} 이 컴포넌트는 UI를 렌더링하지 않으므로 null을 반환합니다.
 */
const AudioEncoderInitializer = (): null => {
  // 전역 스토어에서 인코더 준비 상태를 업데이트하는 함수 가져오기
  const setWavEncoderReady = useAppSetupStore((state) => state.setWavEncoderReady);
  // 인코더 등록 시도 여부를 추적하기 위한 ref (Fast Refresh 대응)
  const registrationAttemptedRef = useRef(false);

  useEffect(() => {
    /**
     * WAV 인코더를 비동기적으로 등록합니다.
     * 이 함수는 컴포넌트가 마운트될 때 한 번만 실행됩니다.
     */
    const initializeAudioEncoder = async () => {
      if (typeof window !== 'undefined') {
        // 브라우저 환경인지 확실히 체크
        try {
          // ================================ 에러 검토용 임시 주석처리 시작
          // 라이브러리 import를 useEffect 내부로 이동
          // const { register } = await import('extendable-media-recorder');
          // const { connect } = await import('extendable-media-recorder-wav-encoder');

          // // extendable-media-recorder-wav-encoder의 connect 함수를 호출하여 인코더 연결 설정을 가져옵니다.
          // const encoderConfig = await connect();
          // // extendable-media-recorder의 register 함수를 사용하여 WAV 인코더를 등록합니다.
          // await register(encoderConfig);

          // console.log('WAV audio encoder registered successfully (Initializer).');
          // setWavEncoderReady(true); // 전역 상태 업데이트: 성공
          // ================================에러 검토용 임시 주석처리 끝

          // 테스트를 위해 임시로 true 또는 false로 설정하여 앱의 다른 부분에 미치는 영향 최소화
          console.log(
            '[Test] Skipping WAV encoder registration. Setting WavEncoderReady to true (or false for testing).'
          );
          setWavEncoderReady(true); // 또는 false로 설정하여 녹음 시도 시 에러 발생 유도
        } catch (error: any) {
          if (error?.message?.includes('already an encoder stored')) {
            console.warn('WAV audio encoder was already registered (Initializer).');
            setWavEncoderReady(true); // 이미 등록되어 있어도 준비된 상태로 간주
          } else {
            console.error('Failed to register WAV audio encoder (Initializer):', error);
            setWavEncoderReady(false); // 등록 실패 시 준비되지 않은 상태로 간주
          }
        }
      }
    };

    // registrationAttemptedRef를 사용하여 Fast Refresh 시에도 한 번만 초기화 시도
    if (!registrationAttemptedRef.current) {
      initializeAudioEncoder();
      registrationAttemptedRef.current = true;
    }
  }, [setWavEncoderReady]); // setWavEncoderReady는 일반적으로 안정적인 의존성

  return null; // 이 컴포넌트는 UI를 직접 렌더링하지 않습니다.
};

export default AudioEncoderInitializer;
