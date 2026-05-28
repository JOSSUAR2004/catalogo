import os
from PIL import Image

# ==========================================
# CONFIGURACIÓN DE RUTAS Y DISEÑO
# ==========================================
DIRECTORIO_BASE = os.getcwd()
DIRECTORIO_CAMISETAS = os.path.join(DIRECTORIO_BASE, 'public', 'images', 'camisetas')
RUTA_WATERMARK = os.path.join(DIRECTORIO_BASE, 'watermark.png')

# 1. OPACIDAD (0 = invisible, 255 = sólido)
# Ajustado a 35 para que quede ultra transparente (estilo fantasma) sobre la prenda
OPACIDAD = 35 

# 2. ESCALA (0.85 = 85% de la imagen)
# Para que el logo sea gigante y ocupe casi toda la foto
ESCALA_LOGO = 0.85 

EXTENSIONES = ('.jpg', '.jpeg', '.png', '.webp')

def aplicar_marca_agua():
    print("==================================================")
    print("🛡️ SCRIPT DE PROTECCIÓN CENTRAL (MÉTODO PASTING)")
    print("==================================================")

    if not os.path.exists(RUTA_WATERMARK):
        print(f"❌ ERROR: No se encontró el logo en {RUTA_WATERMARK}")
        print("Asegúrate de poner tu logo.png en la raíz del proyecto.")
        return

    # 1. Cargar y preparar la marca de agua original en RGBA
    marca_agua_original = Image.open(RUTA_WATERMARK).convert("RGBA")
    
    # Reducir la opacidad manipulando directamente el canal Alpha (el canal [3])
    alpha = marca_agua_original.split()[3]
    alpha = alpha.point(lambda p: p * (OPACIDAD / 255.0))
    marca_agua_original.putalpha(alpha)

    contador = 0
    print("⏳ Procesando... Te iré listando cada foto modificada:\n")

    for raiz, _, archivos in os.walk(DIRECTORIO_CAMISETAS):
        for archivo in archivos:
            if archivo.lower().endswith(EXTENSIONES):
                ruta_imagen = os.path.join(raiz, archivo)
                
                try:
                    # 2. Abrir la camiseta base en RGBA para soportar fusiones
                    imagen_base = Image.open(ruta_imagen).convert("RGBA")
                    base_w, base_h = imagen_base.size

                    # 3. Calcular tamaño gigante proporcional para el logo (85% del ancho)
                    nuevo_w_marca = int(base_w * ESCALA_LOGO)
                    proporcion = nuevo_w_marca / float(marca_agua_original.size[0])
                    nuevo_h_marca = int(float(marca_agua_original.size[1]) * proporcion)
                    
                    # Control extra: Si por la proporción el logo queda muy alto y se sale verticalmente, lo limitamos
                    if nuevo_h_marca > base_h * ESCALA_LOGO:
                        nuevo_h_marca = int(base_h * ESCALA_LOGO)
                        proporcion = nuevo_h_marca / float(marca_agua_original.size[1])
                        nuevo_w_marca = int(float(marca_agua_original.size[0]) * proporcion)
                    
                    # Redimensionar logo con alta calidad
                    marca_redimensionada = marca_agua_original.resize((nuevo_w_marca, nuevo_h_marca), Image.Resampling.LANCZOS)

                    # 4. Matemáticas para calcular el CENTRO exacto de la foto
                    pos_x = (base_w - nuevo_w_marca) // 2
                    pos_y = (base_h - nuevo_h_marca) // 2

                    # 5. EL TRUCO GANADOR: Usar .paste() con la máscara alpha de la misma marca
                    # Esto fuerza la impresión del logo en el centro de la imagen base
                    imagen_base.paste(marca_redimensionada, (pos_x, pos_y), marca_redimensionada)

                    # 6. Guardar el archivo sobrescribiendo según su extensión original
                    if archivo.lower().endswith(('.jpg', '.jpeg')):
                        imagen_final = imagen_base.convert("RGB")
                        imagen_final.save(ruta_imagen, 'JPEG', quality=95)
                    elif archivo.lower().endswith('.webp'):
                        imagen_final = imagen_base
                        imagen_final.save(ruta_imagen, 'WEBP', quality=95)
                    else:
                        imagen_final = imagen_base
                        imagen_final.save(ruta_imagen)
                        
                    contador += 1
                    print(f"✅ Centrada y Protegida: {archivo}")

                except Exception as e:
                    print(f"⚠️ Error al procesar {archivo}: {e}")

    print("\n========================================")
    print("🚀 ¡BLINDAJE TOTAL COMPLETADO!")
    print(f"🔒 Total de imágenes marcadas al centro: {contador}")
    print("========================================")

if __name__ == '__main__':
    aplicar_marca_agua()