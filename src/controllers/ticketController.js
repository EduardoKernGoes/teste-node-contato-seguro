import { createTicketService } from "../services/ticketService.js";

export async function createTicketController(req, res) {
    try {
        const { userID, title, description } = req.body

        if(!userID || !title || !description){
            return res.status(400).json({ error: "Dados incompletos para criação do ticket." })
        }

        let id = parseInt(userID)

        if(isNaN(id)){
            return res.status(400).json({error: "ID inválido. O ID deve ser um número"})
        }

        let newTicket = await createTicketService(id, title, description)

        return res.status(201).json({
            message: "Chamado criado com sucesso!",
            ticket: newTicket
        })

    } catch (error) {
        console.error("[TicketController] Erro ao criar ticket: ", error)
        return res.status(500).json({error: "Erro interno no servidor"})
    }
}