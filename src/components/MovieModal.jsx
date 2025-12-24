import { useEffect, useRef } from "react"
import { buildProfileUrl, buildPosterUrl, buildLogoUrl } from "../api/tmdb"

export default function MovieModal({
    movie,
    isInWatchlist,
    isLoading,
    error,
    posterUrl,
    backdropUrl,
    onClose,
    onAddToWatchlist,
    onRemoveFromWatchlist,
    onOpenMovie,
}) {
    const isOpen = !!movie
    const closeButtonRef = useRef(null)
    const previouslyFocusedRef = useRef(null)

    // Close the modal when Escape is pressed
    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose?.()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, onClose])

    //  Remedy for focusing on modal, since pressing space would cause a stutter. 
    useEffect(() => {
        if (!isOpen) return undefined

        previouslyFocusedRef.current = document.activeElement
        closeButtonRef.current?.focus()

        return () => {
            const el = previouslyFocusedRef.current
            if (el && typeof el.focus === "function") {
                el.focus()
            }
        }
    }, [isOpen])

    if (!isOpen) return null

    const title = movie?.title ?? "Untitled"
    const overview = movie?.overview ?? "No overview yet."
    const releaseDate = movie?.releaseDate ?? "—"
    const voteAverage = movie?.voteAverage
    const ratingText = Number.isFinite(voteAverage) ? voteAverage.toFixed(1) : "—"
    const runtime = Number.isFinite(movie?.runtime) ? `${movie.runtime} min` : "—"
    const genres = Array.isArray(movie?.genres) ? movie.genres.join(", ") : "—"
    const tagline = movie?.tagline
    const status = movie?.status || ""
    const director = movie?.director || "—"
    const cast = movie?.cast || []
    const similarMovies = movie?.similarMovies || []
    const streamingProviders = movie?.streamingProviders || []
    const rentProviders = movie?.rentProviders || []
    const buyProviders = movie?.buyProviders || []
    const watchProvidersLink = movie?.watchProvidersLink

    const hasWatchProviders = streamingProviders.length > 0 || rentProviders.length > 0 || buyProviders.length > 0

    function onBackdropClick(e) {
        if (e.target === e.currentTarget) onClose?.()
    }

    function handleSimilarMovieClick(similarMovie) {
        const movieToOpen = {
            id: similarMovie.id,
            title: similarMovie.title,
            posterPath: similarMovie.posterPath,
            voteAverage: similarMovie.voteAverage,
            releaseDate: similarMovie.releaseDate,
        }
        onOpenMovie?.(movieToOpen)
    }

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onBackdropClick}>
            <div className="modal">
                {backdropUrl ? (
                    <div className="modal-backdrop-image" aria-hidden="true" style={{ backgroundImage: `url(${backdropUrl})` }} />
                ) : null}
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <div className="modal-poster" aria-label="Poster placeholder">
                        {posterUrl ? (
                            <img src={posterUrl} alt={`${title} poster`} loading="lazy" />
                        ) : (
                            <span>Poster</span>
                        )}
                    </div>
                    <div className="modal-details">
                        <p className="modal-meta">
                            <strong>Release:</strong> {releaseDate} &nbsp; <strong>Rating:</strong> ★ {ratingText}
                        </p>
                        <p className="modal-meta">
                            <strong>Runtime:</strong> {runtime} &nbsp; <strong>Status:</strong> {status || "—"}
                        </p>
                        <p className="modal-meta">
                            <strong>Director:</strong> {director}
                        </p>
                        <p className="modal-meta">
                            <strong>Genres:</strong> {genres}
                        </p>
                        {tagline ? <p className="modal-tagline">"{tagline}"</p> : null}
                        {isLoading ? (
                            <p className="modal-overview" aria-live="polite">Loading details…</p>
                        ) : error ? (
                            <p className="modal-overview" aria-live="assertive">{error}</p>
                        ) : (
                            <p className="modal-overview">{overview}</p>
                        )}
                    </div>
                </div>

                {/* Cast Section */}
                {cast.length > 0 && (
                    <div className="modal-section">
                        <h4 className="modal-section-title">Cast</h4>
                        <div className="cast-grid">
                            {cast.map((person) => {
                                const profileUrl = buildProfileUrl(person.profilePath, "w185")
                                return (
                                    <div key={person.id} className="cast-card">
                                        <div className="cast-photo">
                                            {profileUrl ? (
                                                <img src={profileUrl} alt={person.name} loading="lazy" />
                                            ) : (
                                                <span className="cast-photo-placeholder">👤</span>
                                            )}
                                        </div>
                                        <div className="cast-info">
                                            <p className="cast-name">{person.name}</p>
                                            <p className="cast-character">{person.character}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Watch Providers Section */}
                {hasWatchProviders && (
                    <div className="modal-section">
                        <h4 className="modal-section-title">
                            Where to Watch
                            <span className="provider-attribution">via JustWatch</span>
                        </h4>
                        <div className="providers-container">
                            {streamingProviders.length > 0 && (
                                <div className="provider-group">
                                    <p className="provider-label">Stream</p>
                                    <div className="provider-logos">
                                        {streamingProviders.map((provider) => {
                                            const logoUrl = buildLogoUrl(provider.logoPath)
                                            return (
                                                <div key={provider.id} className="provider-logo" title={provider.name}>
                                                    {logoUrl ? (
                                                        <img src={logoUrl} alt={provider.name} />
                                                    ) : (
                                                        <span>{provider.name.slice(0, 2)}</span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            {rentProviders.length > 0 && (
                                <div className="provider-group">
                                    <p className="provider-label">Rent</p>
                                    <div className="provider-logos">
                                        {rentProviders.map((provider) => {
                                            const logoUrl = buildLogoUrl(provider.logoPath)
                                            return (
                                                <div key={provider.id} className="provider-logo" title={provider.name}>
                                                    {logoUrl ? (
                                                        <img src={logoUrl} alt={provider.name} />
                                                    ) : (
                                                        <span>{provider.name.slice(0, 2)}</span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            {buyProviders.length > 0 && (
                                <div className="provider-group">
                                    <p className="provider-label">Buy</p>
                                    <div className="provider-logos">
                                        {buyProviders.map((provider) => {
                                            const logoUrl = buildLogoUrl(provider.logoPath)
                                            return (
                                                <div key={provider.id} className="provider-logo" title={provider.name}>
                                                    {logoUrl ? (
                                                        <img src={logoUrl} alt={provider.name} />
                                                    ) : (
                                                        <span>{provider.name.slice(0, 2)}</span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        {watchProvidersLink && (
                            <a
                                href={watchProvidersLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="providers-link"
                            >
                                View all watch options →
                            </a>
                        )}
                    </div>
                )}

                {/* Similar Movies Section */}
                {similarMovies.length > 0 && (
                    <div className="modal-section">
                        <h4 className="modal-section-title">Similar Movies</h4>
                        <div className="similar-movies-grid">
                            {similarMovies.map((similar) => {
                                const similarPosterUrl = buildPosterUrl(similar.posterPath, "w342")
                                const similarRating = Number.isFinite(similar.voteAverage)
                                    ? similar.voteAverage.toFixed(1)
                                    : "—"
                                return (
                                    <button
                                        key={similar.id}
                                        type="button"
                                        className="similar-movie-card"
                                        onClick={() => handleSimilarMovieClick(similar)}
                                    >
                                        <div className="similar-movie-poster">
                                            {similarPosterUrl ? (
                                                <img src={similarPosterUrl} alt={similar.title} loading="lazy" />
                                            ) : (
                                                <span>No Poster</span>
                                            )}
                                        </div>
                                        <div className="similar-movie-info">
                                            <p className="similar-movie-title">{similar.title}</p>
                                            <p className="similar-movie-rating">★ {similarRating}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="modal-actions">
                    {isInWatchlist ? (
                        <button
                            type="button"
                            className="secondary"
                            onClick={() => onRemoveFromWatchlist?.(movie.id)}
                        >
                            Remove from Watchlist
                        </button>
                    ) : (
                        <button type="button" className="primary" onClick={() => onAddToWatchlist?.(movie)}>
                            Add to Watchlist
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
