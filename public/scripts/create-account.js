const form = document.querySelector('form')
const password_content = document.querySelector('#password')
const repeat_password_content = document.querySelector('#repeat_password')
const div_repeat_password = document.querySelector('#div_repeat_password')

form.addEventListener('submit', async (event) => {
    event.preventDefault()

    let user = form.user.value
    let email = form.email.value
    let password = form.password.value
    let repeat_password = form.repeat_password.value

    try{
        let response = await fetch('/create-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({user, email, password, repeat_password})
        })

        let data = await response.json()

        if(response.ok){
            alert("Usuário criado com sucesso!!!")
            window.location.href = '/pages/login.html'
        }else{
            alert(data.error)
        }
    } catch (error){
        console.log("Erro na comunicação com o servidor: ", error)
    }
})

repeat_password_content.addEventListener('blur', (event) => {
    let password = password_content.value
    let repeat_password = repeat_password_content.value

    if(password != repeat_password){
        repeat_password_content.className = 'password-error'

        let element = document.createElement('p')
        element.textContent = 'Senhas não coincidem!'
        element.style = 'color: red;'
        div_repeat_password.appendChild(element)
    }else{
        repeat_password_content.classList.remove('password-error')
        div_repeat_password.lastChild.remove()
    }
})

password_content.addEventListener('blur', (event) => {
    let password = password_content.value
    let repeat_password = repeat_password_content.value

    if(password != repeat_password && repeat_password){
        repeat_password_content.className = 'password-error'

        let element = document.createElement('p')
        element.textContent = 'Senhas não coincidem!'
        element.style = 'color: red;'
        div_repeat_password.appendChild(element)
    }
})