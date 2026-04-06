(function () {
  "use strict";

  // ─── Config ───
  const SCRIPT = document.currentScript || document.querySelector('script[src*="widget.js"]');
  const PARAMS = new URL(SCRIPT.src).searchParams;
  const BOT_ID = PARAMS.get("id");
  const API_BASE = SCRIPT.src.split("/widget.js")[0].replace(/\/+$/, "");

  if (!BOT_ID) {
    console.error('[DigiMe] Missing chatbot id. Use: <script src="widget.js?id=YOUR_ID"></script>');
    return;
  }

  // ─── Iframe Escape ───
  // Framer (and similar builders) wrap Code Embed components inside sandboxed iframes.
  // position:fixed inside an iframe anchors to the iframe viewport, not the page — breaking the widget.
  // If we're inside an iframe, attempt to inject the script into the parent document instead.
  if (window.self !== window.top) {
    try {
      // Same-origin parent (custom apps, non-sandboxed iframes): inject directly
      const s = window.parent.document.createElement("script");
      s.src = SCRIPT.src;
      window.parent.document.body.appendChild(s);
    } catch (e) {
      // Cross-origin sandbox (Framer Code Embed, etc.): can't escape programmatically.
      // User must inject via Site Settings → Custom Code → End of <body> instead.
      console.warn(
        "[DigiMe] Widget is running inside a cross-origin iframe and cannot render correctly.\n" +
        "→ In Framer: go to Site Settings → Custom Code → paste the script tag at the end of <body>.\n" +
        "→ In Webflow: paste in Project Settings → Custom Code → Footer Code.\n" +
        "→ In any builder: add the script directly to the page HTML, not via an Embed component."
      );
    }
    return; // Either the parent will run the real instance, or we stop here.
  }

  // ─── State ───
  let config = null;
  let conversationId = null;
  let visitorId = localStorage.getItem("digime_visitor") || crypto.randomUUID();
  localStorage.setItem("digime_visitor", visitorId);
  let isOpen = false;
  let uiState = "welcome"; // "welcome" | "chat"
  let isTyping = false;
  let isListening = false;
  let messages = [];
  let recognition = null;

  // ─── Font ───
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap";
  document.head.appendChild(fontLink);

  // ─── Styles ───
  const style = document.createElement("style");
  style.textContent = `
    #digime-widget *,#digime-widget *::before,#digime-widget *::after{box-sizing:border-box;margin:0;padding:0}
    #digime-widget{
      --dm-accent:#111111;
      --dm-accent-light:#11111114;
      --dm-bg:#FFFFFF;
      --dm-surface:#F6F6F6;
      --dm-ink:#111111;
      --dm-ink-muted:#555555;
      --dm-ink-faint:#999999;
      --dm-border:#E8E8E8;
      --dm-radius:16px;
      --dm-font:'Satoshi',system-ui,-apple-system,sans-serif;
      position:fixed;bottom:20px;right:20px;z-index:2147483647;font-family:var(--dm-font);
    }

    /* ─── FAB ─── */
    .dm-fab{
      width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;
      background:var(--dm-accent);color:#fff;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 24px rgba(0,0,0,.18),0 1px 4px rgba(0,0,0,.1);
      transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s;
      animation:dm-fab-enter .5s cubic-bezier(.34,1.56,.64,1) both;
    }
    @keyframes dm-fab-enter{from{transform:scale(0);opacity:0}60%{transform:scale(1.15)}to{transform:scale(1);opacity:1}}
    .dm-fab:hover{transform:scale(1.08);box-shadow:0 6px 32px rgba(0,0,0,.22)}
    .dm-fab:active{transform:scale(.96)}
    .dm-fab svg{width:24px;height:24px;transition:transform .3s}

    /* ─── Unread Badge ─── */
    .dm-unread{
      position:absolute;top:-2px;right:-2px;width:18px;height:18px;
      border-radius:50%;background:#DC2626;color:#fff;font-size:10px;font-weight:700;
      display:none;align-items:center;justify-content:center;border:2px solid #fff;
      animation:dm-pulse-shadow 2s ease-in-out infinite;
    }
    @keyframes dm-pulse-shadow{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.4)}50%{box-shadow:0 0 0 8px rgba(220,38,38,0)}}

    /* ─── Window ─── */
    .dm-window{
      position:absolute;bottom:72px;right:0;width:380px;
      background:var(--dm-bg);border-radius:var(--dm-radius);
      box-shadow:0 12px 48px rgba(0,0,0,.12),0 2px 8px rgba(0,0,0,.06);
      border:1px solid var(--dm-border);
      display:flex;flex-direction:column;overflow:hidden;
      opacity:0;transform:translateY(12px) scale(.96);pointer-events:none;
      transition:opacity .25s,transform .25s cubic-bezier(.34,1.56,.64,1);
      max-height:680px;
    }
    .dm-window.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all}

    /* ─── Header ─── */
    .dm-header{
      padding:14px 16px;border-bottom:1px solid var(--dm-border);
      display:flex;align-items:center;gap:10px;flex-shrink:0;
      background:var(--dm-bg);
    }
    .dm-avatar{
      width:34px;height:34px;border-radius:50%;
      background:var(--dm-accent);color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:13px;font-weight:700;flex-shrink:0;
    }
    .dm-header-text h3{font-size:14.5px;font-weight:600;color:var(--dm-ink);line-height:1.2}
    .dm-header-text p{font-size:11px;color:var(--dm-ink-faint);margin-top:1px}
    .dm-close{
      margin-left:auto;background:none;border:none;cursor:pointer;
      color:var(--dm-ink-faint);padding:4px;border-radius:6px;
      display:flex;align-items:center;justify-content:center;transition:background .15s;
    }
    .dm-close:hover{background:var(--dm-surface);color:var(--dm-ink)}
    .dm-close svg{width:16px;height:16px}

    /* ─── Welcome View ─── */
    .dm-welcome-view{
      display:flex;flex-direction:column;align-items:center;
      padding:36px 24px 28px;gap:20px;flex:1;
    }
    .dm-orb-wrap{position:relative;width:80px;height:80px;margin-bottom:0;flex-shrink:0}
    .dm-orb{
      position:absolute;inset:0;border-radius:50%;
      background:conic-gradient(from 180deg at 50% 50%, var(--dm-accent) 0deg, transparent 120deg, var(--dm-accent) 240deg, transparent 360deg);
      animation:dm-orb-pulse 4s ease-in-out infinite alternate;
      filter:blur(6px);
    }
    @keyframes dm-orb-pulse{
      0%{transform:scale(.92) rotate(0deg);opacity:.45}
      100%{transform:scale(1.08) rotate(60deg);opacity:.75}
    }
    .dm-avatar-lg{
      position:absolute;inset:8px;border-radius:50%;
      background:var(--dm-bg);border:1.5px solid var(--dm-border);
      display:flex;align-items:center;justify-content:center;
      font-size:26px;font-weight:700;color:var(--dm-ink);
    }
    .dm-welcome-greeting{
      font-size:16px;font-weight:600;color:var(--dm-ink);
      text-align:center;line-height:1.6;
    }
    .dm-suggestion-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;max-width:320px}
    .dm-suggestion-grid .dm-sg-btn:only-child,.dm-suggestion-grid .dm-sg-btn:nth-child(odd):last-child{grid-column:1/-1}
    .dm-sg-btn{
      padding:12px 14px;border-radius:12px;border:1px solid var(--dm-border);
      background:var(--dm-bg);color:var(--dm-ink);font-family:var(--dm-font);
      font-size:12px;font-weight:500;cursor:pointer;text-align:left;
      line-height:1.4;transition:border-color .15s,background .15s,transform .1s;
    }
    .dm-sg-btn:hover{border-color:var(--dm-accent);background:var(--dm-accent-light);transform:translateY(-1px)}
    .dm-sg-btn:active{transform:scale(.97)}

    /* ─── Chat View ─── */
    .dm-chat-view{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden;position:relative}
    .dm-chat-view.fade-in{animation:dm-view-in .2s ease-out both}
    @keyframes dm-view-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

    /* ─── Messages ─── */
    .dm-messages{
      flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;
      min-height:200px;max-height:380px;
      scrollbar-width:thin;scrollbar-color:var(--dm-border) transparent;
    }
    .dm-messages::-webkit-scrollbar{width:4px}
    .dm-messages::-webkit-scrollbar-thumb{background:var(--dm-border);border-radius:4px}

    @keyframes dm-msg-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

    /* ─── Message Wrapper (bubble + timestamp) ─── */
    .dm-msg-wrap{display:flex;flex-direction:column;animation:dm-msg-in .3s ease-out both;position:relative}
    .dm-msg-wrap.user{align-items:flex-end}
    .dm-msg-wrap.bot{align-items:flex-start}

    .dm-msg{
      max-width:78%;padding:11px 15px;border-radius:14px;
      font-size:13.5px;line-height:1.55;word-wrap:break-word;
    }
    .dm-msg.user{background:var(--dm-accent);color:#fff;border-bottom-right-radius:6px}
    .dm-msg.bot{background:var(--dm-surface);color:var(--dm-ink);border-bottom-left-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.05)}

    /* ─── Message Timestamp ─── */
    .dm-msg-time{font-size:10px;color:var(--dm-ink-faint);margin-top:4px;opacity:.65}

    /* ─── Copy Button ─── */
    .dm-copy-btn{
      position:absolute;top:0;right:-30px;
      width:24px;height:24px;border-radius:6px;
      background:var(--dm-surface);border:1px solid var(--dm-border);
      color:var(--dm-ink-muted);cursor:pointer;
      display:none;align-items:center;justify-content:center;
      transition:background .15s,color .15s;
    }
    .dm-msg-wrap.bot:hover .dm-copy-btn{display:flex}
    .dm-copy-btn:hover{background:var(--dm-accent-light);color:var(--dm-accent)}
    .dm-copy-btn.copied{color:#16a34a}
    .dm-copy-btn svg{width:12px;height:12px}

    /* ─── Scroll-to-Bottom Button ─── */
    .dm-scroll-btn{
      position:absolute;bottom:10px;right:12px;z-index:10;
      width:30px;height:30px;border-radius:50%;border:none;cursor:pointer;
      background:var(--dm-accent);color:#fff;
      display:none;align-items:center;justify-content:center;
      font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.15);
      transition:opacity .2s,transform .2s;
    }
    .dm-scroll-btn.show{display:flex;animation:dm-msg-in .2s ease-out both}

    /* ─── Typing ─── */
    .dm-typing{
      align-self:flex-start;background:var(--dm-surface);border-radius:14px;
      padding:12px 16px;display:none;gap:5px;align-items:center;border-bottom-left-radius:4px;
    }
    .dm-typing.show{display:flex}
    .dm-dot{width:6px;height:6px;border-radius:50%;background:var(--dm-ink-faint);animation:dm-bounce .6s ease-in-out infinite alternate}
    .dm-dot:nth-child(2){animation-delay:.15s}
    .dm-dot:nth-child(3){animation-delay:.3s}
    @keyframes dm-bounce{from{opacity:.4;transform:translateY(0)}to{opacity:1;transform:translateY(-4px)}}

    /* ─── Project Card ─── */
    .dm-card{
      align-self:flex-start;max-width:88%;border-radius:12px;overflow:hidden;
      border:1px solid var(--dm-border);background:var(--dm-bg);
      animation:dm-msg-in .3s ease-out both;transition:transform .15s,box-shadow .15s;
    }
    .dm-card:hover{transform:scale(1.01);box-shadow:0 4px 16px rgba(0,0,0,.08)}
    .dm-card-img{width:100%;height:140px;object-fit:cover;display:block}
    .dm-card-body{padding:14px 16px}
    .dm-card-title{font-size:13px;font-weight:600;color:var(--dm-ink);margin-bottom:5px}
    .dm-card-desc{font-size:12px;color:var(--dm-ink-muted);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .dm-card-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
    .dm-card-tag{font-size:10px;font-weight:500;padding:2px 8px;border-radius:20px;background:var(--dm-accent-light);color:var(--dm-accent)}
    .dm-card-link{
      display:block;padding:10px 16px;border-top:1px solid var(--dm-border);
      font-size:11px;font-weight:500;color:var(--dm-accent);text-decoration:none;
      text-align:center;transition:background .15s;
    }
    .dm-card-link:hover{background:var(--dm-accent-light)}

    /* ─── Link Card ─── */
    .dm-link-card{
      align-self:flex-start;display:flex;align-items:center;gap:12px;
      padding:12px 16px;border-radius:12px;border:1px solid var(--dm-border);
      background:var(--dm-bg);text-decoration:none;max-width:82%;
      transition:border-color .15s,transform .15s;animation:dm-msg-in .3s ease-out both;
    }
    .dm-link-card:hover{border-color:var(--dm-accent);transform:scale(1.01)}
    .dm-link-icon{width:32px;height:32px;border-radius:8px;background:var(--dm-accent-light);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px}
    .dm-link-label{font-size:12px;font-weight:500;color:var(--dm-ink)}
    .dm-link-url{font-size:11px;color:var(--dm-ink-faint);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px}

    /* ─── Form Cards (Lead + Booking) ─── */
    .dm-lead-form,.dm-booking-card{
      align-self:flex-start;max-width:90%;border-radius:12px;
      border:1px solid var(--dm-border);background:var(--dm-bg);
      padding:16px;animation:dm-msg-in .3s ease-out both;
      display:flex;flex-direction:column;gap:10px;
    }
    .dm-lead-form h4,.dm-booking-card h4{font-size:13px;font-weight:600;color:var(--dm-ink);margin-bottom:2px}
    .dm-form-input{
      width:100%;padding:10px 12px;border-radius:8px;
      border:1px solid var(--dm-border);font-family:var(--dm-font);font-size:13px;
      color:var(--dm-ink);background:var(--dm-surface);outline:none;
      transition:border-color .15s;
    }
    .dm-form-input:focus{border-color:var(--dm-accent)}
    .dm-form-input::placeholder{color:var(--dm-ink-faint)}
    .dm-form-btn{
      width:100%;padding:10px;border-radius:8px;border:none;
      background:var(--dm-accent);color:#fff;font-family:var(--dm-font);
      font-size:13px;font-weight:600;cursor:pointer;transition:opacity .15s;
    }
    .dm-form-btn:hover{opacity:.88}
    .dm-form-btn:disabled{opacity:.45;cursor:default}
    .dm-form-success{font-size:12.5px;color:var(--dm-ink-muted);text-align:center;padding:4px 0}

    /* ─── CV Card ─── */
    .dm-cv-card{
      align-self:flex-start;display:flex;align-items:center;gap:14px;
      padding:12px 16px;border-radius:12px;border:1px solid var(--dm-border);
      background:var(--dm-bg);text-decoration:none;max-width:88%;
      transition:border-color .15s,transform .15s;animation:dm-msg-in .3s ease-out both;
    }
    .dm-cv-card:hover{border-color:var(--dm-accent);transform:scale(1.01)}
    .dm-cv-icon{width:36px;height:36px;border-radius:8px;background:var(--dm-accent-light);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--dm-accent)}
    .dm-cv-icon svg{width:18px;height:18px}
    .dm-cv-title{font-size:13px;font-weight:600;color:var(--dm-ink)}
    .dm-cv-sub{font-size:11px;color:var(--dm-ink-muted);margin-top:1px}

    /* ─── Input Area ─── */
    .dm-input-area{
      padding:12px 14px;border-top:1px solid var(--dm-border);
      display:flex;gap:9px;align-items:flex-end;background:var(--dm-bg);flex-shrink:0;
    }
    .dm-input{
      flex:1;border:1px solid var(--dm-border);border-radius:12px;
      padding:10px 13px;font-size:13.5px;font-family:var(--dm-font);
      color:var(--dm-ink);background:var(--dm-surface);
      outline:none;resize:none;max-height:80px;min-height:40px;line-height:1.4;
      transition:border-color .15s;
    }
    .dm-input:focus{border-color:var(--dm-accent)}
    .dm-input::placeholder{color:var(--dm-ink-faint)}
    .dm-voice-btn{
      width:40px;height:40px;border-radius:12px;border:1px solid var(--dm-border);
      background:var(--dm-bg);cursor:pointer;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;
      color:var(--dm-ink-muted);transition:border-color .15s,color .15s;
    }
    .dm-voice-btn:hover{border-color:var(--dm-accent);color:var(--dm-accent)}
    .dm-voice-btn.listening{border-color:#DC2626;color:#DC2626;animation:dm-pulse-shadow 1.5s ease-in-out infinite}
    .dm-voice-btn svg{width:16px;height:16px}
    .dm-send{
      width:40px;height:40px;border-radius:12px;border:none;cursor:pointer;
      background:var(--dm-accent);color:#fff;
      display:flex;align-items:center;justify-content:center;
      flex-shrink:0;transition:opacity .15s,transform .1s;
    }
    .dm-send:hover{opacity:.88}
    .dm-send:active{transform:scale(.92)}
    .dm-send:disabled{opacity:.35;cursor:default}
    .dm-send svg{width:16px;height:16px}

    /* ─── Branding ─── */
    .dm-branding{
      text-align:center;padding:8px 10px;font-size:10px;color:var(--dm-ink-faint);
      border-top:1px solid var(--dm-border);flex-shrink:0;
    }
    .dm-branding a{color:var(--dm-accent);text-decoration:none;font-weight:600}
    .dm-branding a:hover{text-decoration:underline}

    /* ─── Rate Limit ─── */
    .dm-rate-limit{
      align-self:center;margin:auto;text-align:center;padding:24px 20px;
      color:var(--dm-ink-muted);font-size:13px;line-height:1.5;
    }

    /* ─── Toast (on body, not in widget) ─── */
    .dm-toast{
      position:fixed;bottom:90px;right:20px;z-index:2147483646;
      background:#111;color:#fff;padding:10px 16px;border-radius:10px;
      font-family:'Satoshi',system-ui,-apple-system,sans-serif;font-size:13px;
      max-width:300px;box-shadow:0 4px 20px rgba(0,0,0,.2);
      pointer-events:none;opacity:0;transform:translateY(8px);
      transition:opacity .3s,transform .3s;
    }
    .dm-toast.show{opacity:1;transform:translateY(0)}

    /* ─── Mobile ─── */
    @media(max-width:480px){
      #digime-widget{bottom:12px;right:12px;left:12px}
      .dm-window{
        position:fixed;top:0;right:0;bottom:0;left:0;
        width:auto;border-radius:0;max-height:100dvh;
      }
      .dm-messages{max-height:calc(100dvh - 260px)}
      .dm-msg{max-width:85%}
      .dm-voice-btn,.dm-send{width:42px;height:42px}
      .dm-toast{right:12px;left:12px;bottom:80px}
    }
  `;
  document.head.appendChild(style);

  // ─── Helper ───
  function getAccent() { return config?.accent_color || "#111111"; }

  // ─── SVG Icons ───
  const ICONS = {
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    micOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  };

  const PLATFORM_EMOJI = {
    linkedin:"💼", github:"🐙", twitter:"🐦", instagram:"📸",
    behance:"🎨", dribbble:"🏀", email:"✉️", website:"🌐",
    youtube:"📺", medium:"📝", figma:"🎯", x:"🐦", default:"🔗",
  };

  // ─── Build DOM ───
  const root = document.createElement("div");
  root.id = "digime-widget";
  root.innerHTML = `
    <div style="position:relative">
      <button class="dm-fab" id="dm-fab">${ICONS.chat}</button>
      <div class="dm-unread" id="dm-unread">1</div>
    </div>
    <div class="dm-window" id="dm-window">
      <div class="dm-header">
        <div class="dm-avatar" id="dm-avatar"></div>
        <div class="dm-header-text">
          <h3 id="dm-name">Loading...</h3>
          <p>AI Assistant</p>
        </div>
        <button class="dm-close" id="dm-close-btn">${ICONS.close}</button>
      </div>

      <!-- Welcome View -->
      <div class="dm-welcome-view" id="dm-welcome-view">
        <div class="dm-orb-wrap">
          <div class="dm-orb"></div>
          <div class="dm-avatar-lg" id="dm-avatar-lg">?</div>
        </div>
        <div class="dm-welcome-greeting" id="dm-welcome-greeting">Hey! How can I help you?</div>
        <div class="dm-suggestion-grid" id="dm-suggestion-grid"></div>
      </div>

      <!-- Chat View -->
      <div class="dm-chat-view" id="dm-chat-view" style="display:none">
        <div class="dm-messages" id="dm-messages">
          <div class="dm-typing" id="dm-typing">
            <div class="dm-dot"></div><div class="dm-dot"></div><div class="dm-dot"></div>
          </div>
        </div>
        <button class="dm-scroll-btn" id="dm-scroll-btn" title="Scroll to latest">↓</button>
      </div>

      <!-- Input -->
      <div class="dm-input-area">
        <textarea class="dm-input" id="dm-input" placeholder="Ask me anything..." rows="1"></textarea>
        <button class="dm-voice-btn" id="dm-voice-btn" style="display:none" title="Voice input">${ICONS.mic}</button>
        <button class="dm-send" id="dm-send-btn" disabled>${ICONS.send}</button>
      </div>
      <div class="dm-branding" id="dm-branding">Powered by <a href="https://digime.app" target="_blank">DigiMe</a></div>
    </div>
  `;
  document.body.appendChild(root);

  // Toast lives outside widget div
  const toastEl = document.createElement("div");
  toastEl.id = "dm-toast";
  toastEl.className = "dm-toast";
  document.body.appendChild(toastEl);

  // ─── DOM Refs ───
  const fab           = document.getElementById("dm-fab");
  const win           = document.getElementById("dm-window");
  const closeBtn      = document.getElementById("dm-close-btn");
  const avatarEl      = document.getElementById("dm-avatar");
  const avatarLgEl    = document.getElementById("dm-avatar-lg");
  const nameEl        = document.getElementById("dm-name");
  const unreadEl      = document.getElementById("dm-unread");
  const welcomeViewEl = document.getElementById("dm-welcome-view");
  const chatViewEl    = document.getElementById("dm-chat-view");
  const messagesEl    = document.getElementById("dm-messages");
  const typingEl      = document.getElementById("dm-typing");
  const suggestionsEl = document.getElementById("dm-suggestion-grid");
  const welcomeGreetingEl = document.getElementById("dm-welcome-greeting");
  const inputEl       = document.getElementById("dm-input");
  const sendBtn       = document.getElementById("dm-send-btn");
  const voiceBtn      = document.getElementById("dm-voice-btn");
  const brandingEl    = document.getElementById("dm-branding");
  const scrollBtnEl   = document.getElementById("dm-scroll-btn");

  // ─── Scroll-to-Bottom ───
  messagesEl.addEventListener("scroll", () => {
    const dist = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight;
    scrollBtnEl.classList.toggle("show", dist > 80);
  });
  scrollBtnEl.addEventListener("click", () => {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });
  });

  // ─── Theme ───
  function updateTheme() {
    if (!config) return;
    const accent = config.accent_color || "#111111";
    root.style.setProperty("--dm-accent", accent);
    root.style.setProperty("--dm-accent-light", accent + "14");
  }

  // ─── Toggle ───
  function openWidget() {
    isOpen = true;
    win.classList.add("open");
    fab.innerHTML = ICONS.close;
    fab.classList.add("open");
    unreadEl.style.display = "none";
    requestAnimationFrame(() => inputEl.focus());
    try { window.parent.postMessage({ type: "digime:opened" }, "*"); } catch(e) {}
  }

  function closeWidget() {
    isOpen = false;
    win.classList.remove("open");
    fab.innerHTML = ICONS.chat;
    fab.classList.remove("open");
    try { window.parent.postMessage({ type: "digime:closed" }, "*"); } catch(e) {}
  }

  fab.addEventListener("click", () => isOpen ? closeWidget() : openWidget());
  closeBtn.addEventListener("click", closeWidget);

  // ─── State Machine: welcome → chat ───
  function switchToChat() {
    if (uiState === "chat") return;
    uiState = "chat";
    welcomeViewEl.style.display = "none";
    chatViewEl.style.display = "flex";
    chatViewEl.classList.add("fade-in");
    // Show greeting as first bot message so chat view doesn't start empty
    if (messages.length === 0) {
      appendMessage("bot", config?.greeting || "Hey! How can I help you?");
    }
    requestAnimationFrame(() => {
      scrollToBottom();
      inputEl.focus();
    });
  }

  // ─── Input Handlers ───
  inputEl.addEventListener("input", () => {
    sendBtn.disabled = !inputEl.value.trim();
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + "px";
  });

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);

  // ─── Send Message ───
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isTyping) return;

    // Transition to chat if still on welcome screen
    if (uiState === "welcome") switchToChat();

    appendMessage("user", text);
    inputEl.value = "";
    inputEl.style.height = "auto";
    sendBtn.disabled = true;

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

      if (res.status === 429) {
        appendMessage("bot", data.error || "This chatbot has reached its monthly conversation limit.");
        return;
      }

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
    const cardRegex = /```card\n([\s\S]*?)```/g;
    const bookingTest = /```booking\n[\s\S]*?```/.test(text);
    let cleanText = text;
    const cards = [];
    let match;

    while ((match = cardRegex.exec(text)) !== null) {
      try {
        cards.push(JSON.parse(match[1].trim()));
        cleanText = cleanText.replace(match[0], "").trim();
      } catch (e) { /* ignore malformed */ }
    }

    // Strip booking blocks from visible text
    cleanText = cleanText.replace(/```booking\n[\s\S]*?```/g, "").trim();

    if (cleanText) appendMessage("bot", cleanText);

    for (const card of cards) {
      if (card.type === "project")   renderProjectCard(card);
      else if (card.type === "link") renderLinkCard(card);
      else if (card.type === "lead_form") renderLeadFormCard();
      else if (card.type === "cv")   renderCvCard(card);
    }

    if (bookingTest) renderBookingCard();
  }

  // ─── Card Renderers ───

  function renderProjectCard(card) {
    const el = document.createElement("div");
    el.className = "dm-card";
    let html = "";
    if (card.image_url) {
      html += `<img class="dm-card-img" src="${escapeHtml(card.image_url)}" alt="${escapeHtml(card.name || "")}" loading="lazy" onerror="this.style.display='none'"/>`;
    }
    html += `<div class="dm-card-body">`;
    html += `<div class="dm-card-title">${escapeHtml(card.name || "Project")}</div>`;
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
    el.href = card.url || "#";
    el.target = "_blank";
    el.rel = "noopener";
    el.innerHTML = `
      <div class="dm-link-icon">${emoji}</div>
      <div>
        <div class="dm-link-label">${escapeHtml(card.platform || "Link")}</div>
        <div class="dm-link-url">${escapeHtml(card.handle || card.url || "")}</div>
      </div>
    `;
    messagesEl.insertBefore(el, typingEl);
    scrollToBottom();
  }

  function renderLeadFormCard() {
    if (!config?.features?.lead_capture) return;
    const el = document.createElement("div");
    el.className = "dm-lead-form";
    el.innerHTML = `
      <h4>Let\u2019s stay in touch</h4>
      <input class="dm-form-input" data-role="name" placeholder="Your name" type="text" autocomplete="name"/>
      <input class="dm-form-input" data-role="email" placeholder="Your email" type="email" autocomplete="email"/>
      <button class="dm-form-btn">Send \u2192</button>
    `;
    messagesEl.insertBefore(el, typingEl);
    scrollToBottom();

    const nameInput  = el.querySelector('[data-role="name"]');
    const emailInput = el.querySelector('[data-role="email"]');
    const btn        = el.querySelector(".dm-form-btn");

    btn.addEventListener("click", async () => {
      const name  = nameInput.value.trim();
      const email = emailInput.value.trim();
      if (!name || !email) return;
      btn.disabled = true;
      btn.textContent = "Sending...";
      try {
        await fetch(`${API_BASE}/api/lead`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatbot_id: BOT_ID,
            conversation_id: conversationId,
            visitor_id: visitorId,
            name,
            email,
            context: "widget",
          }),
        });
        el.innerHTML = `<div class="dm-form-success">\u2713 Thanks ${escapeHtml(name)}, I\u2019ll be in touch!</div>`;
      } catch (e) {
        btn.disabled = false;
        btn.textContent = "Send \u2192";
      }
    });
  }

  function renderCvCard(card) {
    if (!card.url) return;
    const el = document.createElement("a");
    el.className = "dm-cv-card";
    el.href = escapeHtml(card.url);
    el.target = "_blank";
    el.rel = "noopener";
    el.innerHTML = `
      <div class="dm-cv-icon">${ICONS.download}</div>
      <div>
        <div class="dm-cv-title">${escapeHtml(card.name || "Resume")}</div>
        <div class="dm-cv-sub">${escapeHtml(card.subtitle || "Download PDF")}</div>
      </div>
    `;
    messagesEl.insertBefore(el, typingEl);
    scrollToBottom();
  }

  function renderBookingCard() {
    if (!config?.features?.booking) return;
    const el = document.createElement("div");
    el.className = "dm-booking-card";
    el.innerHTML = `
      <h4>${ICONS.calendar} Book a Call</h4>
      <input class="dm-form-input" data-role="name" placeholder="Your name" type="text" autocomplete="name"/>
      <input class="dm-form-input" data-role="email" placeholder="Your email" type="email" autocomplete="email"/>
      <button class="dm-form-btn">Find a Time \u2192</button>
    `;
    messagesEl.insertBefore(el, typingEl);
    scrollToBottom();

    const nameInput  = el.querySelector('[data-role="name"]');
    const emailInput = el.querySelector('[data-role="email"]');
    const btn        = el.querySelector(".dm-form-btn");

    btn.addEventListener("click", async () => {
      const visitor_name  = nameInput.value.trim();
      const visitor_email = emailInput.value.trim();
      if (!visitor_name || !visitor_email) return;
      btn.disabled = true;
      btn.textContent = "Opening...";
      try {
        const res = await fetch(`${API_BASE}/api/booking`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatbot_id: BOT_ID,
            conversation_id: conversationId,
            visitor_id: visitorId,
            visitor_name,
            visitor_email,
            slot: null,
          }),
        });
        const data = await res.json();
        if (data.cal_url) {
          window.open(data.cal_url, "_blank");
          el.innerHTML = `<div class="dm-form-success">\u2713 Calendar opened! Check your new tab.</div>`;
        } else {
          el.innerHTML = `<div class="dm-form-success">Booking is not configured yet.</div>`;
        }
      } catch (e) {
        btn.disabled = false;
        btn.textContent = "Find a Time \u2192";
      }
    });
  }

  // ─── Voice Input ───
  function setupVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !config?.features?.voice_input) return;

    voiceBtn.style.display = "flex";
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    voiceBtn.addEventListener("click", () => {
      if (isListening) {
        recognition.stop();
        return;
      }
      try {
        recognition.start();
        isListening = true;
        voiceBtn.innerHTML = ICONS.micOff;
        voiceBtn.classList.add("listening");
      } catch (e) {
        console.warn("[DigiMe] Voice error:", e);
      }
    });

    recognition.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript || "";
      if (transcript) {
        inputEl.value = transcript;
        sendBtn.disabled = false;
        inputEl.focus();
      }
    };

    const resetVoice = () => {
      isListening = false;
      voiceBtn.innerHTML = ICONS.mic;
      voiceBtn.classList.remove("listening");
    };

    recognition.onend = resetVoice;
    recognition.onerror = resetVoice;
  }

  // ─── Toast ───
  function showToast(msg, duration = 4000) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), duration);
  }

  // ─── Welcome Suggestions ───
  function renderWelcomeSuggestions(questions) {
    if (!suggestionsEl || !questions?.length) return;
    suggestionsEl.innerHTML = "";
    questions.slice(0, 4).forEach((q) => {
      const btn = document.createElement("button");
      btn.className = "dm-sg-btn";
      btn.textContent = q;
      btn.addEventListener("click", () => {
        inputEl.value = q;
        sendMessage();
      });
      suggestionsEl.appendChild(btn);
    });
  }

  // ─── Utilities ───
  function appendMessage(role, content) {
    const wrap = document.createElement("div");
    wrap.className = `dm-msg-wrap ${role}`;

    const msg = document.createElement("div");
    msg.className = `dm-msg ${role}`;
    msg.textContent = content;
    wrap.appendChild(msg);

    const time = document.createElement("div");
    time.className = "dm-msg-time";
    time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    wrap.appendChild(time);

    if (role === "bot") {
      const copyBtn = document.createElement("button");
      copyBtn.className = "dm-copy-btn";
      copyBtn.title = "Copy";
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(content).catch(() => {});
        copyBtn.classList.add("copied");
        setTimeout(() => copyBtn.classList.remove("copied"), 1500);
      });
      wrap.appendChild(copyBtn);
    }

    messagesEl.insertBefore(wrap, typingEl);
    messages.push({ role, content });
    scrollToBottom();
  }

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

  // ─── postMessage Bridge ───
  window.addEventListener("message", (e) => {
    if (!e.data || typeof e.data !== "object") return;
    if (e.data.type === "digime:open")  openWidget();
    if (e.data.type === "digime:close") closeWidget();
  });

  // ─── Avatar ───
  function renderAvatar(el, cfg) {
    if (cfg.avatar_url) {
      el.innerHTML = `<img src="${escapeHtml(cfg.avatar_url)}" alt="${escapeHtml(cfg.name || "")}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" />`;
    } else {
      el.textContent = (cfg.name || "A")[0].toUpperCase();
    }
  }

  // ─── Init ───
  async function init() {
    try {
      const res = await fetch(`${API_BASE}/api/chatbot?id=${BOT_ID}`);
      if (!res.ok) throw new Error("Chatbot not found");
      config = await res.json();

      // Apply accent color
      updateTheme();

      // Update UI with bot identity
      const initial = (config.name || "A")[0].toUpperCase();
      nameEl.textContent = config.name || "AI Assistant";
      renderAvatar(avatarEl, config);
      renderAvatar(avatarLgEl, config);

      // Welcome greeting
      const greeting = config.greeting || "Hey! How can I help you?";
      welcomeGreetingEl.textContent = greeting;

      // Branding
      if (!config.features?.show_branding) {
        brandingEl.style.display = "none";
      }

      // Handle rate limiting
      if (config.usage?.rate_limited) {
        welcomeGreetingEl.textContent = "This chatbot has reached its monthly conversation limit. Please try again next month.";
        suggestionsEl.style.display = "none";
        inputEl.disabled = true;
        sendBtn.disabled = true;
        inputEl.placeholder = "Chat unavailable";
      } else {
        renderWelcomeSuggestions(config.suggested_questions);
      }

      // Setup voice
      setupVoice();

      // Show unread badge
      unreadEl.style.display = "flex";

      // Show toast after a short delay
      setTimeout(() => {
        if (!isOpen) showToast(greeting);
      }, 1500);

    } catch (err) {
      console.error("[DigiMe] Failed to load chatbot config:", err);
    }
  }

  // Launch
  init();
})();
