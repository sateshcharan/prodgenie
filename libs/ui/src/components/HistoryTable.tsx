import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
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

const ITEMS_PER_PAGE = 5;

export const HistoryTable: React.FC<Props> = ({ history }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  const paginatedHistory = history.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="overflow-auto border border-gray-200 shadow-sm mt-4 rounded-lg">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          <TableRow>
            <TableHead className="min-w-[200px]">User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedHistory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                No history records found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedHistory.map((item) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 border-t bg-white">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
