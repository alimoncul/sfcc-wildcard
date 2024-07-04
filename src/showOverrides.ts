import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { cartridgePathFinder } from './helpers/file';
import { PickerOption } from './types';

export function showOverrides() {
    const basePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || ''; // Get the workspace root path
    const cartridgePath = cartridgePathFinder();
    const cartridges = cartridgePath?.split(":");
    const overrideFiles: PickerOption[] = [];
    let currentCartridge = "";

    if (cartridges?.length) {
        for (let i = 0; i < cartridges.length; i += 1) {
            const cartridge = cartridges[i];
            const withCartridges = path.join(basePath, "cartridges", cartridge);
            const uri = vscode.window.activeTextEditor?.document?.uri?.fsPath;
            if (uri) {
                const cartridgeToSplit = path.sep + "cartridge" + path.sep;
                const cartridgesToSplit = path.sep + "cartridges" + path.sep;
                const indexToSplit = uri.indexOf(cartridgeToSplit);

                if (indexToSplit >= 0) {
                    const filePath = uri.slice(uri.indexOf(cartridgeToSplit) + cartridgeToSplit.length);
                    const overridePath = path.join(withCartridges, cartridgeToSplit, filePath);

                    const startIndex = uri.indexOf(cartridgesToSplit) + cartridgesToSplit.length;
                    const endIndex = uri.indexOf(cartridgeToSplit, startIndex);
                    const cartridgeName = uri.substring(startIndex, endIndex);

                    if (cartridgeName === cartridge) {
                        currentCartridge = cartridge;
                    }

                    if (fs.existsSync(overridePath)) {
                        overrideFiles.push({
                            uri: overridePath,
                            label: cartridge
                        });
                    }
                }

            }
        }

        if (overrideFiles.length) {
            const reverse = overrideFiles.reverse();
            const quickPick = vscode.window.createQuickPick<PickerOption>();

            quickPick.items = reverse;
            quickPick.canSelectMany = false;
            quickPick.activeItems = reverse.filter((po) => po.label === currentCartridge);

            quickPick.onDidChangeSelection((selection) => {
                const selectedItem = selection[0];
                if (selectedItem?.uri) {
                    const fileUri = vscode.Uri.file(selectedItem?.uri?.toString());
                    vscode.window.showTextDocument(fileUri);
                    quickPick.dispose();
                }
            });

            quickPick.onDidHide(() => quickPick.dispose());
            quickPick.show();
        }

    }

}