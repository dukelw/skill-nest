import React from "react";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit: number;
  total: number;
};

export const LewisPagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  total,
}) => {
  if (totalPages <= 1) return null;

  const createPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <p className="text-gray-600">
        Showing{" "}
        <span className="text-green-600 font-medium">
          {Math.min(currentPage * limit, total)}
        </span>{" "}
        of <span className="text-green-600 font-medium">{total}</span>
      </p>

      <div className="flex items-center space-x-1">
        <button
          className="px-4 py-2 border border-green-300 text-green-600 bg-white hover:bg-green-100 rounded-md disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          Prev
        </button>

        {createPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-4 py-2 border border-green-300 rounded-md ${
              page === currentPage
                ? "bg-dark-green text-white"
                : "text-green-600 bg-white hover:bg-green-100 hover:text-green-700"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          className="px-4 py-2 border border-green-300 text-green-600 bg-white hover:bg-green-100 rounded-md disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
