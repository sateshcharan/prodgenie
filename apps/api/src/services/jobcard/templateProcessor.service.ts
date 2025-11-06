import { TemplateService } from '../template.service.js';
import { FormulaEvaluator } from './formulaEvaluator.service';
import { ContextBuilder } from './contextBuilder.service';

export class TemplateProcessor {
  private templateService = new TemplateService();
  private evaluator = new FormulaEvaluator();
  private contextBuilder = new ContextBuilder();

  async populate(templatePath: string, templateData: any, contextBase: any) {
    const { manual = {}, computed = {} } = templateData?.templateFields || {};
    const context = this.contextBuilder.build(
      Object.fromEntries(
        Object.entries(manual).map(([k, v]: any) => [k, v.replace(/_/g, '.')])
      ),
      contextBase
    );
    const computedFields = this.evaluator.evaluate(
      { ...contextBase, ...context },
      computed
    );
    return await this.templateService.injectValues(templatePath, {
      ...context,
      ...computedFields,
    });
  }

  pageBreak() {
    return `<div style="page-break-after: always;"></div>`;
  }

  async combine(templates: string[]) {
    return this.templateService.combineTemplates(templates);
  }
}
