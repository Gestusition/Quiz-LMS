export function formatDate(dateText) {
  if (!dateText) return '-';
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return String(dateText);
  return date.toLocaleString();
}

export function formatDateOnly(dateText) {
  if (!dateText) return '-';
  const text = String(dateText);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString();
  }
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString();
}

export function dateInputValue(dateText) {
  if (!dateText) return '';
  const text = String(dateText);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return '';
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
