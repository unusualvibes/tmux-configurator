import { segmentMap } from "../data/segments.js";
import { separatorMap } from "../data/separators.js";
import { themeMap } from "../data/themes.js";
import { escapeHtml, getReadableTextColor } from "../utils.js";

function resolveSegmentLabel(segment, segmentLabels) {
  const customLabel = segmentLabels?.[segment.id];
  if (customLabel === undefined) {
    return segment.icon;
  }

  return customLabel.trim();
}

function buildPreviewSegments(segmentIds, theme, separatorId, segmentLabels) {
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
      const labelPrefix = label ? `${escapeHtml(label)} ` : "";
      const segmentHtml = `<span class="status-segment" style="background:${bg};color:${fg}">${labelPrefix}${escapeHtml(segment.preview)}</span>`;
      const separatorHtml = separator.left
        ? `<span class="status-separator" style="background:${nextBg};color:${bg}">${escapeHtml(separator.left)}</span>`
        : "";
      return `${segmentHtml}${separatorHtml}`;
    })
    .join("");
}

export function renderPreview(root, state) {
  const theme = themeMap[state.theme];
  const windowLabel = state.windowFormat === "number" ? "1" : state.windowFormat === "name" ? "editor" : "1:editor";
  const statusMarkup = `
    <div class="statusbar ${state.statusPosition === "top" ? "is-top" : ""}" style="background:${theme.statusBg};color:${theme.statusFg}">
      <div class="status-side">${buildPreviewSegments(state.leftSegments, theme, state.separator, state.segmentLabels)}</div>
      <div class="status-side">${buildPreviewSegments(state.rightSegments, theme, state.separator, state.segmentLabels)}</div>
    </div>
  `;

  root.innerHTML = `
    <div class="preview-shell">
      <div class="preview-meta">
        <span>Live preview</span>
        <span>${escapeHtml(theme.name)} / ${escapeHtml(state.statusPosition)}</span>
      </div>
      <div class="terminal" style="background:${theme.bg};color:${theme.fg}">
        <div class="terminal-topbar">
          <div class="traffic-lights">
            <span style="background:#ff6b6b"></span>
            <span style="background:#ffd166"></span>
            <span style="background:#06d6a0"></span>
          </div>
          <span>tmux / ${escapeHtml(state.prefixKey)}</span>
        </div>
        ${state.statusPosition === "top" ? statusMarkup : ""}
        <div class="terminal-body">
          <div class="pane-stack">
            <article class="pane is-active" style="border-color:${theme.paneActiveBorder};background:rgba(255,255,255,0.02)">
              <div class="pane-title">pane 1 · nvim</div>
              <div>$ git status</div>
              <div>$ npm test</div>
            </article>
            <article class="pane" style="border-color:${theme.paneBorder};background:rgba(255,255,255,0.015)">
              <div class="pane-title">pane 2 · server logs</div>
              <div>[info] preview refresh complete</div>
            </article>
          </div>
          <div>
            <div class="window-strip">
              <span class="window-tab" style="background:${theme.activeWinBg};color:${theme.activeWinFg}">${escapeHtml(windowLabel)}</span>
              <span class="window-tab" style="background:${theme.inactiveWinBg};color:${theme.inactiveWinFg}">2:docs</span>
              <span class="window-tab" style="background:${theme.inactiveWinBg};color:${theme.inactiveWinFg}">3:shell</span>
            </div>
          </div>
        </div>
        ${state.statusPosition === "bottom" ? statusMarkup : ""}
      </div>
      <p class="hint">Preview is DOM-based and mirrors the generated status segments and pane colors.</p>
    </div>
  `;
}
