## 프론트엔드 포팅 매뉴얼

### 1. 사용한 개발 환경 및 도구 버전

- **Node.js 버전**: 22.15.00
- **패키지 매니저 버전**: `npm` 11.2.5
- **개발 IDE**: Visual Studio Code
  - 권장 플러그인: ESLint, Prettier, Tailwind CSS IntelliSense
- **주요 라이브러리/프레임워크 버전**:
  - `Next.js`: 15.3.2
  - `React`: 19.1.0
  - `Typescript`: 5.8.3
  - `Tailwindcss`: 3.4.17
  - `Tanstack-query`: 5.75.5
  - `zustand`: 5.0.4
- **운영체제**: Windows, macOS, Linux (Node.js 호환 환경)

### 2. **환경 변수 설정(.env.local 또는 .env.production)**:

- `frontend` 디렉토리(FE 프로젝트 최상위 디렉토리)에 환경에 맞는 `.env` 파일을 생성하여 아래 내용들을 환경 변수로 작성해야 합니다.
  - 개발 환경: `.env.local`
  - 프로덕션(배포) 환경: `.env.production` (또는 Docker 빌드 시 인자로 전달)
- **필수 환경 변수 목록**:
  - `NEXT_PUBLIC_DAMDAM_BASE_URL`: 백엔드 API 서버의 기본 URL
  - `NEXT_PUBLIC_WEBSOCKET_URL`: 웹소켓 서버 URL
  - `NEXT_PUBLIC_GOOGLE_LOGIN_URL`: Google 소셜 로그인 인증 요청 URL (백엔드 제공 경로)
  - `NEXT_PUBLIC_NAVER_LOGIN_URL`: Naver 소셜 로그인 인증 요청 URL (백엔드 제공 경로)
  - `NEXT_PUBLIC_KAKAO_LOGIN_URL`: Kakao 소셜 로그인 인증 요청 URL (백엔드 제공 경로)
  - `OPENAI_API_KEY`: OpenAI API (Whisper STT 용도) 사용을 위한 API 키.
    - **주의**: 이 키는 `app/api/stt/route.ts` Next.js Route Handler (서버 측 프록시)에서 사용되며, 클라이언트에 직접 노출되지 않습니다. Docker 빌드 시 빌드 인자(`ARG`)를 통해 전달되어 빌드 환경 변수(`ENV`)로 설정됩니다.
- **`.env.local` 파일 예시**:
  ```env
  # .env.local (개발 환경 예시)
  NEXT_PUBLIC_DAMDAM_BASE_URL=http://localhost:8080/api/v1/damdam
  NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/ws-damdam
  NEXT_PUBLIC_GOOGLE_LOGIN_URL=/oauth2/authorization/google
  NEXT_PUBLIC_NAVER_LOGIN_URL=/oauth2/authorization/naver
  NEXT_PUBLIC_KAKAO_LOGIN_URL=/oauth2/authorization/kakao
  OPENAI_API_KEY=your_openai_api_key_here
  ```
- **프로덕션 환경 변수 주입**:
  - Docker를 사용하여 배포하는 경우, `Dockerfile`에 정의된 `ARG`를 통해 빌드 시점에 환경 변수를 주입하고, 이는 `ENV` 명령어를 통해 컨테이너 내 애플리케이션의 빌드 환경 변수로 사용됩니다. (인프라 포팅 매뉴얼의 Docker 빌드 명령어 부분 참조)

### 3. **빌드 및 배포 특이사항**:

#### 가. 로컬 개발 환경 실행

1.  **의존성 설치**:
    - `frontend` 디렉토리에서 다음 명령어를 실행합니다.
      ```bash
      npm install
      ```
2.  **개발 서버 실행**:
    - 다음 명령어를 실행하여 Next.js 개발 서버를 시작합니다.
      ```bash
      npm run dev
      ```
    - 기본적으로 `http://localhost:3000` 에서 애플리케이션을 확인할 수 있습니다.

#### 나. 프로덕션 빌드 및 실행 (Node.js 환경 직접 실행 시)

1.  **환경 변수 설정**:
    - `frontend` 디렉토리에 `.env.production` 파일을 생성하고 프로덕션 환경에 맞는 환경 변수 값을 설정합니다. (2번 항목 참조)
2.  **애플리케이션 빌드**:
    - 다음 명령어를 실행하여 프로덕션용으로 애플리케이션을 빌드합니다.
      ```bash
      npm run build
      ```
    - 빌드 결과물은 `.next` 디렉토리에 생성됩니다.
3.  **애플리케이션 실행**:
    - 다음 명령어를 실행하여 빌드된 애플리케이션을 프로덕션 모드로 시작합니다.
      ```bash
      npm run start
      ```
    - `package.json`의 `start` 스크립트에 `next start -p 3000`으로 정의되어 있으므로, 기본적으로 3000번 포트에서 실행됩니다. 포트 변경이 필요하면 해당 스크립트를 수정하거나, `npm run start -- -p [원하는_포트번호]` 와 같이 실행 시 인자를 전달할 수 있습니다 (단, 현재 `package.json` 스크립트 구조상 직접적인 포트 변경 인자 전달은 추가 설정이 필요할 수 있음. `next start -p [포트번호]` 형태로 스크립트 수정 권장).

#### 다. Docker를 이용한 빌드 및 배포

- 프로젝트 루트의 `Dockerfile` (`frontend/Dockerfile`)을 사용하여 프론트엔드 애플리케이션의 Docker 이미지를 빌드합니다.
- 빌드 시점에 필요한 환경 변수들은 `--build-arg` 옵션을 통해 전달됩니다. (예: `docker build --build-arg OPENAI_API_KEY=your_key ...`)
- 빌드된 Docker 이미지를 실행하여 애플리케이션을 배포합니다. (`EXPOSE 3000`으로 포트가 노출되어 있습니다.)
- 상세한 Docker 빌드 및 실행 명령어는 **인프라팀의 포팅 매뉴얼**을 참조하십시오.

#### 라. 기타 특이사항

- **정적 파일 제공**:
  - 이미지, 폰트 등 정적 에셋은 `frontend/public` 디렉토리에 위치하며, 애플리케이션 루트 경로(`http://localhost:3000/`)를 기준으로 접근 가능합니다. (예: `public/damdami.png`는 `/damdami.png`로 접근)
- **서버리스 함수 (Next.js Route Handlers)**:
  - `frontend/src/app/api/` 디렉토리 하위의 파일들(예: `stt/route.ts`)은 Next.js의 Route Handler로 동작합니다.
  - 이들은 서버 환경에서 실행되며, 클라이언트 측의 API 키 노출 없이 외부 API(예: OpenAI Whisper API)와 안전하게 통신하기 위한 프록시 역할을 수행합니다.
  - `OPENAI_API_KEY` 환경 변수는 이러한 Route Handler 내에서 사용됩니다.
- **HTTPS 설정**:
  - 프로덕션 배포 시에는 반드시 HTTPS를 적용해야 합니다.
  - Next.js 자체에서 HTTPS를 직접 설정하기보다는, 배포 환경(예: Vercel, AWS Amplify, Netlify 등 호스팅 플랫폼 또는 Nginx, Apache 등의 리버스 프록시 서버)에서 HTTPS를 구성합니다.

### 4. 프로젝트에서 사용하는 외부 서비스 정보

프론트엔드가 직접 또는 간접적으로 사용하는 외부 서비스에 대한 정보입니다.

- **소셜 인증**:
  - Google, Naver, Kakao 소셜 로그인을 지원합니다.
  - 각 소셜 플랫폼에서 발급받은 클라이언트 ID, 시크릿 키 등은 백엔드 서버에서 관리합니다.
  - 프론트엔드는 `NEXT_PUBLIC_GOOGLE_LOGIN_URL`, `NEXT_PUBLIC_NAVER_LOGIN_URL`, `NEXT_PUBLIC_KAKAO_LOGIN_URL` 환경 변수에 설정된 백엔드 인증 URL을 호출하여 소셜 로그인 프로세스를 시작합니다.
- **STT (Speech-to-Text) 서비스**:
  - **OpenAI Whisper API**:
    - **가입 및 API 키 발급**: OpenAI Platform ([https://platform.openai.com/](https://platform.openai.com/))에 가입하고 API 키를 생성합니다.
    - **활용 정보**:
      - 사용자의 음성 데이터는 프론트엔드 클라이언트에서 직접 OpenAI API로 전송되지 않습니다.
      - 대신, 음성 데이터는 `frontend/src/app/api/stt/route.ts`에 구현된 Next.js Route Handler로 전송됩니다.
      - 이 서버 측 Route Handler가 `OPENAI_API_KEY` 환경 변수를 사용하여 OpenAI Whisper API에 STT 변환을 요청하고, 그 결과를 받아 클라이언트에 전달합니다.
      - 이를 통해 클라이언트 코드에 `OPENAI_API_KEY`가 직접 노출되는 것을 방지하여 보안을 강화합니다.
