# panel_led_v1
# LED Matrix Display Web Panel 💡

Este proyecto implementa un **panel LED RGB scrollable** 100% en HTML, CSS y JavaScript. Está optimizado para funcionar directamente en el navegador y puede alojarse fácilmente usando [GitHub Pages](https://pages.github.com/).

---

## 🚀 Demo en vivo

Accede al proyecto en:  
👉 https://gustavosinbandera.github.io/panel_led_v1

---

## 🧠 Características

- ✅ Matriz de LED de 64x8 (configurable)
- ✅ Mensaje animado tipo marquesina
- ✅ Control de color RGB en tiempo real vía sliders
- ✅ Atenuación progresiva (dimerizado)
- ✅ Soporte para caracteres ASCII y símbolos especiales
- ✅ Arquitectura modular con `font-completo.js`, `main.js`, `config.json`
- ✅ Listo para usar en microcontroladores como ESP32 con WebSocket

---

## 📂 Estructura del proyecto

```
📁 panel_led_v1/
├── index.html            # Página principal del visor
├── style.css             # Estilos CSS del panel y sliders
├── main.js               # Lógica del renderizador LED y scroll
├── font-completo.js      # Diccionario de caracteres LED (ASCII 8x8)
├── config.json           # Configuración dinámica del panel (mensaje, color, tamaño)
└── README.md             # Este archivo
```

---

## 🧪 Pruebas locales (modo desarrollo)

Como el navegador bloquea por seguridad la carga de archivos locales (`config.json`, `font-completo.js`), necesitas correr un servidor local para probarlo correctamente.

### 🔧 Comando rápido con Python

Si tienes Python 3 instalado:

```bash
cd panel_led_v1
python3 -m http.server 8000
```

Luego abre tu navegador y visita:

```
http://localhost:8000
```

---

## 🛠 Requisitos

- Navegador moderno (Chrome, Firefox, Edge)
- Python 3 (opcional pero recomendado para pruebas locales)

---

## 🎯 Próximamente

- ✅ Entrada dinámica de mensajes desde teclado
- ✅ Modo espejo (letras reflejadas)
- ✅ WebSocket desde ESP32
- ✅ `LedPanel.js` como clase JS exportable
- ✅ Soporte para textos multilínea

---

## ✍️ Autor

Gustavo A. Grisales Montoya + ChatGPT  
💡 2025