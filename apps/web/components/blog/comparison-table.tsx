import type { ReactNode } from 'react';

export type TableColumn = { key: string; label: string };

export type TableRow = {
  id: string;
  /** Highlighted row, used for our own product. */
  featured?: boolean;
  cells: Record<string, ReactNode>;
};

type ComparisonTableProps = {
  caption: string;
  columns: TableColumn[];
  rows: TableRow[];
  footnote?: ReactNode;
};

// Breaks out of the narrow prose column to use the full viewport width, then
// re-centers at a wider max width. `left-1/2` + negative `50vw` margins is
// the standard full-bleed technique: it works regardless of how deep this
// sits inside the narrower parent container.
export const ComparisonTable = ({ caption, columns, rows, footnote }: ComparisonTableProps) => {
  const captionId = `comparison-table-${caption.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;

  return (
    <figure className="not-prose relative left-1/2 my-8 w-screen max-w-none -translate-x-1/2 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {/* Sits outside the horizontally-scrolling area below, so the
              table's title never scrolls out of view along with the
              columns — only the data underneath it scrolls. */}
          <p
            id={captionId}
            className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-[#1F4D3A]"
          >
            {caption}
          </p>
          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            {/* min-w keeps columns readable on phones: the card scrolls sideways instead of squeezing them. */}
            {/* border-separate, not border-collapse: sticky positioning on
                th/td is unreliable (silently does nothing in several
                browsers, including mobile Safari) when a table uses
                border-collapse. border-spacing-0 keeps cells touching like
                collapse did; borders move onto the cells themselves below. */}
            <table
              aria-labelledby={captionId}
              className="w-full min-w-[44rem] border-separate border-spacing-0 text-left text-sm leading-relaxed"
            >
              <thead className="bg-[#1F4D3A] text-white">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className={row.featured ? 'bg-[#F9F0E7]' : 'bg-white'}>
                    {columns.map((column, index) => {
                      const isFirst = index === 0;
                      const Cell = isFirst ? 'th' : 'td';
                      return (
                        <Cell
                          key={column.key}
                          scope={isFirst ? 'row' : undefined}
                          className={`px-4 py-4 align-top text-gray-700 ${
                            // Row-separator border lives on the cell, not the
                            // <tr> (border-separate doesn't render tr borders
                            // reliably, and tr borders were never reliable
                            // with border-collapse either).
                            row.featured ? '' : 'border-t border-gray-200'
                          } ${isFirst ? 'font-semibold text-[#000C3F]' : 'font-normal'} ${
                            row.featured && isFirst ? 'border-l-4 border-[#FF8A5B]' : ''
                          }`}
                        >
                          {row.cells[column.key]}
                        </Cell>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500 sm:hidden" aria-hidden="true">
          Swipe sideways to see all columns.
        </p>
        {footnote && (
          <figcaption className="mt-2 text-xs leading-relaxed text-gray-500">{footnote}</figcaption>
        )}
      </div>
    </figure>
  );
};
