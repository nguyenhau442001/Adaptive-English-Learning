// Prep only — no native project has been generated (`npx cap add ios|android`)
// and @capacitor/core isn't installed yet, so this file isn't wired into any
// build. It exists so a future mobile wrapper is a `npm install @capacitor/core
// @capacitor/cli` + `npx cap add ...` away instead of a schema/app rearchitecture.
// webDir assumes a static export step (`next export`-equivalent) would be added
// at that point; this app currently runs as a server-rendered Next.js app.
const config = {
  appId: 'com.aelearning.app',
  appName: 'Adaptive English Learning',
  webDir: 'out',
};

export default config;
