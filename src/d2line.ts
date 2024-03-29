interface Token {
  text: string;
  offset: number;
  length: number;
}

export class D2Line {
  private readonly text: string;
  constructor(s: string) {
    this.text = s;
  }

  private getOperators(): Token[] {
    const regex = /--|(?<!<)->|<-(?!>)|<->/g;
    const matches = this.text.matchAll(regex);
    return [...matches]
      .map((m) => {
        const ot: Token = {
          text: m[0],
          offset: m.index,
          length: m[0].length,
        };
        return ot;
      })
      .sort((a, b) => {
        if (a.offset < b.offset) return -1;
        if (b.offset < a.offset) return 1;
        return 0;
      });
  }

  private getFirstOperator(): Token | null {
    const operators = this.getOperators();
    if (operators.length < 1) {
      return null;
    }
    return operators[0];
  }

  private getLastOperator(): Token | null {
    const operators = this.getOperators();
    if (operators.length < 1) {
      return null;
    }
    return operators.slice(-1)[0];
  }

  private getFirstText(): string {
    const fo = this.getFirstOperator();
    if (!fo) {
      return "";
    }
    return this.text.substring(0, fo.offset).trim();
  }

  private getLastText(): string {
    const lo = this.getLastOperator();
    if (!lo) {
      return "";
    }
    return this.text
      .substring(lo.offset + lo.length)
      .replace(/:.*$/g, "")
      .trim();
  }

  private getLastRootText(): string {
    const operators = this.getOperators();
    if (operators.length < 1) {
      return "";
    }
    if (operators.length === 1) {
      return this.getFirstText();
    }
    const last = operators.pop();
    if (!last) {
      return "";
    }
    const back1 = operators.pop();
    if (!back1) {
      return "";
    }
    return this.text.substring(back1.offset + back1.length, last.offset).trim();
  }

  private getNotation(): string {
    const ss = this.text.split(":");
    if (ss.length < 2) {
      return "";
    }
    return ": " + ss.slice(-1)[0].trim();
  }

  GetNextLine(): string {
    const lastOperator = this.getLastOperator();
    if (!lastOperator) {
      return this.text;
    }
    const lt = this.getLastText();
    if (lt.length < 1) {
      return this.text;
    }
    const suf = this.getNotation() ? " :" : " ";
    return lt + " " + lastOperator.text + suf;
  }

  GetNewBranch(): string {
    const lastOperator = this.getLastOperator();
    if (!lastOperator) {
      return this.text;
    }
    const rt = this.getLastRootText();
    if (rt.length < 1) {
      return this.text;
    }
    const suf = this.getNotation() ? " :" : " ";
    return rt + " " + lastOperator.text + suf;
  }

  Swap(): string {
    const fo = this.getFirstOperator();
    const lo = this.getLastOperator();
    const ft = this.getFirstText();
    const lt = this.getLastText();
    if (!fo || !lo || ft.length < 1 || lt.length < 1) {
      return this.text;
    }
    const note = this.getNotation();
    if (fo.offset === lo.offset) {
      return [lt, fo.text, ft].join(" ").trim() + note;
    }
    const inter = this.text.substring(fo.offset + fo.length, lo.offset).trim();
    return [lt, fo.text, inter, lo.text, ft].join(" ").trim() + note;
  }
}
