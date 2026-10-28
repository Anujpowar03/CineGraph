export const formatRuntime = (minutes) => {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
};

export const formatRating = (rating) => (rating == null ? '–' : Number(rating).toFixed(1));

export const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const percent = (value) => (value == null ? '–' : `${Math.round(value * 100)}%`);

export const pluralise = (count, word, plural = `${word}s`) => `${count} ${count === 1 ? word : plural}`;
