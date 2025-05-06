import type { Config } from 'tailwindcss';

const config = {
  prefix: '',

  theme: {
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  // plugins 배열은 유지하되, 플러그인이 v4와 호환되는지 확인 필요
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
