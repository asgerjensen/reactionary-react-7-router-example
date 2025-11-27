import { Form } from "react-router";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage }: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between px-4 py-6 mt-8 border-t border-gray-200">
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Form method="get">
          <input type="hidden" name="page" value={currentPage - 1} />
          <button
            type="submit"
            disabled={!hasPrevious}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              hasPrevious
                ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
          >
            <BiChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </button>
        </Form>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first page, last page, current page, and pages around current
            const showPage =
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1);

            const showEllipsis =
              (page === currentPage - 2 && currentPage > 3) ||
              (page === currentPage + 2 && currentPage < totalPages - 2);

            if (showEllipsis) {
              return (
                <span key={page} className="px-2 text-gray-500">
                  ...
                </span>
              );
            }

            if (!showPage) {
              return null;
            }

            return (
              <Form method="get" key={page}>
                <input type="hidden" name="page" value={page} />
                <button
                  type="submit"
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === currentPage
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              </Form>
            );
          })}
        </div>

        <Form method="get">
          <input type="hidden" name="page" value={currentPage + 1} />
          <button
            type="submit"
            disabled={!hasNext}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              hasNext
                ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
          >
            Next
            <BiChevronRight className="w-5 h-5 ml-1" />
          </button>
        </Form>
      </div>
    </div>
  );
}
