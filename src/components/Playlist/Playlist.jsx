import Tracklist from '../Tracklist/Tracklist';

function Playlist({ tracks, onRemove }) {
  return (
    <div>
      <h2>My Playlist</h2>
      <Tracklist tracks={tracks} onRemove={onRemove} />
    </div>
  );
}

export default Playlist;