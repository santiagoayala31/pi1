// assets/js/main.js
(function () {
    // Detecta si el front se sirve desde el mismo host del backend.
    // - Si estás en http://localhost:4000 -> API_BASE = "" (misma origin)
    // - Si estás en http://localhost:63342/... (WebStorm) -> usa http://localhost:4000
    const SAME_ORIGIN_BACK = location.port === "4000";
    const API_BASE = SAME_ORIGIN_BACK ? "" : "http://localhost:4000";

    async function fetchJSON(url) {
        const r = await fetch(API_BASE + url);
        if (!r.ok) throw new Error(`Error ${r.status} al obtener ${url}`);
        return await r.json();
    }

    function el(html) {
        const t = document.createElement("template");
        t.innerHTML = html.trim();
        return t.content.firstElementChild;
    }

    // ---------- SERVICIOS ----------
    async function loadServices() {
        const container = document.getElementById("services-grid");
        if (!container) return;

        container.innerHTML = `<div class="muted">Cargando servicios…</div>`;
        try {
            const services = await fetchJSON("/api/services");

            // Mapeo simple servicio -> ícono (puedes cambiarlos por imágenes <img> si quieres).
            const icons = {
                monitoreo: "📡",
                incidentes: "🚨",
                auditoria: "🛡️",
                capacitacion: "🎓",
                accesos: "🔐",
                infra: "🧰",
                respaldo: "💾",
            };

            container.innerHTML = "";
            services.forEach((s) => {
                const i = icons[s.id] || "🧩";
                const tags = (s.tags || [])
                    .map((t) => `<span class="chip">${t}</span>`)
                    .join(" ");
                const card = el(`
          <article class="card service-item">
            <div class="service-hero">
              <div class="badge-icon">${i}</div>
            </div>
            <div class="service-body">
              <h3 class="h3">${s.titulo}</h3>
              <p class="muted">${s.descripcion}</p>
              <div class="tags">${tags}</div>
            </div>
          </article>
        `);
                container.appendChild(card);
            });
        } catch (err) {
            console.error(err);
            container.innerHTML = `<div class="error">No se pudieron cargar los servicios.</div>`;
        }
    }

    // ---------- PROYECTOS ----------
    async function loadProjects() {
        const container = document.getElementById("projects-timeline");
        if (!container) return;

        container.innerHTML = `<div class="muted">Cargando proyectos…</div>`;
        try {
            const projects = await fetchJSON("/api/projects");
            container.innerHTML = "";

            projects.forEach((p) => {
                const kpis = (p.kpis || []).map((k) => `<span class="chip">${k}</span>`).join(" ");
                const entregables = (p.entregables || []).map((e) => `<li>${e}</li>`).join("");

                const node = el(`
          <section class="event">
            <div class="event-dot"></div>
            <div class="event-card card">
              <h3 class="h3">${p.titulo}</h3>
              <p class="muted">${p.resumen}</p>
              <div class="tags">${kpis}</div>
              <div class="muted" style="margin-top:8px;font-size:12px">Entregables</div>
              <ul class="clean">${entregables}</ul>
            </div>
          </section>
        `);
                container.appendChild(node);
            });
        } catch (err) {
            console.error(err);
            container.innerHTML = `<div class="error">No se pudieron cargar los proyectos.</div>`;
        }
    }

    // ---------- CONTACTO (si NO usas el script inline) ----------
    function wireContactForm() {
        const btn = document.getElementById("btn-enviar");
        const nombre = document.getElementById("ci-nombre");
        const correo = document.getElementById("ci-correo");
        const departamento = document.getElementById("ci-departamento");
        const asunto = document.getElementById("ci-asunto");
        const mensaje = document.getElementById("ci-mensaje");
        if (!btn || !nombre || !correo || !departamento || !asunto || !mensaje) return;

        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            const payload = {
                nombre: nombre.value.trim(),
                correo: correo.value.trim(),
                departamento: departamento.value,
                asunto: asunto.value.trim(),
                mensaje: mensaje.value.trim(),
            };
            if (!payload.nombre || !payload.correo || !payload.departamento || !payload.asunto || !payload.mensaje) {
                alert("Por favor completa todos los campos.");
                return;
            }
            try {
                const r = await fetch(API_BASE + "/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await r.json();
                if (!r.ok) throw new Error(data?.error || "Error al enviar");
                alert("✅ Enviado. ID: " + data.id);
                nombre.value = correo.value = asunto.value = mensaje.value = "";
                departamento.value = "";
            } catch (err) {
                console.error(err);
                alert("❌ " + err.message);
            }
        });
    }

    // Init por página
    document.addEventListener("DOMContentLoaded", () => {
        loadServices();
        loadProjects();
        wireContactForm();
    });
})();
