import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { cartridgePathFinder, getCartridgeName, getFileName } from './helpers/file';
import Constants from './helpers/constants';
import { PickerOption } from './types';
import { Cache } from './cache';

export function showOverrides() {
    const cache = Cache.getInstance();

    const basePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '';
    const cartridgePath = cartridgePathFinder();
    const cartridges = cartridgePath?.split(":");

    let overrideFiles: PickerOption[] = [];
    let currentCartridge = "";
    let fileName = "";
    let cacheShouldUpdate = false;

    const uri = vscode.window.activeTextEditor?.document?.uri?.fsPath;

    if (cartridges?.length && uri) {
        fileName = getFileName(uri);
        currentCartridge = getCartridgeName(uri);
        const cached = cache.get(fileName);
        if (cached && cached.length) {
            overrideFiles = cached;
        } else {
            for (let i = 0; i < cartridges.length; i += 1) {
                const cartridge = cartridges[i];
                const withCartridges = path.join(basePath, "cartridges", cartridge);

                const indexToSplit = uri.indexOf(Constants.CartridgeToSplit);

                if (indexToSplit >= 0) {
                    const filePath = uri.slice(uri.indexOf(Constants.CartridgeToSplit) + Constants.CartridgeToSplit.length);
                    const overridePath = path.join(withCartridges, Constants.CartridgeToSplit, filePath);

                    if (fs.existsSync(overridePath)) {
                        cacheShouldUpdate = true;
                        overrideFiles.push({
                            uri: overridePath,
                            label: cartridge
                        });
                    }
                }
            }
        }

        if (overrideFiles.length) {
            const quickPick = vscode.window.createQuickPick<PickerOption>();

            quickPick.items = overrideFiles;
            quickPick.canSelectMany = false;
            quickPick.activeItems = overrideFiles.filter((file) => file.label === currentCartridge);

            if (cacheShouldUpdate) {
                cache.set(fileName, overrideFiles);
            }

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