import { buildPosterUrl } from "../api/tmdb"

export default function MovieCard({ movie, onClick }) {
    const title = movie?.title ?? "Untitled"
    const voteAverage = movie?.voteAverage
    const ratingText = Number.isFinite(voteAverage) ? voteAverage.toFixed(1) : "—"
    const posterUrl = buildPosterUrl(movie?.posterPath, "w500")

    return (
        <button
            type="button"
            className="movie-card"
            onClick={onClick}
            aria-label={`Open details for ${title}`}
        >
            <div className="movie-poster">
                {posterUrl ? (
                    <img src={posterUrl} alt={`${title} poster`} loading="lazy" />
                ) : (
                    <span>No Poster</span>
                )}
            </div>
            <div className="movie-info">
                <h3 className="movie-title">{title}</h3>
                <p className="movie-rating">★ {ratingText}</p>
            </div>
        </button>
    )
}
