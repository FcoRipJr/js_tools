let matrix = {};
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
const fileInput = document.getElementById("imageInput");
const div_input_file = document.getElementById("div_input_file");
const div_preview = document.getElementById("preview");
fileInput.addEventListener("change", () => {
    div_preview.innerHTML = ``
    div_preview.style.display = 'none'
    const file = fileInput.files[0];
    if (file) {
        if (div_input_file.classList.contains("col-sm-12")) {
            div_input_file.classList.remove("col-sm-12")
            div_input_file.classList.add("col-sm-10")
        }
        div_preview.style.display = 'flex'
        const preview = document.createElement("img");
        preview.src = URL.createObjectURL(file);
        preview.style.bottom = "0";
        preview.style.maxHeight = "100%";
        preview.style.maxWidth = "100%";
        preview.style.width = "auto";
        preview.style.alignSelf = "center";
        preview.style.justifySelf = "center";
        div_preview.appendChild(preview);
    } else {
        if (div_input_file.classList.contains("col-sm-10")) {
            div_input_file.classList.remove("col-sm-10")
            div_input_file.classList.add("col-sm-12")
        }
    }
});

function processImage() {
    const fileInput_0 = document.getElementById("imageInput").files[0];
    const tolerance = parseInt(document.getElementById("tolerance").value);
    const step = parseInt(document.getElementById("step").value);
    const ignoreColorStart = document.getElementById("ignoreColorStart").value;
    const ignoreColorEnd = document.getElementById("ignoreColorEnd").value;
    if (!fileInput_0) {
        alert("Nenhuma imagem foi selecionada!");
        return;
    }
    if (step <= 0) {
        alert("O valor de 'Step' deve ser maior que 0.");
        return;
    }
    if (tolerance < 0 || tolerance > 255) {
        alert("Tolerância deve ser entre 0 e 255.");
        return;
    }
    const img = new Image();
    img.onload = () => {
        const imagePixels = img.width * img.height;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        analyzeImage(img, tolerance, step, ignoreColorStart, ignoreColorEnd);
        setupDownloadButton();
    };
    img.src = URL.createObjectURL(fileInput_0);
}

function analyzeImage(img, tolerance, step, ignoreColorStart, ignoreColorEnd) {
    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height).data;
    const maxColors = parseInt(document.getElementById("maxColors").value);
    const threshold = parseInt(document.getElementById("groupThreshold").value) || 40;
    const worker = new Worker('../assets/js/image_colors_worker.js');

    worker.postMessage({
        imgData,
        width,
        height,
        step,
        tolerance,
        ignoreColorStart,
        ignoreColorEnd,
        maxColors,
        threshold
    });

    worker.onmessage = function (e) {
        matrix = e.data;
        renderCanvas();
        renderColorControls();
        document.getElementById('counter').innerHTML = `${Object.keys(matrix).length} &nbsp;`;
        console.log("Análise concluída!");
    };

    worker.onerror = function (error) {
        console.error("Erro no Web Worker:", error);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById("change_cores").innerHTML = "";
        document.getElementById("change_cores_btns").innerHTML = "";
        document.getElementById('counter').innerHTML = ``;
        alert(`Erro ao processar imagem.`);

    };
}

function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Object.keys(matrix).forEach(hex => {
        const data = matrix[hex];
        ctx.fillStyle = data.NewColor;
        data.pixels.forEach(pixel => {
            ctx.fillRect(pixel.x, pixel.y, 1, 1);
        });
    });

    const button = document.querySelector('button[onclick="processImage()"]');
}

function updateColor(originalHex, newHex) {
    if (matrix[originalHex]) {
        matrix[originalHex].NewColor = newHex;
    }
    renderCanvas();
}

function applyNewColors() {
    Object.keys(matrix).forEach(hex => {
        matrix[hex].hexColor = matrix[hex].NewColor;
    });
    alert("Cores aplicadas!");
}

function restoreOriginalColors() {
    Object.keys(matrix).forEach(hex => {
        matrix[hex].NewColor = matrix[hex].hexColor;
    });
    document.getElementById('randomVariation').value = 0
    renderCanvas();
    renderColorControls();
}

function setupDownloadButton() {
    const downloadButton = document.getElementById("downloadButton");
    downloadButton.onclick = () => {
        const link = document.createElement("a");
        link.download = "imagem-renderizada.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };
}

function renderColorControls() {
    let randomVariation = 0
    if (document.getElementById('randomVariation')) {
        if (document.getElementById('randomVariation').value) {
            randomVariation = document.getElementById('randomVariation').value
        }
    }
    const changeCoresDiv = document.getElementById("change_cores");
    const changeCoresDivBtns = document.getElementById("change_cores_btns");
    changeCoresDiv.innerHTML = "";
    changeCoresDivBtns.innerHTML = "";
    Object.keys(matrix).forEach(hex => {
        const data = matrix[hex];
        const div = document.createElement("div");
        div.className = "col-sm-3";
        div.innerHTML = `
                <div class="">
                    <strong>${data.NewColor} - ${data.pixels.length}</strong>
                </div>
                <div class="mb-3 d-flex align-items-center">
                    <label class="me-2"><span data-i18n="image_colors.original">Original</span>:</label>
                    <input type="text" value="${data.hexColor}" class=" me-2 coloris" readonly disabled data-coloris>
                    <label class="me-2"><span data-i18n="image_colors.new">New</span>:</label>
                    <input type="text" value="${data.NewColor}" class=" me-2 coloris" onchange="updateColor('${hex}', this.value)" data-coloris>
                </div>
                
            `;
        changeCoresDiv.appendChild(div);
    });
    changeCoresDivBtns.innerHTML += `
                <div class="d-flex justify-content-around gap-2">
                    <div class="w-30 d-flex align-items-center">
                        <input type="range" min="0" max="1" step="0.01" id="randomVariation" value="${randomVariation}" oninput="this.nextElementSibling.value = this.value">&nbsp;&nbsp;<output style="width:35px;">${randomVariation}</output>
                        <button class="btn btn-primary w-30" onclick="applyConsistentColorTransformation()"><span data-i18n="image_colors.set_variation">Set Variation</span>  <i class="bi bi-paint-bucket"></i></button>
                    </div>
                    <button class="btn btn-warning w-30" onclick="setRandom()"><span data-i18n="image_colors.random_variation">Random Variation</span>  <i class="bi bi-shuffle"></i></button>
                    <button class="btn btn-secondary w-30" onclick="restoreOriginalColors()"><span data-i18n="image_colors.restore">Restore</span>  <i class="bi bi-palette2"></i></button>
                </div>
            `;
    render_Coloris()
    i18n.init();
}

function setRandom() {
    document.getElementById('randomVariation').value = 0
    applyConsistentColorTransformation()
}

function applyConsistentColorTransformation() {
    let randomVariation = document.getElementById('randomVariation').value
    if (!randomVariation || randomVariation == 0) {
        randomVariation = Math.random()
        document.getElementById('randomVariation').value = randomVariation
    }
    const hueShift = Math.floor(randomVariation * 360) - 180;
    Object.keys(matrix).forEach(originalHex => {
        const currentColor = hexToHsl(originalHex);
        const newHue = (currentColor.h + hueShift + 360) % 360;
        const newColor = hslToHex(newHue, currentColor.s, currentColor.l);
        matrix[originalHex].NewColor = newColor;
    });
    renderCanvas();
    renderColorControls();
}

function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    b = Math.round((b + m) * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
}