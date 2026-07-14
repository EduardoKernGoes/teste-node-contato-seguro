const params = new URLSearchParams(window.location.search);
const id = params.get('ticketID');

document.addEventListener('DOMContentLoaded', async () => {
    try{

        let response = await fetch(`/tickets/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        let ticketData = await response.json()

        console.log(response)
        console.log(ticketData)

        let statusInput = document.querySelector('#status')
        let priorityOption = document.querySelector(`#${ticketData.ticketData.priority}`)
        let channelOption = document.querySelector(`#${ticketData.ticketData.channel}`)

        statusInput.value = ticketData.ticketData.status
        priorityOption.selected = true
        channelOption.selected = true

    } catch (error){
        console.log('Erro na conexão com o servidor: ', error)
    }
})

async function updateStatus(){
    console.log('Atualizou o status da tarefa: ', id)
    try{
        let response = await fetch(`/tickets/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({user, email, password, repeat_password})
        })
    } catch (error){
        console.log('Erro na comunicação com o servidor: ', error)
    }
}