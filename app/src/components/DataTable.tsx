import React, { useState, useMemo } from 'react';
import { Icon } from './';
import { InputText } from './InputText';
import { Button } from './Button';

export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey?: keyof T;
  searchable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  className?: string;
  striped?: boolean;
  loading?: boolean;
}

export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps<any>>(
  ({
    columns,
    data,
    rowKey = 'id' as any,
    searchable = true,
    paginated = true,
    pageSize = 10,
    onRowClick,
    className = '',
    striped = true,
    loading = false,
  }, ref) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Filtrés et triés
    const filteredData = useMemo(() => {
      let result = data;

      if (searchTerm) {
        result = result.filter((row) =>
          columns.some((col) => {
            const value = row[col.key];
            return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
          })
        );
      }

      if (sortColumn && sortDirection) {
        result = [...result].sort((a, b) => {
          const aValue = a[sortColumn];
          const bValue = b[sortColumn];

          if (aValue === bValue) return 0;
          if (aValue === null || aValue === undefined) return 1;
          if (bValue === null || bValue === undefined) return -1;

          const comparison = aValue < bValue ? -1 : 1;
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      }

      return result;
    }, [data, searchTerm, sortColumn, sortDirection, columns]);

    // Pagination
    const paginatedData = useMemo(() => {
      if (!paginated) return filteredData;
      const start = (currentPage - 1) * pageSize;
      return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize, paginated]);

    const totalPages = paginated ? Math.ceil(filteredData.length / pageSize) : 1;

    const handleSort = (key: string) => {
      if (sortColumn === key) {
        if (sortDirection === 'asc') {
          setSortDirection('desc');
        } else if (sortDirection === 'desc') {
          setSortDirection(null);
          setSortColumn(null);
        }
      } else {
        setSortColumn(key);
        setSortDirection('asc');
      }
    };

    return (
      <div ref={ref} className={`flex flex-col gap-4 ${className}`}>
        {searchable && (
          <InputText
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            icon="search"
          />
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700"
                    style={{ width: col.width }}
                  >
                    <div
                      className={`flex items-center gap-2 ${col.sortable ? 'cursor-pointer hover:text-gray-900' : ''}`}
                      onClick={() => col.sortable && handleSort(String(col.key))}
                    >
                      <span>{col.label}</span>
                      {col.sortable && (
                        <div className="flex flex-col gap-0.5">
                          <Icon
                            name="chevron-up"
                            size="xs"
                            className={`transition-colors ${
                              sortColumn === String(col.key) && sortDirection === 'asc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`}
                          />
                          <Icon
                            name="chevron-down"
                            size="xs"
                            className={`-mt-1 transition-colors ${
                              sortColumn === String(col.key) && sortDirection === 'desc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                    Aucune donnée
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={String(row[rowKey])}
                    className={`border-b border-gray-200 transition-colors ${
                      striped && rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } ${onRowClick ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-6 py-4 text-sm text-gray-700" style={{ width: col.width }}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {paginated && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Affichage {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} à{' '}
              {Math.min(currentPage * pageSize, filteredData.length)} sur {filteredData.length} résultats
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <Icon name="chevron-left" size="sm" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="px-2 text-gray-500">...</span>}
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <Icon name="chevron-right" size="sm" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';
