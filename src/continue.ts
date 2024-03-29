import * as vscode from "vscode";
import { D2Line } from "./d2line";

const makeSelection = (line: vscode.TextLine): vscode.Selection => {
  const maxChar = line.text.length;
  const char = line.text.endsWith(":") ? maxChar - 1 : maxChar;
  const pos = new vscode.Position(line.lineNumber, char);
  const sel = new vscode.Selection(pos, pos);
  return sel;
};

const applyEdit = (editor: vscode.TextEditor, workspaceEdit: vscode.WorkspaceEdit) => {
  vscode.workspace.applyEdit(workspaceEdit).then(() => {
    const newSels = editor.selections.map((sel) => {
      const line = editor.document.lineAt(sel.end);
      if (sel.end.character !== line.range.end.character) {
        const nextLine = editor.document.lineAt(sel.end.line + 1);
        return makeSelection(nextLine);
      }
      return makeSelection(line);
    });
    editor.selections = newSels;
  });
};

export const continueCursors = (editor: vscode.TextEditor, linebreak: string) => {
  const workspaceEdit = new vscode.WorkspaceEdit();

  editor.selections.forEach((sel: vscode.Selection) => {
    const line = editor.document.lineAt(sel.end);
    const indent = line.text.substring(0, line.firstNonWhitespaceCharacterIndex);
    const d2line = new D2Line(line.text.trimStart());
    const newline = indent + d2line.GetNextLine();
    const eol = line.range.end;
    if (newline === line.text) {
      workspaceEdit.insert(editor.document.uri, eol, linebreak);
      return;
    }
    workspaceEdit.insert(editor.document.uri, eol, linebreak + newline);
  });

  applyEdit(editor, workspaceEdit);
};

export const branchCursors = (editor: vscode.TextEditor, linebreak: string) => {
  const workspaceEdit = new vscode.WorkspaceEdit();

  editor.selections.forEach((sel: vscode.Selection) => {
    const line = editor.document.lineAt(sel.end);
    const indent = line.text.substring(0, line.firstNonWhitespaceCharacterIndex);
    const d2line = new D2Line(line.text.trimStart());
    const newline = indent + d2line.GetNewBranch();
    const eol = line.range.end;
    if (newline === line.text) {
      workspaceEdit.insert(editor.document.uri, eol, linebreak);
      return;
    }
    workspaceEdit.insert(editor.document.uri, eol, linebreak + newline);
  });

  applyEdit(editor, workspaceEdit);
};
