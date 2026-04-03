# Gestión de Tareas - Frontend con DOM Manipulation

**Grupo #1**
Nombres: Michael Stiven Echeverry - Ximena Quintanilla Rodríguez - Edwar Mantilla

Bienvenido a este proyecto de frontend. El objetivo de esta aplicación es comprender la manipulación del DOM y el consumo de APIs utilizando JavaScript vanilla y ES Modules.

Este proyecto funciona como el cliente frontend que se comunica con una API REST de Node.js para la gestión de tareas y usuarios. Utiliza una arquitectura modular con separación de responsabilidades para mantener el código organizado y mantenible.

---

## 1. Instalación y Configuración Inicial

Para poner en marcha este proyecto, primero debemos inicializar nuestro entorno de Node e instalar las herramientas necesarias.

### Comandos de instalación

```bash
# 1. Inicializar el proyecto (crea el package.json)
npm init -y

# 2. Instalar el bundler de desarrollo
npm install -D vite

# 3. Instalar herramienta de despliegue (opcional)
npm install -D gh-pages
```

---

## 2. Estructura Jerárquica del Proyecto

La siguiente estructura organiza el código fuente separando la lógica de negocio, la manipulación del DOM y los servicios de API.

```
.
├── api/                             # Comunicación con el backend
│   ├── index.js                     # Configuración base de API
│   ├── tareas/                      # Endpoints de tareas
│   │   ├── createTarea.js           # Crear nueva tarea
│   │   ├── deleteTarea.js           # Eliminar tarea
│   │   ├── getTareasByUserId.js     # Obtener tareas por usuario
│   │   └── updateTarea.js           # Actualizar tarea existente
│   └── usuarios/
│       └── getUsuarioById.js        # Obtener información de usuario
├── css/                             # Estilos CSS organizados
├── services/                        # Lógica de negocio y estado
│   ├── index.js                     # Exportaciones principales
│   ├── filterService.js             # Servicios de filtrado y ordenamiento
│   ├── tareaService.js              # Lógica de gestión de tareas
│   └── usuarioService.js            # Lógica de gestión de usuarios
├── src/                             # Código fuente principal
├── ui/                              # Componentes de interfaz
├── utils/                           # Utilidades generales
├── .gitignore                       # Archivos excluidos de Git
├── index.html                       # Página principal de la aplicación
├── main.js                          # Punto de entrada y control principal
├── package.json                     # Dependencias y scripts del proyecto
├── README.md                        # Documentación técnica
├── styles.css                       # Estilos principales
└── vite.config.js                   # Configuración del servidor de desarrollo
```

---

## 3. Guía de Componentes y Arquitectura

Para que nuestro código sea ordenado y profesional, dividimos las tareas en diferentes capas. Así es como funciona cada una:

### Raíz (`/`): Punto de Entrada

- **index.html** — La estructura base de nuestra aplicación web. Define el esqueleto HTML y los contenedores principales donde se inyectará el contenido dinámico.
- **main.js** — El cerebro de la aplicación. Controla toda la lógica, maneja eventos del usuario y coordina la comunicación entre los servicios y la interfaz.

### Carpeta `api/`: Comunicación con el Backend

Es el "embajador" de nuestra aplicación. Su trabajo es comunicarse con el servidor backend a través de peticiones HTTP. Cada archivo se especializa en un tipo de operación:

- **Tareas** — Crear, leer, actualizar y eliminar tareas (CRUD)
- **Usuarios** — Obtener información y datos de usuarios

### Carpeta `services/`: Lógica de Negocio

Es el "cerebro procesador" de nuestra aplicación. Aquí vive toda la lógica que no está directamente relacionada con el DOM:

- **filterService.js** — Maneja el filtrado, ordenamiento y búsqueda de tareas
- **tareaService.js** — Gestiona el estado y operaciones de las tareas
- **usuarioService.js** — Maneja la lógica relacionada con usuarios

### Carpeta `ui/`: Componentes de Interfaz

Es el "artista visual" que se encarga de crear y manipular elementos del DOM. Transforma los datos en HTML dinámico que el usuario puede ver e interactuar.

### Carpeta `utils/`: Herramientas Auxiliares

Contiene funciones pequeñas y reutilizables que ayudan a diferentes partes de la aplicación.

---

## 4. Flujo de Trabajo de la Aplicación

1. **Usuario interactúa** con la interfaz (formularios, botones, etc.)
2. **main.js** captura el evento y determina qué acción realizar
3. **services/** procesa la lógica de negocio (validaciones, cálculos, etc.)
4. **api/** realiza la petición HTTP al backend si es necesario
5. **ui/** actualiza la interfaz con los nuevos datos
6. **Usuario ve** el resultado de su acción

---

## 5. Tecnologías Utilizadas

| Tecnología | Descripción |
|------------|-------------|
| **JavaScript ES6+** | Lenguaje principal con módulos, arrow functions, etc. |
| **Vite** | Servidor de desarrollo y bundler moderno |
| **CSS3** | Estilos con diseño responsive y moderno |
| **DOM API** | Manipulación directa del Document Object Model |
| **Fetch API** | Comunicación HTTP con el backend |
| **Git** | Control de versiones |

---

## 6. Scripts Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Construye versión optimizada para producción
npm run preview  # Previsualiza la versión de producción
npm run deploy   # Despliega a GitHub Pages
```

---

## 7. Características Principales

- ✅ **Arquitectura Modular** — Código organizado en módulos reutilizables
- ✅ **Separación de Responsabilidades** — Cada capa tiene una función específica
- ✅ **Manejo de Estado** — Gestión centralizada del estado de la aplicación
- ✅ **Filtrado y Ordenamiento** — Sistema avanzado de filtros y ordenación
- ✅ **Comunicación API** — Integración completa con backend REST
- ✅ **Interfaz Responsiva** — Diseño adaptable a diferentes dispositivos
- ✅ **Manejo de Errores** — Sistema robusto de gestión de errores
- ✅ **Experiencia de Usuario** — Interfaz intuitiva y retroalimentación visual
