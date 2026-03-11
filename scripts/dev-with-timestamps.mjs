#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import path from "node:path";

const args = process.argv.slice(2);
const nextBin =
  process.platform === "win32"
    ? path.resolve("node_modules", ".bin", "next.cmd")
    : path.resolve("node_modules", ".bin", "next");

const child = spawn(nextBin, ["dev", ...args], {
  stdio: ["inherit", "pipe", "pipe"],
  env: { ...process.env, FORCE_COLOR: "1" },
});

function pad(value) {
  return String(value).padStart(2, "0");
}

function timestamp() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours(),
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function streamWithPrefix(stream, writer, label) {
  const rl = createInterface({ input: stream });
  rl.on("line", (line) => {
    writer.write(`[${timestamp()}] ${label} ${line}\n`);
  });
}

streamWithPrefix(child.stdout, process.stdout, "[dev]");
streamWithPrefix(child.stderr, process.stderr, "[err]");

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

