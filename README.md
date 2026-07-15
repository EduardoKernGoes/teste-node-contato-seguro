# Teste Técnico Contato Seguro - Triagem de Atendimentos

Esta é uma API RESTful desenvolvida como parte do Desafio Técnico para a vaga de Desenvolvedor Back-end Júnior na Contato Seguro. O objetivo principal do sistema é realizar o cadastro de usuários e gerenciar a criação e triagem automatizada de tickets de atendimento.

## Tecnologias Utilizadas

Este projeto atende e excede a stack obrigatória solicitada:
*   **Node.js** com **TypeScript** (Tipagem estática para maior confiabilidade)
*   **Express.js** (Roteamento e middlewares)
*   **Prisma** (Modelagem de dados e abstração do banco)
*   **PostgreSQL** (Banco de dados relacional)
*   **Jest** (Testes unitários e de integração automatizados)

## Diferenciais Implementados

*   **Arquitetura em Camadas:** O projeto segue uma clara divisão de responsabilidades (`Routes` -> `Controllers` -> `Services`), mantendo o código limpo, testável e manutenível.
*   **Tratamento de Erros:** Validações de nulidade, tipagem e prevenção de vazamento de dados sensíveis (ex: omissão de senhas no retorno das rotas GET).
*   **Arquivo de Requisições:** Inclusão do arquivo `api.http` na raiz do projeto para testes fáceis e diretos via VSCode (REST Client) ou importação no Postman.
*   **Docker e Docker Compose:** Ambiente de banco de dados conteinerizado, garantindo que o projeto rode facilmente em qualquer máquina sem necessidade de instalar o PostgreSQL manualmente.

---

## Regras de Negócio de Triagem

O sistema possui uma inteligência de classificação automática na criação de tickets baseada em palavras-chave na descrição:
*   **Ouvidoria (HIGH):** Denúncia, assédio, fraude, corrupção.
*   **SAC (MEDIUM):** Entrega, assinatura, atendimento, cancelamento.
*   **Suporte Técnico (MEDIUM):** Erro, bug, sistema, instabilidade.
*   **Financeiro (MEDIUM):** Cobrança, pagamento, reembolso.
*   **Fora do Escopo (LOW):** Mensagens que não se encaixam nos critérios acima.

---

## Como rodar o projeto localmente

### Pré-requisitos
*   [Node.js](https://nodejs.org/en/) (v18+ recomendado)
*   [Docker](https://www.docker.com/) e Docker Compose instalados na máquina.

### Instalação e Configuração

1. Clone este repositório:
   ```bash
   git clone https://github.com/EduardoKernGoes/teste-node-contato-seguro.git
   cd teste-node-contato-seguro
   ```

2. Instale as dependências do projeto:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo '.env' na raiz do projeto e copie as informações do arquivo '.env.example', alterando as informações de usuário e banco.

4. Suba o banco de dados utilizando o Docker:
   ```bash
   docker-compose up -d
   ```

5. Execute as migrations do Prisma para criar as tabelas no banco de dados:
   ```bash
   npx prisma migrate dev --name init
   ```

6. Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

## Como rodar os testes automatizados

O projeto conta com uma suíte robusta de testes utilizando Jest. Os testes cobrem unitariamente a regra de classificação de tickets (Canais e Saúde) e testes de integração com o Banco de Dados (CRUD de usuários e chamados).

*   Para executar os testes, utilize o comando:
   ```bash
   npm run test
   ```

**Aviso:** Certifique-se de que a API (npm run dev) esteja rodando, para que os testes funcionem perfeitamente.

## Exemplos de Requisição:

**Criação de Usuário**
*   POST -> /users
   ```json
   {
    "user": "Maria Silva",
    "email": "maria@contatoseguro.com",
    "password": "senhaSegura123",
    "repeat_password": "senhaSegura123",
    "role": "CLIENT"
   }
   ```

**Criação de Ticket**
*   POST -> /tickets
   ```json
   {
    "userID": 1,
    "title": "Erro no sistema de ponto",
    "description": "O sistema está apresentando erro e instabilidade ao tentar acessar."
   }
   ```

**Verificar Saúde do Ticket**
*   GET -> /health?id=<número do ticket>
