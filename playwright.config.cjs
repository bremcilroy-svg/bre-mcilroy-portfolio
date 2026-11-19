const {defineConfig, devices} = require('@playwright/test');

const chromiumLaunch = {
  args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader']
};

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.cjs',
  timeout: 45000,
  expect: {timeout: 10000},
  retries: 1,
  workers: 1,
  reporter: [['line'], ['html', {open: 'never'}]],
  use: {trace: 'retain-on-failure', screenshot: 'only-on-failure'},
  projects: [
    {name: 'desktop-chromium', use: {...devices['Desktop Chrome'], launchOptions: chromiumLaunch}},
    {name: 'android-chromium', use: {...devices['Pixel 7'], launchOptions: chromiumLaunch}},
    {name: 'iphone-webkit', use: {...devices['iPhone 13']}},
    {name: 'tablet-webkit', use: {...devices['iPad (gen 7) landscape']}}
  ]
});
