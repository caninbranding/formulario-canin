exports.handler = async (event, context) => {
    // Permitir apenas POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // Parse dos dados recebidos
    let data;
    try {
        data = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON' })
        };
    }

    // Validação básica
    if (!data.email || !data.nome) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Email e nome são obrigatórios' })
        };
    }

    // Criar informações formatadas do lead
    const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' });
    
    const leadInfo = [
        '═══════════════════════════════════════',
        'LEAD CAPTURADO - ' + dataHora,
        '═══════════════════════════════════════',
        '',
        'DADOS DE CONTATO',
        'Nome: ' + (data.nome || '-'),
        'Email: ' + (data.email || '-'),
        'Telefone/WhatsApp: ' + (data.telefone || '-'),
        '',
        'INFORMACOES DA EMPRESA',
        'Empresa: ' + (data.empresa || '-'),
        'Cargo do contato: ' + (data.cargo || '-'),
        'Segmento de atuacao: ' + (data.segmento || '-'),
        'Tamanho da empresa: ' + (data.tamanho || '-'),
        '',
        'DETALHES DO PROJETO',
        'Orcamento estimado: ' + (data.orcamento || '-'),
        'Nivel de urgencia: ' + (data.urgencia || '-'),
        '',
        'PRINCIPAL DESAFIO DA MARCA',
        (data.desafio || '-'),
        '',
        'PREFERENCIAS DE COMUNICACAO',
        'Melhor forma de contato: ' + (data.melhor_contato || '-'),
        'Experiencia anterior com branding: ' + (data.experiencia_branding || '-'),
        '',
        '═══════════════════════════════════════',
        'Origem: Landing Page Diagnostico CANIN',
        'Data/Hora: ' + dataHora,
        '═══════════════════════════════════════'
    ].join('\n');

    // Preparar dados para o Brevo
    const brevoData = {
        email: data.email,
        attributes: {
            FIRSTNAME: data.nome || '',
            SMS: data.telefone || '',
            LANDLINE_NUMBER: data.telefone || '',
            JOB_TITLE: data.cargo || '',
            LINKEDIN: leadInfo
        },
        listIds: [3],
        updateEnabled: true
    };

    try {
        // Fazer requisição ao Brevo
        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(brevoData)
        });

        const responseData = await response.text();
        
        // Sucesso (201 = criado, 204 = atualizado)
        if (response.status === 201 || response.status === 204) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    success: true,
                    message: 'Lead enviado com sucesso ao Brevo'
                })
            };
        }

        // Erro
        return {
            statusCode: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                success: false,
                error: responseData,
                status: response.status
            })
        };

    } catch (error) {
        console.error('Erro ao enviar para Brevo:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                success: false,
                error: error.message
            })
        };
    }
};