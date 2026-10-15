import test from 'node:test';
import assert from 'node:assert';
import { bubbleSort, selectionSort, insertionSort, mergeSort } from '../src/algorithms/sorting.js';
import { binarySearch } from '../src/algorithms/searching.js';
import { bfs, dfs, dijkstra } from '../src/algorithms/graph.js';
import { makeGraph } from '../src/data/graph.js';
import { randomArray, randomSortedArray } from '../src/utils/random.js';

const sorters = { bubbleSort, selectionSort, insertionSort, mergeSort };
const asc = (a) => [...a].sort((x, y) => x - y);

for (const [name, fn] of Object.entries(sorters)) {
  test(`${name} sorts random, duplicate, sorted, reversed and tiny inputs`, () => {
    const cases = [randomArray(25), [5, 5, 5, 1, 1], [1, 2, 3, 4], [9, 7, 5, 3, 1], [3], [2, 1]];
    for (const input of cases) {
      const steps = fn(input);
      const last = steps[steps.length - 1];
      assert.deepStrictEqual(last.array, asc(input), `${name} failed on ${input}`);
      assert.strictEqual(last.sorted.length, input.length);
    }
  });
}

test('bubble sort stats match an independent count', () => {
  const input = [4, 3, 2, 1];
  const last = bubbleSort(input).at(-1);
  // reversed 4 elements: 6 comparisons, 6 swaps, no early exit
  assert.strictEqual(last.stats.swaps, 6);
  assert.strictEqual(last.stats.comparisons, 6);
});

test('bubble sort exits early on sorted input', () => {
  assert.strictEqual(bubbleSort([1, 2, 3, 4, 5]).at(-1).stats.comparisons, 4);
});

test('selection sort makes at most n-1 swaps', () => {
  assert.ok(selectionSort(randomArray(20)).at(-1).stats.swaps <= 19);
  assert.strictEqual(selectionSort([1, 2, 3, 4]).at(-1).stats.comparisons, 6);
});

test('merge sort comparisons stay within n log n bound', () => {
  const n = 32;
  assert.ok(mergeSort(randomArray(n)).at(-1).stats.comparisons <= n * Math.log2(n));
});

test('binary search finds present values and reports missing ones', () => {
  const arr = randomSortedArray(20);
  for (const idx of [0, 7, 19]) {
    const last = binarySearch(arr, arr[idx]).at(-1);
    assert.strictEqual(last.found, idx);
  }
  const miss = binarySearch([1, 3, 5, 7], 4).at(-1);
  assert.strictEqual(miss.found, -1);
  assert.ok(binarySearch(arr, arr[3]).at(-1).stats.comparisons <= Math.floor(Math.log2(20)) + 1);
});

test('BFS and DFS reach every node of the connected demo graph', () => {
  const g = makeGraph();
  assert.strictEqual(bfs(g, 'A').at(-1).visited.length, g.nodes.length);
  assert.strictEqual(dfs(g, 'A').at(-1).visited.length, g.nodes.length);
});

test('BFS returns a path with the fewest edges', () => {
  const g = makeGraph();
  const path = bfs(g, 'A', 'H').at(-1).path;
  assert.deepStrictEqual([path[0], path.at(-1)], ['A', 'H']);
  assert.strictEqual(path.length - 1, 3); // A-C-E-H
});

test('Dijkstra matches a brute-force shortest path', () => {
  for (let t = 0; t < 20; t++) {
    const g = makeGraph(true);
    const last = dijkstra(g, 'A', 'H').at(-1);
    // Bellman-Ford as an independent check
    const d = Object.fromEntries(g.nodes.map((n) => [n.id, Infinity])); d.A = 0;
    for (let i = 0; i < g.nodes.length; i++) for (const { from, to, weight } of g.edges) {
      if (d[from] + weight < d[to]) d[to] = d[from] + weight;
      if (d[to] + weight < d[from]) d[from] = d[to] + weight;
    }
    assert.strictEqual(last.dist.H, d.H);
    const pathCost = last.pathEdges.reduce((s, [u, v]) => s + g.edges.find((e) => (e.from === u && e.to === v) || (e.from === v && e.to === u)).weight, 0);
    assert.strictEqual(pathCost, d.H);
  }
});

test('unreachable destination is reported', () => {
  const g = { nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 1, y: 1 }], edges: [] };
  assert.deepStrictEqual(dijkstra(g, 'A', 'B').at(-1).path, []);
  assert.deepStrictEqual(bfs(g, 'A', 'B').at(-1).path, []);
});
