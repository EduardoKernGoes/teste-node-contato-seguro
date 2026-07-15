import { PrismaClient } from "@prisma/client";
import { classifyPriorityChannel } from "../utils/classifyTickets";

const prisma = new PrismaClient()

export async function createTicketService(customerId: number, title: string, description: string){
    const { channel, priority } = classifyPriorityChannel(description)

    console.info("[TicketService] Dados da criação do ticket: ", customerId, title, description, channel, priority)

    const ticket = await prisma.ticket.create({
        data: {
            title,
            description,
            channel,
            priority,
            customerId
        }
    });

    return ticket;
}

export async function getTicketsService(){
    const tickets = await prisma.ticket.findMany({
        orderBy: {
            createdAt: "desc"
        },
        include: {
            customer: {}
        }
    })

    return tickets
}

export async function getTicketByIdService(id: number){
    const ticket = await prisma.ticket.findUnique({
        where: {
            id
        },
        include: {
            customer: {}
        }
    })

    return ticket
}

export async function updateTicketService(id: number, priority: string, channel: string, status: string) {
    const ticket = await prisma.ticket.update({
        where: {
            id 
        },
        data: {
            priority,
            channel,
            status
        }
    })

    return ticket
}