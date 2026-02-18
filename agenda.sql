CREATE DATABASE agendaEmpresarial;
USE agendaEmpresarial;

CREATE TABLE funcionario (
id_funcionario int auto_increment primary key,
nome varchar(60) NOT NULL,
email varchar(80) NOT NULL,
cpf varchar (14) UNIQUE,
status varchar(20)
);

CREATE TABLE administrador (
id_administrador int auto_increment primary key,
nome varchar(60) NOT NULL,
email varchar(80) NOT NULL,
cpf varchar (14) UNIQUE,
status varchar(20)
);

CREATE TABLE agendamento (
id_agendamento int auto_increment primary key,
titulo varchar(30) NOT NULL,
data DATETIME NOT NULL,
id_funcionario int NOT NULL UNIQUE,
id_administrador int NOT NULL UNIQUE,
FOREIGN KEY (id_funcionario) references funcionario(id_funcionario),
FOREIGN KEY (id_administrador) references administrador(id_administrador)
);

INSERT INTO funcionario (nome, email, cpf, status) VALUES
('Carlos', 'carlosgb@gmail.com', '123.456.789.08', 'ativo');

INSERT INTO administrador (nome, email, cpf, status) VALUES
('Clóvis', 'clovisdomal@hotmail.com', '321.456.789.08', 'ativo');

INSERT INTO agendamento (titulo, data, id_funcionario, id_administrador) VALUES
('Limpeza de Carro', '2027-03-29 15:30:00', '1', '1');