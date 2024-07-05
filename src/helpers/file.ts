import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

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