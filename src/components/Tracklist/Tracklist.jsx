import Track from '../Track/Track';

function Tracklist({ tracks, onAdd, onRemove}) {
  return (
    <div>
      {tracks.map(track => (
        <Track 
            key={track.id}
            track={track}
            onAdd={onAdd}
            onRemove={onRemove}
         />
      ))}
    </div>
  );
}

export default Tracklist;