# Rename Tabs README

## Features

Adds the ability to rename the display text of a given tab in the context menu of that tab.  Right click the tab and hit 'Rename Tab'.

Also adds the ability to remove the extension from all open tab labels, and clear any edits to tab labels.

NOTE: These labels will stay persistent when you close VS Code and across computers (as long as you include .vscode/settings.json in your git), but the tab labels will NOT persist when you move a file.  Tab label names are tracked by VS Code via the PATH of a file, so when the file is moved it will lose its label name.

## Release Notes

### 0.0.1

Initial release of Rename Tabs