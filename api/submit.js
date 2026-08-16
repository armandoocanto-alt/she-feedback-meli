module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const d = req.body;
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

  console.log('TOKEN presente:', !!AIRTABLE_TOKEN, '| BASE_ID presente:', !!AIRTABLE_BASE_ID);
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: 'Airtable no configurado' });
  }
    return res.status(500).json({ error: 'Airtable no configurado' });
  }

  const fields = {
    'Registro': d.registro || '',
    'Nombre': d.nombre || '',
    'RUT': d.rut || '',
    'Cargo': d.cargo || '',
    'Empresa': d.empresa || '',
    'Areas': d.areas || '',
    'Tipo': d.tipo || '',
    'Motivo': d.motivo ? `${d.motivo}${d.especificacion ? ' — ' + d.especificacion : ''}` : '',
    'Detalle': d.detalle || '',
    'Manager': d.manager || '',
    'Fecha': d.fecha ? d.fecha.slice(0, 16).replace('T', ' ') : '',
    'Registrado Por': d.registradoPor || '',
  };

  try {
    const atRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Registros`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    const result = await atRes.json();

    if (result.id) {
      return res.status(200).json({ success: true, registro: d.registro, id: result.id });
    } else {
      console.error('Airtable error:', JSON.stringify(result));
      return res.status(500).json({ error: 'Error en Airtable', detail: result });
    }
  } catch (err) {
    console.error('fetch error:', err);
    return res.status(500).json({ error: err.message });
  }
};

