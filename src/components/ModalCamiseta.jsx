import React, { useState, useEffect } from 'react';

export default function ModalCamiseta({ camiseta, onClose, onAgregar }) {
  const [talla, setTalla] = useState('');
  const [requiereEstampado, setRequiereEstampado] = useState(false);
  const [nombreEstampado, setNombreEstampado] = useState('');
  const [numeroEstampado, setNumeroEstampado] = useState('');
  
  // Estado para la galería manual: inyecta imágenes[0] por defecto
  const [imagenActivaIndex, setImagenActivaIndex] = useState(0);

  // Prevenir scroll en el fondo cuando el modal está abierto (premium feel)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const esRetro = camiseta.categoria?.toUpperCase() === 'RETRO';

  // Lógica para el carrusel manual
  const images = camiseta.imagenes || [];
  
  const changeImage = (direction) => {
    setImagenActivaIndex((prev) => {
      let nextIndex = prev + direction;
      if (nextIndex < 0) nextIndex = images.length - 1;
      if (nextIndex >= images.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!talla) {
      alert("Por favor selecciona una talla");
      return;
    }

    onAgregar({
      ...camiseta,
      talla,
      // Si es retro, forzamos la versión en el carrito para la orden
      version: esRetro ? 'RETRO' : camiseta.version,
      nombreEstampado: requiereEstampado ? nombreEstampado : null,
      numeroEstampado: requiereEstampado ? numeroEstampado : null
    });
    
    onClose();
  };

  return (
    // CONTENEDOR FONDO CON BACKDROP-BLUR: Da ese efecto premium de fondo borroso
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/90 backdrop-blur-md transition-opacity duration-300" onClick={onClose}>
      
      {/* CUERPO DEL MODAL (Con altura restringida en PC max-h-85vh y scroll interno overflow-hidden) */}
      <div 
        className="bg-[#111111] border border-[#333333] w-full max-w-4xl max-h-[90dvh] md:max-h-[85vh] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-fade-in relative"
        onClick={(e) => e.stopPropagation()} // Previene que el modal se cierre al hacer clic adentro
      >
        
        {/* Botón de Cierre Flotante en la esquina */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-[#0A0A0A] border border-[#333333] text-white/50 w-8 h-8 flex items-center justify-center hover:bg-white hover:text-black transition-colors rounded-full md:rounded-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* ======================================= */}
        {/* COLUMNA IZQUIERDA: GALERÍA DE IMÁGENES */}
        {/* ======================================= */}
        <div className="w-full md:w-1/2 bg-[#0A0A0A] border-b md:border-b-0 md:border-r border-[#222222] flex flex-col shrink-0">
          
          {/* Imagen Principal y Controles - RELATIVE para botones absolutos */}
          <div className="relative pt-[120%] bg-[#111111] h-[35vh] md:h-auto shrink-0 md:flex-grow">
            {/* Imagen que carga imágenes[0] por defecto */}
            <img 
              src={images[imagenActivaIndex]} 
              alt={`${camiseta.nombre} vista ${imagenActivaIndex + 1}`} 
              className="absolute inset-0 w-full h-full object-contain md:object-cover"
            />
            
            {/* BOTONES DE NAVEGACIÓN MANUAL (Fija BUG 2) - Estilo oscuro minimalista */}
            {images.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-10">
                <button 
                  onClick={() => changeImage(-1)}
                  type="button"
                  className="bg-[#0A0A0A]/70 text-white w-7 h-7 flex items-center justify-center border border-[#333333] hover:bg-white hover:text-black transition-colors"
                >
                  ‹
                </button>
                <button 
                  onClick={() => changeImage(1)}
                  type="button"
                  className="bg-[#0A0A0A]/70 text-white w-7 h-7 flex items-center justify-center border border-[#333333] hover:bg-white hover:text-black transition-colors"
                >
                  ›
                </button>
              </div>
            )}
            
            {/* Etiquetas Superiores dinámicas */}
            <div className="absolute top-4 left-4 bg-[#EB5E28] text-white px-3 py-1 font-bold text-[10px] uppercase tracking-widest border border-[#EB5E28]">
              {camiseta.categoria.toUpperCase() === 'RETRO' ? 'RETRO' : camiseta.version}
            </div>
            
            {/* Indicador numérico de tomas actuales */}
            <div className="absolute bottom-4 right-4 bg-[#0A0A0A]/90 text-[#888888] px-2 py-1 font-mono text-[9px] uppercase tracking-widest border border-[#222222] backdrop-blur-sm">
              {imagenActivaIndex + 1} / {images.length} SHOTS
            </div>
          </div>
          
          {/* Miniaturas (Thumbnails) - Escrolleable horizontalmente en móvil */}
          <div className="flex overflow-x-auto p-4 gap-3 custom-scrollbar bg-[#0A0A0A] shrink-0 border-t border-[#222222]">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setImagenActivaIndex(idx)}
                type="button"
                className={`relative flex-shrink-0 w-16 h-16 border transition-all ${
                  imagenActivaIndex === idx ? 'border-white opacity-100 ring-2 ring-white/10' : 'border-[#333333] opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ======================================= */}
        {/* COLUMNA DERECHA: FORMULARIO */}
        {/* ======================================= */}
        <form onSubmit={manejarEnvio} className="w-full md:w-1/2 flex flex-col bg-[#111111] overflow-hidden flex-1">
          
          {/* ÁREA ESCROLLEABLE DEL FORMULARIO (overflow-y-auto pr-2 custom-scrollbar pb-32) */}
          {/* Fija que al abrir personalización se pueda hacer scroll y no se corte */}
          <div className="flex-grow overflow-y-auto p-6 md:p-8 pr-2 custom-scrollbar pb-32 md:pb-6">
            
            {/* Detalles del Producto */}
            <div className="mb-8">
              <span className="text-[#666666] text-[10px] font-bold uppercase tracking-widest mb-2 block">
                Direct Source / {camiseta.categoria}
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white leading-none mb-4">
                {camiseta.nombre}
              </h2>
              
              {/* Badge Dinámico de Corte */}
              {esRetro ? (
                <div className="inline-block bg-[#1A1A1A] border border-[#333333] px-4 py-2 mt-2">
                  <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">
                    AJUSTE DE CORTE: <span className="text-white font-bold">RETRO ÚNICO</span>
                  </p>
                </div>
              ) : (
                <div className="inline-block bg-[#0A0A0A] border border-[#222222] px-4 py-2 mt-2">
                  <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">
                    CORTE ESPECÍFICO: <span className="text-white font-bold">{camiseta.version}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* Selector de Tallas Internacionales */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] font-bold text-[#888888] uppercase tracking-widest">Talla Internacional</label>
                  <span className="text-[9px] font-mono text-[#555555]">MEDIDAS ASIÁTICAS (Slim fit)</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => setTalla(sz)}
                      className={`py-3 text-sm font-black uppercase transition-all border ${
                        talla === sz 
                          ? 'bg-white text-black border-white' 
                          : 'bg-[#0A0A0A] text-[#888888] border-[#333333] hover:border-white hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opciones de Personalización (Estampado) */}
              <div className="space-y-4 border-t border-[#222222] pt-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded-none bg-[#0A0A0A] border-[#444444] text-white focus:ring-0 checked:bg-white checked:border-white cursor-pointer"
                    checked={requiereEstampado}
                    onChange={(e) => setRequiereEstampado(e.target.checked)}
                  />
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest">
                    AGREGAR DORSAL PERSONALIZADO (+$$)
                  </span>
                </label>

                {/* Inputs de Estampado: Se abren con animación suave */}
                {requiereEstampado && (
                  <div className="grid grid-cols-3 gap-4 animate-fade-in bg-[#0A0A0A] p-4 border border-[#222222]">
                    <div className="col-span-2 space-y-2">
                      <label className="text-[9px] font-mono text-[#666666] uppercase tracking-widest">Nombre (max 15)</label>
                      <input 
                        type="text" 
                        maxLength="15"
                        placeholder="Ej: BELLINGHAM"
                        value={nombreEstampado}
                        onChange={(e) => setNombreEstampado(e.target.value.toUpperCase())}
                        className="w-full bg-transparent border-b border-[#444444] focus:border-white text-white text-sm font-bold font-mono py-2 focus:outline-none placeholder-[#333333]"
                      />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="text-[9px] font-mono text-[#666666] uppercase tracking-widest">Número (max 2)</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="99"
                        placeholder="Ej: 5"
                        value={numeroEstampado}
                        onChange={(e) => setNumeroEstampado(e.target.value)}
                        className="w-full bg-transparent border-b border-[#444444] focus:border-white text-white text-sm font-bold font-mono py-2 focus:outline-none placeholder-[#333333]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ======================================= */}
          {/* BOTÓN PEGADO AL FONDO (STICKY FOOTER) */}
          {/* ======================================= */}
          {/* Fija BUG 1 de Captura de Pantalla Móvil: border-t border-[#222222] bg-[#111111] py-4 sticky bottom-0 */}
          <div className="mt-auto px-6 py-4 pt-4 border-t border-[#222222] bg-[#111111] shrink-0 sticky bottom-0 left-0 right-0 z-10 md:px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] md:shadow-none">
            <button 
              type="submit"
              className="w-full bg-white text-black hover:bg-[#DDDDDD] font-black uppercase text-xs tracking-widest py-4 transition-colors"
            >
              Añadir a la Lista de Pedido mayorista
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}