# ✨ Salao_de_Beleza
Projeto desenvolvido para a disciplina de processo de desenvolvimento de sistemas do curso de sistemas de informação, que tem por objetivo a criação de um sistema de agendamento e gerenciamento em um salão de beleza.

## 📁 Estrutura de Pastas

```
/Salao_de_Beleza/
|-- /backend/
|   |-- /node_modules/      (Gerado automaticamente ao instalar dependências)
|   |-- /src/
|   |   |-- /controllers/   (Lógica de negócio, como cadastrar cliente, listar funcionário)
|   |   |   |-- clienteController.js
|   |   |   |-- profissionalController.js
|   |   |-- /routes/        (Definição dos endpoints da API, ex: /clientes, /profissionais)
|   |   |   |-- routes.js
|   |   |-- /config/        (Configurações de banco de dados e ambiente)
|   |   |   |-- db.js       (Conexão com o MySQL)
|   |   |-- server.js       (Ponto de entrada do Backend)
|   |-- package.json        (Configurações e scripts do Backend)
|   |-- package-lock.json
|
|-- /frontend/
|   |-- /public/
|   |   |-- /css/
|   |   |   |-- style.css
|   |   |-- /js/
|   |   |   |-- cliente.js      (Scripts para interagir com a API de Clientes)
|   |   |   |-- profissional.js (Scripts para interagir com a API de Profissionais)
|   |   |   |-- funcionarios.js (Scripts para interagir com a API de Funcionários)
|   |   |-- index.html          (Página principal ou login)
|   |   |-- clientes.html       (Interface para o CRUD de Clientes)
|   |   |-- profissionais.html  (Interface para o CRUD de Profissionais)
|   |   |-- funcionarios.html  (Interface para o CRUD de Funcionários)
|
|-- /imagens/                  (Recursos estáticos, como logos e backgrounds)
|   |-- imagem-avatar.png
|   |-- imagem-fundo.png
|
|-- README.md               (Documentação do projeto)

```

# 🚀 Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando as seguintes tecnologias:

### Frontend
- **<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" alt="HTML5" width="20" height="20"/> HTML5:** Utilizado para a estruturação semântica do conteúdo.
- **<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" alt="CSS3" width="20" height="20"/> CSS3:** Responsável pela estilização e design responsivo da interface.
- **<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="JavaScript" width="20" height="20"/> JavaScript:** Implementação da lógica de interação e dinamismo no lado do cliente.

### Backend
- **<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="Node.js" width="20" height="20"/> Node.js:** Ambiente de execução JavaScript no lado do servidor, utilizado para construir a API/backend da aplicação.

### 📦 Dependências Necessárias

```
npm install express mysql2 cors
```

## 👥 Equipe

**Este projeto foi desenvolvido por:**

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/alanaagne">
        <img src="https://avatars.githubusercontent.com/u/141842450?v=4" width="100px;" alt="Alana Ágne Brandao Rocha"/>
        <br/>
        <sub><b></b>Alana Ágne Brandao Rocha</sub>
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
        <sub><b></b>Erica Meire Prates Ferreira</sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/ijoaom">
        <img src="https://avatars.githubusercontent.com/u/182035203?v=4" width="100px;" alt="João Manuel Oliveira"/>
        <br/>
        <sub><b>João Manuel Oliveira</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Flavia260">
        <img src="https://avatars.githubusercontent.com/u/169327902?v=4" width="100px;" alt="Flávia Alessandra"/>
        <br/>
        <sub><b>Flávia Alessandra</b></sub>
      </a>
    </td>
