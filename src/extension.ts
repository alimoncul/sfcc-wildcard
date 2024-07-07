import * as vscode from 'vscode';
import { ImportDefinitionProvider } from './definitionProvider';
import { showOverrides } from './showOverrides';
import { Cache } from './cache';
import { createFileSystemWatcher } from './watcher';

export function activate(context: vscode.ExtensionContext) {
    Cache.getInstance();

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            { scheme: 'file', language: 'javascript' },
            new ImportDefinitionProvider()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sfcc.wildcard.showOverrides', showOverrides)
    );

    context.subscriptions.push(createFileSystemWatcher());
}

export function deactivate() { }