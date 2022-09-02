import { defineConfig } from '@umijs/max';
export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  mfsu: {},
  routes: [
    {
      path: '/',
      component: '@/pages/app.tsx',
      routes: [],
    },
  ],
  extraPostCSSPlugins: [require('tailwindcss'), require('autoprefixer')],
  npmClient: 'yarn',
});
