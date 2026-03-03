
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
