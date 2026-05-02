export function table(headers, rowsHtml) {
  return `
    <div class="table-wrap">
      <table class="table">
        <thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}
