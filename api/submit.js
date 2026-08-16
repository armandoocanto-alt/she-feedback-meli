module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const d = req.body || {};
    const TOKEN = process.env.AIRTABLE_TOKEN;
    const BASE = process.env.AIRTABLE_BASE_ID;

    console.log('vars:', !!TOKEN, !!BASE, 'body keys:', Object.keys(d));

    if (!TOKEN || !BASE) {
      return res.status(500).json({ error: 'Airtable no configurado', TOKEN: !!TOKEN, BASE: !!BASE });
    }

    const fields = {
      'Registro': String(d.registro || ''),
      'Nombre': String(d.nombre || ''),
      'RUT': String(d.rut || ''),
      'Cargo': String(d.cargo || ''),
      'Empresa': String(d.empresa || ''),
      'Areas': String(d.areas || ''),
      'Tipo': String(d.tipo || ''),
      'Motivo': String(d.motivo || ''),
      'Detalle': String(d.detalle || ''),
      'Manager': String(d.manager || ''),
      'Fecha': String(d.fecha || ''),
      'Registrado Por': String(d.registradoPor || ''),
    };

    console.log('Enviando a Airtable:', JSON.stringify(fields));

    const atRes = await fetch('https://api.airtable.com/v0/' + BASE + '/Registros', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: fields }),
    });

    const result = await atRes.json();
    console.log('Respuesta Airtable:', JSON.stringify(result));

    if (result.id) {
      return res.status(200).json({ success: true, id: result.id });
    } else {
      return res.status(500).json({ error: 'Error Airtable', detail: result });
    }
  } catch (err) {
    console.error('CRASH:', err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
};
