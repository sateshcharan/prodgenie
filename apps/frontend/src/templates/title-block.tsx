import React from "react";

interface JobCardProps {
  customer: string;
  no: string;
  date: string;
  description: string;
  qty: string;
  partNo: string;
  poNumber: string;
  preparedBy: string;
  scheduledDate: string;
}

export const JobCard: React.FC<JobCardProps> = ({
  customer,
  no,
  date,
  description,
  qty,
  partNo,
  poNumber,
  preparedBy,
  scheduledDate,
}) => {
  return (
    <div className="border border-black w-full max-w-3xl mx-auto p-4 text-sm">
      <table className="w-full border-collapse border border-black">
        <tbody>
          <tr className="border border-black">
            <td className="border border-black p-2">CUSTOMER</td>
            <td className="border border-black p-2">{customer}</td>
            <td className="border border-black p-2">NO</td>
            <td className="border border-black p-2">{no}</td>
            <td className="border border-black p-2">DATE:</td>
            <td className="border border-black p-2">{date}</td>
          </tr>
          <tr className="border border-black">
            <td className="border border-black p-2">DESCRIPTION</td>
            <td className="border border-black p-2" colSpan={2}>
              {description}
            </td>
            <td className="border border-black p-2">QTY</td>
            <td className="border border-black p-2" colSpan={2}>
              {qty}
            </td>
          </tr>
          <tr className="border border-black">
            <td className="border border-black p-2">DRG / PART NO</td>
            <td className="border border-black p-2" colSpan={2}>
              {partNo}
            </td>
            <td className="border border-black p-2">P.O.NUMBER</td>
            <td className="border border-black p-2" colSpan={2}>
              {poNumber}
            </td>
          </tr>
          <tr className="border border-black">
            <td className="border border-black p-2">PREPARED BY</td>
            <td className="border border-black p-2" colSpan={2}>
              {preparedBy}
            </td>
            <td className="border border-black p-2">SCHEDULED DATE</td>
            <td className="border border-black p-2" colSpan={2}>
              {scheduledDate}
            </td>
          </tr>
          <tr>
            <td className="text-center font-bold p-4" colSpan={6}>
              BSP CHENNAI
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
