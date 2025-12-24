const API_BASE = "https://api.themoviedb.org/3"
const IMAGE_BASE = "https://image.tmdb.org/t/p/"

const apiKey = import.meta.env.VITE_TMDB_API_KEY

function ensureApiKey() {
    if (!apiKey) {
        throw new Error("TMDB API key missing. VITE_TMDB_API_KEY missing from .env file.")
    }
}

function buildUrl(path, params = {}) {
    ensureApiKey()
    const url = new URL(`${API_BASE}${path}`)
    url.searchParams.set("api_key", apiKey)
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) url.searchParams.set(key, value)
    })
    return url.toString()
}

async function fetchJson(path, params) {
    const url = buildUrl(path, params)
    const res = await fetch(url)
    if (!res.ok) {
        const message = `TMDB request failed (${res.status})`
        throw new Error(message)
    }
    return res.json()
}

export async function fetchGenreMap() {
    const { genres = [] } = await fetchJson("/genre/movie/list")
    return genres.reduce((map, genre) => {
        if (genre?.id && genre?.name) map[genre.id] = genre.name
        return map
    }, {})
}

export function normalizeMovie(movie, genreMap = {}) {
    const genresFromIds = Array.isArray(movie?.genre_ids)
        ? movie.genre_ids.map((id) => genreMap[id]).filter(Boolean)
        : []
    const genresFromObjects = Array.isArray(movie?.genres)
        ? movie.genres.map((g) => g?.name).filter(Boolean)
        : []
    const genres = genresFromIds.length > 0 ? genresFromIds : genresFromObjects

    const voteAverage = Number.isFinite(movie?.vote_average) ? movie.vote_average : null
    const popularity = Number.isFinite(movie?.popularity) ? movie.popularity : null

    // Extract cast from credits (top 10)
    const cast = Array.isArray(movie?.credits?.cast)
        ? movie.credits.cast.slice(0, 10).map((person) => ({
            id: person.id,
            name: person.name,
            character: person.character,
            profilePath: person.profile_path,
        }))
        : []

    // Extract director from crew
    const director = movie?.credits?.crew?.find((c) => c.job === "Director")?.name || null

    // Extract similar movies (top 6)
    const similarMovies = Array.isArray(movie?.similar?.results)
        ? movie.similar.results.slice(0, 6).map((m) => ({
            id: m.id,
            title: m.title,
            posterPath: m.poster_path,
            voteAverage: m.vote_average,
            releaseDate: m.release_date,
        }))
        : []

    // Extract watch providers for US (can be extended for other regions)
    const watchProviders = movie?.["watch/providers"]?.results?.US || null
    const streamingProviders = watchProviders?.flatrate?.map((p) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: p.logo_path,
    })) || []
    const rentProviders = watchProviders?.rent?.slice(0, 4).map((p) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: p.logo_path,
    })) || []
    const buyProviders = watchProviders?.buy?.slice(0, 4).map((p) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: p.logo_path,
    })) || []

    return {
        id: movie?.id,
        title: movie?.title || movie?.name || "Untitled",
        overview: movie?.overview || "",
        releaseDate: movie?.release_date || movie?.first_air_date || "—",
        voteAverage,
        popularity,
        posterPath: movie?.poster_path || null,
        backdropPath: movie?.backdrop_path || null,
        genres,
        runtime: Number.isFinite(movie?.runtime) ? movie.runtime : null,
        tagline: movie?.tagline || "",
        status: movie?.status || "",
        cast,
        director,
        similarMovies,
        streamingProviders,
        rentProviders,
        buyProviders,
        watchProvidersLink: watchProviders?.link || null,
    }
}

export async function fetchPopularMovies(page = 1) {
    const data = await fetchJson("/movie/popular", { page })
    return data?.results || []
}

export async function fetchMoviesByGenre(genreId, page = 1) {
    const data = await fetchJson("/discover/movie", {
        with_genres: genreId,
        sort_by: "popularity.desc",
        page,
    })
    return { results: data?.results || [], totalPages: data?.total_pages || 1 }
}

export async function fetchTrendingMovies() {
    const data = await fetchJson("/trending/movie/week")
    return data?.results || []
}

export async function searchMovies(query) {
    if (!query || !query.trim()) return []
    const data = await fetchJson("/search/movie", { query: query.trim() })
    return data?.results || []
}

export async function fetchMovieDetails(id) {
    if (!id) throw new Error("Movie id is required for details")
    return fetchJson(`/movie/${id}`, { append_to_response: "videos,credits,similar,watch/providers" })
}

export function buildPosterUrl(path, size = "original") {
    if (!path) return null
    return `${IMAGE_BASE}${size}${path}`
}

export function buildBackdropUrl(path, size = "original") {
    if (!path) return null
    return `${IMAGE_BASE}${size}${path}`
}

export function buildProfileUrl(path, size = "original") {
    if (!path) return null
    return `${IMAGE_BASE}${size}${path}`
}

export function buildLogoUrl(path, size = "original") {
    if (!path) return null
    return `${IMAGE_BASE}${size}${path}`
}
