import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { cartridgePathFinder } from './helpers/file';
import Constants from './helpers/constants';

export class ImportDefinitionProvider implements vscode.DefinitionProvider {
    resolvedPaths: string[] = [];
    importPath: string = "";
    importPathMatch: string = "";
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.LocationLink[]> {
        const line = document.lineAt(position).text;

        this.resolveImportPath(line);

        if (this.resolvedPaths && this.resolvedPaths.length) {
            const startPos = line.indexOf(this.importPathMatch) + this.importPathMatch.indexOf(this.importPath);
            const endPos = startPos + this.importPath.length;

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

        const overrideImportPathMatch = line.match(/require\(['"](\*\/[^'"]+)['"]\)/);
        const sameImportPathMatch = line.match(/require\(['"](\~\/[^'"]+)['"]\)/);

        if (!overrideImportPathMatch && !sameImportPathMatch) {
            this.importPath = "";
            this.importPathMatch = "";
            return;
        }

        const importToCalculate = overrideImportPathMatch || sameImportPathMatch;

        if (!importToCalculate || importToCalculate.length < 2) {
            this.importPath = "";
            this.importPathMatch = "";
            return;
        }

        const importPath = importToCalculate[1];
        let validImport = false;
        let isLocalImport = false;

        if (importPath.startsWith('*/')) {
            validImport = true;
        } else if (importPath.startsWith('~/')) {
            validImport = true;
            isLocalImport = true;
        }

        if (!validImport) {
            this.importPath = importPath;
            this.importPathMatch = importToCalculate[0];
            return;
        }

        const basePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '';
        const cartridgePath = cartridgePathFinder();
        const cartridges = cartridgePath?.split(":");

        if (isLocalImport) {
            const currentPath = vscode.window.activeTextEditor?.document?.uri?.fsPath;

            if (currentPath) {
                const startIndex = currentPath.indexOf(Constants.CartridgesToSplit) + Constants.CartridgesToSplit.length;
                const endIndex = currentPath.indexOf(Constants.CartridgeToSplit, startIndex);
                const cartridgeName = currentPath.substring(startIndex, endIndex);

                const withCartridges = path.join(basePath, "cartridges", cartridgeName);
                const relativePath = importPath.replace('~/', '');
                const jsExtensionAddedBefore = relativePath.includes(".js");

                const resolvedPath = path.join(withCartridges, jsExtensionAddedBefore ? relativePath : relativePath + '.js');

                if (fs.existsSync(resolvedPath)) {
                    this.resolvedPaths.push(resolvedPath);
                }

                if (this.resolvedPaths.length === 0) {
                    vscode.window.showInformationMessage("Relative file could not be found in the cartridge path.");
                }

                this.importPath = importPath;
                this.importPathMatch = importToCalculate[0];
                return;
            }
        }

        if (cartridges?.length) {
            for (let i = 0; i < cartridges.length; i += 1) {
                const cartridge = cartridges[i];
                const withCartridges = path.join(basePath, "cartridges", cartridge);
                const relativePath = importPath.replace('*/', '');
                const jsExtensionAddedBefore = relativePath.includes(".js");

                const resolvedPath = path.join(withCartridges, jsExtensionAddedBefore ? relativePath : relativePath + '.js');

                if (fs.existsSync(resolvedPath)) {
                    this.resolvedPaths.push(resolvedPath);
                }
            }

            if (this.resolvedPaths.length === 0) {
                vscode.window.showInformationMessage("Relative file could not be found in the cartridge path.");
            }

            this.importPath = importPath;
            this.importPathMatch = importToCalculate[0];
            return;
        }

        vscode.window.showWarningMessage("Cartridge path is not set, extension will not work!");
        vscode.commands.executeCommand('workbench.action.openSettings', 'sfcc.wildcard.cartridgePath');
    }
}