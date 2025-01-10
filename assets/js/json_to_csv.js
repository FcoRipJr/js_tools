const fileInput = document.getElementById("jsonInput");
const csv_separator = document.getElementById("csv_separator");
const div_output = document.getElementById("div_output");

async function getJSONText() {
    if (fileInput.files.length > 0) {
        const file = fileInput.files.item(0)
        const text = await file.text();
        return text
    } else {
        return ``
    }
}

function jsonToCsv(jsonData) {
    let csv = '';
    if(Array.isArray(jsonData)){
        const headers = Object.keys(jsonData[0]);
        csv += headers.join((csv_separator.value ?? ',')) + '\n';
        jsonData.forEach(obj => {
            const values = headers.map(header => obj[header]);
            csv += values.join((csv_separator.value ?? ',')) + '\n';
        });
    } else{
        const headers = Object.keys(jsonData);
        csv += headers.join((csv_separator.value ?? ',')) + '\n';
        let cont = 1;
        headers.forEach( (header) => {
            csv += jsonData[header];
            if(cont < headers.length){
                csv += (csv_separator.value ?? ',');
            } else {
                csv += '\n';
            }
            cont++;
        })
    }
    
    return csv;
}

async function convert_json() {
    let json = await getJSONText()
    let csv = ``
    if (json != ``) {
        csv = jsonToCsv(JSON.parse(json))
    }
    render_output(csv)
}

function get_textearea_rows(lines) {
    let row_height = 31
    let innerHeight = window.innerHeight
    var max_rows = Math.round((innerHeight*.85) / row_height)
    return Math.min(max_rows, lines)
}

function render_output(csv) {
    let html = ``
    if (csv != ``) {
        html = `<label for="" class="form-label">&nbsp;</label><textarea rows="${get_textearea_rows((csv.match(/\n/g) || []).length)}" class="form-control"> ${csv}</textarea>`
    }
    div_output.innerHTML = html
}