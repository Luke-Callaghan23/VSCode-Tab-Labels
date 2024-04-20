import * as vscode from 'vscode';
import { TabLabels } from './tabLabels';

export let rootPath: vscode.Uri;

export function activate(context: vscode.ExtensionContext) {
	const tabLabels = new TabLabels();
	context.subscriptions.push(vscode.commands.registerCommand("rename-tabs.tabLabels.rename", (uri: vscode.Uri) => {
		return tabLabels.renameTab(uri);
	}));
	context.subscriptions.push(vscode.commands.registerCommand("rename-tabs.tabLabels.clearNames", () => {
		return tabLabels.clearNamesForAllTabs();
	}));
	context.subscriptions.push(vscode.commands.registerCommand("rename-tabs.tabLabels.removeExtensions", () => {
		return tabLabels.removeExtensionsForOpenTabs();
	}));

	rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri : vscode.Uri.parse('.');
}

// This method is called when your extension is deactivated
export function deactivate() {}
