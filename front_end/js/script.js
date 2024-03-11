var senha = document.getElementById('senha');
var confirmar_senha = document.getElementById('confirmar_senha');
var form = document.getElementById('passwordForm');
var message = document.getElementById('message');

form.addEventListener('submit', function (event) {

    if (senha.value !== confirmar_senha.value) {
        message.textContent = "As senhas não coincidem!";
        event.preventDefault();
    } else {
        message.textContent = "Senhas Identicas";
        event.preventDefault();
    }
});