import { useEffect, useRef } from "react"

export default function BrowseToolbar({
    searchQuery,
    onSearchChange,
    onSearch,
    onClearSearch,
    isSearching,
    selectedGenre,
    genres,
    onSelectGenre,
}) {
    const inputRef = useRef(null)
    const debounceRef = useRef(null)

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        if (searchQuery.trim()) {
            debounceRef.current = setTimeout(() => {
                onSearch?.(searchQuery)
            }, 400)
        } else {
            onClearSearch?.()
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [searchQuery])

    const handleClear = () => {
        onClearSearch?.()
        inputRef.current?.focus()
    }

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            handleClear()
        }
    }

    const quickGenres = ["All", "Action", "Comedy", "Drama", "Horror"]
    const otherGenres = (genres || []).filter(g => !quickGenres.includes(g))
    const allGenres = ["All", ...(genres || [])]

    return (
        <section className="browse-toolbar" aria-label="Browse and filter movies">
            <div className="browse-toolbar-container">
                <div className="browse-toolbar-inner">
                    <div className="search-row">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search movies..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                                onKeyDown={handleKeyDown}
                                aria-label="Search movies"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="search-clear"
                                    onClick={handleClear}
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                            {isSearching && <span className="search-spinner" aria-label="Searching" />}
                        </div>
                    </div>

                    <div className="genre-filter-row desktop-genres">
                        <div className="genre-pills" role="group" aria-label="Quick genre filters">
                            {quickGenres.map((genre) => (
                                <button
                                    key={genre}
                                    type="button"
                                    className={`genre-pill ${genre === selectedGenre ? "active" : ""}`}
                                    onClick={() => onSelectGenre?.(genre)}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>

                        {otherGenres.length > 0 && (
                            <select
                                className="genre-dropdown"
                                value={otherGenres.includes(selectedGenre) ? selectedGenre : ""}
                                onChange={(e) => e.target.value && onSelectGenre?.(e.target.value)}
                                aria-label="More genres"
                            >
                                <option value="">More genres...</option>
                                {otherGenres.map((genre) => (
                                    <option key={genre} value={genre}>
                                        {genre}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Mobile genre dropdown */}
                    <div className="genre-filter-row mobile-genres">
                        <select
                            className="genre-dropdown-mobile"
                            value={selectedGenre}
                            onChange={(e) => onSelectGenre?.(e.target.value)}
                            aria-label="Select genre"
                        >
                            {allGenres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre === "All" ? "All Genres" : genre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </section>
    )
}
