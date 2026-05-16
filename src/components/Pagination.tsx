interface PaginationProps {
  page: number;
  totalPages: number;
  count: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  page,
  totalPages,
  count,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 10, 20, 50],
}: PaginationProps) {
  if (count === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, count);

  const pages: number[] = [];
  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);
  startPage = Math.max(1, endPage - maxVisible + 1);
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <div className="text-sm text-textMuted font-bold">
        Showing {start}–{end} of {count}
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="input-field py-2 px-3 text-sm mr-2"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-4 py-2 rounded-xl border border-primary/20 disabled:opacity-40 text-sm font-bold"
        >
          Previous
        </button>

        {startPage > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="w-10 h-10 rounded-xl font-bold border border-primary/20"
            >
              1
            </button>
            {startPage > 2 && <span className="text-textMuted">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 rounded-xl font-bold transition-colors ${
              p === page
                ? 'bg-primary text-black'
                : 'border border-primary/20 text-textMain'
            }`}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-textMuted">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="w-10 h-10 rounded-xl font-bold border border-primary/20"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="px-4 py-2 rounded-xl border border-primary/20 disabled:opacity-40 text-sm font-bold"
        >
          Next
        </button>
      </div>

      <div className="text-sm text-textMuted font-bold sm:hidden">
        Page {page} of {totalPages}
      </div>
    </div>
  );
}
