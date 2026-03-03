CREATE DATABASE tienda_comunitaria;
USE tienda_comunitaria;

-- Usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  contraseña VARCHAR(255) NOT NULL, -- cifrada
  rol ENUM('ADMIN','CAJERO') NOT NULL,
  estado BOOLEAN DEFAULT TRUE
);

-- Productos
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  cantidad INT NOT NULL,
  categoria VARCHAR(50)
);

-- Ventas
CREATE TABLE ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  id_cajero INT,
  FOREIGN KEY (id_cajero) REFERENCES usuarios(id)
);

-- Detalle de Ventas
CREATE TABLE detalle_ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT,
  id_producto INT,
  cantidad INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_venta) REFERENCES ventas(id),
  FOREIGN KEY (id_producto) REFERENCES productos(id)
);

-- Proveedores
CREATE TABLE proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  contacto VARCHAR(100),
  direccion VARCHAR(150)
);

-- Compras
CREATE TABLE compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  id_proveedor INT,
  FOREIGN KEY (id_proveedor) REFERENCES proveedores(id)
);

-- Detalle de Compras
CREATE TABLE detalle_compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_compra INT,
  id_producto INT,
  cantidad INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_compra) REFERENCES compras(id),
  FOREIGN KEY (id_producto) REFERENCES productos(id)
);