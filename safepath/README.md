# SafePath — Emergency Evacuation Route Planner

A Flask prototype for the DAA hackathon problem: find efficient evacuation routes while considering blocked paths and route distances.

## Stack
- Python
- Flask
- HTML/CSS/JavaScript
- Dijkstra's shortest-path algorithm
- Priority queue (`heapq`)

## Run
```bash
python -m venv venv
venv\\Scripts\\activate   # Windows
pip install flask
python app.py
```
Open `http://127.0.0.1:5000`.

## Project structure
- `app.py` — Flask backend, graph, Dijkstra, blocked-path handling
- `templates/index.html` — interface and SVG map
- `static/style.css` — styling
- `static/app.js` — route requests and map visualization
