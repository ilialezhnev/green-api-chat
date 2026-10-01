export const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
