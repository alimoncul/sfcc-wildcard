import * as vscode from 'vscode';
import { Cache } from './cache';
import { getFileName } from './helpers/file';

export function createFileSystemWatcher() {
    const cache = Cache.getInstance();
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');

    const on = (uri: vscode.Uri) => {
        const fileName = getFileName(uri);
        if (fileName) {
            cache.delete(fileName);
        }
    };

    fileWatcher.onDidCreate(on);
    fileWatcher.onDidDelete(on);

    return fileWatcher;
}