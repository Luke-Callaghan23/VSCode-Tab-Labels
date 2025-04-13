import * as vscode from 'vscode';
import { TabLabels } from './tabLabels';

export let rootPath: vscode.Uri;
export let isWorkspace: boolean;

export function emitErrorUnableToRename () {
	vscode.window.showErrorMessage('[ERR] Cannot rename tabs created by other extensions!  Vscode-Tab-Labels only works on files from your file system.  If you would like to rename this tab, I recommend opening a ticket with the extension authors that created it.');
}

export function activate(context: vscode.ExtensionContext) {
	const tabLabels = new TabLabels(context);
	context.subscriptions.push(vscode.commands.registerCommand("rename-tabs.tabLabels.renameActiveTab", () => {
		let activeTab: vscode.Tab | null = null;
		out: for (const tg of vscode.window.tabGroups.all) {
			if (!tg.isActive) {
				continue;
			}
			for (const tab of tg.tabs) {
				if (tab.isActive) {
					activeTab = tab;
					break out;
				}
			}
		}

		if (!activeTab) {
			vscode.window.showWarningMessage("[WARN] Could not find active tab.");
			return;
		}

		if (activeTab.input instanceof vscode.TabInputText || activeTab.input instanceof vscode.TabInputNotebook) {
			return tabLabels.renameTab(activeTab.input.uri);
		}
		return emitErrorUnableToRename();
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
