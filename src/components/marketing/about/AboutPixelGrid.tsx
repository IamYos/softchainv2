"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/usePrefersReducedMotion";
import gridStyles from "@/components/marketing/sf/SFPostFrame.module.css";
import styles from "./AboutPixelGrid.module.css";

const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 12;
const TICK_MS = 110;
const PLAN_LENGTH = 42;
const SCRIPT_SEEDS = [11, 23, 37, 41, 53, 67] as const;

type CellTone = 0 | 1 | 2;
type PieceKey = "I" | "J" | "L" | "O" | "S" | "T" | "Z";
type Phase = "idle" | "falling" | "lock" | "clear" | "resolve" | "complete";
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

function createEmptyBoard() {
  return Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }, () => 0);
}

function createIdleGame(): GameState {
  return {
    active: null,
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
  const bounds = getPieceBounds(step);
  const centeredX = Math.floor((BOARD_WIDTH - (bounds.maxX + 1)) / 2);

  return {
    ...step,
    x: Math.max(0, Math.min(centeredX, BOARD_WIDTH - (bounds.maxX + 1))),
    y: -bounds.maxY - 2,
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

function evaluateBoard(board: readonly number[], clearedRows: number) {
  const heights = getColumnHeights(board);
  const aggregateHeight = heights.reduce((sum, value) => sum + value, 0);
  const bumpiness = heights.reduce(
    (sum, value, index) => (index === 0 ? sum : sum + Math.abs(value - heights[index - 1])),
    0,
  );
  const holes = getHoleCount(board);
  const filledCells = board.reduce((sum, cell) => sum + cell, 0);

  return (
    clearedRows * 1400 +
    filledCells * 1.2 -
    aggregateHeight * 9 -
    holes * 72 -
    bumpiness * 4.5
  );
}

function findBestPlacement(board: readonly number[], key: PieceKey): Placement | null {
  let bestPlacement: Placement | null = null;
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
      const score = evaluateBoard(clearedBoard, clearedRows.length);

      if (!bestPlacement || score > bestPlacement.score) {
        bestPlacement = {
          ...candidateStep,
          board: clearedBoard,
          clearedRows,
          score,
        };
      }
    }
  }

  return bestPlacement;
}

function buildScript(seed: number) {
  const queue = createPieceQueue(seed, PLAN_LENGTH);
  const steps: ScriptStep[] = [];
  let board = createEmptyBoard();

  for (const key of queue) {
    const placement = findBestPlacement(board, key);

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

const SCRIPT_LIBRARY = SCRIPT_SEEDS.map((seed) => buildScript(seed));

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
    flashCells: [],
    flashRows: [],
    phase: "falling",
    resolveCells: [],
    resolveProgress: 0,
    scriptIndex: 0,
    settled: createEmptyBoard(),
  };
}

function tickGame(state: GameState, scriptId: number): GameState {
  const script = SCRIPT_LIBRARY[scriptId];

  if (state.phase === "idle" || state.phase === "complete") {
    return state;
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

function getRenderableCells(state: GameState) {
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
    if (prefersReducedMotion || !isActive || game.phase === "idle" || game.phase === "complete") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setGame((current) => tickGame(current, scriptId));
    }, TICK_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [game.phase, isActive, prefersReducedMotion, scriptId]);

  const gameToRender = prefersReducedMotion ? REDUCED_MOTION_GAME : game;
  const renderableCells = getRenderableCells(gameToRender);

  return (
    <div ref={rootRef} className={gridStyles.techStackGrid} aria-label="Autoplay Tetris field">
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
