const uploadArea = document.getElementById('uploadArea');
const imageUpload = document.getElementById('imageUpload');
const downloadButton = document.getElementById('downloadButton');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let originalImageData = null;

document.body.addEventListener('dragover', (e) => {
    e.preventDefault();
    document.body.classList.add('fullscreen-dragover');
});

document.body.addEventListener('dragleave', (e) => {
    e.preventDefault();
    document.body.classList.remove('fullscreen-dragover');
});

document.body.addEventListener('drop', (e) => {
    e.preventDefault();
    document.body.classList.remove('fullscreen-dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
        handleFile(file);
    }
});

uploadArea.addEventListener('click', () => imageUpload.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
        handleFile(file);
    }
});

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

document.querySelectorAll('input[name="colorOption"]').forEach((elem) => {
    elem.addEventListener('change', () => {
        if (canvas.width > 0) applyGradientMap();
    });
});

downloadButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'gradient-mapped-image.png';
    link.href = canvas.toDataURL();
    link.click();
});

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Save the original image data
            applyGradientMap();
        }
        img.src = event.target.result;
    }

    if (file) {
        reader.readAsDataURL(file);
    }
}

function applyGradientMap() {
    if (!originalImageData) return;

    ctx.putImageData(originalImageData, 0, 0); // Restore the original image data

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let color1, color2;
    const selectedOption = document.querySelector('input[name="colorOption"]:checked').value;
    if (selectedOption === 'option1') {
        color1 = hexToRgb('#353745'); // Black for option 1
        color2 = hexToRgb('#FC5467'); // White for option 1
    } else if (selectedOption === 'option2') {
        color1 = hexToRgb('#2a3e81'); // Black for option 2
        color2 = hexToRgb('#9da5b3'); // White for option 2
    }

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const gray = 0.3 * r + 0.59 * g + 0.11 * b;

        const t = gray / 255;
        const newColor = interpolateColor(color1, color2, t);

        data[i] = newColor[0];
        data[i + 1] = newColor[1];
        data[i + 2] = newColor[2];
    }

    ctx.putImageData(imageData, 0, 0);
    downloadButton.disabled = false;
}

function interpolateColor(color1, color2, t) {
    const r = Math.round(color1[0] * (1 - t) + color2[0] * t);
    const g = Math.round(color1[1] * (1 - t) + color2[1] * t);
    const b = Math.round(color1[2] * (1 - t) + color2[2] * t);
    return [r, g, b];
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}
