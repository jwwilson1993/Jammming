import { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar/SearchBar';
import SearchResults from './components/SearchResults/SearchResults';
import Playlist from './components/Playlist/Playlist';
import Spotify from './utils/spotify';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [playlistName, setPlaylistName] = useState('My Playlist');
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await Spotify.getAccessToken();
        console.log('Token:', token);

        if (token) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadToken();
  }, []);

  const handleLogin = async () => {
    try {
      await Spotify.redirectToAuthCodeFlow();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    try {
      const results = await Spotify.search(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error(error);
    }
  };

  const addTrack = (track) => {
    if (playlistTracks.find((saved) => saved.id === track.id)) {
      return;
    }

    setPlaylistTracks((prev) => [...prev, track]);
  };

  const removeTrack = (track) => {
    setPlaylistTracks((prev) =>
      prev.filter((saved) => saved.id !== track.id)
    );
  };

  return (
    <div>
      <h1>Jammming</h1>

      {isLoggedIn && <p>Connected to Spotify ✅</p>}

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
        onLogin={handleLogin}
      />

      <SearchResults tracks={searchResults} onAdd={addTrack} />

      <Playlist
        tracks={playlistTracks}
        onRemove={removeTrack}
        name={playlistName}
        setName={setPlaylistName}
      />
    </div>
  );
}

export default App;