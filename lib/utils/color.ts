/**
 * Darkens a hex color by a percentage
 * @param hex - Hex color string (e.g., "#e3c3b9" or "e3c3b9")
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened hex color string
 */
export function darkenHex(hex: string, percent: number): string {
  // Remove # if present
  const cleanHex = hex.replace("#", "");
  
  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Darken by reducing each RGB value
  const factor = 1 - percent / 100;
  const darkenedR = Math.round(r * factor);
  const darkenedG = Math.round(g * factor);
  const darkenedB = Math.round(b * factor);
  
  // Convert back to hex
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  
  return `#${toHex(darkenedR)}${toHex(darkenedG)}${toHex(darkenedB)}`;
}

