export function renderOutput(root, configText) {
  const lines = configText.split("\n");
  root.innerHTML = `
    <div class="panel-inner">
      <div class="output-toolbar">
        <div>
          <strong>tmux.conf output</strong>
          <div class="output-meta">${lines.length} lines</div>
        </div>
        <div class="output-meta">Editable output</div>
      </div>
      <div class="code-frame">
        <textarea id="output-editor" class="code-editor" spellcheck="false">${configText}</textarea>
      </div>
    </div>
  `;
}
