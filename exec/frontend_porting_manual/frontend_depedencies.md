## 프론트엔드 의존성 및 라이브러리 정리

### 주요 의존성 (Dependencies)

| 라이브러리                            | 버전     | 설명                                                                                                                                |
| :------------------------------------ | :------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `@fortawesome/fontawesome-svg-core`   | ^6.7.2   | Font Awesome 아이콘을 사용하기 위한 핵심 라이브러리입니다.                                                                          |
| `@fortawesome/free-regular-svg-icons` | ^6.7.2   | Font Awesome의 무료 일반 스타일 아이콘 세트입니다.                                                                                  |
| `@fortawesome/free-solid-svg-icons`   | ^6.7.2   | Font Awesome의 무료 솔리드 스타일 아이콘 세트입니다.                                                                                |
| `@fortawesome/react-fontawesome`      | ^0.2.2   | React 환경에서 Font Awesome 아이콘을 쉽게 사용할 수 있도록 하는 컴포넌트입니다.                                                     |
| `@radix-ui/react-avatar`              | ^1.1.9   | 사용자 아바타 UI 컴포넌트를 제공하는 Radix UI 라이브러리입니다. (Shadcn/ui 내부 사용 가능성)                                        |
| `@radix-ui/react-dialog`              | ^1.1.13  | 접근성을 고려한 다이얼로그(모달) UI 컴포넌트를 제공하는 Radix UI 라이브러리입니다. (Shadcn/ui 내부 사용 가능성)                     |
| `@radix-ui/react-label`               | ^2.1.6   | 접근성을 고려한 레이블 UI 컴포넌트를 제공하는 Radix UI 라이브러리입니다. (Shadcn/ui 내부 사용 가능성)                               |
| `@radix-ui/react-scroll-area`         | ^1.2.8   | 커스텀 스크롤바 UI 컴포넌트를 제공하는 Radix UI 라이브러리입니다. (Shadcn/ui 내부 사용 가능성)                                      |
| `@radix-ui/react-slot`                | ^1.2.2   | 자식 컴포넌트에 props를 전달할 수 있게 하는 Radix UI 유틸리티 컴포넌트입니다. (Shadcn/ui 내부 사용 가능성)                          |
| `@radix-ui/react-switch`              | ^1.2.4   | 접근성을 고려한 스위치(토글) UI 컴포넌트를 제공하는 Radix UI 라이브러리입니다. (Shadcn/ui 내부 사용 가능성)                         |
| `@stomp/stompjs`                      | ^7.1.1   | STOMP 프로토콜을 통해 웹소켓 통신을 하기 위한 클라이언트 라이브러리입니다. (실시간 채팅 기능에 사용)                                |
| `@tanstack/react-query`               | ^5.75.5  | 서버 데이터 상태 관리를 위한 라이브러리입니다. 데이터 가져오기, 캐싱, 동기화, 업데이트 기능을 제공합니다. (프로젝트 주요 기술 스택) |
| `@tanstack/react-query-devtools`      | ^5.75.5  | React Query 사용 시 개발 편의성을 위한 개발자 도구입니다.                                                                           |
| `@types/formidable`                   | ^3.4.5   | `formidable` 라이브러리의 TypeScript 타입 정의입니다. (파일 업로드 처리 시 사용 가능성)                                             |
| `axios`                               | ^1.9.0   | HTTP 클라이언트 라이브러리입니다. API 요청을 보내고 응답을 받는 데 사용됩니다.                                                      |
| `chart.js`                            | ^4.4.9   | 다양한 종류의 차트를 그릴 수 있는 JavaScript 라이브러리입니다. (레포트 등 데이터 시각화에 사용)                                     |
| `class-variance-authority`            | ^0.7.1   | 조건부 스타일링 및 다양한 UI 상태에 따른 클래스 관리를 용이하게 하는 유틸리티입니다. (Shadcn/ui와 함께 사용)                        |
| `clsx`                                | ^2.1.1   | 여러 클래스 이름을 조건부로 결합하는 유틸리티 함수입니다. (Tailwind CSS와 함께 사용)                                                |
| `date-fns`                            | ^4.1.0   | 날짜 및 시간 조작 및 포맷팅을 위한 유틸리티 라이브러리입니다.                                                                       |
| `formidable`                          | ^3.5.4   | Node.js 환경에서 폼 데이터(특히 파일 업로드)를 파싱하기 위한 라이브러리입니다. (STT 기능에서 사용)                                  |
| `lucide-react`                        | ^0.507.0 | 아이콘 라이브러리입니다. (Shadcn/ui의 기본 아이콘 라이브러리)                                                                       |
| `next`                                | 15.3.2   | React 기반 웹 애플리케이션을 만들기 위한 프레임워크입니다. (프로젝트 주요 기술 스택)                                                |
| `next-themes`                         | ^0.4.6   | Next.js 애플리케이션에 다크 모드 등 테마 기능을 쉽게 추가할 수 있도록 돕는 라이브러리입니다.                                        |
| `openai`                              | ^4.100.0 | OpenAI API를 사용하기 위한 클라이언트 라이브러리입니다. (STT 기능 등에 활용)                                                        |
| `react`                               | ^19.1.0  | 사용자 인터페이스(UI)를 구축하기 위한 JavaScript 라이브러리입니다. (프로젝트 주요 기술 스택)                                        |
| `react-chartjs-2`                     | ^5.3.0   | React 환경에서 `chart.js`를 쉽게 사용할 수 있도록 하는 래퍼 컴포넌트입니다.                                                         |
| `react-day-picker`                    | ^9.7.0   | 달력 및 날짜 선택 UI 컴포넌트를 제공하는 라이브러리입니다.                                                                          |
| `react-dom`                           | ^19.1.0  | React 엘리먼트를 DOM에 렌더링하는 역할을 합니다. (프로젝트 주요 기술 스택)                                                          |
| `react-media-recorder`                | ^1.7.1   | React 환경에서 오디오 및 비디오 녹음을 쉽게 구현할 수 있도록 돕는 라이브러리입니다. (음성 메시지 기능에 사용)                       |
| `recharts`                            | ^2.15.3  | React 기반의 차트 라이브러리입니다. (데이터 시각화에 사용)                                                                          |
| `sockjs-client`                       | ^1.6.1   | 웹소켓을 지원하지 않는 브라우저에서도 유사한 기능을 제공하기 위한 SockJS 클라이언트 라이브러리입니다. (STOMP와 함께 사용)           |
| `tailwind-merge`                      | ^3.2.0   | Tailwind CSS 클래스들을 병합할 때 충돌을 방지하고 최적화하는 유틸리티입니다. (Shadcn/ui와 함께 사용)                                |
| `zustand`                             | ^5.0.4   | 클라이언트 상태 관리를 위한 가볍고 유연한 라이브러리입니다. (프로젝트 주요 기술 스택)                                               |

### 개발 의존성 (DevDependencies)

| 라이브러리                          | 버전     | 설명                                                                                                                          |
| :---------------------------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `@eslint/eslintrc`                  | ^3.3.1   | ESLint 설정을 위한 유틸리티입니다.                                                                                            |
| `@eslint/js`                        | ^9.26.0  | ESLint에서 JavaScript 코드 검사를 위한 기본 규칙 세트입니다.                                                                  |
| `@storybook/addon-essentials`       | ^8.6.12  | Storybook의 필수 애드온들을 모아놓은 패키지입니다. (Controls, Actions, Viewport 등)                                           |
| `@storybook/addon-interactions`     | ^8.6.12  | Storybook에서 사용자 상호작용을 테스트하고 디버깅할 수 있게 해주는 애드온입니다.                                              |
| `@storybook/addon-onboarding`       | ^8.6.12  | Storybook을 처음 사용하는 사용자를 위한 온보딩 경험을 제공하는 애드온입니다.                                                  |
| `@storybook/blocks`                 | ^8.6.12  | Storybook 문서 작성을 위한 MDX 기반 블록 컴포넌트 모음입니다.                                                                 |
| `@storybook/nextjs`                 | ^8.6.12  | Next.js 프로젝트에서 Storybook을 설정하고 사용하기 위한 프레임워크 통합 패키지입니다.                                         |
| `@storybook/react`                  | ^8.6.12  | React 컴포넌트를 위한 Storybook UI 개발 환경입니다.                                                                           |
| `@storybook/test`                   | ^8.6.12  | Storybook 스토리를 기반으로 테스트를 작성하고 실행할 수 있게 해주는 도구입니다.                                               |
| `@types/chart.js`                   | ^2.9.41  | `chart.js` 라이브러리의 TypeScript 타입 정의입니다.                                                                           |
| `@types/node`                       | ^22      | Node.js 환경에 대한 TypeScript 타입 정의입니다.                                                                               |
| `@types/react`                      | ^19.1.4  | React 라이브러리 및 API에 대한 TypeScript 타입 정의입니다.                                                                    |
| `@types/react-dom`                  | ^19.1.3  | `react-dom` 라이브러리에 대한 TypeScript 타입 정의입니다.                                                                     |
| `autoprefixer`                      | ^10.4.21 | CSS에 자동으로 브라우저별 접두사(prefix)를 추가해주는 PostCSS 플러그인입니다. (Tailwind CSS 내부 사용)                        |
| `eslint`                            | ^9.26.0  | JavaScript 및 TypeScript 코드의 정적 분석 도구로, 코드 스타일 및 잠재적 오류를 검사합니다.                                    |
| `eslint-config-next`                | ^15.3.2  | Next.js 프로젝트를 위한 ESLint 추천 설정 세트입니다.                                                                          |
| `eslint-config-prettier`            | ^10.1.3  | Prettier와 충돌하는 ESLint 규칙을 비활성화하는 설정입니다.                                                                    |
| `eslint-import-resolver-typescript` | ^4.3.4   | ESLint에서 TypeScript 경로 별칭(alias)을 인식하도록 돕는 import 리졸버입니다.                                                 |
| `eslint-plugin-feature-sliced`      | ^0.0.2   | Feature-Sliced Design 아키텍처 규칙을 ESLint로 강제하는 플러그인입니다. (프로젝트 아키텍처 준수)                              |
| `eslint-plugin-import`              | ^2.31.0  | ES6+ import/export 구문의 린팅을 돕는 ESLint 플러그인입니다. (임포트 순서, 경로 문제 등)                                      |
| `eslint-plugin-storybook`           | ^0.12.0  | Storybook 관련 파일 및 코드 작성 규칙을 위한 ESLint 플러그인입니다.                                                           |
| `postcss`                           | ^8.5.3   | JavaScript로 CSS를 변환하는 도구입니다. (Tailwind CSS, Autoprefixer 등이 PostCSS 플러그인으로 동작)                           |
| `prettier`                          | ^3.5.3   | 코드 포맷터로, 일관된 코드 스타일을 유지하도록 코드를 자동으로 정리합니다.                                                    |
| `storybook`                         | ^8.6.12  | UI 컴포넌트 개발 및 문서화를 위한 도구입니다. (프로젝트 주요 기술 스택)                                                       |
| `tailwindcss`                       | ^3.4.17  | 유틸리티 우선 CSS 프레임워크입니다. HTML 내에서 직접 스타일을 빠르게 적용할 수 있습니다. (프로젝트 주요 기술 스택)            |
| `tw-animate-css`                    | ^1.2.9   | Tailwind CSS와 함께 Animate.css의 애니메이션 효과를 쉽게 사용할 수 있도록 하는 라이브러리입니다.                              |
| `typescript`                        | ^5.8.3   | JavaScript에 정적 타입을 추가한 언어입니다. 코드 안정성과 가독성을 높입니다. (프로젝트 주요 기술 스택)                        |
| `typescript-eslint`                 | ^8.32.0  | TypeScript 코드를 ESLint로 검사하기 위한 파서 및 플러그인 세트입니다.                                                         |
| `webpack`                           | ^5.99.8  | 모듈 번들러입니다. Next.js 내부에서 사용되며, JavaScript 파일들을 비롯한 여러 리소스들을 하나 또는 여러 개의 번들로 묶습니다. |
