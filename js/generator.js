import { keybindingMap } from "./data/keybindings.js";
import { segmentMap } from "./data/segments.js";
import { separatorMap } from "./data/separators.js";
import { themeMap } from "./data/themes.js";
import { getReadableTextColor } from "./utils.js";

function getPaneBorderLinesValue(style) {
  if (style === "heavy") {
    return "heavy";
  }

  if (style === "square") {
    return "simple";
  }

  if (style === "minimal") {
    return "single";
  }

  return "";
}

function quote(value) {
  return `'${String(value).replaceAll("'", "'\"'\"'")}'`;
}

function formatWindowStyle(theme, isActive) {
  return `fg=${isActive ? theme.activeWinFg : theme.inactiveWinFg},bg=${isActive ? theme.activeWinBg : theme.inactiveWinBg}`;
}

function resolveSegmentLabel(segment, segmentLabels) {
  const customLabel = segmentLabels?.[segment.id];
  if (customLabel === undefined) {
    return segment.icon;
  }

  return String(customLabel).trim();
}

function buildFormatSegments(segmentIds, theme, separatorId, segmentLabels) {
  const separator = separatorMap[separatorId];

  return segmentIds
    .map((segmentId, index) => {
      const segment = segmentMap[segmentId];
      if (!segment) {
        return "";
      }

      const bg = index % 2 === 0 ? theme.accent1 : theme.accent2;
      const fg = getReadableTextColor(bg);
      const label = resolveSegmentLabel(segment, segmentLabels);
      const nextBg = segmentIds[index + 1] ? (index + 1) % 2 === 0 ? theme.accent1 : theme.accent2 : theme.statusBg;
      const separatorGlyph = separator.left ? `#[fg=${bg},bg=${nextBg}]${separator.left}` : "";
      const labelPrefix = label ? `${label} ` : "";
      const content = `#[fg=${fg},bg=${bg},bold] ${labelPrefix}#[nobold]${segment.tmuxFormat} `;
      return `${content}${separatorGlyph}`;
    })
    .join("");
}

export function generateConfig(state) {
  const theme = themeMap[state.theme];
  const preset = keybindingMap[state.keyBindingPreset];
  const leftStatus = buildFormatSegments(state.leftSegments, theme, state.separator, state.segmentLabels);
  const rightStatus = buildFormatSegments(state.rightSegments, theme, state.separator, state.segmentLabels);
  const paneBorderLines = getPaneBorderLinesValue(state.paneBorderStyle);

  return [
    "# General Settings",
    `set -g default-terminal ${quote("screen-256color")}`,
    `set -g status-position ${state.statusPosition}`,
    `set -g mouse ${state.mouseEnabled ? "on" : "off"}`,
    `set -g base-index ${state.baseIndexOne ? "1" : "0"}`,
    `setw -g pane-base-index ${state.baseIndexOne ? "1" : "0"}`,
    `set -g renumber-windows ${state.renumberWindows ? "on" : "off"}`,
    `set -sg escape-time ${state.escapeTimeZero ? "0" : "10"}`,
    `set -g focus-events ${state.focusEvents ? "on" : "off"}`,
    `set -g set-clipboard ${state.clipboard ? "on" : "off"}`,
    "",
    "# Prefix Key",
    `unbind C-b`,
    `set -g prefix ${state.prefixKey}`,
    `bind ${state.prefixKey} send-prefix`,
    "",
    "# Display",
    `set -g status-interval 5`,
    `set -g status-justify left`,
    `set -g status-style ${quote(`fg=${theme.statusFg},bg=${theme.statusBg}`)}`,
    `set -g message-style ${quote(`fg=${theme.bg},bg=${theme.accent2}`)}`,
    `set -g pane-border-style ${quote(`fg=${theme.paneBorder}`)}`,
    `set -g pane-active-border-style ${quote(`fg=${theme.paneActiveBorder}`)}`,
    `set -g mode-style ${quote(`fg=${theme.bg},bg=${theme.accent1}`)}`,
    `set -g status-left-length 100`,
    `set -g status-right-length 120`,
    "",
    "# Status Bar Left/Right",
    `set -g status-left ${quote(leftStatus)}`,
    `set -g status-right ${quote(rightStatus)}`,
    "",
    "# Window Status",
    `setw -g window-status-format ${quote(`#[${formatWindowStyle(theme, false)}] ${state.windowFormat === "number" ? "#I" : state.windowFormat === "name" ? "#W" : "#I:#W"} `)}`,
    `setw -g window-status-current-format ${quote(`#[${formatWindowStyle(theme, true)},bold] ${state.windowFormat === "number" ? "#I" : state.windowFormat === "name" ? "#W" : "#I:#W"} `)}`,
    "",
    "# Pane Borders",
    `# Requested style: ${state.paneBorderStyle}`,
    ...(paneBorderLines ? [`set -g pane-border-lines ${paneBorderLines}`] : []),
    "",
    "# Colors",
    `set -as terminal-overrides ${quote(state.trueColor ? ",*:Tc" : "")}`,
    "",
    "# Key Bindings",
    ...preset.commands,
    ""
  ].join("\n");
}
