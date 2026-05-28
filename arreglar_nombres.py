import os
import re

# ==========================================
# CONFIGURACIÓN DE RUTAS
# ==========================================
DIRECTORIO_BASE = os.getcwd()
DIRECTORIO_CAMISETAS = os.path.join(DIRECTORIO_BASE, 'public', 'images', 'camisetas')

def arreglar_temporadas():
    print("==================================================")
    print("🛠️ SCRIPT DE RESTAURACIÓN DE TEMPORADAS CLÁSICAS")
    print("==================================================")
    
    if not os.path.exists(DIRECTORIO_CAMISETAS):
        print(f"❌ Error: No se encontró la ruta {DIRECTORIO_CAMISETAS}")
        return

    renombrados_archivos = 0
    renombrados_carpetas = 0

    # PATRÓN BLINDADO: 
    # (18|19|20)\d{2} -> Captura años de 4 dígitos que empiecen en 18, 19 o 20 (Ej: 1889)
    # (\d{2}) -> Captura los 2 dígitos finales de la temporada
    patron = re.compile(r'\b((?:18|19|20)\d{2})(\d{2})\b')

    print("🔍 Analizando el inventario completo...\n")

    for raiz, directorios, archivos in os.walk(DIRECTORIO_CAMISETAS, topdown=False):
        
        # 1. RENOMBRAR IMÁGENES
        for archivo in archivos:
            if patron.search(archivo):
                # Sustituye '188990' por '1889-90'
                nuevo_nombre = patron.sub(r'\1-\2', archivo)
                ruta_vieja = os.path.join(raiz, archivo)
                ruta_nueva = os.path.join(raiz, nuevo_nombre)
                
                os.rename(ruta_vieja, ruta_nueva)
                renombrados_archivos += 1
                print(f"📄 Archivo: {archivo}  -->  {nuevo_nombre}")

        # 2. RENOMBRAR CARPETAS
        for carpeta in directorios:
            if patron.search(carpeta):
                nuevo_nombre = patron.sub(r'\1-\2', carpeta)
                ruta_vieja = os.path.join(raiz, carpeta)
                ruta_nueva = os.path.join(raiz, nuevo_nombre)
                
                os.rename(ruta_vieja, ruta_nueva)
                renombrados_carpetas += 1
                print(f"📁 Carpeta: {carpeta}  -->  {nuevo_nombre}")

    print("\n========================================")
    print("🚀 ¡CORRECCIÓN FINALIZADA CON ÉXITO!")
    print(f"Archivos renombrados: {renombrados_archivos}")
    print(f"Carpetas renombradas: {renombrados_carpetas}")
    print("========================================")

if __name__ == '__main__':
    arreglar_temporadas()