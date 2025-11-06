import { evaluate } from 'mathjs';
import { Parser } from 'expr-eval';

const parser = new Parser();

export class FormulaEvaluator {
  private handlers: Record<
    string,
    (ctx: any, key: string, formula: string) => any
  > = {
    default: (ctx, key, formula) => parser.evaluate(formula, ctx),
    depField: (ctx, key, _formula) => this.evaluateDepField(ctx, key),
  };

  evaluate(context: Record<string, any>, computed: Record<string, string>) {
    return Object.fromEntries(
      Object.entries(computed).map(([key, formula]) => {
        const handler = this.handlers[formula] || this.handlers.default;
        try {
          return [key, handler(context, key, formula)];
        } catch (err) {
          console.warn(`⚠️ Error evaluating ${key}: ${formula}`, err);
          return [key, null];
        }
      })
    );
  }

  private evaluateDepField(context: Record<string, any>, depField: string) {
    const { sequenceData, materialConfig, bomItem_material } = context;
    const normalize = (s: string) => s.toLowerCase().replace(/\s/g, '');
    const thickness = materialConfig[normalize(bomItem_material)];
    const { common = {}, depField: depFields = {} } = sequenceData;
    const expr = depFields[depField];
    if (!expr)
      throw new Error(`depField expression for "${depField}" not found`);

    const evaluated: Record<string, any> = {
      ...context,
      materialThickness: thickness,
    };
    const refs = Array.from(expr.matchAll(/\$\{(\w+)\}/g), (m) => m[1]);

    for (const r of refs) {
      if (evaluated[r] === undefined && common[r]) {
        evaluated[r] = evaluate(common[r], evaluated);
      }
    }

    return expr.replace(
      /\$\{(\w+)\}/g,
      (_, k: string) => evaluated[k]?.toString() ?? ''
    );
  }
}
