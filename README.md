# Docker Server Dashboard & Task Tracker 🐳🚀

Este proyecto es una aplicación web moderna y elegante diseñada para monitorizar el estado de un servidor (sistema operativo, uso de memoria, tiempo de actividad) y administrar una lista de tareas interactivas. Todo el sistema está completamente contenedorizado utilizando **Docker** y **Docker Compose**, lo que permite levantarlo en cualquier entorno con un solo comando.

La interfaz de usuario implementa técnicas avanzadas de diseño web moderno, incluyendo **Glassmorphism** (paneles translúcidos con desenfoque de fondo), un esquema de colores HSL oscuro con acentos vibrantes, fuentes de alta calidad (Outfit e Inter) y micro-animaciones fluidas.

---

## 🛠️ ¿Cómo Funciona la Aplicación?

La aplicación se compone de dos capas principales:
1. **Backend (Node.js & Express)**: Un servidor web ligero que expone endpoints REST (`/api/system-info` y `/api/tasks`) para consultar estadísticas del sistema y procesar operaciones de tareas (crear, completar, borrar) en memoria.
2. **Frontend (HTML5, CSS3, Vanilla JS)**: Una interfaz responsiva que consume la API del servidor en tiempo real. Utiliza SVG dinámicos para pintar un indicador circular del uso de memoria y actualiza de forma automática el tiempo de actividad del servidor (uptime).

---

## 📂 Descripción Archivo por Archivo

A continuación se detalla el propósito y funcionamiento de cada uno de los archivos del proyecto:

### 1. Backend y Configuración
*   **[`package.json`](./package.json)**: Define los metadatos del proyecto y especifica a **Express** como única dependencia en producción. También establece el comando `npm start` para iniciar el servidor ejecutando `node server.js`.
*   **[`server.js`](./server.js)**: Es el núcleo del servidor.
    *   Sirve de forma estática la carpeta `public` (frontend).
    *   Usa el módulo nativo de Node.js `os` para extraer información del sistema anfitrión (plataforma, arquitectura, memoria y uptime).
    *   Maneja las rutas de la API:
        *   `GET /api/system-info`: Retorna las métricas del sistema. Si detecta la variable de entorno `DOCKERIZED=true`, indicará que se ejecuta en Docker.
        *   `GET /api/tasks`: Retorna la lista de tareas en memoria.
        *   `POST /api/tasks`: Registra una nueva tarea.
        *   `PATCH /api/tasks/:id`: Actualiza el estado (completado/pendiente) de una tarea.
        *   `DELETE /api/tasks/:id`: Elimina una tarea por su ID.

### 2. Frontend Premium (Carpeta `/public`)
*   **[`public/index.html`](./public/index.html)**: Estructura la aplicación en secciones semánticas (Header, Main Dashboard, Footer). Carga los iconos vectoriales de FontAwesome y los orbes decorativos de fondo que dan el efecto de iluminación.
*   **[`public/style.css`](./public/style.css)**: Implementa el sistema visual premium.
    *   **Glow Orbs**: Dos círculos flotantes de color cian y morado con alta difuminación (`filter: blur(120px)`) para un look inmersivo.
    *   **Glassmorphism**: Aplica `backdrop-filter: blur(16px)` y bordes sutiles transparentes (`rgba(255,255,255,0.08)`) para dar sensación de cristal templado.
    *   **Métricas Circulares**: Controla el diseño del indicador circular SVG.
    *   **Micro-animaciones**: Transiciones en los botones al hacer hover y efectos de desplazamiento (`slideIn`) al añadir tareas.
*   **[`public/app.js`](./public/app.js)**: Gestiona la interactividad sin recargar la página.
    *   Crea un temporizador local para actualizar el tiempo de actividad (uptime) segundo a segundo.
    *   Hace llamadas `fetch()` periódicas cada 10 segundos al endpoint de estado del servidor para refrescar la memoria y el badge de Docker.
    *   Calcula el desfase de la línea del círculo SVG (`strokeDashoffset`) para reflejar visualmente el porcentaje exacto de memoria consumida.
    *   Maneja los eventos de envío de formulario, marcado de casillas y eliminación de tareas enviando peticiones HTTP al servidor.

### 3. Dockerización y Despliegue
*   **[`Dockerfile`](./Dockerfile)**: El script de construcción de la imagen de Docker.
    *   Parte de la imagen oficial ligera `node:20-alpine` para minimizar el tamaño final.
    *   Copia únicamente `package.json` primero y corre `npm install --omit=dev` para aprovechar la caché de capas de Docker (si no hay cambios en dependencias, no se reinstalan).
    *   Copia el resto del código y define la variable de entorno `DOCKERIZED=true`.
    *   Expone el puerto 3000 de forma interna.
    *   Establece `npm start` como el comando de inicio por defecto.
*   **[`.dockerignore`](./.dockerignore)**: Evita que carpetas pesadas de desarrollo local (como `node_modules`) o archivos de Git se copien al contexto de compilación de Docker, acelerando el proceso de build.
*   **[`docker-compose.yml`](./docker-compose.yml)**: Automatiza la orquestación.
    *   Define el servicio `web` basándose en el Dockerfile local.
    *   Asigna el nombre del contenedor `antigravity-docker-dashboard`.
    *   Mapea el puerto `3000:3000` permitiendo acceder al contenedor desde el navegador de la máquina host.
    *   Establece la política `restart: unless-stopped` para que el servidor web se levante automáticamente si se cae o si se reinicia Docker.

---

## ⚙️ ¿Cómo Funciona Docker Aquí?

Docker envuelve la aplicación en un contenedor aislado. Esto soluciona el problema de *"en mi máquina funciona"* porque:
1.  **Aislamiento**: El servidor Node.js corre dentro de una mini-máquina Linux (Alpine) aislada del sistema operativo principal de tu computadora.
2.  **Mapeo de Puertos**: El puerto `3000` de esa máquina Linux virtualizada se mapea al puerto `3000` de tu localhost.
3.  **Detección de Docker**: La variable de entorno `DOCKERIZED=true` declarada en el `docker-compose.yml` es leída por la API en `server.js` (`process.env.DOCKERIZED`), permitiendo que el Frontend muestre orgullosamente el badge iluminado de **DOCKER CONTAINER**.

---

## 🚀 Guía de Uso Rápido

### Requisitos Previos
*   Tener instalado **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** en tu máquina (Windows, Mac o Linux).

### Despliegue
1.  Abre una terminal en la carpeta raíz del proyecto.
2.  Ejecuta el siguiente comando para compilar e iniciar la aplicación en segundo plano:
    ```bash
    docker compose up --build -d
    ```
3.  Abre tu navegador web y entra a:
    ```text
    http://localhost:3000
    ```
4.  Para detener el contenedor en cualquier momento, ejecuta:
    ```bash
    docker compose down
    ```
