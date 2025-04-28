import XLSX from 'xlsx';

export class XlsxService {
  static readTemplate(templatePath: string) {
    const workbook = XLSX.readFile(templatePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    return jsonData;
  }
  static constructJobCard(jsonConfig: any) {
    const finalWorkbook = XLSX.utils.book_new();

    // Iterate over the JSON configuration to construct the final Excel file
    for (const sheetName in jsonConfig) {
      const config = jsonConfig[sheetName];
      const templatePath = config.template;

      // Read the template
      const templateWorkbook = XLSX.readFile(templatePath);

      // Clone the template's sheet to the final workbook
      const sheet = templateWorkbook.Sheets[templateWorkbook.SheetNames[0]];

      // Get the range to start copying from (configurable from JSON)
      const range = XLSX.utils.decode_range(sheet['!ref']);
      range.s.r = config.startRow - 1; // adjust based on startRow in JSON
      range.s.c = XLSX.utils.encode_col(config.startColumn) - 1; // adjust based on startColumn in JSON

      // Optionally, modify or insert data into the sheet before copying
      // For example, you could update a specific cell:
      sheet['A1'] = { t: 's', v: 'Updated Value' };

      // Copy the sheet to the final workbook
      XLSX.utils.book_append_sheet(finalWorkbook, sheet, sheetName);
    }

    // Write the final workbook to a file
    XLSX.writeFile(finalWorkbook, 'finalFile.xlsx');
  }
}
