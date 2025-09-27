import get from 'lodash/get';

export class ContextBuilder {
  build(map: Record<string, string>, source: Record<string, any>) {
    const output: Record<string, any> = {};
    for (const [key, expr] of Object.entries(map)) {
      const arrMatch = expr.match(/^(.*)\[\](?:\.(.*))?$/);
      if (arrMatch) {
        const [_, arrPath, subPath] = arrMatch;
        const arr = get(source, arrPath);
        output[key] = Array.isArray(arr)
          ? subPath
            ? arr.map((item) => this.concatEval(subPath, item))
            : arr
          : [];
      } else {
        output[key] = this.concatEval(expr, source);
      }
    }
    return output;
  }

  private concatEval(expr: string, src: Record<string, any>): string {
    return expr
      .split('+')
      .map((p) => get(src, p.trim()) ?? '')
      .join(' ');
  }
}
