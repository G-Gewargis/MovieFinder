export default function Header() {
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId)
        if (element) {
            const headerOffset = 80
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            })
        }
    }

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    return (
        <header className="app-header">
            <div className="header-inner">
                <div className="brand" aria-label="App name" onClick={scrollToTop} style={{ cursor: "pointer" }}>
                    <span className="brand-mark">🎬</span>
                    <span className="brand-name">MovieFinder</span>
                </div>

                <nav className="header-nav" aria-label="Primary navigation">
                    <button
                        type="button"
                        className="header-link"
                        onClick={() => scrollToSection("trending-section")}
                    >
                        Trending
                    </button>
                    <button
                        type="button"
                        className="header-link"
                        onClick={() => scrollToSection("all-movies-section")}
                    >
                        All Movies
                    </button>
                    <button
                        type="button"
                        className="header-link"
                        onClick={() => scrollToSection("watchlist-section")}
                    >
                        Watchlist
                    </button>
                </nav>
            </div>
        </header>
    )
}