import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@prodgenie/libs/ui/table';
import { apiRoutes } from '@prodgenie/libs/constant';
import { Button, Input, toast } from '@prodgenie/libs/ui';

import { api } from '../../utils';

type ColumnType = 'text' | 'number';

interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  type: ColumnType;
  placeholder?: string;
}

interface TableBuilderProps<T> {
  initialData?: T[];
  columns?: ColumnConfig<T>[];
  onSave?: (fileName: string, rows: T[], columns: ColumnConfig<T>[]) => void;
}

export default function TableBuilder<T extends Record<string, any>>({
  initialData = [],
  columns = [],
  onSave,
}: TableBuilderProps<T>) {
  const [rows, setRows] = useState<T[]>(initialData);
  const [tableColumns, setTableColumns] = useState(columns);
  const [fileName, setFileName] = useState('');

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setTableColumns([
          { key: 'col1' as keyof T, label: 'Column 1', type: 'text' },
          { key: 'col2' as keyof T, label: 'Column 2', type: 'text' },
        ]);
        setRows([{ col1: '', col2: '' } as T]);
        return;
      }

      try {
        const {
          data: { data: tableFile },
        } = await api.get(`${apiRoutes.files.base}/getById/${id}`);

        const tableFileContent = await fetch(tableFile.path).then((res) =>
          res.json()
        );

        if (tableFileContent.columns && tableFileContent.rows) {
          setTableColumns(tableFileContent.columns);
          setRows(tableFileContent.rows);
          setFileName(tableFile.name || '');
        } else {
          const cols = [
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'value', label: 'Value', type: 'number' },
          ] as ColumnConfig<T>[];

          const converted = Object.entries(tableFileContent).map(([k, v]) => ({
            name: k,
            value: v,
          })) as T[];

          setTableColumns(cols);
          setRows(converted);
        }
      } catch (err) {
        console.error('Error loading table data:', err);
      }
    };
    fetchData();
  }, [id]);

  // === Row management ===
  const handleChange = (rowIndex: number, key: keyof T, value: any) => {
    setRows((prev) =>
      prev.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row))
    );
  };

  const addRow = () => {
    const emptyRow = tableColumns.reduce((acc, col) => {
      acc[col.key] = col.type === 'number' ? 0 : '';
      return acc;
    }, {} as T);
    setRows((prev) => [...prev, emptyRow]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // === Column management ===
  const addColumn = () => {
    const newKey = `col${tableColumns.length + 1}` as keyof T;
    const newCol: ColumnConfig<T> = {
      key: newKey,
      label: `Column ${tableColumns.length + 1}`,
      type: 'text',
    };

    setTableColumns((prev) => [...prev, newCol]);
    setRows((prev) => prev.map((row) => ({ ...row, [newKey]: '' })));
  };

  const updateColumnLabel = (index: number, label: string) => {
    setTableColumns((prev) =>
      prev.map((col, i) => (i === index ? { ...col, label } : col))
    );
  };

  const removeColumn = (index: number) => {
    const keyToRemove = tableColumns[index].key;
    setTableColumns((prev) => prev.filter((_, i) => i !== index));
    setRows((prev) =>
      prev.map((row) => {
        const { [keyToRemove]: _, ...rest } = row;
        return rest as T;
      })
    );
  };

  const handleSave = async () => {
    try {
      // Convert payload into JSON blob
      const jsonString = JSON.stringify(
        {
          name: fileName,
          columns: tableColumns,
          rows,
        },
        null,
        2
      );

      const jsonBlob = new Blob([jsonString], {
        type: 'application/json',
      });

      // Use FormData to send as file
      const formData = new FormData();

      formData.append('files', jsonBlob, `${fileName}.json`);

      if (id) {
        console.log('Updating table...');
        // Update case
        // await api.put(`${apiRoutes.files.base}/update/${id}`, formData, {
        //   headers: { "Content-Type": "multipart/form-data" },
        // });
      } else {
        // Create case
        await api.post(`${apiRoutes.files.base}/table/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success('Table saved successfully!');
    } catch (err) {
      console.error('Error saving table:', err);
      toast.error('Failed to save table');
    }
  };

  return (
    <div className="w-full mt-[200px] flex justify-center items-center">
      <div className="max-w-4xl mx-auto p-4 bg-white border rounded shadow space-y-4">
        {/* File name input */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">File Name:</label>
          <Input
            type="text"
            value={fileName.split('.json')[0]}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file name"
            className="flex-1"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded">
          <Table>
            <TableHeader>
              <TableRow>
                {tableColumns.map((col, colIndex) => (
                  <TableHead
                    key={String(col.key)}
                    className="whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <Input
                        type="text"
                        value={col.label}
                        onChange={(e) =>
                          updateColumnLabel(colIndex, e.target.value)
                        }
                        className="h-7 px-2 py-0.5 text-xs"
                      />
                      <button
                        onClick={() => removeColumn(colIndex)}
                        className="text-red-500 hover:text-red-700 text-xs"
                        disabled={tableColumns.length <= 1}
                      >
                        ✕
                      </button>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {tableColumns.map((col) => (
                    <TableCell key={String(col.key)}>
                      <Input
                        type={col.type}
                        placeholder={col.placeholder || col.label}
                        value={row[col.key]}
                        onChange={(e) =>
                          handleChange(
                            rowIndex,
                            col.key,
                            col.type === 'number'
                              ? parseFloat(e.target.value) || 0
                              : e.target.value
                          )
                        }
                        className="w-full"
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <button
                      onClick={() => removeRow(rowIndex)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      disabled={rows.length === 1}
                    >
                      ✕
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button onClick={addRow} variant="outline">
            + Add Row
          </Button>
          <Button onClick={addColumn} variant="outline">
            + Add Column
          </Button>
          <Button
            // onClick={() => onSave?.(fileName, rows, tableColumns)}
            onClick={handleSave}
            disabled={!fileName}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
