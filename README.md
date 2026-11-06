<div align="center">

<img src="./assets/excode-logo.png" width="180" alt="EXCODE logo">

# EXCODE

**An open-source desktop code editor for a focused programming workspace.**

[Download](https://github.com/EXELYN404/excode/releases/latest) ·
[Issues](https://github.com/EXELYN404/excode/issues)

</div>

---

EXCODE brings together a code editor, project workspace, integrated terminal, and tools for working with code in one desktop application.

## Download

Download the latest Linux x86_64 installers from
[GitHub Releases](https://github.com/EXELYN404/excode/releases/latest).

- Debian package (`.deb`)
- AppImage (`.AppImage`)

## Quick Install — Debian / Ubuntu

Install the latest EXCODE DEB automatically:

```bash
sudo apt update && sudo apt install -y curl jq && asset="$(curl -fsSL https://api.github.com/repos/EXELYN404/excode/releases/latest | jq -r '.assets[] | select(.name | endswith(".deb")) | .browser_download_url' | head -n1)" && test -n "$asset" && curl -fL "$asset" -o /tmp/excode-latest.deb && sudo apt install -y /tmp/excode-latest.deb
```

Launch:

```bash
excode
```

## Step-by-Step Installation

### Debian package

1. Download the `.deb` from [Releases](https://github.com/EXELYN404/excode/releases/latest).
2. Open a terminal in the download folder.
3. Install:

   ```bash
   sudo apt install ./ExCode_0.1.4_amd64.deb
   ```

4. Launch `excode` or use the desktop application menu.

### AppImage

1. Download the `.AppImage` from Releases.
2. Open a terminal in the download folder.
3. Run:

   ```bash
   chmod +x ExCode_0.1.4_amd64.AppImage
   ./ExCode_0.1.4_amd64.AppImage
   ```

## Build from Source

Install Debian/Ubuntu dependencies:

```bash
sudo apt update
sudo apt install -y build-essential curl wget file pkg-config libssl-dev libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev libxdo-dev git
```

Install Rust using https://www.rust-lang.org/tools/install

Clone and build:

```bash
git clone https://github.com/EXELYN404/excode.git
cd excode
corepack pnpm install
corepack pnpm tauri dev
```

Build installers:

```bash
corepack pnpm tauri build --bundles deb,appimage
```

## Features

- Desktop code editor
- Project workspace and file explorer
- Integrated terminal
- Editor tabs and split layouts
- File and language icons
- Linux desktop integration

## License

See [LICENSE](./LICENSE).


## Preview

![Ai-provider-setup.png](./Ai-provider-setup.png)

![Welcome-screen.png](./Welcome-screen.png)

![Workspace.png](./Workspace.png)

![agent ai.png](./agent ai.png)

![settings.png](./settings.png)
