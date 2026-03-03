let fleet = JSON.parse(localStorage.getItem('agco_fleet') || '[]');
let builderParams = [];
let currentSlide = 0;
let editIndex = -1;

const welcomeImages = [
    "https://images.unsplash.com/photo-1594495894542-a4e170742845?auto=format&fit=crop&w=800&q=80", // Placeholder Tractor 1
    "https://images.unsplash.com/photo-1594913785162-e6786b42dea3?auto=format&fit=crop&w=800&q=80"  // Placeholder Tractor 2
];

const checkItems = ["Four Wheel Drive - ROW logic", "DIFFLOCK - Automatic mode", "Rear Linkage - Rear hitch lock/unlock", "Rear PTO - PTO speed limitation", "Transmission - Brake to neutral", "Engine - Start/stop function", "Brakes - Tractor brakes", "Calibration - Hitch", "Isobus - UT (Universal Terminal)"];

document.addEventListener('DOMContentLoaded', () => {
    updateMachineSelect();
    initCarousel();
});

// NAVIGATION
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    document.getElementById('btn-' + tabId).classList.add('active');
}

// CAROUSEL
function initCarousel() {
    const track = document.getElementById('carousel-track');
    if(track) track.innerHTML = welcomeImages.map(src => `<img src="${src}" class="carousel-image" style="min-width:100%; object-fit:cover;">`).join('');
}

function moveCarousel(dir) {
    const track = document.getElementById('carousel-track');
    currentSlide = (currentSlide + dir + welcomeImages.length) % welcomeImages.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// ADVANCED BUILDER LOGIC
function addParamToBuilder() {
    const idField = document.getElementById('new-param-id');
    const valField = document.getElementById('new-param-val');
    const id = idField.value.trim();
    const val = valField.value;

    if (!id || val === "") return alert("Please fill ID and Value");

    builderParams.push({ id: id, val: parseInt(val) || 0 });
    renderBuilder();
    idField.value = ''; valField.value = ''; idField.focus();
}

function processBulkInput() {
    const raw = document.getElementById('bulk-input').value;
    if (!raw.trim()) return;

    const lines = raw.split('\n');
    let addedCount = 0;

    lines.forEach(line => {
        const parts = line.split(/[,;\s\t]+/);
        if (parts.length >= 2) {
            const id = parts[0].trim();
            const val = parseInt(parts[1].trim());
            if (id && !isNaN(val)) {
                builderParams.push({ id: id, val: val });
                addedCount++;
            }
        }
    });

    renderBuilder();
    document.getElementById('bulk-input').value = '';
}

function renderBuilder() {
    const tbody = document.getElementById('builder-table-body');
    document.getElementById('param-count').innerText = `${builderParams.length} Parameters`;
    
    tbody.innerHTML = builderParams.map((p, i) => `
        <tr>
            <td><strong>${p.id}</strong></td>
            <td>${p.val}</td>
            <td><button onclick="removeParam(${i})" style="color:red; border:none; background:none; cursor:pointer;">✕</button></td>
        </tr>
    `).join('');
}

function removeParam(index) { builderParams.splice(index, 1); renderBuilder(); }
function clearBuilder() { if(confirm("Clear all?")) { builderParams = []; renderBuilder(); } }

function exportBuiltMCF() {
    if(builderParams.length === 0) return alert("List is empty!");
    const data = generateAGCOStructure(builderParams);
    saveFile(data, `MANUAL_BUILD_${Date.now()}.mc`);
}

// FLEET MANAGEMENT
function updateMachineSelect() {
    const options = '<option value="">-- Select --</option>' + fleet.map((m, i) => `<option value="${i}">${m.id} - ${m.model}</option>`).join('');
    document.getElementById('select-machine').innerHTML = options;
    document.getElementById('select-machine-status').innerHTML = options;
}

function loadMachineDetails() {
    const idx = document.getElementById('select-machine').value;
    const welcome = document.getElementById('welcome-gallery');
    const display = document.getElementById('export-display');
    if (idx === "") { welcome.style.display="block"; display.style.display="none"; return; }
    
    welcome.style.display="none"; display.style.display="block";
    const m = fleet[idx];
    const head = document.getElementById('export-header');
    head.style.background = (m.brand === "Valtra") ? "#ffcc00" : "#d32f2f";
    head.style.color = (m.brand === "Valtra") ? "black" : "white";
    document.getElementById('exp-txt-brand').innerText = m.brand;
    document.getElementById('exp-txt-model').innerText = `${m.id} | ${m.model}`;
    document.getElementById('export-mcf-table').innerHTML = m.params.map((p, i) => `
        <div class="mcf-line"><span>ID: ${p.id}</span><input type="number" value="${p.val}" onchange="updateParam(${idx},${i},this.value)"></div>
    `).join('');
}

function updateParam(mi, pi, val) {
    fleet[mi].params[pi].val = parseInt(val) || 0;
    localStorage.setItem('agco_fleet', JSON.stringify(fleet));
}

function handleImport(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            fleet.push({ 
                id: document.getElementById('imp-id').value || "NEW", 
                brand: document.getElementById('imp-brand').value, 
                model: document.getElementById('imp-model').value || "Unknown", 
                params: data.softwareParameters || [], 
                swHistory: [] 
            });
            localStorage.setItem('agco_fleet', JSON.stringify(fleet));
            location.reload();
        } catch(err) { alert("Invalid .mc file"); }
    };
    reader.readAsText(file);
}

// UTILS
function generateAGCOStructure(params) {
    return { "softwareParameters": params, "syntaxVersion": "1.1.0", "deviceSerialNumber": "AGCO-DEV-TOOL", "transactionType": "COMPLETE" };
}

function saveFile(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 4)], {type: "application/json"});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}

function downloadMC() {
    const idx = document.getElementById('select-machine').value;
    const m = fleet[idx];
    saveFile(generateAGCOStructure(m.params), `MCF_${m.id}.mc`);
}

function deleteCurrentMachine() {
    const idx = document.getElementById('select-machine').value;
    if(confirm("Delete tractor?")) { fleet.splice(idx, 1); localStorage.setItem('agco_fleet', JSON.stringify(fleet)); location.reload(); }
}
