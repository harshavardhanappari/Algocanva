export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const randomArray = (n, min = 5, max = 100) => Array.from({ length: n }, () => randomInt(min, max));

// Sorted array of distinct values (binary search needs sorted input).
export function randomSortedArray(n, min = 1, max = 99) {
  const set = new Set();
  while (set.size < Math.min(n, max - min + 1)) set.add(randomInt(min, max));
  return [...set].sort((a, b) => a - b);
}
