export const segments = [
  { id: "session", label: "Session", icon: "SESS", tmuxFormat: "#S", preview: "work" },
  { id: "window", label: "Window", icon: "WIN", tmuxFormat: "#I:#W", preview: "1:editor" },
  { id: "hostname", label: "Hostname", icon: "HOST", tmuxFormat: "#H", preview: "studio" },
  { id: "datetime", label: "Date/Time", icon: "TIME", tmuxFormat: "%Y-%m-%d %H:%M", preview: "2026-03-28 13:18" },
  { id: "battery", label: "Battery", icon: "BATT", tmuxFormat: "#{battery_percentage}", preview: "81%" },
  { id: "cpu", label: "CPU", icon: "CPU", tmuxFormat: "#{cpu_percentage}", preview: "23%" },
  { id: "memory", label: "Memory", icon: "MEM", tmuxFormat: "#{ram_percentage}", preview: "48%" },
  { id: "git", label: "Git Branch", icon: "GIT", tmuxFormat: "#{pane_current_path}", preview: "main" },
  { id: "uptime", label: "Uptime", icon: "UP", tmuxFormat: "#{t:window_activity}", preview: "3h 22m" },
  { id: "prefix", label: "Prefix", icon: "PFX", tmuxFormat: "#{?client_prefix,ON,OFF}", preview: "OFF" },
  { id: "zoom", label: "Zoom", icon: "ZOOM", tmuxFormat: "#{?window_zoomed_flag,ZOOM,NORM}", preview: "NORM" },
  { id: "user", label: "User", icon: "USER", tmuxFormat: "#(whoami)", preview: "coder" },
  { id: "path", label: "Path", icon: "PATH", tmuxFormat: "#{b:pane_current_path}", preview: "~/src" },
  { id: "load", label: "Load", icon: "LOAD", tmuxFormat: "#(uptime | cut -d ':' -f 5)", preview: "1.42" },
  { id: "network", label: "Network", icon: "NET", tmuxFormat: "#(ip route get 1 | head -1)", preview: "wifi" },
  { id: "mode", label: "Mode", icon: "MODE", tmuxFormat: "#{client_key_table}", preview: "root" }
];

export const segmentMap = Object.fromEntries(segments.map((segment) => [segment.id, segment]));
