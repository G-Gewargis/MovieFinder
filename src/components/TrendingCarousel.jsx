import { buildPosterUrl } from "../api/tmdb"

export default function TrendingCarousel({ movies = [], onOpenMovie, isLoading, error }) {
    return (
        <section id="trending-section" className="trending" aria-label="Trending now">
            <div className="section-header">
                <div className="section-header-left">
                    <h2>🔥 Trending This Week</h2>
                    <p className="section-subtitle">The hottest movies everyone's talking about</p>
                </div>
            </div>
            <div className="carousel" role="region" aria-label="Trending carousel">
                {isLoading ? (
                    <div className="empty-state" aria-live="polite">Loading trending movies…</div>
                ) : error ? (
                    <div className="empty-state" aria-live="assertive">{error}</div>
                ) : movies.length === 0 ? (
                    <div className="empty-state">No trending movies available.</div>
                ) : (
                    <div className="carousel-track">
                        {movies.map((movie) => {
                            const posterUrl = buildPosterUrl(movie?.posterPath, "w342")
                            const title = movie?.title || "Untitled"
                            const rating = Number.isFinite(movie?.voteAverage)
                                ? movie.voteAverage.toFixed(1)
                                : "—"
                            return (
                                <button
                                    key={movie.id}
                                    type="button"
                                    className="carousel-item"
                                    onClick={() => onOpenMovie?.(movie)}
                                    aria-label={`Open details for ${title}`}
                                >
                                    <div className="carousel-poster">
                                        {posterUrl ? (
                                            <img src={posterUrl} alt={`${title} poster`} loading="lazy" />
                                        ) : (
                                            <span>No Poster</span>
                                        )}
                                    </div>
                                    <div className="carousel-info">
                                        <p className="carousel-title">{title}</p>
                                        <p className="carousel-rating">★ {rating}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}
