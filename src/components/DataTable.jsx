export function DataTable({ relation, label = 'Datos de la relación', compact = false }) {
  return <div role="region" aria-label={`${label}. Desplázate para ver todas las columnas.`} tabIndex={0} class={`data-table min-w-0 overflow-auto overscroll-contain ${compact ? 'max-h-72' : 'max-h-[330px] xl:max-h-[400px]'}`}>
    <table class="w-full border-separate border-spacing-0 whitespace-nowrap text-left text-xs">
      <thead><tr>{relation.cols.map(column => <th key={column} scope="col" class="sticky top-0 z-10 border-y border-line bg-soft px-4 py-3 font-mono text-[11px] font-semibold text-brand">{column}</th>)}</tr></thead>
      <tbody>{relation.rows.map((row, index) => <tr key={index} class="group even:bg-canvas/60 hover:bg-accent/70">{relation.cols.map(column => <td key={column} class={`border-b border-line/70 px-4 py-3 ${typeof row[column] === 'number' ? 'tabular-nums' : ''}`}>{row[column]}</td>)}</tr>)}</tbody>
    </table>
    {!relation.rows.length && <div class="flex min-h-36 flex-col items-center justify-center gap-2 p-6 text-muted"><span class="math text-4xl text-brand/60">∅</span><strong class="text-sm font-medium">Relación vacía</strong><p class="text-xs">Ninguna fila cumple esta operación.</p></div>}
  </div>;
}
