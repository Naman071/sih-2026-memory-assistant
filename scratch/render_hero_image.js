const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlPath = path.resolve(__dirname, 'render_launch_hero.html');
const outputPngPath = path.resolve(__dirname, '..', 'assets', 'launch_hero.png');

console.log('Rendering HTML to PNG:');
console.log('Source HTML:', htmlPath);
console.log('Target PNG:', outputPngPath);

const result = spawnSync(edgePath, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=720,480',
  `--screenshot=${outputPngPath}`,
  `file:///${htmlPath.replace(/\\/g, '/')}`
]);

if (fs.existsSync(outputPngPath)) {
  const stats = fs.statSync(outputPngPath);
  console.log('SUCCESS: launch_hero.png generated successfully!');
  console.log('File size:', stats.size, 'bytes');
} else {
  console.error('ERROR: launch_hero.png was not generated.');
  console.error('stderr:', result.stderr?.toString());
  console.error('stdout:', result.stdout?.toString());
}

