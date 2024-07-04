import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { cartridgePathFinder } from './helpers/file';

export class ImportDefinitionProvider implements vscode.DefinitionProvider {
    resolvedPaths: string[] = [];
    importPath: string = "";
    importPathMatch: string = "";
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.LocationLink[]> {
        // Get the full line text at the current position
        const line = document.lineAt(position).text;

        this.resolveImportPath(line);

        if (this.resolvedPaths && this.resolvedPaths.length) {
            // Find the start and end positions of the import path in the line
            const startPos = line.indexOf(this.importPathMatch) + this.importPathMatch.indexOf(this.importPath);
            const endPos = startPos + this.importPath.length;

            // Create a range for the entire import path
            const range = new vscode.Range(
                new vscode.Position(position.line, startPos),
                new vscode.Position(position.line, endPos)
            );

            const targetRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));

            return [
                {
                    originSelectionRange: range,
                    targetUri: vscode.Uri.file(this.resolvedPaths[0]),
                    targetRange: targetRange
                }
            ];
        }
    }

    private resolveImportPath(line: string): void {
        this.resolvedPaths = [];

        // Regular expression to match the entire import path
        const importPathMatch = line.match(/require\(['"](\*\/[^'"]+)['"]\)/);

        if (!importPathMatch || importPathMatch.length < 2) {
            this.importPath = "";
            this.importPathMatch = "";
            return;
        }

        const importPath = importPathMatch[1];
        if (!importPath.startsWith('*/')) {
            this.importPath = importPath;
            this.importPathMatch = importPathMatch[0];
            return;
        }

        const basePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || ''; // Get the workspace root path
        const cartridgePath = cartridgePathFinder();
        const cartridges = cartridgePath?.split(":");
        if (cartridges?.length) {
            for (let i = 0; i < cartridges.length; i += 1) {
                const cartridge = cartridges[i];
                const withCartridges = path.join(basePath, "cartridges", cartridge);
                const relativePath = importPath.replace('*/', '');
                const resolvedPath = path.join(withCartridges, relativePath + '.js'); // Adjust the extension if necessary

                if (fs.existsSync(resolvedPath)) {
                    this.resolvedPaths.push(resolvedPath);
                }
            }

            if (this.resolvedPaths.length === 0) {
                vscode.window.showInformationMessage("Relative file could not be found in the cartridge path.");
            }

            this.importPath = importPath;
            this.importPathMatch = importPathMatch[0];
            return;
        }

        vscode.window.showWarningMessage("Cartridge path is not set, extension will not work!");
        vscode.commands.executeCommand('workbench.action.openSettings', 'sfcc.wildcard.cartridgePath');
    }
}