"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const node_1 = require("vscode-languageclient/node");
let client;
function activate(context) {
    const serverDll = path.join(context.extensionPath, 'server', 'rtm-language-server.dll');
    const serverOptions = {
        command: 'dotnet',
        args: [serverDll]
    };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'rtm' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.rtm')
        }
    };
    client = new node_1.LanguageClient('rtmLanguageServer', 'RTM Language Server', serverOptions, clientOptions);
    const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    status.name = "RTM Language Server";
    status.text = "$(circle-outline) RTM";
    status.show();
    context.subscriptions.push(status);
    client.onNotification("rtm/status", (payload) => {
        const message = payload?.message ?? "RTM: Working";
        status.text = `${payload?.busy ? "$(sync~spin)" : "$(check)"} ${message}`;
        status.tooltip = message;
    });
    client.start();
    context.subscriptions.push(client);
}
exports.activate = activate;
function deactivate() {
    return client?.stop();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map