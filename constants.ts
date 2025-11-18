// Mude para false quando for fazer deploy


export const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://task.loca.lt';