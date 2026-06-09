# API REST de Usuários e Comentários

![Node.js](https://img.shields.io/badge/Node.js-CommonJS-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

API REST desenvolvida em Node.js para cadastro de usuários, autenticação com JWT e gerenciamento de comentários.
O projeto usa Express, MongoDB com Mongoose, criptografia de senhas com Bcrypt e uma estrutura modular com rotas, controllers, models e middlewares.

## Stack Tecnológica

- **Node.js**: ambiente de execução JavaScript no backend.
- **Express.js**: framework para criação da API e gerenciamento das rotas.
- **MongoDB**: banco de dados NoSQL utilizado para armazenar usuários e comentários.
- **Mongoose**: ODM para modelagem, validação e interação com o MongoDB.
- **Bcrypt.js**: criptografia de senhas antes de salvar no banco.
- **JSON Web Token (JWT)**: autenticação por token nas rotas protegidas.
- **Dotenv**: carregamento de variáveis de ambiente.

## Funcionalidades

- Cadastro de usuários com validação de username, e-mail e senha.
- Login com geração de token JWT válido por 1 dia.
- Listagem pública de usuários cadastrados.
- Atualização de perfil do usuário autenticado.
- Troca de senha com validação da senha atual.
- Encerramento de conta com remoção em cascata dos comentários do usuário.
- Criação de comentários vinculados ao usuário autenticado.
- Listagem pública de comentários.
- Edição e remoção de comentários somente pelo próprio autor.
- Ocultação da senha nas consultas e respostas da API.

## Demonstração Visual

Esta API não possui interface gráfica própria. Para testar visualmente as requisições, use ferramentas como:

- Talend API Tester
- Insomnia
- Postman
- Thunder Client

Após iniciar o servidor, a API ficará disponível em:

```txt
http://localhost:3000
```

## Estrutura do Projeto

```txt
api-rest/
|-- app.js
|-- package.json
|-- README.md
`-- src/
    |-- controllers/
    |   |-- comentarioController.js
    |   `-- userControler.js
    |-- middlewares/
    |   `-- autenticacaoMiddleware.js
    |-- models/
    |   |-- comentarioModel.js
    |   `-- userModel.js
    `-- routes/
        |-- comentarioRoutes.js
        `-- userRoutes.js
```

## Pré-requisitos

Antes de executar o projeto, instale:

- Node.js em versão LTS
- npm
- Git
- MongoDB local ou uma conta no MongoDB Atlas
- MongoDB Compass, opcional, para visualizar os dados

## Como Rodar Localmente

Clone o repositório:

```bash
git clone https://github.com/RafisXs/api-rest.git
```

Acesse a pasta do projeto:

```bash
cd api-rest
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto:

```bash
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/api-rest
JWT_SECRET=sua_chave_secreta_aqui
```

Inicie o servidor:

```bash
node app.js
```

Se tudo estiver configurado corretamente, o terminal exibirá mensagens indicando que o servidor iniciou e que a conexão com o MongoDB foi realizada.

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `PORT` | Não | Porta em que a API será executada. Caso não seja informada, usa `3000`. |
| `MONGODB_URI` | Sim | String de conexão com o MongoDB local ou MongoDB Atlas. |
| `JWT_SECRET` | Sim | Chave secreta usada para assinar e validar os tokens JWT. |

> Nunca envie o arquivo `.env` para o GitHub. Use valores próprios no ambiente local e mantenha segredos fora do versionamento.

## Autenticação

As rotas protegidas exigem o envio do token JWT no header `Authorization`:

```txt
Authorization: Bearer SEU_TOKEN_AQUI
```

O token é retornado nas respostas das rotas de cadastro e login.

## Rotas da API

### Usuários

| Método | Rota | Protegida | Descrição |
| --- | --- | --- | --- |
| `POST` | `/api/users/cadastro` | Não | Cadastra um novo usuário. |
| `POST` | `/api/users/login` | Não | Autentica um usuário e retorna um token JWT. |
| `GET` | `/api/users/listar` | Não | Lista todos os usuários cadastrados. |
| `PATCH` | `/api/users/editar-perfil` | Sim | Atualiza username, e-mail e/ou bio do usuário autenticado. |
| `PATCH` | `/api/users/trocar-senha` | Sim | Troca a senha do usuário autenticado. |
| `DELETE` | `/api/users/encerrar-conta` | Sim | Remove a conta do usuário autenticado e seus comentários. |

### Comentários

| Método | Rota | Protegida | Descrição |
| --- | --- | --- | --- |
| `POST` | `/api/comentarios/novo` | Sim | Cria um novo comentário. |
| `GET` | `/api/comentarios/listar` | Não | Lista todos os comentários. |
| `PATCH` | `/api/comentarios/atualizar/:id` | Sim | Atualiza um comentário do próprio autor. |
| `DELETE` | `/api/comentarios/remover/:id` | Sim | Remove um comentário do próprio autor. |

## Exemplos de Requisição

### Cadastrar usuário

```http
POST /api/users/cadastro
Content-Type: application/json
```

```json
{
  "username": "rafael",
  "email": "rafael@email.com",
  "password": "senha123",
  "bio": "Desenvolvedor backend"
}
```

### Fazer login

```http
POST /api/users/login
Content-Type: application/json
```

```json
{
  "email": "rafael@email.com",
  "password": "senha123"
}
```

### Criar comentário

```http
POST /api/comentarios/novo
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```

```json
{
  "titulo": "Primeiro comentário",
  "conteudo": "Este é o conteúdo do comentário."
}
```

### Editar perfil

```http
PATCH /api/users/editar-perfil
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```

```json
{
  "username": "rafael.dev",
  "email": "rafael.dev@email.com",
  "bio": "Backend com Node.js e MongoDB"
}
```

### Trocar senha

```http
PATCH /api/users/trocar-senha
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```

```json
{
  "senhaAtual": "senha123",
  "novaSenha": "novaSenha123"
}
```

## Observações

- O campo `password` possui `select: false` no model de usuário, evitando exposição acidental da senha.
- A senha é criptografada automaticamente antes de ser salva.
- Ao encerrar uma conta, todos os comentários vinculados ao usuário também são removidos.
- Apenas o autor de um comentário pode editá-lo ou removê-lo.

## Autor

Projeto desenvolvido por [RafisXs](https://github.com/RafisXs).
