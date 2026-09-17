const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlPath = path.resolve(__dirname, 'test_preview.html');
const outputPngPath = path.resolve(__dirname, 'test_preview.png');

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #111827;
    display: flex;
    gap: 20px;
    padding: 20px;
  }
  .screen {
    width: 375px;
    height: 750px;
    position: relative;
    border-radius: 36px;
    overflow: hidden;
    border: 3px solid #374151;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 30px 24px;
    box-sizing: border-box;
  }
  .bg-img {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    object-fit: cover;
    z-index: 0;
  }
  .content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(12px);
    padding: 14px 20px;
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
  .brand-dark {
    background: rgba(17, 24, 39, 0.85);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .logo-title {
    font-size: 28px;
    font-weight: 800;
    color: #16A34A;
    margin: 0;
  }
  .tagline {
    font-size: 12px;
    font-weight: 500;
    color: #4B5563;
    margin-top: 4px;
  }
  .tagline-dark {
    color: #9CA3AF;
  }
  .bottom-card {
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    border-radius: 28px;
    padding: 22px 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    text-align: center;
  }
  .bottom-card-dark {
    background: rgba(17, 24, 39, 0.9);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .headline {
    font-size: 20px;
    font-weight: 800;
    color: #1F2937;
    margin: 0 0 6px 0;
  }
  .headline-dark {
    color: #F3F4F6;
  }
  .subheadline {
    font-size: 13px;
    color: #6B7280;
    margin: 0 0 18px 0;
    font-style: italic;
  }
  .subheadline-dark {
    color: #9CA3AF;
  }
  .btn {
    background: #16A34A;
    color: white;
    font-size: 16px;
    font-weight: 700;
    padding: 15px;
    border-radius: 16px;
    border: none;
    width: 100%;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(22, 163, 74, 0.4);
  }
</style>
</head>
<body>
  <!-- Light Mode: Opacity 0.28 -->
  <div class="screen" style="background: #F4F7F4;">
    <img class="bg-img" src="../assets/launch_hero.jpg" style="opacity: 0.28;">
    <div class="content">
      <div class="brand">
        <h1 class="logo-title">🌿 Noklai</h1>
        <div class="tagline">Our Culture. Their Memories. Always With Them.</div>
      </div>
      <div class="bottom-card">
        <h2 class="headline">Caring for Brighter Tomorrows</h2>
        <div class="subheadline">Culture Connects. Care Continues.</div>
        <button class="btn">Get Started →</button>
      </div>
    </div>
  </div>

  <!-- Dark Mode: Opacity 0.32 -->
  <div class="screen" style="background: #0F172A;">
    <img class="bg-img" src="../assets/launch_hero.jpg" style="opacity: 0.32;">
    <div class="content">
      <div class="brand brand-dark">
        <h1 class="logo-title">🌿 Noklai</h1>
        <div class="tagline tagline-dark">Our Culture. Their Memories. Always With Them.</div>
      </div>
      <div class="bottom-card bottom-card-dark">
        <h2 class="headline headline-dark">Caring for Brighter Tomorrows</h2>
        <div class="subheadline subheadline-dark">Culture Connects. Care Continues.</div>
        <button class="btn">Get Started →</button>
      </div>
    </div>
  </div>

  <!-- Vibrant Rich: Opacity 0.85 with scrim -->
  <div class="screen" style="background: #000;">
    <img class="bg-img" src="../assets/launch_hero.jpg" style="opacity: 0.85;">
    <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.65) 100%);"></div>
    <div class="content">
      <div class="brand brand-dark" style="background: rgba(17,24,39,0.75);">
        <h1 class="logo-title" style="color: #4ADE80;">🌿 Noklai</h1>
        <div class="tagline tagline-dark" style="color: #E2E8F0;">Our Culture. Their Memories. Always With Them.</div>
      </div>
      <div class="bottom-card bottom-card-dark" style="background: rgba(17,24,39,0.85);">
        <h2 class="headline headline-dark">Caring for Brighter Tomorrows</h2>
        <div class="subheadline subheadline-dark">Culture Connects. Care Continues.</div>
        <button class="btn">Get Started →</button>
      </div>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync(htmlPath, htmlContent);

spawnSync(edgePath, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1250,850',
  `--screenshot=${outputPngPath}`,
  `file:///${htmlPath.replace(/\\/g, '/')}`
]);

console.log('Done rendering test preview!');

