CREATE DATABASE tienda_comunitaria;
USE tienda_comunitaria;

-- =========================
-- TABLAS AUXILIARES
-- =========================

-- Roles
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL
);

INSERT INTO roles (nombre) VALUES
('ADMIN'),
('CAJERO');

-- Estados de usuario
CREATE TABLE estados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL
);

INSERT INTO estados (nombre) VALUES
('ACTIVO'),
('INACTIVO');

-- Categorías de productos
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL
);

INSERT INTO categorias (nombre) VALUES
('Granos'),
('Pasta'),
('Salsas');

-- =========================
-- USUARIOS
-- =========================

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  id_rol INT,
  id_estado INT,

  FOREIGN KEY (id_rol) REFERENCES roles(id),
  FOREIGN KEY (id_estado) REFERENCES estados(id)
);

-- =========================
-- PRODUCTOS
-- =========================

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  cantidad INT NOT NULL,
  id_categoria INT,

  FOREIGN KEY (id_categoria) REFERENCES categorias(id)
);

-- =========================
-- PROVEEDORES
-- =========================

CREATE TABLE proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  contacto VARCHAR(100),
  direccion VARCHAR(150)
);

-- =========================
-- VENTAS
-- =========================

CREATE TABLE ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  id_cajero INT,

  FOREIGN KEY (id_cajero) REFERENCES usuarios(id)
);

-- =========================
-- DETALLE VENTAS
-- =========================

CREATE TABLE detalle_ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT,
  id_producto INT,
  cantidad INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,

  FOREIGN KEY (id_venta) REFERENCES ventas(id),
  FOREIGN KEY (id_producto) REFERENCES productos(id)
);

-- =========================
-- COMPRAS
-- =========================

CREATE TABLE compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  id_proveedor INT,

  FOREIGN KEY (id_proveedor) REFERENCES proveedores(id)
);

-- =========================
-- DETALLE COMPRAS
-- =========================

CREATE TABLE detalle_compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_compra INT,
  id_producto INT,
  cantidad INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,

  FOREIGN KEY (id_compra) REFERENCES compras(id),
  FOREIGN KEY (id_producto) REFERENCES productos(id)
);