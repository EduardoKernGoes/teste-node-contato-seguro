const form = document.querySelector('form')

form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const title = form.title.value
    const description = form.description.value
    const userID = localStorage.getItem('id')

    try{
        const response = await fetch('/open-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userID, title, description})
        })

        const data = await response.json()

        if(response.ok){
            alert(data.message)
            window.location.href = '/index.html'
        }else{
            alert(data.error)
        }
        
    } catch (error){
        console.log("Erro na comunicação como servidor: ", error)
        alert("Erro ao se comunicar com o servidor: \n", error)
    }

})