# Custom File Order VS Code Extension

A VS Code extension that allows you to manually order files and directories in the file explorer.

## Features

- Custom file/directory ordering within any folder
- Move files/folders up or down with simple buttons
- Persistent ordering (remembers your custom order)
- Reset to alphabetical order anytime
- Works alongside the standard VS Code file explorer

## Installation

1. Package the extension:
   ```bash
   npm install -g vsce
   vsce package
   ```

2. Install the `.vsix` file in VS Code:
   - `Ctrl+Shift+P` → "Extensions: Install from VSIX..."
   - Select the generated `.vsix` file

## Usage

1. After installation, you'll see a new "Custom Ordered Files" panel in the Explorer sidebar
2. Right-click on any file/folder to see "Move Up" and "Move Down" options
3. Your custom order is automatically saved and persists across VS Code sessions
4. Use "Reset to Alphabetical" to return to default ordering

## Perfect for:

- Pipeline directories (ingestion → processing → storage → publish → jobs)
- Project structure organization
- Logical workflow ordering
- Any custom file/folder arrangement

No more ugly numbered prefixes or broken imports! 