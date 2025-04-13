/* eslint-disable curly */
import * as vscode from 'vscode';
import { ConfigurationTarget, workspace } from 'vscode';
import * as extension from './extension';
import * as nodePath from 'path';
const posixPath = nodePath.posix || nodePath;

export class TabLabels {
    constructor (
        private context: vscode.ExtensionContext
    ) {}

    private getRelativePath (uri: vscode.Uri): string {
        // Remove the extension root path from the pattern
        let relativePath = uri.fsPath.replaceAll(extension.rootPath.fsPath, '').replaceAll('\\', '/');
        if (relativePath.startsWith('/')) {
            relativePath = relativePath.substring(1);
        }
        return "*/" + relativePath;
    }

    checkIsChildDirectory (parentUri: vscode.Uri, childUri: vscode.Uri) {
        const parentPath = parentUri.fsPath;
        const childPath = childUri.fsPath;
        const relative = nodePath.relative(parentPath, childPath);
        return relative && !relative.startsWith('..') && !nodePath.isAbsolute(relative);
    }


    private getFileName (uri: vscode.Uri): string {
        return posixPath.basename(uri.path);
    }

    async renameTab (uri: vscode.Uri) {
        const configuration = workspace.getConfiguration();

        if (uri.scheme !== 'file') {
            return extension.emitErrorUnableToRename();
        }

        const updateTargetIsWorkspace = extension.isWorkspace && this.checkIsChildDirectory(extension.rootPath, uri);

        let targetPath: string;
        if (updateTargetIsWorkspace) {
            configuration.update('workbench.editor.customLabels.enabled', true, ConfigurationTarget.Workspace);

            const relativePath = this.getRelativePath(uri);
            targetPath = relativePath;
        }
        else {
            configuration.update('workbench.editor.customLabels.enabled', true, ConfigurationTarget.Global);

            // While not in a workspace, we use the absolute path of the file
            targetPath = uri.fsPath.replaceAll('\\', '/');

            // For windows, absolute paths start with a drive letter, e.g. C:, E:, D:
            //      but the patterns configuration expects absolute paths to start 
            //      with a '/'
            if (!targetPath.startsWith("/")) {
                targetPath = "/" + targetPath;
            }
        }

        const fileName = this.getFileName(uri);
        
        // Attempt to read this path from the old custom labels in the workspace settings to see if the user has ever
        //      renamed this tab before
        // If this tab has been renamed before, use the old label in the prompt, otherwise use the file name
        const oldPatterns: { [index: string]: string} = await configuration.get('workbench.editor.customLabels.patterns') || {};
        const oldName = targetPath in oldPatterns 
            ? oldPatterns[targetPath]
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
            delete finalPatterns[targetPath];
        }
        else {
            finalPatterns[targetPath] = newName;
        }
        
        if (updateTargetIsWorkspace) {
            return configuration.update('workbench.editor.customLabels.patterns', finalPatterns, ConfigurationTarget.Workspace);
        }
        else {
            if (!this.context.globalState.get('rename-tabs.showedGlobalWarning')) {
                vscode.window.showWarningMessage("[WARN] Renamed a file outside of a VS Code Workspace.  Could not update local Workspace settings, so Global VS Code settings were updated instead.");
                this.context.globalState.update('rename-tabs.showedGlobalWarning', true);
            }
            return configuration.update('workbench.editor.customLabels.patterns', finalPatterns, ConfigurationTarget.Global);
        }
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
