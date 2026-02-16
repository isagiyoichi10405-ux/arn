document.addEventListener("DOMContentLoaded", () => {

  /* -------------------------------
     Helper: normalize names
  --------------------------------*/
  function normalize(str) {
    if (!str) return "";
    return str.replace(/\s+/g, "_").toUpperCase();
  }

  /* -------------------------------
     Campus Map
  --------------------------------*/
  const campusMap = {
    ENTRY: { x: -4, y: 2 },
    B8: { x: 0, y: 0 },
    B7: { x: 2, y: 0 },
    B6: { x: 4, y: 0 },
    B5: { x: 6, y: 0 },
    B4: { x: 8, y: 0 },
    B3: { x: 10, y: 0 },
    ADMIN_BLOCK: { x: 10, y: 2 },
    B1: { x: 0, y: 4 },
    B2: { x: 2, y: 4 },
    B9: { x: 4, y: 4 },
    B10: { x: 6, y: 4 },
    B11: { x: 8, y: 4 },
    B0: { x: 10, y: 4 },
    GIRLS_HOSTEL: { x: 12, y: 2 },
    BOYS_HOSTEL: { x: 4, y: 6 }
  };

  /* -------------------------------
     Graph
  --------------------------------*/
  const graph = {
    ENTRY: ["R0"],
    R0: ["ENTRY", "R1", "R2"],
    R1: ["R0", "R15", "R2", "R3"],
    R2: ["R0", "R1", "R15", "R14"],
    R3: ["B8", "R1", "R15", "R16", "R4"],
    R4: ["B7", "R3", "R16", "R17", "R5"],
    R5: ["B6", "R4", "R17", "R6"],
    R6: ["B5", "R5", "R18", "R7"],
    R7: ["B4", "R6", "R18", "R8"],
    R8: ["B3", "R7", "R19"],
    R19: ["ADMIN_BLOCK", "R8", "R9"],
    R9: ["B0", "R21", "R19", "R10"],
    R21: ["GIRLS_HOSTEL", "R9"],
    R10: ["B11", "R9", "R18", "R11"],
    R11: ["B10", "R10", "R18", "R12"],
    R12: ["B9", "R11", "R17", "R13", "R20"],
    R20: ["BOYS_HOSTEL", "R17", "R12", "R13"],
    R13: ["B2", "R17", "R12", "R16", "R14", "R20"],
    R14: ["B1", "R13", "R16", "R15", "R2"],
    R15: ["R1", "R3", "R2", "R14"],
    R16: ["R3", "R4", "R14", "R13"],
    R17: ["R4", "R5", "R13", "R12", "R20"],
    R18: ["R6", "R7", "R11", "R10"],
    B8: ["R3"],
    B7: ["R4"],
    B6: ["R5"],
    B5: ["R6"],
    B4: ["R7"],
    B3: ["R8"],
    B0: ["R9"],
    B11: ["R10"],
    B10: ["R11"],
    B9: ["R12"],
    B2: ["R13"],
    B1: ["R14"],
    ADMIN_BLOCK: ["R19"],
    GIRLS_HOSTEL: ["R21"],
    BOYS_HOSTEL: ["R20"]
  };

  /* -------------------------------
     BFS shortest path
  --------------------------------*/
  function shortestPath(graph, start, end) {
    if (!graph[start] || !graph[end]) return null;
    const queue = [start];
    const visited = new Set([start]);
    const parent = {};
    while (queue.length) {
      const current = queue.shift();
      if (current === end) break;
      for (const n of graph[current] || []) {
        if (!visited.has(n)) {
          visited.add(n);
          parent[n] = current;
          queue.push(n);
        }
      }
    }
    if (!visited.has(end)) return null;
    const path = [];
    let node = end;
    while (node) {
      path.push(node);
      node = parent[node];
    }
    return path.reverse();
  }

  /* -------------------------------
     State Management
  --------------------------------*/
  const mainContainer = document.querySelector(".main-container");
  const arScene = document.querySelector("a-scene");
  const arOverlay = document.getElementById("arOverlay");
  const infoText = document.getElementById("infoText");
  const arrow = document.getElementById("directionArrow");
  const locText = document.getElementById("locText");
  const destinationInput = document.getElementById("destinationInput");
  const startBtn = document.getElementById("startBtn");

  let path = [];
  let currentIndex = 0;
  let currentLoc = "";

  function showSearch() {
    mainContainer.style.display = "flex";
    arScene.style.display = "none";
    arOverlay.style.display = "none";
  }

  function showAR() {
    mainContainer.style.display = "none";
    arScene.style.display = "block";
    arOverlay.style.display = "block";
    updateNavigation();
  }

  function updateNavigation() {
    if (currentIndex >= path.length - 1) {
      infoText.innerText = "🚩 Arrived at " + path[path.length - 1];
      arrow.setAttribute("visible", "false");
      return;
    }

    const currentNode = path[currentIndex];
    const nextNode = path[currentIndex + 1];
    infoText.innerText = `${currentNode} → ${nextNode}`;

    const currentPos = campusMap[currentNode];
    const nextPos = campusMap[nextNode];

    if (!currentPos || !nextPos) {
      currentIndex++;
      updateNavigation();
      return;
    }

    const dx = nextPos.x - currentPos.x;
    const dy = nextPos.y - currentPos.y;
    const angle = Math.atan2(dx, -dy) * (180 / Math.PI);

    arrow.setAttribute("rotation", `0 ${angle} 0`);
    arrow.setAttribute("visible", "true");
  }

  /* -------------------------------
     Initialization
  --------------------------------*/
  const params = new URLSearchParams(window.location.search);
  const rawLocation = params.get("loc");

  if (rawLocation) {
    currentLoc = normalize(rawLocation);
    if (campusMap[currentLoc]) {
      locText.innerText = currentLoc;
    }
  }

  startBtn.addEventListener("click", () => {
    const destination = normalize(destinationInput.value);
    if (!campusMap[destination]) {
      alert("❌ Block not found");
      return;
    }
    if (!currentLoc) {
      alert("❌ Start location not detected (Scan QR)");
      return;
    }

    path = shortestPath(graph, currentLoc, destination);
    if (path) {
      currentIndex = 0;
      showAR();
    }
  });

  // Handle AR click to progress
  window.addEventListener("click", (e) => {
    if (arScene.style.display === "block" && e.target.tagName !== "BUTTON") {
      currentIndex++;
      updateNavigation();
    }
  });

  // Back button handling is in HTML via inline onclick calls to global functions
  window.goSearch = showSearch;

  // Initial Visibility
  showSearch();
});
