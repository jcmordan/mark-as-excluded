'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  const filesExcludeKey = 'files.exclude';
  const filesIgnoreKey = 'search.exclude';

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

  function applyConfiguration(e: vscode.Uri, config: any, key: string) {
    let element = '**' + e.path.substring(vscode.workspace.rootPath.length + 1);

    if (!config[key]) {
      config[key] = {};
    }

    if (!config[key][element]) {
      config[key][element] = true;
    }

    saveConfiguration(config);

    if (key === 'files.exclude') {
      vscode.window.showInformationMessage('Excluded from workspace: ' + element);
    } else {
      vscode.window.showInformationMessage('Excluded from search: ' + element);
    }
  }

  function validateSelectedElement(e: vscode.Uri) {
    if (!e) {
      vscode.window.showInformationMessage('Nothing is selected!');
      return false;
    } else {
      return true;
    }
  }

  // The explorer/context menu contribution receives the URI to the file/folder
  let excludeCommand = vscode.commands.registerCommand('extension.exclude', (e: vscode.Uri) => {
    if (!validateSelectedElement(e)) {
      return;
    }

    let config = getWorkspaceConfiguration();
    applyConfiguration(e, config, filesExcludeKey);
  });

  let ignoreCommand = vscode.commands.registerCommand('extension.ignore', (e: vscode.Uri) => {
    if (!validateSelectedElement(e)) {
      return;
    }

    let config = getWorkspaceConfiguration();
    applyConfiguration(e, config, filesIgnoreKey);
  });

  context.subscriptions.push(excludeCommand);
  context.subscriptions.push(ignoreCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
}