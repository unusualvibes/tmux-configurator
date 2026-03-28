import { generateConfig } from "./generator.js";
import { replaceState, setStateValue, state, subscribe, getStateSnapshot } from "./state.js";
import { createControlHandlers, renderControls } from "./ui/controls.js";
import { renderOutput } from "./ui/output.js";
import { renderPreview } from "./ui/preview.js";
import {
  copyText,
  deleteProfile,
  downloadText,
  listProfiles,
  loadProfile,
  readHashConfig,
  saveProfile,
  writeHashConfig
} from "./utils.js";

const controlsRoot = document.querySelector("#controls-root");
const previewRoot = document.querySelector("#preview-root");
const outputRoot = document.querySelector("#output-root");
const copyButton = document.querySelector("#copy-config");
const downloadButton = document.querySelector("#download-config");
const chromeToggle = document.querySelector("#chrome-toggle");

const handlers = createControlHandlers(state, setStateValue);
let outputText = generateConfig(state);
const profileState = {
  profiles: listProfiles(),
  draftProfileName: "",
  selectedProfileName: "",
  message: "Save named configurations in this browser."
};

function refreshProfiles() {
  profileState.profiles = listProfiles();
}

function renderApp() {
  const controlsScroller = controlsRoot.querySelector(".controls-stack");
  const previousScrollTop = controlsScroller ? controlsScroller.scrollTop : 0;
  const openSections = new Set(
    [...controlsRoot.querySelectorAll("details[data-section][open]")].map((detail) => detail.dataset.section)
  );
  const activeControl = controlsRoot.contains(document.activeElement) ? document.activeElement : null;
  const activeControlDescriptor = activeControl?.dataset?.action
    ? {
        action: activeControl.dataset.action,
        value: activeControl.dataset.value,
        key: activeControl.dataset.key,
        selectionStart: typeof activeControl.selectionStart === "number" ? activeControl.selectionStart : null,
        selectionEnd: typeof activeControl.selectionEnd === "number" ? activeControl.selectionEnd : null
      }
    : null;
  outputText = generateConfig(state);

  document.body.dataset.chrome = state.appChrome;
  renderControls(controlsRoot, state, handlers, profileState);
  const nextControlsScroller = controlsRoot.querySelector(".controls-stack");
  if (nextControlsScroller) {
    nextControlsScroller.scrollTop = previousScrollTop;
  }
  controlsRoot.querySelectorAll("details[data-section]").forEach((detail) => {
    detail.open = openSections.has(detail.dataset.section) || detail.hasAttribute("open");
  });
  if (activeControlDescriptor) {
    const selectorParts = [`[data-action="${activeControlDescriptor.action}"]`];
    if (activeControlDescriptor.value) {
      selectorParts.push(`[data-value="${activeControlDescriptor.value}"]`);
    }
    if (activeControlDescriptor.key) {
      selectorParts.push(`[data-key="${activeControlDescriptor.key}"]`);
    }
    const nextActiveControl = controlsRoot.querySelector(selectorParts.join(""));
    if (nextActiveControl) {
      nextActiveControl.focus();
      if (
        typeof activeControlDescriptor.selectionStart === "number" &&
        typeof activeControlDescriptor.selectionEnd === "number" &&
        typeof nextActiveControl.setSelectionRange === "function"
      ) {
        nextActiveControl.setSelectionRange(
          activeControlDescriptor.selectionStart,
          activeControlDescriptor.selectionEnd
        );
      }
    }
  }
  renderPreview(previewRoot, state);
  renderOutput(outputRoot, outputText);
  writeHashConfig(getStateSnapshot());
}

const hydratedState = readHashConfig();
if (hydratedState) {
  replaceState(hydratedState);
}

subscribe(renderApp);
renderApp();

handlers.setProfileName = (value) => {
  profileState.draftProfileName = value;
  profileState.message = "Save named configurations in this browser.";
  renderApp();
};

handlers.selectProfile = (name) => {
  profileState.selectedProfileName = name;
  profileState.draftProfileName = name;
  if (!name) {
    profileState.message = "Save named configurations in this browser.";
    renderApp();
    return;
  }

  handlers.loadProfile();
};

handlers.saveProfile = () => {
  const profileName = profileState.draftProfileName.trim();
  if (!profileName) {
    profileState.message = "Enter a profile name first.";
    renderApp();
    return;
  }

  saveProfile(profileName, getStateSnapshot());
  profileState.selectedProfileName = profileName;
  profileState.draftProfileName = profileName;
  profileState.message = `Saved profile: ${profileName}`;
  refreshProfiles();
  renderApp();
};

handlers.updateProfile = () => {
  const profileName = profileState.selectedProfileName || profileState.draftProfileName.trim();
  if (!profileName) {
    profileState.message = "Select a profile to update.";
    renderApp();
    return;
  }

  saveProfile(profileName, getStateSnapshot());
  profileState.selectedProfileName = profileName;
  profileState.draftProfileName = profileName;
  profileState.message = `Updated profile: ${profileName}`;
  refreshProfiles();
  renderApp();
};

handlers.loadProfile = () => {
  const profileName = profileState.selectedProfileName || profileState.draftProfileName.trim();
  if (!profileName) {
    profileState.message = "Select a profile to load.";
    renderApp();
    return;
  }

  const nextState = loadProfile(profileName);
  if (!nextState) {
    profileState.message = `Profile not found: ${profileName}`;
    refreshProfiles();
    renderApp();
    return;
  }

  profileState.selectedProfileName = profileName;
  profileState.draftProfileName = profileName;
  profileState.message = `Loaded profile: ${profileName}`;
  replaceState(nextState);
};

handlers.deleteProfile = () => {
  const profileName = profileState.selectedProfileName || profileState.draftProfileName.trim();
  if (!profileName) {
    profileState.message = "Select a profile to delete.";
    renderApp();
    return;
  }

  if (!deleteProfile(profileName)) {
    profileState.message = `Profile not found: ${profileName}`;
    refreshProfiles();
    renderApp();
    return;
  }

  profileState.selectedProfileName = "";
  profileState.draftProfileName = "";
  profileState.message = `Deleted profile: ${profileName}`;
  refreshProfiles();
  renderApp();
};

copyButton.addEventListener("click", async () => {
  await copyText(outputText);
  copyButton.textContent = "Copied";
  window.setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 1200);
});

downloadButton.addEventListener("click", () => {
  downloadText("tmux.conf", outputText);
});

chromeToggle.addEventListener("click", () => {
  setStateValue("appChrome", state.appChrome === "light" ? "dark" : "light");
});

outputRoot.addEventListener("input", (event) => {
  if (event.target.id !== "output-editor") {
    return;
  }

  outputText = event.target.value;
});
