import { useState } from 'react';
import SearchResults from './components/SearchResults/SearchResults';
import Playlist from './components/Playlist/Playlist';

const mockTracks = [
  { id: 1, name: "Song A", artist: "Artist A", album: "Album A" },
  { id: 2, name: "Song B", artist: "Artist B", album: "Album B" }
];

function App() {
  const [searchResults, setSearchResults] = useState(mockTracks);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const addTrack = (track) => {
  if (playlistTracks.find(saved => saved.id === track.id)) {
    return; // prevents duplicates
  }

  setPlaylistTracks(prev => [...prev, track]);
};

  return (
    <div>
      <h1>Jammming</h1>
      <SearchResults tracks={searchResults} onAdd={addTrack} />
      <Playlist tracks={playlistTracks} />
    </div>
  );
}

export default App;