import * as vscode from "vscode";
import { D2Line } from "./d2line";

class EditorLine {
  private readonly indent: string;
  private readonly d2line: D2Line;
  private readonly text: string;
  private readonly maxChar: number;
  private readonly lineNum: number;
  constructor(line: vscode.TextLine) {
    this.indent = line.text.substring(0, line.firstNonWhitespaceCharacterIndex);
    this.d2line = new D2Line(line.text.trimStart());
    this.text = line.text;
    this.maxChar = line.text.length;
    this.lineNum = line.lineNumber;
  }

  getNextLine(): string {
    const l = this.d2line.getNextLine();
    return this.indent + l;
  }

  getNewSelection(): vscode.Selection {
    const ci = this.text.endsWith(":") ? this.maxChar - 1 : this.maxChar;
    const p = new vscode.Position(this.lineNum, ci);
    const s = new vscode.Selection(p, p);
    return s;
  }
}

export const continueCursors = (editor: vscode.TextEditor, linebreak: string) => {
  const workspaceEdit = new vscode.WorkspaceEdit();

  editor.selections.forEach((sel: vscode.Selection) => {
    const line = editor.document.lineAt(sel.end);
    const el = new EditorLine(line);
    const newline = el.getNextLine();
    const eol = line.range.end;
    if (newline === line.text) {
      workspaceEdit.insert(editor.document.uri, eol, linebreak);
      return;
    }
    workspaceEdit.insert(editor.document.uri, eol, linebreak + newline);
  });

  vscode.workspace.applyEdit(workspaceEdit).then(() => {
    const newSels = editor.selections.map((sel) => {
      const line = editor.document.lineAt(sel.end);
      let el: EditorLine;
      if (sel.end.character !== line.range.end.character) {
        const nextLine = editor.document.lineAt(sel.end.line + 1);
        el = new EditorLine(nextLine);
      } else {
        el = new EditorLine(line);
      }
      return el.getNewSelection();
    });
    editor.selections = newSels;
  });
};
