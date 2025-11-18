// Mude para false quando for fazer deploy


export const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://lettie-nonsegregative-isabella.ngrok-free.dev';