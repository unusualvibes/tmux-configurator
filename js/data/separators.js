export const separators = [
  { id: "arrows", name: "Arrows", preview: "left > mid > right", left: ">", right: "<", thin: "/" },
  { id: "rounded", name: "Rounded", preview: "soft ) flow", left: ")", right: "(", thin: "|" },
  { id: "slashes", name: "Slashes", preview: "cut / cut", left: "/", right: "\\", thin: "|" },
  { id: "flames", name: "Flames", preview: "hot ^ crest", left: "^", right: "v", thin: ":" },
  { id: "pixels", name: "Pixels", preview: "step [] step", left: "]", right: "[", thin: "|" },
  { id: "blocks", name: "Blocks", preview: "solid # join", left: "#", right: "#", thin: "|" },
  { id: "none", name: "None", preview: "minimal spacing", left: "", right: "", thin: "" }
];

export const separatorMap = Object.fromEntries(separators.map((separator) => [separator.id, separator]));
