const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlPath = path.resolve(__dirname, 'test_preview2.html');
const outputPngPath = path.resolve(__dirname, 'test_preview2.png');

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
    background: #0B0F17;
    display: flex;
    gap: 24px;
    padding: 24px;
    justify-content: center;
  }
  .screen {
    width: 375px;
    height: 760px;
    position: relative;
    border-radius: 40px;
    overflow: hidden;
    border: 3px solid #1F2937;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 28px 20px;
    box-sizing: border-box;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  }
  .bg-img {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    object-fit: cover;
    z-index: 0;
  }
  .vignette-light {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.05) 70%, rgba(255,255,255,0.85) 100%);
    z-index: 1;
  }
  .vignette-dark {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(180deg, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.15) 35%, rgba(15,23,42,0.2) 65%, rgba(15,23,42,0.9) 100%);
    z-index: 1;
  }
  .content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
  .brand-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(255, 255, 255, 0.90);
    backdrop-filter: blur(16px);
    padding: 12px 18px;
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    border: 1px solid rgba(255,255,255,0.8);
  }
  .brand-pill-dark {
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
  .logo-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .logo-title {
    font-size: 26px;
    font-weight: 800;
    color: #15803D;
    letter-spacing: -0.5px;
    margin: 0;
  }
  .logo-title-dark {
    color: #4ADE80;
  }
  .tagline {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    margin-top: 3px;
    text-align: center;
  }
  .tagline-dark {
    color: #CBD5E1;
  }
  .bottom-card {
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(20px);
    border-radius: 28px;
    padding: 20px 20px 22px;
    box-shadow: 0 12px 36px rgba(0,0,0,0.18);
    text-align: center;
    border: 1px solid rgba(255,255,255,0.7);
  }
  .bottom-card-dark {
    background: rgba(15, 23, 42, 0.90);
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 12px 36px rgba(0,0,0,0.5);
  }
  .motto-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(22, 163, 74, 0.1);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    color: #16A34A;
    margin-bottom: 10px;
  }
  .motto-badge-dark {
    background: rgba(74, 222, 128, 0.15);
    color: #4ADE80;
  }
  .headline {
    font-size: 22px;
    font-weight: 800;
    color: #111827;
    margin: 0 0 4px 0;
    letter-spacing: -0.3px;
  }
  .headline-dark {
    color: #F8FAFC;
  }
  .subheadline {
    font-size: 13px;
    color: #64748B;
    margin: 0 0 18px 0;
    font-weight: 500;
  }
  .subheadline-dark {
    color: #94A3B8;
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
    box-shadow: 0 6px 18px rgba(22, 163, 74, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn:hover {
    background: #15803D;
  }
  .secondary-link {
    font-size: 12px;
    font-weight: 600;
    color: #64748B;
    margin-top: 10px;
    text-decoration: underline;
    cursor: pointer;
  }
  .secondary-link-dark {
    color: #94A3B8;
  }
</style>
</head>
<body>
  <!-- Light Mode with Low Transparency (Opacity 0.85) -->
  <div class="screen" style="background: #F8FAFC;">
    <img class="bg-img" src="../assets/launch_hero.jpg" style="opacity: 0.85;">
    <div class="vignette-light"></div>
    <div class="content">
      <div class="brand-pill">
        <div class="logo-row">
          <span style="font-size: 24px;">🌿</span>
          <h1 class="logo-title">Noklai</h1>
        </div>
        <div class="tagline">Our Culture. Their Memories. Always With Them.</div>
      </div>
      <div class="bottom-card">
        <div class="motto-badge">
          <span>❤️</span> Culture Connects. Care Continues.
        </div>
        <h2 class="headline">Caring for Brighter Tomorrows</h2>
        <div class="subheadline">Empowering dementia care through native culture</div>
        <button class="btn">Get Started <span>→</span></button>
        <div class="secondary-link">Change Caregiver & Patient Details</div>
      </div>
    </div>
  </div>

  <!-- Dark Mode with Low Transparency (Opacity 0.85) -->
  <div class="screen" style="background: #020617;">
    <img class="bg-img" src="../assets/launch_hero.jpg" style="opacity: 0.85;">
    <div class="vignette-dark"></div>
    <div class="content">
      <div class="brand-pill brand-pill-dark">
        <div class="logo-row">
          <span style="font-size: 24px;">🌿</span>
          <h1 class="logo-title logo-title-dark">Noklai</h1>
        </div>
        <div class="tagline tagline-dark">Our Culture. Their Memories. Always With Them.</div>
      </div>
      <div class="bottom-card bottom-card-dark">
        <div class="motto-badge motto-badge-dark">
          <span>❤️</span> Culture Connects. Care Continues.
        </div>
        <h2 class="headline headline-dark">Caring for Brighter Tomorrows</h2>
        <div class="subheadline subheadline-dark">Empowering dementia care through native culture</div>
        <button class="btn">Get Started <span>→</span></button>
        <div class="secondary-link secondary-link-dark">Change Caregiver & Patient Details</div>
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
  '--window-size=900,850',
  `--screenshot=${outputPngPath}`,
  `file:///${htmlPath.replace(/\\/g, '/')}`
]);

console.log('Done rendering test preview 2!');

