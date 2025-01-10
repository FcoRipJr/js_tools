function init_page(navbar = true, footer = true, breadcrumbs = false, menu = false){
    if(navbar === true){
        render_navbar()
    }
    if(footer === true){
        render_footer()
    }
    if(breadcrumbs === true){
        render_breadcrumbs()
    }
    if(menu === true){
        render_menu()
    }
    i18n.init();
}

function render_navbar(){
    fetch("../templates/navbar.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("navbar").innerHTML = data;
        document.getElementById("language-switcher").addEventListener("change", (event) => {
            i18n.setLanguage(event.target.value);
        });
        document.getElementById("language-switcher").value = i18n.currentLang;
        i18n.init();
    });
}

function render_footer(){
    fetch("../templates/footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("footer").innerHTML = data;
        document.getElementById("footer_year").innerHTML = new Date().getFullYear();
        i18n.init();
    });
}

function render_breadcrumbs(){
    fetch("../templates/breadcrumbs.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("breadcrumbs").innerHTML = data;
        i18n.init();
    });
}

function render_menu(){
    fetch("../templates/menu.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("menu").innerHTML = data;
        i18n.init();
    });
}

function render_Coloris(){
    let swatches = [];
    Coloris({
        el: '.coloris',
        swatches: swatches
    });
    Coloris.setInstance('.coloris', { theme: 'polaroid' })
}