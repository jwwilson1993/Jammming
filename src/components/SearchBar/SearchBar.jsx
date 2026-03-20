function SearchBar({ searchTerm, onSearchChange, onSearch, onLogin }) {
  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search for a song"
      />
      <button onClick={onSearch}>Search</button>
      <button onClick={onLogin}>Connect Spotify</button>
    </div>
  );
}

export default SearchBar;