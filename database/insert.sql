
-- Povoamento funcionário
INSERT INTO Profissional (cpf, nome, salario, endereco, telefone, especializacao, rg, cep, cidade, email, data_admissao, uf) VALUES
('11122233344', 'Maria da Silva', 2500.00, 'Rua das Flores, 100', '(77)99876-5432', 'Manicure e Pedicure', '1234567890', '45000-000', 'Vitória da Conquista', 'maria@salao.com.br', '2023-10-01', 'BA'),
('22233344455', 'Sara Santos', 3200.50, 'Av. Olívia Flores, 550', '(77)99123-4567', 'Cabeleireira', '0987654321', '45001-101', 'Vitória da Conquista', 'sara.santos@salao.com.br', '2022-05-15', 'BA'),
('33344455566', 'Carla Nunes', 2800.00, 'Rua do Recreio, 201', '(77)98888-1111', 'Esteticista Facial', '1122334455', '45020-000', 'Vitória da Conquista', 'carla.estetica@salao.com.br', '2023-01-20', 'BA'),
('44455566677', 'Cleide Alves', 3000.00, 'Rua Candeias, 45', '(77)99777-2222', 'Manicure', '9988776655', '45051-300', 'Vitória da Conquista', 'cleide@salao.com.br', '2024-03-01', 'BA'),
('55566677788', 'Ana Costa', 2600.00, 'Avenida Brasil, 800', '(77)99666-3333', 'Maquiagem Social e Noiva', '8877665544', '45000-050', 'Vitória da Conquista', 'ana.make@salao.com.br', '2021-11-10', 'BA'),
('66677788899', 'Estefani Ferreira', 1800.00, 'Rua Patagônia, 10', '(77)99555-4444', 'Auxiliar de Cabeleireiro', '7766554433', '45052-120', 'Vitória da Conquista', 'estefani@salao.com.br', '2024-08-01', 'BA'),
('77788899900', 'Sofia Lima', 2000.00, 'Praça Jurema, 5', '(77)99444-5555', 'Atendimento ao Cliente/Agenda', '6655443322', '45065-050', 'Vitória da Conquista', 'sofia.recep@salao.com.br', '2023-03-05', 'BA'),
('88899900011', 'Samanta Dias', 3500.00, 'Travessa Boa Vista, 33', '(77)99333-6666', 'Colorimetria Avançada', '5544332211', '45026-010', 'Vitória da Conquista', 'samanta.color@salao.com.br', '2021-09-01', 'BA'),
('99900011122', 'Rafaela Gomes', 2400.00, 'Rua Felícia, 77', '(77)99222-7777', 'Microblading e Design', '4433221100', '45023-080', 'Vitória da Conquista', 'rafaela.sobrancelha@salao.com.br', '2024-01-15', 'BA'),
('00011122233', 'Nadir Neves', 4000.00, 'Rua Miro Cairo, 1', '(77)99111-8888', 'Recepsionista', '3322110099', '45075-100', 'Vitória da Conquista', 'Nadir.gerente@salao.com.br', '2020-07-01', 'BA');

-- Povoamento Cliente
INSERT INTO Cliente (nome, cidade, telefone, cpf, cep, uf, bairro, logradouro, numero, dataNascimento) VALUES
('Ana Beatriz', 'Vitória da Conquista', '(77)99901-1001', '11122233301', '45000-100', 'BA', 'Centro', 'Rua Rui Barbosa', '120', '1995-05-15'),
('Beatriz Gama', 'Vitória da Conquista', '(77)99902-1002', '22233344402', '45020-050', 'BA', 'Recreio', 'Avenida Rio Bahia', '550', '1988-11-20'),
('Gabriela Martins', 'Vitória da Conquista', '(77)99903-1003', '33344455503', '45051-200', 'BA', 'Candeias', 'Rua dos Bandeirantes', '30', '2000-01-01'),
('Helena Oliveira', 'Vitória da Conquista', '(77)99904-1004', '44455566604', '45065-010', 'BA', 'Jurema', 'Praça Sá Barreto', '15', '1975-08-25'),
('Isabela Pereira', 'Vitória da Conquista', '(77)99905-1005', '55566677705', '45026-170', 'BA', 'Boa Vista', 'Travessa da Amizade', '88', '1992-03-10'),
('Joana Fernandes', 'Vitória da Conquista', '(77)99906-1006', '66677788806', '45053-150', 'BA', 'Patagônia', 'Rua Amazonas', '705', '1998-12-05'),
('Larissa Santos', 'Vitória da Conquista', '(77)99907-1007', '77788899907', '45075-020', 'BA', 'Vila Eliza', 'Estrada da Vereda', '12', '1985-06-30'),
('Márcia Silva', 'Vitória da Conquista', '(77)99908-1008', '88899900008', '45052-900', 'BA', 'Brasil', 'Rua Doutor João', '210', '2003-04-12'),
('Sofia Mendes', 'Vitória da Conquista', '(77)99909-1009', '99900011109', '45023-490', 'BA', 'Felícia', 'Rua das Acácias', '45', '1979-09-18'),
('Renata Alves', 'Vitória da Conquista', '(77)99910-1010', '00011122210', '45077-110', 'BA', 'Miro Cairo', 'Av. Central', '99', '1990-02-28');

-- Povoamento serviço
INSERT INTO Servico (idTipo, nomeTipo, custoServico, tempoDuracao, descricao) VALUES
(1, 'Progressiva', 50.00, '00:45:00', 'Corte e secagem simples.'),
(2, 'Manicure Completa', 30.00, '00:40:00', 'Cutilagem e esmaltação tradicional.'),
(3, 'Hidratação Capilar', 80.00, '01:00:00', 'Tratamento de hidratação profunda com máscara premium.'),
(4, 'Coloração Raiz', 120.00, '02:00:00', 'Aplicação de tintura na raiz do cabelo.'),
(5, 'Design de Sobrancelha', 45.00, '00:30:00', 'Design com pinça e cera.');

-- Povoamento produto
INSERT INTO Produto (nomeProduto, valorVenda, categoriaProduto, descricao, dataCadastro, status) VALUES
('Shampoo Profissional Nutri', 75.00, 'Cabelo', 'Shampoo nutritivo para uso diário.', CURDATE(), 'Disponível'),
('Esmalte Vermelho Ferrari', 12.50, 'Unhas', 'Esmalte de alta duração, cor vibrante.', CURDATE(), 'Disponível'),
('Máscara Reconstrutora', 45.90, 'Estética', 'Máscara para revitalização e brilho da pele.', CURDATE(), 'Disponível'),
('Cera Quente para Depilação', 60.00, 'Depilação', 'Cera de alta aderência para pelos grossos.', CURDATE(), 'Disponível'),
('Máscara Reconstrutora 500g', 98.50, 'Cabelo - Tratamento', 'Máscara para reconstrução da fibra capilar pós-química.', CURDATE(), 'Disponível');

-- Povoamento Agendamento

INSERT INTO Agendamento (codigo, status, dataHorarioInicial, dataHorarioFinal, dataSolicitacao, valor, cliente_id, cpf_profissional, servico_id) VALUES
(101, 'realizado', '2025-11-15 10:00:00', '2025-11-15 10:45:00', CURDATE(), 50.00, 1, '22233344455', 1),
(102, 'agendado', '2025-11-15 11:00:00', '2025-11-15 11:40:00', CURDATE(), 30.00, 2, '11122233344', 2),
(103, 'agendado', '2025-11-16 14:00:00', '2025-11-16 16:00:00', CURDATE(), 120.00, 3, '88899900011', 4),
(104, 'cancelado', '2025-11-16 09:30:00', '2025-11-16 10:30:00', CURDATE(), 80.00, 4, '33344455566', 3),
(105, 'agendado', '2025-11-17 16:00:00', '2025-11-17 16:45:00', CURDATE(), 50.00, 10, '44455566677', 1);
