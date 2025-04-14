import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react';

const ExcelViewer = ({ file }: { file: File }) => {
  const [data, setData] = useState<any[][]>([]);

  useEffect(() => {
    const readExcel = async () => {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setData(jsonData);
    };

    readExcel();
  }, [file]);

  return (
    <table>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export { ExcelViewer };
