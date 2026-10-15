import { randomInt } from '../utils/random.js';

// Fixed topology (so the picture stays readable), weights can be re-rolled.
export const NODES = [
  { id: 'A', x: 70, y: 70 }, { id: 'B', x: 230, y: 40 }, { id: 'C', x: 230, y: 160 },
  { id: 'D', x: 390, y: 70 }, { id: 'E', x: 390, y: 200 }, { id: 'F', x: 550, y: 40 },
  { id: 'G', x: 550, y: 150 }, { id: 'H', x: 520, y: 270 }, { id: 'I', x: 100, y: 230 },
];
const EDGE_PAIRS = [
  ['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'C'], ['C', 'E'], ['D', 'E'],
  ['D', 'F'], ['E', 'G'], ['F', 'G'], ['E', 'H'], ['G', 'H'], ['A', 'I'], ['I', 'C'],
];

export function makeGraph(randomWeights = false) {
  const fixed = [4, 2, 7, 1, 3, 5, 6, 2, 4, 8, 3, 6, 5];
  return {
    nodes: NODES,
    edges: EDGE_PAIRS.map(([from, to], i) => ({ from, to, weight: randomWeights ? randomInt(1, 9) : fixed[i] })),
  };
}
