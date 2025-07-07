# Chatbot PDF Reader

Este proyecto te permite hacer preguntas a un chatbot inteligente acerca del contenido de cualquier archivo PDF. Es una solución fullstack que utiliza **React** (frontend) y **FastAPI** (backend), junto con la API de OpenAI (GPT-4).

---

## 🚀 Tecnologías principales

- **Frontend:** React
- **Backend:** FastAPI (Python)
- **IA:** OpenAI GPT-4
- **Parser PDF:** PyPDF2

---

## 📦 Estructura del proyecto

```
chatbot-pdf-reader/
├── backend/
│   ├── main.py
│   ├── pdf_loader.py
│   ├── requirements.txt
│   ├── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── ChatBubble.jsx
│   │   ├── ChatBubble.css
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   ├── .env.example
└── README.md
```

---

## ⚙️ Configuración e instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Fabrizzio0799/ChatBot.git
cd ChatBot
```

---

### 2. Configurar el backend

#### 2.1. Variables de entorno

- Ve a la carpeta `backend/`.
- Crea tu archivo `.env` a partir de `.env.example`.

**Ejemplo de `.env`:**
```
OPENAI_API_KEY=sk-<tu-key>
PDF_PATH=Accessible_Travel_Guide_Partial.pdf
```
- Coloca tu PDF en la ruta indicada.

#### 2.2. Instalar dependencias

```bash
pip install -r requirements.txt
```

#### 2.3. Ejecutar el servidor backend

```bash
uvicorn main:app --reload
```

El backend corre por defecto en `http://localhost:8000`.

---

### 3. Configurar el frontend

#### 3.1. Variables de entorno

- Ve a la carpeta `frontend/`.
- Crea tu archivo `.env` a partir de `.env.example`.

**Ejemplo de `.env`:**
```
REACT_APP_API_URL=http://localhost:8000
```

#### 3.2. Instalar dependencias

```bash
npm install
```

#### 3.3. Ejecutar el frontend

```bash
npm start
```

Por defecto, el frontend abre en `http://localhost:3000`.

---

## ✅ Características principales

- Interfaz de chat amigable y responsiva
- Soporte multi-chat (varias sesiones)
- Nombre editable de cada conversación
- Mensajes en tiempo real y streaming de respuesta del bot
- Indicador de “el bot está escribiendo…”
- Visualización de tokens y costo estimado por conversación
- Exportación del chat a archivo Markdown
- Lógica de rate limiting en backend para evitar spam
- Renderizado de respuestas con Markdown
- Errores y estados de carga gestionados de forma clara

---

## 🛠️ Salud del servidor

Puedes probar el backend con:

```bash
curl http://localhost:8000/health
```

Deberías ver:

```json
{ "status": "ok" }
```

---

## 📝 Notas y recomendaciones

- Asegúrate de **no subir tu archivo `.env` real** a ningún repositorio público.
- Puedes cambiar el PDF cargado cambiando la variable `PDF_PATH` y reiniciando el backend.
- Si tu cuenta OpenAI tiene límites, revisa consumo y precios aquí: https://platform.openai.com/account/usage

---

## 🙋 Sobre este proyecto

Desarrollado por Fabrizio Badilla y colaboradores para uso educativo y profesional.  
¡Se aceptan sugerencias y mejoras!

---

¿Listo para usarlo? Solo sigue los pasos, agrega tu PDF y tu API Key de OpenAI… ¡y comienza a conversar con tus documentos!
