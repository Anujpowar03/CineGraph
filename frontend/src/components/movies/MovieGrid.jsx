import MovieCard from './MovieCard.jsx';

export default function MovieGrid({ movies, showOverview = true, renderFooter }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard key={movie.movieId} movie={movie} showOverview={showOverview} footer={renderFooter?.(movie)} />
      ))}
    </div>
  );
}
