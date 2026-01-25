
export const formatTime = (ms: number, showMs: boolean = true) => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);

  const h = hours.toString().padStart(2, '0');
  const m = minutes.toString().padStart(2, '0');
  const s = seconds.toString().padStart(2, '0');
  const cs = centiseconds.toString().padStart(2, '0');

  if (hours > 0) {
    return `${h}:${m}:${s}${showMs ? '.' + cs : ''}`;
  }
  return `${m}:${s}${showMs ? '.' + cs : ''}`;
};

export const formatDuration = (ms: number) => {
  const seconds = (ms / 1000).toFixed(2);
  return `+${seconds}s`;
};
