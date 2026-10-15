import { bubbleSort, selectionSort, insertionSort, mergeSort } from './sorting.js';
import { binarySearch } from './searching.js';
import { bfs, dfs, dijkstra } from './graph.js';

// slug -> how the visualizer page should run and draw it.
// Slugs match the `slug` field of the algorithm records in the database.
export const VISUALIZERS = {
  'bubble-sort': { type: 'sort', run: bubbleSort, statLabels: { comparisons: 'Comparisons', swaps: 'Swaps' } },
  'selection-sort': { type: 'sort', run: selectionSort, statLabels: { comparisons: 'Comparisons', swaps: 'Swaps' } },
  'insertion-sort': { type: 'sort', run: insertionSort, statLabels: { comparisons: 'Comparisons', shifts: 'Shifts / writes' } },
  'merge-sort': { type: 'sort', run: mergeSort, statLabels: { comparisons: 'Comparisons', writes: 'Array writes' } },
  'binary-search': { type: 'search', run: binarySearch, statLabels: { comparisons: 'Comparisons' } },
  bfs: { type: 'graph', run: bfs, needsEnd: false, statLabels: { nodesVisited: 'Nodes dequeued', edgesExamined: 'Edges examined', maxQueueSize: 'Max queue size' } },
  dfs: { type: 'graph', run: dfs, needsEnd: false, statLabels: { nodesVisited: 'Nodes visited', edgesExamined: 'Edges examined', maxDepth: 'Max depth' } },
  dijkstra: { type: 'graph', run: dijkstra, needsEnd: true, weighted: true, statLabels: { nodesFinalized: 'Nodes finalized', relaxations: 'Relaxations', edgesExamined: 'Edges examined' } },
};
