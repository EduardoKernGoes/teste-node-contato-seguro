import { PrismaClient } from "@prisma/client";
import { classifyPriorityChannel } from "../utils/classifyTickets";
import { calculateTicketHealth } from "../utils/ticketHealth";

const prisma = new PrismaClient();

type testTicket = {
    userID: number;
    title: string;
    description: string;
    ticketID?: number;
}

const ticketDataLow: testTicket = {
    userID: 1,
    title: "Ticket de Teste Jest",
    description: "Ticket de teste feito através do Jest, não contém nenhum apalavra chave"
}

const ticketDataHigh: testTicket = {
    userID: 1,
    title: "Ticket de Teste Jest",
    description: "Ticket de teste feito através do Jest, com a palavra chave denuncia"
}

describe("Testes de Tickets", () => {

    describe("Testes Unitários", () => {
        it("Lógica de Triagem - Deve classificar como 'ouvidoria' e 'HIGH'", () => {
            const res = classifyPriorityChannel("Estou sofrendo uma fraude");
            expect(res).toEqual({ channel: 'ouvidoria', priority: 'HIGH' });
        });

        it("Lógica de Triagem - Deve classificar como 'fora_do_escopo' e 'LOW'", () => {
            const res = classifyPriorityChannel("Oi, tudo bem?");
            expect(res).toEqual({ channel: 'fora_do_escopo', priority: 'LOW' });
        });

        it("Saúde do Ticket - Deve retornar 'CRITICAL', ticket 'HIGH' com mais de 24 horas", () => {
            const mockDate = new Date();
            mockDate.setHours(mockDate.getHours() - 25);

            const mockTicket = {
                priority: 'HIGH',
                createdAt: mockDate.toISOString()
            };

            const result = calculateTicketHealth(mockTicket);

            expect(result).toBe('CRITICAL');
        });

        it("Saúde do Ticket - Deve retornar 'ALERT', ticket 'HIGH' com menos de 24 horas", () => {
            const mockDate = new Date();
            mockDate.setHours(mockDate.getHours() - 5);

            const mockTicket = {
                priority: 'HIGH',
                createdAt: mockDate.toISOString()
            };

            const result = calculateTicketHealth(mockTicket);
            expect(result).toBe('ALERT');
        });

        it("Saúde do Ticket - Deve retornar 'ALERT', qualquer ticket com mais de 12 horas", () => {
            const mockDate = new Date();
            mockDate.setHours(mockDate.getHours() - 15);

            const mockTicket = {
                priority: 'LOW',
                createdAt: mockDate.toISOString()
            };

            const result = calculateTicketHealth(mockTicket);
            expect(result).toBe('ALERT');
        });

        it("Saúde do Ticket - Deve retornar 'HEALTHY', ticket 'LOW' recente", () => {
            const mockDate = new Date();
            mockDate.setHours(mockDate.getHours() - 2);

            const mockTicket = {
                priority: 'LOW',
                createdAt: mockDate.toISOString()
            };

            const result = calculateTicketHealth(mockTicket);
            expect(result).toBe('HEALTHY');
        });
    });

    describe("Banco de Dados", () => {
        it("Deve criar um ticket (fora do escopo e low) no BD", async () => {
            const response = await fetch('http://localhost:3000/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketDataLow)
            })

            const body = await response.json()

            expect(body.ticket).toHaveProperty("id")
            expect(body.ticket.title).toBe(ticketDataLow.title)
            expect(body.ticket.description).toBe(ticketDataLow.description)
            expect(body.ticket.customerId).toBe(ticketDataLow.userID)
            expect(body.ticket.channel).toBe("fora_do_escopo")
            expect(body.ticket.priority).toBe("LOW")
            expect(body.ticket.status).toBe("Aberto")

            if(body.ticket.id){
                ticketDataLow.ticketID = body.ticket.id
            }
        });
        
        it("Deve criar um ticket (ouvidoria e high) no BD", async () => {
            const response = await fetch('http://localhost:3000/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketDataHigh)
            })

            const body = await response.json()

            expect(body.ticket).toHaveProperty("id")
            expect(body.ticket.title).toBe(ticketDataHigh.title)
            expect(body.ticket.description).toBe(ticketDataHigh.description)
            expect(body.ticket.customerId).toBe(ticketDataHigh.userID)
            expect(body.ticket.channel).toBe("ouvidoria")
            expect(body.ticket.priority).toBe("HIGH")
            expect(body.ticket.status).toBe("Aberto")

            if(body.ticket.id){
                ticketDataHigh.ticketID = body.ticket.id
            }
        });

        it("Deve buscar todos os tickets do BD", async () => {
            const response = await fetch('http://localhost:3000/tickets', { method: 'GET' })

            const body = await response.json()

            expect(response.status).toBe(200)

            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("tickets");
            expect(Array.isArray(body.tickets)).toBe(true);

            if (body.tickets.length > 0) {
                const firstTicket = body.tickets[0];

                expect(firstTicket).toHaveProperty("title");
                expect(firstTicket).toHaveProperty("description");
                expect(firstTicket).toHaveProperty("channel");
                expect(firstTicket).toHaveProperty("priority");
                expect(firstTicket).toHaveProperty("status");
                expect(firstTicket).toHaveProperty("customer");
            }
        })

        it("Deve retornar lista vazia quando o usuário não tiver tickets", async () => {
            const tickets = await prisma.ticket.findMany({where: {customerId: 0}});
            expect(Array.isArray(tickets)).toBe(true);
            expect(tickets.length).toBe(0);
        });

        it("Deve buscar apenas um ticket do BD", async () => {
            const response = await fetch(`http://localhost:3000/tickets/${ticketDataLow.ticketID}`, {method: 'GET'})

            const body = await response.json()

            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("ticket");
            expect(body.ticket.id).toBe(ticketDataLow.ticketID);
            expect(body.ticket).toHaveProperty("title");
            expect(body.ticket).toHaveProperty("description");
            expect(body.ticket).toHaveProperty("channel");
            expect(body.ticket).toHaveProperty("priority");
            expect(body.ticket).toHaveProperty("status");
            expect(body.ticket).toHaveProperty("customer");
        })

        it("Deve atualizar o ticket HIGH criado anteriormente", async () => {
            const newTicketHigh = {
                priority: "MEDIUM",
                status: 'Em andamento'
            }

            const response = await fetch(`http://localhost:3000/tickets/${ticketDataHigh.ticketID}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTicketHigh)
            })

            const body = await response.json()

            expect(body.ticket.id).toBe(ticketDataHigh.ticketID)
            expect(body.ticket).toHaveProperty("title")
            expect(body.ticket).toHaveProperty("description")
            expect(body.ticket.priority).toBe(newTicketHigh.priority)
            expect(body.ticket).toHaveProperty("channel")
            expect(body.ticket.status).toBe(newTicketHigh.status)
        })
    });
});