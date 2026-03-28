# tmux-configurator

`tmux-configurator` is a browser-based editor for generating a `tmux.conf` file without writing the configuration by hand.

It lets you tune the visual layout and behavior of a tmux setup, preview the result in the browser, and export the generated configuration as plain text.

## Features

- Customize the status bar with selectable themes, separator styles, and top or bottom positioning.
- Reorder left and right status segments to shape the layout you want.
- Adjust common tmux behaviors including mouse support, true color, base index, renumbering, and clipboard integration.
- Choose keybinding presets and prefix key combinations without editing config by hand.
- Preview the generated configuration live as you change settings.
- Copy the generated output to the clipboard or export it as a `tmux.conf` file.
- Save named profiles in browser local storage for later reuse.
- Share configurations through the URL hash so a setup can be restored from a link.

## How To Use It

Open the app in a browser, adjust the controls, and use the preview and output panels to inspect the generated tmux setup.

The main actions are:

- `Copy` to copy the generated configuration.
- `Export` to download it as `tmux.conf`.
- Profile controls to save, load, update, and delete named configurations in the current browser.

## Local Development

This project is a static site with n12o server-side runtime.

For simple local use, open index.html in a browser. For a cleaner development workflow, serve the directory with any static file server.

## GitHub Pages

The repository includes:

- A build step that copies the static site into `docs/`.
- A GitHub Actions workflow that deploys the site to GitHub Pages.

### Build

```bash
npm run build
```

That command recreates `docs/` and adds a `.nojekyll` file for GitHub Pages.

### Publish With GitHub Actions

1. Push this repository to GitHub.
2. Commit and push the workflow file in `.github/workflows/deploy-pages.yml`.
3. In GitHub, open `Settings` -> `Pages`.
4. Set `Source` to `GitHub Actions`.
5. Push to the `main` branch, or run the workflow manually from the `Actions` tab.
6. Wait for the workflow to finish publishing.

The published site will be available at `https://<your-user>.github.io/<your-repository>/`.
