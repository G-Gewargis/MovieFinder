const DEFAULT_GENRES = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Drama",
    "Horror",
    "Romance",
    "Science Fiction",
    "Thriller",
]

export default function GenreFilter({ selectedGenre = "All", genres = DEFAULT_GENRES, onSelectGenre }) {
    const uniqueGenres = Array.from(new Set(genres)).filter(Boolean)
    const options = ["All", ...uniqueGenres]

    return (
        <section className="genre-filter" aria-label="Filter by genre">
            <div className="section-header">
                <h2>Filter by Genre</h2>
                <p className="section-subtitle">Pick a genre to narrow results.</p>
            </div>

            <div className="genre-buttons" role="group" aria-label="Genre buttons">
                {options.map((genre) => (
                    <button
                        key={genre}
                        type="button"
                        className={genre === selectedGenre ? "genre-btn active" : "genre-btn"}
                        onClick={() => onSelectGenre?.(genre)}
                    >
                        {genre}
                    </button>
                ))}
            </div>
        </section>
    )
}