import { useState, useEffect } from 'react';
import { Button } from '@prodgenie/libs/ui';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils';
import { apiRoutes } from '@prodgenie/libs/constant';

type ColumnType = 'text' | 'number';

interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  type: ColumnType;
  placeholder?: string;
}

interface TableBuilderProps<T> {
  initialData?: T[]; // optional now
  columns: ColumnConfig<T>[];
  onSave: (rows: T[]) => void;
  fetchData?: () => Promise<T[]>;
}

export function TableBuilder<T extends Record<string, any>>({
  initialData = [],
  columns = [], // ✅ fallback to empty array
  onSave,
  fetchData,
}: TableBuilderProps<T>) {
  const [rows, setRows] = useState<T[]>(initialData);

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { data: tableFile },
        } = await api.get(`${apiRoutes.files.base}/getById/${id}`);
        const tableFileContent = await fetch(tableFile.path).then((res) =>
          res.json()
        );

        setRows(tableFileContent);
        console.log(tableFileContent);
      } catch (err) {
        console.error('Error loading table data:', err);
        setRows([]);
      }
    };
    fetchData();
  }, [id]);

  if (!columns || columns.length === 0) {
    return (
      <div className="p-4 text-gray-500 border rounded">
        ⚠️ No columns configured for this table
      </div>
    );
  }

  const handleChange = (index: number, key: keyof T, value: any) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  };

  const addRow = () => {
    const emptyRow = columns.reduce((acc, col) => {
      acc[col.key] = col.type === 'number' ? 0 : '';
      return acc;
    }, {} as T);
    setRows((prev) => [...prev, emptyRow]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white border rounded shadow space-y-4">
      {/* header row */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2 font-semibold text-sm border-b pb-2">
        {columns.map((col) => (
          <div key={String(col.key)}>{col.label}</div>
        ))}
        <div></div>
      </div>

      {/* rows */}
      {rows.length > 0 ? (
        rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2 items-center mb-2"
          >
            {columns.map((col) => (
              <input
                key={String(col.key)}
                type={col.type}
                placeholder={col.placeholder}
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
                className="border rounded px-2 py-1 text-sm"
              />
            ))}
            <button
              onClick={() => removeRow(rowIndex)}
              className="text-red-500 hover:text-red-700 text-sm"
              disabled={rows.length === 1}
            >
              ✕
            </button>
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-500 italic">No data available</div>
      )}

      {/* actions */}
      <div className="flex items-center gap-4">
        <Button onClick={addRow} variant="outline">
          + Add Row
        </Button>
        <Button onClick={() => onSave(rows)} disabled={rows.length === 0}>
          Save
        </Button>
      </div>
    </div>
  );
}
