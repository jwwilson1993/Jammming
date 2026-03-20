function Track({ track, onAdd, onRemove }) {
  const renderAction = () => {
    if (onRemove) {
      return <button onClick={() => onRemove(track)}>-</button>;
    }
    return <button onClick={() => onAdd(track)}>+</button>;
  };

  return (
    <div>
      <h3>{track.name}</h3>
      <p>{track.artist} | {track.album}</p>
      {renderAction()}
    </div>
  );
}

export default Track;