const nodesLayer = document.getElementById('nodes-layer');
const canvas = document.getElementById('connections-canvas');
const ctx = canvas.getContext('2d');

let nodes = [];
let connections = [];
let history = [];
let nodeCounter = 0;
let connectingFrom = null;
let dragTarget = null;
let dragOffset = { x: 0, y: 0 };

function resizeCanvas() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  drawConnections();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function saveState() {
  history.push(JSON.stringify({ nodes: nodes.map(n => ({...n})), connections: [...connections] }));
  if (history.length > 50) history.shift();
}

function undo() {
  if (!history.length) return;
  const state = JSON.parse(history.pop());
  nodesLayer.innerHTML = '';
  nodes = [];
  connections = state.connections;
  state.nodes.forEach(n => {
    createNodeElement(n.id, n.type, n.x, n.y, n.text);
  });
  drawConnections();
}

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
});

function addNode(type) {
  saveState();
  nodeCounter++;
  const id = 'node_' + nodeCounter;
  const x = 100 + Math.random() * 300;
  const y = 80 + Math.random() * 200;
  const defaults = { message: 'Enter message...', question: 'Ask a question...', condition: 'variable == value' };
  createNodeElement(id, type, x, y, defaults[type]);
}

function createNodeElement(id, type, x, y, text) {
  const el = document.createElement('div');
  el.className = 'flow-node ' + type;
  el.id = id;
  el.style.left = x + 'px';
  el.style.top = y + 'px';

  const outputs = type === 'message'
    ? '<div class="port output" data-port="out"><span class="port-label">next</span></div>'
    : type === 'question'
    ? '<div class="port output" data-port="yes"><span class="port-label">yes</span></div><div class="port output" data-port="no"><span class="port-label">no</span></div>'
    : '<div class="port output" data-port="true"><span class="port-label">true</span></div><div class="port output" data-port="false"><span class="port-label">false</span></div>';

  el.innerHTML = `
    <div class="node-header">
      <span>${type}</span>
      <button class="delete-btn" onclick="deleteNode('${id}')">&times;</button>
    </div>
    <div class="node-body">
      <textarea class="node-text" rows="2">${text}</textarea>
    </div>
    <div class="node-ports">
      <div class="port input" data-port="in"><span class="port-label">in</span></div>
      ${outputs}
    </div>`;

  el.addEventListener('mousedown', startDrag);
  el.querySelectorAll('.port').forEach(port => {
    port.addEventListener('mousedown', e => {
      e.stopPropagation();
      if (port.classList.contains('output')) {
        connectingFrom = { nodeId: id, port: port.dataset.port, el: port };
      }
    });
    port.addEventListener('mouseup', e => {
      e.stopPropagation();
      if (connectingFrom && port.classList.contains('input') && connectingFrom.nodeId !== id) {
        saveState();
        connections.push({ from: connectingFrom.nodeId, fromPort: connectingFrom.port, to: id, toPort: 'in' });
        connectingFrom = null;
        drawConnections();
      }
    });
  });

  nodesLayer.appendChild(el);
  nodes.push({ id, type, x, y, text, el });
}

function deleteNode(id) {
  saveState();
  const idx = nodes.findIndex(n => n.id === id);
  if (idx > -1) {
    nodes[idx].el.remove();
    nodes.splice(idx, 1);
  }
  connections = connections.filter(c => c.from !== id && c.to !== id);
  drawConnections();
}

function startDrag(e) {
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;
  const el = e.currentTarget;
  dragTarget = nodes.find(n => n.id === el.id);
  if (!dragTarget) return;
  dragOffset = { x: e.clientX - dragTarget.x, y: e.clientY - dragTarget.y };
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

function onDrag(e) {
  if (!dragTarget) return;
  dragTarget.x = e.clientX - dragOffset.x;
  dragTarget.y = e.clientY - dragOffset.y;
  dragTarget.el.style.left = dragTarget.x + 'px';
  dragTarget.el.style.top = dragTarget.y + 'px';
  drawConnections();
}

function stopDrag() {
  dragTarget = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

document.addEventListener('mouseup', () => { connectingFrom = null; });

function getPortPosition(nodeId, portName) {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return { x: 0, y: 0 };
  const port = node.el.querySelector(`.port[data-port="${portName}"]`);
  if (!port) return { x: 0, y: 0 };
  const rect = port.getBoundingClientRect();
  const containerRect = canvas.parentElement.getBoundingClientRect();
  return { x: rect.left - containerRect.left + 7, y: rect.top - containerRect.top + 7 };
}

function drawConnections() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e94560';
  connections.forEach(conn => {
    const from = getPortPosition(conn.from, conn.fromPort);
    const to = getPortPosition(conn.to, conn.toPort);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    const cp = Math.abs(to.x - from.x) * 0.5;
    ctx.bezierCurveTo(from.x + cp, from.y, to.x - cp, to.y, to.x, to.y);
    ctx.stroke();
  });
}

function exportFlow() {
  const data = {
    nodes: nodes.map(n => ({
      id: n.id,
      type: n.type,
      text: n.el.querySelector('.node-text').value,
      position: { x: n.x, y: n.y },
      connections: connections.filter(c => c.from === n.id).map(c => ({ to: c.to, port: c.fromPort }))
    })),
    connections: connections
  };
  document.getElementById('export-output').value = JSON.stringify(data, null, 2);
  document.getElementById('export-modal').classList.remove('hidden');
}

function copyExport() {
  const ta = document.getElementById('export-output');
  ta.select();
  document.execCommand('copy');
}

function closeModal() {
  document.getElementById('export-modal').classList.add('hidden');
}

function clearCanvas() {
  if (!confirm('Clear everything?')) return;
  saveState();
  nodesLayer.innerHTML = '';
  nodes = [];
  connections = [];
  drawConnections();
}
