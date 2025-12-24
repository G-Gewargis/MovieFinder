import { buildBackdropUrl } from "../api/tmdb"

export default function WatchListItem({ movie, onRemove, onToggleWatched, onSetRating }) {
    const title = movie?.title ?? "Untitled"
    const watched = !!movie?.watched
    const rating = Number.isFinite(movie?.rating) ? movie.rating : 0
    const backdropUrl = buildBackdropUrl(movie?.backdropPath, "w300")
    const voteAverage = Number.isFinite(movie?.voteAverage)
        ? movie.voteAverage.toFixed(1)
        : "—"
    const year = movie?.releaseDate?.slice(0, 4) || "—"

    return (
        <div
            className={`watchlist-item ${watched ? "watched" : ""}`}
            role="listitem"
            style={{
                backgroundImage: backdropUrl ? `url(${backdropUrl})` : "none"
            }}
        >
            <div className="watchlist-item-overlay" />
            <div className="watchlist-item-content">
                <div className="watchlist-item-main">
                    <div className="watchlist-item-header">
                        <div className="watchlist-item-title">{title}</div>
                        <div className="watchlist-item-meta">
                            <span className="watchlist-item-year">{year}</span>
                            <span className="watchlist-item-rating">★ {voteAverage}</span>
                        </div>
                    </div>
                    <div className="watchlist-item-controls">
                        <label className="watched-toggle">
                            <input type="checkbox" checked={watched} onChange={onToggleWatched} />
                            Watched
                        </label>

                        <label className="rating-control">
                            My Rating
                            <select
                                value={rating}
                                onChange={(e) => onSetRating?.(Number(e.target.value))}
                            >
                                <option value={0}>—</option>
                                <option value={1}>★</option>
                                <option value={2}>★★</option>
                                <option value={3}>★★★</option>
                                <option value={4}>★★★★</option>
                                <option value={5}>★★★★★</option>
                            </select>
                        </label>

                        <button type="button" className="remove-btn" onClick={onRemove}>
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
