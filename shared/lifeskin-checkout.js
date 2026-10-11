// Shop checkout starts with customer input, not a screen opening.
// Historical opening flags alone must not become started checkouts.
export function istShopCheckout(s) {
  return s?.source?.weg === 'lifeskinshop' || s?.weg === 'lifeskinshop'
    || s?.timings?.kasse?.v === 2;
}

export function checkoutBegonnen(s) {
  if (s?.manuell === true || s?.order?.manuell === true) return false;
  if (s?.hatBestellt === true || s?.order?.orderId) return true;
  if (!istShopCheckout(s)) return s?.kasseGeoeffnet === true
    || s?.adresseBegonnen === true || s?.hatAnschrift === true;
  return s?.adresseBegonnen === true || Boolean(s?.timings?.kasse?.begonnen)
    || Object.values(s?.timings?.kasse?.felder || {}).some(v => typeof v === 'string' && v.trim());
}
