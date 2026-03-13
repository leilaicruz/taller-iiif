/**
 * Taller IIIF - JavaScript principal
 * Funcionalidad para el taller interactivo de IIIF con Cantaloupe + OpenSeadragon
 */

const IIIF_BASE = `${window.location.origin}/iiif/3`;
const MANIFESTS_BASE = `${window.location.origin}/manifests`;
const IMAGES = [
    '1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg','7.jpg','8.jpg','9.jpg','10.jpg',
    '11.jpg','12.jpg','13.jpg','14.jpg','15.jpg','16.jpg','17.jpg','18.jpg','19.jpg','20.jpg',
    '21.jpg','22.jpg','23.jpg'
];

// ─── Utility ───
function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => showToast('URL copiada'));
}

// ─── Section 1: URL Anatomy tooltip ───
function initUrlAnatomy() {
    const parts = document.querySelectorAll('.url-part');
    const descriptions = {
        base: 'Servidor IIIF + versión del API (2 o 3)',
        identifier: 'Nombre del archivo de imagen en el servidor',
        region: 'Zona de la imagen: full, square, x,y,w,h o pct:x,y,w,h',
        size: 'Tamaño de salida: max, w,h, pct:n, !w,h (encajar)',
        rotation: 'Rotación en grados (0-360). Prefijo ! para espejo',
        quality: 'Calidad: default, color, gray, bitonal',
        format: 'Formato de salida: jpg, png, webp, gif, tif'
    };
    parts.forEach(el => {
        el.addEventListener('mouseenter', () => {
            const key = [...el.classList].find(c => descriptions[c]);
            if (key) el.title = descriptions[key];
        });
    });
}

// ─── Section 2: Interactive URL Builder ───
function initUrlBuilder() {
    const form = document.getElementById('builder-form');
    if (!form) return;

    const fields = {
        image: document.getElementById('b-image'),
        regionType: document.getElementById('b-region-type'),
        regionValue: document.getElementById('b-region-value'),
        sizeType: document.getElementById('b-size-type'),
        sizeValue: document.getElementById('b-size-value'),
        rotation: document.getElementById('b-rotation'),
        mirror: document.getElementById('b-mirror'),
        quality: document.getElementById('b-quality'),
        format: document.getElementById('b-format'),
    };

    const output = document.getElementById('builder-url');
    const preview = document.getElementById('builder-preview');

    function buildUrl() {
        const img = fields.image.value;
        let region = fields.regionType.value;
        if (region === 'custom') region = fields.regionValue.value || '0,0,200,200';

        let size = fields.sizeType.value;
        if (size === 'custom') size = fields.sizeValue.value || '256,';

        const rot = (fields.mirror.checked ? '!' : '') + fields.rotation.value;
        const quality = fields.quality.value;
        const format = fields.format.value;

        return `${IIIF_BASE}/${img}/${region}/${size}/${rot}/${quality}.${format}`;
    }

    function update() {
        const url = buildUrl();
        output.innerHTML = `<span>${url}</span><span class="hint">Click para copiar</span>`;
        preview.innerHTML = `<img src="${encodeURI(url)}" alt="Preview" onerror="this.parentElement.innerHTML='<span class=placeholder>Error cargando imagen</span>'">`;

        // Show/hide custom fields
        fields.regionValue.style.display = fields.regionType.value === 'custom' ? '' : 'none';
        fields.sizeValue.style.display = fields.sizeType.value === 'custom' ? '' : 'none';
    }

    Object.values(fields).forEach(el => {
        if (el) el.addEventListener('change', update);
        if (el) el.addEventListener('input', update);
    });

    output.addEventListener('click', () => copyToClipboard(buildUrl()));

    update();
}

// ─── Section 3: Region Explorer ───
function initRegionExplorer() {
    const container = document.getElementById('region-examples');
    if (!container) return;

    const img = '1.jpg';
    const examples = [
        { region: 'full', label: 'Completa', desc: 'full' },
        { region: 'square', label: 'Cuadrado', desc: 'square' },
        { region: '0,0,300,300', label: 'Esquina sup-izq', desc: '0,0,300,300' },
        { region: 'pct:25,25,50,50', label: 'Centro 50%', desc: 'pct:25,25,50,50' },
        { region: 'pct:0,0,100,50', label: 'Mitad superior', desc: 'pct:0,0,100,50' },
        { region: 'pct:0,50,100,50', label: 'Mitad inferior', desc: 'pct:0,50,100,50' },
        { region: 'pct:0,0,50,100', label: 'Mitad izquierda', desc: 'pct:0,0,50,100' },
        { region: 'pct:50,0,50,100', label: 'Mitad derecha', desc: 'pct:50,0,50,100' },
    ];

    container.innerHTML = examples.map(ex => `
        <div class="param-example card" onclick="copyToClipboard('${IIIF_BASE}/${img}/${ex.region}/max/0/default.jpg')">
            <img src="${IIIF_BASE}/${img}/${ex.region}/256,/0/default.jpg"
                 alt="${ex.label}"
                 loading="lazy"
                 onerror="this.style.background='var(--border)'">
            <code>${ex.desc}</code>
            <div class="label">${ex.label}</div>
        </div>
    `).join('');
}

// ─── Section 4: Size Explorer ───
function initSizeExplorer() {
    const container = document.getElementById('size-examples');
    if (!container) return;

    const img = '1.jpg';
    const examples = [
        { size: 'max', label: 'Máximo', desc: 'max' },
        { size: '200,', label: '200px ancho', desc: '200,' },
        { size: ',150', label: '150px alto', desc: ',150' },
        { size: '200,200', label: '200×200 exacto', desc: '200,200' },
        { size: '!200,200', label: '200×200 encajar', desc: '!200,200' },
        { size: 'pct:50', label: '50%', desc: 'pct:50' },
        { size: 'pct:25', label: '25%', desc: 'pct:25' },
        { size: 'pct:10', label: '10%', desc: 'pct:10' },
    ];

    container.innerHTML = examples.map(ex => `
        <div class="param-example card" onclick="copyToClipboard('${IIIF_BASE}/${img}/full/${ex.size}/0/default.jpg')">
            <img src="${IIIF_BASE}/${img}/full/${ex.size}/0/default.jpg"
                 alt="${ex.label}"
                 loading="lazy"
                 style="object-fit: contain;"
                 onerror="this.style.background='var(--border)'">
            <code>${ex.desc}</code>
            <div class="label">${ex.label}</div>
        </div>
    `).join('');
}

// ─── Section 5: Rotation Explorer ───
function initRotationExplorer() {
    const container = document.getElementById('rotation-examples');
    if (!container) return;

    const img = '1.jpg';
    const examples = [
        { rot: '0', label: 'Sin rotación', desc: '0' },
        { rot: '90', label: '90°', desc: '90' },
        { rot: '180', label: '180°', desc: '180' },
        { rot: '270', label: '270°', desc: '270' },
        { rot: '45', label: '45°', desc: '45' },
        { rot: '!0', label: 'Espejo H', desc: '!0' },
        { rot: '!90', label: 'Espejo + 90°', desc: '!90' },
        { rot: '!180', label: 'Espejo V', desc: '!180' },
    ];

    container.innerHTML = examples.map(ex => `
        <div class="param-example card" onclick="copyToClipboard('${IIIF_BASE}/${img}/full/256,/${ex.rot}/default.jpg')">
            <img src="${IIIF_BASE}/${img}/full/256,/${ex.rot}/default.jpg"
                 alt="${ex.label}"
                 loading="lazy"
                 onerror="this.style.background='var(--border)'">
            <code>${ex.desc}</code>
            <div class="label">${ex.label}</div>
        </div>
    `).join('');
}

// ─── Section 6: Quality & Format Explorer ───
function initQualityExplorer() {
    const container = document.getElementById('quality-examples');
    if (!container) return;

    const img = '1.jpg';
    const examples = [
        { q: 'default', f: 'jpg', label: 'Default JPG' },
        { q: 'color', f: 'png', label: 'Color PNG' },
        { q: 'gray', f: 'jpg', label: 'Grises JPG' },
        { q: 'bitonal', f: 'jpg', label: 'Bitonal JPG' },
        { q: 'default', f: 'png', label: 'Default PNG' },
        { q: 'default', f: 'webp', label: 'Default WebP' },
        { q: 'gray', f: 'png', label: 'Grises PNG' },
        { q: 'bitonal', f: 'png', label: 'Bitonal PNG' },
    ];

    container.innerHTML = examples.map(ex => `
        <div class="param-example card" onclick="copyToClipboard('${IIIF_BASE}/${img}/square/256,/0/${ex.q}.${ex.f}')">
            <img src="${IIIF_BASE}/${img}/square/256,/0/${ex.q}.${ex.f}"
                 alt="${ex.label}"
                 loading="lazy"
                 onerror="this.style.background='var(--border)'">
            <code>${ex.q}.${ex.f}</code>
            <div class="label">${ex.label}</div>
        </div>
    `).join('');
}

// ─── Section 7: info.json explorer ───
function initInfoExplorer() {
    const select = document.getElementById('info-image-select');
    const output = document.getElementById('info-json-output');
    if (!select || !output) return;

    async function loadInfo() {
        const img = select.value;
        const url = `${IIIF_BASE}/${img}/info.json`;
        output.textContent = 'Cargando...';
        try {
            const res = await fetch(url);
            const data = await res.json();
            output.textContent = JSON.stringify(data, null, 2);
        } catch (e) {
            output.textContent = `Error: ${e.message}\n\nURL: ${url}`;
        }
    }

    select.addEventListener('change', loadInfo);
    loadInfo();
}

// ─── Section 8: Zoom comparison ───
function initZoomDemo() {
    const container = document.getElementById('zoom-levels');
    if (!container) return;

    const img = '1.jpg';
    const levels = [
        { region: 'full', size: '300,', label: 'Vista completa' },
        { region: 'pct:25,25,50,50', size: '300,', label: 'Zoom 2× (centro)' },
        { region: 'pct:37.5,37.5,25,25', size: '300,', label: 'Zoom 4× (centro)' },
        { region: 'pct:43.75,43.75,12.5,12.5', size: '300,', label: 'Zoom 8× (centro)' },
    ];

    container.innerHTML = levels.map(lv => `
        <div class="card" style="text-align:center;">
            <img src="${IIIF_BASE}/${img}/${lv.region}/${lv.size}/0/default.jpg"
                 style="width:100%;border-radius:4px;margin-bottom:8px;"
                 alt="${lv.label}"
                 loading="lazy">
            <div style="font-weight:600;font-size:14px;">${lv.label}</div>
            <code style="font-size:11px;color:var(--text-muted);">${lv.region}</code>
        </div>
    `).join('');
}

// ─── Section 9: OpenSeadragon Viewer ───
let mainViewer = null;

function initMainViewer() {
    const el = document.getElementById('osd-viewer');
    const select = document.getElementById('osd-image-select');
    if (!el || typeof OpenSeadragon === 'undefined') return;

    mainViewer = OpenSeadragon({
        id: 'osd-viewer',
        prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/',
        tileSources: `${IIIF_BASE}/${select.value}/info.json`,
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        showRotationControl: true,
        showFlipControl: true,
        gestureSettingsMouse: { scrollToZoom: true },
        gestureSettingsTouch: { pinchToZoom: true },
        minZoomLevel: 0.3,
        maxZoomLevel: 30,
        animationTime: 0.3,
    });

    select.addEventListener('change', () => {
        mainViewer.open(`${IIIF_BASE}/${select.value}/info.json`);
    });
}

// ─── Section 10: Side-by-side viewer ───
let viewerLeft = null, viewerRight = null;

function initSideBySideViewer() {
    const elL = document.getElementById('osd-left');
    const elR = document.getElementById('osd-right');
    const selL = document.getElementById('sbs-left-select');
    const selR = document.getElementById('sbs-right-select');
    if (!elL || !elR || typeof OpenSeadragon === 'undefined') return;

    const osdOpts = (id, img) => ({
        id,
        prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/',
        tileSources: `${IIIF_BASE}/${img}/info.json`,
        showNavigator: false,
        showRotationControl: true,
        gestureSettingsMouse: { scrollToZoom: true },
        minZoomLevel: 0.3,
        maxZoomLevel: 30,
        animationTime: 0.3,
    });

    viewerLeft = OpenSeadragon(osdOpts('osd-left', selL.value));
    viewerRight = OpenSeadragon(osdOpts('osd-right', selR.value));

    selL.addEventListener('change', () => viewerLeft.open(`${IIIF_BASE}/${selL.value}/info.json`));
    selR.addEventListener('change', () => viewerRight.open(`${IIIF_BASE}/${selR.value}/info.json`));
}

// ─── Section 11: Gallery ───
function initGallery() {
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    container.innerHTML = IMAGES.map(img => `
        <div class="card" style="padding:8px;text-align:center;cursor:pointer;"
             onclick="window.open('${IIIF_BASE}/${img}/info.json','_blank')">
            <img src="${IIIF_BASE}/${img}/square/180,/0/default.jpg"
                 style="width:100%;border-radius:4px;margin-bottom:6px;"
                 alt="${img}" loading="lazy"
                 onerror="this.style.background='var(--border)'; this.style.minHeight='120px'">
            <code style="font-size:11px;">${img}</code>
        </div>
    `).join('');
}

// ─── Section 12: Manifest Explorer ───
function initManifestExplorer() {
    const select = document.getElementById('manifest-select');
    const infoEl = document.getElementById('manifest-info');
    const canvasesEl = document.getElementById('manifest-canvases');
    const jsonEl = document.getElementById('manifest-json');
    if (!select || !infoEl) return;

    async function loadManifest() {
        const url = select.value;
        infoEl.innerHTML = '<p style="color:var(--text-muted)">Cargando...</p>';
        jsonEl.textContent = 'Cargando...';
        canvasesEl.innerHTML = '';

        try {
            const res = await fetch(url);
            const data = await res.json();
            jsonEl.textContent = JSON.stringify(data, null, 2);

            const type = data.type || 'Unknown';
            const label = getLabel(data.label);
            const summary = getLabel(data.summary);

            let html = `
                <div style="margin-bottom:12px;">
                    <span style="background:var(--accent);color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">${type}</span>
                </div>
                <p><strong>${label}</strong></p>
                ${summary ? `<p style="color:var(--text-muted);margin-top:4px;">${summary}</p>` : ''}
            `;

            // Metadata
            if (data.metadata) {
                html += '<div style="margin-top:12px;">';
                data.metadata.forEach(m => {
                    html += `<p><span style="color:var(--text-muted);">${getLabel(m.label)}:</span> ${getLabel(m.value)}</p>`;
                });
                html += '</div>';
            }

            // Behavior & direction
            if (data.behavior || data.viewingDirection) {
                html += '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">';
                if (data.behavior) {
                    data.behavior.forEach(b => {
                        html += `<span style="background:var(--bg-code);border:1px solid var(--border);padding:2px 8px;border-radius:4px;font-size:11px;font-family:var(--font-mono);">${b}</span>`;
                    });
                }
                if (data.viewingDirection) {
                    html += `<span style="background:var(--bg-code);border:1px solid var(--border);padding:2px 8px;border-radius:4px;font-size:11px;font-family:var(--font-mono);">↔ ${data.viewingDirection}</span>`;
                }
                html += '</div>';
            }

            // Items count
            if (data.items) {
                const itemType = data.type === 'Collection' ? 'manifiestos' : 'canvas';
                html += `<p style="margin-top:12px;"><strong>${data.items.length}</strong> ${itemType}</p>`;
            }

            infoEl.innerHTML = html;

            // Canvas thumbnails
            if (data.items && data.type !== 'Collection') {
                canvasesEl.innerHTML = '<h3 style="margin-bottom:8px;">Canvas</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;">'
                    + data.items.map((canvas, i) => {
                        const imgBody = canvas.items?.[0]?.items?.[0]?.body;
                        const serviceId = imgBody?.service?.[0]?.id;
                        const thumbUrl = serviceId
                            ? `${serviceId}/full/120,/0/default.jpg`
                            : (imgBody?.id || '');
                        return `<div style="text-align:center;">
                            <img src="${thumbUrl}" style="width:100%;border-radius:4px;background:var(--bg-code);" alt="Canvas ${i+1}" loading="lazy"
                                 onerror="this.style.minHeight='80px'">
                            <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${getLabel(canvas.label) || 'Canvas ' + (i+1)}</div>
                        </div>`;
                    }).join('')
                    + '</div>';
            } else if (data.items && data.type === 'Collection') {
                canvasesEl.innerHTML = '<h3 style="margin-bottom:8px;">Manifiestos</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;">'
                    + data.items.map(item => {
                        const thumbUrl = item.thumbnail?.[0]?.id || '';
                        return `<div style="text-align:center;cursor:pointer;" onclick="document.getElementById('manifest-select').value='${item.id}';document.getElementById('manifest-select').dispatchEvent(new Event('change'));">
                            <img src="${thumbUrl}" style="width:100%;border-radius:4px;background:var(--bg-code);" alt="${getLabel(item.label)}" loading="lazy"
                                 onerror="this.style.minHeight='80px'">
                            <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${getLabel(item.label)}</div>
                            <div style="font-size:10px;color:var(--accent);">${item.type}</div>
                        </div>`;
                    }).join('')
                    + '</div>';
            }
        } catch (e) {
            infoEl.innerHTML = `<p style="color:#ef4444;">Error: ${e.message}</p>`;
            jsonEl.textContent = `Error cargando: ${url}\n\n${e.message}`;
        }
    }

    select.addEventListener('change', loadManifest);
    loadManifest();
}

function getLabel(labelObj) {
    if (!labelObj) return '';
    if (typeof labelObj === 'string') return labelObj;
    const langs = ['es', 'en', 'none'];
    for (const lang of langs) {
        if (labelObj[lang]) return Array.isArray(labelObj[lang]) ? labelObj[lang][0] : labelObj[lang];
    }
    const first = Object.values(labelObj)[0];
    return Array.isArray(first) ? first[0] : (first || '');
}

// ─── Section 13: Mirador Viewer ───
let miradorInstance = null;

function loadManifestInMirador(manifestUrl) {
    const el = document.getElementById('mirador-viewer');
    if (!el || typeof Mirador === 'undefined') return;

    // Clear previous instance
    el.innerHTML = '';

    miradorInstance = Mirador.viewer({
        id: 'mirador-viewer',
        windows: [{
            manifestId: manifestUrl,
            thumbnailNavigationPosition: 'far-bottom',
        }],
        window: {
            allowClose: false,
            allowFullscreen: true,
            allowMaximize: false,
            defaultSideBarPanel: 'info',
            sideBarOpenByDefault: false,
        },
        workspaceControlPanel: {
            enabled: true,
        },
        theme: {
            palette: {
                type: 'dark',
                primary: { main: '#3b82f6' },
            }
        }
    });
}

function initMirador() {
    const select = document.getElementById('mirador-manifest-select');
    const loadBtn = document.getElementById('mirador-load-btn');
    const customInput = document.getElementById('mirador-custom-url');
    const customBtn = document.getElementById('mirador-load-custom-btn');

    if (!select || !loadBtn) return;

    // Initial load
    loadManifestInMirador(select.value);

    loadBtn.addEventListener('click', () => {
        loadManifestInMirador(select.value);
    });

    if (customBtn && customInput) {
        customBtn.addEventListener('click', () => {
            const url = customInput.value.trim();
            if (url) {
                loadManifestInMirador(url);
                showToast('Manifiesto externo cargado');
            }
        });
        customInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') customBtn.click();
        });
    }
}

// ─── Section 14: External Collections (Interoperability) ───
const EXTERNAL_MANIFESTS = [
    {
        id: 'bodleian-map',
        label: 'Mapa de Gough — Gran Bretaña medieval',
        institution: 'Bodleian Library, Oxford',
        url: 'https://iiif.bodleian.ox.ac.uk/iiif/manifest/390fd0e8-9eae-475d-9564-ed916ab9035c.json',
        thumb: 'https://iiif.bodleian.ox.ac.uk/iiif/image/390fd0e8-9eae-475d-9564-ed916ab9035c/full/200,/0/default.jpg',
        desc: 'Uno de los mapas más antiguos de las Islas Británicas (ca. 1360).',
        flag: '🇬🇧'
    },
    {
        id: 'bodleian-romance',
        label: 'Romance of Alexander',
        institution: 'Bodleian Library, Oxford',
        url: 'https://iiif.bodleian.ox.ac.uk/iiif/manifest/faeff7fb-f8a7-44b5-95ed-cff9a9ffd198.json',
        thumb: 'https://iiif.bodleian.ox.ac.uk/iiif/image/faeff7fb-f8a7-44b5-95ed-cff9a9ffd198/full/200,/0/default.jpg',
        desc: 'Manuscrito iluminado medieval con la vida de Alejandro Magno.',
        flag: '🇬🇧'
    },
    {
        id: 'nga-highlights',
        label: 'NGA Highlights Collection',
        institution: 'National Gallery of Art, Washington',
        url: 'https://media.nga.gov/public/manifests/nga_highlights.json',
        thumb: 'https://media.nga.gov/iiif/public/objects/5/0/4/504-primary-0-nativeres.ptif/full/200,/0/default.jpg',
        desc: 'Obras maestras de la National Gallery incluyendo Leonardo, Vermeer, Monet.',
        flag: '🇺🇸'
    },
    {
        id: 'harvard-art',
        label: 'Self-Portrait Dedicated to Paul Gauguin — Van Gogh',
        institution: 'Harvard Art Museums',
        url: 'https://iiif.harvardartmuseums.org/manifests/object/299843',
        thumb: 'https://nrs.harvard.edu/urn-3:HUAM:VRS48742_dynmc/full/200,/0/default.jpg',
        desc: 'Autorretrato de Van Gogh dedicado a Gauguin (1888).',
        flag: '🇺🇸'
    },
    {
        id: 'yale-voynich',
        label: 'Manuscrito Voynich',
        institution: 'Beinecke Library, Yale University',
        url: 'https://collections.library.yale.edu/manifests/2002046',
        thumb: 'https://collections.library.yale.edu/iiif/2/1006189/full/200,/0/default.jpg',
        desc: 'El misterioso códice del siglo XV con escritura y plantas desconocidas que nadie ha descifrado.',
        flag: '🇺🇸'
    },
    {
        id: 'yale-art',
        label: 'Night Café — Van Gogh',
        institution: 'Yale University Art Gallery',
        url: 'https://manifests.collections.yale.edu/yuag/obj/111',
        thumb: 'https://media.collections.yale.edu/thumbnail/yuag/obj/111',
        desc: 'Le café de nuit (El café nocturno), obra icónica de Van Gogh (1888).',
        flag: '🇺🇸'
    },
    {
        id: 'wellcome-color',
        label: 'Early Colour Printing',
        institution: 'Wellcome Collection, London',
        url: 'https://iiif.wellcomecollection.org/presentation/b18035723',
        thumb: 'https://iiif.wellcomecollection.org/thumbs/b18035723_0001.JP2/full/200,/0/default.jpg',
        desc: 'Historia de las primeras técnicas de impresión en color.',
        flag: '🇬🇧'
    },
    {
        id: 'princeton-fisher',
        label: 'What Mrs. Fisher Knows About Southern Cooking',
        institution: 'Princeton University Library',
        url: 'https://figgy.princeton.edu/concern/scanned_resources/d446107a-bdfd-4a5d-803c-f315b7905bf4/manifest',
        thumb: 'https://iiif-cloud.princeton.edu/iiif/2/c8%2F12%2F1c%2Fc8121c4acdcd4b0faab1b15e1e25ac22%2Fintermediate_file/full/200,/0/default.jpg',
        desc: 'Uno de los primeros libros de cocina publicados por una afroamericana (1881).',
        flag: '🇺🇸'
    },
    {
        id: 'ecodices-swiss',
        label: 'Codex 48 — Biblia carolingia',
        institution: 'e-codices, Suiza',
        url: 'https://www.e-codices.unifr.ch/metadata/iiif/fmb-cb-0048/manifest.json',
        thumb: 'https://www.e-codices.unifr.ch/loris/fmb/fmb-cb-0048/fmb-cb-0048_001r.jp2/full/200,/0/default.jpg',
        desc: 'Biblia de la época carolingia del monasterio de Floreffe (siglo XII).',
        flag: '🇨🇭'
    },
    {
        id: 'heidelberg-greek',
        label: 'Codex Palatinus graecus 398',
        institution: 'Universitätsbibliothek Heidelberg',
        url: 'https://digi.ub.uni-heidelberg.de/diglit/iiif/cpgraec398/manifest.json',
        thumb: 'https://digi.ub.uni-heidelberg.de/diglitData/image/cpgraec398/3/001r.jpg',
        desc: 'Manuscrito griego de la famosa Bibliotheca Palatina.',
        flag: '🇩🇪'
    },
    {
        id: 'stanford-maps',
        label: 'David Rumsey Map Collection',
        institution: 'Stanford University Library',
        url: 'https://purl.stanford.edu/hs631zg4177/iiif/manifest',
        thumb: 'https://stacks.stanford.edu/image/iiif/hs631zg4177%2Fhs631zg4177_00_0001/full/200,/0/default.jpg',
        desc: 'Mapas históricos de la colección David Rumsey.',
        flag: '🇺🇸'
    },
    {
        id: 'nls-scotland',
        label: 'Pont Maps of Scotland',
        institution: 'National Library of Scotland',
        url: 'https://view.nls.uk/manifest/7446/74464117/manifest.json',
        thumb: 'https://deriv.nls.uk/dcn4/7446/74464117.4/200.jpg',
        desc: 'Mapas manuscritos de Escocia de Timothy Pont (ca. 1583-1614).',
        flag: '🏴\u200D'
    },
    {
        id: 'wales-chronicle',
        label: 'Brut y Tywysogion — Crónica de los Príncipes',
        institution: 'National Library of Wales',
        url: 'https://damsssl.llgc.org.uk/iiif/2.0/4628556/manifest.json',
        thumb: 'https://damsssl.llgc.org.uk/iiif/2.0/image/4628558/full/200,/0/default.jpg',
        desc: 'Crónica medieval galesa sobre los príncipes de Gales.',
        flag: '🏴\u200D'
    },
    {
        id: 'bsb-munich',
        label: 'Evangeliario de Otón III',
        institution: 'Bayerische Staatsbibliothek, Múnich',
        url: 'https://api.digitale-sammlungen.de/iiif/presentation/v2/bsb00034024/manifest',
        thumb: 'https://api.digitale-sammlungen.de/iiif/image/v2/bsb00034024_00005/full/200,/0/default.jpg',
        desc: 'Evangeliario otoniano del siglo X/XI con iluminaciones en oro. Patrimonio de la Humanidad UNESCO.',
        flag: '🇩🇪'
    },
    {
        id: 'keio-japan',
        label: 'Colección de estampas japonesas',
        institution: 'Keio University Library, Tokio',
        url: 'https://dcollections.lib.keio.ac.jp/sites/default/files/iiif/KAN/132X-10-1/manifest.json',
        thumb: 'https://dcollections.lib.keio.ac.jp/sites/default/files/iiif/KAN/132X-10-1/images/132X-10-1-001/full/200,/0/default.jpg',
        desc: 'Estampas xilográficas japonesas de la era Edo.',
        flag: '🇯🇵'
    }
];

let selectedExternals = new Set();

function initInteropSection() {
    const container = document.getElementById('external-collections');
    const loadBtn = document.getElementById('interop-load-btn');
    const loadMultiBtn = document.getElementById('interop-load-multi-btn');
    const countEl = document.getElementById('interop-selected-count');
    const customInput = document.getElementById('interop-custom-url');
    const customBtn = document.getElementById('interop-custom-btn');
    if (!container) return;

    // Render collection cards
    container.innerHTML = EXTERNAL_MANIFESTS.map(m => `
        <div class="card interop-card" id="interop-${m.id}" data-url="${m.url}"
             style="padding:12px;cursor:pointer;transition:all 0.2s;border:2px solid transparent;"
             onclick="toggleExternalSelect('${m.id}')">
            <div style="display:flex;gap:12px;">
                <img src="${m.thumb}" alt="${m.label}"
                     style="width:70px;height:70px;border-radius:4px;object-fit:cover;background:var(--bg-code);flex-shrink:0;"
                     onerror="this.style.background='var(--border)';this.alt='⏳'">
                <div style="min-width:0;">
                    <div style="font-weight:600;font-size:13px;line-height:1.3;">${m.flag} ${m.label}</div>
                    <div style="font-size:11px;color:var(--accent);margin-top:2px;">${m.institution}</div>
                    <div style="font-size:11px;color:var(--text-muted);margin-top:4px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${m.desc}</div>
                </div>
            </div>
        </div>
    `).join('');

    // Select first by default
    toggleExternalSelect(EXTERNAL_MANIFESTS[0].id);

    // Load single
    loadBtn?.addEventListener('click', () => {
        const urls = [...selectedExternals];
        if (urls.length > 0) {
            loadInteropMirador([urls[0]]);
        }
    });

    // Load multiple side by side
    loadMultiBtn?.addEventListener('click', () => {
        const urls = [...selectedExternals];
        if (urls.length > 0) {
            loadInteropMirador(urls);
            showToast(`${urls.length} manifiestos cargados`);
        }
    });

    // Custom URL
    customBtn?.addEventListener('click', () => {
        const url = customInput?.value.trim();
        if (url) {
            loadInteropMirador([url]);
            showToast('Manifiesto externo cargado');
        }
    });
    customInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') customBtn?.click();
    });

    // Initial load
    loadInteropMirador([EXTERNAL_MANIFESTS[0].url]);
}

function toggleExternalSelect(id) {
    const manifest = EXTERNAL_MANIFESTS.find(m => m.id === id);
    if (!manifest) return;

    const card = document.getElementById(`interop-${id}`);
    const url = manifest.url;

    if (selectedExternals.has(url)) {
        selectedExternals.delete(url);
        card.style.borderColor = 'transparent';
    } else {
        selectedExternals.add(url);
        card.style.borderColor = 'var(--accent)';
    }

    const countEl = document.getElementById('interop-selected-count');
    if (countEl) countEl.textContent = `${selectedExternals.size} seleccionado${selectedExternals.size !== 1 ? 's' : ''}`;
}

let interopMiradorInstance = null;

function loadInteropMirador(manifestUrls) {
    const el = document.getElementById('interop-mirador');
    if (!el || typeof Mirador === 'undefined') return;

    el.innerHTML = '';

    const windows = manifestUrls.map(url => ({
        manifestId: url,
        thumbnailNavigationPosition: 'far-bottom',
    }));

    interopMiradorInstance = Mirador.viewer({
        id: 'interop-mirador',
        windows,
        window: {
            allowClose: true,
            allowFullscreen: true,
            allowMaximize: true,
            defaultSideBarPanel: 'info',
            sideBarOpenByDefault: false,
        },
        workspaceControlPanel: {
            enabled: true,
        },
        workspace: {
            type: manifestUrls.length > 1 ? 'mosaic' : 'single',
        },
        theme: {
            palette: {
                type: 'dark',
                primary: { main: '#3b82f6' },
            }
        }
    });
}

// ─── Navigation active state ───
function initNav() {
    const links = document.querySelectorAll('nav a.nav-link');
    const sections = [...links].map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);

    function update() {
        const y = window.scrollY + 80;
        let current = sections[0];
        for (const s of sections) {
            if (s.offsetTop <= y) current = s;
        }
        links.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === '#' + current.id);
        });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
}

// ─── Tabs ───
function initTabs() {
    document.querySelectorAll('.tabs').forEach(tabBar => {
        const tabs = tabBar.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const group = tab.dataset.group;
                const target = tab.dataset.tab;

                document.querySelectorAll(`.tab[data-group="${group}"]`).forEach(t => t.classList.remove('active'));
                document.querySelectorAll(`.tab-content[data-group="${group}"]`).forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(target)?.classList.add('active');
            });
        });
    });
}

// ─── Section: CRUD Manifest Editor ───
const CRUD_STORAGE_KEY = 'taller-iiif-manifests';

function getCrudManifests() {
    try {
        return JSON.parse(localStorage.getItem(CRUD_STORAGE_KEY) || '{}');
    } catch { return {}; }
}

function saveCrudManifests(manifests) {
    localStorage.setItem(CRUD_STORAGE_KEY, JSON.stringify(manifests));
}

function generateManifestId() {
    return 'manifest-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

function getManifestTemplates() {
    const base = IIIF_BASE;
    return {
        blank: {
            "@context": "http://iiif.io/api/presentation/3/context.json",
            "id": "",
            "type": "Manifest",
            "label": { "es": ["Nuevo manifiesto"] },
            "summary": { "es": [""] },
            "rights": "http://creativecommons.org/licenses/by/4.0/",
            "behavior": ["paged"],
            "viewingDirection": "left-to-right",
            "items": []
        },
        book: {
            "@context": "http://iiif.io/api/presentation/3/context.json",
            "id": "",
            "type": "Manifest",
            "label": { "es": ["Mi libro de imágenes"] },
            "summary": { "es": ["Un libro con 5 páginas creado en el taller IIIF"] },
            "metadata": [
                { "label": { "es": ["Autor"] }, "value": { "es": ["Taller IIIF"] } },
                { "label": { "es": ["Fecha"] }, "value": { "es": [new Date().getFullYear().toString()] } }
            ],
            "rights": "http://creativecommons.org/licenses/by/4.0/",
            "behavior": ["paged"],
            "viewingDirection": "left-to-right",
            "items": [1,2,3,4,5].map((n, i) => makeCanvas(n + '.jpg', `Página ${n}`, i, base))
        },
        gallery: {
            "@context": "http://iiif.io/api/presentation/3/context.json",
            "id": "",
            "type": "Manifest",
            "label": { "es": ["Galería de arte"] },
            "summary": { "es": ["Galería con scroll continuo creada en el taller IIIF"] },
            "rights": "http://creativecommons.org/licenses/by/4.0/",
            "behavior": ["continuous"],
            "viewingDirection": "top-to-bottom",
            "items": [6,7,8,9,10].map((n, i) => makeCanvas(n + '.jpg', `Obra ${i+1}`, i, base))
        },
        annotated: {
            "@context": "http://iiif.io/api/presentation/3/context.json",
            "id": "",
            "type": "Manifest",
            "label": { "es": ["Imagen con anotaciones"] },
            "summary": { "es": ["Ejemplo de manifiesto con anotaciones de comentario"] },
            "rights": "http://creativecommons.org/licenses/by/4.0/",
            "behavior": ["individuals"],
            "items": [{
                "id": "canvas/0",
                "type": "Canvas",
                "label": { "es": ["Imagen anotada"] },
                "width": 1000, "height": 1000,
                "items": [{
                    "id": "canvas/0/page",
                    "type": "AnnotationPage",
                    "items": [{
                        "id": "canvas/0/page/ann0",
                        "type": "Annotation",
                        "motivation": "painting",
                        "body": {
                            "id": `${base}/11.jpg/full/max/0/default.jpg`,
                            "type": "Image",
                            "format": "image/jpeg",
                            "service": [{ "id": `${base}/11.jpg`, "type": "ImageService3", "profile": "level2" }]
                        },
                        "target": "canvas/0"
                    }]
                }],
                "annotations": [{
                    "id": "canvas/0/annotations",
                    "type": "AnnotationPage",
                    "items": [
                        {
                            "id": "canvas/0/annotations/1",
                            "type": "Annotation",
                            "motivation": "commenting",
                            "body": { "type": "TextualBody", "value": "Detalle interesante en esta zona", "language": "es", "format": "text/plain" },
                            "target": "canvas/0#xywh=100,100,300,200"
                        },
                        {
                            "id": "canvas/0/annotations/2",
                            "type": "Annotation",
                            "motivation": "tagging",
                            "body": { "type": "TextualBody", "value": "Etiqueta de ejemplo", "language": "es", "format": "text/plain" },
                            "target": "canvas/0#xywh=500,400,200,200"
                        }
                    ]
                }]
            }]
        },
        collection: {
            "@context": "http://iiif.io/api/presentation/3/context.json",
            "id": "",
            "type": "Collection",
            "label": { "es": ["Mi colección"] },
            "summary": { "es": ["Colección de manifiestos creada en el taller IIIF"] },
            "rights": "http://creativecommons.org/licenses/by/4.0/",
            "items": []
        }
    };
}

function makeCanvas(imgFile, label, index, base) {
    return {
        "id": `canvas/${index}`,
        "type": "Canvas",
        "label": { "es": [label] },
        "width": 1000, "height": 1000,
        "items": [{
            "id": `canvas/${index}/page`,
            "type": "AnnotationPage",
            "items": [{
                "id": `canvas/${index}/page/ann0`,
                "type": "Annotation",
                "motivation": "painting",
                "body": {
                    "id": `${base}/${imgFile}/full/max/0/default.jpg`,
                    "type": "Image",
                    "format": "image/jpeg",
                    "service": [{ "id": `${base}/${imgFile}`, "type": "ImageService3", "profile": "level2" }]
                },
                "target": `canvas/${index}`
            }]
        }]
    };
}

let currentEditingId = null;

function initCrudEditor() {
    const templateSelect = document.getElementById('crud-template');
    const createBtn = document.getElementById('crud-create-btn');
    const saveBtn = document.getElementById('crud-save-btn');
    const previewBtn = document.getElementById('crud-preview-btn');
    const downloadBtn = document.getElementById('crud-download-btn');
    const validateBtn = document.getElementById('crud-validate-btn');
    const importBtn = document.getElementById('crud-import-btn');
    const importFile = document.getElementById('crud-import-file');
    const exportAllBtn = document.getElementById('crud-export-all-btn');
    const addCanvasBtn = document.getElementById('crud-add-canvas-btn');
    const canvasConfirmBtn = document.getElementById('crud-canvas-confirm-btn');
    const jsonEditor = document.getElementById('crud-json-editor');

    if (!createBtn) return;

    // Populate image selector for canvas
    const imgSelect = document.getElementById('crud-canvas-image');
    if (imgSelect) {
        IMAGES.forEach(img => {
            const opt = document.createElement('option');
            opt.value = img;
            opt.textContent = img;
            imgSelect.appendChild(opt);
        });
    }

    // Create from template
    createBtn.addEventListener('click', () => {
        const template = templateSelect.value;
        const manifest = getManifestTemplates()[template];
        const id = generateManifestId();
        manifest.id = `${window.location.origin}/manifests/user/${id}.json`;
        const manifests = getCrudManifests();
        manifests[id] = { manifest, name: getLabel(manifest.label) || 'Sin título', created: Date.now() };
        saveCrudManifests(manifests);
        renderCrudList();
        openCrudEditor(id);
        showToast(`Manifiesto creado desde plantilla "${template}"`);
    });

    // Save
    saveBtn?.addEventListener('click', () => {
        if (!currentEditingId) return;
        try {
            const manifest = JSON.parse(jsonEditor.value);
            const manifests = getCrudManifests();
            manifests[currentEditingId].manifest = manifest;
            manifests[currentEditingId].name = getLabel(manifest.label) || 'Sin título';
            manifests[currentEditingId].modified = Date.now();
            saveCrudManifests(manifests);
            renderCrudList();
            showToast('Manifiesto guardado');
        } catch (e) {
            showToast('Error: JSON inválido');
        }
    });

    // Preview in Mirador
    previewBtn?.addEventListener('click', () => {
        if (!jsonEditor.value) return;
        try {
            const manifest = JSON.parse(jsonEditor.value);
            const blob = new Blob([JSON.stringify(manifest)], { type: 'application/ld+json' });
            const url = URL.createObjectURL(blob);

            const el = document.getElementById('crud-mirador-preview');
            if (!el || typeof Mirador === 'undefined') return;
            el.innerHTML = '';

            // Switch to preview tab
            document.querySelector('.tab[data-tab="crud-preview-tab"]')?.click();

            Mirador.viewer({
                id: 'crud-mirador-preview',
                windows: [{ manifestId: url, thumbnailNavigationPosition: 'far-bottom' }],
                window: { allowClose: false, allowFullscreen: true, sideBarOpenByDefault: false },
                workspaceControlPanel: { enabled: false },
                theme: { palette: { type: 'dark', primary: { main: '#3b82f6' } } }
            });
            showToast('Preview cargado');
        } catch (e) {
            showToast('Error: JSON inválido para preview');
        }
    });

    // Download
    downloadBtn?.addEventListener('click', () => {
        if (!jsonEditor.value) return;
        try {
            const manifest = JSON.parse(jsonEditor.value);
            const name = (getLabel(manifest.label) || 'manifest').replace(/[^a-zA-Z0-9_-]/g, '_');
            const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/ld+json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${name}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
            showToast('JSON descargado');
        } catch (e) {
            showToast('Error: JSON inválido');
        }
    });

    // Validate
    validateBtn?.addEventListener('click', () => {
        const validationEl = document.getElementById('crud-validation');
        if (!validationEl) return;
        validationEl.style.display = 'block';

        try {
            const manifest = JSON.parse(jsonEditor.value);
            const errors = validateManifest(manifest);
            if (errors.length === 0) {
                validationEl.style.background = 'rgba(34,197,94,0.1)';
                validationEl.style.border = '1px solid var(--success)';
                validationEl.style.color = 'var(--success)';
                validationEl.textContent = '✅ Manifiesto válido — Cumple con IIIF Presentation API 3.0';
            } else {
                validationEl.style.background = 'rgba(239,68,68,0.1)';
                validationEl.style.border = '1px solid #ef4444';
                validationEl.style.color = '#ef4444';
                validationEl.innerHTML = '❌ Errores encontrados:<br>' + errors.map(e => `• ${e}`).join('<br>');
            }
        } catch (e) {
            validationEl.style.background = 'rgba(239,68,68,0.1)';
            validationEl.style.border = '1px solid #ef4444';
            validationEl.style.color = '#ef4444';
            validationEl.textContent = `❌ JSON inválido: ${e.message}`;
        }
    });

    // Import
    importBtn?.addEventListener('click', () => importFile?.click());
    importFile?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const manifest = JSON.parse(ev.target.result);
                const id = generateManifestId();
                const manifests = getCrudManifests();
                manifests[id] = { manifest, name: getLabel(manifest.label) || file.name, created: Date.now() };
                saveCrudManifests(manifests);
                renderCrudList();
                openCrudEditor(id);
                showToast('Manifiesto importado');
            } catch (err) {
                showToast('Error: archivo JSON inválido');
            }
        };
        reader.readAsText(file);
        importFile.value = '';
    });

    // Export all
    exportAllBtn?.addEventListener('click', () => {
        const manifests = getCrudManifests();
        const keys = Object.keys(manifests);
        if (keys.length === 0) { showToast('No hay manifiestos para exportar'); return; }
        const blob = new Blob([JSON.stringify(manifests, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'taller-iiif-manifests.json';
        a.click();
        URL.revokeObjectURL(a.href);
        showToast(`${keys.length} manifiestos exportados`);
    });

    // Add canvas
    addCanvasBtn?.addEventListener('click', () => {
        const panel = document.getElementById('crud-canvas-add-panel');
        if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    canvasConfirmBtn?.addEventListener('click', () => {
        if (!currentEditingId) return;
        const imgFile = document.getElementById('crud-canvas-image')?.value;
        const label = document.getElementById('crud-canvas-label')?.value || `Canvas ${Date.now()}`;
        if (!imgFile) return;

        try {
            const manifest = JSON.parse(jsonEditor.value);
            if (manifest.type === 'Collection') {
                showToast('Las colecciones no tienen canvas');
                return;
            }
            const idx = manifest.items ? manifest.items.length : 0;
            const canvas = makeCanvas(imgFile, label, idx, IIIF_BASE);
            if (!manifest.items) manifest.items = [];
            manifest.items.push(canvas);
            jsonEditor.value = JSON.stringify(manifest, null, 2);
            renderCanvasList(manifest);
            document.getElementById('crud-canvas-add-panel').style.display = 'none';
            document.getElementById('crud-canvas-label').value = '';
            showToast(`Canvas "${label}" añadido`);
        } catch (e) {
            showToast('Error: JSON inválido en el editor');
        }
    });

    // Sync form fields with JSON
    ['crud-label', 'crud-summary', 'crud-behavior', 'crud-direction', 'crud-rights'].forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (!el) return;
        el.addEventListener('change', () => syncFormToJson());
        el.addEventListener('input', () => syncFormToJson());
    });

    renderCrudList();
}

function syncFormToJson() {
    const jsonEditor = document.getElementById('crud-json-editor');
    if (!jsonEditor || !currentEditingId) return;
    try {
        const manifest = JSON.parse(jsonEditor.value);
        const label = document.getElementById('crud-label')?.value;
        const summary = document.getElementById('crud-summary')?.value;
        const behavior = document.getElementById('crud-behavior')?.value;
        const direction = document.getElementById('crud-direction')?.value;
        const rights = document.getElementById('crud-rights')?.value;

        if (label !== undefined) manifest.label = { "es": [label] };
        if (summary !== undefined) manifest.summary = { "es": [summary] };
        if (behavior) manifest.behavior = [behavior];
        if (direction) manifest.viewingDirection = direction;
        if (rights) manifest.rights = rights;

        jsonEditor.value = JSON.stringify(manifest, null, 2);
    } catch (e) { /* ignore if JSON is being hand-edited */ }
}

function openCrudEditor(id) {
    const manifests = getCrudManifests();
    const entry = manifests[id];
    if (!entry) return;

    currentEditingId = id;
    const panel = document.getElementById('crud-editor-panel');
    const title = document.getElementById('crud-editor-title');
    const jsonEditor = document.getElementById('crud-json-editor');

    if (panel) panel.style.display = 'block';
    if (title) title.textContent = `Editando: ${entry.name}`;
    if (jsonEditor) jsonEditor.value = JSON.stringify(entry.manifest, null, 2);

    // Populate form fields
    const manifest = entry.manifest;
    const labelEl = document.getElementById('crud-label');
    const summaryEl = document.getElementById('crud-summary');
    const behaviorEl = document.getElementById('crud-behavior');
    const directionEl = document.getElementById('crud-direction');
    const rightsEl = document.getElementById('crud-rights');

    if (labelEl) labelEl.value = getLabel(manifest.label) || '';
    if (summaryEl) summaryEl.value = getLabel(manifest.summary) || '';
    if (behaviorEl && manifest.behavior?.[0]) behaviorEl.value = manifest.behavior[0];
    if (directionEl && manifest.viewingDirection) directionEl.value = manifest.viewingDirection;
    if (rightsEl && manifest.rights) rightsEl.value = manifest.rights;

    renderCanvasList(manifest);

    // Hide validation
    const validationEl = document.getElementById('crud-validation');
    if (validationEl) validationEl.style.display = 'none';

    // Scroll to editor
    panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCanvasList(manifest) {
    const container = document.getElementById('crud-canvas-list');
    if (!container || !manifest.items) { if (container) container.innerHTML = ''; return; }

    if (manifest.type === 'Collection') {
        container.innerHTML = manifest.items.map((item, i) => `
            <div style="text-align:center;padding:8px;background:var(--bg-code);border-radius:var(--radius);border:1px solid var(--border);">
                <div style="font-size:11px;font-weight:600;">${getLabel(item.label) || 'Manifest ' + (i+1)}</div>
                <div style="font-size:10px;color:var(--accent);">${item.type}</div>
            </div>
        `).join('');
        return;
    }

    container.innerHTML = manifest.items.map((canvas, i) => {
        const imgBody = canvas.items?.[0]?.items?.[0]?.body;
        const serviceId = imgBody?.service?.[0]?.id;
        const thumbUrl = serviceId ? `${serviceId}/full/80,/0/default.jpg` : '';
        return `<div style="text-align:center;position:relative;">
            <img src="${thumbUrl}" style="width:100%;height:70px;object-fit:cover;border-radius:4px;background:var(--bg-code);"
                 alt="Canvas ${i+1}" loading="lazy" onerror="this.style.minHeight='70px'">
            <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">${getLabel(canvas.label) || 'Canvas ' + (i+1)}</div>
            <button onclick="removeCrudCanvas(${i})" style="position:absolute;top:2px;right:2px;background:rgba(239,68,68,0.8);color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;line-height:18px;">✕</button>
        </div>`;
    }).join('');
}

function removeCrudCanvas(index) {
    const jsonEditor = document.getElementById('crud-json-editor');
    if (!jsonEditor) return;
    try {
        const manifest = JSON.parse(jsonEditor.value);
        if (manifest.items) {
            manifest.items.splice(index, 1);
            jsonEditor.value = JSON.stringify(manifest, null, 2);
            renderCanvasList(manifest);
            showToast('Canvas eliminado');
        }
    } catch (e) { showToast('Error: JSON inválido'); }
}

function deleteCrudManifest(id) {
    const manifests = getCrudManifests();
    delete manifests[id];
    saveCrudManifests(manifests);
    if (currentEditingId === id) {
        currentEditingId = null;
        const panel = document.getElementById('crud-editor-panel');
        if (panel) panel.style.display = 'none';
    }
    renderCrudList();
    showToast('Manifiesto eliminado');
}

function duplicateCrudManifest(id) {
    const manifests = getCrudManifests();
    const entry = manifests[id];
    if (!entry) return;
    const newId = generateManifestId();
    const copy = JSON.parse(JSON.stringify(entry));
    copy.name = copy.name + ' (copia)';
    copy.manifest.label = { "es": [copy.name] };
    copy.created = Date.now();
    manifests[newId] = copy;
    saveCrudManifests(manifests);
    renderCrudList();
    showToast('Manifiesto duplicado');
}

function openInDigiratiEditor(id) {
    const manifests = getCrudManifests();
    const entry = manifests[id];
    if (!entry) return;
    // Create a blob URL and open in editor
    const blob = new Blob([JSON.stringify(entry.manifest, null, 2)], { type: 'application/ld+json' });
    const url = URL.createObjectURL(blob);
    // Open editor in iframe with the manifest
    const container = document.getElementById('editor-iframe-container');
    const iframe = document.getElementById('editor-iframe');
    if (container && iframe) {
        container.style.display = 'block';
        iframe.src = '/editor/';
        showToast('Editor abierto — usa "Open" > "Paste URL" y pega la URL del manifiesto');
    }
}

function renderCrudList() {
    const container = document.getElementById('crud-manifest-list');
    if (!container) return;

    const manifests = getCrudManifests();
    const keys = Object.keys(manifests);

    if (keys.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:24px;">No hay manifiestos guardados. Crea uno usando las plantillas o el editor.</p>';
        return;
    }

    // Sort by creation date (newest first)
    keys.sort((a, b) => (manifests[b].created || 0) - (manifests[a].created || 0));

    container.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;">' +
        keys.map(id => {
            const entry = manifests[id];
            const manifest = entry.manifest;
            const type = manifest.type || 'Manifest';
            const itemCount = manifest.items ? manifest.items.length : 0;
            const itemLabel = type === 'Collection' ? 'manifiestos' : 'canvas';
            const date = entry.created ? new Date(entry.created).toLocaleDateString('es') : '';
            const isEditing = currentEditingId === id;

            // Get thumbnail
            let thumb = '';
            if (type !== 'Collection' && manifest.items?.[0]) {
                const imgBody = manifest.items[0].items?.[0]?.items?.[0]?.body;
                const serviceId = imgBody?.service?.[0]?.id;
                if (serviceId) thumb = `${serviceId}/full/80,/0/default.jpg`;
            }

            return `<div class="card" style="padding:12px;cursor:pointer;border:2px solid ${isEditing ? 'var(--accent)' : 'transparent'};transition:border-color 0.2s;" onclick="openCrudEditor('${id}')">
                <div style="display:flex;gap:10px;">
                    ${thumb ? `<img src="${thumb}" style="width:50px;height:50px;border-radius:4px;object-fit:cover;background:var(--bg-code);flex-shrink:0;" onerror="this.style.display='none'" loading="lazy">` : '<div style="width:50px;height:50px;border-radius:4px;background:var(--bg-code);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">' + (type === 'Collection' ? '📚' : '📄') + '</div>'}
                    <div style="min-width:0;flex:1;">
                        <div style="font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${entry.name}</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${type} · ${itemCount} ${itemLabel} · ${date}</div>
                    </div>
                </div>
                <div style="display:flex;gap:4px;margin-top:8px;" onclick="event.stopPropagation()">
                    <button class="btn btn-outline" style="font-size:10px;padding:2px 6px;" onclick="openCrudEditor('${id}')">✏️ Editar</button>
                    <button class="btn btn-outline" style="font-size:10px;padding:2px 6px;" onclick="duplicateCrudManifest('${id}')">📋 Duplicar</button>
                    <button class="btn btn-outline" style="font-size:10px;padding:2px 6px;" onclick="openInDigiratiEditor('${id}')">🛠️ Editor</button>
                    <button class="btn btn-outline" style="font-size:10px;padding:2px 6px;color:#ef4444;border-color:#ef4444;" onclick="deleteCrudManifest('${id}')">🗑️</button>
                </div>
            </div>`;
        }).join('') +
    '</div>';
}

function validateManifest(manifest) {
    const errors = [];
    if (!manifest['@context']) errors.push('Falta "@context"');
    else if (manifest['@context'] !== 'http://iiif.io/api/presentation/3/context.json')
        errors.push('"@context" debería ser "http://iiif.io/api/presentation/3/context.json"');
    if (!manifest.type) errors.push('Falta "type"');
    else if (!['Manifest', 'Collection'].includes(manifest.type))
        errors.push('"type" debe ser "Manifest" o "Collection"');
    if (!manifest.id) errors.push('Falta "id" (URL del manifiesto)');
    if (!manifest.label) errors.push('Falta "label"');
    else {
        const label = getLabel(manifest.label);
        if (!label) errors.push('"label" está vacío');
    }
    if (manifest.type === 'Manifest') {
        if (!manifest.items || manifest.items.length === 0)
            errors.push('Un Manifest necesita al menos un Canvas en "items"');
        if (manifest.items) {
            manifest.items.forEach((canvas, i) => {
                if (canvas.type !== 'Canvas') errors.push(`items[${i}].type debería ser "Canvas"`);
                if (!canvas.items || canvas.items.length === 0)
                    errors.push(`Canvas ${i+1} necesita al menos una AnnotationPage`);
            });
        }
        if (manifest.behavior) {
            const validBehaviors = ['paged', 'continuous', 'individuals', 'auto-advance', 'no-auto-advance', 'unordered', 'multi-part', 'together', 'sequence', 'thumbnail-nav', 'no-nav'];
            manifest.behavior.forEach(b => {
                if (!validBehaviors.includes(b)) errors.push(`Behavior "${b}" no reconocido`);
            });
        }
    }
    if (manifest.rights && !manifest.rights.startsWith('http'))
        errors.push('"rights" debe ser una URL HTTP');
    return errors;
}

// ─── Section 18: Content Search API ───
const SEARCH_MANIFESTS = [
    { id: 'b28136615', title: "Gray's School and Field Book of Botany", suggestions: ['plant', 'flower', 'leaf', 'London', 'seed'] },
    { id: 'b20442233', title: 'Sexual Anomalies and Perversions', suggestions: ['water', 'blood', 'brain', 'psychology', 'treatment'] },
];

let searchOsdViewer = null;

function initContentSearch() {
    const manifestSel = document.getElementById('search-manifest-select');
    const queryInput = document.getElementById('search-query-input');
    const searchBtn = document.getElementById('search-execute-btn');
    const statusEl = document.getElementById('search-status');
    if (!manifestSel || !searchBtn) return;

    searchBtn.addEventListener('click', executeSearch);
    queryInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') executeSearch(); });

    async function executeSearch() {
        const manifestId = manifestSel.value;
        const query = queryInput.value.trim();
        if (!query) { statusEl.textContent = '⚠️ Escribe un término de búsqueda.'; return; }

        const searchUrl = `https://iiif.wellcomecollection.org/search/v1/${manifestId}?q=${encodeURIComponent(query)}`;
        statusEl.innerHTML = '⏳ Buscando...';

        // Show URL
        const urlContainer = document.getElementById('search-request-url');
        const urlOutput = urlContainer?.querySelector('.url-output');
        if (urlContainer && urlOutput) {
            urlOutput.textContent = searchUrl;
            urlContainer.style.display = 'block';
        }

        try {
            const res = await fetch(searchUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            // JSON output
            const jsonOutput = document.getElementById('search-json-output');
            if (jsonOutput) jsonOutput.textContent = JSON.stringify(data, null, 2);

            // Stats
            const total = data.within?.total || 0;
            const resources = data.resources || [];
            const hits = data.hits || [];
            const canvases = new Set(resources.map(r => r.on?.split('#')[0]).filter(Boolean));

            document.getElementById('search-total').textContent = total;
            document.getElementById('search-hits-count').textContent = hits.length;
            document.getElementById('search-canvases-count').textContent = canvases.size;
            document.getElementById('search-results').style.display = 'block';

            statusEl.innerHTML = `✅ Encontrados <strong>${total}</strong> resultados para "<strong>${escapeHtml(query)}</strong>" en ${canvases.size} páginas.`;

            // Render hits
            const hitsList = document.getElementById('search-hits-list');
            if (hitsList && hits.length > 0) {
                hitsList.innerHTML = hits.map((hit, i) => {
                    const match = hit.match || '';
                    const before = hit.before ? hit.before.slice(-80) : '';
                    const after = hit.after ? hit.after.slice(0, 80) : '';
                    const annotId = hit.annotations?.[0] || '';
                    const resource = resources.find(r => r['@id'] === annotId);
                    const canvasUrl = resource?.on || '';
                    const xywhMatch = canvasUrl.match(/#xywh=(\d+,\d+,\d+,\d+)/);
                    const xywh = xywhMatch ? xywhMatch[1] : '';
                    const canvasId = canvasUrl.split('#')[0];
                    const pageId = canvasId.split('/').pop() || `resultado ${i + 1}`;

                    return `<div class="card" style="padding:10px;margin-bottom:6px;cursor:pointer;font-size:12px;transition:background .2s;" 
                        data-canvas="${escapeHtml(canvasUrl)}" data-xywh="${xywh}"
                        onclick="viewSearchResult(this)"
                        onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                            <span style="font-weight:600;color:var(--accent);">📄 ${escapeHtml(pageId)}</span>
                            ${xywh ? `<code style="font-size:10px;color:var(--text-muted);">#xywh=${xywh}</code>` : ''}
                        </div>
                        <div style="line-height:1.6;">
                            <span style="color:var(--text-muted);">${escapeHtml(before)}</span><mark style="background:var(--accent);color:#fff;padding:1px 4px;border-radius:3px;">${escapeHtml(match)}</mark><span style="color:var(--text-muted);">${escapeHtml(after)}</span>
                        </div>
                    </div>`;
                }).join('');
            } else if (hitsList) {
                hitsList.innerHTML = '<p style="color:var(--text-muted);text-align:center;">No se encontraron hits.</p>';
            }
        } catch (e) {
            statusEl.innerHTML = `❌ Error: ${escapeHtml(e.message)}`;
            document.getElementById('search-results').style.display = 'none';
        }
    }
}

function viewSearchResult(el) {
    const canvasUrl = el.dataset.canvas;
    const xywh = el.dataset.xywh;
    if (!canvasUrl) return;

    const container = document.getElementById('search-canvas-viewer-container');
    const infoEl = document.getElementById('search-canvas-info');
    if (container) container.style.display = 'block';

    // Extract the image identifier from the canvas URL
    // Wellcome canvas pattern: .../canvases/b28136615_0390.jp2#xywh=...
    const canvasId = canvasUrl.split('#')[0];
    const canvasSegment = canvasId.split('/').pop();
    
    if (infoEl) {
        infoEl.innerHTML = `Canvas: <code>${escapeHtml(canvasSegment)}</code>` + 
            (xywh ? ` | Coordenadas: <code>#xywh=${xywh}</code>` : '');
    }

    // Build IIIF image info.json URL for Wellcome
    // Wellcome images: https://iiif.wellcomecollection.org/image/{identifier}/info.json
    const imageInfoUrl = `https://iiif.wellcomecollection.org/image/${canvasSegment}/info.json`;

    if (searchOsdViewer) searchOsdViewer.destroy();
    
    searchOsdViewer = OpenSeadragon({
        id: 'search-osd-viewer',
        prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/',
        tileSources: imageInfoUrl,
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        showRotationControl: true,
        gestureSettingsMouse: { scrollToZoom: true },
        minZoomLevel: 0.3,
        maxZoomLevel: 30,
        animationTime: 0.3,
        crossOriginPolicy: 'Anonymous',
    });

    // If we have xywh coordinates, zoom to that region after load
    if (xywh) {
        searchOsdViewer.addHandler('open', function() {
            const [x, y, w, h] = xywh.split(',').map(Number);
            const tiledImage = searchOsdViewer.world.getItemAt(0);
            if (!tiledImage) return;
            const imgSize = tiledImage.getContentSize();
            // Convert pixel coords to viewport coords
            const rect = new OpenSeadragon.Rect(
                x / imgSize.x,
                y / imgSize.y,
                w / imgSize.x,
                h / imgSize.y
            );
            // Add some padding
            const padded = new OpenSeadragon.Rect(
                rect.x - rect.width * 0.5,
                rect.y - rect.height * 2,
                rect.width * 2,
                rect.height * 5
            );
            searchOsdViewer.viewport.fitBounds(padded);

            // Draw overlay to highlight the match
            const overlayEl = document.createElement('div');
            overlayEl.style.cssText = 'border:3px solid #f59e0b;background:rgba(245,158,11,0.2);border-radius:2px;';
            searchOsdViewer.addOverlay({
                element: overlayEl,
                location: new OpenSeadragon.Rect(x / imgSize.x, y / imgSize.y, w / imgSize.x, h / imgSize.y),
            });
        });
    }

    // Scroll to viewer
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Section 19: Caso práctico OHC ───
const OHC_IIIF_BASE = 'https://iiif.ohc.cu/iiif/3';
const OHC_IMAGES = [
    { id: 'ohcnp_np_000002510.jpg', title: 'Naipe de colección', collection: 'Naipes', itemId: 2614 },
    { id: 'ohcnp_np_000002488.jpg', title: 'Naipe histórico', collection: 'Naipes', itemId: 2892 },
    { id: 'ohcnp_np_000002482.jpg', title: 'Baraja cubana', collection: 'Naipes', itemId: 2893 },
    { id: 'ohcfh_els_000000915.jpg', title: 'Foto Eusebio Leal', collection: 'Fotos Leal', itemId: 1663 },
    { id: 'ohcfh_els_000000965.jpg', title: 'Eusebio Leal retrato', collection: 'Fotos Leal', itemId: 1712 },
    { id: 'ohcfh_els_000000863.jpg', title: 'Restauración Habana Vieja', collection: 'Fotos Leal', itemId: 1614 },
    { id: 'ohcbh_soc_000012650.jpg', title: 'Revista Social portada', collection: 'Revista Social', itemId: 1420 },
    { id: 'ohcbh_soc_000012665.jpg', title: 'Revista Social interior', collection: 'Revista Social', itemId: 1475 },
    { id: 'ohcbh_soc_000012666.jpg', title: 'Publicidad vintage', collection: 'Revista Social', itemId: 1476 },
    { id: 'ohcmo_mo_000001522.jpg', title: 'Reloj de época', collection: 'Relojes', itemId: 2319 },
    { id: 'ohcmo_mo_000001646.jpg', title: 'Reloj de pared', collection: 'Relojes', itemId: 2340 },
    { id: 'ohcmo_mo_000001600.jpg', title: 'Reloj de bolsillo', collection: 'Relojes', itemId: 2323 },
    { id: 'ohcmo_mo_000001304.jpg', title: 'Joya colonial', collection: 'Joyas', itemId: 2349 },
    { id: 'ohcmo_mo_000001368.jpg', title: 'Broche antiguo', collection: 'Joyas', itemId: 2353 },
    { id: 'ohcmo_mo_000001314.jpg', title: 'Collar patrimonial', collection: 'Joyas', itemId: 2350 },
    { id: 'ohcah_cptsgo_000003428.jpg', title: 'Postal de Santiago', collection: 'Postales', itemId: 2754 },
    { id: 'ohcah_cptsgo_000003430.jpg', title: 'Postal colonial', collection: 'Postales', itemId: 2756 },
    { id: 'ohcah_cptsgo_000003432.jpg', title: 'Vista panorámica', collection: 'Postales', itemId: 2758 },
];

let ohcOsdViewer = null;
let ohcCompareLeft = null;
let ohcCompareRight = null;

function initOhcSection() {
    initOhcGallery();
    initOhcBuilder();
    initOhcViewer();
    initOhcCompare();
    initOhcInfo();
    initOhcMetadata();
}

function initOhcGallery() {
    const gallery = document.getElementById('ohc-gallery');
    if (!gallery) return;

    function render(filter) {
        const imgs = filter === 'all' ? OHC_IMAGES : OHC_IMAGES.filter(i => i.collection === filter);
        gallery.innerHTML = imgs.map(img => `
            <div class="card ohc-gallery-item" data-collection="${img.collection}" style="padding:6px;text-align:center;cursor:pointer;" data-id="${img.id}">
                <img src="${OHC_IIIF_BASE}/${img.id}/square/150,/0/default.jpg"
                     style="width:100%;border-radius:4px;margin-bottom:4px;min-height:100px;background:var(--bg-code);"
                     alt="${img.title}" loading="lazy"
                     onerror="this.style.minHeight='100px';this.alt='Error al cargar';">
                <div style="font-size:11px;font-weight:600;line-height:1.3;">${img.title}</div>
                <div style="font-size:10px;color:var(--text-muted);">${img.collection}</div>
            </div>
        `).join('');

        gallery.querySelectorAll('.ohc-gallery-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                // Set it in the URL builder
                const select = document.getElementById('ohc-image-select');
                if (select) { select.value = id; select.dispatchEvent(new Event('change')); }
                // Scroll to builder
                document.getElementById('ohc-image-select')?.closest('.card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    document.querySelectorAll('.ohc-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.ohc-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            render(btn.dataset.filter);
        });
    });

    render('all');
}

function initOhcBuilder() {
    const select = document.getElementById('ohc-image-select');
    const preview = document.getElementById('ohc-preview');
    const urlOutput = document.getElementById('ohc-url-output');
    if (!select || !preview) return;

    // Populate select
    select.innerHTML = OHC_IMAGES.map(img =>
        `<option value="${img.id}">[${img.collection}] ${img.title}</option>`
    ).join('');

    const controls = ['ohc-region', 'ohc-size', 'ohc-rotation', 'ohc-quality', 'ohc-format'].map(id => document.getElementById(id));

    function update() {
        const id = select.value;
        const region = document.getElementById('ohc-region').value;
        const size = document.getElementById('ohc-size').value;
        const rotation = document.getElementById('ohc-rotation').value;
        const quality = document.getElementById('ohc-quality').value;
        const format = document.getElementById('ohc-format').value;
        const url = `${OHC_IIIF_BASE}/${id}/${region}/${size}/${rotation}/${quality}.${format}`;
        urlOutput.textContent = url;
        preview.innerHTML = `<img src="${url}" style="max-width:100%;max-height:350px;border-radius:4px;" alt="Preview"
            onerror="this.outerHTML='<span class=\\'placeholder\\'>Error al cargar imagen</span>';">`;
    }

    [select, ...controls].forEach(el => { if (el) el.addEventListener('change', update); });
    update();
}

function initOhcViewer() {
    const select = document.getElementById('ohc-viewer-select');
    const btn = document.getElementById('ohc-viewer-load-btn');
    if (!select || typeof OpenSeadragon === 'undefined') return;

    select.innerHTML = OHC_IMAGES.map(img =>
        `<option value="${img.id}">[${img.collection}] ${img.title}</option>`
    ).join('');

    function loadViewer() {
        if (ohcOsdViewer) ohcOsdViewer.destroy();
        ohcOsdViewer = OpenSeadragon({
            id: 'ohc-osd-viewer',
            prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/',
            tileSources: `${OHC_IIIF_BASE}/${select.value}/info.json`,
            showNavigator: true,
            navigatorPosition: 'BOTTOM_RIGHT',
            showRotationControl: true,
            showFlipControl: true,
            gestureSettingsMouse: { scrollToZoom: true },
            gestureSettingsTouch: { pinchToZoom: true },
            minZoomLevel: 0.3,
            maxZoomLevel: 30,
            animationTime: 0.3,
            crossOriginPolicy: 'Anonymous',
        });
    }

    btn.addEventListener('click', loadViewer);
    select.addEventListener('change', loadViewer);
    loadViewer();
}

function initOhcCompare() {
    const selL = document.getElementById('ohc-compare-left');
    const selR = document.getElementById('ohc-compare-right');
    if (!selL || !selR || typeof OpenSeadragon === 'undefined') return;

    const opts = OHC_IMAGES.map(img =>
        `<option value="${img.id}">[${img.collection}] ${img.title}</option>`
    ).join('');
    selL.innerHTML = opts;
    selR.innerHTML = opts;
    // Default: different images
    if (OHC_IMAGES.length > 1) selR.selectedIndex = 1;

    function makeViewer(id, imgId) {
        return OpenSeadragon({
            id,
            prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/',
            tileSources: `${OHC_IIIF_BASE}/${imgId}/info.json`,
            showNavigator: false,
            showRotationControl: true,
            gestureSettingsMouse: { scrollToZoom: true },
            minZoomLevel: 0.3,
            maxZoomLevel: 30,
            animationTime: 0.3,
            crossOriginPolicy: 'Anonymous',
        });
    }

    function loadLeft() {
        if (ohcCompareLeft) ohcCompareLeft.destroy();
        ohcCompareLeft = makeViewer('ohc-compare-viewer-left', selL.value);
    }
    function loadRight() {
        if (ohcCompareRight) ohcCompareRight.destroy();
        ohcCompareRight = makeViewer('ohc-compare-viewer-right', selR.value);
    }

    selL.addEventListener('change', loadLeft);
    selR.addEventListener('change', loadRight);
    loadLeft();
    loadRight();
}

function initOhcInfo() {
    const select = document.getElementById('ohc-info-select');
    const output = document.getElementById('ohc-info-output');
    const urlSpan = document.getElementById('ohc-info-url');
    if (!select || !output) return;

    select.innerHTML = OHC_IMAGES.map(img =>
        `<option value="${img.id}">[${img.collection}] ${img.title}</option>`
    ).join('');

    async function loadInfo() {
        const url = `${OHC_IIIF_BASE}/${select.value}/info.json`;
        if (urlSpan) urlSpan.textContent = url;
        output.textContent = 'Cargando...';
        try {
            const res = await fetch(url);
            const data = await res.json();
            output.textContent = JSON.stringify(data, null, 2);
        } catch (e) {
            output.textContent = `Error: ${e.message}\n\nURL: ${url}`;
        }
    }

    select.addEventListener('change', loadInfo);
    loadInfo();
}

function initOhcMetadata() {
    const select = document.getElementById('ohc-meta-select');
    const btn = document.getElementById('ohc-meta-load-btn');
    const output = document.getElementById('ohc-metadata-output');
    if (!select || !output) return;

    select.innerHTML = OHC_IMAGES.map(img =>
        `<option value="${img.itemId}" data-img="${img.id}">[${img.collection}] ${img.title}</option>`
    ).join('');

    async function loadMeta() {
        const itemId = select.value;
        const apiUrl = `https://repositoriodigital.ohc.cu/api/items/${itemId}`;
        output.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:12px;">Consultando API de Omeka S...</p>';
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            let html = '<div style="display:grid;gap:8px;">';

            // Title
            const title = data['o:title'] || 'Sin título';
            html += `<div style="font-size:16px;font-weight:700;color:var(--accent);">${escapeHtml(title)}</div>`;

            // Thumbnail + info
            const imgId = select.options[select.selectedIndex]?.dataset.img;
            if (imgId) {
                html += `<img src="${OHC_IIIF_BASE}/${imgId}/full/300,/0/default.jpg" style="border-radius:4px;max-width:300px;" alt="${escapeHtml(title)}">`;
            }

            // Dublin Core metadata
            const dcFields = [
                ['dcterms:title', 'Título'],
                ['dcterms:description', 'Descripción'],
                ['dcterms:creator', 'Creador'],
                ['dcterms:date', 'Fecha'],
                ['dcterms:type', 'Tipo'],
                ['dcterms:format', 'Formato'],
                ['dcterms:subject', 'Tema'],
                ['dcterms:spatial', 'Lugar'],
                ['dcterms:rights', 'Derechos'],
                ['dcterms:source', 'Fuente'],
                ['dcterms:identifier', 'Identificador'],
            ];

            html += '<table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:8px;">';
            for (const [field, label] of dcFields) {
                if (data[field] && data[field].length > 0) {
                    const values = data[field].map(v => escapeHtml(v['@value'] || v['o:label'] || JSON.stringify(v))).join(', ');
                    html += `<tr style="border-bottom:1px solid var(--border);">
                        <td style="padding:6px 8px;font-weight:600;color:var(--text-muted);white-space:nowrap;vertical-align:top;">${label}</td>
                        <td style="padding:6px 8px;">${values}</td>
                    </tr>`;
                }
            }
            html += '</table>';

            // API URL
            html += `<div style="margin-top:12px;font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">
                API: <a href="${apiUrl}" target="_blank">${apiUrl}</a>
            </div>`;

            html += '</div>';
            output.innerHTML = html;
        } catch (e) {
            output.innerHTML = `<p style="color:#f87171;padding:12px;">Error al consultar la API: ${escapeHtml(e.message)}<br><code style="font-size:11px;">${escapeHtml(apiUrl)}</code></p>`;
        }
    }

    if (btn) btn.addEventListener('click', loadMeta);
    select.addEventListener('change', loadMeta);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

// ─── Boot ───
document.addEventListener('DOMContentLoaded', () => {
    initUrlAnatomy();
    initUrlBuilder();
    initRegionExplorer();
    initSizeExplorer();
    initRotationExplorer();
    initQualityExplorer();
    initInfoExplorer();
    initZoomDemo();
    initMainViewer();
    initSideBySideViewer();
    initGallery();
    initManifestExplorer();
    initMirador();
    initCrudEditor();
    initInteropSection();
    initContentSearch();
    initOhcSection();
    initNav();
    initTabs();
});
