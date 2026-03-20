import Track from '../Track/Track';

function Tracklist({ tracks, onAdd}) {
  return (
    <div>
      {tracks.map(track => (
        <Track key={track.id} track={track} onAdd={onAdd} />
      ))}
    </div>
  );
}

export default Tracklist;