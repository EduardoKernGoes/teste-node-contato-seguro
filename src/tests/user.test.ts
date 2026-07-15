import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

type testUser = {
    user: string;
    email: string;
    password: string;
    repeat_password: string;
    role?: string;
    id?: number;
}

const userAdmin: testUser = {
    user: "Teste Admin Jest",
    email: "teste_admin_jest@contatoseguro.com",
    password: "senhaForte123",
    repeat_password: "senhaForte123",
    role: "ADMIN"
}

const userClient: testUser = {
    user: "Teste Jest",
    email: "teste_jest@contatoseguro.com",
    password: "senhaForte123",
    repeat_password: "senhaForte123"
}

describe("Testes Banco de Dados - Tabela Usuários", () =>{
    
    it("Deve criar um usuário Administrador (ADMIN)", async() =>{

        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userAdmin)
        })

        const body = await response.json()

        expect(body.user).toHaveProperty("id")
        expect(body.user.name).toBe("Teste Admin Jest")
        expect(body.user.email).toBe("teste_admin_jest@contatoseguro.com")
        expect(body.user.password).toBe("senhaForte123")
        expect(body.user.role).toBe("ADMIN")

        if(body.user.id){
            userAdmin.id = body.user.id
        }
    })

    it("Deve criar um usuário Cliente (CLIENT)", async() =>{

        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userClient)
        })

        const body = await response.json()

        expect(body.user).toHaveProperty("id")
        expect(body.user.name).toBe("Teste Jest")
        expect(body.user.email).toBe("teste_jest@contatoseguro.com")
        expect(body.user.password).toBe("senhaForte123")
        expect(body.user.role).toBe("CLIENT")

        if(body.user.id){
            userClient.id = body.user.id
        }
    })

    it("Deve buscar todos os usuários do BD", async () => {
        const response = await fetch('http://localhost:3000/users', {method: 'GET'})

        const body = await response.json()

        expect(response.status).toBe(200)

        expect(body).toHaveProperty("message");
        expect(body).toHaveProperty("users");
        expect(Array.isArray(body.users)).toBe(true);

        if (body.users.length > 0) {
            const firstUser = body.users[0];

            expect(firstUser).toHaveProperty("id");
            expect(firstUser).toHaveProperty("name");
            expect(firstUser).toHaveProperty("email");

            expect(firstUser).not.toHaveProperty("password");
        }
    })

    it("Deve buscar apenas um usuário do BD", async () => {
        const response = await fetch(`http://localhost:3000/users/${userClient.id}`, {method: 'GET'})

        const body = await response.json()

        expect(body).toHaveProperty("message");
        expect(body).toHaveProperty("user");
        expect(body.user.id).toBe(userClient.id);
        expect(body.user).toHaveProperty("name");
        expect(body.user).toHaveProperty("email");
        expect(body.user).toHaveProperty("role");
    })

    it("Deve atualizar o usuário ADMIN criado anteriormente", async () => {
        const newUserAdmin = {
            user: "Teste Admin Jest Alterado",
            email: userAdmin.email,
            password: userAdmin.password,
            role: 'CLIENT'
        }

        const response = await fetch(`http://localhost:3000/users/${userAdmin.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUserAdmin)
        })

        const body = await response.json()

        expect(body.user.id).toBe(userAdmin.id)
        expect(body.user.name).toBe('Teste Admin Jest Alterado')
        expect(body.user.email).toBe(userAdmin.email)
        expect(body.user.password).toBe(userAdmin.password)
        expect(body.user.role).toBe("CLIENT")
    })

    it("Deve excluir o usuário testes administrador criado anteriormente", async () => {
        const response = await fetch(`http://localhost:3000/users/${userAdmin.id}`, {method: 'DELETE'})

        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body).toHaveProperty("message")
        expect(body).toHaveProperty("user")

        expect(body.user.id).toBe(userAdmin.id)
    })

    afterAll(async () =>{
        await prisma.user.delete({
            where: {
                id: userClient.id as number
            }
        })
        await prisma.$disconnect()
    })
})