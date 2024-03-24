import * as vscode from "vscode";
import { D2Line } from "./d2line";

export const swapCursors = (editor: vscode.TextEditor) => {
  const workspaceEdit = new vscode.WorkspaceEdit();

  editor.selections.forEach((sel: vscode.Selection) => {
    if (sel.isEmpty) {
      const line = editor.document.lineAt(sel.start);
      const indent = line.text.substring(0, line.firstNonWhitespaceCharacterIndex);
      const content = line.text.substring(line.firstNonWhitespaceCharacterIndex);
      const d2line = new D2Line(content);
      const swapped = d2line.Swap();
      workspaceEdit.replace(editor.document.uri, line.range, indent + swapped);
      return;
    }
    const d2line = new D2Line(editor.document.getText(sel));
    const swapped = d2line.Swap();
    workspaceEdit.replace(editor.document.uri, sel, swapped);
  });

  vscode.workspace.applyEdit(workspaceEdit).then(() => {
    const newSels = editor.selections.map((sel) => {
      if (sel.isEmpty) {
        return sel;
      }
      const s = new vscode.Selection(sel.end, sel.end);
      return s;
    });
    editor.selections = newSels;
  });
};
