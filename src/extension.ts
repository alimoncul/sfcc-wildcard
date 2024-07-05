import * as vscode from 'vscode';
import { ImportDefinitionProvider } from './definitionProvider';
import { showOverrides } from './showOverrides';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            { scheme: 'file', language: 'javascript' },
            new ImportDefinitionProvider()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sfcc.wildcard.showOverrides', showOverrides)
    );
}

export function deactivate() { }