# Chatbot Flow Builder

A visual drag-and-drop editor for building chatbot conversations. No frameworks, no dependencies — just HTML, CSS, and vanilla JavaScript.

Drop message nodes, question nodes, and condition nodes onto the canvas. Connect them with lines to build your conversation flow. Export the whole thing as JSON when you're done.

## Features

- **Drag-and-drop nodes** — Message, Question, and Condition types
- **Visual connections** — Click output ports to draw lines between nodes
- **JSON export** — Get your flow as structured data, ready for any chatbot engine
- **No dependencies** — Works in any modern browser, nothing to install
- **Undo support** — Ctrl+Z to undo the last action

## Getting Started

1. Open `index.html` in your browser
2. Click the buttons in the toolbar to add nodes
3. Drag nodes around the canvas to position them
4. Click an output port, then click an input port to connect nodes
5. Double-click a node to edit its text
6. Hit "Export JSON" to get your flow data

## How It Works

The editor uses an HTML5 Canvas for rendering connections and standard DOM elements for the nodes themselves. This means nodes are easy to style and interact with, while the connections draw smoothly on the canvas layer underneath.

### Node Types

| Type | Purpose | Outputs |
|------|---------|---------|
| Message | Send text to the user | 1 (next step) |
| Question | Ask something and wait for input | 2 (yes/no or match/no match) |
| Condition | Branch based on a variable | 2 (true/false) |

### Export Format

```json
{
  "nodes": [
    {
      "id": "node_1",
      "type": "message",
      "text": "Hello! How can I help?",
      "position": { "x": 100, "y": 50 },
      "connections": ["node_2"]
    }
  ]
}
```

## Screenshots

Open `index.html` and start building — the interface is self-explanatory.

## About Hand On Web
We build AI chatbots, voice agents, and automation tools for businesses.
- 🌐 [handonweb.com](https://www.handonweb.com)
- 📧 outreach@handonweb.com
- 📍 Chester, UK

## Licence
MIT
