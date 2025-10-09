(function(){
    // Detecta si el back está en mismo origen
    const SAME_ORIGIN_BACK = location.port === "4000";
    const API_BASE = SAME_ORIGIN_BACK ? "" : "http://localhost:4000";

    // Estilos mínimos (puedes moverlos a tu CSS)
    const style = document.createElement("style");
    style.textContent = `
  .ci-chat-launcher {
    position: fixed; right: 18px; bottom: 18px;
    width: 56px; height: 56px; border-radius: 50%;
    background: linear-gradient(135deg,#0b1b26,#0f2230);
    border: 1px solid var(--line,#1f2a35); color: #eaeef2;
    display:flex; align-items:center; justify-content:center;
    box-shadow: 0 10px 24px rgba(0,0,0,.35); cursor: pointer; z-index: 9999;
  }
  .ci-chat-panel {
    position: fixed; right: 18px; bottom: 86px; width: 340px; max-width: calc(100vw - 36px);
    background: #0b141a; color:#eaeef2; border:1px solid #1f2a35; border-radius: 14px;
    box-shadow: 0 18px 32px rgba(0,0,0,.45); overflow: hidden; display: none; z-index: 9999;
  }
  .ci-chat-header { padding: 12px 14px; background: #0f2230; border-bottom: 1px solid #1f2a35; font-weight: 600; display:flex; align-items:center; gap:8px;}
  .ci-dot { width:8px; height:8px; background:#25d366; border-radius:999px; box-shadow:0 0 0 3px rgba(37,211,102,.15); }
  .ci-chat-body { height: 320px; overflow:auto; padding: 12px; display:flex; flex-direction:column; gap:8px;}
  .ci-bubble { padding:10px 12px; border-radius: 12px; max-width: 85%; line-height: 1.35; }
  .ci-bubble.user { background:#11202b; align-self:flex-end; }
  .ci-bubble.bot { background:#0e1720; border:1px solid #1f2a35; }
  .ci-chat-footer { display:flex; gap:6px; padding:10px; border-top:1px solid #1f2a35; background:#0b141a;}
  .ci-chat-input { flex:1; background:#0e1720; color:#eaeef2; border:1px solid #223445; border-radius:10px; padding:10px; outline:none; }
  .ci-chat-send { background:#153349; border:1px solid #21435a; color:#eaeef2; border-radius:10px; padding:10px 12px; cursor:pointer; }
  `;
    document.head.appendChild(style);

    // Launcher
    const launcher = document.createElement("button");
    launcher.className = "ci-chat-launcher";
    launcher.title = "Pregúntanos";
    launcher.innerHTML = "💬";
    document.body.appendChild(launcher);

    // Panel
    const panel = document.createElement("div");
    panel.className = "ci-chat-panel";
    panel.innerHTML = `
    <div class="ci-chat-header"><span class="ci-dot"></span> Asistente — CyberIntegrity</div>
    <div class="ci-chat-body" id="ci-chat-body"></div>
    <div class="ci-chat-footer">
      <input id="ci-chat-input" class="ci-chat-input" placeholder="Escribe tu pregunta..." />
      <button id="ci-chat-send" class="ci-chat-send">Enviar</button>
    </div>
  `;
    document.body.appendChild(panel);

    const body = panel.querySelector("#ci-chat-body");
    const input = panel.querySelector("#ci-chat-input");
    const sendBtn = panel.querySelector("#ci-chat-send");

    function appendBubble(text, who="bot") {
        const div = document.createElement("div");
        div.className = `ci-bubble ${who}`;
        div.innerHTML = text.replace(/\n/g, "<br>");
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    function hello() {
        appendBubble("¡Hola! Puedo ayudarte con nuestros servicios, alcances y contacto. Pregunta por ejemplo: <br>• ¿Qué servicios ofrecen?<br>• ¿Realizan implementación?<br>• ¿Cómo los contacto?");
    }

    async function ask(text) {
        appendBubble(text, "user");
        try {
            const r = await fetch(API_BASE + "/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data?.error || "Error");
            appendBubble(data.reply || "No tengo información sobre eso, ¿puedes reformular?");
        } catch (e) {
            console.error(e);
            appendBubble("No pude consultar ahora. Intenta de nuevo en unos segundos.");
        }
    }

    launcher.addEventListener("click", () => {
        const visible = panel.style.display === "block";
        panel.style.display = visible ? "none" : "block";
        if (!visible && body.childElementCount === 0) hello();
    });

    sendBtn.addEventListener("click", () => {
        const v = (input.value || "").trim();
        if (!v) return;
        input.value = "";
        ask(v);
    });
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            sendBtn.click();
        }
    });
})();
