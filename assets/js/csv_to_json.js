const fileInput = document.getElementById("csvInput");
const csv_separator = document.getElementById("csv_separator");
const div_output = document.getElementById("div_output");

async function getCSVText() {
    if (fileInput.files.length > 0) {
        const file = fileInput.files.item(0)
        const text = await file.text();
        return text
    } else {
        return ``
    }
}

function csvJSON(csv) {
    const lines = csv.split('\n')
    const result = []
    const headers = lines[0].split((csv_separator.value ?? ','))

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i])
            continue
        const obj = {}
        const currentline = lines[i].split((csv_separator.value ?? ','))
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j]
        }
        result.push(obj)
    }
    return result
}

async function convert_csv() {
    let csv = await getCSVText()
    let json = ``
    if (csv != ``) {
        json = csvJSON(csv)
    }
    render_output(json)
}

function get_textearea_rows(length) {
    let row_height = 31
    let innerHeight = window.innerHeight
    var max_rows = Math.round((window.innerHeight*.85) / row_height)
    return Math.min(max_rows, length)
}

function render_output(json) {
    let html = ``
    if (json != ``) {
        html = `<label for="" class="form-label">&nbsp;</label><textarea rows="${get_textearea_rows(json.length)}" class="form-control"> ${JSON.stringify(json, null, 2)}</textarea>`
    }
    div_output.innerHTML = html
}