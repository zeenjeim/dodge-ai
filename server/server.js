const { WebSocketServer } = require('ws');
const http = require('http');

const PORT = process.env.PORT || 1999;
const UPGRADE_INTERVAL = 15; // seconds between upgrade rounds
const COUNTDOWN_SECONDS = 3;
const REVEAL_DURATION_MS = 5000;
const PICK_TIMEOUT_MS = 30000;

// Room storage
const rooms = new Map();

function freshRoom(id) {
  return {
    id,
    players: new Map(), // ws -> PlayerState
    phase: 'lobby',
    upgradeRound: 0,
    picksReceived: new Map(),
    winner: null,
    rematchVotes: new Set(),
    timers: [],
  };
}

function clearRoomTimers(room) {
  for (const t of room.timers) clearTimeout(t);
  room.timers = [];
}

function addTimer(room, fn, ms) {
  const t = setTimeout(fn, ms);
  room.timers.push(t);
  return t;
}

function getPlayerIds(room) {
  return [...room.players.keys()];
}

function getOpponent(room, ws) {
  for (const [k] of room.players) {
    if (k !== ws) return k;
  }
  return null;
}

function sendTo(ws, msg) {
  if (ws.readyState === 1) ws.send(JSON.stringify(msg));
}

function broadcast(room, msg) {
  const data = JSON.stringify(msg);
  for (const [ws] of room.players) {
    if (ws.readyState === 1) ws.send(data);
  }
}

function cleanupRoom(room) {
  clearRoomTimers(room);
  rooms.delete(room.id);
}

function handleJoin(ws, roomId) {
  // Create or get room
  if (!rooms.has(roomId)) {
    rooms.set(roomId, freshRoom(roomId));
  }
  const room = rooms.get(roomId);

  if (room.players.size >= 2) {
    sendTo(ws, { type: 'room_full' });
    return;
  }

  // Assign player
  const playerState = { ready: false, alive: true, gameTime: 0 };
  room.players.set(ws, playerState);
  ws._room = room;
  ws._playerState = playerState;

  // Assign player number for display
  const playerNum = room.players.size;
  ws._playerNum = playerNum;

  sendTo(ws, {
    type: 'room_state',
    roomId: room.id,
    playerCount: room.players.size,
    phase: room.phase,
    yourNum: playerNum,
  });

  // Notify others
  broadcast(room, { type: 'player_joined', playerCount: room.players.size });
}

function handleReady(ws) {
  const room = ws._room;
  if (!room || room.phase !== 'lobby') return;

  ws._playerState.ready = true;
  broadcast(room, { type: 'player_ready', playerCount: room.players.size });

  // Check if both ready
  if (room.players.size === 2) {
    let allReady = true;
    for (const [, state] of room.players) {
      if (!state.ready) { allReady = false; break; }
    }
    if (allReady) startCountdown(room);
  }
}

function startCountdown(room) {
  room.phase = 'countdown';
  let seconds = COUNTDOWN_SECONDS;

  function tick() {
    broadcast(room, { type: 'countdown', seconds });
    seconds--;
    if (seconds > 0) {
      addTimer(room, tick, 1000);
    } else {
      addTimer(room, () => startGame(room), 1000);
    }
  }
  tick();
}

function startGame(room) {
  room.phase = 'playing';
  room.upgradeRound = 0;
  room.winner = null;

  for (const [, state] of room.players) {
    state.alive = true;
    state.gameTime = 0;
  }

  broadcast(room, { type: 'start' });
  scheduleUpgradeFreeze(room);
}

function scheduleUpgradeFreeze(room) {
  addTimer(room, () => {
    if (room.phase !== 'playing') return;
    room.upgradeRound++;
    room.phase = 'upgrading';
    room.picksReceived = new Map();

    broadcast(room, { type: 'upgrade_freeze', round: room.upgradeRound });

    // Timeout for picks
    addTimer(room, () => {
      if (room.phase === 'upgrading') doRevealAndResume(room);
    }, PICK_TIMEOUT_MS);
  }, UPGRADE_INTERVAL * 1000);
}

function handleUpgradePick(ws, pick) {
  const room = ws._room;
  if (!room || room.phase !== 'upgrading') return;

  room.picksReceived.set(ws, pick);

  // Check if both players picked
  const alivePlayers = [...room.players.entries()].filter(([, s]) => s.alive);
  const allPicked = alivePlayers.every(([w]) => room.picksReceived.has(w));
  if (allPicked) doRevealAndResume(room);
}

function doRevealAndResume(room) {
  if (room.phase !== 'upgrading') return;
  room.phase = 'reveal';

  const alivePlayers = [...room.players.entries()].filter(([, s]) => s.alive);

  for (const [ws] of alivePlayers) {
    const opponent = getOpponent(room, ws);
    const opponentPick = opponent ? room.picksReceived.get(opponent) : null;
    const myPick = room.picksReceived.get(ws) || null;

    if (opponentPick) {
      sendTo(ws, { type: 'upgrade_reveal', yourPick: myPick, opponentPick });
    }
  }

  addTimer(room, () => {
    room.phase = 'playing';
    broadcast(room, { type: 'resume' });
    scheduleUpgradeFreeze(room);
  }, REVEAL_DURATION_MS);
}

function handleDeath(ws, gameTime) {
  const room = ws._room;
  if (!room) return;
  if (room.phase !== 'playing' && room.phase !== 'upgrading') return;

  ws._playerState.alive = false;
  ws._playerState.gameTime = gameTime;

  const opponent = getOpponent(room, ws);
  if (opponent) {
    room.winner = opponent;
    room.phase = 'gameover';
    clearRoomTimers(room);
    sendTo(ws, { type: 'you_lose', yourTime: gameTime });
    sendTo(opponent, { type: 'you_win', opponentTime: gameTime });
  }
}

function handleRematch(ws) {
  const room = ws._room;
  if (!room) return;

  room.rematchVotes.add(ws);
  const needed = room.players.size;
  broadcast(room, { type: 'rematch_vote', count: room.rematchVotes.size, needed });

  if (room.rematchVotes.size >= needed && needed === 2) {
    room.phase = 'lobby';
    room.rematchVotes = new Set();
    room.picksReceived = new Map();
    room.winner = null;
    room.upgradeRound = 0;
    clearRoomTimers(room);

    for (const [, state] of room.players) {
      state.ready = false;
      state.alive = true;
      state.gameTime = 0;
    }

    broadcast(room, { type: 'rematch_start' });
  }
}

function handleReverseUno(ws, pick) {
  const room = ws._room;
  if (!room) return;
  const opponent = getOpponent(room, ws);
  if (opponent && pick) {
    sendTo(opponent, { type: 'debuff_reversed', pick });
  }
}

function handleDisconnect(ws) {
  const room = ws._room;
  if (!room) return;

  const wasPlaying = room.phase === 'playing' || room.phase === 'upgrading';
  room.players.delete(ws);
  room.rematchVotes.delete(ws);

  broadcast(room, { type: 'player_left', playerCount: room.players.size });

  if (wasPlaying) {
    const remaining = [...room.players.keys()][0];
    if (remaining) {
      room.phase = 'gameover';
      clearRoomTimers(room);
      sendTo(remaining, { type: 'you_win', opponentTime: 0 });
    }
  }

  if (room.players.size === 0) {
    cleanupRoom(room);
  } else {
    room.phase = 'lobby';
  }
}

// HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify({ status: 'ok', rooms: rooms.size }));
  } else {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    });
    res.end('Dodge AI Multiplayer Server');
  }
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  // Extract room ID from URL path: /room/XXXXX
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(Boolean);

  if (pathParts[0] === 'room' && pathParts[1]) {
    const roomId = pathParts[1].toUpperCase();
    handleJoin(ws, roomId);
  } else {
    sendTo(ws, { type: 'error', message: 'Invalid room path. Use /room/ROOMCODE' });
    ws.close();
    return;
  }

  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }

    switch (msg.type) {
      case 'ready': handleReady(ws); break;
      case 'upgrade_pick': handleUpgradePick(ws, msg.pick); break;
      case 'died': handleDeath(ws, msg.gameTime); break;
      case 'rematch': handleRematch(ws); break;
      case 'reverse_uno': handleReverseUno(ws, msg.pick); break;
      case 'leave': ws.close(); break;
    }
  });

  ws.on('close', () => handleDisconnect(ws));
});

server.listen(PORT, () => {
  console.log(`Dodge AI Multiplayer Server running on port ${PORT}`);
});
