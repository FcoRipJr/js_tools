const input_energia_valor = document.getElementById('energia_valor')
const input_energia_consumo = document.getElementById('energia_consumo')
const input_energia_custo_hora = document.getElementById('energia_custo_hora')
const input_material_valor = document.getElementById('material_valor')
const input_material_peso_total = document.getElementById('material_peso_total')
const input_material_custo_g = document.getElementById('material_custo_g')
const input_percent_perda = document.getElementById('percent_perda')
const input_percent_lucro = document.getElementById('percent_lucro')
const input_pintura_custo = document.getElementById('pintura_custo')
const input_outros_custos = document.getElementById('outros_custos')
const input_producao_tempo = document.getElementById('producao_tempo')
const input_producao_material = document.getElementById('producao_material')
const div_valores = document.getElementById('div_valores')

var energia_valor = 0.65
var energia_consumo = 0.125
var energia_custo_hora = energia_valor * energia_consumo
var material_valor = 120
var material_peso_total = 1000
var material_custo_g = material_valor / material_peso_total
var percent_perda = 0.45
var percent_lucro = 0.5
var pintura_custo = 0
var outros_custos = 0
var producao_tempo = 0
var producao_material = 0

document.querySelectorAll("input").forEach(input => {
    input.addEventListener('change', (event) => {
        set_vars_from_inputs()
    })
})

function set_inputs_from_vars() {
    input_energia_valor.value = energia_valor
    input_energia_consumo.value = energia_consumo
    input_energia_custo_hora.value = energia_custo_hora
    input_material_valor.value = material_valor
    input_material_peso_total.value = material_peso_total
    input_material_custo_g.value = material_custo_g
    input_percent_perda.value = percent_perda
    input_percent_lucro.value = percent_lucro
    input_pintura_custo.value = pintura_custo
    input_outros_custos.value = outros_custos
    input_producao_tempo.value = producao_tempo
    input_producao_material.value = producao_material
}

function set_vars_from_inputs() {
    energia_valor = input_energia_valor.value
    energia_consumo = input_energia_consumo.value
    energia_custo_hora = input_energia_custo_hora.value
    material_valor = input_material_valor.value
    material_peso_total = input_material_peso_total.value
    material_custo_g = input_material_custo_g.value
    percent_perda = input_percent_perda.value
    percent_lucro = input_percent_lucro.value
    pintura_custo = input_pintura_custo.value
    outros_custos = input_outros_custos.value
    producao_tempo = input_producao_tempo.value
    producao_material = input_producao_material.value
    calcular_valor()
}

function calcular_valor() {
    let html = ``
    if (producao_tempo > 0 && producao_material > 0) {
        let custo_energia = energia_custo_hora * producao_tempo
        let custo_material = material_custo_g * producao_material
        let custo_base = custo_energia + custo_material
        let perda_energia = custo_energia * percent_perda
        let perda_material = custo_material * percent_perda
        let perda_base = custo_base * percent_perda

        let custo_total = custo_base + perda_base

        let lucro_base = custo_base * percent_lucro
        let lucro_total = custo_total * percent_lucro


        let final_base = custo_total + lucro_base + Number(pintura_custo) + Number(outros_custos)
        let final_total = custo_total + lucro_total + Number(pintura_custo) + Number(outros_custos)
        html = `
            <ul class="list-group">
                <li class="list-group-item"><span data-i18n="product_cost.cost_power">$ Power</span> <span>${maskCurrency(custo_energia)}</span></li>
                <li class="list-group-item"><span data-i18n="product_cost.cost_material">$ Material</span> <span> ${maskCurrency(custo_material)}</span></li>
                <li class="list-group-item"><span data-i18n="product_cost.cost_base">$ Base</span> <span> ${maskCurrency(custo_base)}</span></li>
                <li class="list-group-item"><span data-i18n="product_cost.cost_loss_power">$ Loss Power</span> <span> ${maskCurrency(perda_energia)}</span></li>
                <li class="list-group-item"><span data-i18n="product_cost.cost_loss_material">$ Loss Material</span> <span> ${maskCurrency(perda_material)}</span></li>
                <li class="list-group-item"><span data-i18n="product_cost.cost_loss_base">$ Loss Base</span> <span> ${maskCurrency(perda_base)}</span></li>
                <li class="list-group-item"><span data-i18n="product_cost.cost_total">$ Total</span> <span> ${maskCurrency(custo_total)}</span></li>
                <li class="list-group-item"><span data-i18n="product_cost.profit_base">$ Profit Base</span> <span> ${maskCurrency(lucro_base)}</span></li>
                <li class="list-group-item"><span data-i18n="product_cost.profit_total">$ Profit Total</span> <span> ${maskCurrency(lucro_total)}</span></li>
                <li class="list-group-item"><span data-i18n="product_cost.cost_paint">$ Painting</span> <span> ${maskCurrency(pintura_custo)}</span></li>
                <li class="list-group-item"><span data-i18n="product_cost.cost_others">$ Others</span> <span> ${maskCurrency(outros_custos)}</span></li>
                <li class="list-group-item active" aria-current="true"><span data-i18n="product_cost.final_base">$ Final Base</span> <span> ${maskCurrency(final_base)}</span></li>
                <li class="list-group-item active" aria-current="true"><span data-i18n="product_cost.final_total">$ Final Total</span> <span> ${maskCurrency(final_total)}</span></li>
            </ul>
        `
    }
    div_valores.innerHTML = html
    i18n.init();
}

const maskCurrency = (valor, locale = 'pt-BR', currency = 'BRL') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    }).format(valor)
}