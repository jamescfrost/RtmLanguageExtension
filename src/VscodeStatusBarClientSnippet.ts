// Add this to the VS Code extension client setup, after the LanguageClient is created.
// It renders server rtm/status notifications in the VS Code status bar.

import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

export function registerRtmStatusBar(context: vscode.ExtensionContext, client: LanguageClient): void {
    const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    status.name = 'RTM Language Server';
    status.text = '$(circle-outline) RTM';
    status.tooltip = 'RTM Language Server';
    status.show();

    let clearTimer: NodeJS.Timeout | undefined;

    const disposable = client.onNotification('rtm/status', (payload: { message?: string; busy?: boolean }) => {
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
            if (clearTimer) clearTimeout(clearTimer);
        }
    });
}
