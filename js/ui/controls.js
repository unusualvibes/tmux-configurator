import { keybindingPresets } from "../data/keybindings.js";
import { separators } from "../data/separators.js";
import { segments, segmentMap } from "../data/segments.js";
import { themes } from "../data/themes.js";
import { escapeHtml, moveItem, reorderById } from "../utils.js";

function renderThemeCards(activeTheme) {
  return themes
    .map(
      (theme) => `
        <button class="theme-card ${theme.id === activeTheme ? "is-active" : ""}" type="button" data-action="set-theme" data-value="${theme.id}">
          <div class="swatches">
            <span style="background:${theme.bg}"></span>
            <span style="background:${theme.statusBg}"></span>
            <span style="background:${theme.accent1}"></span>
            <span style="background:${theme.accent2}"></span>
          </div>
          <strong>${theme.name}</strong>
          <small>${theme.id}</small>
        </button>
      `
    )
    .join("");
}

function renderChoiceButtons(items, activeValue, actionName, valueKey = "id", labelKey = "name", helperKey = "preview") {
  return items
    .map(
      (item) => `
        <button class="choice-chip ${item[valueKey] === activeValue ? "is-active" : ""}" type="button" data-action="${actionName}" data-value="${item[valueKey]}">
          <strong>${item[labelKey]}</strong>
          <small>${item[helperKey] ?? item.description ?? ""}</small>
        </button>
      `
    )
    .join("");
}

let currentSegmentLabels = {};

function renderSegmentList(side, activeIds) {
  return activeIds
    .map((segmentId, index) => {
      const segment = segmentMap[segmentId];
      const currentLabel = currentSegmentLabels[segment.id] ?? segment.icon;
      return `
        <article class="segment-card" data-segment-id="${segment.id}" data-side="${side}">
          <header>
            <label class="toggle-row">
              <input type="checkbox" checked data-action="toggle-segment" data-side="${side}" data-value="${segment.id}">
              <strong>${segment.label}</strong>
            </label>
            <div class="segment-card-actions">
              <button type="button" class="icon-button drag-handle" draggable="true" data-action="drag-segment" data-side="${side}" data-value="${segment.id}">Drag</button>
              <button type="button" class="icon-button" data-action="move-segment" data-side="${side}" data-index="${index}" data-direction="-1">Up</button>
              <button type="button" class="icon-button" data-action="move-segment" data-side="${side}" data-index="${index}" data-direction="1">Down</button>
            </div>
          </header>
          <label class="field-label">
            <span>Label</span>
            <input class="text-input" type="text" value="${escapeHtml(currentLabel)}" data-action="edit-segment-label" data-value="${segment.id}">
          </label>
          <small>${segment.preview}</small>
        </article>
      `;
    })
    .join("");
}

function renderSegmentToggles(side, activeIds) {
  return segments
    .map(
      (segment) => `
        <label class="toggle-pill">
          <input type="checkbox" ${activeIds.includes(segment.id) ? "checked" : ""} data-action="toggle-segment" data-side="${side}" data-value="${segment.id}">
          <span>${segment.label}</span>
        </label>
      `
    )
    .join("");
}

function renderProfileOptions(profiles, selectedProfileName) {
  return [
    '<option value="">Select a saved profile</option>',
    ...profiles.map(
      (profile) => `<option value="${escapeHtml(profile.name)}" ${profile.name === selectedProfileName ? "selected" : ""}>${escapeHtml(profile.name)}</option>`
    )
  ].join("");
}

export function renderControls(root, state, handlers, profileState) {
  currentSegmentLabels = state.segmentLabels ?? {};
  const profileSummary = profileState.selectedProfileName
    ? `Profiles: ${escapeHtml(profileState.selectedProfileName)}`
    : "Profiles";
  root.innerHTML = `
    <div class="controls-stack">
      <details data-section="profiles">
        <summary>${profileSummary}</summary>
        <div class="section-body field-grid">
          <div class="profile-toolbar">
            <label class="field-label">
              Profile name
              <span>Saved in this browser only</span>
              <input class="text-input" type="text" value="${escapeHtml(profileState.draftProfileName)}" data-action="profile-name">
            </label>
            <label class="field-label">
              Saved profiles
              <span>Load or update an existing configuration</span>
              <select class="select-input" data-action="select-profile">
                ${renderProfileOptions(profileState.profiles, profileState.selectedProfileName)}
              </select>
            </label>
            <div class="profile-actions">
              <button type="button" class="pill-button" data-action="save-profile" ${profileState.draftProfileName.trim() ? "" : "disabled"}>Save</button>
              <button type="button" class="pill-button" data-action="update-profile" ${profileState.selectedProfileName ? "" : "disabled"}>Update</button>
              <button type="button" class="pill-button" data-action="load-profile" ${profileState.selectedProfileName ? "" : "disabled"}>Load</button>
              <button type="button" class="pill-button" data-action="delete-profile" ${profileState.selectedProfileName ? "" : "disabled"}>Delete</button>
            </div>
            <p class="hint">${escapeHtml(profileState.message)}</p>
          </div>
        </div>
      </details>

      <details open data-section="theme">
        <summary>Theme</summary>
        <div class="section-body">
          <div class="theme-grid">${renderThemeCards(state.theme)}</div>
        </div>
      </details>

      <details open data-section="status-bar">
        <summary>Status Bar</summary>
        <div class="section-body field-grid">
          <div class="choice-row">${renderChoiceButtons(separators, state.separator, "set-separator")}</div>
        </div>
      </details>

      <details open data-section="status-position">
        <summary>Status Position</summary>
        <div class="section-body field-grid">
          <div class="choice-row">
            ${renderChoiceButtons(
              [
                { id: "top", name: "Top", preview: "status line sits above panes" },
                { id: "bottom", name: "Bottom", preview: "classic tmux placement" }
              ],
              state.statusPosition,
              "set-status-position"
            )}
          </div>
        </div>
      </details>

      <details open data-section="segments">
        <summary>Segments</summary>
        <div class="section-body field-grid">
          <div class="segment-side-group">
            <p class="hint">Left side active order</p>
            <div class="segment-list" data-side-list="left">${renderSegmentList("left", state.leftSegments)}</div>
            <p class="hint">Available left segments</p>
            <div class="option-list">${renderSegmentToggles("left", state.leftSegments)}</div>
          </div>
          <div class="segment-side-group">
            <p class="hint">Right side active order</p>
            <div class="segment-list" data-side-list="right">${renderSegmentList("right", state.rightSegments)}</div>
            <p class="hint">Available right segments</p>
            <div class="option-list">${renderSegmentToggles("right", state.rightSegments)}</div>
          </div>
        </div>
      </details>

      <details open data-section="session-format">
        <summary>Session Format</summary>
        <div class="section-body field-grid">
          <div class="choice-row">
            ${renderChoiceButtons(
              [
                { id: "number", name: "Number", preview: "1" },
                { id: "name", name: "Name", preview: "editor" },
                { id: "both", name: "Both", preview: "1:editor" }
              ],
              state.windowFormat,
              "set-window-format"
            )}
          </div>
          <label class="field-label">
            Prefix key
            <span>Quick-picks plus direct edit</span>
            <input class="text-input" type="text" value="${state.prefixKey}" data-action="input-prefix">
          </label>
          <div class="inline-actions">
            <button class="pill-button" type="button" data-action="set-prefix" data-value="C-b">C-b</button>
            <button class="pill-button" type="button" data-action="set-prefix" data-value="C-a">C-a</button>
            <button class="pill-button" type="button" data-action="set-prefix" data-value="C-Space">C-Space</button>
          </div>
        </div>
      </details>

      <details open data-section="behavior">
        <summary>Behavior</summary>
        <div class="section-body field-grid">
          <label class="field-label">
            Key bindings
            <span>Preset command bundle</span>
            <select class="select-input" data-action="set-preset">
              ${keybindingPresets
                .map((preset) => `<option value="${preset.id}" ${preset.id === state.keyBindingPreset ? "selected" : ""}>${preset.name}</option>`)
                .join("")}
            </select>
          </label>
          <label class="field-label">
            Pane border style
            <span>Visual label for generated config</span>
            <select class="select-input" data-action="set-pane-style">
              ${["rounded", "square", "heavy", "minimal"]
                .map((style) => `<option value="${style}" ${style === state.paneBorderStyle ? "selected" : ""}>${style}</option>`)
                .join("")}
            </select>
          </label>
          <div class="option-list">
            ${[
              ["mouseEnabled", "Mouse"],
              ["baseIndexOne", "Base index 1"],
              ["renumberWindows", "Renumber windows"],
              ["trueColor", "True color"],
              ["escapeTimeZero", "Escape time 0"],
              ["focusEvents", "Focus events"],
              ["clipboard", "Clipboard sync"]
            ]
              .map(
                ([key, label]) => `
                  <label class="toggle-pill">
                    <input type="checkbox" ${state[key] ? "checked" : ""} data-action="toggle-option" data-key="${key}">
                    <span>${label}</span>
                  </label>
                `
              )
              .join("")}
          </div>
        </div>
      </details>
    </div>
  `;

  root.onclick = (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) {
      return;
    }

    if (trigger.tagName === "BUTTON") {
      event.preventDefault();
    }

    const { action, value, side, index, direction, key } = trigger.dataset;

    if (action === "set-theme") handlers.setTheme(value);
    if (action === "set-separator") handlers.setSeparator(value);
    if (action === "set-status-position") handlers.setStatusPosition(value);
    if (action === "set-window-format") handlers.setWindowFormat(value);
    if (action === "set-prefix") handlers.setPrefix(value);
    if (action === "set-preset") handlers.setPreset(value);
    if (action === "set-pane-style") handlers.setPaneStyle(value);
    if (action === "toggle-option") handlers.toggleOption(key);
    if (action === "move-segment") handlers.moveSegment(side, Number(index), Number(direction));
    if (action === "save-profile") handlers.saveProfile();
    if (action === "update-profile") handlers.updateProfile();
    if (action === "load-profile") handlers.loadProfile();
    if (action === "delete-profile") handlers.deleteProfile();
  };

  root.onchange = (event) => {
    const target = event.target;
    const { action, side, value, key } = target.dataset;

    if (action === "toggle-segment") {
      handlers.toggleSegment(side, value, target.checked);
    }

    if (action === "set-preset") {
      handlers.setPreset(target.value);
    }

    if (action === "set-pane-style") {
      handlers.setPaneStyle(target.value);
    }

    if (action === "toggle-option") {
      handlers.setOption(key, target.checked);
    }

    if (action === "select-profile") {
      handlers.selectProfile(target.value);
    }
  };

  root.oninput = (event) => {
    const target = event.target;
    if (target.dataset.action === "input-prefix") {
      handlers.setPrefix(target.value || "C-b");
    }

    if (target.dataset.action === "edit-segment-label") {
      handlers.setSegmentLabel(target.dataset.value, target.value);
    }

    if (target.dataset.action === "profile-name") {
      handlers.setProfileName(target.value);
    }
  };

  let draggingId = null;

  root.querySelectorAll(".segment-card").forEach((card) => {
    const dragHandle = card.querySelector(".drag-handle");

    dragHandle?.addEventListener("dragstart", () => {
      draggingId = card.dataset.segmentId;
    });

    card.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    card.addEventListener("drop", () => {
      if (!draggingId) {
        return;
      }

      handlers.reorderSegments(card.dataset.side, draggingId, card.dataset.segmentId);
      draggingId = null;
    });
  });
}

export function createControlHandlers(state, setStateValue) {
  return {
    setTheme: (value) => setStateValue("theme", value),
    setSeparator: (value) => setStateValue("separator", value),
    setStatusPosition: (value) => setStateValue("statusPosition", value),
    setWindowFormat: (value) => setStateValue("windowFormat", value),
    setPrefix: (value) => setStateValue("prefixKey", value),
    setPreset: (value) => setStateValue("keyBindingPreset", value),
    setPaneStyle: (value) => setStateValue("paneBorderStyle", value),
    toggleOption: (key) => setStateValue(key, !state[key]),
    setOption: (key, value) => setStateValue(key, value),
    setSegmentLabel: (segmentId, value) => {
      setStateValue("segmentLabels", {
        ...state.segmentLabels,
        [segmentId]: value
      });
    },
    moveSegment: (side, index, direction) => {
      const stateKey = side === "left" ? "leftSegments" : "rightSegments";
      setStateValue(stateKey, moveItem(state[stateKey], index, direction));
    },
    toggleSegment: (side, segmentId, isChecked) => {
      const stateKey = side === "left" ? "leftSegments" : "rightSegments";
      const current = state[stateKey];
      if (isChecked && !current.includes(segmentId)) {
        setStateValue(stateKey, [...current, segmentId]);
      }
      if (!isChecked && current.includes(segmentId)) {
        setStateValue(stateKey, current.filter((item) => item !== segmentId));
      }
    },
    reorderSegments: (side, movingId, targetId) => {
      const stateKey = side === "left" ? "leftSegments" : "rightSegments";
      setStateValue(stateKey, reorderById(state[stateKey], movingId, targetId));
    }
  };
}
