-- Rode uma vez no seu banco (phpMyAdmin da Hostinger)
CREATE TABLE IF NOT EXISTS usuario (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  nome    VARCHAR(100) NOT NULL,
  usuario VARCHAR(50)  NOT NULL UNIQUE,
  senha   VARCHAR(255) NOT NULL   -- guarda o HASH, nunca a senha pura
);

-- 1) Gere o hash da sua senha (no terminal, com PHP instalado):
--    php -r "echo password_hash('SUA_SENHA_AQUI', PASSWORD_DEFAULT);"
-- 2) Cole o hash abaixo e execute:
-- INSERT INTO usuario (nome, usuario, senha) VALUES ('Seu Nome', 'admin', 'COLE_O_HASH_AQUI');
