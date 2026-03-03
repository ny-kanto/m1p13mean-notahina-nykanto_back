function applyPromotionToPrice(price, promo) {
  if (!promo) return { prixOriginal: price, prixRemise: price, remise: 0 };

  const remise = promo.pourcentage;
  const prixRemise = Math.round(price * (1 - remise / 100)); // ou arrondi 2 décimales si besoin
  return { prixOriginal: price, prixRemise, remise };
}
