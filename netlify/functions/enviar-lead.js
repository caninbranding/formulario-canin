exports.handler = async (event) => {
  // Aceita apenas POST, mas nunca bloqueia o lead
  if (event.httpMethod !== 'POST') {
    return { statusCode: 200, body: 'OK' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 200, body: 'OK' };
  }

  // Validação mínima (sem quebrar envio)
  if (!data.email || !data.nome) {
    return { statusCode: 200, body: 'OK' };
  }

  // Sanitização
  const telefone = String(data.telefone || '').replace(/\D/g, '');

  const dataHora = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Fortaleza'
  });

  // Texto completo do lead (100% dos campos)
  const leadInfo = `
══════════════════════════════
LEAD – DIAGNÓSTICO CANIN
══════════════════════════════
Data/Hora: ${dataHora}

DADOS DE CONTATO
Nome: ${data.nome}
Email: ${data.email}
Telefone: ${telefone || '-'}

EMPRESA
Empresa: ${data.empresa || '-'}
Cargo: ${data.cargo || '-'}
Segmento: ${data.segmento || '-'}
Tamanho: ${data.tamanho || '-'}

PROJETO
Orçamento: ${data.orcamento || '-'}
Urgência: ${data.urgencia || '-'}

DESAFIO PRINCIPAL
${data.desafio || '-'}

COMUNICAÇÃO
Preferência de contato: ${data.melhor_contato || '-'}
Experiência com branding: ${data.experiencia_branding || '-'}

Origem: Landing Page Diagnóstico CANIN
══════════════════════════════
`.trim();

  // Payload final para o Brevo
  const brevoData = {
    email: data.email,
    updateEnabled: true,
    listIds: [3],
    attributes: {
  NOME: String(data.nome || ''),
  SOBRENOME: String(data.sobrenome || ''),
  EMAIL: String(data.email || ''),

  TELEFONE: telefone,
  SMS: telefone,
  LANDLINE_NUMBER: telefone,

  CARGO: String(data.cargo || ''),
  EMPRESA: String(data.empresa || ''),
  SEGMENTO: String(data.segmento || ''),
  TAMANHO: String(data.tamanho || ''),

  ORCAMENTO: String(data.orcamento || ''),
  URGENCIA: String(data.urgencia || ''),
  MELHOR_CONTATO: String(data.melhor_contato || ''),
  EXPERIENCIA_BRANDING: String(data.experiencia_branding || ''),

  DESAFIO: String(data.desafio || ''),
  DESCRICAO_LEAD: leadInfo
}

  };

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(brevoData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo respondeu com erro:', errorText);
    }

  } catch (error) {
    console.error('Falha ao comunicar com o Brevo:', error);
  }

  // SEMPRE retorna sucesso para o formulário
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ success: true })
  };
};
