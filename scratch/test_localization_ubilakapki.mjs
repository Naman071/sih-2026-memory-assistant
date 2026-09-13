import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  getLocalizedPlayerName,
  getLocalizedPlayerAttire,
  getLocalizedPrompt,
  getLocalizedFeedback,
  PLAYER_NAME_MAP,
  ATTIRE_DESCRIPTION_MAP,
} from '../src/games/ubilakapki/utils/localization.js';

console.log('--- STARTING UBILAKAPKI LOCALIZATION TEST SUITE ---');

const languages = ['en', 'as', 'bn', 'hi'];
const dummyT = (key) => {
  // Mock i18n
  return `t_${key}`;
};

for (const lang of languages) {
  console.log(`Checking language: ${lang}`);
  for (const pId of ['A', 'B', 'C', 'D', 'E']) {
    const pName = PLAYER_NAME_MAP[pId][lang];
    assert(pName, `Player ${pId} must have translation for ${lang}`);
    const attire = ATTIRE_DESCRIPTION_MAP[pId][lang];
    assert(attire, `Player ${pId} must have attire translation for ${lang}`);
  }
}

// Fallback behavior when t returns missing key
const fallbackT = (key) => 'missing translation: ' + key;
const nameA_as = getLocalizedPlayerName('A', fallbackT, 'as');
assert.strictEqual(nameA_as, 'জোনালী');

const nameC_hi = getLocalizedPlayerName('C', fallbackT, 'hi');
assert.strictEqual(nameC_hi, 'बबीता');

const nameB_bn = getLocalizedPlayerName('B', fallbackT, 'bn');
assert.strictEqual(nameB_bn, 'রূপজ্যোতি');

const nameA_en = getLocalizedPlayerName('A', fallbackT, 'en');
assert.strictEqual(nameA_en, 'Jonali');

console.log('✓ ALL LOCALIZATION HELPER TESTS PASSED!');

