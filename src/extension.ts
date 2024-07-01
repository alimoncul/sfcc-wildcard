import * as vscode from 'vscode';
import { ImportDefinitionProvider } from './definitionProvider';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    const provider = new ImportDefinitionProvider();
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            { scheme: 'file', language: 'javascript' },
            provider
        )
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}