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
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await Spotify.getAccessToken();
       // console.log('Token:', token);

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
  if (!searchTerm.trim()) {
    return;
  }

  try {
    setErrorMessage('');
    const results = await Spotify.search(searchTerm);
    setSearchResults(results);
  } catch (error) {
    console.error(error);
    setErrorMessage(
  'Spotify API access is restricted. Make sure the app owner has Premium and your account is allowlisted.'
);
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

  const savePlaylist = async () => {
  const uris = playlistTracks.map((track) => track.uri);

  try {
    setErrorMessage('');
    await Spotify.savePlaylist(playlistName, uris);
    setPlaylistName('New Playlist');
    setPlaylistTracks([]);
  } catch (error) {
    console.error(error);
    setErrorMessage(error.message);
  }
};

  return (
    <div>
      <h1>Jammming</h1>
      {errorMessage && <p>{errorMessage}</p>}
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
        onSave={savePlaylist}
      />
    </div>
  );
}

export default App;