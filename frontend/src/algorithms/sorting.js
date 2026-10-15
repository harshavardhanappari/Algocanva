// Each function takes an array and returns an array of "steps" (snapshots).
// Statistics are counted at the exact moment the operation happens.
//
// step = { array, active[], marked[], range|null, sorted[], kind, message, stats }

function recorder(input, statKeys) {
  const a = [...input];
  const steps = [];
  const stats = Object.fromEntries(statKeys.map((k) => [k, 0]));
  const sorted = new Set();
  const snap = (message, { active = [], marked = [], range = null, kind = 'compare' } = {}) =>
    steps.push({ array: [...a], active, marked, range, sorted: [...sorted], kind, message, stats: { ...stats } });
  return { a, steps, stats, sorted, snap };
}

export function bubbleSort(input) {
  const { a, steps, stats, sorted, snap } = recorder(input, ['comparisons', 'swaps']);
  const n = a.length;
  snap('Start: compare neighbours and swap them if they are out of order.', { kind: 'info' });
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      stats.comparisons++;
      snap(`Compare ${a[j]} and ${a[j + 1]}.`, { active: [j, j + 1] });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        stats.swaps++;
        snap(`${a[j + 1]} is larger, so swap them.`, { active: [j, j + 1], kind: 'swap' });
        swapped = true;
      }
    }
    sorted.add(n - 1 - i);
    snap(`Pass ${i + 1} finished: ${a[n - 1 - i]} is now in its final position.`, { kind: 'info' });
    if (!swapped) {
      for (let k = 0; k < n; k++) sorted.add(k);
      snap('No swaps in this pass, so the array is already sorted.', { kind: 'info' });
      return steps;
    }
  }
  for (let k = 0; k < n; k++) sorted.add(k);
  snap('Sorted!', { kind: 'done' });
  return steps;
}

export function selectionSort(input) {
  const { a, steps, stats, sorted, snap } = recorder(input, ['comparisons', 'swaps']);
  const n = a.length;
  snap('Start: repeatedly pick the smallest unsorted value and move it to the front.', { kind: 'info' });
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    snap(`Pass ${i + 1}: assume ${a[i]} is the smallest so far.`, { marked: [min], kind: 'info' });
    for (let j = i + 1; j < n; j++) {
      stats.comparisons++;
      snap(`Compare ${a[j]} with the current minimum ${a[min]}.`, { active: [j], marked: [min] });
      if (a[j] < a[min]) {
        min = j;
        snap(`${a[j]} is the new minimum.`, { marked: [min], kind: 'info' });
      }
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      stats.swaps++;
      snap(`Swap the minimum ${a[i]} into position ${i}.`, { active: [i, min], kind: 'swap' });
    }
    sorted.add(i);
  }
  sorted.add(n - 1);
  snap('Sorted!', { kind: 'done' });
  return steps;
}

export function insertionSort(input) {
  const { a, steps, stats, sorted, snap } = recorder(input, ['comparisons', 'shifts']);
  const n = a.length;
  sorted.add(0);
  snap('Start: the first element on its own is a sorted prefix.', { kind: 'info' });
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    snap(`Take ${key} as the key to insert into the sorted prefix.`, { marked: [i], kind: 'info' });
    while (j >= 0) {
      stats.comparisons++;
      snap(`Compare ${a[j]} with the key ${key}.`, { active: [j], marked: [j + 1] });
      if (a[j] > key) {
        a[j + 1] = a[j];
        stats.shifts++;
        snap(`${a[j]} is larger than ${key}, so shift it one place right.`, { active: [j + 1], kind: 'swap' });
        j--;
      } else break;
    }
    a[j + 1] = key;
    stats.shifts++;
    sorted.add(i);
    snap(`Insert ${key} at position ${j + 1}.`, { active: [j + 1], kind: 'swap' });
  }
  snap('Sorted!', { kind: 'done' });
  return steps;
}

export function mergeSort(input) {
  const { a, steps, stats, sorted, snap } = recorder(input, ['comparisons', 'writes']);
  const n = a.length;
  snap('Start: split the array in halves, sort each half, then merge.', { kind: 'info' });

  function sort(l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    snap(`Split positions ${l}–${r} into ${l}–${m} and ${m + 1}–${r}.`, { range: [l, r], kind: 'info' });
    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
  }

  function merge(l, m, r) {
    const left = a.slice(l, m + 1);
    const right = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      stats.comparisons++;
      const takeLeft = left[i] <= right[j];
      const value = takeLeft ? left[i] : right[j];
      snap(`Compare ${left[i]} (left) with ${right[j]} (right): take ${value}.`, { active: [k], range: [l, r] });
      a[k++] = value;
      takeLeft ? i++ : j++;
      stats.writes++;
      snap(`Write ${value} to position ${k - 1}.`, { active: [k - 1], range: [l, r], kind: 'swap' });
    }
    while (i < left.length) { a[k++] = left[i++]; stats.writes++; snap(`Copy leftover ${a[k - 1]} from the left half.`, { active: [k - 1], range: [l, r], kind: 'swap' }); }
    while (j < right.length) { a[k++] = right[j++]; stats.writes++; snap(`Copy leftover ${a[k - 1]} from the right half.`, { active: [k - 1], range: [l, r], kind: 'swap' }); }
    if (l === 0 && r === n - 1) for (let x = 0; x < n; x++) sorted.add(x);
    snap(`Merged positions ${l}–${r}.`, { range: [l, r], kind: 'info' });
  }

  sort(0, n - 1);
  for (let x = 0; x < n; x++) sorted.add(x);
  snap('Sorted!', { kind: 'done' });
  return steps;
}
