import { PrismaClient } from "@prisma/client";
import { classifyPriorityChannel } from "../utils/classifyTickets.js";

const prisma = new PrismaClient()

export async function createTicketService(customerId, title, description){
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