// Graph step: { visited[], frontier[], current, edge:[u,v]|null, dist|null, path[], pathEdges[], kind, message, stats }
// graph = { nodes:[{id,x,y}], edges:[{from,to,weight}] } (undirected)

export function adjacency(graph) {
  const adj = new Map(graph.nodes.map((n) => [n.id, []]));
  for (const { from, to, weight } of graph.edges) {
    adj.get(from).push({ to, weight });
    adj.get(to).push({ to: from, weight });
  }
  for (const list of adj.values()) list.sort((x, y) => x.to.localeCompare(y.to));
  return adj;
}

function pathFrom(prev, end) {
  const path = [];
  for (let at = end; at !== undefined; at = prev[at]) path.unshift(at);
  return path;
}
const edgesOf = (path) => path.slice(1).map((v, i) => [path[i], v]);

export function bfs(graph, start, end = null) {
  const adj = adjacency(graph);
  const steps = [];
  const stats = { nodesVisited: 0, edgesExamined: 0, maxQueueSize: 1 };
  const visited = new Set([start]);
  const prev = {};
  const queue = [start];
  const snap = (message, { current = null, edge = null, kind = 'compare', path = [] } = {}) =>
    steps.push({ visited: [...visited], frontier: [...queue], current, edge, dist: null, path, pathEdges: edgesOf(path), kind, message, stats: { ...stats } });

  snap(`Start at ${start}: put it in the queue and mark it visited.`, { current: start, kind: 'info' });
  while (queue.length) {
    const u = queue.shift();
    stats.nodesVisited++;
    snap(`Dequeue ${u} and look at its neighbours.`, { current: u, kind: 'info' });
    if (u === end) {
      const path = pathFrom(prev, end);
      snap(`Reached ${end}! Fewest-edge path: ${path.join(' → ')}.`, { current: u, kind: 'done', path });
      return steps;
    }
    for (const { to: v } of adj.get(u)) {
      stats.edgesExamined++;
      if (!visited.has(v)) {
        visited.add(v);
        prev[v] = u;
        queue.push(v);
        stats.maxQueueSize = Math.max(stats.maxQueueSize, queue.length);
        snap(`${v} is new: mark it visited and enqueue it.`, { current: u, edge: [u, v] });
      } else {
        snap(`${v} was already visited, skip it.`, { current: u, edge: [u, v] });
      }
    }
  }
  snap(end ? `Queue empty: ${end} cannot be reached from ${start}.` : 'Queue empty: every reachable node has been visited.', { kind: 'done' });
  return steps;
}

export function dfs(graph, start, end = null) {
  const adj = adjacency(graph);
  const steps = [];
  const stats = { nodesVisited: 0, edgesExamined: 0, maxDepth: 0 };
  const visited = new Set();
  const prev = {};
  const stack = []; // recursion stack shown as the "frontier"
  let found = false;
  const snap = (message, { current = null, edge = null, kind = 'compare', path = [] } = {}) =>
    steps.push({ visited: [...visited], frontier: [...stack], current, edge, dist: null, path, pathEdges: edgesOf(path), kind, message, stats: { ...stats } });

  snap(`Start DFS at ${start}.`, { current: start, kind: 'info' });
  function visit(u) {
    visited.add(u);
    stack.push(u);
    stats.nodesVisited++;
    stats.maxDepth = Math.max(stats.maxDepth, stack.length);
    snap(`Visit ${u} (recursion depth ${stack.length}).`, { current: u, kind: 'info' });
    if (u === end) {
      found = true;
      const path = pathFrom(prev, end);
      snap(`Reached ${end}! Path found by DFS: ${path.join(' → ')} (not necessarily the shortest).`, { current: u, kind: 'done', path });
      return;
    }
    for (const { to: v } of adj.get(u)) {
      if (found) return;
      stats.edgesExamined++;
      if (!visited.has(v)) {
        prev[v] = u;
        snap(`Go deeper: ${u} → ${v}.`, { current: u, edge: [u, v] });
        visit(v);
        if (found) return;
        snap(`Back at ${u} after finishing ${v}.`, { current: u, kind: 'info' });
      } else {
        snap(`${v} was already visited, skip it.`, { current: u, edge: [u, v] });
      }
    }
    stack.pop();
    snap(`All neighbours of ${u} done: backtrack.`, { current: u, kind: 'info' });
  }
  visit(start);
  if (!found) snap(end ? `${end} cannot be reached from ${start}.` : 'DFS complete: every reachable node has been visited.', { kind: 'done' });
  return steps;
}

export function dijkstra(graph, start, end = null) {
  const adj = adjacency(graph);
  const steps = [];
  const stats = { nodesFinalized: 0, relaxations: 0, edgesExamined: 0 };
  const dist = Object.fromEntries(graph.nodes.map((n) => [n.id, Infinity]));
  const prev = {};
  const done = new Set();
  dist[start] = 0;
  const snap = (message, { current = null, edge = null, kind = 'compare', path = [] } = {}) =>
    steps.push({
      visited: [...done],
      frontier: graph.nodes.map((n) => n.id).filter((id) => !done.has(id) && dist[id] !== Infinity),
      current, edge, dist: { ...dist }, path, pathEdges: edgesOf(path), kind, message, stats: { ...stats },
    });

  snap(`Set distance of ${start} to 0 and every other node to ∞.`, { current: start, kind: 'info' });
  while (done.size < graph.nodes.length) {
    let u = null;
    for (const n of graph.nodes) if (!done.has(n.id) && dist[n.id] !== Infinity && (u === null || dist[n.id] < dist[u])) u = n.id;
    if (u === null) break; // remaining nodes are unreachable
    done.add(u);
    stats.nodesFinalized++;
    snap(`Pick ${u}: smallest tentative distance (${dist[u]}). It is now final.`, { current: u, kind: 'info' });
    if (u === end) {
      const path = pathFrom(prev, end);
      snap(`Reached ${end} with total distance ${dist[end]}. Shortest path: ${path.join(' → ')}.`, { current: u, kind: 'done', path });
      return steps;
    }
    for (const { to: v, weight } of adj.get(u)) {
      if (done.has(v)) continue;
      stats.edgesExamined++;
      const candidate = dist[u] + weight;
      if (candidate < dist[v]) {
        stats.relaxations++;
        const old = dist[v] === Infinity ? '∞' : dist[v];
        dist[v] = candidate;
        prev[v] = u;
        snap(`Relax ${u}–${v}: ${dist[u]} + ${weight} = ${candidate} beats ${old}, update ${v}.`, { current: u, edge: [u, v], kind: 'swap' });
      } else {
        snap(`Edge ${u}–${v}: ${dist[u]} + ${weight} = ${candidate} is not better than ${dist[v]}.`, { current: u, edge: [u, v] });
      }
    }
  }
  snap(end ? `${end} cannot be reached from ${start}.` : 'All reachable nodes now have their shortest distance.', { kind: 'done' });
  return steps;
}
