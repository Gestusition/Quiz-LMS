export function esc(valueText) {
  const div = document.createElement('div');
  div.textContent = valueText === undefined || valueText === null ? '' : String(valueText);
  return div.innerHTML;
}
