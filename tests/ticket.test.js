import { PrismaClient } from "@prisma/client";
import { classifyPriorityChannel } from "../utils/classifyTickets";

const prisma = new PrismaClient()

describe("Testes Banco de Dados - Tabela Chamados", () =>{

    it("Deve criar um chamado no BD", async() =>{
        const description = 'Chamado de teste feito através do JEST, sem nenhuma palavra chave da triagem'

        const { channel, priority } = classifyPriorityChannel(description)

        const ticketData = {
            title: 'Chamado de teste, jest',
            description,
            channel,
            priority,
            status: "OPEN",
            customerId: 1
        }

        const createdTicket = await prisma.ticket.create({data: ticketData})

        expect(createdTicket).toHaveProperty("id")
        expect(createdTicket.description).toBe(description)
        expect(createdTicket.channel).toBe(channel)
        expect(createdTicket.priority).toBe(priority)
    })

    afterAll(async () =>{
        await prisma.$disconnect()
    })
})