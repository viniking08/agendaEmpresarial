# Agenda Empresarial API

API REST para gerenciamento de Administradores, Funcionários e Agendamentos, desenvolvida com Node.js.

## Sobre o Projeto

A Agenda Empresarial API permite o controle de:

- Administradores
- Funcionários
- Agendamentos

    **Recomendado utilizar o POSTMAN ou aplicação similar**

O projeto foi estruturado com separação de responsabilidades em rotas, configuração de banco de dados e inicialização do servidor.
Lembrando que a ideia do projeto é uma relação SOMENTE entre membros da empresa, a ideia NÃO é ter usuários fora do ambiente empresarial.

## Tecnologias Utilizadas

- Node.js
- Express
- Dotenv
- Banco de Dados (configurado em src/config/db.js)

## Configuração do Projeto

### 1. Clone o repositório

git clone > https://github.com/viniking08/agendaEmpresarial.git

cd AGENDAEMPRESA

### 2. Configure as variáveis de ambiente

#### Crie o arquivo .env:

Crie um arquivo e nomeie como ".env".

#### Depois configure conforme o seu banco de dados e seguindo o formato do .envexemple:

```bash
PORT= *port*
DB_HOST= localhost
DB_USER= usuario
DB_PASSWORD= senha
DB_NAME= nome
```

### 3. Instale as dependências (no terminal)

npm install

## Executando o Projeto

### Iniciar o servidor

npm start

O servidor iniciará em:

http://localhost:3000

## Rotas da API

### Como utilizar as rotas:

Utilizando POSTMAN, nas rotas de POST e PUT é necessário ir na aba "body" e depois "raw" para postar/atualizar as informações seguindo o seguinte formato em JSON (exemplo para postar a rota agendamento por):

Observação: os CPFs devem ser válidos devido à validação.

```json
{
"titulo": "Alinhamento de Equipe",
"data": "2026-03-14 11:00:00",
"id_funcionario": 5,
"id_administrador": 5
}
```

### Administradores
Arquivo: ´src/routes/administrador.js´

- Criar administrador  
  Método: POST  
  Rota: /administrador  
  Exemplo de JSON:
  ```json
  {
    "nome": "João Silva",
    "email": "joao@email.com",
    "cpf": "12345678900",
    "status": "ativo"
  }

- Listar administradores  
  Método: GET  
  Rota: /administrador  

- Atualizar administrador  
  Método: PUT  
  Rota: /administrador/:id  
  Exemplo de JSON:
  ```json
  {
    "nome": "João Atualizado",
    "email": "joaoatualizado@email.com",
    "cpf": "12345678900",
    "status": "inativo"
  }
  ```

- Deletar administrador  
  Método: DELETE  
  Rota: /administrador/:id  


### Funcionários
Arquivo: src/routes/funcionario.js

- Criar funcionário  
  Método: POST  
  Rota: /funcionario  
  Exemplo de JSON:
  ```json
  {
    "nome": "Maria Souza",
    "email": "maria@email.com",
    "cpf": "98765432100",
    "status": "ativo"
  }
  ```

- Listar funcionários  
  Método: GET  
  Rota: /funcionario  

- Atualizar funcionário  
  Método: PUT  
  Rota: /funcionario/:id  
  Exemplo de JSON:
  ```json
  {
    "nome": "Maria Atualizada",
    "email": "mariaatualizada@email.com",
    "cpf": "98765432100",
    "status": "inativo"
  }
  ```

- Deletar funcionário  
  Método: DELETE  
  Rota: /funcionario/:id 


### Agendamentos
Arquivo: src/routes/agendamento.js

- Criar agendamento  
  Método: POST  
  Rota: /agendamento  
  Exemplo de JSON:
  ```json
  {
    "titulo": "Reunião de Planejamento",
    "data": "2026-03-14 11:00:00",
    "id_funcionario": 5,
    "id_administrador": 5
  }
  ```

- Listar agendamentos  
  Método: GET  
  Rota: /agendamento  

- Atualizar agendamento  
  Método: PUT  
  Rota: /agendamento/:id  
  Exemplo de JSON:
  ```json
  {
    "titulo": "Reunião Atualizada",
    "data": "2026-03-15 15:00:00",
    "id_funcionario": 3,
    "id_administrador": 2
  }
  ```

- Cancelar agendamento  
  Método: DELETE  
  Rota: /agendamento/:id


## Banco de Dados

A configuração da conexão com o banco está localizada em:

src/config/db.js

Certifique-se de que o banco de dados esteja ativo antes de iniciar a aplicação.

## Scripts Disponíveis

- npm start — Inicia o servidor quando usado.
