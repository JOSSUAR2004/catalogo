import os
import json
import re
from datetime import datetime

# ==========================================
# CONFIGURACIÓN DE RUTAS
# ==========================================
DIRECTORIO_BASE = os.getcwd()
DIRECTORIO_PUBLIC = os.path.join(DIRECTORIO_BASE, 'public')
DIRECTORIO_CAMISETAS = os.path.join(DIRECTORIO_PUBLIC, 'images', 'camisetas')
ARCHIVO_SALIDA = os.path.join(DIRECTORIO_BASE, 'src', 'catalogo.json')

EXTENSIONES = ('.jpg', '.jpeg', '.png', '.webp')
ANIO_ACTUAL = datetime.now().year

def limpiar_nombre(texto):
    """Limpia guiones, barras bajas y remueve palabras clave del título"""
    texto_limpio = texto.replace('_', ' ').replace('-', ' ')
    patron_remover = r'\b(player|version|jugador|authentic|fanatico|fan|replica|aaa)\b'
    texto_limpio = re.sub(patron_remover, '', texto_limpio, flags=re.IGNORECASE)
    texto_limpio = ' '.join(texto_limpio.split())
    return texto_limpio.title()

def generar_slug(texto):
    texto = texto.lower()
    return re.sub(r'[^a-z0-9]+', '-', texto).strip('-')

def procesar_ruta(ruta_objetivo, catalogo_actual=None):
    catalogo = catalogo_actual if catalogo_actual is not None else []
    ids_existentes = {p['id'] for p in catalogo}
    nuevos = 0
    
    for raiz, _, archivos in os.walk(ruta_objetivo):
        imagenes = [img for img in archivos if img.lower().endswith(EXTENSIONES)]
        
        if imagenes:
            imagenes.sort()
            nombre_carpeta = os.path.basename(raiz)
            nombre_padre = os.path.basename(os.path.dirname(raiz))
            path_analisis = f"{nombre_padre} {nombre_carpeta}".lower()
            
            # --- DETECCIÓN DE VERSIÓN ---
            if any(palabra in path_analisis for palabra in ["player", "jugador", "authentic", "adizero"]):
                version_final = "Jugador"
            else:
                version_final = "Fanático"

            # --- DETECCIÓN DE AÑO Y TEMPORADA ---
            linea_final = "Actual"
            anios_4d = re.findall(r'\b(19\d{2}|20\d{2})\b', path_analisis)
            if anios_4d and any(int(anio) < ANIO_ACTUAL for anio in anios_4d):
                linea_final = "Retro"
                
            temporadas_2d = re.findall(r'\b(\d{2})[\s\-/_]+(\d{2})\b', path_analisis)
            for inicio, fin in temporadas_2d:
                anio_fin = int(fin)
                anio_completo = 2000 + anio_fin if anio_fin <= 50 else 1900 + anio_fin
                if anio_completo < ANIO_ACTUAL:
                    linea_final = "Retro"
                    break

            if any(palabra in path_analisis for palabra in ["retro", "classic", "vintage", "antigua"]):
                linea_final = "Retro"

            # --- CONSTRUCCIÓN DE NOMBRE ---
            if nombre_padre.lower() != 'camisetas':
                nombre_visible = f"{limpiar_nombre(nombre_padre)} - {limpiar_nombre(nombre_carpeta)}"
                id_producto = generar_slug(f"{nombre_padre}-{nombre_carpeta}")
            else:
                nombre_visible = limpiar_nombre(nombre_carpeta)
                id_producto = generar_slug(nombre_carpeta)

            # --- REEMPLAZO SI EXISTE ---
            if id_producto in ids_existentes:
                catalogo = [p for p in catalogo if p['id'] != id_producto]

            # --- RUTAS DE IMÁGENES ---
            rutas_imagenes = []
            for img in imagenes:
                ruta_completa = os.path.join(raiz, img)
                ruta_web = ruta_completa.replace(DIRECTORIO_PUBLIC, '').replace('\\', '/')
                rutas_imagenes.append(ruta_web)

            catalogo.append({
                "id": id_producto,
                "nombre": nombre_visible,
                "version": version_final,
                "categoria": linea_final,
                "imagenes": rutas_imagenes
            })
            nuevos += 1
            print(f"✅ [{linea_final.upper()}][{version_final.upper()}] -> {nombre_visible}")

    return catalogo, nuevos

def main():
    print("==================================================")
    print("🚀 PANEL DE CONTROL DE CATÁLOGO // DIRECT SOURCE")
    print("==================================================")
    print("1. 🔄 SOBRESCRIBIR TODO (Escanea todas las carpetas desde cero)")
    print("2. ➕ ACTUALIZAR/AÑADIR (Solo escanea una carpeta específica)")
    
    opcion = input("\n👉 Elige una opción (1 o 2): ").strip()

    if opcion == '1':
        print("\n⚠️ ADVERTENCIA: Se borrará el JSON actual y se recreará leyendo toda la carpeta 'camisetas'.")
        confirmacion = input("¿Estás seguro? (s/n): ").strip().lower()
        if confirmacion != 's':
            print("Operación cancelada.")
            return
        
        print("\n🔍 Escaneando TODO el inventario...\n")
        catalogo_final, procesados = procesar_ruta(DIRECTORIO_CAMISETAS, [])
        
    elif opcion == '2':
        carpeta = input("\n👉 Ingresa el nombre exacto de la carpeta a indexar: ").strip()
        ruta = os.path.join(DIRECTORIO_CAMISETAS, carpeta)
        
        if not os.path.exists(ruta):
            print(f"\n❌ Error: No se encontró la carpeta '{carpeta}'")
            return
            
        print(f"\n🔍 Escaneando únicamente: {carpeta}...\n")
        
        catalogo_actual = []
        if os.path.exists(ARCHIVO_SALIDA):
            with open(ARCHIVO_SALIDA, 'r', encoding='utf-8') as f:
                catalogo_actual = json.load(f)
                
        catalogo_final, procesados = procesar_ruta(ruta, catalogo_actual)
        
    else:
        print("\n❌ Opción no válida.")
        return

    # Guardar archivo final
    with open(ARCHIVO_SALIDA, 'w', encoding='utf-8') as f:
        json.dump(catalogo_final, f, ensure_ascii=False, indent=2)

    print("\n========================================")
    print("🚀 ¡CATÁLOGO ACTUALIZADO CON ÉXITO!")
    print(f"📦 Carpetas/Referencias leídas ahora: {procesados}")
    print(f"📁 Total de artículos en el JSON final: {len(catalogo_final)}")
    print("========================================")

if __name__ == '__main__':
    main()