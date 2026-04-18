export function buildCsv<K extends string>(headers: K[], rows: Array<Record<K, string | undefined>>): string {
  const escape = (v: string | undefined) => {
    const s = v ?? "";
    if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\r\n") + "\r\n";
}
