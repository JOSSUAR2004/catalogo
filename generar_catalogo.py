import os
import json
import re

# ==========================================
# CONFIGURACIÓN DE RUTAS
# ==========================================
DIRECTORIO_BASE = os.getcwd()
DIRECTORIO_PUBLIC = os.path.join(DIRECTORIO_BASE, 'public')
DIRECTORIO_CAMISETAS = os.path.join(DIRECTORIO_PUBLIC, 'images', 'camisetas')
ARCHIVO_SALIDA = os.path.join(DIRECTORIO_BASE, 'src', 'catalogo.json')

EXTENSIONES = ('.jpg', '.jpeg', '.png', '.webp')

def limpiar_nombre(texto):
    """Limpia guiones, barras bajas y remueve palabras clave del título"""
    texto_limpio = texto.replace('_', ' ').replace('-', ' ')
    
    # Expresión regular para quitar términos de versión del título visible
    patron_remover = r'\b(player|version|jugador|authentic|fanatico|fan|replica|aaa)\b'
    texto_limpio = re.sub(patron_remover, '', texto_limpio, flags=re.IGNORECASE)
    
    # Limpiar espacios dobles que queden tras la remoción
    texto_limpio = ' '.join(texto_limpio.split())
    return texto_limpio.title()

def generar_slug(texto):
    texto = texto.lower()
    return re.sub(r'[^a-z0-9]+', '-', texto).strip('-')

def escanear_catalogo():
    if not os.path.exists(DIRECTORIO_CAMISETAS):
        print(f"❌ Error: No se encontró la ruta {DIRECTORIO_CAMISETAS}")
        return

    catalogo = []
    print("🔍 Escaneando directorios con detección de versión inteligente...\n")

    for raiz, directorios, archivos in os.walk(DIRECTORIO_CAMISETAS):
        imagenes = [img for img in archivos if img.lower().endswith(EXTENSIONES)]
        
        if imagenes:
            imagenes.sort()
            
            nombre_carpeta = os.path.basename(raiz)
            nombre_padre = os.path.basename(os.path.dirname(raiz))
            
            # Texto completo de la ruta de la carpeta para analizar la versión
            path_analisis = f"{nombre_padre} {nombre_carpeta}".lower()
            
            # DETECCIÓN DE VERSIÓN MULTILINGÜE (Player vs Fanático)
            if any(palabra in path_analisis for palabra in ["player", "jugador", "authentic", "adizero"]):
                version_final = "Jugador"
            else:
                version_final = "Fanático"

            # DETECCIÓN DE LÍNEA (Actual vs Retro)
            if any(palabra in path_analisis for palabra in ["retro", "classic", "vintage", "antigua"]):
                linea_final = "Retro"
            else:
                linea_final = "Actual"

            # Construir nombre comercial limpio
            if nombre_padre.lower() != 'camisetas':
                nombre_visible = f"{limpiar_nombre(nombre_padre)} - {limpiar_nombre(nombre_carpeta)}"
                id_producto = generar_slug(f"{nombre_padre}-{nombre_carpeta}")
            else:
                nombre_visible = limpiar_nombre(nombre_carpeta)
                id_producto = generar_slug(nombre_carpeta)

            # Construir rutas web para React
            rutas_imagenes = []
            for img in imagenes:
                ruta_completa = os.path.join(raiz, img)
                ruta_web = ruta_completa.replace(DIRECTORIO_PUBLIC, '').replace('\\', '/')
                rutas_imagenes.append(ruta_web)

            producto = {
                "id": id_producto,
                "nombre": nombre_visible,
                "version": version_final,
                "categoria": linea_final,
                "imagenes": rutas_imagenes
            }
            
            catalogo.append(producto)
            print(f"✅ [{version_final.upper()}] -> {nombre_visible} ({len(imagenes)} fotos)")

    # Guardar en src/catalogo.json
    with open(ARCHIVO_SALIDA, 'w', encoding='utf-8') as archivo_json:
        json.dump(catalogo, archivo_json, ensure_ascii=False, indent=2)

    print("\n========================================")
    print(f"🚀 ¡CATÁLOGO EN VIVO ACTUALIZADO!")
    print(f"📁 Total referencias: {len(catalogo)}")
    print("========================================")

if __name__ == "__main__":
    escanear_catalogo()