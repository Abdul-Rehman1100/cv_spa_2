(() => {
  "use strict";

  const W = 960;
  const H = 600;
  const PORTRAIT_W = 600;
  const PORTRAIT_H = 960;
  const canvas = document.getElementById("world");
  const ctx = canvas.getContext("2d");
  const data = window.CV_DATA;
  const keys = new Set();
  const discovered = new Set();
  let portraitLayout = window.innerHeight > window.innerWidth;
  const player = portraitLayout
    ? { x: 300, y: 160, facing: "down", moving: false, step: 0 }
    : { x: 480, y: 395, facing: "down", moving: false, step: 0 };
  const pressedTouch = new Set();
  const solids = [
    { x: 44, y: 136, w: 42, h: 42 }, { x: 872, y: 142, w: 42, h: 42 },
    { x: 72, y: 320, w: 30, h: 75 }, { x: 860, y: 225, w: 30, h: 68 },
    { x: 406, y: 107, w: 34, h: 28 }, { x: 526, y: 107, w: 34, h: 28 },
    { x: 424, y: 548, w: 36, h: 28 }, { x: 500, y: 548, w: 36, h: 28 },
    { x: 144, y: 207, w: 100, h: 43 }, { x: 315, y: 177, w: 100, h: 62 },
    { x: 619, y: 180, w: 100, h: 61 }, { x: 761, y: 306, w: 92, h: 67 },
    { x: 143, y: 367, w: 159, h: 61 }, { x: 434, y: 470, w: 92, h: 79 }
  ];
  const portraitSolids = [
    { x: 98, y: 303, w: 100, h: 63 }, { x: 400, y: 303, w: 100, h: 63 },
    { x: 98, y: 448, w: 100, h: 63 }, { x: 400, y: 448, w: 92, h: 80 },
    { x: 100, y: 596, w: 160, h: 58 }, { x: 400, y: 603, w: 100, h: 63 },
    { x: 264, y: 813, w: 72, h: 68 }, { x: 36, y: 204, w: 42, h: 42 },
    { x: 522, y: 210, w: 42, h: 42 }, { x: 30, y: 543, w: 32, h: 70 },
    { x: 538, y: 700, w: 32, h: 70 }
  ];
  const $ = (id) => document.getElementById(id);
  const prompt = $("nearby-prompt");
  const promptLabel = $("nearby-label");
  let running = false;
  let lastTime = 0;
  let activeDestination = null;
  let currentPanel = null;
  let currentPage = 0;
  let previousFocus = null;
  let playerNearby = null;
  let elapsed = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    const nextPortrait = window.innerHeight > window.innerWidth;
    if (nextPortrait !== portraitLayout) {
      portraitLayout = nextPortrait;
      player.x = portraitLayout ? PORTRAIT_W / 2 : W / 2;
      player.y = portraitLayout ? 160 : 395;
      keys.clear();
      pressedTouch.clear();
    }
    const sceneWidth = portraitLayout ? PORTRAIT_W : W;
    const sceneHeight = portraitLayout ? PORTRAIT_H : H;
    const scale = Math.min(window.innerWidth / sceneWidth, window.innerHeight / sceneHeight);
    const offsetX = (window.innerWidth - sceneWidth * scale) / 2;
    const offsetY = (window.innerHeight - sceneHeight * scale) / 2;
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offsetX * dpr, offsetY * dpr);
    ctx.imageSmoothingEnabled = false;
  }

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function line(x1, y1, x2, y2, color, width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function text(value, x, y, color, size = 8, align = "center") {
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.font = `500 ${size}px "DM Mono", Consolas, monospace`;
    ctx.fillText(value, x, y);
  }

  function drawWorld() {
    if (portraitLayout) drawPortraitWorld();
    else drawLandscapeWorld();
  }

  function drawPortraitWorld() {
    const sky = ctx.createLinearGradient(0, 0, 0, 170);
    sky.addColorStop(0, "#260914");
    sky.addColorStop(1, "#591027");
    rect(0, 0, PORTRAIT_W, PORTRAIT_H, "#451023");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, PORTRAIT_W, 152);
    for (let i = 0; i < 32; i++) {
      const x = (i * 181 + 37) % PORTRAIT_W;
      const y = (i * 67 + 19) % 115;
      ctx.globalAlpha = .4 + .3 * Math.sin(elapsed * 1.3 + i * 2);
      rect(x, y, i % 7 === 0 ? 3 : 2, i % 7 === 0 ? 3 : 2, i % 4 === 0 ? "#FF8FA3" : "#FFDDE3");
    }
    ctx.globalAlpha = 1;
    rect(0, 125, PORTRAIT_W, 28, "#380B1A");
    for (let i = 0; i < 6; i++) {
      const x = i * 106 - 10;
      const height = 22 + (i * 17 % 36);
      rect(x, 125 - height, 68, height, i % 2 ? "#3C0B1C" : "#470C20");
      for (let wx = x + 12; wx < x + 60; wx += 18) rect(wx, 108 - height, 5, 6, "#8B2B45");
    }
    rect(0, 153, PORTRAIT_W, 807, "#451023");
    for (let y = 160; y < PORTRAIT_H; y += 42) {
      for (let x = (y % 2 ? -28 : 0); x < PORTRAIT_W; x += 58) {
        rect(x, y, 55, 39, (x + y) % 3 ? "#501328" : "#54162D");
        line(x, y + 39, x + 55, y + 39, "#3E0D20", 2);
        line(x + 55, y, x + 55, y + 39, "#3E0D20", 2);
      }
    }

    rect(255, 145, 90, 815, "#67203A");
    rect(0, 306, PORTRAIT_W, 66, "#67203A");
    rect(0, 448, PORTRAIT_W, 66, "#67203A");
    rect(0, 592, PORTRAIT_W, 67, "#67203A");
    rect(0, 736, PORTRAIT_W, 66, "#67203A");
    rect(0, 812, PORTRAIT_W, 69, "#67203A");
    for (const y of [306, 448, 592, 736, 812]) {
      rect(0, y + 8, PORTRAIT_W, 2, "#873049");
      rect(0, y + 56, PORTRAIT_W, 2, "#873049");
    }
    rect(255, 148, 3, 812, "rgba(255,179,193,.08)");
    rect(342, 148, 3, 812, "rgba(255,179,193,.08)");
    for (let y = 174; y < 940; y += 61) rect(296, y, 8, 18, "#994057");

    rect(199, 157, 202, 59, "#300A18");
    rect(206, 164, 188, 45, "#421025");
    rect(214, 172, 172, 2, "#FF4D6D");
    text("QARSHI / DEV CAMPUS", 300, 184, "#FFB3C1", 8);
    text("WELCOME, EXPLORER", 300, 198, "#FF758F", 6);
    rect(226, 217, 8, 24, "#871F3C");
    rect(366, 217, 8, 24, "#871F3C");

    drawDesk(104, 306, "PRINT / SAFE", "#FF758F");
    drawDesk(400, 306, "SCHEDULE", "#FFB3C1");
    drawDesk(104, 451, "COURSE / DB", "#FF758F");
    drawArcade(405, 449);
    drawEducationPortrait();
    drawDesk(400, 602, "SKILLS / LAB", "#FFB3C1");
    drawPortalPortrait();
    drawPlantersPortrait();
    text("PROJECT LAB", 300, 291, "rgba(255,204,213,.55)", 7);
    text("BUILD / LEARN / REPEAT", 300, 575, "rgba(255,204,213,.45)", 6);
    text("LAHORE, PAKISTAN", 300, 916, "rgba(255,204,213,.5)", 7);
    drawStations();
    drawPlayer();
  }

  function drawEducationPortrait() {
    rect(104, 601, 154, 8, "#35101E");
    rect(110, 563, 142, 39, "#77203B");
    rect(117, 569, 128, 27, "#36101E");
    rect(122, 574, 118, 17, "#8C3150");
    text("STUDY CORNER", 181, 580, "#FFF0F3", 7);
    text("QARSHI UNIVERSITY", 181, 589, "#FFB3C1", 5);
    rect(125, 600, 6, 18, "#63203A");
    rect(231, 600, 6, 18, "#63203A");
  }

  function drawPortalPortrait() {
    const glow = .38 + .17 * Math.sin(elapsed * 2);
    ctx.globalAlpha = glow;
    ctx.fillStyle = "#FF4D6D";
    ctx.beginPath();
    ctx.ellipse(300, 845, 55, 45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    rect(256, 802, 88, 79, "#8C2040");
    rect(262, 808, 76, 67, "#FF4D6D");
    rect(268, 814, 64, 61, "#451024");
    rect(274, 820, 52, 55, "#C9184A");
    rect(280, 826, 40, 49, "#FF758F");
    rect(286, 832, 28, 43, "#590D22");
    rect(292, 838, 16, 37, "#FFB3C1");
    text("CONTACT", 300, 891, "#FFCCD5", 6);
  }

  function drawPlantersPortrait() {
    for (const [x, y] of [[42, 270], [535, 278], [44, 690], [532, 721], [37, 862], [540, 876]]) {
      rect(x, y + 13, 23, 16, "#801F3A");
      rect(x + 3, y + 7, 17, 12, "#1F382F");
      rect(x + 4, y + 3, 7, 9, "#356047");
      rect(x + 12, y, 8, 11, "#477653");
      rect(x + 8, y + 7, 5, 4, "#FF758F");
    }
  }

  function drawLandscapeWorld() {
    const sky = ctx.createLinearGradient(0, 0, 0, 192);
    sky.addColorStop(0, "#260914");
    sky.addColorStop(1, "#591027");
    rect(0, 0, W, H, "#240913");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, 195);

    for (let i = 0; i < 54; i++) {
      const x = (i * 181 + 37) % W;
      const y = (i * 67 + 19) % 147;
      const pulse = .38 + .35 * Math.sin(elapsed * 1.3 + i * 2);
      ctx.globalAlpha = pulse;
      rect(x, y, i % 7 === 0 ? 3 : 2, i % 7 === 0 ? 3 : 2, i % 4 === 0 ? "#FF8FA3" : "#FFDDE3");
    }
    ctx.globalAlpha = 1;
    rect(0, 154, W, 42, "#380B1A");
    rect(0, 190, W, 11, "#8E2540");
    rect(0, 201, W, 4, "#FF4D6D");

    for (let i = 0; i < 9; i++) {
      const x = i * 118 - 12;
      const bh = 35 + (i * 17 % 42);
      rect(x, 154 - bh, 75, bh, i % 2 ? "#3C0B1C" : "#470C20");
      for (let wx = x + 12; wx < x + 65; wx += 18) {
        for (let wy = 160 - bh; wy < 151; wy += 16) {
          if ((wx + wy + i) % 3 !== 0) rect(wx, wy, 5, 7, (wx + wy) % 2 ? "#A73550" : "#752039");
        }
      }
    }

    rect(0, 205, W, H - 205, "#451023");
    for (let y = 211; y < H; y += 43) {
      for (let x = (y % 2 ? -32 : 0); x < W; x += 64) {
        rect(x, y, 61, 40, (x + y) % 3 ? "#501328" : "#54162D");
        line(x, y + 40, x + 61, y + 40, "#3E0D20", 2);
        line(x + 61, y, x + 61, y + 40, "#3E0D20", 2);
      }
    }

    drawPath();
    drawPlanters();
    drawWelcomeGate();
    drawWorkstations();
    drawEducationBoard();
    drawPortal();
    drawDecor();
    drawStations();
    drawPlayer();
  }

  function drawPath() {
    rect(431, 196, 98, 404, "#67203A");
    rect(0, 338, W, 78, "#67203A");
    rect(0, 354, W, 2, "#873049");
    rect(0, 398, W, 2, "#873049");
    rect(454, 199, 3, 398, "rgba(255,179,193,.08)");
    rect(503, 199, 3, 398, "rgba(255,179,193,.08)");
    for (let x = 26; x < W; x += 78) rect(x, 375, 22, 3, "#994057");
    for (let y = 223; y < H; y += 63) rect(476, y, 4, 20, "#994057");
    rect(398, 330, 164, 93, "#751A38");
    rect(406, 337, 148, 79, "#8B2543");
    rect(414, 345, 132, 63, "#68203A");
    rect(423, 353, 116, 46, "#51172E");
    rect(435, 362, 90, 29, "#8F2B49");
  }

  function drawPlanters() {
    const plants = [
      [34, 212], [104, 221], [830, 215], [920, 223], [106, 525], [845, 520],
      [304, 145], [649, 145], [280, 533], [655, 533]
    ];
    for (const [x, y] of plants) {
      rect(x, y + 13, 23, 16, "#801F3A");
      rect(x + 3, y + 7, 17, 12, "#1F382F");
      rect(x + 4, y + 3, 7, 9, "#356047");
      rect(x + 12, y, 8, 11, "#477653");
      rect(x + 8, y + 7, 5, 4, "#FF758F");
      rect(x + 2, y + 14, 21, 3, "#AA3B56");
    }
  }

  function drawWelcomeGate() {
    rect(377, 86, 206, 75, "#300A18");
    rect(385, 93, 190, 62, "#67142F");
    rect(391, 99, 178, 50, "#421025");
    rect(400, 107, 160, 2, "#FF4D6D");
    text("QARSHI / DEV CAMPUS", 480, 119, "#FFB3C1", 9);
    text("WELCOME, EXPLORER", 480, 136, "#FF758F", 7);
    rect(396, 152, 8, 46, "#871F3C");
    rect(556, 152, 8, 46, "#871F3C");
    rect(408, 155, 16, 43, "#320B1B");
    rect(536, 155, 16, 43, "#320B1B");
    rect(415, 160, 2, 35, "#FF4D6D");
    rect(543, 160, 2, 35, "#FF4D6D");
  }

  function drawWorkstations() {
    drawDesk(150, 216, "PRINT / SAFE", "#FF758F");
    drawDesk(321, 187, "SCHEDULE", "#FFB3C1");
    drawDesk(625, 190, "COURSE / DB", "#FF758F");
    drawArcade(766, 300);
  }

  function drawDesk(x, y, label, glow) {
    rect(x - 6, y + 37, 100, 8, "#31101C");
    rect(x, y + 17, 88, 23, "#72203B");
    rect(x + 4, y + 20, 80, 18, "#8E2B49");
    rect(x + 20, y - 10, 48, 30, "#30101C");
    rect(x + 23, y - 7, 42, 23, "#29111D");
    rect(x + 26, y - 4, 36, 17, "#811C3D");
    rect(x + 29, y - 1, 30, 11, "#FF4D6D");
    rect(x + 34, y + 2, 20, 2, "#FFDCE3");
    rect(x + 33, y + 6, 24, 2, "#FFB3C1");
    rect(x + 8, y + 22, 9, 10, "#48142A");
    rect(x + 70, y + 22, 10, 10, "#48142A");
    ctx.globalAlpha = .14;
    rect(x + 23, y - 8, 42, 25, glow);
    ctx.globalAlpha = 1;
    text(label, x + 44, y + 51, "#FFB3C1", 7);
  }

  function drawArcade(x, y) {
    rect(x - 5, y + 64, 92, 9, "#31101C");
    rect(x, y + 6, 82, 59, "#741A38");
    rect(x + 6, y + 12, 70, 47, "#A32C4B");
    rect(x + 12, y + 18, 58, 31, "#310E1D");
    rect(x + 16, y + 22, 50, 23, "#5B1831");
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      rect(x + 20 + i * 14, y + 25 + j * 6, 9, 4, (i + j) % 2 ? "#FF758F" : "#C9184A");
    }
    rect(x + 19, y + 52, 11, 3, "#FFCCD5");
    rect(x + 54, y + 52, 11, 3, "#FF4D6D");
    text("BOT ARCADE", x + 41, y + 81, "#FFB3C1", 7);
  }

  function drawEducationBoard() {
    rect(135, 414, 174, 8, "#35101E");
    rect(143, 367, 159, 49, "#77203B");
    rect(150, 373, 145, 37, "#36101E");
    rect(156, 378, 133, 27, "#8C3150");
    text("STUDY CORNER", 222, 386, "#FFF0F3", 8);
    text("QARSHI UNIVERSITY", 222, 398, "#FFB3C1", 6);
    rect(160, 409, 6, 19, "#63203A");
    rect(279, 409, 6, 19, "#63203A");
  }

  function drawPortal() {
    const glow = .38 + .17 * Math.sin(elapsed * 2);
    ctx.globalAlpha = glow;
    ctx.fillStyle = "#FF4D6D";
    ctx.beginPath();
    ctx.ellipse(480, 515, 57, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    rect(434, 470, 92, 79, "#8C2040");
    rect(440, 476, 80, 72, "#FF4D6D");
    rect(446, 482, 68, 66, "#451024");
    rect(452, 488, 56, 60, "#C9184A");
    rect(458, 494, 44, 54, "#FF758F");
    rect(464, 500, 32, 48, "#590D22");
    rect(470, 506, 20, 42, "#FFB3C1");
    rect(476, 512, 8, 36, "#FFF0F3");
    text("CONTACT", 480, 564, "#FFCCD5", 7);
  }

  function drawDecor() {
    // Low walls and small campus details frame the walkable paths.
    rect(115, 292, 100, 5, "#7D2640");
    rect(745, 210, 93, 5, "#7D2640");
    rect(113, 294, 5, 35, "#742039");
    rect(210, 294, 5, 35, "#742039");
    rect(743, 212, 5, 40, "#742039");
    rect(834, 212, 5, 40, "#742039");
    rect(38, 470, 40, 4, "#81213E");
    rect(880, 452, 42, 4, "#81213E");
    rect(28, 475, 6, 28, "#6D1B36");
    rect(82, 475, 6, 28, "#6D1B36");
    rect(872, 457, 6, 28, "#6D1B36");
    rect(925, 457, 6, 28, "#6D1B36");
    text("BUILD / LEARN / REPEAT", 480, 229, "rgba(255,204,213,.38)", 7);
    text("L A H O R E", 480, 583, "rgba(255,204,213,.44)", 7);
  }

  function drawStations() {
    for (const destination of data.destinations) {
      const nearby = playerNearby && playerNearby.id === destination.id;
      const found = discovered.has(destination.id);
      const { x, y } = destinationPosition(destination);
      if (nearby) {
        const pulse = 15 + Math.sin(elapsed * 5) * 2;
        ctx.strokeStyle = "rgba(255,117,143,.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (found) {
        ctx.fillStyle = "#FF4D6D";
        ctx.beginPath();
        ctx.arc(x + 15, y - 15, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!["printsafe", "timetable", "course", "tictactoe", "education", "contact"].includes(destination.id)) {
        const color = nearby ? "#FFF0F3" : "#FFB3C1";
        text(destination.icon, x, y, color, 12);
      }
    }
  }

  function drawPlayer() {
    const x = Math.round(player.x);
    const y = Math.round(player.y);
    const bob = player.moving ? Math.sin(player.step * 13) * 1.8 : Math.sin(elapsed * 2) * .8;
    const py = Math.round(y + bob);
    const movingFrame = player.moving && Math.floor(player.step * 9) % 2 === 0;
    rect(x - 8, py + 13, 16, 3, "rgba(22,4,12,.45)");
    rect(x - 6, py - 10, 12, 16, "#30101E");
    rect(x - 5, py - 13, 10, 10, "#E4A58F");
    rect(x - 6, py - 15, 12, 5, "#2A101A");
    rect(x - 7, py - 12, 3, 6, "#2A101A");
    rect(x - 3, py - 8, 2, 2, "#590D22");
    rect(x + 2, py - 8, 2, 2, "#590D22");
    rect(x - 7, py - 2, 14, 10, "#800F2F");
    rect(x - 6, py - 1, 12, 8, "#C9184A");
    rect(x - 3, py + 1, 6, 2, "#FFB3C1");
    rect(x - 8, py, 2, 7, "#E4A58F");
    rect(x + 6, py, 2, 7, "#E4A58F");
    rect(x - 5 + (movingFrame ? 2 : 0), py + 8, 4, 5, "#26101A");
    rect(x + 1 + (movingFrame ? -2 : 0), py + 8, 4, 5, "#26101A");
    rect(x - 6, py - 16, 12, 2, "#FF758F");
  }

  function overlapsSolid(x, y) {
    const radius = 7;
    const activeSolids = portraitLayout ? portraitSolids : solids;
    return activeSolids.some((solid) =>
      x + radius > solid.x && x - radius < solid.x + solid.w &&
      y + radius > solid.y && y - radius < solid.y + solid.h
    );
  }

  function destinationPosition(destination) {
    return portraitLayout ? destination.portrait : destination;
  }

  function update(dt) {
    let dx = 0;
    let dy = 0;
    if (keys.has("ArrowLeft") || keys.has("a") || pressedTouch.has("left")) dx -= 1;
    if (keys.has("ArrowRight") || keys.has("d") || pressedTouch.has("right")) dx += 1;
    if (keys.has("ArrowUp") || keys.has("w") || pressedTouch.has("up")) dy -= 1;
    if (keys.has("ArrowDown") || keys.has("s") || pressedTouch.has("down")) dy += 1;
    const length = Math.hypot(dx, dy);
    player.moving = length > 0;
    if (length) {
      dx /= length;
      dy /= length;
      player.step += dt;
      if (Math.abs(dx) > Math.abs(dy)) player.facing = dx < 0 ? "left" : "right";
      else player.facing = dy < 0 ? "up" : "down";
      const speed = 140 * dt;
      const sceneWidth = portraitLayout ? PORTRAIT_W : W;
      const sceneHeight = portraitLayout ? PORTRAIT_H : H;
      const minY = portraitLayout ? 130 : 214;
      const nextX = Math.max(19, Math.min(sceneWidth - 19, player.x + dx * speed));
      const nextY = Math.max(minY, Math.min(sceneHeight - 19, player.y + dy * speed));
      if (!overlapsSolid(nextX, player.y)) player.x = nextX;
      if (!overlapsSolid(player.x, nextY)) player.y = nextY;
    }
    playerNearby = null;
    let minDistance = 49;
    for (const destination of data.destinations) {
      const position = destinationPosition(destination);
      const distance = Math.hypot(player.x - position.x, player.y - position.y);
      if (distance < minDistance) {
        playerNearby = destination;
        minDistance = distance;
      }
    }
    if (playerNearby) {
      prompt.hidden = false;
      promptLabel.textContent = `Inspect ${playerNearby.label}`;
    } else {
      prompt.hidden = true;
    }
  }

  function frame(time) {
    const dt = Math.min((time - lastTime) / 1000 || 0, .04);
    lastTime = time;
    elapsed += dt;
    if (running && $("panel-backdrop").hidden && $("map-backdrop").hidden) update(dt);
    else {
      player.moving = false;
      prompt.hidden = true;
    }
    drawWorld();
    requestAnimationFrame(frame);
  }

  function setDiscoveryCount() {
    const count = `${discovered.size} / ${data.destinations.length}`;
    $("discovery-count").textContent = `${count} DISCOVERED`;
    $("map-discovery-count").textContent = count;
  }

  function openPanel(id, focusFrom = document.activeElement) {
    const panel = data.panels[id];
    if (!panel) return;
    closeMap(false);
    currentPanel = panel;
    currentPage = 0;
    previousFocus = focusFrom;
    activeDestination = id;
    discovered.add(id);
    playerNearby = null;
    prompt.hidden = true;
    keys.clear();
    pressedTouch.clear();
    $("panel-icon").textContent = panel.icon;
    $("panel-category").textContent = panel.category;
    $("panel-title").textContent = panel.title;
    $("panel-backdrop").hidden = false;
    renderPanelPage();
    setDiscoveryCount();
    $("close-panel").focus();
    $("game-announcer").textContent = `${panel.title} opened.`;
  }

  function renderPanelPage() {
    $("panel-content").innerHTML = currentPanel.pages[currentPage];
    const pageTotal = currentPanel.pages.length;
    $("page-count").textContent = `${String(currentPage + 1).padStart(2, "0")} / ${String(pageTotal).padStart(2, "0")}`;
    $("panel-count").textContent = String(data.destinations.findIndex((item) => item.id === activeDestination) + 1).padStart(2, "0");
    $("prev-page").disabled = currentPage === 0;
    $("next-page").disabled = currentPage >= pageTotal - 1;
    const dots = $("page-dots");
    dots.replaceChildren();
    for (let i = 0; i < pageTotal; i++) {
      const dot = document.createElement("i");
      if (i === currentPage) dot.classList.add("active");
      dots.appendChild(dot);
    }
  }

  function closePanel(restore = true) {
    if ($("panel-backdrop").hidden) return;
    $("panel-backdrop").hidden = true;
    currentPanel = null;
    keys.clear();
    if (restore && previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    else canvas.focus?.();
    $("game-announcer").textContent = "Returned to the game world.";
  }

  function openMap() {
    if (!$("panel-backdrop").hidden) return;
    previousFocus = document.activeElement;
    keys.clear();
    pressedTouch.clear();
    prompt.hidden = true;
    $("map-backdrop").hidden = false;
    renderDestinations();
    $("close-map").focus();
  }

  function closeMap(restore = true) {
    if ($("map-backdrop").hidden) return;
    $("map-backdrop").hidden = true;
    if (restore && previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  }

  function renderDestinations() {
    const list = $("destination-list");
    list.replaceChildren();
    data.destinations.forEach((destination) => {
      const button = document.createElement("button");
      button.className = "destination-button";
      button.type = "button";
      button.innerHTML = `<span class="destination-icon" aria-hidden="true">${destination.icon}</span><span class="destination-name">${destination.name}</span><span class="destination-arrow" aria-hidden="true">↗</span>`;
      button.addEventListener("click", () => openPanel(destination.id, $("map-button")));
      list.appendChild(button);
    });
  }

  function interact() {
    if (!running || !playerNearby || !$("panel-backdrop").hidden || !$("map-backdrop").hidden) return;
    openPanel(playerNearby.id);
  }

  function startGame() {
    running = true;
    $("start-screen").classList.add("is-hidden");
    $("start-button").blur();
    canvas.focus?.();
  }

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    const panelOpen = !$("panel-backdrop").hidden;
    const mapOpen = !$("map-backdrop").hidden;
    if (key === "tab" && (panelOpen || mapOpen)) {
      const dialog = panelOpen ? $("info-panel") : document.querySelector(".map-panel");
      const focusable = Array.from(dialog.querySelectorAll('button:not([disabled]), a[href]'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (first && (!dialog.contains(document.activeElement) ||
        (event.shiftKey && document.activeElement === first) ||
        (!event.shiftKey && document.activeElement === last))) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
      return;
    }
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key) && running && !panelOpen && !mapOpen) event.preventDefault();
    if (key === "escape") {
      if (panelOpen) closePanel();
      else if (mapOpen) closeMap();
      return;
    }
    if ((key === "e" || key === "enter") && !panelOpen && !mapOpen) {
      if (document.activeElement?.closest?.("button, a")) return;
      event.preventDefault();
      interact();
      return;
    }
    if ((key === "m" || key === "tab") && !panelOpen && !mapOpen && running) {
      event.preventDefault();
      openMap();
      return;
    }
    if (panelOpen && (key === "arrowright" || key === "arrowleft")) {
      event.preventDefault();
      changePage(key === "arrowright" ? 1 : -1);
      return;
    }
    if (!panelOpen && !mapOpen && running && ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) keys.add(key);
  }

  function handleKeyUp(event) {
    keys.delete(event.key.toLowerCase());
  }

  function changePage(delta) {
    if (!currentPanel) return;
    currentPage = Math.max(0, Math.min(currentPanel.pages.length - 1, currentPage + delta));
    renderPanelPage();
  }

  $("start-button").addEventListener("click", startGame);
  $("map-button").addEventListener("click", openMap);
  $("close-panel").addEventListener("click", () => closePanel());
  $("close-map").addEventListener("click", () => closeMap());
  $("prev-page").addEventListener("click", () => changePage(-1));
  $("next-page").addEventListener("click", () => changePage(1));
  $("touch-interact").addEventListener("click", interact);
  $("panel-backdrop").addEventListener("click", (event) => {
    if (event.target === $("panel-backdrop")) closePanel();
  });
  $("map-backdrop").addEventListener("click", (event) => {
    if (event.target === $("map-backdrop")) closeMap();
  });
  document.querySelectorAll(".dpad button").forEach((button) => {
    const direction = button.dataset.dir;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      pressedTouch.add(direction);
    });
    const release = () => pressedTouch.delete(direction);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  });
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", () => { keys.clear(); pressedTouch.clear(); });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => { if (document.hidden) keys.clear(); });
  resize();
  setDiscoveryCount();
  requestAnimationFrame(frame);
})();
