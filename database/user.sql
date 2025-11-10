CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL, 
    role VARCHAR(50) DEFAULT 'user'
);

-- Opcional: Insere o usuário administrador padrão para testes
INSERT INTO Usuario (nome, email, senha, role)
VALUES ('Admin', 'admin@salao.com', '123456', 'admin');