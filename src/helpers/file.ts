import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import Constants from './constants';

function findFilesWithName(folderPath: string, fileName: string, result: string[] = []) {
    const items = fs.readdirSync(folderPath);

    for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
            findFilesWithName(itemPath, fileName, result);
        } else if (stats.isFile() && item === fileName) {
            result.push(itemPath);
        }
    }

    return result;
}

export function cartridgePathFinder() {
    try {
        const basePath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '';
        const metadataFolder = path.join(basePath, "metadata");
        const siteXMLs = findFilesWithName(metadataFolder, "site.xml");
        let cartridgePath = "";

        siteXMLs.forEach(siteXML => {
            const read = fs.readFileSync(siteXML, 'utf-8');
            const customCartridgesStart = read.indexOf("<custom-cartridges>");
            const customCartridgesEnd = read.indexOf("</custom-cartridges>");
            const siteXMLCartridgePath = read.substring(customCartridgesStart + "<custom-cartridges>".length, customCartridgesEnd);
            if (siteXMLCartridgePath.length > cartridgePath.length) {
                cartridgePath = siteXMLCartridgePath;
            }
        });

        return cartridgePath;
    } catch (error) {
        vscode.window.showErrorMessage("Error while trying to get the cartridge path through site.xml");
    }
}

export function getFileName(uri: vscode.Uri | string): string {
    if (typeof uri === "string") {
        return uri.substring(uri.lastIndexOf(path.sep) + path.sep.length, uri.length);
    } else {
        return uri.fsPath.substring(uri.fsPath.lastIndexOf(path.sep) + path.sep.length, uri.fsPath.length);
    }
}

export function getCartridgeName(uri: string): string {
    const startIndex = uri.indexOf(Constants.CartridgesToSplit) + Constants.CartridgesToSplit.length;
    const endIndex = uri.indexOf(Constants.CartridgeToSplit, startIndex);
    const cartridgeName = uri.substring(startIndex, endIndex);

    return cartridgeName;
}