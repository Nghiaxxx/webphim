import React from 'react';
import MovieCard from './MovieCard';

function MovieList({ movies, selectedMovie, onSelect }) {
  if (!movies.length) {
    return <div className="empty">Hiện chưa có phim nào.</div>;
  }

  return (
    <div>
      <h2 className="section-title">Chọn phim</h2>
      <div className="movies-grid">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            active={selectedMovie && selectedMovie.id === movie.id}
            onClick={() => onSelect(movie)}
          />
        ))}
      </div>
    </div>
  );
}

export default MovieList;


