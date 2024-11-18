import * as vscode from 'vscode';
import { TabLabels } from './tabLabels';

export let rootPath: vscode.Uri;
export let isWorkspace: boolean;

export function activate(context: vscode.ExtensionContext) {
	const tabLabels = new TabLabels(context);
	context.subscriptions.push(vscode.commands.registerCommand("rename-tabs.tabLabels.renameActiveTab", () => {
		const active = vscode.window.activeTextEditor;
		const activeDocument = active?.document?.uri;
		if (activeDocument) {
			return tabLabels.renameTab(activeDocument);
		}
		else {
			vscode.window.showWarningMessage("[WARN] Could not find active tab.");
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand("rename-tabs.tabLabels.rename", (uri: vscode.Uri) => {
		return tabLabels.renameTab(uri);
	}));
	context.subscriptions.push(vscode.commands.registerCommand("rename-tabs.tabLabels.clearNames", () => {
		return tabLabels.clearNamesForAllTabs();
	}));
	context.subscriptions.push(vscode.commands.registerCommand("rename-tabs.tabLabels.removeExtensions", () => {
		return tabLabels.removeExtensionsForOpenTabs();
	}));

	isWorkspace = !!(vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0));
	rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri : vscode.Uri.parse('.');
}

// This method is called when your extension is deactivated
export function deactivate() {}
