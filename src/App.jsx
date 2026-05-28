import React, { useState, useEffect } from 'react';
import ModalCamiseta from './components/ModalCamiseta';
import CATALOGO_BASE from './catalogo.json'; 

function TarjetaCamiseta({ cam, setCamisetaSeleccionada }) {
  const [fotoIndex, setFotoIndex] = useState(0);
  const [intervaloId, setIntervaloId] = useState(null);

  const alEntrarMouse = () => {
    if (cam.imagenes && cam.imagenes.length > 1) {
      const id = setInterval(() => {
        setFotoIndex((prevIndex) => (prevIndex + 1) % cam.imagenes.length);
      }, 1200);
      setIntervaloId(id);
    }
  };

  const detenerCarrusel = () => {
    if (intervaloId) {
      clearInterval(intervaloId);
      setIntervaloId(null);
    }
  };

  const alSalirMouse = () => {
    detenerCarrusel();
    setFotoIndex(0);
  };

  const fotoSiguiente = (e) => {
    e.stopPropagation();
    detenerCarrusel();
    setFotoIndex((fotoIndex + 1) % cam.imagenes.length);
  };

  const fotoAnterior = (e) => {
    e.stopPropagation();
    detenerCarrusel();
    setFotoIndex((fotoIndex - 1 + cam.imagenes.length) % cam.imagenes.length);
  };

  return (
    <div 
      className="group flex flex-col bg-[#0A0A0A] transition-all duration-300 relative border border-transparent hover:border-[#222222] p-2"
      onMouseEnter={alEntrarMouse}
      onMouseLeave={alSalirMouse}
    >
      <div className="relative pt-[120%] bg-[#111111] border border-[#222222] overflow-hidden">
        <img 
          src={cam.imagenes[fotoIndex] || '/placeholder.png'} 
          alt={cam.nombre} 
          className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-300 ease-out" 
          loading="lazy" 
        />
        
        {cam.imagenes.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button onClick={fotoAnterior} className="bg-[#0A0A0A]/80 text-white w-6 h-6 border border-[#333333] hover:bg-white hover:text-black font-black text-xs flex items-center justify-center">‹</button>
            <button onClick={fotoSiguiente} className="bg-[#0A0A0A]/80 text-white w-6 h-6 border border-[#333333] hover:bg-white hover:text-black font-black text-xs flex items-center justify-center">›</button>
          </div>
        )}

        <div className="absolute top-3 left-3 bg-[#0A0A0A] text-white px-2.5 py-1 font-bold text-[9px] uppercase tracking-widest border border-[#333333]">
          {cam.categoria.toUpperCase() === 'RETRO' ? 'RETRO' : cam.version}
        </div>
        
        <div className="absolute bottom-3 right-3 bg-[#0A0A0A]/90 text-[#888888] px-2 py-1 font-mono text-[9px] uppercase tracking-widest border border-[#222222] backdrop-blur-sm">
          {fotoIndex + 1} / {cam.imagenes.length} SHOTS
        </div>

        <div className="absolute bottom-0 inset-x-0 h-1 flex gap-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {cam.imagenes.map((_, idx) => (
            <div key={idx} className={`h-full flex-grow transition-all duration-300 ${idx === fotoIndex ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>

      <div className="pt-5 flex flex-col flex-grow">
        <h3 className="text-sm font-black uppercase tracking-wider leading-snug mb-5 text-[#EEEEEE] group-hover:text-white transition-colors line-clamp-2">
          {cam.nombre}
        </h3>
        
        <div className="mt-auto pt-4 border-t border-[#222222]">
          <button 
            type="button"
            onClick={() => setCamisetaSeleccionada(cam)}
            className="w-full flex justify-between items-center bg-transparent text-[#888888] hover:text-white font-bold uppercase text-[11px] tracking-widest transition-colors"
          >
            <span>Configurar Prenda</span>
            <span className="text-lg leading-none">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('TODAS');
  const [versionActiva, setVersionActiva] = useState('TODAS');
  const [camisetaSeleccionada, setCamisetaSeleccionada] = useState(null);
  
  // NUEVO ESTADO PARA EL CARRITO MÓVIL
  const [carritoMovilAbierto, setCarritoMovilAbierto] = useState(false);

  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('ds_dark_cart');
    return guardado ? JSON.parse(guardado) : [];
  });

  useEffect(() => {
    localStorage.setItem('ds_dark_cart', JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    if (categoriaActiva === 'RETRO') setVersionActiva('TODAS');
  }, [categoriaActiva]);

  const camisetasFiltradas = CATALOGO_BASE.filter((cam) => {
    const cumpleBusqueda = cam.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleCategoria = categoriaActiva === 'TODAS' || cam.categoria.toUpperCase() === categoriaActiva;
    const cumpleVersion = categoriaActiva === 'RETRO' || versionActiva === 'TODAS' || cam.version.toUpperCase() === versionActiva;
    return cumpleBusqueda && cumpleCategoria && cumpleVersion;
  });

  const agregarAlCarrito = (prenda) => setCarrito([...carrito, prenda]);
  const eliminarDelCarrito = (idx) => setCarrito(carrito.filter((_, i) => i !== idx));
  const vaciarCarrito = () => window.confirm('¿VACIAR TODA LA BOLSA DE PEDIDO?') && setCarrito([]);

  const enviarPedidoWhatsApp = () => {
    if (carrito.length < 6) return;
    let msg = "¡Hola Direct Source Sports!\n\n*NUEVO PEDIDO MAYORISTA*\n";
    msg += `Total unidades: ${carrito.length}\n----------------------------------------\n\n`;
    carrito.forEach((item, idx) => {
      msg += `*${idx + 1}. ${item.nombre}*\n   - Línea: ${item.categoria}\n   - Corte/Versión: ${item.categoria.toUpperCase() === 'RETRO' ? 'Retro Única' : item.version}\n   - Talla: ${item.talla}\n   - Estampado: ${item.nombreEstampado || "Sin estampado"} ${item.numeroEstampado ? `(#${item.numeroEstampado})` : ""}\n\n`;
    });
    msg += "----------------------------------------\n*Nota:* Los parches de las mangas te los detallo aquí abajo.";
    window.open(`https://wa.me/573013465240?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans antialiased selection:bg-white selection:text-black">
      
      {/* NAVBAR */}
      <header className="border-b border-[#222222] bg-[#0A0A0A] sticky top-0 z-40 px-6 md:px-10 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center bg-[#111111] border border-[#333333] overflow-hidden group">
            <img src="/watermark.png" alt="Logo" className="w-full h-full object-contain z-10" onError={(e) => { e.target.style.opacity = '0'; }} />
            <span className="absolute text-[8px] font-mono text-[#555555] text-center leading-tight group-hover:text-white transition-colors"><br/></span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter uppercase leading-none">Direct Source</span>
            <span className="text-[10px] font-bold tracking-widest text-[#666666] uppercase mt-1">Wholesale Supply</span>
          </div>
        </div>

        {/* LÓGICA INTELIGENTE DEL BOTÓN DE BOLSA */}
        <button 
          type="button"
          onClick={() => {
            if (window.innerWidth < 1024) {
              setCarritoMovilAbierto(true);
            } else {
              document.getElementById('bolsa-compras').scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-3 bg-[#111111] border border-[#333333] hover:bg-white hover:text-black px-6 py-2.5 transition-all duration-300"
        >
          <span className="text-xs font-bold uppercase tracking-widest">Bolsa</span>
          <span className="font-black text-sm">[{carrito.length}]</span>
        </button>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 md:px-10 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        <div className="lg:col-span-3 space-y-10">
          <div className="relative border-b border-[#333333] pb-3">
            <input type="text" placeholder="INGRESA REFERENCIA O EQUIPO..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-transparent py-2 text-xl font-black uppercase tracking-tight text-white focus:outline-none placeholder-[#444444]" />
          </div>

          <div className="flex flex-col md:flex-row gap-10 pt-2 border-b border-[#111111] pb-8">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">Línea de Diseño</span>
              <div className="flex gap-3">
                {['TODAS', 'ACTUAL', 'RETRO'].map(c => (
                  <button type="button" key={c} onClick={() => setCategoriaActiva(c)} className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest border transition-all duration-300 ${categoriaActiva === c ? 'bg-white text-black border-white' : 'bg-[#0A0A0A] text-[#888888] border-[#333333] hover:border-white hover:text-white'}`}>{c}</button>
                ))}
              </div>
            </div>

            {categoriaActiva !== 'RETRO' ? (
              <div className="flex flex-col gap-4 animate-fade-in">
                <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">Versión de Corte</span>
                <div className="flex gap-3">
                  {['TODAS', 'JUGADOR', 'FANÁTICO'].map(v => (
                    <button type="button" key={v} onClick={() => setVersionActiva(v)} className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest border transition-all duration-300 ${versionActiva === v ? 'bg-white text-black border-white' : 'bg-[#0A0A0A] text-[#888888] border-[#333333] hover:border-white hover:text-white'}`}>{v}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-end pb-2">
                <span className="text-[10px] font-mono tracking-wider text-[#EB5E28] uppercase bg-[#1C1612] px-4 py-2 border border-[#402B1D]">// Edición Retro: Ajuste clásico de época único</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {camisetasFiltradas.map((cam) => (
              <TarjetaCamiseta key={cam.id} cam={cam} setCamisetaSeleccionada={setCamisetaSeleccionada} />
            ))}
          </div>
        </div>

        {/* SIDEBAR LOGÍSTICO REFACTORIZADO (OFF-CANVAS EN MÓVIL) */}
        <div id="bolsa-compras" className={`lg:col-span-1 ${carritoMovilAbierto ? 'fixed inset-0 z-50 bg-[#0A0A0A] p-6 overflow-y-auto animate-fade-in' : 'hidden lg:block'}`}>
          
          {/* Botón de cierre solo visible en móvil */}
          {carritoMovilAbierto && (
            <div className="flex justify-between items-center mb-6 lg:hidden">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">Tu Bolsa</h2>
              <button onClick={() => setCarritoMovilAbierto(false)} className="text-white text-2xl font-light w-10 h-10 bg-[#111111] border border-[#333333] flex items-center justify-center">✕</button>
            </div>
          )}

          <div className="border border-[#222222] bg-[#111111] p-7 sticky top-28">
            <div className="flex justify-between items-end border-b border-[#333333] pb-5 mb-6">
              <h3 className="text-lg font-black uppercase tracking-tighter text-white hidden lg:block">Distribución</h3>
              <span className="text-[#888888] text-[10px] font-bold uppercase tracking-widest">MIN: 6 UDS</span>
            </div>

            {carrito.length === 0 ? (
              <p className="text-[11px] font-bold text-[#555555] uppercase tracking-widest mb-10 text-center py-10 border border-dashed border-[#333333]">BANDEJA VACÍA</p>
            ) : (
              <div className="space-y-5 max-h-[50vh] lg:max-h-[40vh] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {carrito.map((item, index) => (
                  <div key={index} className="flex flex-col gap-1.5 border-b border-[#222222] pb-4">
                    <div className="flex justify-between items-start">
                      <p className="font-bold uppercase text-xs leading-tight pr-4 text-[#DDDDDD]">{item.nombre}</p>
                      <button type="button" onClick={() => eliminarDelCarrito(index)} className="text-[#555555] hover:text-white font-bold text-xs transition-colors">✕</button>
                    </div>
                    <p className="text-[9px] font-bold text-[#888888] uppercase tracking-widest flex gap-2">
                      <span className="text-white">T: {item.talla}</span> 
                      <span>|</span> 
                      <span>LÍNEA: {item.categoria.toUpperCase() === 'RETRO' ? 'RETRO' : item.version}</span>
                    </p>
                    {item.nombreEstampado && (
                      <p className="text-[9px] font-bold text-[#AAAAAA] bg-[#1A1A1A] p-1.5 mt-1 inline-block uppercase border border-[#222222]">EST: {item.nombreEstampado} #{item.numeroEstampado}</p>
                    )}
                  </div>
                ))}
                <button type="button" onClick={vaciarCarrito} className="text-[9px] font-bold text-[#555555] hover:text-white uppercase tracking-widest border-b border-[#555555] pb-0.5 transition-colors">Purge Batch</button>
              </div>
            )}

            <div className="bg-[#0A0A0A] border border-[#222222] p-5 mb-6">
              {carrito.length < 6 ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-[#666666]">Bloqueo de Sistema</p>
                  <p className="text-[11px] text-[#AAAAAA] font-medium leading-relaxed">Requiere <span className="font-black text-white">{6 - carrito.length} prenda(s)</span> adicionales.</p>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-[#666666]">Desbloqueado</p>
                  <p className="text-[11px] text-[#4ADE80] font-black uppercase tracking-wider">Envío Nacional Gratuito Activo.</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-[#222222]">
                <p className="text-[10px] text-[#666666] font-bold uppercase tracking-widest leading-relaxed">
                  🚚 LOGÍSTICA DE IMPORTACIÓN:<br/>
                  <span className="text-[#AAAAAA]">Despacho est. 10 a 15 días hábiles sin stock.</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={enviarPedidoWhatsApp}
              disabled={carrito.length < 6}
              className={`w-full py-4 flex justify-between items-center px-6 transition-all duration-300 ${
                carrito.length >= 6 ? 'bg-white text-black hover:bg-[#DDDDDD]' : 'bg-[#1A1A1A] text-[#444444] border border-[#222222] cursor-not-allowed'
              }`}
            >
              <span className="text-[11px] font-black uppercase tracking-widest">Transmitir Orden</span>
              <span className="text-lg leading-none">→</span>
            </button>
          </div>
        </div>

      </main>

      {camisetaSeleccionada && (
        <ModalCamiseta
          camiseta={camisetaSeleccionada}
          onClose={() => setCamisetaSeleccionada(null)}
          onAgregar={(item) => {
            agregarAlCarrito(item);
            // Opcional: abre el carrito móvil automáticamente al agregar algo
            if (window.innerWidth < 1024) setCarritoMovilAbierto(true);
          }}
        />
      )}
    </div>
  );
}