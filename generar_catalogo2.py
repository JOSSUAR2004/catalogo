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

def extraer_anio_o_temporada(path_texto):
    """Detecta si hay un año o temporada en el texto y devuelve una cadena estandarizada"""
    # 1. Buscar años de 4 dígitos
    anios_4d = re.findall(r'\b(19\d{2}|20\d{2})\b', path_texto)
    if anios_4d:
        return anios_4d[0] # Retorna el primer año de 4 dígitos encontrado
        
    # 2. Buscar temporadas de 2 dígitos (ej: 21 22, 21-22)
    temporadas_2d = re.findall(r'\b(\d{2})[\s\-/_]+(\d{2})\b', path_texto)
    if temporadas_2d:
        inicio, fin = temporadas_2d[0]
        return f"{inicio}-{fin}" # Retorna el formato estandarizado '21-22'
        
    return "actual" # Si no hay año, asumimos que es de la temporada actual

def procesar_ruta(ruta_objetivo, catalogo_actual=None):
    catalogo = catalogo_actual if catalogo_actual is not None else []
    
    # Set para controlar duplicados combinando (Nombre_Club + Año/Temporada)
    # Si ya venían cosas en el catálogo actual, las pre-cargamos para protegerlas
    combinaciones_existentes = set()
    for p in catalogo:
        anio_ref = extraer_anio_o_temporada(p['nombre'].lower())
        club_ref = p['nombre'].lower().split('-')[0].strip() # Extrae el club base
        combinaciones_existentes.add((club_ref, anio_ref))

    nuevos = 0
    ignorados = 0
    
    for raiz, _, archivos in os.walk(ruta_objetivo):
        imagenes = [img for img in archivos if img.lower().endswith(EXTENSIONES)]
        
        if imagenes:
            imagenes.sort()
            nombre_carpeta = os.path.basename(raiz)
            nombre_padre = os.path.basename(os.path.dirname(raiz))
            path_analisis = f"{nombre_padre} {nombre_carpeta}".lower()
            
            # --- DETECCIÓN DE ANIO / TEMPORADA ---
            identificador_tiempo = extraer_anio_o_temporada(path_analisis)
            
            # --- CONSTRUCCIÓN DE NOMBRE VISIBLE ---
            if nombre_padre.lower() != 'camisetas':
                club_limpio = limpiar_nombre(nombre_padre)
                nombre_visible = f"{club_limpio} - {limpiar_nombre(nombre_carpeta)}"
            else:
                club_limpio = limpiar_nombre(nombre_carpeta)
                nombre_visible = club_limpio

            # --- CONTROL DE DUPLICADOS CRÍTICO (MISMO CLUB Y MISMO AÑO) ---
            club_key = club_limpio.lower().strip()
            llave_unica = (club_key, identificador_tiempo)

            if llave_unica in combinaciones_existentes:
                print(f"⚠️ [IGNORADO POR DUPLICADO] -> Mismo club y año detectado en: {nombre_visible}")
                ignorados += 1
                continue # SALTA esta carpeta y no la mete al JSON
            
            # Si no es duplicado, registramos la llave para que no se vuelva a repetir
            combinaciones_existentes.add(llave_unica)

            # --- DETECCIÓN DE VERSIÓN ---
            if any(palabra in path_analisis for palabra in ["player", "jugador", "authentic", "adizero"]):
                version_final = "Jugador"
            else:
                version_final = "Fanático"

            # --- DETECCIÓN DE LÍNEA (RETRO VS ACTUAL) ---
            linea_final = "Actual"
            if identificador_tiempo != "actual":
                if "-" in identificador_tiempo: # Es una temporada tipo 21-22
                    fin = int(identificador_tiempo.split("-")[1])
                    anio_completo = 2000 + fin if fin <= 50 else 1900 + fin
                else: # Es año de 4 dígitos
                    anio_completo = int(identificador_tiempo)
                
                if anio_completo < ANIO_ACTUAL:
                    linea_final = "Retro"

            if any(palabra in path_analisis for palabra in ["retro", "classic", "vintage", "antigua"]):
                linea_final = "Retro"

            # --- ID Y RUTA DE IMÁGENES ---
            id_producto = generar_slug(nombre_visible)
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

    return catalogo, nuevos, ignorados

def main():
    print("==================================================")
    print("🚀 SCRIPT DE PREVENCION DE DUPLICADOS // DIRECT SOURCE")
    print("==================================================")
    print("1. 🔄 SOBRESCRIBIR TODO (Limpia el JSON y escanea desde cero)")
    print("2. ➕ ACTUALIZAR/AÑADIR (Añade sin borrar controlando duplicados)")
    
    opcion = input("\n👉 Elige una opción (1 o 2): ").strip()

    if opcion == '1':
        print("\n🔍 Analizando e indexando inventario completo...")
        catalogo_final, procesados, ignorados = procesar_ruta(DIRECTORIO_CAMISETAS, [])
        
    elif opcion == '2':
        carpeta = input("\n👉 Ingresa el nombre exacto de la carpeta a indexar: ").strip()
        ruta = os.path.join(DIRECTORIO_CAMISETAS, carpeta)
        
        if not os.path.exists(ruta):
            print(f"\n❌ Error: No se encontró la carpeta '{carpeta}'")
            return
            
        catalogo_actual = []
        if os.path.exists(ARCHIVO_SALIDA):
            with open(ARCHIVO_SALIDA, 'r', encoding='utf-8') as f:
                catalogo_actual = json.load(f)
                
        print(f"\n🔍 Analizando novedades en: {carpeta}...")
        catalogo_final, procesados, ignorados = procesar_ruta(ruta, catalogo_actual)
        
    else:
        print("\n❌ Opción no válida.")
        return

    # Guardar archivo unificado libre de basura
    with open(ARCHIVO_SALIDA, 'w', encoding='utf-8') as f:
        json.dump(catalogo_final, f, ensure_ascii=False, indent=2)

    print("\n========================================")
    print("🚀 ¡PROCESAMIENTO DE SEGURIDAD TERMINADO!")
    print(f"📦 Nuevas referencias añadidas: {procesados}")
    print(f"⚠️ Carpetas duplicadas saltadas (Ignoradas): {ignorados}")
    print(f"📁 Total limpio en catálogo general: {len(catalogo_final)}")
    print("========================================")

if __name__ == '__main__':
    main()
    
    
cloudinary.config(
  cloud_name = "de9bzrrev",  # Reemplaza con tu Cloud Name
  api_key = "664982167684186",        # Reemplaza con tu API Key
  api_secret = "zefxBw5aEtgm7saRDaDXNBOZytk",  # Reemplaza con tu API Secret
  secure = True
)