"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
class CustomFileOrderProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.customOrder = new Map();
        this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
        this.loadCustomOrder();
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        const treeItem = new vscode.TreeItem(element.label);
        // Set the resourceUri so VSCode automatically uses the correct icon from the current theme
        treeItem.resourceUri = element.uri;
        if (element.type === vscode.FileType.Directory) {
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            treeItem.contextValue = 'folder';
        }
        else {
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
            treeItem.contextValue = 'file';
            treeItem.command = {
                command: 'vscode.open',
                title: 'Open',
                arguments: [element.uri]
            };
        }
        return treeItem;
    }
    async getChildren(element) {
        if (!this.workspaceRoot) {
            return [];
        }
        const folderPath = element ? element.uri.fsPath : this.workspaceRoot;
        try {
            const children = await fs.promises.readdir(folderPath, { withFileTypes: true });
            const items = children
                .filter((child) => !child.name.startsWith('.')) // Hide hidden files
                .map((child) => ({
                uri: vscode.Uri.file(path.join(folderPath, child.name)),
                type: child.isDirectory() ? vscode.FileType.Directory : vscode.FileType.File,
                label: child.name
            }));
            // Apply custom ordering
            return this.applyCustomOrder(folderPath, items);
        }
        catch (error) {
            return [];
        }
    }
    applyCustomOrder(folderPath, items) {
        const relativePath = path.relative(this.workspaceRoot, folderPath);
        const customOrder = this.customOrder.get(relativePath) || [];
        if (customOrder.length === 0) {
            // Default alphabetical order
            return items.sort((a, b) => {
                // Directories first, then files
                if (a.type !== b.type) {
                    return a.type === vscode.FileType.Directory ? -1 : 1;
                }
                return a.label.localeCompare(b.label);
            });
        }
        // Apply custom order
        const ordered = [];
        const remaining = [...items];
        // Add items in custom order
        for (const name of customOrder) {
            const index = remaining.findIndex(item => item.label === name);
            if (index !== -1) {
                ordered.push(remaining.splice(index, 1)[0]);
            }
        }
        // Add remaining items (new files not in custom order)
        ordered.push(...remaining.sort((a, b) => a.label.localeCompare(b.label)));
        return ordered;
    }
    async moveUp(item) {
        const folderPath = path.dirname(item.uri.fsPath);
        const relativePath = path.relative(this.workspaceRoot, folderPath);
        const children = await this.getChildren();
        const currentOrder = children.map(child => child.label);
        const index = currentOrder.indexOf(item.label);
        if (index > 0) {
            // Swap with previous item
            [currentOrder[index], currentOrder[index - 1]] = [currentOrder[index - 1], currentOrder[index]];
            this.customOrder.set(relativePath, currentOrder);
            this.saveCustomOrder();
            this.refresh();
        }
    }
    async moveDown(item) {
        const folderPath = path.dirname(item.uri.fsPath);
        const relativePath = path.relative(this.workspaceRoot, folderPath);
        const children = await this.getChildren();
        const currentOrder = children.map(child => child.label);
        const index = currentOrder.indexOf(item.label);
        if (index < currentOrder.length - 1) {
            // Swap with next item
            [currentOrder[index], currentOrder[index + 1]] = [currentOrder[index + 1], currentOrder[index]];
            this.customOrder.set(relativePath, currentOrder);
            this.saveCustomOrder();
            this.refresh();
        }
    }
    resetOrder() {
        this.customOrder.clear();
        this.saveCustomOrder();
        this.refresh();
    }
    loadCustomOrder() {
        const orderData = this.context.globalState.get('customFileOrder', {});
        this.customOrder = new Map(Object.entries(orderData));
    }
    saveCustomOrder() {
        const orderData = Object.fromEntries(this.customOrder);
        this.context.globalState.update('customFileOrder', orderData);
    }
}
function activate(context) {
    const provider = new CustomFileOrderProvider(context);
    vscode.window.createTreeView('customFileExplorer', {
        treeDataProvider: provider,
        showCollapseAll: true
    });
    vscode.commands.registerCommand('customFileExplorer.refresh', () => provider.refresh());
    vscode.commands.registerCommand('customFileExplorer.moveUp', (item) => provider.moveUp(item));
    vscode.commands.registerCommand('customFileExplorer.moveDown', (item) => provider.moveDown(item));
    vscode.commands.registerCommand('customFileExplorer.resetOrder', () => provider.resetOrder());
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map