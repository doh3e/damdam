import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import featureSlicedPlugin from 'eslint-plugin-feature-sliced';
import eslintPluginImport from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = tseslint.config(
  // 1. ESLint 추천 규칙
  eslintJs.configs.recommended,

  // 2. TypeScript 추천 규칙
  ...tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommended,
  // ... (타입 검사 필요 규칙 추가 가능)

  // 3. Next.js 관련 규칙
  ...compat.extends('next/core-web-vitals'),

  // 4. Feature-Sliced Design 플러그인 및 경로 리졸버 설정
  {
    plugins: {
      'feature-sliced': featureSlicedPlugin,
      import: eslintPluginImport,
    },
    rules: {
      // FSD 규칙
      // FSD 레이어/슬라이스 간 의존성 규칙 검사 활성화
      'feature-sliced/layers-slices': 'error',
      // 슬라이스 내부 상대 경로, 슬라이스 간 절대 경로 사용 규칙 활성화
      'feature-sliced/absolute-relative': 'error',
      // public API 를 통해서만 다른 슬라이스에 접근하도록 강제 (선택 사항)
      'feature-sliced/public-api': 'error',
      // 레이어 내부 구조 규칙 검사 (선택 사항)
      'feature-sliced/fsd-structure': 'error',

      // import 플러그인 관련 규칙
      'import/no-unresolved': 'error', // 경로 해석 못하는 경우 에러
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js 내장 모듈
            'external', // npm 패키지
            'internal', // @/ 내부 경로 (절대 경로)
            'parent', // ../
            'sibling', // ./
            'index', // ./index
            'object', // type imports
            'type',
          ],
          pathGroups: [
            // 절대 경로 그룹 정의
            {
              pattern: 'react*',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'next*',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['react', 'next'], // pathGroups에서 react, next 제외 (이미 external로 처리)
          'newlines-between': 'always', // 그룹 사이에 항상 한 줄 띄움
          alphabetize: {
            // 그룹 내 알파벳 순 정렬
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
    settings: {
      // 경로 리졸버 설정 추가
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json', // tsconfig.json 경로 명시
        },
        node: true, // node_modules 해석 위해 추가
      },
    },
    languageOptions: {
      // 타입 정보 활용 위해 추가 권장
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 5. TOAST UI 코딩 컨벤션 및 추가 규칙 설정
  {
    rules: {
      // TOAST UI 컨벤션 규칙
      camelcase: ['error', { properties: 'never', ignoreDestructuring: true }], // 카멜케이스 (프로퍼티는 제외, 구조분해 할당 무시 옵션 추가)
      'no-var': 'error', // var 금지
      'prefer-const': 'error', // const 우선
      'object-shorthand': ['error', 'always'], // 객체 축약형
      'no-underscore-dangle': 'off', // _로 시작하는 변수 허용
      eqeqeq: ['error', 'always'], //  ===, !== 사용 강제
      curly: ['error', 'all'], // 모든 조건문에 중괄호 사용 강제
      quotes: ['error', 'single'], // 작은따옴표 사용 강제 (Prettier와 일관성)
      'no-tabs': 'error', // 탭 문자 사용 금지
      'no-trailing-spaces': 'error', // 문자열 끝에 후행 공백 금지
      'quote-props': ['error', 'as-needed'], // 객체 속성명은 필요할 때만 따옴표 사용
      'func-names': ['warn', 'as-needed'], // 익명 함수보다 이름 있는 함수 표현식 권장 (경고 수준)
      'no-eq-null': 'error', // == null 비교 금지

      // -- TypeScript 관련 규칙 추가 (@typescript-eslint) --
      // (이미 tseslint.configs.recommended에 포함된 규칙도 있지만, 명시적으로 설정하거나 옵션 조정)
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'], // 객체 타입 정의 시 interface 선호
      '@typescript-eslint/no-explicit-any': 'warn', // any 타입 사용 시 경고 (error로 변경 가능)
      '@typescript-eslint/no-unused-vars': [
        // 사용하지 않는 변수 경고 (명시적 활성화 및 옵션 추가)
        'warn',
        {
          argsIgnorePattern: '^_', // _로 시작하는 인수는 무시 (콜백 등에서 사용)
          varsIgnorePattern: '^_', // _로 시작하는 변수는 무시
          caughtErrorsIgnorePattern: '^_', // catch 절의 _로 시작하는 에러 변수 무시
        },
      ],
    },
  },

  // 6. Storybook 설정 추가
  ...compat.extends('plugin:storybook/recommended'), // FlatCompat 사용하여 Storybook 규칙 추가

  // 7. Prettier 충돌 방지 설정 (반드시 마지막)
  eslintConfigPrettier

  // 8. (선택) 특정 파일 무시 설정 등
  // {
  //   ignores: ["dist/", "build/", "*.config.js"]
  // }
);

export default eslintConfig;
