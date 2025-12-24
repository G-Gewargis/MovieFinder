// CSS imports
import './styles/variables.css'
import './styles/base.css'

// Component styles
import './styles/components/Header.css'
import './styles/components/Hero.css'
import './styles/components/TrendingCarousel.css'
import './styles/components/BrowseToolbar.css'
import './styles/components/MainContent.css'
import './styles/components/MovieCard.css'
import './styles/components/MovieGrid.css'
import './styles/components/MovieModal.css'
import './styles/components/WatchList.css'
import './styles/components/WatchListItem.css'

import { useEffect, useMemo, useRef, useState } from "react"
import Header from "./components/Header"
import Hero from "./components/Hero"
import TrendingCarousel from "./components/TrendingCarousel"
import BrowseToolbar from "./components/BrowseToolbar"
import MainContent from "./components/MainContent"
import MovieModal from "./components/MovieModal"
import {
  buildBackdropUrl,
  buildPosterUrl,
  fetchGenreMap,
  fetchMovieDetails,
  fetchMoviesByGenre,
  fetchPopularMovies,
  fetchTrendingMovies,
  normalizeMovie,
  searchMovies,
} from "./api/tmdb"


function useIsMobile(breakpoint = 720) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [breakpoint])

  return isMobile
}

function App() {
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [watchList, setWatchList] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [modalError, setModalError] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  const [allMovies, setAllMovies] = useState([])
  const [trendingMovies, setTrendingMovies] = useState([])
  const [genreMap, setGenreMap] = useState({})
  const [reverseGenreMap, setReverseGenreMap] = useState({}) // name -> id
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Genre-filtered movies 
  const [genreMovies, setGenreMovies] = useState([])
  const [genreMoviesPage, setGenreMoviesPage] = useState(1)
  const [genreMoviesTotalPages, setGenreMoviesTotalPages] = useState(1)
  const [isLoadingGenre, setIsLoadingGenre] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Mobile detection for pagination
  const isMobile = useIsMobile(720)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [maxFetchedPopularPage, setMaxFetchedPopularPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMorePopularPages, setHasMorePopularPages] = useState(true)
  const moviesPerPage = isMobile ? 4 : 9

  // Reference for scrolling to movies section
  const moviesSectionRef = useRef(null)

  const genreOptions = useMemo(() => {
    const names = Object.values(genreMap || {}).filter(Boolean)
    const unique = Array.from(new Set(names)).sort()
    return unique
  }, [genreMap])

  useEffect(() => {
    let cancelled = false

    async function loadMovies() {
      setIsLoading(true)
      setError(null)
      try {
        const genres = await fetchGenreMap()
        if (cancelled) return

        // this helps us fetch genre-specific movies later
        const reverse = {}
        for (const [id, name] of Object.entries(genres)) {
          reverse[name] = Number(id)
        }

        const [popularRaw, trendingRaw] = await Promise.all([
          fetchPopularMovies(),
          fetchTrendingMovies(),
        ])
        if (cancelled) return

        const popular = (popularRaw || []).map((movie) => normalizeMovie(movie, genres))
        const trending = (trendingRaw || []).map((movie) => normalizeMovie(movie, genres))

        setGenreMap(genres)
        setReverseGenreMap(reverse)
        setAllMovies(popular)
        setMaxFetchedPopularPage(1)
        setTrendingMovies(trending)
        setHasMorePopularPages(popular.length > 0)
      } catch (err) {
        if (cancelled) return
        console.error(err)
        setError("Failed to load movies from TMDB. Please try again.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadMovies()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredMovies = useMemo(() => {
    if (searchResults.length > 0) {
      if (selectedGenre === "All") return searchResults
      return searchResults.filter((m) => Array.isArray(m.genres) && m.genres.includes(selectedGenre))
    }
    if (selectedGenre !== "All") {
      if (genreMovies.length > 0) {
        return genreMovies
      }
      return allMovies.filter((m) => Array.isArray(m.genres) && m.genres.includes(selectedGenre))
    }
    return allMovies
  }, [allMovies, searchResults, selectedGenre, genreMovies])

  // Pagination logic
  const totalPages = useMemo(() => {
    const knownPages = Math.max(1, Math.ceil(filteredMovies.length / moviesPerPage))
    if (searchResults.length > 0) return knownPages
    // For genre-specific browsing, we know the total pages from the API
    if (selectedGenre !== "All") {
      return Math.max(knownPages, Math.min(genreMoviesTotalPages, currentPage + 1))
    }
    return hasMorePopularPages ? Math.max(knownPages, currentPage + 1) : knownPages
  }, [filteredMovies.length, moviesPerPage, searchResults.length, hasMorePopularPages, currentPage, selectedGenre, genreMoviesTotalPages])
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * moviesPerPage
    return filteredMovies.slice(startIndex, startIndex + moviesPerPage)
  }, [filteredMovies, currentPage, moviesPerPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedGenre, searchResults, isMobile])

  // Fetch genre-specific movies when a genre is selected
  useEffect(() => {
    if (selectedGenre === "All" || searchResults.length > 0) {
      setGenreMovies([])
      setGenreMoviesPage(1)
      setGenreMoviesTotalPages(1)
      setIsLoadingGenre(false)
      return
    }

    const genreId = reverseGenreMap[selectedGenre]
    if (!genreId) return

    let cancelled = false

    async function loadGenreMovies() {
      setIsLoadingGenre(true)
      try {
        const { results, totalPages } = await fetchMoviesByGenre(genreId, 1)
        if (cancelled) return
        const normalized = results.map((movie) => normalizeMovie(movie, genreMap))
        setGenreMovies(normalized)
        setGenreMoviesPage(1)
        setGenreMoviesTotalPages(totalPages)
      } catch (err) {
        console.error(err)
        if (!cancelled) setError("Could not load genre movies.")
      } finally {
        if (!cancelled) setIsLoadingGenre(false)
      }
    }

    loadGenreMovies()
    return () => { cancelled = true }
  }, [selectedGenre, reverseGenreMap, genreMap, searchResults.length])

  async function handleSearch(query) {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    try {
      const results = await searchMovies(query)
      const normalized = results.map((movie) => normalizeMovie(movie, genreMap))
      setSearchResults(normalized)
    } catch (err) {
      console.error(err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  async function ensurePopularPagesFor(targetPage) {
    if (searchResults.length > 0) return

    const neededCount = targetPage * moviesPerPage

    // Handle genre-specific pagination
    if (selectedGenre !== "All") {
      if (neededCount <= genreMovies.length) return
      if (genreMoviesPage >= genreMoviesTotalPages) return

      const genreId = reverseGenreMap[selectedGenre]
      if (!genreId) return

      const nextPageNumber = genreMoviesPage + 1
      setIsLoadingMore(true)
      try {
        const { results, totalPages } = await fetchMoviesByGenre(genreId, nextPageNumber)
        const normalized = results.map((movie) => normalizeMovie(movie, genreMap))
        setGenreMovies((prev) => {
          const existingIds = new Set(prev.map((m) => m.id))
          const newMovies = normalized.filter((m) => !existingIds.has(m.id))
          return [...prev, ...newMovies]
        })
        setGenreMoviesPage(nextPageNumber)
        setGenreMoviesTotalPages(totalPages)
      } catch (err) {
        console.error(err)
        setError("Could not load more movies. Please try again.")
      } finally {
        setIsLoadingMore(false)
      }
      return
    }

    // Handle popular movies pagination 
    if (neededCount <= allMovies.length) return

    // Fetch the next popular page from TMDB and append.
    const nextPageNumber = maxFetchedPopularPage + 1
    setIsLoadingMore(true)
    try {
      const nextPageRaw = await fetchPopularMovies(nextPageNumber)
      const normalized = (nextPageRaw || []).map((movie) => normalizeMovie(movie, genreMap))
      setAllMovies((prev) => {
        const existingIds = new Set(prev.map((m) => m.id))
        const newMovies = normalized.filter((m) => !existingIds.has(m.id))
        return [...prev, ...newMovies]
      })
      setMaxFetchedPopularPage(nextPageNumber)
      if (!nextPageRaw || nextPageRaw.length === 0) {
        setHasMorePopularPages(false)
      }
    } catch (err) {
      console.error(err)
      setError("Could not load more movies. Please try again.")
    } finally {
      setIsLoadingMore(false)
    }
  }

  async function handlePageChange(nextPage) {
    if (!Number.isFinite(nextPage)) return
    const safePage = Math.max(1, Math.floor(nextPage))

    // wait until we have enough movies loaded to show this page, to avoid flicker 
    if (searchResults.length === 0) {
      await ensurePopularPagesFor(safePage)
    }

    const boundedPage = totalPages ? Math.min(safePage, totalPages) : safePage
    setCurrentPage(boundedPage)

    // Smoothly return to the top of the grid when using the prev/next buttons
    if (moviesSectionRef.current) {
      moviesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  function clearSearch() {
    setSearchQuery("")
    setSearchResults([])
  }

  function addToWatchlist(movie) {
    if (!movie?.id) return
    setWatchList((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev
      return [...prev, { ...movie, watched: false, rating: 0 }]
    })
  }

  function removeFromWatchlist(movieId) {
    setWatchList((prev) => prev.filter((m) => m.id !== movieId))
  }

  function toggleWatched(movieId) {
    setWatchList((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, watched: !m.watched } : m))
    )
  }

  function setRating(movieId, rating) {
    const safeRating = Number.isFinite(rating) ? rating : 0
    setWatchList((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, rating: safeRating } : m))
    )
  }

  async function openMovie(movie) {
    if (!movie?.id) return
    setSelectedMovie(movie)
    setModalError(null)
    setModalLoading(true)

    try {
      const details = await fetchMovieDetails(movie.id)
      const normalized = normalizeMovie(details, genreMap)
      setSelectedMovie((prev) => ({
        ...prev,
        ...normalized,
        voteAverage: prev?.voteAverage ?? normalized.voteAverage,
      }))
    } catch (err) {
      console.error(err)
      setModalError("Could not load movie details.")
    } finally {
      setModalLoading(false)
    }
  }

  function closeMovie() {
    setModalError(null)
    setSelectedMovie(null)
  }

  return (
    <>
      <Header />
      <Hero
        featuredMovie={trendingMovies[0]}
        onOpenMovie={openMovie}
      />
      <TrendingCarousel
        movies={trendingMovies}
        onOpenMovie={openMovie}
        isLoading={isLoading}
        error={error}
      />
      <BrowseToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        onClearSearch={clearSearch}
        isSearching={isSearching}
        selectedGenre={selectedGenre}
        genres={genreOptions}
        onSelectGenre={setSelectedGenre}
      />
      <MainContent
        watchList={watchList}
        movies={paginatedMovies}
        totalMovies={filteredMovies.length}
        selectedGenre={selectedGenre}
        isLoading={isLoading || isLoadingGenre}
        isSearching={isSearching}
        searchQuery={searchQuery}
        error={error}
        onOpenMovie={openMovie}
        onRemoveFromWatchlist={removeFromWatchlist}
        onToggleWatched={toggleWatched}
        onSetRating={setRating}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoadingMore={isLoadingMore}
        moviesSectionRef={moviesSectionRef}
      />
      <MovieModal
        movie={selectedMovie}
        isInWatchlist={!!selectedMovie && watchList.some((m) => m.id === selectedMovie.id)}
        isLoading={modalLoading}
        error={modalError}
        posterUrl={buildPosterUrl(selectedMovie?.posterPath, "w500")}
        backdropUrl={buildBackdropUrl(selectedMovie?.backdropPath, "w300")}
        onClose={closeMovie}
        onAddToWatchlist={addToWatchlist}
        onRemoveFromWatchlist={removeFromWatchlist}
        onOpenMovie={openMovie}
      />
    </>
  )
}

export default App
