(function () {
  "use strict";

  // ─── Config ───
  const SCRIPT = document.currentScript || document.querySelector('script[src*="widget.js"]');
  const PARAMS = new URL(SCRIPT.src).searchParams;
  const BOT_ID = PARAMS.get("id");
  const API_BASE = SCRIPT.src.split("/widget.js")[0];

  if (!BOT_ID) {
    console.error("[DigiMe] Missing chatbot id. Use: <script src=\"widget.js?id=YOUR_ID\"></script>");
    return;
  }

  // ─── State ───
  let config = null;
  let conversationId = null;
  let visitorId = localStorage.getItem("digime_visitor") || crypto.randomUUID();
  localStorage.setItem("digime_visitor", visitorId);
  let isOpen = false;
  let isTyping = false;
  let messages = [];

  // ─── Fonts ───
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap";
  document.head.appendChild(fontLink);

  // ─── Styles ───
  const style = document.createElement("style");
  style.textContent = `
    #digime-widget *,#digime-widget *::before,#digime-widget *::after{box-sizing:border-box;margin:0;padding:0}
    #digime-widget{
      --dm-accent:${getAccent()};
      --dm-accent-light:${getAccent()}18;
      --dm-bg:#FFFFFF;
      --dm-surface:#F7F7F5;
      --dm-ink:#1A1A1A;
      --dm-ink-muted:#6B6B6B;
      --dm-ink-faint:#A0A0A0;
      --dm-border:#EAEAE8;
      --dm-radius:16px;
      --dm-font:'DM Sans',system-ui,-apple-system,sans-serif;
      position:fixed;bottom:20px;right:20px;z-index:2147483647;font-family:var(--dm-font);
    }

    /* ─── Fab ─── */
    .dm-fab{
      width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;
      background:var(--dm-accent);color:#fff;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 24px rgba(0,0,0,.15),0 1px 4px rgba(0,0,0,.08);
      transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s;
    }
    .dm-fab:hover{transform:scale(1.08);box-shadow:0 6px 32px rgba(0,0,0,.2)}
    .dm-fab:active{transform:scale(.96)}
    .dm-fab svg{width:24px;height:24px;transition:transform .3s}
    .dm-fab.open svg{transform:rotate(90deg)}

    /* ─── Unread Badge ─── */
    .dm-unread{
      position:absolute;top:-2px;right:-2px;width:18px;height:18px;
      border-radius:50%;background:#DC2626;color:#fff;font-size:10px;font-weight:700;
      display:none;align-items:center;justify-content:center;border:2px solid #fff;
    }

    /* ─── Chat Window ─── */
    .dm-window{
      position:absolute;bottom:72px;right:0;width:380px;max-height:560px;
      background:var(--dm-bg);border-radius:var(--dm-radius);
      box-shadow:0 12px 48px rgba(0,0,0,.12),0 2px 8px rgba(0,0,0,.06);
      border:1px solid var(--dm-border);
      display:flex;flex-direction:column;overflow:hidden;
      opacity:0;transform:translateY(12px) scale(.96);pointer-events:none;
      transition:opacity .25s,transform .25s cubic-bezier(.34,1.56,.64,1);
    }
    .dm-window.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all}

    /* ─── Header ─── */
    .dm-header{
      padding:16px 18px;border-bottom:1px solid var(--dm-border);
      display:flex;align-items:center;gap:12px;
      background:var(--dm-bg);
    }
    .dm-avatar{
      width:36px;height:36px;border-radius:50%;
      background:var(--dm-accent);color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;font-weight:700;flex-shrink:0;
    }
    .dm-header-text h3{font-size:14px;font-weight:600;color:var(--dm-ink);line-height:1.2}
    .dm-header-text p{font-size:11px;color:var(--dm-ink-faint);margin-top:1px}
    .dm-close{
      margin-left:auto;background:none;border:none;cursor:pointer;
      color:var(--dm-ink-faint);padding:4px;border-radius:6px;
      display:flex;align-items:center;justify-content:center;
    }
    .dm-close:hover{background:var(--dm-surface);color:var(--dm-ink)}

    /* ─── Messages ─── */
    .dm-messages{
      flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;
      min-height:280px;max-height:380px;
      scrollbar-width:thin;scrollbar-color:var(--dm-border) transparent;
    }
    .dm-messages::-webkit-scrollbar{width:4px}
    .dm-messages::-webkit-scrollbar-thumb{background:var(--dm-border);border-radius:4px}

    .dm-msg{max-width:82%;padding:10px 14px;border-radius:14px;font-size:13.5px;line-height:1.55;word-wrap:break-word}
    .dm-msg.user{
      align-self:flex-end;background:var(--dm-accent);color:#fff;
      border-bottom-right-radius:4px;
    }
    .dm-msg.bot{
      align-self:flex-start;background:var(--dm-surface);color:var(--dm-ink);
      border-bottom-left-radius:4px;
    }

    /* ─── Typing Indicator ─── */
    .dm-typing{
      align-self:flex-start;background:var(--dm-surface);border-radius:14px;
      padding:12px 16px;display:none;gap:4px;align-items:center;
      border-bottom-left-radius:4px;
    }
    .dm-typing.show{display:flex}
    .dm-dot{
      width:6px;height:6px;border-radius:50%;background:var(--dm-ink-faint);
      animation:dm-bounce .6s infinite alternate;
    }
    .dm-dot:nth-child(2){animation-delay:.15s}
    .dm-dot:nth-child(3){animation-delay:.3s}
    @keyframes dm-bounce{to{opacity:.3;transform:translateY(-4px)}}

    /* ─── Project Card ─── */
    .dm-card{
      align-self:flex-start;max-width:88%;border-radius:12px;overflow:hidden;
      border:1px solid var(--dm-border);background:var(--dm-bg);
    }
    .dm-card-img{width:100%;height:140px;object-fit:cover;display:block}
    .dm-card-body{padding:12px 14px}
    .dm-card-title{font-size:13px;font-weight:600;color:var(--dm-ink);margin-bottom:3px}
    .dm-card-desc{font-size:12px;color:var(--dm-ink-muted);line-height:1.45;
      display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .dm-card-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
    .dm-card-tag{
      font-size:10px;font-weight:500;padding:2px 8px;border-radius:20px;
      background:var(--dm-accent-light);color:var(--dm-accent);
    }
    .dm-card-link{
      display:block;padding:8px 14px;border-top:1px solid var(--dm-border);
      font-size:11px;font-weight:500;color:var(--dm-accent);text-decoration:none;
      text-align:center;
    }
    .dm-card-link:hover{background:var(--dm-accent-light)}

    /* ─── Link Card ─── */
    .dm-link-card{
      align-self:flex-start;display:flex;align-items:center;gap:10px;
      padding:10px 14px;border-radius:12px;border:1px solid var(--dm-border);
      background:var(--dm-bg);text-decoration:none;max-width:82%;
      transition:border-color .15s;
    }
    .dm-link-card:hover{border-color:var(--dm-accent)}
    .dm-link-icon{
      width:32px;height:32px;border-radius:8px;background:var(--dm-accent-light);
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
      font-size:14px;
    }
    .dm-link-label{font-size:12px;font-weight:500;color:var(--dm-ink)}
    .dm-link-url{font-size:11px;color:var(--dm-ink-faint);margin-top:1px;
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px}

    /* ─── Suggestions ─── */
    .dm-suggestions{
      display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 12px;
    }
    .dm-suggestion{
      font-size:12px;font-weight:500;padding:6px 12px;border-radius:20px;
      border:1px solid var(--dm-border);background:var(--dm-bg);color:var(--dm-ink-muted);
      cursor:pointer;transition:all .15s;white-space:nowrap;
    }
    .dm-suggestion:hover{border-color:var(--dm-accent);color:var(--dm-accent);background:var(--dm-accent-light)}

    /* ─── Input ─── */
    .dm-input-area{
      padding:12px 14px;border-top:1px solid var(--dm-border);
      display:flex;gap:8px;align-items:flex-end;background:var(--dm-bg);
    }
    .dm-input{
      flex:1;border:1px solid var(--dm-border);border-radius:12px;
      padding:10px 14px;font-size:13.5px;font-family:var(--dm-font);
      color:var(--dm-ink);background:var(--dm-surface);
      outline:none;resize:none;max-height:80px;min-height:40px;line-height:1.4;
      transition:border-color .15s;
    }
    .dm-input:focus{border-color:var(--dm-accent)}
    .dm-input::placeholder{color:var(--dm-ink-faint)}
    .dm-send{
      width:36px;height:36px;border-radius:10px;border:none;cursor:pointer;
      background:var(--dm-accent);color:#fff;
      display:flex;align-items:center;justify-content:center;
      flex-shrink:0;transition:opacity .15s,transform .1s;
    }
    .dm-send:hover{opacity:.9}
    .dm-send:active{transform:scale(.92)}
    .dm-send:disabled{opacity:.4;cursor:default}
    .dm-send svg{width:16px;height:16px}

    /* ─── Branding ─── */
    .dm-branding{
      text-align:center;padding:6px;font-size:10px;color:var(--dm-ink-faint);
      border-top:1px solid var(--dm-border);
    }
    .dm-branding a{color:var(--dm-accent);text-decoration:none;font-weight:600}
    .dm-branding a:hover{text-decoration:underline}

    /* ─── Mobile ─── */
    @media(max-width:480px){
      #digime-widget{bottom:12px;right:12px;left:12px}
      .dm-window{width:auto;left:0;right:0;bottom:68px;max-height:70vh}
    }
  `;
  document.head.appendChild(style);

  function getAccent() {
    return config?.accent_color || "#E8571A";
  }

  // ─── SVG Icons ───
  const ICONS = {
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
  };

  const PLATFORM_EMOJI = {
    linkedin: "💼", github: "🐙", twitter: "🐦", instagram: "📸",
    behance: "🎨", dribbble: "🏀", email: "✉️", website: "🌐",
    youtube: "📺", medium: "📝", figma: "🎯", default: "🔗",
  };

  // ─── Build DOM ───
  const root = document.createElement("div");
  root.id = "digime-widget";
  root.innerHTML = `
    <div class="dm-window" id="dm-window">
      <div class="dm-header">
        <div class="dm-avatar" id="dm-avatar"></div>
        <div class="dm-header-text">
          <h3 id="dm-name">Loading...</h3>
          <p>AI Assistant</p>
        </div>
        <button class="dm-close" id="dm-close-btn">${ICONS.close}</button>
      </div>
      <div class="dm-messages" id="dm-messages">
        <div class="dm-typing" id="dm-typing">
          <div class="dm-dot"></div><div class="dm-dot"></div><div class="dm-dot"></div>
        </div>
      </div>
      <div class="dm-suggestions" id="dm-suggestions"></div>
      <div class="dm-input-area">
        <textarea class="dm-input" id="dm-input" placeholder="Type a message..." rows="1"></textarea>
        <button class="dm-send" id="dm-send-btn" disabled>${ICONS.send}</button>
      </div>
      <div class="dm-branding" id="dm-branding">
        Powered by <a href="https://digime.app" target="_blank">DigiMe</a>
      </div>
    </div>
    <div style="position:relative">
      <button class="dm-fab" id="dm-fab">${ICONS.chat}</button>
      <div class="dm-unread" id="dm-unread">1</div>
    </div>
  `;
  document.body.appendChild(root);

  // ─── DOM Refs ───
  const fab = document.getElementById("dm-fab");
  const win = document.getElementById("dm-window");
  const closeBtn = document.getElementById("dm-close-btn");
  const messagesEl = document.getElementById("dm-messages");
  const typingEl = document.getElementById("dm-typing");
  const suggestionsEl = document.getElementById("dm-suggestions");
  const inputEl = document.getElementById("dm-input");
  const sendBtn = document.getElementById("dm-send-btn");
  const brandingEl = document.getElementById("dm-branding");
  const avatarEl = document.getElementById("dm-avatar");
  const nameEl = document.getElementById("dm-name");
  const unreadEl = document.getElementById("dm-unread");

  // ─── Toggle ───
  fab.addEventListener("click", () => {
    isOpen = !isOpen;
    win.classList.toggle("open", isOpen);
    fab.classList.toggle("open", isOpen);
    fab.innerHTML = isOpen ? ICONS.close : ICONS.chat;
    if (isOpen) {
      unreadEl.style.display = "none";
      inputEl.focus();
      scrollToBottom();
    }
  });

  closeBtn.addEventListener("click", () => {
    isOpen = false;
    win.classList.remove("open");
    fab.classList.remove("open");
    fab.innerHTML = ICONS.chat;
  });

  // ─── Input ───
  inputEl.addEventListener("input", () => {
    sendBtn.disabled = !inputEl.value.trim();
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + "px";
  });

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);

  // ─── Send Message ───
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isTyping) return;

    // Hide suggestions after first message
    suggestionsEl.style.display = "none";

    // Add user message
    appendMessage("user", text);
    inputEl.value = "";
    inputEl.style.height = "auto";
    sendBtn.disabled = true;

    // Show typing
    isTyping = true;
    typingEl.classList.add("show");
    scrollToBottom();

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatbot_id: BOT_ID,
          visitor_id: visitorId,
          message: text,
          conversation_id: conversationId,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      conversationId = data.conversation_id;
      processResponse(data.response);
    } catch (err) {
      console.error("[DigiMe] Chat error:", err);
      appendMessage("bot", "Sorry, I'm having trouble connecting. Please try again in a moment.");
    } finally {
      isTyping = false;
      typingEl.classList.remove("show");
      scrollToBottom();
    }
  }

  // ─── Process AI Response ───
  function processResponse(text) {
    // Extract cards from response
    const cardRegex = /```card\n([\s\S]*?)```/g;
    const bookingRegex = /```booking\n([\s\S]*?)```/g;
    let cleanText = text;
    const cards = [];

    let match;
    while ((match = cardRegex.exec(text)) !== null) {
      try {
        cards.push(JSON.parse(match[1].trim()));
        cleanText = cleanText.replace(match[0], "").trim();
      } catch (e) { /* ignore malformed cards */ }
    }

    // Remove booking blocks from display
    cleanText = cleanText.replace(bookingRegex, "").trim();

    // Add text message if any remains
    if (cleanText) {
      appendMessage("bot", cleanText);
    }

    // Render cards
    for (const card of cards) {
      if (card.type === "project") renderProjectCard(card);
      else if (card.type === "link") renderLinkCard(card);
    }
  }

  // ─── Render Messages ───
  function appendMessage(role, content) {
    const msg = document.createElement("div");
    msg.className = `dm-msg ${role}`;
    msg.textContent = content;
    messagesEl.insertBefore(msg, typingEl);
    messages.push({ role, content });
    scrollToBottom();
  }

  function renderProjectCard(card) {
    const el = document.createElement("div");
    el.className = "dm-card";
    let html = "";
    if (card.image_url) {
      html += `<img class="dm-card-img" src="${escapeHtml(card.image_url)}" alt="${escapeHtml(card.name)}" onerror="this.style.display='none'"/>`;
    }
    html += `<div class="dm-card-body">`;
    html += `<div class="dm-card-title">${escapeHtml(card.name)}</div>`;
    if (card.description) html += `<div class="dm-card-desc">${escapeHtml(card.description)}</div>`;
    if (card.tags?.length) {
      html += `<div class="dm-card-tags">${card.tags.map(t => `<span class="dm-card-tag">${escapeHtml(t)}</span>`).join("")}</div>`;
    }
    html += `</div>`;
    if (card.link) {
      html += `<a class="dm-card-link" href="${escapeHtml(card.link)}" target="_blank" rel="noopener">View Project →</a>`;
    }
    el.innerHTML = html;
    messagesEl.insertBefore(el, typingEl);
    scrollToBottom();
  }

  function renderLinkCard(card) {
    const platform = (card.platform || "").toLowerCase();
    const emoji = PLATFORM_EMOJI[platform] || PLATFORM_EMOJI.default;
    const el = document.createElement("a");
    el.className = "dm-link-card";
    el.href = card.url;
    el.target = "_blank";
    el.rel = "noopener";
    el.innerHTML = `
      <div class="dm-link-icon">${emoji}</div>
      <div>
        <div class="dm-link-label">${escapeHtml(card.platform || "Link")}</div>
        <div class="dm-link-url">${escapeHtml(card.handle || card.url)}</div>
      </div>
    `;
    messagesEl.insertBefore(el, typingEl);
    scrollToBottom();
  }

  // ─── Suggestions ───
  function renderSuggestions(questions) {
    suggestionsEl.innerHTML = "";
    if (!questions?.length) return;
    for (const q of questions) {
      const btn = document.createElement("button");
      btn.className = "dm-suggestion";
      btn.textContent = q;
      btn.addEventListener("click", () => {
        inputEl.value = q;
        sendMessage();
      });
      suggestionsEl.appendChild(btn);
    }
  }

  // ─── Utilities ───
  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function getTimeGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }

  // ─── Update Theme ───
  function updateTheme() {
    if (!config) return;
    root.style.setProperty("--dm-accent", config.accent_color || "#E8571A");
    root.style.setProperty("--dm-accent-light", (config.accent_color || "#E8571A") + "18");
  }

  // ─── Init ───
  async function init() {
    try {
      const res = await fetch(`${API_BASE}/api/chatbot?id=${BOT_ID}`);
      if (!res.ok) throw new Error("Chatbot not found");
      config = await res.json();

      // Update UI
      updateTheme();
      nameEl.textContent = config.name || "AI Assistant";
      avatarEl.textContent = (config.name || "A")[0].toUpperCase();

      // Branding
      if (!config.features?.show_branding) {
        brandingEl.style.display = "none";
      }

      // Greeting
      const greeting = config.greeting || `${getTimeGreeting()}! How can I help you?`;
      appendMessage("bot", greeting);

      // Suggestions
      renderSuggestions(config.suggested_questions);

      // Show unread indicator
      if (!isOpen) {
        unreadEl.style.display = "flex";
      }
    } catch (err) {
      console.error("[DigiMe] Failed to load chatbot config:", err);
    }
  }

  // Launch
  init();
})();
