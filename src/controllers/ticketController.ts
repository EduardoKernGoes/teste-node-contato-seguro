import { Request, Response } from "express";
import {
    createTicketService,
    getTicketsService,
    getTicketByIdService,
    updateTicketService
} from "../services/ticketService";

export async function createTicketController(req: Request, res: Response) {
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

    } catch (error: any) {
        if(error.code === 'P2003'){
            return res.status(400).json({error: "Usuário não encontrado."})
        }
        console.error("[TicketController] Erro ao criar ticket: ", error)
        return res.status(500).json({error: "Erro interno no servidor"})
    }
}

export async function getTicketsController(req: Request, res: Response){
    try{
        const ticketsData = await getTicketsService()

        return res.status(200).json({
            message: "Chamados buscados com sucesso!",
            tickets: ticketsData
        })

    } catch (error: any) {
        console.error("[TicketController] Erro ao buscar tickets: ", error)
        return res.status(500).json({error: "Erro interno no servidor"})
    }
}

export async function getTicketByIdController(req: Request, res: Response){
    try{
        const ticketID = parseInt(req.params.id as string)

        if(isNaN(ticketID)){
            return res.status(400).json({error: "ID inválido"})
        }

        console.info("[TicketController] Solicitação do ticket: ", ticketID)

        const ticketData = await getTicketByIdService(ticketID)

        if(!ticketData){
            return res.status(404).json({error: "Ticket não encontrado."})
        }

        return res.status(200).json({
            message: "Ticket buscado com sucesso",
            ticket: ticketData
        })

    } catch (error: any) {
        console.error("[TicketController] Erro ao buscar ticket por ID: ", error)
        return res.status(500).json({error: "Erro interno no servidor"})
    }
}

export async function updateTicketController(req: Request, res: Response){
    try {
        const { priority, channel, status } = req.body
        const ticketID = parseInt(req.params.id as string)

        if(!ticketID || isNaN(ticketID)){
            return res.status(400).json({error: "ID inválido"})
        }

        if(priority && (priority !== 'LOW' && priority !== 'MEDIUM' && priority !== 'HIGH')){
            return res.status(400).json({error: "Nível de prioridade inválido"})
        }

        if(channel && (channel !== 'fora_do_escopo' && channel !== 'financeiro' && channel !== 'suporte_tecnico' && channel !== 'sac' && channel !== 'ouvidoria')){
            return res.status(400).json({error: "Canal inválido"})
        }

        console.info("[TicketController] Dados de atualização do ticket: ", ticketID, priority, channel, status)

        const ticketData = await updateTicketService(ticketID, priority, channel, status)

        return res.status(200).json({
            message: "Ticket atualizado com sucesso!",
            ticket: ticketData
        })
    } catch (error: any) {
        if(error.code === 'P2025'){
            return res.status(404).json({error: "Ticket não encontrado"})
        }
        console.error("[TicketController] Erro na atualização do ticket: ", error)
        return res.status(500).json({error: "Erro interno no servidor"})
    }
}