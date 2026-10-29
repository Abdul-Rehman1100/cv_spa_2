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
  const checkpointLatch = new Set();
  let portraitLayout = window.innerHeight > window.innerWidth;
  const player = { x: 100, y: 0, speed: 0, moving: false, step: 0 };
  const pressedTouch = new Set();
  const solids = [
    { x: 44, y: 136, w: 42, h: 42 }, { x: 872, y: 142, w: 42, h: 42 },
    { x: 72, y: 320, w: 30, h: 75 }, { x: 860, y: 225, w: 30, h: 68 },
    { x: 406, y: 107, w: 34, h: 28 }, { x: 526, y: 107, w: 34, h: 28 },
    { x: 424, y: 548, w: 36, h: 28 }, { x: 500, y: 548, w: 36, h: 28 },
    { x: 144, y: 207, w: 100, h: 43 }, { x: 315, y: 177, w: 100, h: 62 },
    { x: 619, y: 180, w: 100, h: 61 }, { x: 761, y: 306, w: 92, h: 67 },
    { x: 143, y: 367, w: 159, h: 61 }, { x: 434, y: 470, w: 92, h: 79 },
    { x: 670, y: 410, w: 100, h: 62 }
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
  let activeStopKey = null;
  let elapsed = 0;
  let overlayDriving = false;
  let copyReveal = 1;
  const checkpointSpacing = .42;
  const routeStops = data.destinations.flatMap((destination) =>
    data.panels[destination.id].pages.map((_, pageIndex) => ({
      key: `${destination.id}:${pageIndex}`,
      destination,
      pageIndex
    }))
  );
  const aspectRatio = () => window.innerWidth / Math.max(1, window.innerHeight);
  const sceneWidth = () => aspectRatio() > W / H ? H * aspectRatio() : W;
  const sceneHeight = () => aspectRatio() > W / H ? H : W / aspectRatio();
  const roadWidth = () => sceneWidth() * (.45 + (routeStops.length - 1) * checkpointSpacing + .7);
  const groundY = (x) => sceneHeight() * .73 + Math.sin(x * .006) * sceneHeight() * .035 + Math.sin(x * .014 + 1) * sceneHeight() * .018;
  const cameraX = () => Math.max(0, Math.min(roadWidth() - sceneWidth(), player.x - sceneWidth() * .34));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    const nextPortrait = window.innerHeight > window.innerWidth;
    if (nextPortrait !== portraitLayout) {
      portraitLayout = nextPortrait;
      player.x = Math.max(35, player.x);
      player.y = groundY(player.x) - 24;
      keys.clear();
      pressedTouch.clear();
    }
    const worldW = sceneWidth();
    const worldH = sceneHeight();
    const scale = Math.min(window.innerWidth / worldW, window.innerHeight / worldH);
    const offsetX = (window.innerWidth - worldW * scale) / 2;
    const offsetY = (window.innerHeight - worldH * scale) / 2;
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
    ctx.font = `600 ${size}px "Oxanium", "Cascadia Code", Consolas, monospace`;
    ctx.fillText(value, x, y);
  }

  function drawWorld() {
    drawDrivingWorld();
  }

  function drawDrivingWorld() {
    const sw = sceneWidth();
    const sh = sceneHeight();
    const camera = cameraX();
    const sky = ctx.createLinearGradient(0, 0, 0, sh);
    sky.addColorStop(0, "#250817");
    sky.addColorStop(.58, "#7d183a");
    sky.addColorStop(1, "#f08086");
    rect(0, 0, sw, sh, "#210713");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, sw, sh);
    // Pixel stars and layered distant hills create a side-scrolling arcade backdrop.
    for (let i = 0; i < 50; i++) {
      const x = ((i * 181 + 37 - camera * .18) % sw + sw) % sw;
      const y = (i * 67 + 19) % Math.floor(sh * .38);
      ctx.globalAlpha = .45 + .35 * Math.sin(elapsed + i);
      rect(x, y, i % 8 === 0 ? 3 : 2, i % 8 === 0 ? 3 : 2, i % 3 === 0 ? "#FFB3C1" : "#FFF0F3");
    }
    ctx.globalAlpha = 1;
    drawCheckpointCopy(sw, sh);
    for (let layer = 0; layer < 2; layer++) {
      ctx.beginPath();
      ctx.moveTo(0, sh);
      for (let sx = -20; sx <= sw + 20; sx += 20) {
        const wx = sx + camera * (layer ? .24 : .12);
        const hy = sh * (.57 + layer * .08) + Math.sin(wx * (layer ? .005 : .003) + layer) * sh * .055;
        ctx.lineTo(sx, hy);
      }
      ctx.lineTo(sw, sh); ctx.closePath();
      ctx.fillStyle = layer ? "#451024" : "#351020"; ctx.fill();
    }
    ctx.save();
    ctx.translate(-camera, 0);
    ctx.beginPath();
    ctx.moveTo(0, sh);
    for (let x = Math.floor(camera / 8) * 8; x <= camera + sw + 16; x += 8) ctx.lineTo(x, groundY(x));
    ctx.lineTo(camera + sw, sh); ctx.closePath();
    ctx.fillStyle = "#52142b"; ctx.fill();
    ctx.beginPath();
    for (let x = Math.floor(camera / 8) * 8; x <= camera + sw + 16; x += 8) {
      const y = groundY(x);
      if (x === Math.floor(camera / 8) * 8) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#ff758f"; ctx.lineWidth = 4; ctx.stroke();
    for (let x = Math.floor(camera / 48) * 48; x < camera + sw + 48; x += 48) {
      const y = groundY(x);
      rect(x, y + 22, 25, 5, "rgba(255,179,193,.18)");
    }
    drawRoadside();
    drawStations();
    drawPlayer();
    ctx.restore();
    // Fixed arcade HUD stays readable while the terrain scrolls beneath it.
    rect(0, sh - 6, sw, 6, "#260817");
  }

  function drawCheckpointCopy(sw, sh) {
    if (!currentPanel || $("panel-backdrop").hidden || !$("info-panel").classList.contains("canvas-reading")) return;
    const reveal = Math.max(0, Math.min(1, copyReveal));
    if (reveal <= 0) return;
    const activeStop = routeStops.find((stop) => stop.key === activeStopKey);
    const activeStopX = activeStop ? destinationPosition(activeStop).x : null;
    const passedBy = activeStopX === null ? 0 : Math.max(0, player.speed < -1 ? activeStopX - player.x : player.x - activeStopX);
    const fadeStart = sw * .03;
    const fadeLength = sw * .18;
    const departureFade = activeStopX === null ? 1 : Math.max(0, Math.min(1, 1 - Math.max(0, passedBy - fadeStart) / fadeLength));
    if (departureFade <= 0) return;
    const category = $("panel-category").textContent.trim();
    const title = $("panel-title").textContent.trim();
    const scratch = document.createElement("div");
    scratch.innerHTML = $("panel-content").innerHTML
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<\/b>/gi, " — ")
      .replace(/<\/(strong|span)>/gi, " ")
      .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n");
    const paragraphs = (scratch.textContent || "").split(/\n+/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
    const left = sw * .115;
    const maxWidth = sw * .77;
    const displayScale = Math.min(window.innerWidth / sw, window.innerHeight / sh);
    const lift = (1 - reveal) * 34;
    ctx.save();
    ctx.globalAlpha = reveal * departureFade;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(20,4,12,.42)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#ff8aa1";
    ctx.font = `600 ${Math.max(12, 12 / displayScale)}px "DM Mono", Consolas, monospace`;
    ctx.fillText(category.toUpperCase(), left, sh * .105 + lift);
    ctx.fillStyle = "#fff0f3";
    ctx.font = `700 ${Math.max(36, Math.min(80, 52 / displayScale))}px "Space Grotesk", "Segoe UI", sans-serif`;
    ctx.fillText(title, left, sh * .16 + lift, maxWidth);
    ctx.font = `500 ${Math.max(18, Math.min(38, 17 / displayScale))}px "Space Grotesk", "Segoe UI", sans-serif`;
    ctx.fillStyle = "#fff0f3";
    const fontSize = Math.max(18, Math.min(38, 17 / displayScale));
    const lineHeight = fontSize * 1.55;
    const maxLines = Math.max(2, Math.floor((sh * .56 - sh * .265) / lineHeight));
    let lineY = sh * .265 + lift;
    let linesDrawn = 0;
    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/);
      let lineText = "";
      for (const word of words) {
        const candidate = lineText ? `${lineText} ${word}` : word;
        if (ctx.measureText(candidate).width > maxWidth && lineText) {
          ctx.fillText(lineText, left, lineY, maxWidth);
          lineY += lineHeight;
          linesDrawn++;
          lineText = word;
          if (linesDrawn >= maxLines) break;
        } else lineText = candidate;
      }
      if (linesDrawn >= maxLines) break;
      if (lineText) {
        ctx.fillText(lineText, left, lineY, maxWidth);
        lineY += lineHeight;
        linesDrawn++;
      }
      if (linesDrawn >= maxLines) break;
      lineY += lineHeight * .28;
    }
    ctx.restore();
  }

  function drawRoadside() {
    if (cameraX() < 210) {
      const y = groundY(85);
      rect(36, y - 84, 10, 84, "#590d22");
      rect(124, y - 84, 10, 84, "#590d22");
      rect(36, y - 91, 98, 34, "#800f2f");
      rect(41, y - 86, 88, 22, "#ff758f");
      text("START", 85, y - 71, "#fff0f3", 12);
      rect(43, y + 5, 12, 12, "#ffb3c1");
      rect(55, y + 5, 12, 12, "#590d22");
      rect(67, y + 5, 12, 12, "#ffb3c1");
      rect(79, y + 5, 12, 12, "#590d22");
      rect(91, y + 5, 12, 12, "#ffb3c1");
      rect(103, y + 5, 12, 12, "#590d22");
      rect(115, y + 5, 12, 12, "#ffb3c1");
    }
    for (let i = 0; i < Math.ceil(roadWidth() / 185); i++) {
      const x = 80 + i * 185;
      if (x < cameraX() - 40 || x > cameraX() + sceneWidth() + 40) continue;
      const y = groundY(x);
      rect(x - 4, y - 22, 8, 22, "#68162f");
      rect(x - 14, y - 39, 28, 19, "#a52a4a");
      rect(x - 9, y - 35, 18, 11, "#ffb3c1");
    }
    const finishX = roadWidth() - 42;
    if (finishX > cameraX() - 40 && finishX < cameraX() + sceneWidth() + 40) {
      const y = groundY(finishX);
      rect(finishX - 5, y - 98, 10, 98, "#590d22");
      rect(finishX - 48, y - 105, 96, 31, "#800f2f");
      rect(finishX - 43, y - 100, 86, 21, "#ff758f");
      text("FINISH", finishX, y - 86, "#fff0f3", 12);
      rect(finishX - 16, y + 5, 8, 13, "#ffb3c1");
      rect(finishX, y + 5, 8, 13, "#590d22");
      rect(finishX + 8, y + 5, 8, 13, "#ffb3c1");
    }
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
    text("QARSHI / DEV CAMPUS", 300, 184, "#FFB3C1", 11);
    text("WELCOME, EXPLORER", 300, 198, "#FF758F", 9);
    rect(226, 217, 8, 24, "#871F3C");
    rect(366, 217, 8, 24, "#871F3C");

    drawDesk(104, 306, "PROJECT LAB", "#FF758F");
    drawDesk(400, 306, "GOALS / BOARD", "#FFB3C1");
    drawDesk(104, 451, "CODE / NOTES", "#FF758F");
    drawWebGallery(405, 449);
    drawEducationPortrait();
    drawDesk(400, 602, "SKILLS / LAB", "#FFB3C1");
    drawPortalPortrait();
    drawPlantersPortrait();
    text("PROJECT LAB", 300, 291, "rgba(255,204,213,.85)", 11);
    text("BUILD / LEARN / REPEAT", 300, 575, "rgba(255,204,213,.75)", 10);
    text("LAHORE, PAKISTAN", 300, 916, "rgba(255,204,213,.85)", 10);
    drawStations();
    drawPlayer();
  }

  function drawEducationPortrait() {
    rect(104, 601, 154, 8, "#35101E");
    rect(110, 563, 142, 39, "#77203B");
    rect(117, 569, 128, 27, "#36101E");
    rect(122, 574, 118, 17, "#8C3150");
    text("STUDY CORNER", 181, 580, "#FFF0F3", 10);
    text("QARSHI UNIVERSITY", 181, 589, "#FFB3C1", 8);
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
    text("CONTACT", 300, 891, "#FFCCD5", 10);
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
    text("QARSHI / DEV CAMPUS", 480, 119, "#FFB3C1", 11);
    text("WELCOME, EXPLORER", 480, 136, "#FF758F", 9);
    rect(396, 152, 8, 46, "#871F3C");
    rect(556, 152, 8, 46, "#871F3C");
    rect(408, 155, 16, 43, "#320B1B");
    rect(536, 155, 16, 43, "#320B1B");
    rect(415, 160, 2, 35, "#FF4D6D");
    rect(543, 160, 2, 35, "#FF4D6D");
  }

  function drawWorkstations() {
    drawDesk(150, 216, "PROJECT LAB", "#FF758F");
    drawDesk(321, 187, "GOALS / BOARD", "#FFB3C1");
    drawDesk(625, 190, "CODE / NOTES", "#FF758F");
    drawWebGallery(766, 300);
    drawDesk(680, 413, "SKILLS / LAB", "#FFB3C1");
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
    text(label, x + 44, y + 51, "#FFCCD5", 12);
  }

  function drawWebGallery(x, y) {
    rect(x - 5, y + 64, 92, 9, "#31101C");
    rect(x, y + 6, 82, 59, "#741A38");
    rect(x + 6, y + 12, 70, 47, "#A32C4B");
    rect(x + 12, y + 18, 58, 31, "#310E1D");
    rect(x + 12, y + 18, 58, 5, "#FF758F");
    rect(x + 16, y + 26, 22, 16, "#FF4D6D");
    rect(x + 41, y + 26, 25, 3, "#FFCCD5");
    rect(x + 41, y + 32, 21, 2, "#FF8FA3");
    rect(x + 41, y + 37, 24, 2, "#A86A7A");
    rect(x + 16, y + 46, 49, 3, "#FFB3C1");
    rect(x + 16, y + 52, 36, 3, "#C9184A");
    text("MY WEBSITES", x + 41, y + 81, "#FFCCD5", 11);
  }

  function drawEducationBoard() {
    rect(135, 414, 174, 8, "#35101E");
    rect(143, 367, 159, 49, "#77203B");
    rect(150, 373, 145, 37, "#36101E");
    rect(156, 378, 133, 27, "#8C3150");
    text("STUDY CORNER", 222, 386, "#FFF0F3", 11);
    text("QARSHI UNIVERSITY", 222, 398, "#FFB3C1", 9);
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
    text("CONTACT", 480, 564, "#FFCCD5", 11);
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
    text("BUILD / LEARN / REPEAT", 480, 229, "rgba(255,204,213,.75)", 10);
    text("L A H O R E", 480, 583, "rgba(255,204,213,.8)", 10);
  }

  function drawStations() {
    for (const stop of routeStops) {
      const { destination, pageIndex } = stop;
      const nearby = playerNearby?.key === stop.key;
      const found = discovered.has(destination.id);
      const { x, y } = destinationPosition(stop);
      if (pageIndex > 0) {
        const pulse = nearby ? 9 + Math.sin(elapsed * 5) * 1.5 : 7;
        ctx.fillStyle = found ? "#ffb3c1" : "#8a2c48";
        ctx.shadowColor = nearby ? "#FF4D6D" : "transparent";
        ctx.shadowBlur = nearby ? 12 : 0;
        ctx.beginPath(); ctx.arc(x, y - 34, pulse, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff0f3";
        ctx.font = '600 10px "Oxanium", "Cascadia Code", Consolas, monospace';
        ctx.textAlign = "center";
        ctx.fillText(String(pageIndex + 1).padStart(2, "0"), x, y - 31);
        continue;
      }
      if (nearby) {
        const pulse = 17 + Math.sin(elapsed * 5) * 2;
        ctx.strokeStyle = "rgba(255,117,143,.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowColor = "#FF4D6D";
        ctx.shadowBlur = 12;
      }
      const label = destination.name.toUpperCase();
      const labelSize = Math.max(12, Math.min(28, 14 / (window.innerWidth / sceneWidth())));
      ctx.font = `600 ${labelSize}px "Oxanium", "Cascadia Code", Consolas, monospace`;
      const signWidth = Math.max(138, ctx.measureText(label).width + 28);
      rect(x - signWidth / 2, y - 66, signWidth, 34, nearby ? "#C9184A" : "#5D1730");
      rect(x - signWidth / 2 + 4, y - 62, signWidth - 8, 26, "#8A2C48");
      text(label, x, y - 45, "#FFF0F3", labelSize);
      ctx.shadowBlur = 0;
      if (found) {
        ctx.fillStyle = "#FF4D6D";
        ctx.beginPath();
        ctx.arc(x + 15, y - 15, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawPlayer() {
    const x = player.x;
    const y = groundY(x) - 25;
    player.y = y;
    const tilt = Math.atan2(groundY(x + 10) - groundY(x - 10), 20);
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    const spin = player.moving ? elapsed * 9 : elapsed * 1.2;
    for (const wx of [-21, 20]) {
      ctx.fillStyle = "#210713"; ctx.beginPath(); ctx.arc(wx, 15, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#ffb3c1"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(wx, 15, 6, spin, spin + Math.PI * 1.5); ctx.stroke();
      ctx.fillStyle = "#c9184a"; ctx.beginPath(); ctx.arc(wx, 15, 2, 0, Math.PI * 2); ctx.fill();
    }
    rect(-31, -11, 62, 22, "#590d22"); rect(-26, -16, 46, 13, "#c9184a");
    rect(-8, -28, 21, 15, "#800f2f"); rect(-3, -25, 12, 8, "#ffccd5");
    rect(20, -9, 10, 6, "#ffb3c1"); rect(-29, -7, 7, 7, "#ff4d6d");
    rect(-24, -4, 39, 3, "rgba(255,240,243,.55)");
    ctx.restore();
  }

  function overlapsSolid(x, y) {
    const radius = 7;
    const activeSolids = portraitLayout ? portraitSolids : solids;
    return activeSolids.some((solid) =>
      x + radius > solid.x && x - radius < solid.x + solid.w &&
      y + radius > solid.y && y - radius < solid.y + solid.h
    );
  }

  function destinationPosition(stop) {
    const index = routeStops.indexOf(stop);
    const x = sceneWidth() * .45 + index * sceneWidth() * checkpointSpacing;
    return { x, y: groundY(x) - 25 };
  }

  function update(dt) {
    const forward = keys.has("arrowright") || keys.has("d") || keys.has("arrowup") || keys.has("w") || keys.has(" ") || pressedTouch.has("right") || pressedTouch.has("up");
    const reverse = keys.has("arrowleft") || keys.has("a") || pressedTouch.has("left");
    const brake = keys.has("arrowdown") || keys.has("s") || pressedTouch.has("down");
    const driveDirection = Number(forward) - Number(reverse);
    if (driveDirection) player.speed = Math.max(-190, Math.min(260, player.speed + driveDirection * 300 * dt));
    else player.speed = Math.sign(player.speed) * Math.max(0, Math.abs(player.speed) - 42 * dt);
    if (brake) player.speed = Math.sign(player.speed) * Math.max(0, Math.abs(player.speed) - 420 * dt);
    player.moving = Math.abs(player.speed) > 1;
    if (player.moving) player.step += dt;
    player.x = Math.max(35, Math.min(roadWidth() - 35, player.x + player.speed * dt));
    if (player.x <= 35 || player.x >= roadWidth() - 35) player.speed = 0;
    player.y = groundY(player.x) - 25;
    const activeStop = routeStops.find((stop) => stop.key === activeStopKey);
    if (activeStop && !$("panel-backdrop").hidden) {
      const stopX = destinationPosition(activeStop).x;
      const distancePastStop = player.speed < -1 ? stopX - player.x : player.x - stopX;
      const departureFade = Math.max(0, Math.min(1, 1 - Math.max(0, distancePastStop - sceneWidth() * .03) / (sceneWidth() * .18)));
      if (!$("info-panel").classList.contains("canvas-reading")) $("info-panel").style.opacity = String(departureFade);
      if (distancePastStop > sceneWidth() * .25) closePanel(false);
    }
    playerNearby = null;
    let minDistance = 49;
    for (const stop of routeStops) {
      const { destination, pageIndex } = stop;
      const position = destinationPosition(stop);
      const distance = Math.hypot(player.x - position.x, player.y - position.y);
      if (distance > 130) checkpointLatch.delete(stop.key);
      if (distance < minDistance) {
        playerNearby = stop;
        minDistance = distance;
      }
    }
    if (playerNearby && $("panel-backdrop").hidden) {
      prompt.hidden = false;
      promptLabel.textContent = `Checkpoint · ${playerNearby.destination.name} · ${playerNearby.pageIndex + 1}`;
      if (!checkpointLatch.has(playerNearby.key)) openPanel(playerNearby.destination.id, canvas, playerNearby.pageIndex, playerNearby.key);
    } else {
      prompt.hidden = true;
    }
  }

  function frame(time) {
    const dt = Math.min((time - lastTime) / 1000 || 0, .04);
    lastTime = time;
    elapsed += dt;
    if (running && $("map-backdrop").hidden) {
      update(dt);
      copyReveal = Math.min(1, copyReveal + dt * 2.1);
    }
    else {
      player.moving = false;
      prompt.hidden = true;
    }
    drawWorld();
    requestAnimationFrame(frame);
  }

  function setDiscoveryCount() {
    const count = `${discovered.size} / ${data.destinations.length}`;
    $("discovery-count").textContent = `${count} VISITED`;
    $("map-discovery-count").textContent = count;
  }

  function openPanel(id, focusFrom = document.activeElement, pageIndex = 0, stopKey = null) {
    const panel = data.panels[id];
    if (!panel) return;
    closeMap(false);
    currentPanel = panel;
    currentPage = Math.max(0, Math.min(panel.pages.length - 1, pageIndex));
    overlayDriving = running;
    previousFocus = overlayDriving ? canvas : focusFrom;
    activeDestination = id;
    copyReveal = 0;
    $("info-panel").style.opacity = "";
    discovered.add(id);
    const reachedStop = stopKey || (playerNearby?.destination.id === id ? playerNearby.key : null);
    activeStopKey = reachedStop;
    if (reachedStop) checkpointLatch.add(reachedStop);
    prompt.hidden = true;
    if (!overlayDriving) {
      keys.clear();
      pressedTouch.clear();
    }
    $("panel-icon").textContent = panel.icon;
    $("panel-category").textContent = panel.category;
    $("panel-title").textContent = panel.title;
    $("panel-backdrop").hidden = false;
    $("touch-controls").classList.add("reading");
    $("info-panel").classList.toggle("auto-reading", overlayDriving);
    $("info-panel").setAttribute("aria-modal", String(!overlayDriving));
    $("info-panel").classList.remove("is-revealing");
    void $("info-panel").offsetWidth;
    $("info-panel").classList.add("is-revealing");
    renderPanelPage();
    setDiscoveryCount();
    if (overlayDriving) canvas.focus?.();
    else $("close-panel").focus();
    $("game-announcer").textContent = `${panel.title} opened.`;
  }

  function renderPanelPage() {
    const content = $("panel-content");
    content.classList.remove("page-enter");
    void content.offsetWidth;
    content.innerHTML = currentPanel.pages[currentPage];
    content.classList.add("page-enter");
    $("info-panel").classList.toggle("contact-panel", activeDestination === "contact");
    $("info-panel").classList.toggle("website-panel", activeDestination === "work" || content.querySelector(".website-showcase") !== null);
    $("info-panel").classList.toggle("goals-panel", activeDestination === "goals");
    $("info-panel").classList.toggle("projects-panel", activeDestination === "current");
    const canvasReadable = !content.querySelector("a, button, input, textarea, select, iframe, form");
    $("info-panel").classList.toggle("canvas-reading", overlayDriving && canvasReadable);
    const pageTotal = currentPanel.pages.length;
    $("page-count").textContent = `${String(currentPage + 1).padStart(2, "0")} / ${String(pageTotal).padStart(2, "0")}`;
    $("panel-count").textContent = String(data.destinations.findIndex((item) => item.id === activeDestination) + 1).padStart(2, "0");
    const sectionIndex = data.destinations.findIndex((item) => item.id === activeDestination);
    const previousSection = data.destinations[sectionIndex - 1];
    const nextSection = data.destinations[sectionIndex + 1];
    $("prev-section").disabled = !previousSection;
    $("next-section").disabled = !nextSection;
    $("prev-section-label").textContent = previousSection ? previousSection.name.toUpperCase() : "START";
    $("next-section-label").textContent = nextSection ? nextSection.name.toUpperCase() : "FINISH";
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
    $("touch-controls").classList.remove("reading");
    $("info-panel").classList.remove("auto-reading");
    $("info-panel").classList.remove("canvas-reading");
    $("info-panel").style.opacity = "";
    currentPanel = null;
    activeStopKey = null;
    if (!overlayDriving) keys.clear();
    overlayDriving = false;
    if (restore && previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    else canvas.focus?.();
    $("game-announcer").textContent = "Returned to the game world.";
  }

  function openMap() {
    if (!$("panel-backdrop").hidden) closePanel(false);
    if (!$("map-backdrop").hidden) return;
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
    openPanel(playerNearby.destination.id, document.activeElement, playerNearby.pageIndex, playerNearby.key);
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
    if (key === "tab" && (mapOpen || (panelOpen && !overlayDriving))) {
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
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key) && running && !mapOpen && (!panelOpen || overlayDriving)) event.preventDefault();
    if (key === "escape") {
      if (panelOpen) closePanel();
      else if (mapOpen) closeMap();
      return;
    }
    if (panelOpen && !overlayDriving && (key === "pageup" || key === "pagedown")) {
      event.preventDefault();
      changeSection(key === "pageup" ? -1 : 1);
      return;
    }
    if ((key === "e" || key === "enter") && !panelOpen && !mapOpen) {
      if (document.activeElement?.closest?.("button, a")) return;
      event.preventDefault();
      interact();
      return;
    }
    if ((key === "m" || key === "tab") && !mapOpen && running && (!panelOpen || overlayDriving)) {
      event.preventDefault();
      openMap();
      return;
    }
    if (panelOpen && !overlayDriving && (key === "arrowright" || key === "arrowleft")) {
      event.preventDefault();
      changePage(key === "arrowright" ? 1 : -1);
      return;
    }
    if ((!panelOpen || overlayDriving) && !mapOpen && running && ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " "].includes(key)) keys.add(key);
  }

  function handleKeyUp(event) {
    keys.delete(event.key.toLowerCase());
  }

  function changePage(delta) {
    if (!currentPanel) return;
    currentPage = Math.max(0, Math.min(currentPanel.pages.length - 1, currentPage + delta));
    renderPanelPage();
  }

  function changeSection(delta) {
    const index = data.destinations.findIndex((item) => item.id === activeDestination);
    const next = data.destinations[index + delta];
    if (next) openPanel(next.id, canvas);
  }

  $("start-button").addEventListener("click", startGame);
  $("browse-button").addEventListener("click", () => { startGame(); openMap(); });
  $("map-button").addEventListener("click", openMap);
  $("close-panel").addEventListener("click", () => closePanel());
  $("close-map").addEventListener("click", () => closeMap());
  $("prev-page").addEventListener("click", () => changePage(-1));
  $("next-page").addEventListener("click", () => changePage(1));
  $("prev-section").addEventListener("click", () => changeSection(-1));
  $("next-section").addEventListener("click", () => changeSection(1));
  $("back-to-road").addEventListener("click", () => closePanel());
  $("touch-interact").addEventListener("click", interact);
  $("panel-backdrop").addEventListener("click", (event) => {
    if (event.target === $("panel-backdrop")) closePanel();
  });
  $("map-backdrop").addEventListener("click", (event) => {
    if (event.target === $("map-backdrop")) closeMap();
  });
  $("panel-content").addEventListener("submit", (event) => {
    const form = event.target.closest("#contact-form");
    if (!form) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const name = fields.get("name").toString().trim();
    const email = fields.get("email").toString().trim();
    const message = fields.get("message").toString().trim();
    const subject = `Message from ${name}`;
    const body = `Hi Abdul-Rehman,\n\n${message}\n\nYou can reply to me at: ${email}`;
    window.location.href = `mailto:${data.profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    $("game-announcer").textContent = "Your email draft is ready to open in your email app.";
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
