const main = document.querySelector('main')

document.addEventListener('DOMContentLoaded', async (event) => {
    if(localStorage.getItem('id')){
        if(localStorage.getItem('role') === 'CLIENT'){
            try{
                let response = await fetch('/tickets', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                let ticketsData = await response.json()

                console.log(ticketsData)
                console.log(response)

                if(ticketsData.length >= 1){
                    let ul = document.createElement('ul')
                    for (let ticket of ticketsData) {
                        let li = document.createElement('li')
                        let a = document.createElement('a')
                        let div1 = document.createElement('div')
                        let div2 = document.createElement('div')

                        a.className = `${ticket.status} ticket`
                        a.href = `/pages/ticket.html?ticketID=${ticket.id}`
                        div1.innerHTML = `
                            <h2>${ticket.title}</h2>
                            <p>${ticket.description}</p>
                        `
                        div2.style = 'text-align: end;'
                        div2.innerHTML = `
                            <p>Cliente: ${ticket.customer.email}</p>
                        `
                        if(ticket.agentId){
                            div2.innerHTML += `
                                <p>Responsável: ${ticket.agent.email}</p>
                            `
                        }

                        let originalDate = new Date(ticket.createdAt);
                        const formattedDate = originalDate.toLocaleDateString('pt-BR');

                        div2.innerHTML += `
                            <p>Criado: ${formattedDate}</p>
                            <p>Prioridade: ${ticket.priority === "LOW" ? 'Baixa' : ticket.priority === "MEDIUM" ? 'Média' : 'Alta'}</p>
                        `

                        a.appendChild(div1)
                        a.appendChild(div2)
                        li.appendChild(a)
                        ul.appendChild(li)
                    }

                    main.appendChild(ul)

                } else {
                    let element = document.createElement('h1')
                    element.textContent = 'Você não tem chamados'
                    element.style = 'text-align: center; margin-top: 100px;'

                    main.appendChild(element)
                }
            } catch (error) {
                console.log('Erro na conexão com o servidor: ', error)
            }
        }

    }else{
        let element = document.createElement('h1')
        element.textContent = 'Faça login para ver os chamados.'
        element.style = 'text-align: center; margin-top: 100px;'

        main.appendChild(element)
    }
})