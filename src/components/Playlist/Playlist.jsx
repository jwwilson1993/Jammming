import Tracklist from '../Tracklist/Tracklist';

function Playlist({ tracks }) {
  return (
    <div>
      <h2>My Playlist</h2>
      <Tracklist tracks={tracks} />
    </div>
  );
}

export default Playlist;