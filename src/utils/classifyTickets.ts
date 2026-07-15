interface triageRole {
   channel: string;
   priority: string;
   keywords: string[];
}

const triage_roles: triageRole[] = [
   {
      channel: 'ouvidoria',
      priority: 'HIGH',
      keywords: ['denuncia', 'denúncia', 'assedio', 'assédio', 'fraude', 'corrupcao', 'corrupção']
   },
   {
      channel: 'sac',
      priority: 'MEDIUM',
      keywords: ['entrega', 'assinatura', 'atendimento', 'cancelamento']
   },
   {
      channel: 'suporte_tecnico',
      priority: 'MEDIUM',
      keywords: ['erro', 'bug', 'sistema', 'instabilidade']
   },
   {
      channel: 'financeiro',
      priority: 'MEDIUM',
      keywords: ['cobranca', 'cobrança', 'pagamento', 'reembolso']
   }
]



export function classifyPriorityChannel(description: string): { channel: string; priority: string}{
   let desc = description.toLowerCase()

   // Classificação simples através de paalvras chaves dentro da descrição do chamado, utilizei as palavras chave passadas no teste mas poderiam ser utilizadas outras palavras.
   for (let role of triage_roles) {
      const hasWord = role.keywords.some(word => desc.includes(word));

      if (hasWord) {
         return { channel: role.channel, priority: role.priority };
      }
   }

   return { channel: 'fora_do_escopo', priority: 'LOW' }

   // Exemplo de promp para futura integração com IA:

   // "Você é um assistente especialista em triagem de atendimento ao cliente. Sua única tarefa é ler a descrição do problema relatado pelo cliente e classificá-lo em 
   // EXATAMENTE UM dos 5 canais disponíveis, retornando APENAS o nome do canal em minúsculo e seu nível de prioridade, sem pontuação ou explicações adicionais.

   // Regras de Classificação:
   // ouvidoria -> Se tratar de denúncias, assédio, fraude, corrupção ou temas de conduta ética.
   // sac -> Se tratar de problemas com assinatura, cancelamento, entrega ou atendimento geral.
   // suporte_tecnico -> Se tratar de erros de acesso, bugs, falhas de sistema ou instabilidade.
   // financeiro -> Se tratar de cobrança, pagamento ou reembolso.
   // fora_do_escopo -> Se a mensagem for vaga, sem contexto suficiente ou fora dos cenários acima.

   // Rergas de prioridade:
   // HIGH -> em casos de denúncias, assédio, fraude e situações sensiveis
   // MEDIUM -> em casos de impactos no uso do serviço, acesso ou cobrança
   // LOW -> em casos genéricos ou sem urgência evidente

   // Exemplo de entrada: 'Meu app está fechando sozinho quando tento logar.'
   // Sua saída: {channel: 'suporte_tecnico', priority: 'MEDIUM'}"
}