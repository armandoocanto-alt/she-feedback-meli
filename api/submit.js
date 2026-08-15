module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const d = req.body;
  const GRID_TOKEN = process.env.GRID_API_TOKEN;
  if (!GRID_TOKEN) return res.status(500).json({ error: 'Token GRID no configurado' });
 
  const html = buildHTML(d);
  const title = `${d.registro} — ${d.nombre || 'Sin nombre'} — ${d.fecha ? d.fecha.slice(0,10) : ''}`;
 
  const formData = new FormData();
  formData.append('config', JSON.stringify({ skill_version: '3.6.6', title }));
  formData.append('file', new Blob([html], { type: 'text/html' }), `${d.registro}.html`);
 
  try {
    const gridRes = await fetch('https://grid.melioffice.com/api/v1/engine/run', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GRID_TOKEN}` },
      body: formData,
    });
    const result = await gridRes.json();
    if (result.ok) {
      return res.status(200).json({ success: true, registro: d.registro, url: result.view_url });
    } else {
      console.error('GRID error:', JSON.stringify(result));
      return res.status(500).json({ error: 'Error en GRID', detail: result });
    }
  } catch (err) {
    console.error('fetch error:', err);
    return res.status(500).json({ error: err.message });
  }
};
 
function buildHTML(d) {
  const row = (label, val) => val ? `<div class="row"><span class="lbl">${label}</span><span class="val">${val}</span></div>` : '';
  const tipoClass = d.tipo === 'Reconocimiento' ? 'verde' : 'naranja';
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${d.registro} — SHE Feedback</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:720px;margin:2rem auto;padding:1rem 1.5rem;background:#f5f5f5;color:#1C1C1C}
  h1{margin-bottom:.25rem}
  .badge{display:inline-block;background:#FFE600;color:#1C1C1C;font-weight:700;padding:.3rem .9rem;border-radius:20px;font-size:.9rem;vertical-align:middle}
  .meta{color:#888;font-size:.85rem;margin-bottom:1.5rem}
  .card{background:#fff;border-radius:10px;padding:1.5rem;margin-bottom:1rem;box-shadow:0 1px 4px rgba(0,0,0,.08)}
  .card h2{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:#999;margin:0 0 1rem}
  .row{display:flex;gap:1rem;margin-bottom:.6rem;font-size:.92rem}
  .lbl{color:#666;min-width:150px;flex-shrink:0}
  .val{font-weight:500}
  .verde{color:#27AE60;font-weight:700}
  .naranja{color:#E67E22;font-weight:700}
  .detalle-box{background:#f9f9f9;border-radius:6px;padding:1rem;font-size:.92rem;line-height:1.6;white-space:pre-wrap}
</style>
</head>
<body>
<h1>SHE Feedback &nbsp;<span class="badge">${d.registro}</span></h1>
<div class="meta">Registrado por ${d.registradoPor || '—'} · ${d.timestamp ? new Date(d.timestamp).toLocaleString('es-CL') : ''}</div>
 
<div class="card">
  <h2>📋 Registro</h2>
  ${row('Fecha / Hora', d.fecha)}
  ${row('Manager / TL', d.manager)}
</div>
 
<div class="card">
  <h2>👷 Colaborador</h2>
  ${row('Nombre', d.nombre)}
  ${row('RUT', d.rut)}
  ${row('LDAP', d.ldap)}
  ${row('Cargo', d.cargo)}
  ${row('Empresa', d.empresa)}
  ${row('KRAKEN ID', d.kraken)}
</div>
 
<div class="card">
  <h2>📍 Área(s)</h2>
  <div class="row"><span class="val">${d.areas || '—'}</span></div>
</div>
 
<div class="card">
  <h2>🎯 Feedback</h2>
  ${row('Tipo', `<span class="${tipoClass}">${d.tipo}</span>`)}
  ${d.motivo ? row('Motivo', d.motivo) : ''}
  ${d.especificacion ? row('Especificación', d.especificacion) : ''}
</div>
 
<div class="card">
  <h2>📝 Detalle</h2>
  <div class="detalle-box">${d.detalle || '—'}</div>
</div>
</body>
</html>`;
}
 
