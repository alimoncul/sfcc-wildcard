import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { cartridgePathFinder } from './helpers/file';

export function showOverrides() {
    const basePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || ''; // Get the workspace root path
    const cartridgePath = cartridgePathFinder();
    const cartridges = cartridgePath?.split(":");
    const overrideFiles: { label: string, uri: string }[] = [];

    if (cartridges?.length) {
        for (let i = 0; i < cartridges.length; i += 1) {
            const cartridge = cartridges[i];
            const withCartridges = path.join(basePath, "cartridges", cartridge);
            const uri = vscode.window.activeTextEditor?.document?.uri?.fsPath;
            if (uri) {
                const cartridgeToSplit = path.sep + "cartridge" + path.sep;
                const indexToSplit = uri.indexOf(cartridgeToSplit);

                if (indexToSplit >= 0) {
                    const filePath = uri.slice(uri.indexOf(cartridgeToSplit) + cartridgeToSplit.length);
                    const overridePath = path.join(withCartridges, cartridgeToSplit, filePath);
                    const isSelf = uri.includes(cartridge);

                    if (fs.existsSync(overridePath)) {
                        overrideFiles.push({
                            uri: overridePath,
                            label: isSelf ? "Current - " + cartridge : cartridge
                        });
                    }
                }

            }
        }

        if (overrideFiles.length) {
            const reverse = overrideFiles.reverse();
            vscode.window.showQuickPick(reverse, {
                onDidSelectItem: (item) => {
                    // const fileUri = vscode.Uri.file(item.toString());
                    // vscode.window.showTextDocument(fileUri);
                }
            });

        }

    }

}