import MovieGrid from "./MovieGrid"
import WatchList from "./WatchList"

export default function MainContent({
    movies,
    totalMovies,
    selectedGenre,
    isLoading,
    isSearching,
    searchQuery,
    error,
    onOpenMovie,
    watchList,
    onRemoveFromWatchlist,
    onToggleWatched,
    onSetRating,
    currentPage,
    totalPages,
    onPageChange,
    isLoadingMore,
    moviesSectionRef,
}) {
    const showingSearchResults = searchQuery && searchQuery.trim().length > 0
    const initialLoading = isLoading && movies.length === 0
    const showOverlay = (isSearching || isLoadingMore) && movies.length > 0

    return (
        <main className="main-content" aria-label="Main content">
            <section ref={moviesSectionRef} id="all-movies-section" className="all-movies" aria-label="All movies">
                <div className="section-header">
                    <div className="section-header-left">
                        <h2>{showingSearchResults ? "Search Results" : "All Movies"}</h2>
                        <p className="section-subtitle">
                            {showingSearchResults
                                ? `Found ${totalMovies} results for "${searchQuery}"`
                                : `Genre: ${selectedGenre}`}
                        </p>
                    </div>
                    <div className="section-header-right">
                        <span className="movie-count">{totalMovies} movies</span>
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="pagination top">
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                        >
                            «
                        </button>
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ‹ Prev
                        </button>
                        <span className="pagination-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next ›
                        </button>
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                    </div>
                )}

                <MovieGrid
                    movies={movies}
                    onMovieClick={onOpenMovie}
                    isLoading={initialLoading}
                    showOverlay={showOverlay}
                    error={error}
                />
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                        >
                            «
                        </button>
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ‹ Prev
                        </button>
                        <span className="pagination-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next ›
                        </button>
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                    </div>
                )}
            </section>

            <aside id="watchlist-section" className="watchlist" aria-label="Your watchlist">
                <WatchList
                    watchList={watchList}
                    onRemove={onRemoveFromWatchlist}
                    onToggleWatched={onToggleWatched}
                    onSetRating={onSetRating}
                />
            </aside>
        </main>
    )
}
