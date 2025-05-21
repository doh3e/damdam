/**
 * 개발 환경에서만 메시지를 콘솔에 로그합니다.
 * @param message 로그할 메시지 (qualunque tipo)
 * @param optionalParams 추가적인 선택적 파라미터
 */
export const devLog = (message?: any, ...optionalParams: any[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...optionalParams);
  }
};

/**
 * 개발 환경에서만 오류 메시지를 콘솔에 로그합니다.
 * @param message 로그할 오류 메시지 (qualunque tipo)
 * @param optionalParams 추가적인 선택적 파라미터
 */
export const devError = (message?: any, ...optionalParams: any[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, ...optionalParams);
  }
};

/**
 * 개발 환경에서만 경고 메시지를 콘솔에 로그합니다.
 * @param message 로그할 경고 메시지 (qualunque tipo)
 * @param optionalParams 추가적인 선택적 파라미터
 */
export const devWarn = (message?: any, ...optionalParams: any[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(message, ...optionalParams);
  }
};

/**
 * 개발 환경에서만 정보 메시지를 콘솔에 로그합니다.
 * @param message 로그할 정보 메시지 (qualunque tipo)
 *   @param optionalParams 추가적인 선택적 파라미터
 */
export const devInfo = (message?: any, ...optionalParams: any[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.info(message, ...optionalParams);
  }
};

// 필요에 따라 다른 console 메서드(예: devDebug, devTable 등)도 추가할 수 있습니다.
