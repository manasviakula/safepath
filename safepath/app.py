from flask import Flask, render_template, request, jsonify
import heapq

app = Flask(__name__)

# Weighted graph: node -> [(neighbor, distance)]
BASE_GRAPH = {
    'A': [('B', 10)],
    'B': [('A', 10), ('C', 20), ('D', 15)],
    'C': [('B', 20), ('E1', 10)],
    'D': [('B', 15), ('E2', 10)],
    'E1': [('C', 10)],
    'E2': [('D', 10)],
}
EXITS = {'E1': 'Exit 1', 'E2': 'Exit 2'}


def dijkstra(graph, start, exits):
    dist = {node: float('inf') for node in graph}
    prev = {node: None for node in graph}
    dist[start] = 0
    pq = [(0, start)]

    while pq:
        current_dist, node = heapq.heappop(pq)
        if current_dist != dist[node]:
            continue
        if node in exits:
            path = []
            cur = node
            while cur is not None:
                path.append(cur)
                cur = prev[cur]
            path.reverse()
            return path, current_dist
        for neighbor, weight in graph[node]:
            new_dist = current_dist + weight
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                prev[neighbor] = node
                heapq.heappush(pq, (new_dist, neighbor))
    return None, None


def build_graph(blocked_edges):
    blocked = {frozenset(edge) for edge in blocked_edges}
    graph = {node: [] for node in BASE_GRAPH}
    for node, neighbors in BASE_GRAPH.items():
        for neighbor, weight in neighbors:
            if frozenset((node, neighbor)) not in blocked:
                graph[node].append((neighbor, weight))
    return graph


@app.get('/')
def index():
    return render_template('index.html')


@app.post('/api/route')
def route():
    data = request.get_json(silent=True) or {}
    start = data.get('start', 'A')
    blocked_edges = data.get('blocked', [])
    if start not in BASE_GRAPH:
        return jsonify({'error': 'Invalid starting location'}), 400
    graph = build_graph(blocked_edges)
    path, distance = dijkstra(graph, start, EXITS.keys())
    if not path:
        return jsonify({'found': False, 'message': 'No accessible evacuation route found.'})
    return jsonify({
        'found': True,
        'path': path,
        'labels': [EXITS.get(x, f'Room {x}') for x in path],
        'exit': EXITS[path[-1]],
        'distance': distance,
        'message': 'Efficient evacuation route found.'
    })


if __name__ == '__main__':
    app.run(debug=True)
