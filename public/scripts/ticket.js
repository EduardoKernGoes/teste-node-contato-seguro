const params = new URLSearchParams(window.location.search);
const id = params.get('ticketID');
const form = document.querySelector('form')

document.addEventListener('DOMContentLoaded', async () => {
    try{
        let healthResponse = await fetch()

        let response = await fetch(`/tickets/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        let ticketData = await response.json()

        console.log(response)
        console.log(ticketData)

        let createdDate = new Date(ticketData.ticketData.createdAt)
        let formattedCreatedDate = createdDate.toLocaleDateString('pt-BR')
        let title = document.querySelector('#title')
        let date = document.querySelector('#date')
        let description = document.querySelector('#description')
        let statusInput = document.querySelector('#status')
        let priorityOption = document.querySelector(`#${ticketData.ticketData.priority}`)
        let channelOption = document.querySelector(`#${ticketData.ticketData.channel}`)

        title.textContent = ticketData.ticketData.title
        date.textContent = formattedCreatedDate
        description.textContent = ticketData.ticketData.description
        statusInput.value = ticketData.ticketData.status
        priorityOption.selected = true
        channelOption.selected = true

    } catch (error){
        console.log('Erro na conexão com o servidor: ', error)
    }
})

form.addEventListener('submit', async (event) => {
    event.preventDefault()

    let priority = form.priority.value
    let channel = form.channel.value
    let status = form.status.value

    try{
        let response = await fetch(`/tickets/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({priority, channel, status})
        })

        let ticketData = await response.json()

        console.log(response)
        console.log(ticketData)

        if(response.ok){
            alert(ticketData.message)
        }else{
            alert(ticketData.error)
        }

    } catch (error){
        console.log('Erro na comunicação com o servidor: ', error)
    }
})