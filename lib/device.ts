/**
 * Clean device name formatting to prevent duplicate brand names like:
 * "Apple Apple iPhone 15" -> "Apple iPhone 15"
 * "Samsung Samsung Galaxy A03" -> "Samsung Galaxy A03"
 * "Google Google Pixel 10" -> "Google Pixel 10"
 */

export function cleanDeviceName(name: string = ""): string {
  if (!name) return "";
  let clean = name.trim();

  // Remove leading duplicate words like "Apple Apple", "Samsung Samsung", "Google Google" (case-insensitive)
  clean = clean.replace(/^([A-Za-z0-9]+)\s+\1\b/i, "$1").trim();

  // Also handle cases where brand name is duplicated in phrase like "Google Google Pixel 10 (256 GB)"
  clean = clean.replace(/^(\b[A-Za-z0-9]+\b)(?:\s+\1)+/i, "$1").trim();

  return clean;
}

export function formatDeviceName(brandName: string = "", modelName: string = "", storage?: string | null): string {
  const b = (brandName || "").trim();
  let m = (modelName || "").trim();

  // If modelName starts with brandName (case-insensitive), strip the duplicate leading brand from model
  if (b && m.toLowerCase().startsWith(b.toLowerCase())) {
    m = m.slice(b.length).trim();
  }

  const fullName = b ? (m ? `${b} ${m}` : b) : m;
  let cleaned = cleanDeviceName(fullName);

  if (storage && storage.trim() && !cleaned.toLowerCase().includes(storage.trim().toLowerCase())) {
    return `${cleaned} (${storage.trim()})`;
  }
  return cleaned;
}
