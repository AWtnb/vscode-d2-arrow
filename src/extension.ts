import * as vscode from "vscode";
import { branchCursors, continueCursors } from "./continue";
import { swapCursors } from "./swap";

const toLineBreak = (editor: vscode.TextEditor): string => {
  return editor.document.eol === 1 ? "\n" : "\r\n";
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("d2-arrow.continue", (editor: vscode.TextEditor) => {
      const linebreak = toLineBreak(editor);
      continueCursors(editor, linebreak);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("d2-arrow.branch", (editor: vscode.TextEditor) => {
      const linebreak = toLineBreak(editor);
      branchCursors(editor, linebreak);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("d2-arrow.swap", (editor: vscode.TextEditor) => {
      swapCursors(editor);
    })
  );
}

export function deactivate() {}

