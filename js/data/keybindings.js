export const keybindingPresets = [
  {
    id: "default",
    name: "Default",
    description: "Keep tmux defaults with a few ergonomic extras.",
    commands: [
      "bind r source-file ~/.tmux.conf \\; display-message 'Config reloaded'",
      "bind | split-window -h",
      "bind - split-window -v"
    ]
  },
  {
    id: "vim",
    name: "Vim",
    description: "Use hjkl pane navigation and vi copy mode.",
    commands: [
      "setw -g mode-keys vi",
      "bind h select-pane -L",
      "bind j select-pane -D",
      "bind k select-pane -U",
      "bind l select-pane -R"
    ]
  },
  {
    id: "emacs",
    name: "Emacs",
    description: "Lean on emacs-style copy mode and a reload shortcut.",
    commands: [
      "setw -g mode-keys emacs",
      "bind r source-file ~/.tmux.conf \\; display-message 'Reloaded'",
      "bind C-s choose-tree"
    ]
  },
  {
    id: "screen",
    name: "Screen",
    description: "Use screen-like navigation and indexing behavior.",
    commands: [
      "bind c new-window",
      "bind 0 select-window -t 0",
      "bind 1 select-window -t 1",
      "bind 2 select-window -t 2"
    ]
  }
];

export const keybindingMap = Object.fromEntries(keybindingPresets.map((preset) => [preset.id, preset]));
