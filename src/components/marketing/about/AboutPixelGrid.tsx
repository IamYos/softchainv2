"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/usePrefersReducedMotion";
import gridStyles from "@/components/marketing/sf/SFPostFrame.module.css";
import styles from "./AboutPixelGrid.module.css";

const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 12;
const TICK_MS = 55;
const PLAN_LENGTH = 42;
const SCRIPT_SEEDS = [11, 23, 37, 41, 53, 67] as const;
const COMPLETE_HOLD_MS = 900;
const HELLO_HOLD_MS = 2100;
const BINARY_DURATION_MS = 1300;

type CellTone = 0 | 1 | 2;
type PieceKey = "I" | "J" | "L" | "O" | "S" | "T" | "Z";
type Phase =
  | "idle"
  | "falling"
  | "lock"
  | "clear"
  | "resolve"
  | "complete"
  | "hello"
  | "binary";
type Coord = readonly [number, number];

type ScriptStep = {
  key: PieceKey;
  rotation: number;
  targetX: number;
};

type ActivePiece = ScriptStep & {
  x: number;
  y: number;
};

type GameState = {
  active: ActivePiece | null;
  binaryFrame: number;
  flashRows: number[];
  flashCells: number[];
  phase: Phase;
  resolveCells: number[];
  resolveProgress: number;
  scriptIndex: number;
  settled: number[];
};

type Placement = ScriptStep & {
  board: number[];
  clearedRows: number[];
  score: number;
};

const PIECES: Record<PieceKey, readonly Coord[][]> = {
  I: [
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
  ],
  J: [
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [0, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 2],
      [1, 2],
    ],
  ],
  L: [
    [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  ],
  O: [
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  ],
  S: [
    [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  ],
  T: [
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [0, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  ],
  Z: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 2],
    ],
  ],
};

const PIECE_ORDER: readonly PieceKey[] = ["I", "J", "L", "O", "S", "T", "Z"];
const BINARY_GLYPHS = {
  "0": ["111", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "111"],
} as const;

// 3x5 pixel glyphs for the "HELLO WORLD" reveal that sits inside the orange
// completion field. Same dimensions as BINARY_GLYPHS so both phases share a
// typographic rhythm.
const HELLO_GLYPHS = {
  H: ["101", "101", "111", "101", "101"],
  E: ["111", "100", "111", "100", "111"],
  L: ["100", "100", "100", "100", "111"],
  O: ["111", "101", "101", "101", "111"],
  W: ["101", "101", "101", "111", "101"],
  R: ["110", "101", "110", "101", "101"],
  D: ["110", "101", "101", "101", "110"],
} as const;

const HELLO_LINES = ["HELLO", "WORLD"] as const;
type HelloGlyphKey = keyof typeof HELLO_GLYPHS;

function createEmptyBoard() {
  return Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }, () => 0);
}

function buildHelloCells(): CellTone[] {
  const cells: CellTone[] = Array.from(
    { length: BOARD_WIDTH * BOARD_HEIGHT },
    () => 2,
  );
  const glyphWidth = 3;
  const glyphHeight = 5;
  const gapX = 1;
  const rowStarts = [1, 7] as const;

  for (let lineIndex = 0; lineIndex < HELLO_LINES.length; lineIndex += 1) {
    const line = HELLO_LINES[lineIndex];
    const lineWidth = line.length * glyphWidth + (line.length - 1) * gapX;
    const offsetX = Math.floor((BOARD_WIDTH - lineWidth) / 2);
    const offsetY = rowStarts[lineIndex];

    for (let charIndex = 0; charIndex < line.length; charIndex += 1) {
      const glyph = HELLO_GLYPHS[line[charIndex] as HelloGlyphKey];
      const xStart = offsetX + charIndex * (glyphWidth + gapX);

      for (let row = 0; row < glyphHeight; row += 1) {
        for (let column = 0; column < glyphWidth; column += 1) {
          if (glyph[row][column] === "1") {
            cells[toIndex(xStart + column, offsetY + row)] = 0;
          }
        }
      }
    }
  }

  return cells;
}

const HELLO_CELLS = buildHelloCells();

function createIdleGame(): GameState {
  return {
    active: null,
    binaryFrame: 0,
    flashRows: [],
    flashCells: [],
    phase: "idle",
    resolveCells: [],
    resolveProgress: 0,
    scriptIndex: 0,
    settled: createEmptyBoard(),
  };
}

function toIndex(x: number, y: number) {
  return y * BOARD_WIDTH + x;
}

function getPieceCells(piece: ScriptStep) {
  return PIECES[piece.key][piece.rotation % PIECES[piece.key].length];
}

function getPieceBounds(piece: ScriptStep) {
  let maxX = 0;
  let maxY = 0;

  for (const [x, y] of getPieceCells(piece)) {
    if (x > maxX) {
      maxX = x;
    }

    if (y > maxY) {
      maxY = y;
    }
  }

  return { maxX, maxY };
}

function collides(board: readonly number[], piece: ActivePiece) {
  for (const [dx, dy] of getPieceCells(piece)) {
    const x = piece.x + dx;
    const y = piece.y + dy;

    if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) {
      return true;
    }

    if (y >= 0 && board[toIndex(x, y)] !== 0) {
      return true;
    }
  }

  return false;
}

function getPieceIndices(piece: ActivePiece) {
  return getPieceCells(piece)
    .map(([dx, dy]) => ({ x: piece.x + dx, y: piece.y + dy }))
    .filter(({ x, y }) => x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT)
    .map(({ x, y }) => toIndex(x, y));
}

function mergePiece(board: readonly number[], piece: ActivePiece) {
  const next = [...board];

  for (const index of getPieceIndices(piece)) {
    next[index] = 1;
  }

  return next;
}

function getFullRows(board: readonly number[]) {
  const rows: number[] = [];

  for (let row = 0; row < BOARD_HEIGHT; row += 1) {
    const start = row * BOARD_WIDTH;
    const end = start + BOARD_WIDTH;

    if (board.slice(start, end).every((cell) => cell !== 0)) {
      rows.push(row);
    }
  }

  return rows;
}

function clearRows(board: readonly number[], rowsToClear: readonly number[]) {
  if (!rowsToClear.length) {
    return [...board];
  }

  const rowSet = new Set(rowsToClear);
  const remainingRows: number[][] = [];

  for (let row = 0; row < BOARD_HEIGHT; row += 1) {
    if (!rowSet.has(row)) {
      remainingRows.push(board.slice(row * BOARD_WIDTH, (row + 1) * BOARD_WIDTH));
    }
  }

  while (remainingRows.length < BOARD_HEIGHT) {
    remainingRows.unshift(Array.from({ length: BOARD_WIDTH }, () => 0));
  }

  return remainingRows.flat();
}

function createActivePiece(step: ScriptStep): ActivePiece {
  const { maxX, maxY } = getPieceBounds(step);

  return {
    ...step,
    // Spawn directly in the solved lane so the replay cannot drift away
    // from the precomputed winning placement while falling.
    x: Math.max(0, Math.min(step.targetX, BOARD_WIDTH - (maxX + 1))),
    y: -maxY - 2,
  };
}

function findLandingY(board: readonly number[], step: ScriptStep) {
  const { maxY } = getPieceBounds(step);
  let piece: ActivePiece = {
    ...step,
    x: step.targetX,
    y: -maxY - 2,
  };

  if (collides(board, piece)) {
    return null;
  }

  while (true) {
    const dropped = { ...piece, y: piece.y + 1 };

    if (collides(board, dropped)) {
      return piece.y;
    }

    piece = dropped;
  }
}

function seededShuffle<T>(items: readonly T[], seed: number) {
  const result = [...items];
  let state = seed;

  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function createPieceQueue(seed: number, length: number) {
  const queue: PieceKey[] = [];
  let bagSeed = seed;

  while (queue.length < length) {
    queue.push(...seededShuffle(PIECE_ORDER, bagSeed));
    bagSeed += 1;
  }

  return queue.slice(0, length);
}

function getColumnHeights(board: readonly number[]) {
  const heights = Array.from({ length: BOARD_WIDTH }, () => 0);

  for (let column = 0; column < BOARD_WIDTH; column += 1) {
    for (let row = 0; row < BOARD_HEIGHT; row += 1) {
      if (board[toIndex(column, row)] !== 0) {
        heights[column] = BOARD_HEIGHT - row;
        break;
      }
    }
  }

  return heights;
}

function getHoleCount(board: readonly number[]) {
  let holes = 0;

  for (let column = 0; column < BOARD_WIDTH; column += 1) {
    let seenBlock = false;

    for (let row = 0; row < BOARD_HEIGHT; row += 1) {
      const filled = board[toIndex(column, row)] !== 0;

      if (filled) {
        seenBlock = true;
      } else if (seenBlock) {
        holes += 1;
      }
    }
  }

  return holes;
}

// Dellacherie (1996) 6-feature heuristic. Landing height and eroded piece
// cells describe the placement itself; row/column transitions, holes, and
// well sums describe the resulting board. Weights are the canonical values
// reported by Fahey — strong enough on a standard 10x20 field to clear
// millions of lines without lookahead.
const DELLACHERIE_WEIGHTS = {
  landingHeight: -4.500158825082766,
  erodedCells: 3.4181268101392694,
  rowTransitions: -3.2178882868487753,
  columnTransitions: -9.348695305445199,
  holes: -7.899265427351652,
  wells: -3.3855972247263626,
} as const;

// Beam width and discount for the 1-step lookahead in buildScript.
const LOOKAHEAD_BEAM = 6;
const LOOKAHEAD_DISCOUNT = 0.94;

function getLandingHeight(piece: ActivePiece) {
  let minY = BOARD_HEIGHT;

  for (const [, dy] of getPieceCells(piece)) {
    const y = piece.y + dy;
    if (y < minY) {
      minY = y;
    }
  }

  return BOARD_HEIGHT - minY;
}

function getErodedCells(piece: ActivePiece, clearedRows: readonly number[]) {
  if (clearedRows.length === 0) {
    return 0;
  }

  const rowSet = new Set(clearedRows);
  let cells = 0;

  for (const [, dy] of getPieceCells(piece)) {
    if (rowSet.has(piece.y + dy)) {
      cells += 1;
    }
  }

  return clearedRows.length * cells;
}

function getRowTransitions(board: readonly number[]) {
  let transitions = 0;

  for (let row = 0; row < BOARD_HEIGHT; row += 1) {
    let prev = 1;

    for (let column = 0; column < BOARD_WIDTH; column += 1) {
      const cur = board[toIndex(column, row)] !== 0 ? 1 : 0;
      if (cur !== prev) {
        transitions += 1;
      }
      prev = cur;
    }

    if (prev !== 1) {
      transitions += 1;
    }
  }

  return transitions;
}

function getColumnTransitions(board: readonly number[]) {
  let transitions = 0;

  for (let column = 0; column < BOARD_WIDTH; column += 1) {
    let prev = 0;

    for (let row = 0; row < BOARD_HEIGHT; row += 1) {
      const cur = board[toIndex(column, row)] !== 0 ? 1 : 0;
      if (cur !== prev) {
        transitions += 1;
      }
      prev = cur;
    }

    if (prev !== 1) {
      transitions += 1;
    }
  }

  return transitions;
}

function getWellSums(board: readonly number[]) {
  const heights = getColumnHeights(board);
  let sums = 0;

  for (let column = 0; column < BOARD_WIDTH; column += 1) {
    const left = column === 0 ? BOARD_HEIGHT : heights[column - 1];
    const right = column === BOARD_WIDTH - 1 ? BOARD_HEIGHT : heights[column + 1];
    const depth = Math.min(left, right) - heights[column];

    if (depth > 0) {
      sums += (depth * (depth + 1)) / 2;
    }
  }

  return sums;
}

function scorePlacement(
  piece: ActivePiece,
  clearedRows: readonly number[],
  clearedBoard: readonly number[],
) {
  return (
    DELLACHERIE_WEIGHTS.landingHeight * getLandingHeight(piece) +
    DELLACHERIE_WEIGHTS.erodedCells * getErodedCells(piece, clearedRows) +
    DELLACHERIE_WEIGHTS.rowTransitions * getRowTransitions(clearedBoard) +
    DELLACHERIE_WEIGHTS.columnTransitions * getColumnTransitions(clearedBoard) +
    DELLACHERIE_WEIGHTS.holes * getHoleCount(clearedBoard) +
    DELLACHERIE_WEIGHTS.wells * getWellSums(clearedBoard)
  );
}

function collectPlacements(board: readonly number[], key: PieceKey): Placement[] {
  const placements: Placement[] = [];
  const rotations = PIECES[key];

  for (let rotation = 0; rotation < rotations.length; rotation += 1) {
    const step = { key, rotation, targetX: 0 };
    const { maxX } = getPieceBounds(step);

    for (let targetX = 0; targetX <= BOARD_WIDTH - (maxX + 1); targetX += 1) {
      const candidateStep = { key, rotation, targetX };
      const landingY = findLandingY(board, candidateStep);

      if (landingY === null) {
        continue;
      }

      const piece: ActivePiece = { ...candidateStep, x: targetX, y: landingY };
      const merged = mergePiece(board, piece);
      const clearedRows = getFullRows(merged);
      const clearedBoard = clearRows(merged, clearedRows);
      const score = scorePlacement(piece, clearedRows, clearedBoard);

      placements.push({
        ...candidateStep,
        board: clearedBoard,
        clearedRows,
        score,
      });
    }
  }

  return placements;
}

function findBestPlacement(board: readonly number[], key: PieceKey): Placement | null {
  const placements = collectPlacements(board, key);

  if (placements.length === 0) {
    return null;
  }

  let best = placements[0];

  for (let index = 1; index < placements.length; index += 1) {
    if (placements[index].score > best.score) {
      best = placements[index];
    }
  }

  return best;
}

function findBestPlacementWithLookahead(
  board: readonly number[],
  key: PieceKey,
  nextKey: PieceKey | null,
): Placement | null {
  const placements = collectPlacements(board, key);

  if (placements.length === 0) {
    return null;
  }

  if (!nextKey) {
    let best = placements[0];
    for (let index = 1; index < placements.length; index += 1) {
      if (placements[index].score > best.score) {
        best = placements[index];
      }
    }
    return best;
  }

  placements.sort((a, b) => b.score - a.score);
  const beamSize = Math.min(LOOKAHEAD_BEAM, placements.length);

  let best = placements[0];
  let bestCombined = -Infinity;

  for (let index = 0; index < beamSize; index += 1) {
    const candidate = placements[index];
    const follow = findBestPlacement(candidate.board, nextKey);
    const combined =
      candidate.score + (follow ? follow.score : 0) * LOOKAHEAD_DISCOUNT;

    if (combined > bestCombined) {
      bestCombined = combined;
      best = candidate;
    }
  }

  return best;
}

function buildScript(seed: number) {
  const queue = createPieceQueue(seed, PLAN_LENGTH);
  const steps: ScriptStep[] = [];
  let board = createEmptyBoard();

  for (let index = 0; index < queue.length; index += 1) {
    const key = queue[index];
    const nextKey = index + 1 < queue.length ? queue[index + 1] : null;
    const placement = findBestPlacementWithLookahead(board, key, nextKey);

    if (!placement) {
      break;
    }

    steps.push({
      key: placement.key,
      rotation: placement.rotation,
      targetX: placement.targetX,
    });

    board = placement.board;
  }

  return steps;
}

function buildWinningScripts() {
  const scripts: ScriptStep[][] = [];
  let seedIndex = 0;
  let seed = SCRIPT_SEEDS[0];

  while (scripts.length < SCRIPT_SEEDS.length && seedIndex < 240) {
    const script = buildScript(seed);

    if (script.length === PLAN_LENGTH) {
      scripts.push(script);
    }

    seed += 1;
    seedIndex += 1;
  }

  return scripts.length > 0 ? scripts : [buildScript(SCRIPT_SEEDS[0])];
}

const SCRIPT_LIBRARY = buildWinningScripts();

function getResolveCells(board: readonly number[]) {
  const cells: number[] = [];

  for (let row = BOARD_HEIGHT - 1; row >= 0; row -= 1) {
    for (let column = 0; column < BOARD_WIDTH; column += 1) {
      const index = toIndex(column, row);
      if (board[index] === 0) {
        cells.push(index);
      }
    }
  }

  return cells;
}

function startResolve(board: readonly number[], scriptIndex: number): GameState {
  return {
    active: null,
    binaryFrame: 0,
    flashCells: [],
    flashRows: [],
    phase: "resolve",
    resolveCells: getResolveCells(board),
    resolveProgress: 0,
    scriptIndex,
    settled: [...board],
  };
}

function createGame(scriptId: number): GameState {
  const script = SCRIPT_LIBRARY[scriptId];

  if (script.length === 0) {
    return startResolve(createEmptyBoard(), 0);
  }

  return {
    active: createActivePiece(script[0]),
    binaryFrame: 0,
    flashCells: [],
    flashRows: [],
    phase: "falling",
    resolveCells: [],
    resolveProgress: 0,
    scriptIndex: 0,
    settled: createEmptyBoard(),
  };
}

function startBinaryReset(scriptIndex: number): GameState {
  return {
    active: null,
    binaryFrame: 0,
    flashCells: [],
    flashRows: [],
    phase: "binary",
    resolveCells: [],
    resolveProgress: 0,
    scriptIndex,
    settled: createEmptyBoard(),
  };
}

function startHello(scriptIndex: number): GameState {
  return {
    active: null,
    binaryFrame: 0,
    flashCells: [],
    flashRows: [],
    phase: "hello",
    resolveCells: [],
    resolveProgress: 0,
    scriptIndex,
    settled: createEmptyBoard(),
  };
}

function tickGame(state: GameState, scriptId: number): GameState {
  const script = SCRIPT_LIBRARY[scriptId];

  if (state.phase === "idle" || state.phase === "complete") {
    return state;
  }

  if (state.phase === "binary") {
    return {
      ...state,
      binaryFrame: state.binaryFrame + 1,
    };
  }

  if (state.phase === "resolve") {
    const nextProgress = Math.min(state.resolveCells.length, state.resolveProgress + 10);

    if (nextProgress >= state.resolveCells.length) {
      return {
        ...state,
        phase: "complete",
        resolveProgress: nextProgress,
      };
    }

    return {
      ...state,
      resolveProgress: nextProgress,
    };
  }

  if (state.phase === "lock") {
    const nextIndex = state.scriptIndex + 1;

    if (state.flashRows.length > 0) {
      return {
        ...state,
        phase: "clear",
      };
    }

    if (nextIndex >= script.length) {
      return startResolve(state.settled, nextIndex);
    }

    return {
      ...state,
      active: createActivePiece(script[nextIndex]),
      binaryFrame: 0,
      flashCells: [],
      flashRows: [],
      phase: "falling",
      scriptIndex: nextIndex,
    };
  }

  if (state.phase === "clear") {
    const clearedBoard = clearRows(state.settled, state.flashRows);
    const nextIndex = state.scriptIndex + 1;

    if (nextIndex >= script.length) {
      return startResolve(clearedBoard, nextIndex);
    }

    return {
      active: createActivePiece(script[nextIndex]),
      binaryFrame: 0,
      flashCells: [],
      flashRows: [],
      phase: "falling",
      resolveCells: [],
      resolveProgress: 0,
      scriptIndex: nextIndex,
      settled: clearedBoard,
    };
  }

  if (!state.active) {
    return state;
  }

  let nextPiece = state.active;

  if (nextPiece.x !== nextPiece.targetX) {
    const direction = nextPiece.x < nextPiece.targetX ? 1 : -1;
    const shifted = { ...nextPiece, x: nextPiece.x + direction };

    if (!collides(state.settled, shifted)) {
      nextPiece = shifted;
    }
  }

  const dropped = { ...nextPiece, y: nextPiece.y + 1 };
  if (!collides(state.settled, dropped)) {
    return {
      ...state,
      active: dropped,
    };
  }

  const merged = mergePiece(state.settled, nextPiece);
  const fullRows = getFullRows(merged);

  return {
    active: null,
    binaryFrame: 0,
    flashCells: getPieceIndices(nextPiece),
    flashRows: fullRows,
    phase: "lock",
    resolveCells: [],
    resolveProgress: 0,
    scriptIndex: state.scriptIndex,
    settled: merged,
  };
}

function buildCompletedGame(scriptId: number) {
  let state = createGame(scriptId);
  let guard = 0;

  while (state.phase !== "complete" && guard < 6000) {
    state = tickGame(state, scriptId);
    guard += 1;
  }

  return state;
}

const REDUCED_MOTION_GAME = buildCompletedGame(0);

function getBinaryDigits(frame: number, scriptId: number) {
  const digits: Array<"0" | "1"> = [];
  let seed = (SCRIPT_SEEDS[scriptId % SCRIPT_SEEDS.length] + 1) * 7919 + frame * 104729;

  for (let index = 0; index < 10; index += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    digits.push(((seed >> 30) & 1) === 1 ? "1" : "0");
  }

  return digits;
}

function getBinaryCells(frame: number, scriptId: number) {
  const cells = Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }, () => 0 as CellTone);
  const digits = getBinaryDigits(frame, scriptId);
  const rowStarts = [1, 7];
  const digitWidth = 3;
  const digitHeight = 5;
  const gapX = 1;

  for (let digitIndex = 0; digitIndex < digits.length; digitIndex += 1) {
    const rowGroup = digitIndex < 5 ? 0 : 1;
    const columnGroup = digitIndex % 5;
    const glyph = BINARY_GLYPHS[digits[digitIndex]];
    const offsetX = columnGroup * (digitWidth + gapX);
    const offsetY = rowStarts[rowGroup];

    for (let row = 0; row < digitHeight; row += 1) {
      for (let column = 0; column < digitWidth; column += 1) {
        if (glyph[row][column] === "1") {
          cells[toIndex(offsetX + column, offsetY + row)] = 1;
        }
      }
    }
  }

  for (let index = 0; index < 12; index += 1) {
    const x = (frame * 3 + index * 7 + scriptId * 5) % BOARD_WIDTH;
    const y = (frame + index * 5 + scriptId * 3) % BOARD_HEIGHT;
    cells[toIndex(x, y)] = 1;
  }

  return cells;
}

function getRenderableCells(state: GameState) {
  if (state.phase === "binary") {
    return getBinaryCells(state.binaryFrame, state.scriptIndex);
  }

  if (state.phase === "hello") {
    return HELLO_CELLS;
  }

  const cells = state.settled.map<CellTone>((cell) => (cell === 0 ? 0 : 1));

  if (state.active) {
    for (const index of getPieceIndices(state.active)) {
      cells[index] = 1;
    }
  }

  if (state.phase === "lock") {
    for (const index of state.flashCells) {
      cells[index] = 2;
    }
  }

  if (state.phase === "clear") {
    for (const row of state.flashRows) {
      for (let column = 0; column < BOARD_WIDTH; column += 1) {
        cells[toIndex(column, row)] = 2;
      }
    }
  }

  if (state.phase === "resolve" || state.phase === "complete") {
    for (let index = 0; index < cells.length; index += 1) {
      if (cells[index] !== 0) {
        cells[index] = 2;
      }
    }

    for (let index = 0; index < state.resolveProgress; index += 1) {
      cells[state.resolveCells[index]] = 2;
    }
  }

  if (state.phase === "complete") {
    return cells.map(() => 2) as CellTone[];
  }

  return cells;
}

function getToneClass(tone: CellTone) {
  if (tone === 2) {
    return styles.pixelCellOrange;
  }

  if (tone === 1) {
    return styles.pixelCellGray;
  }

  return styles.pixelCellOff;
}

export function AboutPixelGrid() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [scriptId, setScriptId] = useState(0);
  const [game, setGame] = useState<GameState>(() => createIdleGame());
  const [isActive, setIsActive] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const wasInViewRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const root = rootRef.current;
    if (!root) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting && entry.intersectionRatio > 0.38;

        if (inView && !wasInViewRef.current) {
          const nextScriptId = Math.floor(Math.random() * SCRIPT_LIBRARY.length);
          setScriptId(nextScriptId);
          setGame(createGame(nextScriptId));
          setIsActive(true);
        }

        if (!inView) {
          setIsActive(false);
          setGame(createIdleGame());
        }

        wasInViewRef.current = inView;
      },
      {
        threshold: [0.18, 0.38, 0.66],
      },
    );

    observer.observe(root);

    return () => {
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (
      prefersReducedMotion ||
      !isActive ||
      game.phase === "idle" ||
      game.phase === "complete" ||
      game.phase === "hello"
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setGame((current) => tickGame(current, scriptId));
    }, TICK_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [game.phase, isActive, prefersReducedMotion, scriptId]);

  useEffect(() => {
    if (prefersReducedMotion || !isActive || game.phase !== "complete") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setGame((current) =>
        current.phase === "complete" ? startHello(scriptId) : current,
      );
    }, COMPLETE_HOLD_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [game.phase, isActive, prefersReducedMotion, scriptId]);

  useEffect(() => {
    if (prefersReducedMotion || !isActive || game.phase !== "hello") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setGame((current) =>
        current.phase === "hello" ? startBinaryReset(scriptId) : current,
      );
    }, HELLO_HOLD_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [game.phase, isActive, prefersReducedMotion, scriptId]);

  useEffect(() => {
    if (prefersReducedMotion || !isActive || game.phase !== "binary") {
      return;
    }

    const nextScriptId = (scriptId + 1) % SCRIPT_LIBRARY.length;
    const timeoutId = window.setTimeout(() => {
      setScriptId(nextScriptId);
      setGame(createGame(nextScriptId));
    }, BINARY_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [game.phase, isActive, prefersReducedMotion, scriptId]);

  const gameToRender = prefersReducedMotion ? REDUCED_MOTION_GAME : game;
  const renderableCells = getRenderableCells(gameToRender);

  return (
    <div
      ref={rootRef}
      className={`${gridStyles.techStackGrid} ${styles.gridFill}`}
      aria-label="Autoplay Tetris field"
    >
      <div className={styles.stage}>
        <div className={styles.board} aria-hidden="true">
          {renderableCells.map((tone, index) => (
            <span
              key={index}
              className={`${styles.pixelCell} ${getToneClass(tone)}`}
              style={
                {
                  ["--pixel-cell-delay" as string]: `${((index % BOARD_WIDTH) + Math.floor(index / BOARD_WIDTH)) * 0.007}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
