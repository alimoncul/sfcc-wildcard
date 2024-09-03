import * as path from 'path';
import * as vscode from 'vscode';

const constants = {
    CartridgeToSplit: path.sep + "cartridge" + path.sep,
    CartridgesToSplit: path.sep + "cartridges" + path.sep,
    OutputChannel: vscode.window.createOutputChannel("SFCC Wildcard"),
    CartridgePath: ""
};


export default constants;