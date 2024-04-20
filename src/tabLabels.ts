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
        
        // Attempt to read this path from the old custom labels in the workspace settings to see if the user has ever
        //      renamed this tab before
        // If this tab has been renamed before, use the old label in the prompt, otherwise use the file name
        const oldPatterns: { [index: string]: string} = await configuration.get('workbench.editor.customLabels.patterns') || {};
        const oldName = relativePath in oldPatterns 
            ? oldPatterns[relativePath]
            : fileName;

        // Get label for this tab
        const newName = await vscode.window.showInputBox({
            placeHolder: oldName,
            prompt: `What would you like to rename '${oldName}'?`,
            ignoreFocusOut: false,
            value: oldName,
            valueSelection: [0, oldName.length]
        });
        if (newName === undefined || newName === null) return;
        
        // If the label was empty, remove the label
        const finalPatterns = { ...oldPatterns };   
        if (newName === '') {
            delete finalPatterns[relativePath];
        }
        else {
            finalPatterns[relativePath] = newName;
        }
        

        return configuration.update('workbench.editor.customLabels.patterns', finalPatterns, ConfigurationTarget.Workspace);
    }

    async removeExtensionsForOpenTabs () {
        const configuration = workspace.getConfiguration();
        configuration.update('workbench.editor.customLabels.enabled', true, ConfigurationTarget.Workspace);
        const oldPatterns: { [index: string]: string} = await configuration.get('workbench.editor.customLabels.patterns') || {};
    
        const newPatterns: { [index: string]: string } = {};
        for (const group of vscode.window.tabGroups.all) {
            for (const tab of group.tabs) {
                if (!(tab.input instanceof vscode.TabInputText)) continue;
    
                const uri = tab.input.uri;
                const relativePath = this.getRelativePath(uri);
                const fileName = this.getFileName(uri);
                const fileNameSegments = fileName.split('.');

                let finalName: string;
                if (fileNameSegments.length === 1) {
                    finalName = fileNameSegments[0];
                }
                else {
                    const allButLast = fileNameSegments.slice(0, fileNameSegments.length-1);
                    finalName = allButLast.join('.');
                }

                // Don't rename for those files who have already been renamed
                if (relativePath in oldPatterns) continue;

                // If the node was found in the recycling bin, mark it as deleted in the label so the user knows
                newPatterns[relativePath] = finalName;
            }
        }
    
        const combinedPatterns = { ...oldPatterns, ...newPatterns };
        return configuration.update('workbench.editor.customLabels.patterns', combinedPatterns, ConfigurationTarget.Workspace);
    }
    
    async clearNamesForAllTabs () {
        const configuration = workspace.getConfiguration();
        configuration.update('workbench.editor.customLabels.enabled', true, ConfigurationTarget.Workspace);
        return configuration.update('workbench.editor.customLabels.patterns', {}, ConfigurationTarget.Workspace);
    }
}
