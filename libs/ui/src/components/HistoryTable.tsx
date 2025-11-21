import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table';
import { Button } from '../button';

type History = {
  id: string;
  user: { name?: string | null; email: string; id: string };
  action: string;
  status: string;
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

  // const statusIconMap = {
  //   pending: <Clock className="text-yellow-500" size={16} />,
  //   processing: <Loader2 className="animate-spin text-blue-500" size={16} />,
  //   completed: <CheckCircle className="text-green-500" size={16} />,
  //   failed: <XCircle className="text-red-500" size={16} />,
  // };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          <TableRow>
            <TableHead className="min-w-[200px]">User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Date, Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedHistory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
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

                {/* Action → actually "type" */}
                {/* <TableCell className="text-sm">{item.type}</TableCell> */}

                {/* Remove status col or keep empty */}
                <TableCell className="text-sm text-gray-400 italic">
                  —
                </TableCell>

                {/* Details (string or object) */}
                {/* <TableCell className="max-w-[300px] truncate text-sm text-gray-700">
                  {typeof item.details === 'string'
                    ? item.details
                    : item.details?.message || '—'}
                </TableCell> */}

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
    </>
  );
};
