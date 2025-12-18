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

    // Preparar dados para o Brevo
    const brevoData = {
        email: data.email,
        attributes: {
    NOME: data.nome,
    SOBRENOME: '', // Deixar vazio por enquanto
    TELEFONE: data.telefone,
    EMPRESA: data.empresa,
    CARGO: data.cargo,
    SEGMENTO: data.segmento,
    TAMANHO: data.tamanho,
    ORCAMENTO: data.orcamento,
    URGENCIA: data.urgencia,
    DESAFIO: data.desafio,
    MELHOR_CONTATO: data.melhor_contato,
    EXPERIENCIA_BRANDING: data.experiencia_branding,
    JOB_TITLE: data.cargo, // Duplicar cargo para JOB_TITLE também
    LANDLINE_NUMBER: data.telefone, // Duplicar telefone
    SMS: data.telefone // Duplicar telefone para SMS também
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