import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import MovieCard from './MovieCard.jsx';

/** Horizontally scrolling row with buttons; also scrolls by touch / trackpad. */
export default function MovieRow({ movies, label }) {
  const scroller = useRef(null);
  const scroll = (dir) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.85, behavior: 'smooth' });

  return (
    <div className="relative">
      <div
        ref={scroller}
        className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
        role="list"
        aria-label={label}
      >
        {movies.map((movie) => (
          <div key={movie.movieId} role="listitem" className="w-[42%] shrink-0 snap-start sm:w-[28%] md:w-[22%] lg:w-[17.5%]">
            <MovieCard movie={movie} showOverview={false} footer={null} />
          </div>
        ))}
      </div>
      {movies.length > 5 && (
        <>
          <button
            type="button"
            className="btn-secondary absolute -left-3 top-[38%] hidden h-10 w-10 -translate-y-1/2 rounded-full bg-ink-900/90 p-0 backdrop-blur sm:inline-flex"
            onClick={() => scroll(-1)}
            aria-label={`Scroll ${label} left`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="btn-secondary absolute -right-3 top-[38%] hidden h-10 w-10 -translate-y-1/2 rounded-full bg-ink-900/90 p-0 backdrop-blur sm:inline-flex"
            onClick={() => scroll(1)}
            aria-label={`Scroll ${label} right`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
