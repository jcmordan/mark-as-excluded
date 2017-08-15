'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as winston from 'winston';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  const filesExcludeKey = 'files.exclude';
  const filesIgnoreKey = 'search.exclude';

  winston.configure({
    transports: [
      new (winston.transports.File)({ filename: 'mark-as-exlude.log' })
    ]
  });

  function getUserConfigurationFilePath() {
    return vscode.workspace.rootPath + '/.vscode/settings.json';
  }

  function getWorkspaceConfiguration() {
    let configFile = getUserConfigurationFilePath();

    let jsonData = '{}';

    try {
      fs.accessSync(configFile);
      jsonData = fs.readFileSync(configFile, { encoding: 'utf8' });
    } catch (err) {
       winston.log('error', 'reading config file', { details: err });
      // do nothing, the file will be created
    }

    return JSON.parse(jsonData);
  }

  function saveConfiguration(config: any): boolean {
    let configFile = getUserConfigurationFilePath();
    let jsonData = JSON.stringify(config, null, 2);
    jsonData = jsonData.replace(/^[^{]+|[^}]+$/, '').replace(/(.+?[^:])\/\/.+$/gm, '$1');

     winston.log('info', 'saving config file', { details: config });
    try {
      fs.writeFileSync(configFile, jsonData, { encoding: 'utf8' });
      return true;
    } catch (err) {
      winston.log('error', 'saving config file', { details: err });
      vscode.window.showInformationMessage('The file could not be exclued, verify you have access');
      return false;
    }
  }

  function applyConfiguration(e: vscode.Uri, config: any, key: string) {
    let element = '**' + e.path.substring(vscode.workspace.rootPath.length + 1);

    if (!config[key]) {
      config[key] = {};
    }

    if (!config[key][element]) {
      config[key][element] = true;
    }

    if (saveConfiguration(config)) {
      if (key === 'files.exclude') {
        vscode.window.showInformationMessage('Excluded from workspace: ' + element);
      } else {
        vscode.window.showInformationMessage('Excluded from search: ' + element);
      }
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