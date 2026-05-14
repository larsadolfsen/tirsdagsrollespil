/**
 * WFRP 4e XP advance cost helpers.
 */

export function getAdvanceCost(currentAdvances: number) {
  if (currentAdvances < 5) return 10;
  if (currentAdvances < 10) return 15;
  if (currentAdvances < 15) return 20;
  if (currentAdvances < 20) return 30;
  if (currentAdvances < 25) return 40;
  if (currentAdvances < 30) return 60;
  if (currentAdvances < 35) return 80;
  if (currentAdvances < 40) return 110;
  if (currentAdvances < 45) return 140;
  if (currentAdvances < 50) return 180;
  if (currentAdvances < 55) return 220;
  if (currentAdvances < 60) return 270;
  if (currentAdvances < 65) return 320;
  if (currentAdvances < 70) return 380;
  return 440;
}

export function getCharacteristicAdvanceCost(currentAdvances: number) {
  if (currentAdvances < 5) return 25;
  if (currentAdvances < 10) return 30;
  if (currentAdvances < 15) return 40;
  if (currentAdvances < 20) return 50;
  if (currentAdvances < 25) return 70;
  if (currentAdvances < 30) return 90;
  if (currentAdvances < 35) return 120;
  if (currentAdvances < 40) return 150;
  if (currentAdvances < 45) return 190;
  if (currentAdvances < 50) return 230;
  if (currentAdvances < 55) return 280;
  if (currentAdvances < 60) return 330;
  if (currentAdvances < 65) return 390;
  if (currentAdvances < 70) return 450;
  return 520;
}

export function getTalentPurchaseCost(currentTimesTaken: number) {
  return 100 + currentTimesTaken * 100;
}
