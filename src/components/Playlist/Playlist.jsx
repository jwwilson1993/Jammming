import Tracklist from '../Tracklist/Tracklist';

function Playlist({ tracks, onRemove, name, setName }) {
  return (
    <div>
        <h2><input
            value={name}
            onChange={(e) => setName(e.target.value)}
             />
        </h2>
        <Tracklist tracks={tracks} onRemove={onRemove} />
        

       
      
    </div>
  );
}

export default Playlist;