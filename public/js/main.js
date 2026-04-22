document.addEventListener("DOMContentLoaded", () => {
    
    const lista = document.getElementById("lista-contactos");
    const btnCargar = document.getElementById("btnCargarContactos");
    const btnAgregar = document.getElementById("btnAgregarContacto");

    let mostrandoSoloFavoritos = false;

    // --- 1. RENDERIZAR LISTA (CON FILTRADO FLEXIBLE) ---
    const renderizarContactos = (soloFavoritos = false) => {
        mostrandoSoloFavoritos = soloFavoritos;

        fetch("/api/contactos")
            .then(res => res.json())
            .then(data => {
                lista.innerHTML = "";
                
                // FILTRADO FLEXIBLE: 
                // Acepta true (booleano), "true" (string), "True" (capitalizado) o 1 (número)
                const contactosAMostrar = soloFavoritos 
                    ? data.filter(c => String(c.favorito).toLowerCase() === "true" || c.favorito === 1) 
                    : data;

                if (contactosAMostrar.length === 0) {
                    const mensaje = soloFavoritos ? "No hay favoritos guardados" : "Sin contactos guardados";
                    lista.innerHTML = `<p class="text-center text-secondary small fade-in mt-3">${mensaje}</p>`;
                    return;
                }

                contactosAMostrar.forEach(c => {
                    const li = document.createElement("li");
                    li.className = "list-group-item d-flex justify-content-between align-items-center py-3 fade-in";
                    
                    // Verificamos si es favorito para el estilo
                    const esFavorito = String(c.favorito).toLowerCase() === "true" || c.favorito === 1;
                    const bordeStyle = esFavorito ? "border: 1px solid #0dcaf0 !important;" : "border: 1px solid #333 !important;";
                    
                    li.style.cssText = `background: #000 !important; color: #fff !important; margin-bottom: 8px; border-radius: 12px !important; ${bordeStyle}`;
                    
                    li.innerHTML = `
                        <div style="line-height: 1.3;">
                            <div class="fw-bold text-info small text-uppercase" style="letter-spacing: 0.5px;">
                                ${c.nombre} ${esFavorito ? '⭐' : ''}
                            </div>
                            <div class="text-white-50" style="font-size: 0.8rem;">📱 ${c.celular}</div>
                            <div class="text-muted" style="font-size: 0.7rem;">📧 ${c.correo || '---'}</div>
                        </div>
                        <button class="btn-borrar" data-id="${c.id}" title="Eliminar" style="background:transparent; border:none; color:#ff4d4d; font-size:1.5rem; line-height:1;">&times;</button>
                    `;
                    lista.appendChild(li);
                });
            })
            .catch(err => console.error("Error al cargar:", err));
    };

    // --- 2. BOTÓN DE FILTRADO ---
    if (btnCargar) {
        btnCargar.onclick = (e) => {
            e.preventDefault();
            const activarFiltro = !mostrandoSoloFavoritos;
            
            if (activarFiltro) {
                renderizarContactos(true);
                btnCargar.innerText = "VER TODOS";
                btnCargar.classList.replace("btn-outline-secondary", "btn-cyan"); 
            } else {
                renderizarContactos(false);
                btnCargar.innerText = "VER FAVORITOS";
                btnCargar.classList.replace("btn-cyan", "btn-outline-secondary");
            }
        };
    }

    // --- 3. CREAR CONTACTO ---
    if (btnAgregar) {
        btnAgregar.onclick = () => {
            const nombre = document.getElementById("nuevoNombre").value.trim();
            const celular = document.getElementById("nuevoCelular").value.trim();
            const correo = document.getElementById("nuevoCorreo").value.trim();
            const checkboxFav = document.getElementById("esFavorito");
            const esFav = checkboxFav ? checkboxFav.checked : false;

            if (!nombre || !celular) {
                alert("Ingresa nombre y celular.");
                return;
            }

            fetch("/api/contactos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, celular, correo, favorito: esFav })
            })
            .then(res => res.json())
            .then(() => {
                document.getElementById("nuevoNombre").value = "";
                document.getElementById("nuevoCelular").value = "";
                document.getElementById("nuevoCorreo").value = "";
                if(checkboxFav) checkboxFav.checked = false;
                
                // Mantenemos la vista actual (si estaba viendo favoritos, se queda ahí)
                renderizarContactos(mostrandoSoloFavoritos);
            })
            .catch(err => console.error("Error al guardar:", err));
        };
    }

    // --- 4. DELEGACIÓN DE EVENTOS ---
    document.addEventListener("click", (e) => {
        const t = e.target;

        // ELIMINAR
        if (t.classList.contains("btn-borrar")) {
            const id = t.getAttribute("data-id");
            if (confirm("¿Eliminar este contacto?")) {
                fetch(`/api/contactos/${id}`, { method: "DELETE" })
                    .then(() => renderizarContactos(mostrandoSoloFavoritos));
            }
        }

        // LIKES
        const btnLike = t.closest(".btn-like");
        if (btnLike) {
            const id = btnLike.getAttribute("data-id");
            const countSpan = document.getElementById(`count-${id}`);
            if (countSpan) {
                countSpan.innerText = parseInt(countSpan.innerText) + 1;
                btnLike.style.transform = "scale(1.2)";
                setTimeout(() => btnLike.style.transform = "scale(1)", 200);
            }
        }

        // GALERÍA
        if (t.classList.contains("img-album")) {
            const contenedor = t.closest(".album-container");
            const fotos = Array.from(contenedor.querySelectorAll(".img-album"));
            const itemsCont = document.getElementById("carousel-items-container");
            if (!itemsCont) return;

            itemsCont.innerHTML = "";
            fotos.forEach(f => {
                const active = f.src === t.src ? "active" : "";
                const div = document.createElement("div");
                div.className = `carousel-item ${active}`;
                div.innerHTML = `<img src="${f.src}" class="d-block w-100">`;
                itemsCont.appendChild(div);
            });
            new bootstrap.Modal(document.getElementById('fotoModal')).show();
        }
    });

    renderizarContactos(false);
});