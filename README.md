# ✨ Salao_de_Beleza: Sistema de Agendamento e Gerenciamento

Projeto desenvolvido para a disciplina de Processo de Desenvolvimento de Software (PDS) do curso de Sistemas de Informação, que tem por objetivo a criação de um sistema de agendamento e gerenciamento completo para um salão de beleza.

## 📌 Funcionalidades Principais (Módulos MVP)

O Mínimo Produto Viável (MVP) do sistema cobre as seguintes áreas, fundamentais para a operação diária do salão:

* **Clientes:** Cadastro (CRUD) e gerenciamento de informações dos clientes.
* **Profissionais/Funcionários:** Cadastro (CRUD) e gerenciamento dos dados dos colaboradores.
* **Serviços:** Definição (CRUD) de tipos de serviços, custos e tempo de duração.
* **Produtos:** Definição (CRUD) de produtos.
* **Agendamento:** Módulo central que relaciona Cliente, Profissional e Serviço.


## 📁 Estrutura de Pastas

A aplicação é dividida em Frontend (interface do usuário) e Backend (API Node.js/MySQL).

```
/Salao_de_Beleza/
|-- /backend/
|   |-- /node_modules/
|   |-- /src/
|   |   |-- /config/                   (Configuração de Banco de Dados)
|   |   |   |-- db.js
|   |   |-- /controllers/             (Lógica de Negócio / CRUD)
|   |   |   |-- agendamentoController.js
|   |   |   |-- authController.js
|   |   |   |-- clienteController.js
|   |   |   |-- funcionarioController.js
|   |   |   |-- loginController.js         
|   |   |   |-- produtoController.js
|   |   |   |-- servicoController.js
|   |   |-- /middleware/              (Autenticação e Helpers)
|   |   |   |-- auth.js
|   |   |-- /routes/                  (Definição dos Endpoints da API)
|   |   |   |-- authRoutes.js
|   |   |   |-- routes.js
|   |   |-- .env                      (Variáveis de Ambiente)
|   |   |-- server.js                 (Ponto de Entrada do Servidor)
|   |   |-- test-db-connection.js
|   |-- /database/                    (Scripts MySQL)
|   |   |-- create.sql                (Criação de Tabelas)
|   |   |-- insert.sql                (Povoamento Inicial)
|   |   |-- user.sql                  (Criação de Usuário)
|   |-- package.json
|   |-- package-lock.json
|
|-- /frontend/
|   |-- /public/
|   |   |-- /css/                     (Estilização da Aplicação)
|   |   |   |-- agendamento.css
|   |   |   |-- clientes.css
|   |   |   |-- funcionarios.css
|   |   |   |-- home.css
|   |   |   |-- login.css
|   |   |   |-- produtos.css
|   |   |   |-- servicos.css
|   |   |   |-- style.css
|   |   |-- /js/                      (Lógica Cliente-Side / Consumo da API)
|   |   |   |-- agendamento.js
|   |   |   |-- clientes.js
|   |   |   |-- funcionarios.js
|   |   |   |-- home.js
|   |   |   |-- login.js
|   |   |   |-- main.js
|   |   |   |-- produtos.js
|   |   |   |-- servicos.js
|   |   |-- agendamento.html          (Módulo Agendamento)
|   |   |-- clientes.html             (Módulo Clientes)
|   |   |-- funcionarios.html         (Módulo Funcionários)
|   |   |-- home.html                 (Dashboard ou Menu Principal)
|   |   |-- index.html                (Geralmente Login/Página Inicial)
|   |   |-- produtos.html             (Módulo Produtos)
|   |   |-- servicos.html             (Módulo Serviços)
|   |   |-- /imagens/                 (Recursos Estáticos)
|-- README.md
```

## ⚙️ Configuração e Instalação

Siga os passos abaixo para configurar e rodar o projeto localmente.

### 1. Pré-requisitos

* **Node.js e npm:** Necessários para rodar o backend.
* **MySQL:** Servidor de banco de dados instalado e rodando.

### 2. Configuração do Banco de Dados

O projeto utiliza um banco de dados MySQL chamado **`ExpressoDaBeleza`**.

1.  **Acesse o MySQL:** Utilize um cliente de sua preferência (Workbench, DBeaver, terminal, etc.).
2.  **Crie e Povoar o BD:** Execute os scripts localizados na pasta `/backend/database/` na seguinte ordem:
    * **`create.sql`**: Contém o script `CREATE DATABASE` e `CREATE TABLE` para todas as cinco tabelas principais (`Cliente`, `Profissional`, `Servico`, `Produto`, `Agendamento`).
    * **`insert.sql`**: Contém comandos `INSERT` para popular as tabelas iniciais.
3.  **Configurações de Conexão:** Verifique e atualize o arquivo **`db.js`** na pasta `/config` do `/backend` com as suas credenciais do MySQL (host, user, password, database).

### 3. Instalação de Dependências (Backend)

Navegue até a pasta `/backend` no terminal e execute:

```bash
npm install 
```
### 4. Conteúdo do Arquivo .env
Crie o arquivo .env na raiz da sua pasta /backend (ao lado de server.js) com o seguinte conteúdo:
```
# Chave secreta usada para assinar e verificar os JSON Web Tokens (JWT)
# Mantenha esta chave longa, complexa e secreta em ambiente de produção.
JWT_SECRET="sua_chave_secreta_super_complexa_aqui_1234567890"
```

### 5. Execução da Aplicação
```
# Na pasta /backend
node server.js
```

## 🚀 Tecnologias Utilizadas
### Frontend
- HTML5: Utilizado para a estruturação semântica do conteúdo.

- CSS3: Responsável pela estilização e design responsivo da interface.

- JavaScript: Implementação da lógica de interação e consumo da API no lado do cliente.

### Backend
- Node.js: Ambiente de execução JavaScript no lado do servidor.

- Express: Framework web para Node.js, utilizado para construir a API RESTful.

### Banco de Dados
- MySQL: Sistema Gerenciador de Banco de Dados Relacional.

## 👥 Equipe

**Este projeto foi desenvolvido por:**

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/alanaagne">
        <img src="https://avatars.githubusercontent.com/u/141842450?v=4" width="100px;" alt="Alana Ágne Brandao Rocha"/>
        <br/>
        <sub><b></b>Alana Ágne</sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/BrunaInCodes">
        <img src="https://avatars.githubusercontent.com/u/181774023?v=4" width="100px;" alt="Bruna Graciele"/>
        <br/>
        <sub><b></b>Bruna Graciele</sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Erica1110">
        <img src="https://avatars.githubusercontent.com/u/89529255?v=4" width="100px;" alt="Erica Meire Prates Ferreira"/>
        <br/>
        <sub><b></b>Erica Meire</sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Flavia260">
        <img src="https://avatars.githubusercontent.com/u/169327902?v=4" width="100px;" alt="Flávia Alessandra"/>
        <br/>
        <sub><b>Flávia Alessandra</b></sub>
      </a>
    </td>
      <td align="center">
      <a href="https://github.com/ijoaom">
        <img src="https://avatars.githubusercontent.com/u/182035203?v=4" width="100px;" alt="João Manuel Oliveira"/>
        <br/>
        <sub><b>João Manuel</b></sub>
      </a>
    </td>
    
