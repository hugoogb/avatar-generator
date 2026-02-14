import type { Random } from "./types";

/**
 * Creates a hash from a string seed using a simple but effective algorithm
 * Based on cyrb53 hash function
 */
function hashSeed(seed: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * Mulberry32 PRNG - fast, simple, and good quality
 * Returns a function that generates the next random number
 */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Creates a deterministic random number generator from a string seed
 * Same seed always produces the same sequence of numbers
 */
export function createRandom(seed: string): Random {
  const numericSeed = hashSeed(seed);
  const rng = mulberry32(numericSeed);

  return {
    next(): number {
      return rng();
    },

    int(min: number, max: number): number {
      return Math.floor(rng() * (max - min)) + min;
    },

    pick<T>(array: T[]): T {
      if (array.length === 0) {
        throw new Error("Cannot pick from empty array");
      }
      return array[Math.floor(rng() * array.length)];
    },

    bool(probability = 0.5): boolean {
      return rng() < probability;
    },

    shuffle<T>(array: T[]): T[] {
      // Fisher-Yates shuffle
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
  };
}
