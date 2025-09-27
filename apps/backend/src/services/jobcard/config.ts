export const JobCardConfig = {
  creditCost: 10,
  requiredConfigs: {
    bom: { name: "bom.json", type: "config" },
  },
  fileTypes: {
    sequence: "sequence",
    template: "template",
    jobCard: "jobCard",
    table: "table",
  },
  extensions: {
    template: ".htm",
    sequence: ".json",
  },
  keywords: {
    depField: "keyword_depField",
  }
};
