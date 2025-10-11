import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TableRowData = { [key: string]: string | number };
type Header = { key: keyof TableRowData; label: string };

interface SalaryTableProps {
  headers: Header[];
  data: TableRowData[];
  highlightRows?: number[];
  unit?: string;
}

export default function SalaryTable({
  headers,
  data,
  highlightRows = [],
  unit = "원",
}: SalaryTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header.key as string}>{header.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            const isHighlighted = highlightRows.includes(
              row[headers[0].key] as number
            );
            return (
              <TableRow
                key={index}
                className={cn(isHighlighted && "bg-muted font-bold")}
              >
                {headers.map((header) => (
                  <TableCell
                    key={header.key as string}
                    className={cn(isHighlighted && "text-primary")}
                  >
                    {Number(row[header.key]).toLocaleString()}
                    {unit && ` ${unit}`}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}