const full_modal = document.getElementById('full_modal')
const btn_credentials = document.getElementById('btn_credentials')
const select_user = document.getElementById('select_user')
const api_data = {users:[],midias:[],sessions:[]}

async function generate_authorization(){
    let api_base = null
    let client_id = null
    let client_secret = null
    var response_code = null
    if(localStorage.getItem('api_base') && localStorage.getItem('client_id') && localStorage.getItem('client_secret')){
        api_base = localStorage.getItem('api_base')
        client_id = localStorage.getItem('client_id')
        client_secret = localStorage.getItem('client_secret')
        await fetch(`${api_base}/token`, {
            method: "POST",
            body: JSON.stringify({client_id:client_id,client_secret:client_secret})
        } )
        .then((response) => {
            response_code = response.status
            return response.json()
        })
        .then((content) => {
            localStorage.removeItem('MidiaToken')
            if(response_code){
                if(response_code == 200){
                    localStorage.setItem('MidiaToken', `${content.token_type} ${content.token}`)
                }
            }
            return true
        })
    } else {
        btn_credentials.click()
        return false
    }
    return true
}

async function get_authorization() {
    if(localStorage.getItem('MidiaToken')){
        return localStorage.getItem('MidiaToken')
    } else {
        await generate_authorization()
        return localStorage.getItem('MidiaToken')
    }
}

async function render_users_options(){
    select_user.innerHTML = ''
    await get_users()
    let options = ``
    api_data.users.forEach(user => {
        options += `<option value="${user.id??""}">${user.name??""}</option>`
    });
    select_user.innerHTML = options
}

async function get_users(){
    await get_authorization()
    let authorization = localStorage.getItem('MidiaToken')
    console.log(authorization)
    api_base = localStorage.getItem('api_base')
    let request = {
        method: "GET",
        headers: {
            Authorization: authorization,
        },
    }
    console.log(request)
    await fetch(`${api_base}/users`, request )
    .then((response) => {
        response_code = response.status
        return response.json()
    })
    .then( async (content) => {
        if(response_code){
            if(response_code == 401){
                if(content.msg){
                    if(content.msg.includes('Authorization token expired')){
                        await generate_authorization()
                        get_users()
                    }
                }
            }
            if(response_code == 200){
                api_data.users = content.data??[]
            }
        }
        return true
    })
    return true
}

function set_credentials(){
    localStorage.setItem('api_base',document.getElementById('api_base').value)
    localStorage.setItem('client_id',document.getElementById('client_id').value)
    localStorage.setItem('client_secret',document.getElementById('client_secret').value)
    document.getElementById('btn-close-modal').click()
}

function open_set_credentials(){
    full_modal.innerHTML = ''
    let api_base = null
    let client_id = null
    let client_secret = null
    if(localStorage.getItem('api_base') ){
        api_base = localStorage.getItem('api_base')
    }
    if(localStorage.getItem('client_id') ){
        client_id = localStorage.getItem('client_id')
    }
    if(localStorage.getItem('client_secret')){
        client_secret = localStorage.getItem('client_secret')
    }
    let html = `
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-4" data-i18n="midias.set_credentials">Set Credentials</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="row">
            <div class="col-sm-3">
                <label for="api_base" class="form-label"><span data-i18n="midias.api_base">API Base URL</span>:</label>
                <input type="text" id="api_base" class="form-control" value="${api_base??""}">
            </div>
            <div class="col-sm-3">
                <label for="client_id" class="form-label"><span data-i18n="midias.client_id">client_id</span>:</label>
                <input type="text" id="client_id" class="form-control" value="${client_id??""}">
            </div>
            <div class="col-sm-6">
                <label for="client_secret" class="form-label"><span data-i18n="midias.client_secret">client_secret</span>:</label>
                <input type="text" id="client_secret" class="form-control" value="${client_secret??""}">
            </div>
        </div>
      </div>
      <div class="modal-footer">
        <button id="btn-close-modal" type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="btns.close">Close</button>
        <button type="button" class="btn btn-primary" data-i18n="btns.save" onclick="set_credentials()">Save</button>
      </div>
    </div>
    `
    full_modal.innerHTML = html
    
    i18n.init();
}