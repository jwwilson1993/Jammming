const clientId = '6b33b33f81d44fb5811eb6d6dfc4e77e';
const redirectUri = 'http://127.0.0.1:5173/';
const scope = 'playlist-modify-public playlist-modify-private';

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

    // Remove the code immediately so StrictMode/dev re-runs don't reuse it
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
      throw new Error(`Failed to get access token: ${errorText}`);
    }

    const jsonResponse = await response.json();
    accessToken = jsonResponse.access_token;
    tokenExpiresAt = Date.now() + jsonResponse.expires_in * 1000;

    return accessToken;
  },
  async search(term) {
  const token = await this.getAccessToken();

  if (!token) {
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
    throw new Error('Failed to search Spotify');
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
}
};

export default Spotify;