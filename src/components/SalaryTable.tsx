type TableRow = { [key: string]: string | number };
type Header = { key: keyof TableRow; label: string };

interface SalaryTableProps {
  headers: Header[];
  data: TableRow[];
}

export default function SalaryTable({ headers, data }: SalaryTableProps) {
  return (
    // [수정] 이 div에 overflow-x-auto 클래스를 추가하여 가로 스크롤을 활성화합니다.
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <tr>
            {headers.map((header) => (
              <th
                key={header.key as string}
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {data.map((row, index) => (
            <tr
              key={index}
              className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {headers.map((header) => (
                <td
                  key={header.key as string}
                  className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-300"
                >
                  {Number(row[header.key]).toLocaleString()} 원
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
