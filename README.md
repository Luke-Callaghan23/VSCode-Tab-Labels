# Rename Tabs README

## Features

Adds the ability to rename the display text of a given tab in the context menu of that tab.  Right click the tab and hit 'Rename Tab'.

Also adds the ability to remove the extension from all open tab labels, and clear any edits to tab labels.

NOTE: These labels will stay persistent when you close VS Code and across computers (as long as you include .vscode/settings.json in your git), but the tab labels will NOT persist when you move a file.  Tab label names are tracked by VS Code via the PATH of a file, so when the file is moved it will lose its label name.

## Release Notes

### 0.0.1

Initial release of Rename Tabs

### 0.0.2

Fixed relative pathing (new vscode updates requires '*/' to be inserted in front of relative paths).

Added 'Rename Active Document' command.

### 0.0.3

Added support for renaming files outside of a VS Code Workspace after issue #3 was brought up.  rename-tabs was not originally intended for use in workspaces only, but I decided to allow absolute paths in the global VS Code settings as it seems it will help some users.