const form = document.querySelector('form')

form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const email = form.email.value
    const password = form.password.value

    try{
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        })

        const data = await response.json()

        if(response.ok){
            localStorage.setItem('id', data.user.id)
            localStorage.setItem('name', data.user.name)
            localStorage.setItem('email', data.user.email)
            localStorage.setItem('role', data.user.role)
            window.location.href = '/index.html'
        } else {
            alert(data.error)
        }

    } catch (error){
        console.error("Erro na comunicação: ", error)
        alert("Falha ao se conectar com o servidor")
    }
})