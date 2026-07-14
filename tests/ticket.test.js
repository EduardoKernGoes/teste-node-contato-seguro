import { PrismaClient } from "@prisma/client";
import { classifyPriorityChannel } from "../utils/classifyTickets";

const prisma = new PrismaClient();

describe("Testes de Tickets", () => {

    let testUserId;

    beforeAll(async () => {
        let user = await prisma.user.upsert({
            where: { email: 'tester@contatoseguro.com' },
            update: {},
            create: { 
                name: 'Usuário de Teste', 
                email: 'tester@contatoseguro.com', 
                password: '123',
                role: 'CLIENT' 
            }
        });

        testUserId = user.id
    });

    afterEach(async () => {
        if(testUserId){
            await prisma.ticket.deleteMany({
                where: {
                    customerId: testUserId
                }
            });
        }
    });

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: 'tester@contatoseguro.com' } });
        await prisma.$disconnect();
    });

    describe("Lógica de Triagem (classifyPriorityChannel)", () => {
        it("Deve classificar fraude como 'ouvidoria' e prioridade 'HIGH'", () => {
            const res = classifyPriorityChannel("Estou sofrendo uma fraude");
            expect(res).toEqual({ channel: 'ouvidoria', priority: 'HIGH' });
        });

        it("Deve classificar mensagens vazias ou vagas como 'fora_do_escopo'", () => {
            const res = classifyPriorityChannel("Oi, tudo bem?");
            expect(res).toEqual({ channel: 'fora_do_escopo', priority: 'LOW' });
        });
    });

    describe("Banco de Dados (Ticket CRUD)", () => {
        it("Deve criar um ticket no BD com sucesso", async () => {
            const user = await prisma.user.findFirst({ where: { email: 'tester@contatoseguro.com' } });
            
            const desc = "Erro ao acessar o sistema";
            const { channel, priority } = classifyPriorityChannel(desc);

            const ticket = await prisma.ticket.create({
                data: {
                    title: "Bug de Acesso",
                    description: desc,
                    channel,
                    priority,
                    status: "Aberto",
                    customerId: user.id
                }
            });

            expect(ticket).toHaveProperty("id");
            expect(ticket.channel).toBe("suporte_tecnico");
        });

        it("Deve retornar lista vazia quando o usuário não tiver tickets", async () => {
            const tickets = await prisma.ticket.findMany({where: {customerId: 0}});
            expect(Array.isArray(tickets)).toBe(true);
            expect(tickets.length).toBe(0);
        });
    });
});