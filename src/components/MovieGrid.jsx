import MovieCard from "./MovieCard"

export default function MovieGrid({ movies = [], onMovieClick, isLoading, showOverlay = false, error }) {
    const isEmpty = movies.length === 0

    return (
        <section className="movie-grid" aria-label="Movie grid">
            {isLoading ? (
                <div className="empty-state" aria-live="polite">Loading movies…</div>
            ) : error ? (
                <div className="empty-state" aria-live="assertive">{error}</div>
            ) : isEmpty ? (
                <div className="empty-state">No movies loaded yet.</div>
            ) : (
                <>
                    {movies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onClick={() => onMovieClick?.(movie)}
                        />
                    ))}
                    {showOverlay && (
                        <div className="grid-overlay" aria-hidden="true">
                            <div className="loading-spinner" />
                        </div>
                    )}
                </>
            )}
        </section>
    )
}