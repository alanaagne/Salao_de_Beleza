-- Geração de Modelo Físico SQL 

DROP DATABASE IF EXISTS ExpressoDaBeleza;
CREATE DATABASE ExpressoDaBeleza;
USE ExpressoDaBeleza;


-- 1. TABELA PROFISSIONAL

CREATE TABLE Profissional (
    cpf CHAR(11) PRIMARY KEY,
    nome VARCHAR(255),
    salario DECIMAL(10,2) UNSIGNED,
    endereco VARCHAR(255),
    telefone VARCHAR(15),
    especializacao VARCHAR(100),
    rg VARCHAR(15),
    cep VARCHAR(10),
    cidade VARCHAR(100),
    email VARCHAR(100),
    data_admissao DATE,
    uf VARCHAR(20),
    status ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo'
);


-- 2. TABELA CLIENTE

CREATE TABLE cliente (
    ID INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    cidade VARCHAR(60),
    telefone VARCHAR(15),
    cpf CHAR(11) NOT NULL UNIQUE, 
    cep VARCHAR(10),
    uf VARCHAR(20),
    bairro VARCHAR(100),
    logradouro VARCHAR(100),
    numero VARCHAR(10),
    dataNascimento DATE,
    PRIMARY KEY (ID)
);


-- 3. TABELA SERVICO

CREATE TABLE Servico (
    idTipo MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nomeTipo VARCHAR(255),
    custoServico DECIMAL(6,2) UNSIGNED,
    tempoDuracao TIME,
    descricao VARCHAR(255) 
);


-- 4. TABELA AGENDAMENTO

CREATE TABLE Agendamento (
    codigo MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    status ENUM('cancelado', 'realizado', 'agendado', 'em andamento'),
    dataHorarioInicial DATETIME,
    dataHorarioFinal DATETIME,
    dataSolicitacao DATE,
    valor DECIMAL(6,2) UNSIGNED,
    
    cliente_id INT NOT NULL,
    cpf_profissional CHAR(11) NOT NULL,
    servico_id MEDIUMINT UNSIGNED NOT NULL,
    
    FOREIGN KEY(cliente_id) REFERENCES Cliente (ID),
    FOREIGN KEY(cpf_profissional) REFERENCES Profissional (cpf),
    FOREIGN KEY(servico_id) REFERENCES Servico (idTipo)
);


-- 5. NOVA TABELA: PRODUTO (CRUD SIMPLES)

CREATE TABLE Produto (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nomeProduto VARCHAR(255) NOT NULL,
    valorVenda DECIMAL(10,2) UNSIGNED NOT NULL,
    categoriaProduto VARCHAR(100),
    descricao VARCHAR(255),
    -- Nota: 'Estoque' e 'Fornecedor' serão adicionados em semestre futuro
    -- Nenhum FK para estas tabelas.
    
    -- Campos básicos de CRUD:
    dataCadastro DATE NOT NULL,
    status ENUM('Disponível', 'Descontinuado') NOT NULL DEFAULT 'Disponível'
);