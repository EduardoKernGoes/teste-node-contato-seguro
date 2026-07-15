import { calculateTicketHealth } from "../utils/ticketHealth.js";
import { getTicketByIdService } from "../services/ticketService.js";

export async function getTicketHealthController(req, res){
    try{
        const { id } = req.query

        if(!id){
            return res.status(400).json({error: "ID do ticket não informado na URL"})
        }

        const ticketID = parseInt(id)

        if(isNaN(ticketID)){
            return res.status(400).json({error: "ID inválido"})
        }

        console.info("[HealthController] Busca do tempo de vida do ticket: ", ticketID)

        const ticketData = await getTicketByIdService(ticketID)

        if(!ticketData){
            return res.status(404).json({error: "Ticket não encontrado"})
        }

        const ticketHealth = calculateTicketHealth(ticketData)

        return res.status(200).json({
            message: "Tempo de vida do ticket buscado com sucesso",
            ticket: ticketData,
            health: ticketHealth
        })
        
    } catch (error) {
        console.error("[HealthController] Erro ao buscar tempo de vida do ticket: ", error)
        return res.status(500).json({error: "Erro interno no servidor"})
    }
}