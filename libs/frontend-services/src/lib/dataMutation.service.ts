export class DataMutationService {
  public consolidatedFormulas(templates: any) {
    const formulaMap: Record<string, Set<string>> = {};
    const formulaCount: Record<string, number> = {};

    const transformed = templates.map((template: any) => {
      const [key] = Object.keys(template.data);
      const computed = template.data[key]?.fields?.computed || {};

      const common: { key: string; value: string }[] = [];
      const depField: { key: string; value: string }[] = [];

      for (const [field, formula] of Object.entries(computed)) {
        if (!formula || formula.trim() === '') continue;

        formulaCount[formula] = (formulaCount[formula] || 0) + 1;
        if (!formulaMap[formula]) formulaMap[formula] = new Set();
        formulaMap[formula].add(key);
      }

      return { key, computed };
    });

    // Identify common formulas (e.g., used in >= 3 templates)
    const commonFormulasSet = new Set<string>();
    for (const [formula, count] of Object.entries(formulaCount)) {
      if (count >= 3) {
        commonFormulasSet.add(formula);
      }
    }

    // Now classify fields per template as `common` or `depField`
    const structured = transformed.map(({ key, computed }) => {
      const common: { key: string; value: string }[] = [];
      const depField: { key: string; value: string }[] = [];

      for (const [field, formula] of Object.entries(computed)) {
        if (commonFormulasSet.has(formula)) {
          common.push({ key: field, value: formula });
        } else {
          depField.push({ key: field, value: formula });
        }
      }

      return { key, common, depField };
    });

    return structured;
  }
}
