import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type Column = { key: string; label: string; align?: 'left' | 'right' | 'center' };
type Row = Record<string, React.ReactNode>;

type DataTableProps = {
  columns: Column[];
  rows: Row[];
  className?: string;
};

const DataTable: React.FC<DataTableProps> = ({ columns, rows, className }) => {
  return (
    <div className={cn("rounded-[16px] border border-white/10 bg-[#0F1A2B] p-4", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#0B1628] hover:bg-[#0B1628]">
            {columns.map((c) => (
              <TableHead
                key={c.key}
                className={cn(
                  "text-[#9AA7BD]",
                  c.align === 'right' && "text-right",
                  c.align === 'center' && "text-center"
                )}
              >
                {c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, idx) => (
            <TableRow key={idx} className="hover:bg-[#13223a]">
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  className={cn(
                    "text-[#E6EDF7]",
                    c.align === 'right' && "text-right",
                    c.align === 'center' && "text-center"
                  )}
                >
                  {r[c.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
