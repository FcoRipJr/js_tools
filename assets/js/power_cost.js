const input_kwh_cost = document.getElementById('kwh_cost')
const input_consumption_hour = document.getElementById('consumption_hour')
const input_cost_hour = document.getElementById('cost_hour')
const input_time = document.getElementById('time')
const input_total_cost = document.getElementById('total_cost')

var kwh_cost = 0.65
var consumption_hour = 0.125
var cost_hour = kwh_cost * consumption_hour
var time = 0
var total_cost = 0

document.querySelectorAll("input").forEach(input => {
    input.addEventListener('change', (event) => {
        console.log(event)
        set_vars_from_inputs()
    })
})

function set_inputs_from_vars() {
    input_kwh_cost.value = kwh_cost
    input_consumption_hour.value = consumption_hour
    input_cost_hour.value = cost_hour
    input_time.value = time
    input_total_cost.value = total_cost
}

function set_vars_from_inputs() {
    kwh_cost = input_kwh_cost.value
    consumption_hour = input_consumption_hour.value
    cost_hour = input_cost_hour.value
    time = input_time.value
    total_cost = input_total_cost.value
    calcular_valor()
}

function calcular_valor() {
    cost_hour = kwh_cost * consumption_hour
    total_cost = cost_hour * time
    set_inputs_from_vars()
}