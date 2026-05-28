import os
import json
import re
from datetime import datetime
import cloudinary
import cloudinary.uploader

# =====================================================================
# CONFIGURACIÓN DE CREDENCIALES (Cópialas de tu Dashboard de Cloudinary)
# =====================================================================
cloudinary.config(
  cloud_name = "de9bzrrev",  # Reemplaza con tu Cloud Name
  api_key = "664982167684186",        # Reemplaza con tu API Key
  api_secret = "zefxBw5aEtgm7saRDaDXNBOZytk",  # Reemplaza con tu API Secret
  secure = True
)

DIRECTORIO_BASE = os.getcwd()
DIRECTORIO_CAMISETAS = os.path.join(DIRECTORIO_BASE, 'public', 'images', 'camisetas')
ARCHIVO_SALIDA = os.path.join(DIRECTORIO_BASE, 'src', 'catalogo.json')
EXTENSIONES = ('.jpg', '.jpeg', '.png', '.webp')
ANIO_ACTUAL = datetime.now().year

def limpiar_nombre(texto):
    texto_limpio = texto.replace('_', ' ').replace('-', ' ')
    patron_remover = r'\b(player|version|jugador|authentic|fanatico|fan|replica|aaa)\b'
    texto_limpio = re.sub(patron_remover, '', texto_limpio, flags=re.IGNORECASE)
    return ' '.join(texto_limpio.split()).title()

def generar_slug(texto):
    texto = texto.lower()
    texto = re.sub(r'[\s\-_]+', '-', texto)
    return re.sub(r'[^a-z0-9]+', '', texto).strip('-')

def extraer_anio(texto):
    match = re.search(r'\b(19\d{2}|20\d{2})\b', texto)
    return match.group(1) if match else None

def ordenar_imagenes_por_prioridad(lista_archivos):
    def evaluar_prioridad(nombre_archivo):
        name = nombre_archivo.lower()
        if any(p in name for p in ['front', 'frontal', 'principal', 'preview']): return 0
        if name.startswith('1.') or name.startswith('01.'): return 1
        if any(p in name for p in ['tag', 'label', 'inside', 'marquilla', 'detail', 'detalles', 'zoom', 'sku', 'close']): return 100
        if any(p in name for p in ['back', 'espalda', 'dorsal']): return 50
        return 10 + len(name)
    return sorted(lista_archivos, key=evaluar_prioridad)

def mapear_y_subir_a_cloud_ordenado():
    print("==================================================")
    print("☁️  SUBIDA MASIVA CON ESTRUCTURA DE CARPETAS REALES")
    print("==================================================")

    if not os.path.exists(DIRECTORIO_CAMISETAS):
        print(f"❌ Error: No se encontró la ruta {DIRECTORIO_CAMISETAS}")
        return

    catalogo = []
    ids_procesados = set()
    total_imagenes_subidas = 0

    # Recorremos el árbol de directorios locales
    for raiz, _, archivos in os.walk(DIRECTORIO_CAMISETAS, topdown=True):
        imagenes_validas = [img for img in archivos if img.lower().endswith(EXTENSIONES)]
        
        if imagenes_validas:
            nombre_carpeta_prenda = os.path.basename(raiz)
            nombre_carpeta_padre = os.path.basename(os.path.dirname(raiz))
            path_analisis = f"{nombre_carpeta_padre} {nombre_carpeta_prenda}".lower()
            
            # Formateo de nombres para mostrar en la web
            if nombre_carpeta_padre.lower() != 'camisetas':
                club_limpio = limpiar_nombre(nombre_carpeta_padre)
                nombre_visible = f"{club_limpio} - {limpiar_nombre(nombre_carpeta_prenda)}"
                # Nombre de la carpeta del Club en Cloudinary (limpio sin espacios)
                folder_club = generar_slug(club_limpio)
            else:
                club_limpio = limpiar_nombre(nombre_carpeta_prenda)
                nombre_visible = club_limpio
                folder_club = "generales"

            id_producto = generar_slug(nombre_visible)
            folder_prenda = generar_slug(nombre_carpeta_prenda)

            # Evitar falsos positivos / duplicados reales
            if id_producto in ids_procesados:
                print(f"⚠️ [DUPLICADO] Saltando referencia ya procesada: {nombre_visible}")
                continue
            
            # --- EL TRUCO DE LA RUTA REAL DE CARPETAS ---
            # Esto le dice a Cloudinary exactamente en qué carpeta y subcarpeta meter el archivo
            # Estructura: DirectSource_Catalog / nombre-del-club / nombre-de-la-prenda
            ruta_carpeta_cloudinary = f"DirectSource_Catalog/{folder_club}/{folder_prenda}"

            # Lógica de categorías de fútbol
            anio_carpeta = extraer_anio(nombre_carpeta_prenda)
            anio_padre = extraer_anio(nombre_carpeta_padre)
            anio_detectado = anio_carpeta or anio_padre
            
            linea_final = "Actual"
            if anio_detectado and int(anio_detectado) < ANIO_ACTUAL:
                linea_final = "Retro"
            if "retro" in path_analisis or "classic" in path_analisis or "vintage" in path_analisis:
                linea_final = "Retro"

            version_final = "Jugador" if any(p in path_analisis for p in ["player", "jugador", "authentic", "adizero"]) else "Fanático"
            
            ids_procesados.add(id_producto)
            imagenes_ordenadas = ordenar_imagenes_por_prioridad(imagenes_validas)
            
            urls_cloudinary = []
            print(f"\n📁 Creando Carpeta Cloud: {ruta_carpeta_cloudinary}")
            print(f"📦 Subiendo {len(imagenes_ordenadas)} imágenes para: {nombre_visible}")

            for archivo_foto in imagenes_ordenadas:
                ruta_completa_foto = os.path.join(raiz, archivo_foto)
                nombre_base_archivo = os.path.splitext(archivo_foto)[0]

                try:
                    # Configuración avanzada de Upload para obligar a Cloudinary a crear carpetas físicas reales
                    resultado = cloudinary.uploader.upload(
                        ruta_completa_foto,
                        folder = ruta_carpeta_cloudinary,      # CARPETA DESTINO REAL
                        public_id = nombre_base_archivo,       # Mantiene el nombre original numerado (_0, _1, etc)
                        overwrite = True,
                        resource_type = "image",
                        use_filename = True,                   # Usa el nombre del archivo
                        unique_filename = False                # Evita que Cloudinary le pegue letras aleatorias al final
                    )
                    url_segura = resultado.get("secure_url")
                    urls_cloudinary.append(url_segura)
                    total_imagenes_subidas += 1
                    print(f"   ✅ Archivo guardado -> {nombre_base_archivo}")
                except Exception as e:
                    print(f"   ❌ Error al subir {archivo_foto}: {e}")

            if urls_cloudinary:
                producto = {
                    "id": id_producto,
                    "nombre": nombre_visible,
                    "version": version_final,
                    "categoria": linea_final,
                    "imagenes": urls_cloudinary
                }
                catalogo.append(producto)

    # Actualizar catálogo local de datos para React
    os.makedirs(os.path.dirname(ARCHIVO_SALIDA), exist_ok=True)
    with open(ARCHIVO_SALIDA, 'w', encoding='utf-8') as f:
        json.dump(catalogo, f, ensure_ascii=False, indent=2)

    print("\n========================================")
    print("🚀 ¡MIGRACIÓN TOTAL Y ORDENADA COMPLETADA!")
    print(f"📂 Revisa tu cuenta de Cloudinary, verás la carpeta: DirectSource_Catalog/")
    print(f"📦 Total referencias cargadas: {len(catalogo)}")
    print(f"🔒 Total imágenes guardadas en CDN: {total_imagenes_subidas}")
    print("========================================")

if __name__ == '__main__':
    mapear_y_subir_a_cloud_ordenado()