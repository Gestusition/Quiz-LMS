export function formatDate(dateText) {
  if (!dateText) return '-';
  return new Date(dateText).toLocaleString();
}
