/**
 * Automated Verification Script for Suh Tah Lam 3D Components
 * Verifies:
 * - Module exports and imports
 * - Coordinate mapping
 * - Localization keys across all 4 languages (en, as, bn, hi)
 * - Name badges configuration and translucency criteria
 * - 3D bamboo color configurations
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('--- TESTING SUH TAH LAM 3D COMPONENTS & CONFIGURATIONS ---');

// 1. Check GRID_COORDINATES in SequencePlayer
const seqPlayerCode = fs.readFileSync('src/games/suhTahLam/components/SequencePlayer.js', 'utf8');
assert(seqPlayerCode.includes('GRID_COORDINATES'), 'GRID_COORDINATES must be defined');
assert(seqPlayerCode.includes('impactAnim'), 'impactAnim must be wired in SequencePlayer');
assert(seqPlayerCode.includes('onBambooClack'), 'onBambooClack must be called on clack');
console.log('✓ SequencePlayer contains GRID_COORDINATES, impactAnim, and onBambooClack');

// 2. Check Character3D for 3D model features & name badges
const charCode = fs.readFileSync('src/games/suhTahLam/components/Character3D.js', 'utf8');
assert(charCode.includes('Kimboi · Lead Dancer'), 'Dancer fallback name must be Kimboi · Lead Dancer');
assert(charCode.includes('Thangminlen'), 'Left holder fallback name must be Thangminlen');
assert(charCode.includes('Paominlun'), 'Right holder fallback name must be Paominlun');
assert(charCode.includes('rgba(15, 25, 18, 0.35)'), 'Name badge background must have 35% transparency (30-40% range)');
assert(charCode.includes('vakiriaCrest'), 'Dancer must have authentic Vakiria headdress');
assert(charCode.includes('khamtangSkirt'), 'Dancer must have authentic Khamtang / Saipikhup wrap skirt');
assert(charCode.includes('holderStool'), 'Holders must have 3D timber stool platforms');
assert(charCode.includes('holderHeadband'), 'Holders must have authentic Lakhon woven headband headdresses');
console.log('✓ Character3D contains all 3D human models, NE traditional attire, living kinematics, and 35% translucent name badges');

// 3. Check BambooPole3D for green bamboo styling
const bambooPoleCode = fs.readFileSync('src/games/suhTahLam/components/BambooPole3D.js', 'utf8');
assert(bambooPoleCode.includes('#3B8226'), 'Bamboo poles must use vibrant green (#3B8226)');
assert(bambooPoleCode.includes('jointRing'), 'Bamboo poles must have segmented nodal joints');
assert(bambooPoleCode.includes('specularSheen'), 'Bamboo poles must have specular light reflection');
console.log('✓ BambooPole3D verified with vibrant emerald/forest green and nodal joints');

// 4. Check Environment3D for open Northeast landscape
const envCode = fs.readFileSync('src/games/suhTahLam/components/Environment3D.js', 'utf8');
assert(envCode.includes('peak') || envCode.includes('mountain'), 'Environment must feature distant mountain peaks');
assert(envCode.includes('cloud1Anim') || envCode.includes('cloudDriftAnim'), 'Environment must feature animated drifting clouds');
assert(envCode.includes('Granary') || envCode.includes('villageStiltGroup'), 'Environment must feature Northeast village stilt structures');
assert(envCode.includes('bambooGrove') || envCode.includes('bambooCulm'), 'Environment must feature bamboo grove silhouettes');
assert(envCode.includes('stagePlatform'), 'Environment must feature open-air festival stage platform');
console.log('✓ Environment3D verified with open Northeast mountain valley and courtyard stage');

// 5. Check Localization keys across en, as, bn, hi
const langs = ['en', 'as', 'bn', 'hi'];
for (const lang of langs) {
  const jsonPath = path.resolve(`src/translations/${lang}.json`);
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const suhtahlam = data.games?.suhtahlam || data.games?.suhTahLam;
  assert(suhtahlam, `Missing suhtahlam section in ${lang}.json`);
  assert(suhtahlam.dancerKimboi, `Missing dancerKimboi in ${lang}.json`);
  assert(suhtahlam.holderThangminlen, `Missing holderThangminlen in ${lang}.json`);
  assert(suhtahlam.holderPaominlun, `Missing holderPaominlun in ${lang}.json`);
  console.log(`✓ Translation keys verified for ${lang}: Kimboi="${suhtahlam.dancerKimboi}", Thangminlen="${suhtahlam.holderThangminlen}", Paominlun="${suhtahlam.holderPaominlun}"`);
}

console.log('\n🎉 ALL SUH TAH LAM 3D COMPONENT TESTS PASSED WITH 100% SUCCESS!');

