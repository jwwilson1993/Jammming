import Tracklist from '../Tracklist/Tracklist';

function SearchResults({ tracks, onAdd }) {
  return (
    <div>
      <h2>Results</h2>
      <Tracklist tracks={tracks} onAdd={onAdd} />
    </div>
  );
}

export default SearchResults;