import * as path from 'path';
import * as vscode from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

export function activate(context: vscode.ExtensionContext) {
  const serverDll = path.resolve(
    context.extensionPath,
    '..',
    'RtmLanguageServer',
    'src',
    'RtmLanguageServer',
    'bin',
    'Debug',
    'net10.0',
    'RtmLanguageServer.dll'
  );

  const serverOptions: ServerOptions = {
    command: 'dotnet',
    args: [serverDll]
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'rtm' }]
  };

  client = new LanguageClient(
    'rtmLanguageServer',
    'RTM Language Server',
    serverOptions,
    clientOptions
  );

  client.start();
  context.subscriptions.push(client);
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}
