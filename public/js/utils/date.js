export function formatDate(dateText) {
  if (!dateText) return '-';
  const date = parseAppDate(dateText);
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
  const date = parseAppDate(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString();
}

export function dateInputValue(dateText) {
  if (!dateText) return '';
  const text = String(dateText);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const date = parseAppDate(text);
  if (Number.isNaN(date.getTime())) return '';
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseAppDate(value) {
  const text = String(value || '').trim();
  if (!text) return new Date('');

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(text)) {
    return new Date(`${text.replace(' ', 'T')}Z`);
  }

  return new Date(text);
}
