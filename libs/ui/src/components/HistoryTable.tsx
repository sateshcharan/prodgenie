import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '..';

type History = {
  id: string;
  user: { name?: string | null; email: string; id: string };
  action: string;
  details?: string | null;
  createdAt: string;
};

type Props = {
  history: History[];
};

export const HistoryTable: React.FC<Props> = ({ history }) => {
  return (
    <div className="overflow-auto border border-gray-200 shadow-sm mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                No history records found.
              </TableCell>
            </TableRow>
          ) : (
            history.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">
                    {item.user?.name || 'Unknown User'}
                  </div>
                  <div className="text-sm text-gray-500">{item.user?.id}</div>
                </TableCell>
                <TableCell className="text-sm">{item.action}</TableCell>
                <TableCell className="max-w-[300px] truncate text-sm text-gray-700">
                  {item.details || '—'}
                </TableCell>
                <TableCell className="text-right text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
