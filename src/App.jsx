import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ShoppingCart, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import catalogoDatos from './catalogo.json'; 

// ==========================================
// COMPONENTE 1: LA TARJETA DE VITRINA (DISEÑO OSCURO)
// ==========================================
const ProductoCard = ({ producto, onAbrirModal }) => {
  const [imagenActiva, setImagenActiva] = useState(0);

  const nextImage = (e) => {
    e.stopPropagation();
    setImagenActiva((prev) => (prev === producto.imagenes.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setImagenActiva((prev) => (prev === 0 ? producto.imagenes.length - 1 : prev - 1));
  };

  return (
    <div 
      onClick={() => onAbrirModal(producto)}
      className="bg-[#121212] border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-full cursor-pointer group hover:border-zinc-700 transition-all"
    >
      <div className="relative h-64 w-full overflow-hidden bg-zinc-900 shrink-0 flex items-center justify-center">
        <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase z-10">
          {producto.version || 'FANÁTICO'}
        </span>

        <div 
          className="flex w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${imagenActiva * 100}%)` }}
        >
          {producto.imagenes.map((img, index) => (
            <img 
              key={index}
              src={img} 
              alt={`${producto.nombre} - ${index + 1}`} 
              className="w-full h-full object-contain shrink-0 p-4"
              loading={index === 0 ? "eager" : "lazy"} 
            />
          ))}
        </div>
        
        {producto.imagenes.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1.5 rounded-full z-10 active:scale-95 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1.5 rounded-full z-10 active:scale-95 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={16} />
            </button>
          </>
        )}

        <div className="absolute bottom-3 right-3 bg-black/80 text-zinc-400 text-[10px] font-mono px-2 py-0.5 rounded">
          {imagenActiva + 1} / {producto.imagenes.length} SHOTS
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between bg-black">
        <div>
          <h3 className="font-bold text-zinc-100 text-xs sm:text-sm uppercase tracking-wide line-clamp-2">{producto.nombre}</h3>
          <p className="text-[10px] text-zinc-500 font-mono mt-1 tracking-wider">{producto.categoria || 'ACTUAL'} - VERSIÓN {producto.version || 'FANÁTICO'}</p>
        </div>
        
        <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between items-center text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
          <span>CONFIGURAR PRENDA</span>
          <span className="text-sm font-light">+</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE 2: EL MODAL DE CONFIGURACIÓN
// ==========================================
const ModalCamiseta = ({ producto, onClose, onAgregar }) => {
  const [talla, setTalla] = useState('M');
  const [parche, setParche] = useState('Sin Parches');
  const [cantidad, setCantidad] = useState(1); 
  const personalizacionRef = useRef(null);

  const handleAgregar = () => {
    const textoPersonalizacion = personalizacionRef.current?.value || "S/N";
    
    const nuevoItem = {
      id: `${producto.id}-${talla}-${parche}-${textoPersonalizacion.toUpperCase().replace(/\s+/g, '')}`,
      referencia: producto.nombre,
      version: producto.version,
      categoria: producto.categoria,
      talla: talla,
      parches: parche,
      personalizacion: textoPersonalizacion.toUpperCase(),
      foto_url: producto.imagenes[0],
      cantidad: Number(cantidad) 
    };
    
    onAgregar(nuevoItem);
    onClose();
  };

  if (!producto) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-[#121212] border border-zinc-800 w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden text-zinc-200">
        
        <div className="w-full md:w-1/2 bg-zinc-900 p-6 flex justify-center items-center relative border-b md:border-b-0 md:border-r border-zinc-800">
          <button onClick={onClose} className="absolute top-4 left-4 md:hidden bg-black p-2 rounded-full text-zinc-400 border border-zinc-800">
            <X size={18} />
          </button>
          <img src={producto.imagenes[0]} alt={producto.nombre} className="w-full h-56 md:h-full object-contain" />
        </div>

        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-black text-white leading-tight uppercase tracking-wider">{producto.nombre}</h2>
                <p className="text-zinc-500 text-[10px] font-mono mt-1 tracking-widest">{producto.categoria} • {producto.version}</p>
              </div>
              <button onClick={onClose} className="hidden md:block text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">TALLA</label>
                  <select value={talla} onChange={(e) => setTalla(e.target.value)} className="w-full border border-zinc-800 bg-black rounded p-2.5 text-xs text-white outline-none focus:border-zinc-500">
                    <option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 col-span-1">
                  <label className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">CANT.</label>
                  <select value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="w-full border border-zinc-800 bg-black rounded p-2.5 text-xs text-white outline-none focus:border-zinc-500 font-mono">
                    {[...Array(10).keys()].map(n => (
                      <option key={n + 1} value={n + 1}>{n + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">PARCHES</label>
                <select value={parche} onChange={(e) => setParche(e.target.value)} className="w-full border border-zinc-800 bg-black rounded p-2.5 text-xs text-white outline-none focus:border-zinc-500">
                  <option value="Sin Parches">NINGUNO</option>
                  <option value="Copa/Liga Correspondiente">SÍ, ASIGNAR CORRESPONDIENTE</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">NOMBRE Y NÚMERO (OPCIONAL)</label>
                <input type="text" ref={personalizacionRef} placeholder="EJ: MBAPPÉ #9" className="w-full border border-zinc-800 bg-black rounded p-2.5 text-xs uppercase text-white outline-none focus:border-zinc-500 placeholder-zinc-700" />
              </div>
            </div>
          </div>
          <button onClick={handleAgregar} className="w-full bg-white text-black font-bold py-3 rounded-lg mt-8 hover:bg-zinc-200 active:scale-95 transition-all text-xs tracking-widest uppercase">
            CONFIRMAR PRENDA
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE 3: PANEL DE DISTRIBUCIÓN
// ==========================================
const ContenidoDistribucion = ({ carrito, totalUnidades, pedidoMinimo, eliminarDelCarrito, procesarPedido, onCloseMobile }) => (
  <div className="flex flex-col justify-between h-full text-white bg-zinc-950">
    <div>
      <div className="flex justify-between items-baseline mb-4 border-b border-zinc-900 pb-3">
        <h2 className="font-black text-sm uppercase tracking-widest text-white">DISTRIBUCIÓN</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500">MIN: {pedidoMinimo} UDS</span>
          {onCloseMobile && (
            <button onClick={onCloseMobile} className="lg:hidden text-zinc-400 hover:text-white ml-2 p-1">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 max-h-[55vh] lg:max-h-[40vh] overflow-y-auto pr-1">
        {carrito.length === 0 ? (
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest py-6 text-center">BANDEJA VACÍA</p>
        ) : (
          carrito.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-[11px] border-b border-zinc-900 pb-2">
              <div className="flex-1 pr-2">
                <p className="font-bold text-zinc-300 line-clamp-1 uppercase">{item.referencia}</p>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                  TALLA: {item.talla} • {item.personalizacion} <span className="text-white font-bold ml-1">x{item.cantidad}</span>
                </p>
              </div>
              <button onClick={() => eliminarDelCarrito(item.id)} className="text-zinc-600 hover:text-red-500 shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>

    <div className="mt-6 pt-4 border-t border-zinc-900 text-center">
      {totalUnidades < pedidoMinimo ? (
        <div className="mb-4 bg-zinc-900/50 p-3 rounded border border-zinc-900 text-[10px] text-zinc-400 font-mono uppercase tracking-wider leading-relaxed">
          🔒 BLOQUEO DE SISTEMA <br />
          <span className="text-zinc-500">Requiere {pedidoMinimo - totalUnidades} prenda(s) adicionales.</span>
        </div>
      ) : (
        <div className="mb-4 bg-emerald-950/20 p-3 rounded border border-emerald-900/40 text-[10px] text-emerald-500 font-mono uppercase tracking-wider">
          🔓 REQUISITO MÍNIMO CUMPLIDO
        </div>
      )}

      <p className="text-[9px] text-zinc-600 text-left font-mono leading-normal uppercase tracking-wider mb-4">
        📦 LOGÍSTICA DE IMPORTACIÓN: DESPACHO EST. 10 A 15 DÍAS HÁBILES SIN STOCK.
      </p>

      <button 
        onClick={procesarPedido}
        disabled={totalUnidades < pedidoMinimo}
        className={`w-full py-3 font-bold text-[10px] tracking-widest uppercase rounded transition-all border ${
          totalUnidades >= pedidoMinimo 
          ? 'bg-white text-black hover:bg-zinc-200 border-white active:scale-95' 
          : 'bg-transparent text-zinc-700 border-zinc-900 cursor-not-allowed'
        }`}
      >
        TRANSMITIR ORDEN →
      </button>
    </div>
  </div>
);

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function App() {
  const [carrito, setCarrito] = useState(() => {
    const respaldado = localStorage.getItem('directSource_cart');
    return respaldado ? JSON.parse(respaldado) : [];
  });

  const [modalProducto, setModalProducto] = useState(null); 
  const [mostrarCarritoMovil, setMostrarCarritoMovil] = useState(false); 
  
  const pedidoMinimo = 6;
  const [busqueda, setBusqueda] = useState('');
  const [lineaDiseno, setLineaDiseno] = useState('TODAS'); 
  const [versionCorte, setVersionCorte] = useState('TODAS'); 

  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 20;

  const totalUnidades = useMemo(() => {
    return carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }, [carrito]);

  useEffect(() => {
    localStorage.setItem('directSource_cart', JSON.stringify(carrito));
  }, [carrito]);

  // Función para resetear la búsqueda al tocar el logo o nombre de la marca
  const handleResetBusqueda = () => {
    setBusqueda('');
    setPaginaActual(1);
  };

  const handleCambiarLinea = (linea) => {
    setLineaDiseno(linea);
    setPaginaActual(1);
    if (linea === 'RETRO') {
      setVersionCorte('TODAS');
    }
  };

  const productosFiltrados = useMemo(() => {
    return catalogoDatos.filter(prod => {
      const coincideBusqueda = prod.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideLinea = lineaDiseno === 'TODAS' || prod.categoria?.toUpperCase() === lineaDiseno;
      const coincideCorte = versionCorte === 'TODAS' || prod.version?.toUpperCase() === versionCorte;
      return coincideBusqueda && coincideLinea && coincideCorte;
    });
  }, [busqueda, lineaDiseno, versionCorte]);

  const indiceUltimoProducto = paginaActual * productosPorPagina;
  const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indicePrimerProducto, indiceUltimoProducto);
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  const agregarAlCarrito = (nuevoItem) => {
    setCarrito((prevCarrito) => {
      const existeItem = prevCarrito.find(item => item.id === nuevoItem.id);
      if (existeItem) {
        return prevCarrito.map(item => 
          item.id === nuevoItem.id 
            ? { ...item, cantidad: item.cantidad + nuevoItem.cantidad }
            : item
        );
      }
      return [...prevCarrito, nuevoItem];
    });
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const procesarPedido = async () => {
    // 1. Doble validación de seguridad por si acaso
    if (totalUnidades < pedidoMinimo) {
      alert(`Recuerda que el pedido mínimo mayorista es de ${pedidoMinimo} unidades.`);
      return;
    }

    const webhookUrl = 'TU_WEBHOOK_URL_AQUI'; // 🚀 Reemplaza esto por tu URL de n8n cuando la tengas

    // 2. Si todavía tiene la URL de ejemplo, simulamos el flujo de éxito limpiando la UI
    if (webhookUrl === 'TU_WEBHOOK_URL_AQUI') {
      console.log("📦 PAYLOAD DETALLADO PARA N8N:", {
        fecha: new Date().toISOString(),
        total_prendas: totalUnidades,
        items: carrito
      });
      
      alert(`⚠️ ¡Botón conectado con éxito!\n\nNota técnica: El sistema procesó las ${totalUnidades} prendas correctamente.\n\nComo estás en modo prueba, el carrito se vaciará y se cerrará automáticamente para validar el flujo visual.`);
      
      // 🚀 Agregamos esto aquí para que en móvil no se quede la pantalla congelada
      setCarrito([]); // Vacía la bolsa (y por el useEffect limpia el localStorage)
      setMostrarCarritoMovil(false); // Cierra el cajón lateral flotante en celulares
      return;
    }

    // 3. Flujo HTTP Real (Se activa automáticamente apenas pegues tu enlace de n8n arriba)
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          fecha: new Date().toISOString(),
          total_prendas: totalUnidades,
          items: carrito
        })
      });

      if (response.ok) {
        alert("¡Orden transmitida con éxito! El sistema n8n ha generado la cola para tu Excel de fábrica.");
        setCarrito([]); // Limpia la bolsa
        setMostrarCarritoMovil(false); // Cierra el menú en celular
      } else {
        alert("Fábrica respondió con un error. Por favor, intenta transmitir de nuevo.");
      }
    } catch (error) {
      console.error("Error de red en n8n:", error);
      alert("Hubo un problema de conexión con el servidor de automatización. Revisa tu consola.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-zinc-800">
      
      {/* HEADER CON BOTÓN DE RESET INTELIGENTE */}
      <header className="border-b border-zinc-900 bg-black p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div 
          onClick={handleResetBusqueda} 
          className="cursor-pointer select-none group"
        >
          {/* Al pasar el mouse hace un sutil efecto de color para que el user note que es interactivo */}
          <h1 className="font-black text-xl tracking-widest text-white group-hover:text-zinc-300 transition-colors">
            DIRECT SOURCE
          </h1>
          <p className="text-[9px] text-zinc-500 font-mono tracking-widest mt-0.5 group-hover:text-zinc-400 transition-colors">
            WHOLESALE SUPPLY
          </p>
        </div>
        
        <button 
          onClick={() => setMostrarCarritoMovil(true)}
          className="border border-zinc-800 px-4 py-2 font-mono text-xs tracking-widest rounded bg-zinc-950 active:scale-95 transition-transform"
        >
          BOLSA [{totalUnidades}]
        </button>
      </header>

      {/* CUERPO CENTRAL */}
      <main className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* COLUMNA PRINCIPAL */}
        <div className="flex-1">
          
          <div className="mb-8">
            <input 
              type="text"
              placeholder="INGRESA REFERENCIA O EQUIPO..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
              className="w-full bg-transparent text-white font-bold text-lg md:text-xl border-b border-zinc-800 pb-3 outline-none focus:border-zinc-500 placeholder-zinc-700 uppercase tracking-wide"
            />
          </div>

          <div className="flex flex-wrap gap-8 mb-8 text-[10px] font-bold tracking-widest">
            <div>
              <p className="text-zinc-500 font-mono mb-2 uppercase">LÍNEA DE DISEÑO</p>
              <div className="flex bg-zinc-950 border border-zinc-900 p-1 rounded gap-1">
                {['TODAS', 'ACTUAL', 'RETRO'].map(l => (
                  <button 
                    key={l}
                    onClick={() => handleCambiarLinea(l)}
                    className={`px-4 py-2 transition-all rounded ${lineaDiseno === l ? 'bg-white text-black font-black' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className={lineaDiseno === 'RETRO' ? 'opacity-25 pointer-events-none transition-opacity' : 'transition-opacity'}>
              <p className="text-zinc-500 font-mono mb-2 uppercase">
                VERSIÓN DE CORTE {lineaDiseno === 'RETRO' && <span className="text-zinc-600 text-[9px]">(NO APLICA EN RETROS)</span>}
              </p>
              <div className="flex bg-zinc-950 border border-zinc-900 p-1 rounded gap-1">
                {['TODAS', 'JUGADOR', 'FANÁTICO'].map(v => (
                  <button 
                    key={v}
                    onClick={() => { setVersionCorte(v); setPaginaActual(1); }}
                    disabled={lineaDiseno === 'RETRO'}
                    className={`px-4 py-2 transition-all rounded ${versionCorte === v ? 'bg-white text-black font-black' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {productosPaginados.length === 0 ? (
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest my-12">No hay referencias en este cuadrante.</p>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {productosPaginados.map((producto) => (
                  <ProductoCard key={producto.id} producto={producto} onAbrirModal={setModalProducto} />
                ))}
              </div>

              {/* PAGINACIÓN */}
              {totalPaginas > 1 && (
                <div className="mt-12 flex justify-center items-center gap-6 border-t border-zinc-900 pt-6 text-xs font-mono">
                  <button 
                    onClick={() => { setPaginaActual(prev => Math.max(prev - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={paginaActual === 1}
                    className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 disabled:opacity-30 tracking-widest hover:text-white rounded"
                  >
                    PREV
                  </button>
                  <span className="text-zinc-500 tracking-widest uppercase text-[11px]">
                    PÁGINA {paginaActual} DE {totalPaginas}
                  </span>
                  <button 
                    onClick={() => { setPaginaActual(prev => Math.min(prev + 1, totalPaginas)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={paginaActual === totalPaginas}
                    className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 disabled:opacity-30 tracking-widest hover:text-white rounded"
                  >
                    NEXT
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* VISTA ESCRITORIO */}
        <div className="hidden lg:block w-64 shrink-0 border border-zinc-900 bg-zinc-950 p-5 rounded-lg h-[fit-content] sticky top-28">
          <ContenidoDistribucion 
            carrito={carrito}
            totalUnidades={totalUnidades}
            pedidoMinimo={pedidoMinimo}
            eliminarDelCarrito={eliminarDelCarrito}
            procesarPedido={procesarPedido}
          />
        </div>
      </main>

      {/* VISTA MÓVIL */}
      {mostrarCarritoMovil && (
        <div className="fixed inset-0 bg-black/80 z-50 lg:hidden flex justify-end backdrop-blur-sm">
          <div className="bg-zinc-950 w-full max-w-sm h-full p-6 border-l border-zinc-900 flex flex-col justify-between shadow-2xl">
            <ContenidoDistribucion 
              carrito={carrito}
              totalUnidades={totalUnidades}
              pedidoMinimo={pedidoMinimo}
              eliminarDelCarrito={eliminarDelCarrito}
              procesarPedido={procesarPedido}
              onCloseMobile={() => setMostrarCarritoMovil(false)}
            />
          </div>
        </div>
      )}

      {modalProducto && (
        <ModalCamiseta 
          producto={modalProducto} 
          onClose={() => setModalProducto(null)} 
          onAgregar={agregarAlCarrito} 
        />
      )}
    </div>
  );
}