function Track({ track, onAdd }) {
  return (
    <div>
      <h3>{track.name}</h3>
      <p>{track.artist} | {track.album}</p>
      <button onClick={() => onAdd(track)}>+</button>
    </div>
  );
}

export default Track;