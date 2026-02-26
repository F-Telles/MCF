let fleet = JSON.parse(localStorage.getItem('agco_fleet') || '[]');
let builderParams = [];
let currentSlide = 0;
let editIndex = -1;

const welcomeImages = [
    "img/agco-hexagon-guidance-770x433.jpg",
    "img/Img-Trator_da_Serie_S6_MG_0300.jpg",
    "img/mf-5700-gallery-01-1400x933.jpg",
    "img/mf-8700-s-key-benefit-technology.jpg"
];

const checkItems = [
    "Four Wheel Drive - ROW logic", "Four Wheel Drive - Failure mode", "DIFFLOCK - ROW logic", 
    "DIFFLOCK - Automatic mode", "DIFFLOCK - Failure mode", "Rear Linkage - Rear hitch lock/unlock", 
    "Rear Linkage - Rear Hitch internal", "Rear Linkage - Rear hitch modes", "Rear Linkage - Rear hitch features", 
    "Rear Linkage - Failure mode", "Rear PTO - Electrical 2 speeds (540/540E)", 
    "Rear PTO - Electrical 3 Speeds (540/540E/1000)", "Rear PTO - PTO speed limitation", 
    "Rear PTO - PTO functionnal", "Rear PTO - PTO Brake", "Rear PTO - PTO Safety", 
    "Rear PTO - PTO failure mode", "Rear PTO - Stationary Mode", "Rear PTO - FRONT PTO", 
    "Rear PTO - T3 perfo (C3)", "Rear PTO - PTO Fender", "Transmission - OPS and FNR", 
    "Transmission - Creeper", "Transmission - Brake to neutral", "Transmission - Maximal speed", 
    "Transmission - Powershuttle Logic Safety", "Transmission - PowerShuttle Agressivity", 
    "Transmission - Declutch Button", "Transmission - Preprogram Powershift", 
    "Transmission - Failure modes and safety", "Gearbox - Seat Management", "Basic OPS management", 
    "Engine - Start/stop function", "Engine - HMI displays", "Engine - STGV/T3 displays", 
    "Engine - Mémo A", "Engine - Engine curve mgnt", "Brakes - Tractor brakes", 
    "Brakes - Non MR (ROW/US)", "Display - Monitoring display", "Display - Maintenance Service", 
    "Tractor Hour Management", "Calibration - Steering middle point", "Calibration - WAS center average", 
    "Calibration - Left/right WAS", "Calibration - PVED", "Calibration - Clutch Pedal", 
    "Calibration - Hitch lever", "Calibration - Hitch", "Calibration - Forward Speed", 
    "Calibration - Linkage controls", "Calibration - Powershuttle", "Telemetry - Life cycle", 
    "Telemetry - Activation via AGCO VT", "Telemetry - Config files", "Isobus - UT (Universal Terminal)", 
    "Isobus - Relay managment", "Isobus - Tracteur ECU", "Isobus - Session Control + VOE", 
    "Isobus - Task doc", "Reverse Buzzer/Lights"
];

document.addEventListener('DOMContentLoaded', () => {
    updateMachineSelect();
    initCarousel();
});

// CARROSSEL
function initCarousel() {
    const track = document.getElementById('carousel-track');
    if(track) track.innerHTML = welcomeImages.map(src => `<img src="${src}" class="carousel-image">`).join('');
}

function moveCarousel(dir) {
    const track = document.getElementById('carousel-track');
    currentSlide = (currentSlide + dir + welcomeImages.length) % welcomeImages.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    document.getElementById('btn-' + tabId).classList.add('active');
}

// NOVO: EDITAR INFO DO TRATOR (ID, Marca, Modelo)
function editMachineInfo() {
    const idx = document.getElementById('select-machine').value;
    if (idx === "") return;
    const m = fleet[idx];

    const newID = prompt("Update Tractor ID:", m.id);
    const newModel = prompt("Update Tractor Model:", m.model);
    const newBrand = prompt("Update Brand (Valtra/Massey Ferguson):", m.brand);

    if (newID !== null && newModel !== null && newBrand !== null) {
        fleet[idx].id = newID;
        fleet[idx].model = newModel;
        fleet[idx].brand = newBrand;
        localStorage.setItem('agco_fleet', JSON.stringify(fleet));
        updateMachineSelect();
        document.getElementById('select-machine').value = idx;
        loadMachineDetails();
        alert("Machine info updated successfully!");
    }
}

// BUILDER (ACEITA CHAR NO ID)
function addParamToBuilder() {
    const id = document.getElementById('new-param-id').value;
    const val = document.getElementById('new-param-val').value;
    if(!id || val === "") return alert("Enter ID and Value");
    builderParams.push({ id: id, val: parseInt(val) || 0 });
    renderBuilder();
    document.getElementById('new-param-id').value = '';
    document.getElementById('new-param-val').value = '';
}

function renderBuilder() {
    document.getElementById('builder-table').innerHTML = builderParams.map((p, i) => `
        <div class="mcf-line">
            <span>PARM: ${p.id}</span>
            <span>VAL: ${p.val} <button onclick="builderParams.splice(${i},1);renderBuilder()" style="background:none; border:none; color:red; cursor:pointer; font-weight:bold; margin-left:5px">X</button></span>
        </div>
    `).join('');
}

function exportBuiltMCF() {
    if(builderParams.length === 0) return alert("List is empty!");
    const data = generateAGCOStructure(builderParams);
    saveFile(data, "MANUAL_BUILD.mc");
}

function clearBuilder() { builderParams = []; renderBuilder(); }

// FLEET & EDIT
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

// REGRESSION & PDF
function loadChecklist() {
    const idx = document.getElementById('select-machine-status').value;
    const display = document.getElementById('status-display');
    const verGroup = document.getElementById('version-input-group');
    if (idx === "") { display.style.display = "none"; verGroup.style.display = "none"; return; }
    display.style.display = "block"; verGroup.style.display = "block";
    resetChecklist();
    renderHistory(idx);
}

function resetChecklist() {
    editIndex = -1;
    document.getElementById('software-version').value = '';
    document.getElementById('save-status-btn').innerText = "💾 Save Result";
    document.getElementById('checklist-container').innerHTML = checkItems.map(item => `
        <div class="mcf-line" style="color:#333; border-bottom: 1px solid #eee;">
            <span>${item}</span><input type="checkbox" class="st-cb" data-item="${item}">
        </div>
    `).join('');
}

function saveChecklist() {
    const idx = document.getElementById('select-machine-status').value;
    const swVersion = document.getElementById('software-version').value;
    if(!swVersion) return alert("Enter SW Version");
    const status = {}; let pass = 0;
    document.querySelectorAll('.st-cb').forEach(cb => { status[cb.dataset.item] = cb.checked; if(cb.checked) pass++; });
    const result = { version: swVersion, date: new Date().toLocaleString(), results: status, score: `${pass}/${checkItems.length}` };
    if(!fleet[idx].swHistory) fleet[idx].swHistory = [];
    if(editIndex > -1) fleet[idx].swHistory[editIndex] = result;
    else fleet[idx].swHistory.unshift(result);
    localStorage.setItem('agco_fleet', JSON.stringify(fleet));
    resetChecklist(); renderHistory(idx);
}

function renderHistory(idx) {
    const history = fleet[idx].swHistory || [];
    document.getElementById('history-body').innerHTML = history.map((h, i) => `
        <tr><td>${h.date}</td><td><strong>${h.version}</strong></td><td>${h.score}</td>
        <td>
            <button class="btn-pdf-sm" onclick="exportPDF(${idx},${i})">PDF</button>
            <button class="btn-edit-sm" onclick="editHistoryItem(${idx},${i})">Edit</button>
            <button class="btn-del-sm" onclick="deleteHistoryItem(${idx},${i})">Del</button>
        </td></tr>
    `).join('');
}

function exportPDF(mIdx, hIdx) {
    const m = fleet[mIdx]; const h = m.swHistory[hIdx];
    const { jsPDF } = window.jspdf; const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(211, 47, 47); doc.text("AGCO REGRESSION REPORT", 20, 20);
    doc.setFontSize(10); doc.setTextColor(50); doc.text(`Machine: ${m.brand} ${m.model} | ID: ${m.id}`, 20, 30);
    doc.text(`SW Package: ${h.version} | Date: ${h.date} | Score: ${h.score}`, 20, 36);
    doc.line(20, 40, 190, 40);
    let y = 50;
    Object.keys(h.results).forEach(item => {
        doc.text(`${h.results[item] ? '[PASS]' : '[FAIL]'} - ${item}`, 25, y);
        y += 6; if(y > 280) { doc.addPage(); y = 20; }
    });
    doc.save(`Report_${m.id}_${h.version}.pdf`);
}

function editHistoryItem(mIdx, hIdx) {
    const h = fleet[mIdx].swHistory[hIdx];
    editIndex = hIdx;
    document.getElementById('software-version').value = h.version;
    document.getElementById('save-status-btn').innerText = "Update Record";
    document.querySelectorAll('.st-cb').forEach(cb => cb.checked = h.results[cb.dataset.item] || false);
}

function deleteHistoryItem(mIdx, hIdx) {
    if(confirm("Delete record?")) { fleet[mIdx].swHistory.splice(hIdx, 1); localStorage.setItem('agco_fleet', JSON.stringify(fleet)); renderHistory(mIdx); }
}

// AUXILIARES
function generateAGCOStructure(params) {
    return { "softwareParameters": params, "hardwareConfiguration": [], "syntaxVersion": "1.1.0", "transactionID": "", "deviceSerialNumber": "081014660396130324174002", "transactionType": "COMPLETE", "featureManagerDevice": "1xFFF0001702B" };
}

function updateMachineSelect() {
    const options = '<option value="">-- Select --</option>' + fleet.map((m, i) => `<option value="${i}">${m.id} - ${m.model}</option>`).join('');
    document.getElementById('select-machine').innerHTML = options;
    document.getElementById('select-machine-status').innerHTML = options;
}

function handleImport(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        fleet.push({ id: document.getElementById('imp-id').value, brand: document.getElementById('imp-brand').value, model: document.getElementById('imp-model').value, params: data.softwareParameters || [], swHistory: [] });
        localStorage.setItem('agco_fleet', JSON.stringify(fleet));
        location.reload();
    };
    reader.readAsText(file);
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