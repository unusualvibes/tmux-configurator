export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function encodeConfig(state) {
  return btoa(JSON.stringify(state));
}

export function decodeConfig(encodedValue) {
  try {
    return JSON.parse(atob(encodedValue));
  } catch {
    return null;
  }
}

export function readHashConfig() {
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  const encoded = params.get("config");
  return encoded ? decodeConfig(encoded) : null;
}

export function writeHashConfig(state) {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  params.set("config", encodeConfig(state));
  window.history.replaceState(null, "", `#${params.toString()}`);
}

export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function moveItem(items, index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  return next;
}

export function reorderById(items, movingId, targetId) {
  const next = [...items];
  const from = next.indexOf(movingId);
  const to = next.indexOf(targetId);

  if (from === -1 || to === -1 || from === to) {
    return next;
  }

  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function getReadableTextColor(hexColor) {
  const value = hexColor.replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((char) => `${char}${char}`).join("")
    : value;

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const yiq = (red * 299 + green * 587 + blue * 114) / 1000;
  return yiq >= 150 ? "#111216" : "#f6f7fb";
}

const PROFILE_STORAGE_KEY = "tmux-configurator.profiles";

function readProfilesStore() {
  try {
    const rawValue = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeProfilesStore(store) {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(store));
}

export function listProfiles() {
  return Object.entries(readProfilesStore())
    .map(([name, entry]) => ({
      name,
      state: entry.state,
      updatedAt: entry.updatedAt ?? 0
    }))
    .sort((left, right) => right.updatedAt - left.updatedAt || left.name.localeCompare(right.name));
}

export function saveProfile(name, state) {
  const trimmedName = String(name).trim();
  if (!trimmedName) {
    return false;
  }

  const store = readProfilesStore();
  store[trimmedName] = {
    state,
    updatedAt: Date.now()
  };
  writeProfilesStore(store);
  return true;
}

export function loadProfile(name) {
  const trimmedName = String(name).trim();
  if (!trimmedName) {
    return null;
  }

  const store = readProfilesStore();
  return store[trimmedName]?.state ?? null;
}

export function deleteProfile(name) {
  const trimmedName = String(name).trim();
  if (!trimmedName) {
    return false;
  }

  const store = readProfilesStore();
  if (!Object.prototype.hasOwnProperty.call(store, trimmedName)) {
    return false;
  }

  delete store[trimmedName];
  writeProfilesStore(store);
  return true;
}
