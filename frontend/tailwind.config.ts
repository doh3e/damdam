import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // 필요에 따라 경로 추가
  ],
  // Tailwind의 테마(컬러, 폰트 등)를 확장하거나 커스텀할 때 사용. 기본값은 비워두고 필요할 때만 extend에 추가.
  theme: {
    extend: {},
  },
  // Tailwind 플러그인(shadcn-ui, forms, typography 등)을 사용할 때 배열에 추가.
  plugins: [],
};

export default config;
