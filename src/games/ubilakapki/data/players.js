/**
 * UBILAKAPKI - Player Character Configurations
 * 5 visually distinguishable authentic Northeast Indian characters.
 * Each character has distinct clothing colors, attire, hair, accessories, and ring positions.
 */

export const PLAYER_ARCHETYPES = [
  {
    id: 'A',
    key: 'playerA',
    code: 'A',
    label: 'Jonali',
    nameFallback: 'Jonali',
    color: '#B91C1C', // Terracotta Red
    lightColor: '#FEE2E2',
    borderColor: '#991B1B',
    hairColor: '#4A4A4A',
    hairStyle: 'coiled_bun',
    hairAccent: '#E5E7EB', // Silver hairpin
    attireType: 'terracotta_vest',
    accessory: 'gamusa_sash',
    skinTone: '#D4A373',
  },
  {
    id: 'B',
    key: 'playerB',
    code: 'B',
    label: 'Rupjyoti',
    nameFallback: 'Rupjyoti',
    color: '#047857', // Forest Jade
    lightColor: '#D1FAE5',
    borderColor: '#065F46',
    hairColor: '#2D3748',
    hairStyle: 'cropped_grey',
    hairAccent: '#CBD5E1',
    attireType: 'emerald_tunic',
    accessory: 'cotton_stole',
    skinTone: '#C68B59',
  },
  {
    id: 'C',
    key: 'playerC',
    code: 'C',
    label: 'Bobita',
    nameFallback: 'Bobita',
    color: '#D97706', // Golden Amber
    lightColor: '#FEF3C7',
    borderColor: '#B45309',
    hairColor: '#3F3F46',
    hairStyle: 'tied_topknot',
    hairAccent: '#F59E0B', // Brass pin
    attireType: 'amber_wrap',
    accessory: 'silver_ear_studs',
    skinTone: '#E0AC69',
  },
  {
    id: 'D',
    key: 'playerD',
    code: 'D',
    label: 'Debajit',
    nameFallback: 'Debajit',
    color: '#1D4ED8', // Royal Sapphire
    lightColor: '#DBEAFE',
    borderColor: '#1E40AF',
    hairColor: '#18181B',
    hairStyle: 'side_parted_grey',
    hairAccent: '#94A3B8',
    attireType: 'sapphire_jacket',
    accessory: 'woven_waistbelt',
    skinTone: '#BB8050',
  },
  {
    id: 'E',
    key: 'playerE',
    code: 'E',
    label: 'Anamika',
    nameFallback: 'Anamika',
    color: '#7E22CE', // Deep Royal Plum
    lightColor: '#F3E8FF',
    borderColor: '#6B21A8',
    hairColor: '#52525B',
    hairStyle: 'braided_crown',
    hairAccent: '#E2E8F0',
    attireType: 'plum_chador',
    accessory: 'carved_bead_necklace',
    skinTone: '#C99368',
  },
];

/**
 * Computes angular 2D stage coordinates for N players on a circle of given radius.
 * Standardizes layout so players face the center with clear spacing.
 */
export function getRingCoordinates(playerCount = 3, radius = 95) {
  const coords = {};
  const angleOffsets = {
    3: [90, 210, 330],
    4: [45, 135, 225, 315],
    5: [90, 162, 234, 306, 18],
  };

  const angles = angleOffsets[playerCount] || angleOffsets[3];
  const archetypes = PLAYER_ARCHETYPES.slice(0, playerCount);

  archetypes.forEach((player, idx) => {
    const deg = angles[idx];
    const rad = (deg * Math.PI) / 180;
    const x = Math.round(radius * Math.cos(rad));
    const y = Math.round(-radius * Math.sin(rad));

    coords[player.id] = {
      id: player.id,
      x,
      y,
      deg,
      player,
    };
  });

  return coords;
}
