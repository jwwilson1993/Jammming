const clientId = '6b33b33f81d44fb5811eb6d6dfc4e77e';
const redirectUri = 'http://127.0.0.1:5173/';
const scope =
  'playlist-modify-public playlist-modify-private playlist-read-private';

let accessToken = '';
let tokenExpiresAt = 0;

function generateRandomString(length) {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';

  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const Spotify = {
  async redirectToAuthCodeFlow() {
    const verifier = generateRandomString(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem('spotify_code_verifier', verifier);

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.search = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    }).toString();

    window.location.href = authUrl.toString();
  },

  async getAccessToken() {
    if (accessToken && Date.now() < tokenExpiresAt) {
      return accessToken;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      return null;
    }

    const verifier = localStorage.getItem('spotify_code_verifier');

    window.history.replaceState({}, document.title, '/');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
    }

    const jsonResponse = await response.json();
    accessToken = jsonResponse.access_token;
    tokenExpiresAt = Date.now() + jsonResponse.expires_in * 1000;

    return accessToken;
  },

  async search(term) {
    const token = await this.getAccessToken();

    if (!token || !term.trim()) {
      return [];
    }

    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to search Spotify: ${response.status} ${errorText}`);
    }

    const jsonResponse = await response.json();

    if (!jsonResponse.tracks) {
      return [];
    }

    return jsonResponse.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      uri: track.uri,
    }));
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }

    const token = await this.getAccessToken();

    if (!token) {
      throw new Error('No access token available');
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers,
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`Failed to get user profile: ${userResponse.status} ${errorText}`);
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    const createResponse = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: name,
        }),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create playlist: ${createResponse.status} ${errorText}`);
    }

    const playlistData = await createResponse.json();
    const playlistId = playlistData.id;

    const addTracksResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          uris: trackUris,
        }),
      }
    );

    if (!addTracksResponse.ok) {
      const errorText = await addTracksResponse.text();
      throw new Error(`Failed to add tracks: ${addTracksResponse.status} ${errorText}`);
    }
  },
};

export default Spotify;