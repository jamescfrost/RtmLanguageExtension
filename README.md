# RTM Language Support for Visual Studio Code

Visual Studio Code language support for `.rtm` (Runtime Macro) source files.

The extension combines a TextMate grammar and editor configuration with a Language
Server Protocol (LSP) client. Language-aware features are provided by the bundled
.NET server built from the
[RtmLanguageServer](https://github.com/jamescfrost/RtmLanguageServer) project.
That repository is the recommended and canonical language server implementation
for this extension.

## Core functionality

### Editing support

- Registers `.rtm` files as the `rtm` language.
- TextMate syntax highlighting for RTM directives, areas, procedures, fields,
  data types, operators, strings, comments, and built-in functions.
- RTM line comments and automatic closing/surrounding pairs for brackets,
  parentheses, quotes, and carets.
- Semantic highlighting for resolved overlays, procedures, fields, files, and
  other symbols.

### Language intelligence

- **Go to Definition** (`F12`) for indexed RTM symbols.
- **Find All References** (`Shift+F12`), including cross-file references.
- **Hover information** with symbol type, signature/details, and source file.
- **Diagnostics** for syntax and analysis errors as documents change.
- Workspace-wide indexing of `.rtm` files.
- Cross-file symbol resolution and `$INCLUDE` preprocessing with source mapping.
- A status bar item that reports language server workspace-loading and ready
  states.

The current language server does not provide code completion or signature help.
See the
[RtmLanguageServer issues](https://github.com/jamescfrost/RtmLanguageServer/issues)
for planned server enhancements.

## Requirements

### Using the extension

- Visual Studio Code 1.120.0 or later.
- .NET 10 Runtime or SDK available through the `dotnet` command.

The packaged server is framework-dependent. The extension starts it with:

```text
dotnet <extension-directory>/server/rtm-language-server.dll
```

### Building and packaging

- Node.js with npm.
- .NET 10 SDK.
- Java 17 or later on `PATH`; the language server build uses Java to generate
  its ANTLR parser.

## Installation

### Install a VSIX in Visual Studio Code

1. Obtain the `.vsix` file from this project's releases or build it by following
   [Producing a VSIX](#producing-a-vsix).
2. In Visual Studio Code, open the Command Palette.
3. Run **Extensions: Install from VSIX...**.
4. Select the `.vsix` file and reload Visual Studio Code if prompted.

You can also install from a terminal:

```powershell
code --install-extension .\rtm-language-support-0.1.0.vsix
```

Use `--force` when replacing an installed build with another VSIX that has the
same version:

```powershell
code --install-extension .\rtm-language-support-0.1.0.vsix --force
```

Open a folder containing `.rtm` files after installation. The extension activates
when an RTM file is opened, launches the bundled server, and indexes the workspace.

## Development setup

Clone this extension and the recommended language server as sibling directories:

```text
RtmLanguageSupport/
|-- RtmLanguageExtension/
`-- RtmLanguageServer/
```

From `RtmLanguageExtension`, install the extension dependencies:

```powershell
npm ci
```

Publish the language server into the extension's `server` directory:

```powershell
dotnet publish ..\RtmLanguageServer\src\RtmLanguageServer.App\RtmLanguageServer.App.csproj -c Release -o .\server
```

Compile the TypeScript client:

```powershell
npm run compile
```

Open `RtmLanguageExtension` in Visual Studio Code and press `F5` to start an
Extension Development Host. Open a folder containing `.rtm` files in that host
to exercise both the client and server.

For server development, tests, grammar details, and the server's internal
architecture, refer to the
[RtmLanguageServer repository](https://github.com/jamescfrost/RtmLanguageServer).

## Producing a VSIX

A production VSIX must contain both the compiled TypeScript client and the
published .NET language server.

From the extension repository root:

```powershell
npm ci
dotnet publish ..\RtmLanguageServer\src\RtmLanguageServer.App\RtmLanguageServer.App.csproj -c Release -o .\server
npm run package
```

`npm run package` runs `vsce package`; VS Code's `vscode:prepublish` hook compiles
the TypeScript client before packaging. The resulting file is written to the
repository root using the extension name and version, for example:

```text
rtm-language-support-0.1.0.vsix
```

Before distributing the package:

1. Install the generated VSIX in a clean VS Code profile or test environment.
2. Confirm that opening an `.rtm` file starts the server and changes the RTM
   status bar item to `RTM: Ready`.
3. Verify syntax highlighting, diagnostics, hover, definition, references, and
   semantic highlighting in a multi-file workspace.
4. Confirm that the target machine has the .NET 10 runtime installed.

The `server` directory is intentionally included in the VSIX, while TypeScript
sources, development settings, dependencies, and existing VSIX files are
excluded by `.vscodeignore`.

## Architecture

```text
.rtm files
    |
    +--> VS Code declarative contributions
    |      |-- language-configuration.json
    |      `-- syntaxes/rtm.tmLanguage.json
    |
    `--> Extension host (out/extension.js)
             |
             | stdio, JSON-RPC / LSP
             v
         server/rtm-language-server.dll
             |
             +-- RtmLanguageServer.Protocol
             |      JSON-RPC transport, document store, LSP handlers
             |
             `-- RtmLanguageServer.Core
                    ANTLR parsing, preprocessing, workspace index,
                    symbols, references, semantic analysis
```

### Extension layer

`package.json` declares the RTM language, `.rtm` file association, TextMate
grammar, editor configuration, activation event, and VS Code compatibility.

`src/extension.ts` is the runtime entry point. It:

1. Locates `server/rtm-language-server.dll` inside the installed extension.
2. launches the framework-dependent server with `dotnet`.
3. Connects `vscode-languageclient` to the server over standard input/output.
4. Limits LSP handling to file-backed RTM documents.
5. Watches `.rtm` files and displays server status notifications.

### Language server layer

The bundled binaries are release output from
[RtmLanguageServer](https://github.com/jamescfrost/RtmLanguageServer), which is
split into three projects:

- **RtmLanguageServer.Core** contains the ANTLR grammar, parser, preprocessor,
  source mapping, symbol model, semantic resolution, diagnostics, and workspace
  index. It has no LSP dependency.
- **RtmLanguageServer.Protocol** implements the raw JSON-RPC/LSP transport,
  document storage, workspace loading, diagnostics publishing, navigation,
  hover, and semantic tokens.
- **RtmLanguageServer.App** is the executable host. It connects the protocol
  server to standard input/output and sends logs to standard error so they do
  not corrupt LSP messages.

This separation keeps VS Code-specific concerns in the extension, protocol
concerns in the server's protocol project, and reusable RTM analysis in its core
library.

## Troubleshooting

- **The server does not start:** run `dotnet --list-runtimes` and confirm a
  `Microsoft.NETCore.App 10.x` runtime is installed.
- **The status remains busy:** open the **Output** panel and inspect the
  **RTM Language Server** output for server or workspace errors.
- **Language features are unavailable:** confirm the file has an `.rtm`
  extension and the language mode shown in the status bar is **RTM**.
- **A locally built VSIX uses old server behavior:** republish
  [RtmLanguageServer](https://github.com/jamescfrost/RtmLanguageServer) into
  `server` before running `npm run package`.

## Release notes

### 0.1.0

Initial release with RTM syntax highlighting, workspace analysis, semantic
tokens, diagnostics, hover information, go to definition, and find references.
