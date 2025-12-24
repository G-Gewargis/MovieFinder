import { buildPosterUrl, buildBackdropUrl } from "../api/tmdb"

export default function Hero({ featuredMovie, onOpenMovie }) {
    const posterUrl = buildPosterUrl(featuredMovie?.posterPath, "original")
    const backdropUrl = buildBackdropUrl(featuredMovie?.backdropPath, "original")
    const title = featuredMovie?.title || "Loading..."
    const rating = Number.isFinite(featuredMovie?.voteAverage)
        ? featuredMovie.voteAverage.toFixed(1)
        : "—"
    const genres = Array.isArray(featuredMovie?.genres)
        ? featuredMovie.genres.slice(0, 3).join(" • ")
        : "—"
    const overview = featuredMovie?.overview || "Discover your next favorite movie..."
    const releaseYear = featuredMovie?.releaseDate?.split("-")[0] || ""

    return (
        <section
            className="hero"
            aria-label="Featured Movie"
            style={backdropUrl ? {
                backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 35, 0.6) 0%, rgba(15, 15, 35, 0.85) 60%, rgba(15, 15, 35, 1) 100%), url(${backdropUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            } : {}}
        >
            <div className="hero-inner">
                <div className="hero-content">
                    <p className="hero-eyebrow">Featured Today</p>
                    <h1 className="hero-title">{title}</h1>
                    <div className="hero-meta">
                        {releaseYear && <span className="hero-year">{releaseYear}</span>}
                        <span className="hero-rating">★ {rating}</span>
                        <span className="hero-genres">{genres}</span>
                    </div>
                    <p className="hero-overview">
                        {overview.length > 200 ? overview.substring(0, 200) + "..." : overview}
                    </p>
                    {featuredMovie && (
                        <button
                            className="hero-cta"
                            onClick={() => onOpenMovie?.(featuredMovie)}
                        >
                            View Details
                        </button>
                    )}
                </div>

                <div className="hero-poster-wrapper">
                    <div
                        className="hero-poster"
                        onClick={() => featuredMovie && onOpenMovie?.(featuredMovie)}
                        style={{ cursor: featuredMovie ? "pointer" : "default" }}
                    >
                        {posterUrl ? (
                            <img src={posterUrl} alt={`${title} poster`} />
                        ) : (
                            <span>Loading...</span>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
