const SETTLE_DELAYS_MS = [80, 240, 600, 1200] as const;

function getTargetId(target: string) {
  let id = target.startsWith("#") ? target.slice(1) : target;

  try {
    id = decodeURIComponent(id);
  } catch {
    return null;
  }

  return id;
}

function scrollElementTarget(target: string, behavior: ScrollBehavior) {
  const id = getTargetId(target);

  if (!id) {
    return false;
  }

  const element = document.getElementById(id);

  if (!element) {
    return false;
  }

  element.scrollIntoView({ block: "start", behavior });
  return true;
}

function keepTargetSettled(target: string) {
  window.requestAnimationFrame(() => scrollElementTarget(target, "auto"));

  SETTLE_DELAYS_MS.forEach((delay) => {
    window.setTimeout(() => scrollElementTarget(target, "auto"), delay);
  });
}

export function scrollToPageTarget(
  target: string | number,
  options?: { behavior?: ScrollBehavior; settle?: boolean },
) {
  const behavior = options?.behavior ?? "auto";

  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior });
    return;
  }

  if (scrollElementTarget(target, behavior) && options?.settle) {
    keepTargetSettled(target);
  }
}

export function scrollToHashWhenReady(hash: string, attempt = 0) {
  if (scrollElementTarget(hash, "auto")) {
    keepTargetSettled(hash);
    return;
  }

  if (attempt >= 10) {
    window.scrollTo(0, 0);
    return;
  }

  window.setTimeout(() => scrollToHashWhenReady(hash, attempt + 1), 50);
}
