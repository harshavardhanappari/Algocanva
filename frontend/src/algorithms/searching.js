// Binary search on a sorted array. Step: { array, low, high, mid, found, kind, message, stats }
export function binarySearch(input, target) {
  const a = [...input];
  const steps = [];
  const stats = { comparisons: 0 };
  const snap = (low, high, mid, message, kind = 'compare', found = -1) =>
    steps.push({ array: a, low, high, mid, found, kind, message, stats: { ...stats } });

  let low = 0, high = a.length - 1;
  snap(low, high, -1, `Search for ${target} in the sorted array. The range is the whole array.`, 'info');
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    stats.comparisons++;
    snap(low, high, mid, `Middle element is ${a[mid]} (index ${mid}). Compare it with ${target}.`);
    if (a[mid] === target) {
      snap(low, high, mid, `${a[mid]} equals the target. Found at index ${mid}!`, 'done', mid);
      return steps;
    }
    if (a[mid] < target) {
      snap(low, high, mid, `${a[mid]} < ${target}, so discard the left half.`, 'info');
      low = mid + 1;
    } else {
      snap(low, high, mid, `${a[mid]} > ${target}, so discard the right half.`, 'info');
      high = mid - 1;
    }
  }
  snap(low, high, -1, `The range is empty: ${target} is not in the array.`, 'done');
  return steps;
}
