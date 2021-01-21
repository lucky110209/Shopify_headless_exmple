interface PaginationProps {
  page: number;
  nextBtnDisabled: boolean;
  handleNextPageClicked: () => void;
  previousBtnDisabled: boolean;
  handlePreviousPageClicked: () => void;
  loading: boolean;
}

const Pagination = ({
  page,
  nextBtnDisabled,
  handleNextPageClicked,
  previousBtnDisabled,
  handlePreviousPageClicked,
  loading,
}: PaginationProps) => {
  return (
    <nav className="pagination" aria-label="pagination">
      <button
        className="pagination-previous"
        title={`Page ${page}`}
        disabled={previousBtnDisabled || loading ? true : false}
        onClick={handlePreviousPageClicked}
      >
        &#171;
      </button>
      <a role="button" className="pagination-link">
        {`Page ${page}`}
      </a>
      <button
        role="button"
        className="pagination-next"
        disabled={nextBtnDisabled || loading ? true : false}
        onClick={handleNextPageClicked}
      >
        &#187;
      </button>
    </nav>
  );
};

export default Pagination;
