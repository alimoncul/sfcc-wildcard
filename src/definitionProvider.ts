import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { cartridgePathFinder } from './helpers/file';

export class ImportDefinitionProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.LocationLink[]> {
        // Get the full line text at the current position
        const line = document.lineAt(position).text;

        // Regular expression to match the entire import path
        const importPathMatch = line.match(/require\(['"](\*\/[^'"]+)['"]\)/);

        if (!importPathMatch || importPathMatch.length < 2) {
            console.log("No import path found");
            return;
        }

        const importPath = importPathMatch[1];
        if (!importPath.startsWith('*/')) {
            console.log("Import path does not start with '*/':", importPath);
            return;
        }

        const resolvedPath = this.resolveImportPath(importPath);
        if (resolvedPath && fs.existsSync(resolvedPath)) {
            // Find the start and end positions of the import path in the line
            const startPos = line.indexOf(importPathMatch[0]) + importPathMatch[0].indexOf(importPath);
            const endPos = startPos + importPath.length;

            // Create a range for the entire import path
            const range = new vscode.Range(
                new vscode.Position(position.line, startPos),
                new vscode.Position(position.line, endPos)
            );
            
            const targetRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));

            return [
                {
                    originSelectionRange: range,
                    targetUri: vscode.Uri.file(resolvedPath),
                    targetRange: targetRange
                }
            ];
        } else {
            console.log("Resolved path does not exist:", resolvedPath);
        }
    }

    private resolveImportPath(importPath: string): string {
        const basePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || ''; // Get the workspace root path
        const withCartridges = path.join(basePath, "cartridges", "int_adyen_SFRA");
        const relativePath = importPath.replace('*/', '');
        const resolvedPath = path.join(withCartridges, relativePath + '.js'); // Adjust the extension if necessary
        console.log("Resolving path:", resolvedPath);
        cartridgePathFinder();
        return resolvedPath;
    }
}