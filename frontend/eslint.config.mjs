import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import featureSlicedPlugin from "eslint-plugin-feature-sliced";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // feature-sliced 플러그인 설정 추가
  {
    plugins: {
      "feature-sliced": featureSlicedPlugin,
    },
    rules: {
      // FSD 레이어/슬라이스 간 의존성 규칙 검사 활성화
      "feature-sliced/layers-slices": "error",
      // 슬라이스 내부 상대 경로, 슬라이스 간 절대 경로 사용 규칙 활성화
      "feature-sliced/absolute-relative": "error",
      // public API 를 통해서만 다른 슬라이스에 접근하도록 강제 (선택 사항)
      "feature-sliced/public-api": "error",
      // 레이어 내부 구조 규칙 검사 (선택 사항)
      "feature-sliced/fsd-structure": "error",
    },
    // tsconfig.json의 paths 설정을 읽어오기 위한 settings 추가
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true, // TS 파일 확장자 자동 확인
          // project 옵션으로 tsconfig.json 경로 명시 (선택 사항, 보통 자동 감지)
          // project: "./tsconfig.json",
        },
      },
    },
    // Flat Config에서는 settings 대신 languageOptions 등을 사용할 수 있으나,
    // 경로 alias 설정은 eslint-import-resolver 와 연동해야 할 수 있습니다.
    // 우선 기본적인 규칙만 적용하고, 필요시 alias 설정을 추가합니다.
  },
];

export default eslintConfig;
