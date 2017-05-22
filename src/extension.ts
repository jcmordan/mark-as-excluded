'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  const filesExcludeKey = 'files.exclude';

  function getUserConfigurationFilePath() {
    return vscode.workspace.rootPath + '/.vscode/settings.json';
  }

  function getWorkspaceConfiguration() {
    let configFile = vscode.workspace.rootPath + '/.vscode/settings.json';
    let jsonData = fs.readFileSync(configFile, { encoding: 'utf8' });
    return JSON.parse(jsonData);
  }

  function saveConfiguration(config: any) {
    let configFile = getUserConfigurationFilePath();
    let jsonData = JSON.stringify(config, null, 2);
    jsonData = jsonData.replace(/^[^{]+|[^}]+$/, '').replace(/(.+?[^:])\/\/.+$/gm, '$1');
    fs.writeFileSync(configFile, jsonData, { encoding: 'utf8' });
  }

  // The explorer/context menu contribution receives the URI to the file/folder
  let command = vscode.commands.registerCommand('extension.exclude', (e: vscode.Uri) => {
    if (!e) {
      vscode.window.showInformationMessage('Nothing is selected!');
      return;
    }

    let config = getWorkspaceConfiguration();
    let elementToIgnore = '**' + e.path.substring(vscode.workspace.rootPath.length + 1);

    if (!config[filesExcludeKey]) {
      config[filesExcludeKey] = {};
    }

    if (!config[filesExcludeKey][elementToIgnore]) {
      config[filesExcludeKey][elementToIgnore] = true;
    }

    saveConfiguration(config);
    vscode.window.showInformationMessage('Excluded: ' + elementToIgnore);
  });

  context.subscriptions.push(command);
}

// this method is called when your extension is deactivated
export function deactivate() {
}