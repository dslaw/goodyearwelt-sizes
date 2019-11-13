// Flag invalid sizing pairs.

export function hasNote(shoeLast: string): boolean {
  return shoeLast.toLowerCase().includes("note");
}

export function hasBrannockSize(shoeLast: string): boolean {
  const lowered = shoeLast.toLowerCase();
  return lowered.includes("brannock") || (lowered === "size");
}

export function hasValidShoeLast(shoeLast: string) {
  if (hasNote(shoeLast)) {
    return false;
  }

  if (hasBrannockSize(shoeLast)) {
    return false;
  }

  return true;
}
