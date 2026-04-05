<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Abhishek Jha — Assistant</title>
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --ink:#111;--ink2:#444;--ink3:#888;--ink4:#bbb;--ink5:#ddd;
  --bg:#fafafa;--white:#fff;--border:#f0f0f0;--input:#f5f5f5;
  --accent:#111;--send:#111;
  --f:'Satoshi',-apple-system,system-ui,sans-serif;
  --r:20px;
}
body{font-family:var(--f);background:transparent;-webkit-font-smoothing:antialiased;color:var(--ink)}

/* ══════ TOGGLE ══════ */
#toggle{
  position:fixed;bottom:28px;right:28px;width:52px;height:52px;border-radius:50%;
  background:var(--ink);border:none;cursor:pointer;z-index:10001;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 2px 12px rgba(0,0,0,.1);
  transition:all .3s cubic-bezier(.4,0,.2,1);
}
#toggle:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.14)}
#toggle .av{width:46px;height:46px;border-radius:50%;object-fit:cover;transition:all .25s}
#toggle .x{position:absolute;opacity:0;transition:all .25s}
#toggle.open .av{opacity:0;transform:scale(.3)}
#toggle.open .x{opacity:1;transform:scale(1)}

/* ══════ GREETING ══════ */
#greet{
  position:fixed;bottom:90px;right:28px;z-index:10000;
  background:var(--white);padding:12px 18px;border-radius:14px 14px 4px 14px;
  box-shadow:0 1px 12px rgba(0,0,0,.06);
  font-size:13px;font-weight:500;color:var(--ink);
  opacity:0;transform:translateY(6px);
  transition:all .4s cubic-bezier(.4,0,.2,1);pointer-events:none;
  max-width:200px;line-height:1.4;
}
#greet.show{opacity:1;transform:translateY(0);pointer-events:auto}
#greet .dismiss{position:absolute;top:4px;right:8px;background:none;border:none;color:var(--ink4);cursor:pointer;font-size:14px}

/* ══════ WINDOW ══════ */
#win{
  position:fixed;bottom:90px;right:28px;
  width:420px;max-width:calc(100vw - 40px);height:600px;max-height:calc(100vh - 110px);
  background:var(--white);border-radius:var(--r);
  display:flex;flex-direction:column;overflow:hidden;z-index:9999;
  opacity:0;transform:translateY(8px) scale(.98);pointer-events:none;
  transition:all .3s cubic-bezier(.4,0,.2,1);
  box-shadow:0 8px 40px rgba(0,0,0,.06),0 0 0 1px rgba(0,0,0,.04);
}
#win.visible{opacity:1;transform:none;pointer-events:auto}

/* ══════ WELCOME ══════ */
#welcome{
  flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;
  padding:48px 36px 24px;text-align:center;
}
.orb{
  width:56px;height:56px;margin-bottom:28px;border-radius:50%;
  background:conic-gradient(from 180deg,#e8613c,#f4a68e,#ccc,#999,#e8613c);
  filter:blur(1px);opacity:.7;animation:gentle 6s ease-in-out infinite;
}
@keyframes gentle{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-4px) scale(1.02)}}

.w-h1{font-size:24px;font-weight:700;letter-spacing:-.5px;line-height:1.3;color:var(--ink);margin-bottom:6px}
.w-p{font-size:13px;color:var(--ink3);font-weight:400;line-height:1.5;max-width:260px}

/* ══════ PROMPTS ══════ */
.prompts{padding:0 28px 24px}
.prompts-row{display:flex;gap:8px;flex-wrap:wrap}
.prompt{
  flex:1;min-width:calc(50% - 4px);padding:14px 16px;border-radius:14px;
  border:1px solid var(--border);background:var(--white);
  font-size:12.5px;font-family:var(--f);font-weight:500;color:var(--ink2);
  cursor:pointer;transition:all .2s;text-align:left;line-height:1.35;
}
.prompt:hover{background:var(--bg);border-color:var(--ink5)}

/* ══════ INPUT (welcome) ══════ */
.input-wrap{
  margin:0 28px 20px;background:var(--input);border-radius:16px;
  display:flex;align-items:center;padding:4px 4px 4px 18px;gap:6px;
  border:1px solid var(--border);transition:border .2s;
}
.input-wrap:focus-within{border-color:var(--ink5)}
.input-wrap input{
  flex:1;border:none;background:none;outline:none;
  font-size:14px;font-family:var(--f);font-weight:400;color:var(--ink);padding:10px 0;
}
.input-wrap input::placeholder{color:var(--ink4)}
.input-wrap .send{
  width:40px;height:40px;border-radius:12px;background:var(--send);
  border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:all .15s;flex-shrink:0;
}
.input-wrap .send:hover{opacity:.8}
.input-wrap .send:disabled{opacity:.2;cursor:default}

.footer{padding:8px 28px 14px;font-size:10px;color:var(--ink4);text-align:center}

/* ══════ MESSAGES ══════ */
.msgs{flex:1;overflow-y:auto;padding:20px 20px;display:flex;flex-direction:column;gap:16px;background:linear-gradient(180deg,#fafafa 0%,#f7f5f2 30%,#f5f0ec 60%,#f2ece6 100%);display:none}
.msgs.on{display:flex}
.msgs::-webkit-scrollbar{width:0}

/* header bar in chat mode */
.chat-head{display:none;padding:16px 20px;background:var(--white);border-bottom:1px solid var(--border);align-items:center;gap:10px}
.chat-head.on{display:flex}
.chat-head img{width:28px;height:28px;border-radius:50%;object-fit:cover}
.chat-head span{font-size:14px;font-weight:600;flex:1}
.chat-head .back{background:none;border:none;cursor:pointer;color:var(--ink3);font-size:18px;padding:4px 8px;border-radius:8px}
.chat-head .back:hover{background:var(--bg)}

.msg{display:flex;gap:10px;max-width:88%;animation:up .3s ease-out}
.msg.u{align-self:flex-end;flex-direction:row-reverse}
.msg.b{align-self:flex-start}
@keyframes up{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

.msg .av{width:26px;height:26px;border-radius:50%;flex-shrink:0;overflow:hidden;margin-top:2px}
.msg.b .av img{width:100%;height:100%;object-fit:cover}
.msg.u .av{background:var(--input);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--ink3)}

.bb{padding:12px 16px;font-size:14px;line-height:1.55;font-weight:400;letter-spacing:-.01em}
.msg.b .bb{background:var(--white);border:1px solid var(--border);border-radius:4px 16px 16px 16px;color:var(--ink)}
.msg.u .bb{background:var(--ink);color:#fff;border-radius:16px 4px 16px 16px}
.bb a{color:var(--ink);font-weight:500;text-decoration:underline;text-underline-offset:2px}
.msg.u .bb a{color:#fff}

/* cards */
.project-card{margin-top:12px;border:1px solid var(--border);border-radius:16px;overflow:hidden;background:var(--white);transition:all .2s}
.project-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.04)}
.project-card img{width:100%;height:100px;object-fit:cover}
.project-card .pc-b{padding:12px 14px}
.project-card .pc-n{font-size:14px;font-weight:700;margin-bottom:3px}
.project-card .pc-d{font-size:11.5px;color:var(--ink3);margin-bottom:8px}
.project-card .pc-t{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px}
.project-card .pc-tg{padding:3px 10px;border-radius:6px;background:var(--bg);font-size:10px;font-weight:600;color:var(--ink3);border:1px solid var(--border)}
.project-card .pc-l{display:inline-block;padding:7px 16px;border-radius:10px;background:var(--ink);color:#fff!important;font-size:11.5px;font-weight:600;text-decoration:none!important}

.link-card{display:flex;align-items:center;gap:12px;margin-top:8px;padding:11px 14px;border:1px solid var(--border);border-radius:12px;background:var(--white);text-decoration:none!important;color:var(--ink)!important;transition:all .15s}
.link-card:hover{background:var(--bg)}
.link-card .li{width:34px;height:34px;border-radius:10px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.link-card .lt{flex:1}
.link-card .ln{font-size:13px;font-weight:600}
.link-card .lu{font-size:11px;color:var(--ink4)}
.link-card .la{color:var(--ink4);font-size:14px}

.slots-grid{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.slot-btn{padding:8px 14px;border-radius:10px;border:1px solid var(--border);background:var(--white);color:var(--ink);font-size:12px;font-family:var(--f);font-weight:600;cursor:pointer;transition:all .15s}
.slot-btn:hover{background:var(--bg);border-color:var(--ink5)}
.slot-btn.selected{background:var(--ink);color:#fff;border-color:var(--ink)}

.cal-btn{display:inline-block;margin-top:10px;padding:10px 20px;border-radius:10px;background:var(--ink);color:#fff!important;font-family:var(--f);font-size:13px;font-weight:600;text-decoration:none!important;border:none;cursor:pointer}

.td{display:flex;gap:4px;padding:4px 0;align-items:center}
.td span{width:4px;height:4px;background:var(--ink4);border-radius:50%;animation:pulse 1.2s ease-in-out infinite}
.td span:nth-child(2){animation-delay:.2s}
.td span:nth-child(3){animation-delay:.4s}
@keyframes pulse{0%,100%{opacity:.2}50%{opacity:.8}}

/* chat input */
.chat-input{display:none;padding:14px 16px;background:var(--white);border-top:1px solid var(--border);gap:10px;align-items:center}
.chat-input.on{display:flex}
.chat-input input{flex:1;background:var(--input);border:none;border-radius:14px;padding:12px 16px;font-size:14px;font-family:var(--f);color:var(--ink);outline:none}
.chat-input input::placeholder{color:var(--ink4)}
.chat-input .send{width:40px;height:40px;border-radius:12px;background:var(--send);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.chat-input .send:disabled{opacity:.2}

/* cv card */
.cv-card{margin-top:10px;border:1px solid var(--border);border-radius:16px;overflow:hidden;background:var(--white);padding:16px 18px;display:flex;align-items:center;gap:14px;transition:all .2s}
.cv-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.04)}
.cv-card .cv-icon{width:44px;height:44px;border-radius:12px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.cv-card .cv-info{flex:1}
.cv-card .cv-name{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:2px}
.cv-card .cv-sub{font-size:11px;color:var(--ink3)}
.cv-card .cv-dl{padding:9px 18px;border-radius:10px;background:var(--ink);color:#fff!important;font-size:12px;font-weight:600;text-decoration:none!important;flex-shrink:0;display:inline-flex;align-items:center;gap:5px}

/* lead capture */
.lead-card{margin-top:10px;border:1px solid var(--border);border-radius:16px;background:var(--white);padding:16px 18px;transition:all .2s}
.lead-card .lead-title{font-size:13px;font-weight:600;color:var(--ink);margin-bottom:10px}
.lead-card input{width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:10px;font-family:var(--f);font-size:13px;color:var(--ink);outline:none;margin-bottom:8px;background:var(--bg)}
.lead-card input:focus{border-color:var(--ink5)}
.lead-card input::placeholder{color:var(--ink4)}
.lead-card .lead-submit{width:100%;padding:10px;border-radius:10px;background:var(--ink);color:#fff;font-family:var(--f);font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all .15s}
.lead-card .lead-submit:hover{opacity:.85}

/* mic button */
.mic{width:40px;height:40px;border-radius:12px;background:none;border:1.5px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;color:var(--ink3)}
.mic:hover{background:var(--bg);border-color:var(--ink5)}
.mic.recording{background:#fee;border-color:#e8613c;animation:mic-pulse 1s ease-in-out infinite}
.mic.recording svg{stroke:#e8613c}
@keyframes mic-pulse{0%,100%{box-shadow:0 0 0 0 rgba(232,97,60,.15)}50%{box-shadow:0 0 0 8px rgba(232,97,60,0)}}
.mic-unsupported{display:none}

.err{background:#fef2f2!important;border-color:#fee!important;color:#7f1d1d!important}

@media(max-width:480px){
  /* Fullscreen chat */
  #win{bottom:0;right:0;left:0;width:100%;max-width:100%;height:100dvh;max-height:100dvh;border-radius:0;box-shadow:none}
  #win.visible{transform:none}
  #toggle{bottom:20px;right:20px;width:50px;height:50px}
  #toggle .av{width:44px;height:44px}
  #greet{display:none!important}
  .mobile-close{display:block!important}

  /* Welcome */
  #welcome{padding:32px 24px 16px}
  .orb{width:44px;height:44px;margin-bottom:20px}
  .w-h1{font-size:20px}
  .w-p{font-size:12.5px;max-width:240px}

  /* Prompts stack on small screens */
  .prompts{padding:0 16px 16px}
  .prompts-row{gap:6px}
  .prompt{min-width:calc(50% - 3px);padding:12px 14px;font-size:12px}

  /* Input areas */
  .input-wrap{margin:0 16px 14px;padding:3px 3px 3px 14px}
  .input-wrap input{font-size:16px;padding:8px 0} /* 16px prevents iOS zoom */
  .input-wrap .send{width:36px;height:36px;border-radius:10px}
  .input-wrap .mic{width:36px;height:36px;border-radius:10px}

  .chat-input{padding:10px 12px;gap:6px}
  .chat-input input{padding:10px 14px;font-size:16px;border-radius:12px} /* 16px prevents iOS zoom */
  .chat-input .send{width:38px;height:38px;border-radius:10px}
  .chat-input .mic{width:38px;height:38px;border-radius:10px}

  /* Messages */
  .msgs{padding:16px 12px;gap:12px}
  .msg{max-width:92%}
  .bb{padding:10px 14px;font-size:14px}

  /* Cards */
  .project-card img{height:90px}
  .project-card .pc-b{padding:10px 12px}
  .project-card .pc-n{font-size:13px}
  .link-card{padding:10px 12px;gap:10px}
  .link-card .li{width:32px;height:32px;border-radius:8px;font-size:14px}
  .link-card .ln{font-size:12.5px}

  /* Slots */
  .slots-grid{gap:5px}
  .slot-btn{padding:7px 11px;font-size:11px;border-radius:8px}

  /* Chat header */
  .{padding:14px 16px;padding-top:max(14px,env(safe-area-inset-top))}

  /* Footer */
  .footer{padding:6px 16px max(10px,env(safe-area-inset-bottom));font-size:9.5px}

  /* Safe area for notched phones */
  .chat-input{padding-bottom:max(10px,env(safe-area-inset-bottom))}
}
</style>
</head>
<body>

<div id="greet"><span id="greet-text"></span><button class="dismiss" onclick="this.parentElement.classList.remove('show')">×</button></div>

<button id="toggle" onclick="toggleChat()">
  <img class="av" src="https://abhishek-chatbot.vercel.app/avatar.png" alt="A"/>
  <svg class="x" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
</button>

<div id="win">
  <!-- WELCOME -->
<div id="welcome">
    <div style="position:absolute;top:16px;right:16px"><button onclick="toggleChat()" style="background:none;border:none;cursor:pointer;padding:6px 8px;border-radius:8px;color:var(--ink4);font-size:16px;line-height:1;display:none" class="mobile-close">✕</button></div>
    <div class="orb"></div>
    <div class="w-h1" id="w-title">Hey there!<br>How can I help you?</div>
    <div class="w-p">I'm Abhishek's AI twin — ask me anything about my work, projects, or just say hi.</div>
  </div>

  <div class="prompts" id="prompts">
    <div class="prompts-row">
      <button class="prompt" onclick="sendChip(this)">What do you do?</button>
      <button class="prompt" onclick="sendChip(this)">Show me your best work</button>
    </div>
    <div class="prompts-row" style="margin-top:8px">
      <button class="prompt" onclick="sendChip(this)">How do you approach design?</button>
      <button class="prompt" onclick="sendChip(this)">What are you up to right now?</button>
    </div>
  </div>

  <div class="input-wrap" id="welcome-input">
    <input type="text" id="w-input" placeholder="Ask me anything..." onkeydown="if(event.key==='Enter')sendFromWelcome()"/>
    <button class="mic" id="w-mic" onclick="toggleMic('w-input','w-mic')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="1" width="6" height="11" rx="3"/><path d="M19 10v1a7 7 0 01-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
    </button>
    <button class="send" id="w-send" onclick="sendFromWelcome()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
    </button>
  </div>

  <div class="footer" id="w-footer">AI version of Abhishek · May not know everything</div>

  <!-- CHAT -->
    <div class="chat-head" id="chat-head">
    <img src="https://abhishek-chatbot.vercel.app/avatar.png" alt="A"/>
    <span>Abhishek (AI)</span>
<button onclick="toggleChat()" class="mobile-close" style="background:none;border:none;cursor:pointer;padding:6px 8px;border-radius:8px;color:var(--ink3);font-size:16px;line-height:1;display:none">✕</button>
  </div>
  <div class="msgs" id="msgs"></div>
  <div class="chat-input" id="chat-input">
    <input type="text" id="c-input" placeholder="Type a message..." onkeydown="if(event.key==='Enter')sendMessage()"/>
    <button class="mic" id="c-mic" onclick="toggleMic('c-input','c-mic')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="1" width="6" height="11" rx="3"/><path d="M19 10v1a7 7 0 01-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
    </button>
    <button class="send" id="c-send" onclick="sendMessage()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
    </button>
  </div>
</div>
