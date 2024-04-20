/* eslint-disable curly */
import * as vscode from 'vscode';
import { ConfigurationTarget, workspace } from 'vscode';
import * as extension from './extension';

export class TabLabels {
    constructor () {}

    private getRelativePath (uri: vscode.Uri): string {
        // Remove the extension root path from the pattern
        let relativePath = uri.fsPath.replaceAll(extension.rootPath.fsPath, '').replaceAll('\\', '/');
        if (relativePath.startsWith('/')) {
            relativePath = relativePath.substring(1);
        }
        return relativePath;
    }

    private getFileName (uri: vscode.Uri): string {
        const segments = uri.path.split('/');
        const fileName = segments[segments.length - 1];
        return fileName;
    }

    async renameTab (uri: vscode.Uri) {
        const configuration = workspace.getConfiguration();
        configuration.update('workbench.editor.customLabels.enabled', true, ConfigurationTarget.Workspace);


        const relativePath = this.getRelativePath(uri);
        const fileName = this.getFileName(uri);
        const newName = await vscode.window.showInputBox({
            placeHolder: fileName,
            prompt: `What would you like to rename '${fileName}'?`,
            ignoreFocusOut: false,
            value: fileName,
            valueSelection: [0, fileName.length]
        });
        if (!newName) return;
        
        const oldPatterns: { [index: string]: string} = await configuration.get('workbench.editor.customLabels.patterns') || {};
        const finalPatterns = { ...oldPatterns };
        finalPatterns[relativePath] = newName;

        return configuration.update('workbench.editor.customLabels.patterns', finalPatterns, ConfigurationTarget.Workspace);
    }

    async removeExtensionsForOpenTabs () {
        const configuration = workspace.getConfiguration();
        configuration.update('workbench.editor.customLabels.enabled', true, ConfigurationTarget.Workspace);
    
        const newPatterns: { [index: string]: string } = {};
        for (const group of vscode.window.tabGroups.all) {
            for (const tab of group.tabs) {
                if (!(tab.input instanceof vscode.TabInputText)) continue;
    
                const uri = tab.input.uri;
                const relativePath = this.getRelativePath(uri);
                const fileName = this.getFileName(uri);
                const fileNameSegments = fileName.split('.');
                const fileNameNoExt = fileNameSegments[0];
    
                // If the node was found in the recycling bin, mark it as deleted in the label so the user knows
                newPatterns[relativePath] = fileNameNoExt;
            }
        }
    
        const oldPatterns: { [index: string]: string} = await configuration.get('workbench.editor.customLabels.patterns') || {};
        const combinedPatterns = { ...oldPatterns, ...newPatterns };
        return configuration.update('workbench.editor.customLabels.patterns', combinedPatterns, ConfigurationTarget.Workspace);
    }
    
    async clearNamesForAllTabs () {
        const configuration = workspace.getConfiguration();
        configuration.update('workbench.editor.customLabels.enabled', true, ConfigurationTarget.Workspace);
        return configuration.update('workbench.editor.customLabels.patterns', {}, ConfigurationTarget.Workspace);
    }
}
