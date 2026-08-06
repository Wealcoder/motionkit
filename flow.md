<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MotionKit — Secure Connect Flow</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

_,_::before,\*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}

:root{
--bg:#08080d;
--s1:#0e0e16;
--s2:#13131e;
--s3:#1a1a28;
--border:#ffffff0d;
--border2:#ffffff18;
--purple:#8b5cf6;
--purple2:#6d28d9;
--purple-glow:rgba(139,92,246,.2);
--teal:#06b6d4;
--teal-glow:rgba(6,182,212,.15);
--green:#22c55e;
--green-glow:rgba(34,197,94,.15);
--amber:#f59e0b;
--red:#ef4444;
--wp-blue:#2563eb;
--supa:#3ecf8e;
--supa-glow:rgba(62,207,142,.15);
--text:#f1f5f9;
--muted:#64748b;
--muted2:#94a3b8;
--mono:'IBM Plex Mono',monospace;
--sans:'Outfit',sans-serif;
}

body{
font-family:var(--sans);
background:var(--bg);
color:var(--text);
overflow-x:hidden;
}

/_ ─── GRID BACKGROUND ─── _/
body::before{
content:'';
position:fixed;inset:0;
background-image:
linear-gradient(rgba(139,92,246,.04) 1px,transparent 1px),
linear-gradient(90deg,rgba(139,92,246,.04) 1px,transparent 1px);
background-size:48px 48px;
pointer-events:none;z-index:0;
}

.wrap{position:relative;z-index:1;max-width:1400px;margin:0 auto;padding:60px 40px 100px}

/_ ─── HERO ─── _/
.hero{
text-align:center;
padding:0 0 72px;
position:relative;
}
.hero::after{
content:'';
position:absolute;
bottom:0;left:50%;transform:translateX(-50%);
width:600px;height:1px;
background:linear-gradient(90deg,transparent,var(--purple),var(--teal),transparent);
}
.hero-eyebrow{
display:inline-flex;align-items:center;gap:8px;
background:rgba(139,92,246,.1);
border:1px solid rgba(139,92,246,.25);
border-radius:100px;
padding:6px 18px;
font-size:11px;font-weight:600;
letter-spacing:.12em;text-transform:uppercase;
color:var(--purple);
margin-bottom:24px;
}
.hero-eyebrow-dot{
width:6px;height:6px;border-radius:50%;
background:var(--purple);
animation:glow 2s ease-in-out infinite;
}
@keyframes glow{0%,100%{box-shadow:0 0 4px var(--purple)}50%{box-shadow:0 0 12px var(--purple),0 0 24px var(--purple)}}

.hero h1{
font-size:clamp(40px,6vw,72px);
font-weight:800;
letter-spacing:-.04em;
line-height:1.05;
margin-bottom:16px;
}
.hero h1 span{
background:linear-gradient(135deg,#fff 0%,#c4b5fd 40%,var(--teal) 100%);
-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.hero-sub{
font-family:var(--mono);
font-size:14px;
color:var(--muted);
letter-spacing:.02em;
}
.hero-chips{
display:flex;align-items:center;justify-content:center;gap:10px;
flex-wrap:wrap;
margin-top:20px;
}
.chip{
display:inline-flex;align-items:center;gap:6px;
padding:5px 12px;
border-radius:6px;
font-size:11px;font-weight:600;
font-family:var(--mono);
letter-spacing:.04em;
}
.chip-ok {background:rgba(34,197,94,.1); color:var(--green); border:1px solid rgba(34,197,94,.2);}
.chip-sec {background:rgba(245,158,11,.1);color:var(--amber); border:1px solid rgba(245,158,11,.2);}
.chip-db {background:rgba(62,207,142,.1);color:var(--supa); border:1px solid rgba(62,207,142,.2);}
.chip-wp {background:rgba(37,99,235,.1); color:#60a5fa; border:1px solid rgba(37,99,235,.2);}

/_ ─── SECTION LABELS ─── _/
.sl{
display:flex;align-items:center;gap:14px;
margin-bottom:20px;
}
.sl-num{
width:28px;height:28px;border-radius:50%;
display:flex;align-items:center;justify-content:center;
font-size:12px;font-weight:700;
background:linear-gradient(135deg,var(--purple),var(--purple2));
color:#fff;flex-shrink:0;
}
.sl h2{font-size:20px;font-weight:700;letter-spacing:-.02em;color:#f8fafc;}
.sl-tag{
font-family:var(--mono);font-size:10px;
color:var(--muted);
background:var(--s2);
border:1px solid var(--border2);
padding:3px 10px;border-radius:4px;
}

/_ ─── SCREEN WRAPPER ─── _/
.screen-block{margin-bottom:80px;}

/_ ─── BROWSER CHROME ─── _/
.browser{
border-radius:14px;
overflow:hidden;
box-shadow:0 32px 100px rgba(0,0,0,.8),0 0 0 1px var(--border2);
}
.bbar{
background:#1c1c28;
padding:11px 16px;
display:flex;align-items:center;gap:12px;
border-bottom:1px solid var(--border);
}
.bdots{display:flex;gap:6px;}
.bdots span{width:12px;height:12px;border-radius:50%;}
.bd1{background:#ff5f57;}.bd2{background:#febc2e;}.bd3{background:#28c840;}
.burl{
flex:1;background:#111120;border-radius:6px;
padding:5px 14px;
font-family:var(--mono);font-size:11px;color:#64748b;
overflow:hidden;white-space:nowrap;text-overflow:ellipsis;
}
.burl .hl{color:#86efac;}
.burl .hl2{color:#93c5fd;}
.burl .dim{color:#374151;}
.bssl{
display:flex;align-items:center;gap:4px;
font-family:var(--mono);font-size:10px;color:var(--green);
background:rgba(34,197,94,.08);
padding:3px 8px;border-radius:4px;
border:1px solid rgba(34,197,94,.15);
flex-shrink:0;
}

/_ ─── WP SHELL ─── _/
.wp-shell{display:flex;min-height:500px;background:#f0f0f1;}
.wp-side{
width:200px;background:#1d2327;flex-shrink:0;
}
.wp-brand{
background:#1d2327;
padding:15px 16px 14px;
display:flex;align-items:center;gap:9px;
border-bottom:1px solid #2c3338;
}
.wp-logo{
width:28px;height:28px;border-radius:6px;
background:linear-gradient(135deg,var(--purple),var(--purple2));
display:flex;align-items:center;justify-content:center;
font-size:14px;font-weight:800;color:#fff;flex-shrink:0;
}
.wp-brand-name{font-size:14px;font-weight:700;color:#fff;}
.wp-nav a{
display:flex;align-items:center;gap:9px;
padding:9px 16px;
font-size:12px;color:#a7aaad;
border-left:3px solid transparent;
text-decoration:none;
cursor:default;
}
.wp-nav a.active{background:#2c3338;color:#fff;border-left-color:var(--purple);}
.wp-nav a.sub{padding-left:36px;font-size:11px;}
.wp-nav a.sub.active{color:#c4b5fd;}
.wp-nav .sep{height:1px;background:#2c3338;margin:4px 0;}

.wp-body{flex:1;display:flex;flex-direction:column;}
.wp-topbar{
background:#fff;border-bottom:1px solid #c3c4c7;
padding:10px 24px;
display:flex;align-items:center;justify-content:space-between;
}
.wp-topbar-l{font-size:15px;font-weight:600;color:#1d2327;}
.wp-topbar-r{
display:flex;align-items:center;gap:8px;
font-size:12px;color:#646970;
}
.wp-ava{
width:28px;height:28px;border-radius:50%;
background:linear-gradient(135deg,#a78bfa,var(--purple));
display:flex;align-items:center;justify-content:center;
font-size:12px;font-weight:700;color:#fff;
}
.wp-content{padding:24px 28px;background:#f0f0f1;flex:1;}
.wp-h1{font-size:22px;font-weight:600;color:#1d2327;margin-bottom:6px;}
.wp-breadcrumb{font-size:12px;color:#646970;margin-bottom:22px;}
.wp-breadcrumb a{color:#2271b1;}

/_ Cards _/
.wp-card{
background:#fff;border:1px solid #c3c4c7;
border-radius:4px;
max-width:600px;
margin-bottom:16px;
}
.wp-card-body{padding:22px 24px;}
.wp-card h3{font-size:14px;font-weight:600;color:#1d2327;margin-bottom:8px;}
.wp-card-divider{height:1px;background:#f0f0f1;margin:16px 0;}
.wp-card p{font-size:13px;color:#646970;line-height:1.6;margin-bottom:0;}

/_ status _/
.st-badge{
display:inline-flex;align-items:center;gap:7px;
padding:5px 12px;border-radius:3px;
font-size:13px;font-weight:500;
margin-bottom:16px;
}
.st-not{background:#fef3c7;color:#92400e;border:1px solid #fcd34d;}
.st-yes{background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;}
.st-dot{width:7px;height:7px;border-radius:50%;}
.st-not .st-dot{background:#d97706;}
.st-yes .st-dot{background:#16a34a;animation:pulse2 2s infinite;}
@keyframes pulse2{0%,100%{opacity:1}50%{opacity:.4}}

/_ WP Buttons _/
.btn{
display:inline-flex;align-items:center;gap:7px;
padding:8px 16px;
border-radius:3px;
font-size:13px;font-weight:500;
cursor:default;
font-family:var(--sans);
}
.btn-primary{background:#7c3aed;color:#fff;border:1px solid #6d28d9;}
.btn-secondary{background:#fff;color:#1d2327;border:1px solid #c3c4c7;}
.btn-danger{background:#fff;color:#b91c1c;border:1px solid #fca5a5;}
.btn-account{background:#fff;color:#1d2327;border:1px solid #c3c4c7;}

/_ Success notice _/
.wp-notice{
display:flex;align-items:flex-start;gap:10px;
background:#fff;border-left:4px solid #00a32a;
padding:10px 14px;
max-width:300px;
margin-bottom:18px;
box-shadow:0 2px 8px rgba(0,0,0,.08);
border-radius:0 4px 4px 0;
position:relative;
}
.wp-notice p{font-size:13px;color:#1d2327;}
.wp-notice-x{
position:absolute;right:10px;top:10px;
font-size:14px;color:#646970;cursor:default;
}

/_ Connected card details _/
.conn-row{
padding:12px 0;
border-bottom:1px solid #f0f0f1;
display:flex;align-items:center;justify-content:space-between;
}
.conn-row:last-child{border-bottom:none;}
.conn-label{font-size:13px;color:#646970;}
.conn-label strong{color:#1d2327;font-weight:600;}
.conn-status{
font-size:13px;font-weight:600;
font-style:italic;color:#00a32a;
}

/_ ─── MOTIONKIT AUTH PAGE ─── _/
.mk-page{background:#fff;min-height:520px;display:flex;flex-direction:column;}
.mk-topbar{
padding:16px 40px;border-bottom:1px solid #e5e7eb;
display:flex;align-items:center;gap:10px;
}
.mk-logomark{
width:36px;height:36px;border-radius:9px;
background:linear-gradient(135deg,#7c3aed,#4f46e5);
display:flex;align-items:center;justify-content:center;
}
.mk-wordmark{font-size:18px;font-weight:800;color:#111827;letter-spacing:-.03em;}
.mk-body{
flex:1;display:flex;align-items:center;justify-content:center;
padding:48px 24px;
}
.mk-card{width:100%;max-width:500px;text-align:center;}
.mk-title{
font-size:28px;font-weight:800;color:#111827;
letter-spacing:-.04em;margin-bottom:36px;line-height:1.2;
}
.mk-graphic{
display:flex;align-items:center;justify-content:center;
margin-bottom:32px;
}
.mk-node{display:flex;flex-direction:column;align-items:center;gap:10px;}
.mk-icon{
width:76px;height:76px;border-radius:50%;
display:flex;align-items:center;justify-content:center;
font-size:28px;
}
.mk-icon-site{
background:linear-gradient(135deg,#7c3aed,#4f46e5);
box-shadow:0 0 0 6px #ede9fe;
}
.mk-icon-user{
overflow:hidden;
box-shadow:0 0 0 6px #f3f4f6;
}
.mk-avatar{
width:100%;height:100%;border-radius:50%;
background:linear-gradient(135deg,#6366f1,#8b5cf6);
display:flex;align-items:center;justify-content:center;
font-size:26px;color:#fff;font-weight:800;
}
.mk-node-label{font-size:13px;color:#374151;font-weight:600;}
.mk-node-sub{font-size:11px;color:#9ca3af;text-decoration:underline;text-underline-offset:2px;cursor:default;}
.mk-dashes{
flex:1;max-width:130px;height:2px;margin-bottom:44px;
background-image:repeating-linear-gradient(90deg,#d1d5db 0,#d1d5db 7px,transparent 7px,transparent 14px);
position:relative;
}
.mk-dashes-icon{
position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
width:30px;height:30px;background:#fff;
border:1px solid #e5e7eb;border-radius:50%;
display:flex;align-items:center;justify-content:center;
font-size:13px;color:#9ca3af;
}
.mk-connect-btn{
display:block;width:100%;padding:15px;
background:linear-gradient(135deg,#7c3aed,#6d28d9);
color:#fff;border:none;border-radius:8px;
font-size:16px;font-weight:700;cursor:default;
letter-spacing:-.01em;margin-bottom:16px;
font-family:var(--sans);
}
.mk-terms{font-size:12px;color:#9ca3af;line-height:1.6;}
.mk-terms a{color:#6b7280;text-decoration:underline;}

/_ ─── SUPABASE PANEL ─── _/
.supa-panel{
background:var(--s2);
border:1px solid rgba(62,207,142,.2);
border-radius:14px;
padding:28px 32px;
margin-top:0;
}
.supa-header{
display:flex;align-items:center;gap:12px;
margin-bottom:24px;
}
.supa-logo{
display:flex;align-items:center;gap:8px;
font-size:15px;font-weight:700;color:var(--supa);
letter-spacing:-.02em;
}
.supa-logo-icon{
width:32px;height:32px;border-radius:8px;
background:linear-gradient(135deg,#3ecf8e,#1db57a);
display:flex;align-items:center;justify-content:center;
font-size:16px;
}
.supa-divider{flex:1;height:1px;background:rgba(62,207,142,.1);}
.supa-badge{
font-family:var(--mono);font-size:9px;font-weight:500;
background:rgba(62,207,142,.1);color:var(--supa);
border:1px solid rgba(62,207,142,.2);
padding:3px 8px;border-radius:4px;
letter-spacing:.08em;text-transform:uppercase;
}

.supa-table{width:100%;border-collapse:collapse;}
.supa-table thead tr{border-bottom:1px solid var(--border2);}
.supa-table th{
font-family:var(--mono);font-size:10px;font-weight:500;
color:var(--muted);letter-spacing:.08em;text-transform:uppercase;
padding:8px 12px;text-align:left;
}
.supa-table td{
font-family:var(--mono);font-size:11px;color:var(--muted2);
padding:10px 12px;border-bottom:1px solid var(--border);
}
.supa-table tr:hover td{background:rgba(255,255,255,.02);}
.supa-table .t-key {color:#c4b5fd;}
.supa-table .t-val {color:#f1f5f9;}
.supa-table .t-enc {color:#fcd34d;}
.supa-table .t-time {color:var(--muted);}
.supa-table .t-ok {color:var(--green);}
.supa-table .t-site {color:var(--teal);}

.supa-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;}
.supa-col h4{
font-size:11px;font-weight:600;color:var(--muted2);
letter-spacing:.06em;text-transform:uppercase;
margin-bottom:10px;
display:flex;align-items:center;gap:6px;
}
.supa-col h4::before{content:'';display:block;width:4px;height:12px;border-radius:2px;}
.supa-col.wp-col h4::before{background:var(--wp-blue);}
.supa-col.mk-col h4::before{background:var(--purple);}
.supa-code{
background:rgba(0,0,0,.4);
border:1px solid var(--border2);
border-radius:8px;
padding:14px 16px;
font-family:var(--mono);
font-size:10.5px;
color:var(--muted2);
line-height:1.8;
}
.supa-code .k{color:#c4b5fd;}
.supa-code .v{color:#fcd34d;}
.supa-code .s{color:#86efac;}
.supa-code .c{color:#475569;}
.supa-code .t{color:var(--teal);}

/_ ─── FLOW SECTION ─── _/
.flow-wrap{
background:var(--s1);
border:1px solid var(--border2);
border-radius:16px;
padding:40px;
position:relative;
overflow:hidden;
}
.flow-wrap::before{
content:'';
position:absolute;top:-80px;right:-80px;
width:300px;height:300px;
background:radial-gradient(circle,rgba(139,92,246,.06) 0%,transparent 70%);
pointer-events:none;
}

/_ Phases _/
.flow-phase{margin-bottom:40px;}
.flow-phase-title{
font-family:var(--mono);
font-size:10px;font-weight:600;
letter-spacing:.12em;text-transform:uppercase;
color:var(--muted);
margin-bottom:16px;
display:flex;align-items:center;gap:10px;
}
.flow-phase-title::after{content:'';flex:1;height:1px;background:var(--border);}

.flow-steps{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
gap:12px;
position:relative;
}

/_ connector line between steps _/
.flow-steps::after{
content:'';
position:absolute;
top:30px;left:0;right:0;height:1px;
background:repeating-linear-gradient(90deg,var(--border2) 0,var(--border2) 8px,transparent 8px,transparent 16px);
z-index:0;
}

.fstep{
background:var(--s2);
border-radius:10px;
padding:16px;
border:1px solid var(--border2);
position:relative;z-index:1;
transition:border-color .2s,transform .2s;
animation:fadeUp .5s ease both;
}
.fstep:hover{transform:translateY(-3px);}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

.fstep.c-wp {border-top:2px solid var(--wp-blue);}
.fstep.c-mk {border-top:2px solid var(--purple);}
.fstep.c-supa {border-top:2px solid var(--supa);}
.fstep.c-jwt {border-top:2px solid var(--amber);}
.fstep.c-site {border-top:2px solid var(--teal);}

.fstep-num{
position:absolute;top:-11px;left:14px;
font-family:var(--mono);font-size:9px;font-weight:600;
padding:2px 8px;border-radius:100px;
}
.c-wp .fstep-num{background:rgba(37,99,235,.15);color:#93c5fd;border:1px solid rgba(37,99,235,.25);}
.c-mk .fstep-num{background:rgba(139,92,246,.15);color:#c4b5fd;border:1px solid rgba(139,92,246,.25);}
.c-supa .fstep-num{background:rgba(62,207,142,.12);color:var(--supa);border:1px solid rgba(62,207,142,.2);}
.c-jwt .fstep-num{background:rgba(245,158,11,.12);color:#fcd34d;border:1px solid rgba(245,158,11,.2);}
.c-site .fstep-num{background:rgba(6,182,212,.12);color:#67e8f9;border:1px solid rgba(6,182,212,.2);}

.fstep-icon{font-size:20px;margin-bottom:8px;}
.fstep-title{font-size:12px;font-weight:700;margin-bottom:5px;line-height:1.3;}
.c-wp .fstep-title{color:#93c5fd;}
.c-mk .fstep-title{color:#c4b5fd;}
.c-supa .fstep-title{color:var(--supa);}
.c-jwt .fstep-title{color:#fcd34d;}
.c-site .fstep-title{color:#67e8f9;}

.fstep-desc{font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.55;}

/_ Arrow between phases _/
.phase-arrow{
text-align:center;
margin:8px 0 24px;
font-size:20px;
color:var(--purple);
opacity:.5;
}

/_ Security callout _/
.sec-callout{
display:grid;grid-template-columns:repeat(3,1fr);gap:16px;
margin-top:32px;
}
.sec-item{
background:rgba(0,0,0,.3);
border:1px solid var(--border2);
border-radius:10px;
padding:16px;
display:flex;align-items:flex-start;gap:12px;
}
.sec-item-icon{font-size:22px;flex-shrink:0;}
.sec-item-title{font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px;}
.sec-item-desc{font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.5;}

/_ Divider _/
.divider{
height:1px;
background:linear-gradient(90deg,transparent,var(--border2),transparent);
margin:64px 0;
}

/_ Two col _/
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
.screen-tag{
font-family:var(--mono);font-size:10px;
color:var(--muted);letter-spacing:.08em;text-transform:uppercase;
margin-bottom:10px;
display:flex;align-items:center;gap:8px;
}
.screen-tag::before{
content:'';display:block;
width:6px;height:6px;border-radius:50%;
background:var(--purple);
}

@media(max-width:900px){
.wrap{padding:32px 20px 80px;}
.two-col{grid-template-columns:1fr;}
.supa-cols{grid-template-columns:1fr;}
.sec-callout{grid-template-columns:1fr;}
.wp-side{width:140px;}
.flow-steps::after{display:none;}
}
</style>

</head>
<body>
<div class="wrap">

  <!-- ═══ HERO ═══ -->
  <div class="hero">
    <div class="hero-eyebrow"><span class="hero-eyebrow-dot"></span>Presentation · Security Architecture</div>
    <h1><span>MotionKit</span><br>Secure Connect Flow</h1>
    <p class="hero-sub">WordPress Dashboard → OAuth → Supabase → JWT editor session</p>
    <div class="hero-chips">
      <span class="chip chip-ok">✓ 100% WP Admin Auth</span>
      <span class="chip chip-sec">⚡ JWT Single-Use Tokens</span>
      <span class="chip chip-db">🗄 Supabase Token Store</span>
      <span class="chip chip-wp">🔷 Zero Password Sharing</span>
    </div>
  </div>

  <!-- ═══ SCREEN 1: NOT CONNECTED ═══ -->
  <div class="screen-block">
    <div class="sl">
      <div class="sl-num">1</div>
      <h2>WordPress Admin — Connect Settings</h2>
      <span class="sl-tag">Not connected state</span>
    </div>
    <div class="browser">
      <div class="bbar">
        <div class="bdots"><span class="bd1"></span><span class="bd2"></span><span class="bd3"></span></div>
        <div class="burl"><span class="hl">yoursite.com</span><span class="dim">/wp-admin/admin.php?page=motionkit-connect</span></div>
        <div class="bssl">🔒 Secure</div>
      </div>
      <div class="wp-shell">
        <div class="wp-side">
          <div class="wp-brand"><div class="wp-logo">M</div><span class="wp-brand-name">MotionKit</span></div>
          <nav class="wp-nav">
            <a href="#">🏠 <span>Dashboard</span></a>
            <a href="#">📄 <span>Posts</span></a>
            <a href="#">📃 <span>Pages</span></a>
            <div class="sep"></div>
            <a href="#" class="active">⚡ MotionKit</a>
            <a href="#" class="sub active">Connect</a>
            <a href="#" class="sub">Animations</a>
            <a href="#" class="sub">Settings</a>
            <div class="sep"></div>
            <a href="#">⚙️ Settings</a>
          </nav>
        </div>
        <div class="wp-body">
          <div class="wp-topbar">
            <span class="wp-topbar-l">MotionKit</span>
            <div class="wp-topbar-r"><div class="wp-ava">R</div> rayhan.wealcoder@gmail.com</div>
          </div>
          <div class="wp-content">
            <div class="wp-h1">Connect Settings</div>
            <p class="wp-breadcrumb">MotionKit → <a href="#">Connect</a></p>
            <div class="wp-card">
              <div class="wp-card-body">
                <h3>Connect your MotionKit Account</h3>
                <div class="wp-card-divider"></div>
                <div class="st-badge st-not">
                  <span class="st-dot"></span>Not connected
                </div>
                <p style="margin-bottom:20px">Gain access to the visual GSAP animation editor and connect your site to your MotionKit dashboard to start building stunning animations.</p>
                <button class="btn btn-primary">🔗 Connect to MotionKit</button>
              </div>
            </div>
            <div style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;padding:12px 16px;max-width:600px;display:flex;align-items:flex-start;gap:10px;">
              <span style="font-size:16px;flex-shrink:0">🔒</span>
              <p style="font-size:12px;color:#646970;line-height:1.6"><strong style="color:#1d2327">How it works:</strong> Clicking "Connect" will redirect you to <strong style="color:#7c3aed">motionkit.io</strong> to authorize this site. A secure token will be stored both in your WordPress database and our Supabase cloud — no passwords shared.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- ═══ SCREEN 2: MOTIONKIT AUTHORIZE ═══ -->
  <div class="screen-block">
    <div class="sl">
      <div class="sl-num">2</div>
      <h2>motionkit.io — Authorization Page</h2>
      <span class="sl-tag">Browser redirects here automatically</span>
    </div>
    <div class="two-col">
      <div>
        <div class="screen-tag">my.motionkit.io/connect/authorize</div>
        <div class="browser">
          <div class="bbar">
            <div class="bdots"><span class="bd1"></span><span class="bd2"></span><span class="bd3"></span></div>
            <div class="burl">my.motionkit.io/connect/authorize?<span class="hl2">state=8f3a…</span>&site=<span class="hl">yoursite.com</span>&response_type=code</div>
            <div class="bssl">🔒 Secure</div>
          </div>
          <div class="mk-page">
            <div class="mk-topbar">
              <div class="mk-logomark">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 18L12 6L18 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 13.5H15.5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
              </div>
              <div class="mk-wordmark">MotionKit</div>
            </div>
            <div class="mk-body">
              <div class="mk-card">
                <h2 class="mk-title">Connect Your Site to<br>MotionKit</h2>
                <div class="mk-graphic">
                  <div class="mk-node">
                    <div class="mk-icon mk-icon-site">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M6 18L12 6L18 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 13.5H15.5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
                    </div>
                    <div class="mk-node-label">yoursite.com</div>
                  </div>
                  <div class="mk-dashes"><div class="mk-dashes-icon">🔗</div></div>
                  <div class="mk-node">
                    <div class="mk-icon mk-icon-user">
                      <div class="mk-avatar">R</div>
                    </div>
                    <div class="mk-node-label">rayhan.wealcoder@gmail.com</div>
                    <div class="mk-node-sub">Switch User</div>
                  </div>
                </div>
                <button class="mk-connect-btn">Connect</button>
                <div class="mk-terms">By connecting, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px;padding-top:32px">
        <div style="background:var(--s2);border:1px solid rgba(245,158,11,.2);border-radius:10px;padding:16px">
          <div style="font-size:11px;font-weight:700;color:#fcd34d;margin-bottom:8px">① State Token (CSRF Protection)</div>
          <div style="font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.7">
            WP generates random 32-byte <span style="color:#fcd34d">state</span> token<br>
            Stored as WP transient (10 min TTL)<br>
            Sent in redirect URL for validation
          </div>
        </div>
        <div style="background:var(--s2);border:1px solid rgba(139,92,246,.2);border-radius:10px;padding:16px">
          <div style="font-size:11px;font-weight:700;color:#c4b5fd;margin-bottom:8px">② User Confirms Identity</div>
          <div style="font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.7">
            Shows: site domain + logged-in email<br>
            User must <span style="color:#c4b5fd">actively click Connect</span><br>
            Cannot be faked or bypassed
          </div>
        </div>
        <div style="background:var(--s2);border:1px solid rgba(62,207,142,.2);border-radius:10px;padding:16px">
          <div style="font-size:11px;font-weight:700;color:var(--supa);margin-bottom:8px">③ One-Time Auth Code Issued</div>
          <div style="font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.7">
            motionkit.io issues short-lived code<br>
            302 redirect back to WP callback<br>
            <span style="color:var(--supa)">?code=abc&state=8f3a…</span>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div class="divider"></div>

  <!-- ═══ SUPABASE TOKEN STORAGE ═══ -->
  <div class="screen-block">
    <div class="sl">
      <div class="sl-num">3</div>
      <h2>Token Storage — WordPress + Supabase</h2>
      <span class="sl-tag">Dual storage after successful OAuth</span>
    </div>

    <div class="supa-panel">
      <div class="supa-header">
        <div class="supa-logo">
          <div class="supa-logo-icon">🗄</div>
          Supabase Database — <span style="opacity:.6">motionkit_connections</span>
        </div>
        <div class="supa-divider"></div>
        <span class="supa-badge">Live · Encrypted</span>
      </div>

      <table class="supa-table">
        <thead>
          <tr>
            <th>id</th>
            <th>site_url</th>
            <th>wp_user_email</th>
            <th>access_token</th>
            <th>token_hash</th>
            <th>connected_at</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="t-val">uuid-001</td>
            <td class="t-site">yoursite.com</td>
            <td class="t-val">rayhan@gmail.com</td>
            <td class="t-enc">enc::AES256::8f3a…c291</td>
            <td class="t-enc">sha256:d4f8…</td>
            <td class="t-time">2025-01-09 14:32:01</td>
            <td class="t-ok">● active</td>
          </tr>
          <tr style="opacity:.4">
            <td class="t-val">uuid-002</td>
            <td class="t-site">demo.site.com</td>
            <td class="t-val">user@example.com</td>
            <td class="t-enc">enc::AES256::2b7f…a104</td>
            <td class="t-enc">sha256:f2c1…</td>
            <td class="t-time">2025-01-08 10:12:44</td>
            <td class="t-ok">● active</td>
          </tr>
        </tbody>
      </table>

      <div class="supa-cols">
        <div class="supa-col wp-col">
          <h4>WordPress (wp_options)</h4>
          <div class="supa-code">

<span class="c">// Stored after OAuth callback</span><br>
update_option(<span class="v">'mk_access_token'</span>,<br>
&nbsp;&nbsp;<span class="s">encrypt</span>(<span class="k">$token</span>)  <span class="c">// AES-256</span><br>
)<br>
update_option(<span class="v">'mk_user_email'</span>,<br>
&nbsp;&nbsp;<span class="k">$user_email</span><br>
)<br>
update_option(<span class="v">'mk_connected_at'</span>,<br>
&nbsp;&nbsp;current_time(<span class="v">'mysql'</span>)<br>
)<br><br>
<span class="c">// Used to generate JWT for editor</span><br>
<span class="t">JwtTokenManager</span>::generate(<br>
&nbsp;&nbsp;get_option(<span class="v">'mk_access_token'</span>)<br>
)
</div>
</div>
<div class="supa-col mk-col">
<h4>Supabase (motionkit.io)</h4>
<div class="supa-code">
<span class="c">// motionkit.io stores connection</span><br>
await supabase<br>
&nbsp;&nbsp;.from(<span class="v">'connections'</span>)<br>
&nbsp;&nbsp;.upsert({<br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">site_url</span>: <span class="v">params.site_url</span>,<br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">email</span>: <span class="v">user.email</span>,<br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">access_token</span>: <span class="s">encrypt</span>(token),<br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">token_hash</span>: <span class="s">sha256</span>(token),<br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">status</span>: <span class="v">'active'</span><br>
&nbsp;&nbsp;})<br><br>
<span class="c">// Validates JWT on editor open</span><br>
<span class="c">// via token_hash comparison</span>
</div>
</div>
</div>
</div>

  </div>

  <div class="divider"></div>

  <!-- ═══ SCREEN 4: CONNECTED STATE ═══ -->
  <div class="screen-block">
    <div class="sl">
      <div class="sl-num">4</div>
      <h2>WordPress Admin — Connected State</h2>
      <span class="sl-tag">After successful OAuth + token storage</span>
    </div>
    <div class="browser">
      <div class="bbar">
        <div class="bdots"><span class="bd1"></span><span class="bd2"></span><span class="bd3"></span></div>
        <div class="burl"><span class="hl">yoursite.com</span><span class="dim">/wp-admin/admin.php?page=motionkit-connect&connected=1</span></div>
        <div class="bssl">🔒 Secure</div>
      </div>
      <div class="wp-shell">
        <div class="wp-side">
          <div class="wp-brand"><div class="wp-logo">M</div><span class="wp-brand-name">MotionKit</span></div>
          <nav class="wp-nav">
            <a href="#">🏠 Dashboard</a>
            <a href="#">📄 Posts</a>
            <a href="#">📃 Pages</a>
            <div class="sep"></div>
            <a href="#" class="active">⚡ MotionKit</a>
            <a href="#" class="sub active">Connect</a>
            <a href="#" class="sub">Animations</a>
            <a href="#" class="sub">Settings</a>
            <div class="sep"></div>
            <a href="#">⚙️ Settings</a>
          </nav>
        </div>
        <div class="wp-body">
          <div class="wp-topbar">
            <span class="wp-topbar-l">MotionKit</span>
            <div class="wp-topbar-r"><div class="wp-ava">R</div> rayhan.wealcoder@gmail.com</div>
          </div>
          <div class="wp-content">
            <div class="wp-h1">Connect Settings</div>
            <p class="wp-breadcrumb">MotionKit → <a href="#">Connect</a></p>

            <!-- Success notice -->
            <div class="wp-notice">
              <span style="font-size:15px;color:#00a32a">✓</span>
              <p>Connected successfully.</p>
              <span class="wp-notice-x">✕</span>
            </div>

            <div class="wp-card" style="max-width:540px">
              <div class="wp-card-body">
                <div class="conn-row">
                  <span class="conn-label"><strong>Status:</strong></span>
                  <span class="conn-status">Connected</span>
                  <button class="btn btn-account" style="margin-left:auto">My Account</button>
                </div>
                <div class="conn-row">
                  <span class="conn-label">You're connected as <strong>rayhan.wealcoder@gmail.com</strong></span>
                </div>
                <div class="conn-row" style="align-items:center">
                  <span class="conn-label">Want to disconnect for any reason?</span>
                  <button class="btn btn-danger" style="margin-left:auto">Disconnect</button>
                </div>
              </div>
            </div>

            <div style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;padding:16px 20px;max-width:540px;margin-top:16px">
              <p style="font-size:13px;font-weight:600;color:#1d2327;margin-bottom:12px">🚀 Open the Editor</p>
              <p style="font-size:12px;color:#646970;margin-bottom:16px;line-height:1.6">Your site is connected. Open any post or page and click <strong>"Edit with MotionKit"</strong> — or use the button below to launch the editor directly.</p>
              <button class="btn btn-primary">⚡ Open MotionKit Editor</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div class="divider"></div>

  <!-- ═══ COMPLETE FLOW ═══ -->
  <div class="screen-block">
    <div class="sl">
      <div class="sl-num">5</div>
      <h2>Complete Security Flow</h2>
      <span class="sl-tag">End-to-end authentication architecture</span>
    </div>

    <div class="flow-wrap">

      <div class="flow-phase">
        <div class="flow-phase-title">Phase 1 — OAuth Connect (One Time Setup)</div>
        <div class="flow-steps" style="grid-template-columns:repeat(5,1fr)">
          <div class="fstep c-wp" style="animation-delay:.05s">
            <div class="fstep-num">STEP 1</div>
            <div class="fstep-icon">🔷</div>
            <div class="fstep-title">Click Connect</div>
            <div class="fstep-desc">WP Admin clicks button. PHP generates state token (CSRF). Redirects to motionkit.io.</div>
          </div>
          <div class="fstep c-mk" style="animation-delay:.1s">
            <div class="fstep-num">STEP 2</div>
            <div class="fstep-icon">⚡</div>
            <div class="fstep-title">Authorize Page</div>
            <div class="fstep-desc">User sees site + account. Confirms identity by clicking Connect.</div>
          </div>
          <div class="fstep c-mk" style="animation-delay:.15s">
            <div class="fstep-num">STEP 3</div>
            <div class="fstep-icon">🎟</div>
            <div class="fstep-title">Auth Code Issued</div>
            <div class="fstep-desc">motionkit.io issues one-time code. Redirects back to WP callback URL.</div>
          </div>
          <div class="fstep c-wp" style="animation-delay:.2s">
            <div class="fstep-num">STEP 4</div>
            <div class="fstep-icon">✅</div>
            <div class="fstep-title">WP Validates</div>
            <div class="fstep-desc">State token verified. Code exchanged for long-lived access token.</div>
          </div>
          <div class="fstep c-supa" style="animation-delay:.25s">
            <div class="fstep-num">STEP 5</div>
            <div class="fstep-icon">🗄</div>
            <div class="fstep-title">Dual Token Save</div>
            <div class="fstep-desc">Token stored in wp_options (AES-256 encrypted) <strong style="color:var(--supa)">AND</strong> Supabase.</div>
          </div>
        </div>
      </div>

      <div class="phase-arrow">↓</div>

      <div class="flow-phase">
        <div class="flow-phase-title">Phase 2 — Editor Session (Every Launch)</div>
        <div class="flow-steps" style="grid-template-columns:repeat(5,1fr)">
          <div class="fstep c-wp" style="animation-delay:.3s">
            <div class="fstep-num">STEP 6</div>
            <div class="fstep-icon">🚀</div>
            <div class="fstep-title">Click "Open Editor"</div>
            <div class="fstep-desc">WP Admin clicks button. Only works for logged-in manage_options users.</div>
          </div>
          <div class="fstep c-jwt" style="animation-delay:.35s">
            <div class="fstep-num">STEP 7</div>
            <div class="fstep-icon">🔑</div>
            <div class="fstep-title">JWT Generated</div>
            <div class="fstep-desc">HMAC-SHA256. 5-min TTL. Single-use jti. Redirect to motionkit.io/editor.</div>
          </div>
          <div class="fstep c-mk" style="animation-delay:.4s">
            <div class="fstep-num">STEP 8</div>
            <div class="fstep-icon">🖼</div>
            <div class="fstep-title">iframe Loaded</div>
            <div class="fstep-desc">motionkit.io validates JWT against Supabase token_hash. Opens customer site in iframe.</div>
          </div>
          <div class="fstep c-site" style="animation-delay:.45s">
            <div class="fstep-num">STEP 9</div>
            <div class="fstep-icon">🌐</div>
            <div class="fstep-title">PHP Validates JWT</div>
            <div class="fstep-desc">Frontend.php verifies signature + expiry + jti. Injects nonce + ajaxurl.</div>
          </div>
          <div class="fstep c-site" style="animation-delay:.5s">
            <div class="fstep-num">STEP 10 ✓</div>
            <div class="fstep-icon">🎨</div>
            <div class="fstep-title">Editor is Live</div>
            <div class="fstep-desc">postMessage "mk-ready" sent. Editor uses nonce for all AJAX save calls.</div>
          </div>
        </div>
      </div>

      <div class="phase-arrow">↓</div>

      <!-- ── PHASE 3: REST API / AJAX Config Store ── -->
      <div class="flow-phase">
        <div class="flow-phase-title">Phase 3 — Settings Store via AJAX (Every Save)</div>
        <div class="flow-steps" style="grid-template-columns:repeat(4,1fr)">
          <div class="fstep c-mk" style="animation-delay:.55s">
            <div class="fstep-num">STEP 11</div>
            <div class="fstep-icon">🎨</div>
            <div class="fstep-title">User Edits Animation</div>
            <div class="fstep-desc">motionkit.io editor builds the config object per device breakpoint and triggers a save.</div>
          </div>
          <div class="fstep c-mk" style="animation-delay:.6s">
            <div class="fstep-num">STEP 12</div>
            <div class="fstep-icon">📤</div>
            <div class="fstep-title">AJAX POST Sent</div>
            <div class="fstep-desc">Editor posts to <code style="color:#c4b5fd">admin-ajax.php</code> inside the iframe using nonce + ajaxurl received from "mk-ready".</div>
          </div>
          <div class="fstep c-wp" style="animation-delay:.65s">
            <div class="fstep-num">STEP 13</div>
            <div class="fstep-icon">🔐</div>
            <div class="fstep-title">WP Validates & Saves</div>
            <div class="fstep-desc">Nonce checked, capability verified, JSON decoded. Config saved to post_meta / term_meta / wp_option.</div>
          </div>
          <div class="fstep c-site" style="animation-delay:.7s">
            <div class="fstep-num">STEP 14 ✓</div>
            <div class="fstep-icon">✅</div>
            <div class="fstep-title">Success Response</div>
            <div class="fstep-desc"><code style="color:#6ee7b7">wp_send_json_success</code> returns saved configs. Editor confirms save state to user.</div>
          </div>
        </div>
      </div>

      <!-- REST API Detail Panel -->
      <div style="margin-top:28px;background:var(--s1);border:1px solid var(--border2);border-radius:14px;overflow:hidden;">

        <!-- Tab bar -->
        <div style="display:flex;border-bottom:1px solid var(--border2);background:rgba(0,0,0,.3);">
          <div style="padding:12px 20px;font-family:var(--mono);font-size:11px;font-weight:600;color:#c4b5fd;border-bottom:2px solid var(--purple);cursor:default;">POST · Save Page Config</div>
          <div style="padding:12px 20px;font-family:var(--mono);font-size:11px;color:var(--muted);border-bottom:2px solid transparent;cursor:default;">POST · Delete Page Config</div>
          <div style="padding:12px 20px;font-family:var(--mono);font-size:11px;color:var(--muted);border-bottom:2px solid transparent;cursor:default;">POST · Save Global Config</div>
          <div style="padding:12px 20px;font-family:var(--mono);font-size:11px;color:var(--muted);border-bottom:2px solid transparent;cursor:default;">POST · Delete Global Config</div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;">

          <!-- Request -->
          <div style="padding:24px;border-right:1px solid var(--border);">
            <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:14px;display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#3b82f6;"></span>REQUEST
            </div>
            <div style="font-family:var(--mono);font-size:10.5px;line-height:1.9;color:var(--muted2);">
              <span style="color:#64748b;">// Endpoint</span><br>
              <span style="color:#60a5fa;">POST</span> yoursite.com/wp-admin/<span style="color:#f1f5f9;">admin-ajax.php</span><br><br>
              <span style="color:#64748b;">// Required headers</span><br>
              Content-Type: <span style="color:#fcd34d;">application/x-www-form-urlencoded</span><br><br>
              <span style="color:#64748b;">// Form body fields</span><br>
              action=<span style="color:#c4b5fd;">wcf_anim_builder_configs_store</span><br>
              wcf_nonce=<span style="color:#fcd34d;">{{ nonce from mk-ready }}</span><br>
              pageTypeConfigs=<span style="color:#86efac;">{{ JSON string }}</span><br>
              animationConfigs=<span style="color:#86efac;">{{ JSON string }}</span>
            </div>
          </div>

          <!-- Payload detail -->
          <div style="padding:24px;border-right:1px solid var(--border);">
            <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:14px;display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;"></span>PAYLOAD STRUCTURE
            </div>
            <div style="font-family:var(--mono);font-size:10px;line-height:1.9;color:var(--muted2);">
              <span style="color:#64748b;">// pageTypeConfigs — tells WP where to save</span><br>
              {<br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"store_type"</span>: <span style="color:#fcd34d;">"post_meta"</span>,&nbsp;<span style="color:#64748b;">// post_meta | term_meta | option</span><br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"id"</span>: <span style="color:#86efac;">42</span>,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#64748b;">// post_id or term_id</span><br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"option"</span>: <span style="color:#fcd34d;">"motionkit_pg_animation_42"</span><br>
              }<br><br>
              <span style="color:#64748b;">// animationConfigs — the animation data</span><br>
              {<br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"desktop"</span>: [ <span style="color:#64748b;">/* animation objects */</span> ],<br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"laptop"</span>:  [ <span style="color:#64748b;">/* animation objects */</span> ],<br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"tab_land"</span>:[ <span style="color:#64748b;">/* animation objects */</span> ],<br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"tab"</span>:     [ <span style="color:#64748b;">/* animation objects */</span> ],<br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"mobile"</span>:  [ <span style="color:#64748b;">/* animation objects */</span> ]<br>
              }
            </div>
          </div>

          <!-- Response -->
          <div style="padding:24px;">
            <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:14px;display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--green);"></span>RESPONSE
            </div>
            <div style="font-family:var(--mono);font-size:10.5px;line-height:1.9;color:var(--muted2);">
              <span style="color:#64748b;">// 200 Success</span><br>
              {<br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"success"</span>: <span style="color:#86efac;">true</span>,<br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"data"</span>: {<br>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c4b5fd;">"msg"</span>: <span style="color:#fcd34d;">"Configurations saved"</span>,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c4b5fd;">"configs"</span>: { <span style="color:#64748b;">/* saved object */</span> }<br>
              &nbsp;&nbsp;}<br>
              }<br><br>
              <span style="color:#64748b;">// Error states</span><br>
              400 → <span style="color:#f87171;">Missing / invalid JSON</span><br>
              403 → <span style="color:#f87171;">Nonce fail / no capability</span><br>
              200 → <span style="color:#f87171;">success: false (WP error)</span>
            </div>
          </div>
        </div>

        <!-- All 4 endpoints table -->
        <div style="border-top:1px solid var(--border);padding:24px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:16px;">All 4 AJAX Endpoints</div>
          <table style="width:100%;border-collapse:collapse;font-family:var(--mono);font-size:10.5px;">
            <thead>
              <tr style="border-bottom:1px solid var(--border2);">
                <th style="text-align:left;padding:8px 12px;color:var(--muted);font-weight:500;letter-spacing:.06em;">action</th>
                <th style="text-align:left;padding:8px 12px;color:var(--muted);font-weight:500;letter-spacing:.06em;">POST params</th>
                <th style="text-align:left;padding:8px 12px;color:var(--muted);font-weight:500;letter-spacing:.06em;">storage target</th>
                <th style="text-align:left;padding:8px 12px;color:var(--muted);font-weight:500;letter-spacing:.06em;">description</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:10px 12px;color:#c4b5fd;">wcf_anim_builder_configs_store</td>
                <td style="padding:10px 12px;color:#fcd34d;">pageTypeConfigs, animationConfigs</td>
                <td style="padding:10px 12px;color:#67e8f9;">post_meta / term_meta / option</td>
                <td style="padding:10px 12px;color:var(--muted2);">Save page-specific animation config</td>
              </tr>
              <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:10px 12px;color:#c4b5fd;">wcf_anim_builder_configs_delete</td>
                <td style="padding:10px 12px;color:#fcd34d;">pageTypeConfigs</td>
                <td style="padding:10px 12px;color:#67e8f9;">post_meta / term_meta / option</td>
                <td style="padding:10px 12px;color:var(--muted2);">Delete page-specific animation config</td>
              </tr>
              <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:10px 12px;color:#c4b5fd;">wcf_anim_builder_gl_configs_store</td>
                <td style="padding:10px 12px;color:#fcd34d;">animationConfigs</td>
                <td style="padding:10px 12px;color:var(--supa);">wp_options (global)</td>
                <td style="padding:10px 12px;color:var(--muted2);">Save global animation config (all pages)</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;color:#c4b5fd;">wcf_anim_builder_gl_configs_delete</td>
                <td style="padding:10px 12px;color:var(--muted);">— (none)</td>
                <td style="padding:10px 12px;color:var(--supa);">wp_options (global)</td>
                <td style="padding:10px 12px;color:var(--muted2);">Delete entire global config</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- JS Usage Example -->
        <div style="border-top:1px solid var(--border);padding:24px;display:grid;grid-template-columns:1fr 1fr;gap:24px;">
          <div>
            <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:14px;display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#c4b5fd;"></span>motionkit.io — JS Usage (save)
            </div>
            <div style="background:rgba(0,0,0,.4);border:1px solid var(--border2);border-radius:8px;padding:16px;font-family:var(--mono);font-size:10px;line-height:1.9;color:var(--muted2);">
              <span style="color:#64748b;">// Received from postMessage "mk-ready"</span><br>
              <span style="color:#60a5fa;">const</span> { nonce, ajaxurl, siteData } = e.data<br><br>
              <span style="color:#64748b;">// Build form data</span><br>
              <span style="color:#60a5fa;">const</span> body = <span style="color:#60a5fa;">new</span> <span style="color:#f1f5f9;">URLSearchParams</span>({<br>
              &nbsp;&nbsp;action: <span style="color:#fcd34d;">'wcf_anim_builder_configs_store'</span>,<br>
              &nbsp;&nbsp;wcf_nonce: <span style="color:#c4b5fd;">nonce</span>,<br>
              &nbsp;&nbsp;pageTypeConfigs: <span style="color:#f1f5f9;">JSON.stringify</span>(<span style="color:#c4b5fd;">siteData</span>.pageTypeConfigs),<br>
              &nbsp;&nbsp;animationConfigs: <span style="color:#f1f5f9;">JSON.stringify</span>(<span style="color:#86efac;">animConfig</span>)<br>
              })<br><br>
              <span style="color:#64748b;">// POST to WP AJAX</span><br>
              <span style="color:#60a5fa;">const</span> res = <span style="color:#60a5fa;">await</span> <span style="color:#f1f5f9;">fetch</span>(<span style="color:#c4b5fd;">ajaxurl</span>, {<br>
              &nbsp;&nbsp;method: <span style="color:#fcd34d;">'POST'</span>,<br>
              &nbsp;&nbsp;body<br>
              })<br>
              <span style="color:#60a5fa;">const</span> json = <span style="color:#60a5fa;">await</span> res.<span style="color:#f1f5f9;">json</span>()<br>
              <span style="color:#60a5fa;">if</span> (json.success) <span style="color:#86efac;">showSaveConfirm</span>()
            </div>
          </div>
          <div>
            <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:14px;display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#3ecf8e;"></span>animationConfigs — full shape
            </div>
            <div style="background:rgba(0,0,0,.4);border:1px solid var(--border2);border-radius:8px;padding:16px;font-family:var(--mono);font-size:10px;line-height:1.9;color:var(--muted2);">
              {<br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"desktop"</span>: [{<br>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c4b5fd;">"type"</span>: <span style="color:#fcd34d;">"preset"</span>,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c4b5fd;">"preset_key"</span>: <span style="color:#fcd34d;">"fadeInUp"</span>,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c4b5fd;">"selector"</span>: <span style="color:#fcd34d;">".hero-title"</span>,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c4b5fd;">"is_active"</span>: <span style="color:#86efac;">true</span>,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c4b5fd;">"duration"</span>: <span style="color:#86efac;">0.8</span>,<br>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c4b5fd;">"delay"</span>: <span style="color:#86efac;">0.2</span><br>
              &nbsp;&nbsp;}],<br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"laptop"</span>:  [ <span style="color:#64748b;">/* … */</span> ],<br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"tab_land"</span>:[ <span style="color:#64748b;">/* … */</span> ],<br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"tab"</span>:     [ <span style="color:#64748b;">/* … */</span> ],<br>
              &nbsp;&nbsp;<span style="color:#c4b5fd;">"mobile"</span>:  [ <span style="color:#64748b;">/* … */</span> ]<br>
              }
            </div>
          </div>
        </div>

      </div><!-- /REST API detail panel -->

      <!-- Security properties -->
      <div class="sec-callout">
        <div class="sec-item">
          <span class="sec-item-icon">🔐</span>
          <div>
            <div class="sec-item-title">100% WP Admin Gated</div>
            <div class="sec-item-desc">Connect button only available to logged-in WordPress users with <code style="color:#c4b5fd">manage_options</code> capability. No external access possible.</div>
          </div>
        </div>
        <div class="sec-item">
          <span class="sec-item-icon">⚡</span>
          <div>
            <div class="sec-item-title">Dual Token Validation</div>
            <div class="sec-item-desc">Every editor session JWT is verified by both WordPress (HMAC signature) and Supabase (token_hash comparison). Two independent checks.</div>
          </div>
        </div>
        <div class="sec-item">
          <span class="sec-item-icon">🗄</span>
          <div>
            <div class="sec-item-title">Encrypted at Rest</div>
            <div class="sec-item-desc">Access token AES-256 encrypted in wp_options. Supabase stores only the hash. Raw token never logged or exposed in URLs.</div>
          </div>
        </div>
      </div>

    </div>

  </div>

</div>
</body>
</html>
