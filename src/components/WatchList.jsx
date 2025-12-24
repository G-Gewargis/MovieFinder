import WatchListItem from "./WatchListItem"

export default function WatchList({ watchList = [], onRemove, onToggleWatched, onSetRating }) {
    const count = watchList.length
    return (
        <div className="watchlist-inner">
            <div className="section-header">
                <div className="section-header-left">
                    <h2>
                        Your Watchlist
                        <span className="watchlist-count" aria-label={`Watchlist count ${count}`}>
                            {count}
                        </span>
                    </h2>
                </div>
                <p className="section-subtitle">Click movies to manage watched + rating.</p>
            </div>

            {watchList.length === 0 ? (
                <div className="empty-state">
                    Your watchlist is empty. When movies load, click a card to add it.
                </div>
            ) : (
                <div className="watchlist-list" role="list">
                    {watchList.map((movie) => (
                        <WatchListItem
                            key={movie.id}
                            movie={movie}
                            onRemove={() => onRemove?.(movie.id)}
                            onToggleWatched={() => onToggleWatched?.(movie.id)}
                            onSetRating={(rating) => onSetRating?.(movie.id, rating)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}