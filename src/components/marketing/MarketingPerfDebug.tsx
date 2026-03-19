"use client";

import {
  Profiler,
  type ProfilerOnRenderCallback,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { getDevFlagsSnapshot, useDevFlags } from "@/components/marketing/useDevFlags";

type ReactSectionMetric = {
  commits: number;
  lastPhase: "mount" | "update" | "nested-update";
  lastActualDuration: number;
  maxActualDuration: number;
  totalActualDuration: number;
  lastCommitAt: number;
};

type SampleMetric = {
  count: number;
  lastDuration: number;
  maxDuration: number;
  totalDuration: number;
};

type PerfSnapshot = {
  fps: number;
  slowFrames: number;
  worstFrameMs: number;
  longTaskCount: number;
  lastLongTaskMs: number;
  maxLongTaskMs: number;
  scrollTop: number;
  sections: Record<string, ReactSectionMetric>;
  samples: Record<string, SampleMetric>;
};

type PerfRecordingPoint = {
  atMs: number;
  snapshot: PerfSnapshot;
};

type PerfRecordingReport = {
  recordedAt: string;
  url: string;
  flags: ReturnType<typeof getDevFlagsSnapshot>;
  summary: PerfSnapshot;
  timeline: PerfRecordingPoint[];
};

const PERF_SNAPSHOT: PerfSnapshot = {
  fps: 0,
  slowFrames: 0,
  worstFrameMs: 0,
  longTaskCount: 0,
  lastLongTaskMs: 0,
  maxLongTaskMs: 0,
  scrollTop: 0,
  sections: {},
  samples: {},
};

const PERF_RECORDING = {
  active: false,
  startedAt: 0,
  timeline: [] as PerfRecordingPoint[],
};

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function cloneSnapshot(): PerfSnapshot {
  return {
    ...PERF_SNAPSHOT,
    sections: { ...PERF_SNAPSHOT.sections },
    samples: { ...PERF_SNAPSHOT.samples },
  };
}

function resetPerfSnapshot() {
  PERF_SNAPSHOT.fps = 0;
  PERF_SNAPSHOT.slowFrames = 0;
  PERF_SNAPSHOT.worstFrameMs = 0;
  PERF_SNAPSHOT.longTaskCount = 0;
  PERF_SNAPSHOT.lastLongTaskMs = 0;
  PERF_SNAPSHOT.maxLongTaskMs = 0;
  PERF_SNAPSHOT.scrollTop = 0;
  PERF_SNAPSHOT.sections = {};
  PERF_SNAPSHOT.samples = {};
}

function startPerfRecording() {
  resetPerfSnapshot();
  PERF_RECORDING.active = true;
  PERF_RECORDING.startedAt = performance.now();
  PERF_RECORDING.timeline = [];
}

function stopPerfRecording() {
  PERF_RECORDING.active = false;
}

function capturePerfRecordingPoint() {
  if (!PERF_RECORDING.active) {
    return;
  }

  PERF_RECORDING.timeline.push({
    atMs: round(performance.now() - PERF_RECORDING.startedAt),
    snapshot: cloneSnapshot(),
  });
}

function buildPerfRecordingReport(): PerfRecordingReport {
  return {
    recordedAt: new Date().toISOString(),
    url: typeof window === "undefined" ? "" : window.location.href,
    flags: getDevFlagsSnapshot(),
    summary: cloneSnapshot(),
    timeline: PERF_RECORDING.timeline,
  };
}

export function isPerfDebugEnabled() {
  return getDevFlagsSnapshot().perf;
}

export function recordPerfSample(id: string, duration: number) {
  if (!isPerfDebugEnabled()) {
    return;
  }

  const current = PERF_SNAPSHOT.samples[id] ?? {
    count: 0,
    lastDuration: 0,
    maxDuration: 0,
    totalDuration: 0,
  };

  PERF_SNAPSHOT.samples[id] = {
    count: current.count + 1,
    lastDuration: round(duration),
    maxDuration: round(Math.max(current.maxDuration, duration)),
    totalDuration: round(current.totalDuration + duration),
  };
}

const onRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  _baseDuration,
  _startTime,
  commitTime,
) => {
  if (!isPerfDebugEnabled()) {
    return;
  }

  const current = PERF_SNAPSHOT.sections[id] ?? {
    commits: 0,
    lastPhase: phase,
    lastActualDuration: 0,
    maxActualDuration: 0,
    totalActualDuration: 0,
    lastCommitAt: 0,
  };

  PERF_SNAPSHOT.sections[id] = {
    commits: current.commits + 1,
    lastPhase: phase,
    lastActualDuration: round(actualDuration),
    maxActualDuration: round(Math.max(current.maxActualDuration, actualDuration)),
    totalActualDuration: round(current.totalActualDuration + actualDuration),
    lastCommitAt: round(commitTime),
  };
};

export function PerfSection({ id, children }: { id: string; children: ReactNode }) {
  const { perf } = useDevFlags();

  if (!perf) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}

export function MarketingPerfOverlay() {
  const flags = useDevFlags();
  const enabled = flags.perf;
  const [snapshot, setSnapshot] = useState<PerfSnapshot>(cloneSnapshot);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedPoints, setRecordedPoints] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let frameId = 0;
    let windowStart = 0;
    let lastTimestamp = 0;
    let frames = 0;
    let slowFrames = 0;
    let worstFrameMs = 0;

    const updateSnapshot = () => {
      capturePerfRecordingPoint();
      setSnapshot(cloneSnapshot());
      setRecordedPoints(PERF_RECORDING.timeline.length);
    };

    const tick = (timestamp: number) => {
      frameId = window.requestAnimationFrame(tick);

      if (!windowStart) {
        windowStart = timestamp;
        lastTimestamp = timestamp;
      }

      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      frames += 1;
      worstFrameMs = Math.max(worstFrameMs, delta);

      if (delta > 20) {
        slowFrames += 1;
      }

      if (timestamp - windowStart >= 1000) {
        PERF_SNAPSHOT.fps = Math.round((frames * 1000) / (timestamp - windowStart));
        PERF_SNAPSHOT.slowFrames = slowFrames;
        PERF_SNAPSHOT.worstFrameMs = round(worstFrameMs);
        frames = 0;
        slowFrames = 0;
        worstFrameMs = 0;
        windowStart = timestamp;
      }
    };

    const onScroll = () => {
      PERF_SNAPSHOT.scrollTop = Math.round(window.scrollY);
    };

    let longTaskObserver: PerformanceObserver | null = null;
    if (
      "PerformanceObserver" in window &&
      Array.isArray(PerformanceObserver.supportedEntryTypes) &&
      PerformanceObserver.supportedEntryTypes.includes("longtask")
    ) {
      longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          PERF_SNAPSHOT.longTaskCount += 1;
          PERF_SNAPSHOT.lastLongTaskMs = round(entry.duration);
          PERF_SNAPSHOT.maxLongTaskMs = round(
            Math.max(PERF_SNAPSHOT.maxLongTaskMs, entry.duration),
          );
        }
      });
      longTaskObserver.observe({ entryTypes: ["longtask"] });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    frameId = window.requestAnimationFrame(tick);
    const refreshTimer = window.setInterval(updateSnapshot, 250);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearInterval(refreshTimer);
      window.removeEventListener("scroll", onScroll);
      longTaskObserver?.disconnect();
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  const topSections = Object.entries(snapshot.sections)
    .sort((left, right) => right[1].maxActualDuration - left[1].maxActualDuration)
    .slice(0, 6);

  const topSamples = Object.entries(snapshot.samples)
    .sort((left, right) => right[1].maxDuration - left[1].maxDuration)
    .slice(0, 6);

  const handleStartRecording = () => {
    startPerfRecording();
    setSnapshot(cloneSnapshot());
    setRecordedPoints(0);
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    stopPerfRecording();
    setRecordedPoints(PERF_RECORDING.timeline.length);
    setIsRecording(false);
  };

  const handleDownloadRecording = () => {
    const report = buildPerfRecordingReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `softchain-perf-${Date.now()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[200] w-[min(92vw,420px)] rounded-xl border border-white/12 bg-black/85 p-4 text-xs text-white shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <span className="font-medium uppercase tracking-[0.18em] text-white/70">Perf Debug</span>
        <span className="text-white/50">`?perf=1`</span>
      </div>

      <div className="mt-2 text-[11px] text-white/45">
        Flags{" "}
        {Object.entries(flags)
          .filter(([, value]) => value)
          .map(([name]) => name)
          .join(", ") || "none"}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        <button
          type="button"
          onClick={handleStartRecording}
          className="rounded-md border border-white/15 bg-white/8 px-3 py-2 text-white/85"
        >
          Start
        </button>
        <button
          type="button"
          onClick={handleStopRecording}
          className="rounded-md border border-white/15 bg-white/8 px-3 py-2 text-white/85"
        >
          Stop
        </button>
        <button
          type="button"
          onClick={handleDownloadRecording}
          className="rounded-md border border-white/15 bg-white/8 px-3 py-2 text-white/85"
        >
          Download JSON
        </button>
        <span className="self-center text-white/45">
          {isRecording ? "Recording..." : `${recordedPoints} points`}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-md bg-white/6 px-3 py-2">FPS {snapshot.fps}</div>
        <div className="rounded-md bg-white/6 px-3 py-2">Worst frame {snapshot.worstFrameMs}ms</div>
        <div className="rounded-md bg-white/6 px-3 py-2">Slow frames {snapshot.slowFrames}</div>
        <div className="rounded-md bg-white/6 px-3 py-2">Scroll {snapshot.scrollTop}px</div>
        <div className="rounded-md bg-white/6 px-3 py-2">Long tasks {snapshot.longTaskCount}</div>
        <div className="rounded-md bg-white/6 px-3 py-2">Max long task {snapshot.maxLongTaskMs}ms</div>
      </div>

      <div className="mt-4">
        <p className="mb-2 font-medium text-white/70">React commits</p>
        <div className="space-y-1">
          {topSections.length === 0 ? (
            <div className="text-white/45">No React commits recorded yet.</div>
          ) : (
            topSections.map(([id, metric]) => (
              <div key={id} className="flex items-center justify-between gap-3 rounded-md bg-white/4 px-3 py-2">
                <span className="truncate text-white/90">{id}</span>
                <span className="shrink-0 text-white/60">
                  max {metric.maxActualDuration}ms · commits {metric.commits}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 font-medium text-white/70">JS samples</p>
        <div className="space-y-1">
          {topSamples.length === 0 ? (
            <div className="text-white/45">No sampled work recorded yet.</div>
          ) : (
            topSamples.map(([id, metric]) => (
              <div key={id} className="flex items-center justify-between gap-3 rounded-md bg-white/4 px-3 py-2">
                <span className="truncate text-white/90">{id}</span>
                <span className="shrink-0 text-white/60">
                  max {metric.maxDuration}ms · avg {round(metric.totalDuration / metric.count)}ms
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-5 text-white/45">
        If FPS drops while React commit times stay low, the bottleneck is paint/composite or CSS,
        not rerenders.
      </p>
    </div>
  );
}
