(function(){
  const defaults = {
    '--brand':'#0b5fff',
    '--accent':'#0b5fff',
    '--bg':'#f8f9fb',
    '--muted':'#666',
    'logo':'assets/logo.png'
  };

  function apply(settings){
    Object.keys(settings).forEach(k=>{
      if(k.startsWith('--')) document.documentElement.style.setProperty(k, settings[k]);
    });
    const logo = settings.logo || defaults.logo;
    const logoEl = document.querySelector('.logo img');
    if(logoEl) logoEl.src = logo;
  }

  function load(){
    try{
      const raw = localStorage.getItem('be-y-tar-theme');
      return raw ? JSON.parse(raw) : Object.assign({}, defaults);
    }catch(e){
      return Object.assign({}, defaults);
    }
  }

  function save(settings){
    localStorage.setItem('be-y-tar-theme', JSON.stringify(settings));
  }

  function buildPanel(initial){
    const panel = document.createElement('div');
    panel.id = 'themeEditor';
    panel.style.cssText = 'position:fixed;right:18px;bottom:18px;background:#fff;border:1px solid #e6e9ef;padding:12px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.08);z-index:9999;font-family:inherit;font-size:14px';
    panel.innerHTML = `
      <strong style="display:block;margin-bottom:8px">Theme Editor</strong>
      <label style="display:block;margin-bottom:6px">Brand color <input type="color" id="teBrand" style="margin-left:8px"></label>
      <label style="display:block;margin-bottom:6px">Accent color <input type="color" id="teAccent" style="margin-left:8px"></label>
      <label style="display:block;margin-bottom:6px">Background <input type="color" id="teBg" style="margin-left:8px"></label>
      <label style="display:block;margin-bottom:6px">Muted <input type="color" id="teMuted" style="margin-left:8px"></label>
      <label style="display:block;margin-bottom:6px">Logo URL <input type="text" id="teLogo" placeholder="https://..." style="width:170px;margin-left:8px"></label>
      <label style="display:block;margin-bottom:8px">Or upload logo <input type="file" id="teLogoFile" accept="image/*" style="margin-left:8px"></label>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="teReset" style="padding:6px 8px">Reset</button>
        <button id="teSave" style="padding:6px 8px;background:var(--accent);color:#fff;border:0;border-radius:6px">Save</button>
      </div>
      <small style="display:block;margin-top:8px;color:#888">Preview only (local). Replace files in repo to make permanent.</small>
    `;
    document.body.appendChild(panel);

    // populate inputs
    document.getElementById('teBrand').value = rgbToHex(getComputedStyle(document.documentElement).getPropertyValue('--brand') || initial['--brand']);
    document.getElementById('teAccent').value = rgbToHex(getComputedStyle(document.documentElement).getPropertyValue('--accent') || initial['--accent']);
    document.getElementById('teBg').value = rgbToHex(getComputedStyle(document.documentElement).getPropertyValue('--bg') || initial['--bg']);
    document.getElementById('teMuted').value = rgbToHex(getComputedStyle(document.documentElement).getPropertyValue('--muted') || initial['--muted']);
    document.getElementById('teLogo').value = initial.logo || defaults.logo;

    // listeners
    ['teBrand','teAccent','teBg','teMuted'].forEach(id=>{
      document.getElementById(id).addEventListener('input', e=>{
        const key = '--' + id.slice(2).toLowerCase();
        const settings = load();
        settings[key] = e.target.value;
        apply(settings);
      });
    });

    document.getElementById('teLogo').addEventListener('change', e=>{
      const val = e.target.value.trim();
      const settings = load();
      if(val) settings.logo = val;
      apply(settings);
    });

    document.getElementById('teLogoFile').addEventListener('change', e=>{
      const f = e.target.files && e.target.files[0];
      if(!f) return;
      const reader = new FileReader();
      reader.onload = function(evt){
        const dataUrl = evt.target.result;
        const settings = load();
        settings.logo = dataUrl; // data URL preview only
        apply(settings);
      };
      reader.readAsDataURL(f);
    });

    document.getElementById('teSave').addEventListener('click', ()=>{
      const settings = {
        '--brand': document.getElementById('teBrand').value,
        '--accent': document.getElementById('teAccent').value,
        '--bg': document.getElementById('teBg').value,
        '--muted': document.getElementById('teMuted').value,
        'logo': document.getElementById('teLogo').value || load().logo
      };
      save(settings);
      apply(settings);
      panel.style.boxShadow = '0 0 0 3px rgba(11,95,255,0.12)';
      setTimeout(()=> panel.style.boxShadow = '', 800);
    });

    document.getElementById('teReset').addEventListener('click', ()=>{
      localStorage.removeItem('be-y-tar-theme');
      apply(defaults);
      panel.remove();
      buildPanel(defaults);
    });
  }

  function rgbToHex(input){
    if(!input) return '#000000';
    input = input.trim();
    if(input.startsWith('#')) return input;
    const m = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if(!m) return '#000000';
    function hex(n){ return ('0' + Number(n).toString(16)).slice(-2); }
    return '#' + hex(m[1]) + hex(m[2]) + hex(m[3]);
  }

  const settings = load();
  apply(settings);
  buildPanel(settings);
})();