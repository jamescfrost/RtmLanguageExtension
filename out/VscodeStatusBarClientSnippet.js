"use strict";
// Add this to the VS Code extension client setup, after the LanguageClient is created.
// It renders server rtm/status notifications in the VS Code status bar.
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
exports.registerRtmStatusBar = void 0;
const vscode = __importStar(require("vscode"));
function registerRtmStatusBar(context, client) {
    const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    status.name = 'RTM Language Server';
    status.text = '$(circle-outline) RTM';
    status.tooltip = 'RTM Language Server';
    status.show();
    let clearTimer;
    const disposable = client.onNotification('rtm/status', (payload) => {
        if (clearTimer) {
            clearTimeout(clearTimer);
            clearTimer = undefined;
        }
        const message = payload?.message?.trim() || 'RTM: Working';
        const prefix = payload?.busy ? '$(sync~spin)' : '$(check)';
        status.text = `${prefix} ${message}`;
        status.tooltip = message;
        status.show();
        if (!payload?.busy) {
            clearTimer = setTimeout(() => {
                status.text = '$(check) RTM: Ready';
                status.tooltip = 'RTM Language Server ready';
            }, 5000);
        }
    });
    context.subscriptions.push(status, disposable, {
        dispose: () => {
            if (clearTimer)
                clearTimeout(clearTimer);
        }
    });
}
exports.registerRtmStatusBar = registerRtmStatusBar;
//# sourceMappingURL=VscodeStatusBarClientSnippet.js.map