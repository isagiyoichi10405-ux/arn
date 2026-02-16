document.addEventListener("DOMContentLoaded", () => {

  /* -------------------------------
     Helper: normalize names
  --------------------------------*/
  function normalize(str) {
    return str.replace(/\s+/g, "_").toUpperCase();
  }

  /* -------------------------------
     Campus Map
  --------------------------------*/
  const campusMap = {
    ENTRY:{x:-4,y:2},
    B8:  { x: 0, y: 0 },
    B7:  { x: 2, y: 0 },
    B6:  { x: 4, y: 0 },
    B5:  { x: 6, y: 0 },
    B4:  { x: 8, y: 0 },
    B3:  { x: 10, y: 0 },

    ADMIN_BLOCK: { x: 10, y: 2 },

    B1:  { x: 0, y: 4 },
    B2: { x: 2, y: 4 },
    B9:  { x: 4, y: 4 },
    B10:  { x: 6, y: 4 },
    B11:  { x: 8, y: 4 },
    B0: { x: 10, y: 4 },

    GIRLS_HOSTEL: { x: 12, y: 2 },
    BOYS_HOSTEL:  { x: 4, y: 6 }
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
    R13: ["B2", "R17", "R12", "R16", "R14","R20"],
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
     STEP 1: Current location
  --------------------------------*/
  const params = new URLSearchParams(window.location.search);
  const rawLocation = params.get("loc");

  if (!rawLocation) {
    alert("❌ Location not detected.");
    return;
  }

  const currentLocation = normalize(rawLocation);

  if (!campusMap[currentLocation]) {
    alert("❌ Invalid QR location: " + currentLocation);
    return;
  }

  document.getElementById("locText").innerText = currentLocation;

  /* -------------------------------
     STEP 2: Destination
  --------------------------------*/
  const input = document.getElementById("destinationInput");
  const button = document.getElementById("startBtn");


  button.addEventListener("click", () => {
    const destination = normalize(input.value);

    if (!campusMap[destination]) {
      alert("❌ Block not found");
      return;
    }

    const path = shortestPath(graph, currentLocation, destination);
    console.log("🛣️ Path:", path);
localStorage.setItem("path", JSON.stringify(path));


  
  });

});
