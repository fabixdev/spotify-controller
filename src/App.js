import React, { useState, useEffect } from 'react';

function SpotifyController() {
  const [accessToken, setAccessToken] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // IMPORTANTE: Sostituisci CON I TUOI VALORI
  const CLIENT_ID = '8a11eaa01d9248f283913e18c1f4394cD';
  const REDIRECT_URI = 'https://fabixdev.github.io/spotify-controller';
  const SCOPES = [
    'user-read-playback-state', 
    'user-modify-playback-state', 
    'user-read-currently-playing'
  ].join('%20');

  const handleLogin = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&show_dialog=true`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce((acc, item) => {
        let parts = item.split('=');
        acc[parts[0]] = decodeURIComponent(parts[1]);
        return acc;
      }, {});
    
    if (hash.access_token) {
      setAccessToken(hash.access_token);
      getCurrentTrack(hash.access_token);
    }
  }, []);

  const getCurrentTrack = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCurrentTrack(data.item);
      setIsPlaying(data.is_playing);
    } catch (error) {
      console.error('Errore track:', error);
    }
  };

  const controlSpotify = async (action) => {
    try {
      await fetch(`https://api.spotify.com/v1/me/player/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      getCurrentTrack(accessToken);
    } catch (error) {
      console.error(`Errore ${action}:`, error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Spotify Controller</h1>
      
      {!accessToken ? (
        <button 
          onClick={handleLogin} 
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
        >
          Connetti a Spotify
        </button>
      ) : (
        <div>
          {currentTrack && (
            <div className="mb-4 text-center">
              <h2 className="text-xl font-semibold">{currentTrack.name}</h2>
              <p className="text-gray-600">
                {currentTrack.artists.map(a => a.name).join(', ')}
              </p>
              {currentTrack.album.images[0] && (
                <img 
                  src={currentTrack.album.images[0].url} 
                  alt="Album Cover" 
                  className="mx-auto mt-2 w-48 h-48 object-cover rounded-lg"
                />
              )}
            </div>
          )}
          
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => controlSpotify('previous')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Precedente
            </button>
            <button 
              onClick={() => controlSpotify(isPlaying ? 'pause' : 'play')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              {isPlaying ? 'Pausa' : 'Riproduci'}
            </button>
            <button 
              onClick={() => controlSpotify('next')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Successivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpotifyController;