import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const babelParser = (() => {
  try { return require('@babel/parser'); }
  catch { return require('c:/Users/Nayan Solanki/Downloads/sih-2026-memory-assistant/node_modules/@babel/parser'); }
})();

const filesToValidate = [
  'src/games/ubilakapki/data/regions.js',
  'src/games/ubilakapki/data/players.js',
  'src/games/ubilakapki/data/levels.js',
  'src/games/ubilakapki/data/sequences.js',
  'src/games/ubilakapki/engine/DifficultyEngine.js',
  'src/games/ubilakapki/engine/SequenceManager.js',
  'src/games/ubilakapki/engine/QuestionManager.js',
  'src/games/ubilakapki/engine/SessionManager.js',
  'src/games/ubilakapki/utils/localization.js',
  'src/games/ubilakapki/components/NativeStageView.js',
  'src/games/ubilakapki/components/ThreeSceneView.js',
  'src/games/ubilakapki/components/QuestionScreen.js',
  'src/games/ubilakapki/components/ResultScreen.js',
  'src/games/ubilakapki/components/PauseMenu.js',
  'src/games/ubilakapki/UbilakapkiGame.js',
  'src/games/NortheastMemoryGame.js',
  'src/screens/GamesScreen.js',
  'src/games/suhTahLam/audio/SuhTahLamAudioEngine.js',
  'src/games/suhTahLam/components/PerspectiveStage.js',
  'src/games/suhTahLam/components/Environment3D.js',
  'src/games/suhTahLam/components/BambooPole3D.js',
  'src/games/suhTahLam/components/BambooGroup3D.js',
  'src/games/suhTahLam/components/Character3D.js',
  'src/games/suhTahLam/components/SequencePlayer.js',
  'src/games/suhTahLam/components/ChangeDetectionView.js',
  'src/games/suhTahLam/SuhTahLamGame.js',
  'src/modules/performance/PerformanceTracker.js',
  'src/modules/performance/SupabasePerformanceService.js',
];

console.log('--- VALIDATING JAVASCRIPT & JSX SYNTAX ---');
let hasError = false;

for (const relPath of filesToValidate) {
  const fullPath = path.resolve(relPath);
  try {
    const code = fs.readFileSync(fullPath, 'utf8');
    babelParser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'classProperties', 'objectRestSpread', 'optionalChaining', 'nullishCoalescingOperator'],
    });
    console.log(`✓ Valid: ${relPath}`);
  } catch (err) {
    console.error(`✗ Syntax Error in ${relPath}:`, err.message);
    hasError = true;
  }
}

console.log('--- VALIDATING JSON LOCALIZATION FILES ---');
for (const lang of ['en', 'as', 'bn', 'hi']) {
  const jsonPath = path.resolve(`src/translations/${lang}.json`);
  try {
    const content = fs.readFileSync(jsonPath, 'utf8');
    JSON.parse(content);
    console.log(`✓ Valid JSON: src/translations/${lang}.json`);
  } catch (err) {
    console.error(`✗ Invalid JSON in src/translations/${lang}.json:`, err.message);
    hasError = true;
  }
}

if (hasError) {
  console.error('\n❌ Validation FAILED with errors.');
  process.exit(1);
} else {
  console.log('\n🎉 ALL FILES PASSED SYNTAX & PARSING VALIDATION!');
}

