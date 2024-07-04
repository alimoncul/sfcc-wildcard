import * as vscode from 'vscode';
import { ImportDefinitionProvider } from './definitionProvider';
import { showOverrides } from './showOverrides';

// This method is called when your extension is activated
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

// This method is called when your extension is deactivated
export function deactivate() { }