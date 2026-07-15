import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

describe("Testes Banco de Dados - Tabela Usuários", () =>{
    
    // it("Deve criar um usuário Administrador (ADMIN) no BD", async() =>{
    //     const adminData = {
    //         name: "Eduardo Goes Admin",
    //         email: "eduardo_goes@contatoseguro.com.br",
    //         password: "umaSenhaForte123",
    //         role: "ADMIN"
    //     }

    //     const createdUser = await prisma.user.create({data: adminData})

    //     expect(createdUser).toHaveProperty("id")
    //     expect(createdUser.email).toBe("eduardo_goes@contatoseguro.com.br")
    //     expect(createdUser.role).toBe("ADMIN")
    // })

    it("Deve criar um usuário Cliente (CLIENT) no BD", async() =>{
        const clientData = {
            name: "Eduardo Goes",
            email: "eduardo_goes@gmail.com.br",
            password: "123456",
            role: "CLIENT"
        }

        const createdUser = await prisma.user.create({data: clientData})

        expect(createdUser).toHaveProperty("id")
        expect(createdUser.email).toBe("eduardo_goes@gmail.com.br")
        expect(createdUser.role).toBe("CLIENT")
    })

    afterAll(async () =>{
        await prisma.$disconnect()
    })
})