import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { classifyPriorityChannel } from './utils/classifyTickets.js';
import { count } from 'console';

const prisma = new PrismaClient()

const server = express()
const port = 3000

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

server.use(express.urlencoded({extended: true}))
server.use(express.json())

server.use(express.static(path.join(dirname, "public")))

server.post("/login", async (req, res) => {
   const { email, password } = req.body;
   console.log('Dados recebidos do usuário: ', email, password);

   const userData = await verifyLogin(email, password)

   if(userData){
      return res.status(200).json({
         message: "Loggin realizado com sucesso.",
         user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
         }
      })
   }else{
      return res.status(401).json({error: "Credenciais inválidas"})
   }
})

server.post("/users", async (req, res) => {
   const {user, email, password, repeat_password} = req.body;
   console.log("Dados recebidos do usuário: ", user, email, password, repeat_password);

   switch(true){
      case password != repeat_password:
         return res.status(400).json({error: "Senhas não coincidem"})
         break;

      case !user || !email || !password || !repeat_password:
         return res.status(400).json({error: "O formulário não pode ter itens vazios"})
         break;

      case !email.includes('@'):
         return res.status(400).json({error: "E-mail inválido"})
         break;
   }

   let userData = await createUser(user, email, password)

   if(userData === null){
      return res.status(500).json({error: "Erro interno"})
   }else if(!userData){
      return res.status(400).json({error: "Este e-mail já existe"})
   }

   return res.status(201).json({
      message: "Usuário criado com sucesso",
      user: {
         id: userData.id,
         name: userData.name,
         email: userData.email,
         role: userData.role
      }
   })
})

server.get("/users", async (req, res) => {
   let usersData = await getUsers()
   
   return res.status(200).json(usersData)
})

server.get("/users/:id", async (req, res) => {
   let userID = req.params.id
   console.log('Solicitação do usuário: ', userID)

   let userData = await getUserById(userID)

   if(userData === null){
      return res.status(500).json({error: "Erro no servidor"})
   }

   return res.status(200).json(userData)
})

server.put("/users/:id", async (req, res) => {
   let { user, email, password } = req.body
   let userID = req.params.id
   console.log('Solicitação de alteração do usuário: ', userID, user, email, password)

   let response = await updateUser(userID, user, email, password)

   if(response === null){
      return res.status(500).json({error: "Erro no servidor ao tentar ataulizar usuário"})
   }else if(!response){
      return res.status(400).json({error: "Erro ao tentar ataulizar usuário, verifique os dados do mesmo."})
   }

   return res.status(200).json({message: "Usuário atualizado com sucesso!!!"})

})

server.delete("/users/:id", async (req, res) => {
   let userID = req.params.id
   console.log('Solicitação de exclusão do usuário: ', userID)

   let response = await deleteUser(userID)

   if(response === null){
      return res.status(500).json({error: "Erro no servidor"})
   }else if (response === 'P2025'){
      return res.status(400).json({error: "Usuário não encontrado"})
   }

   return res.status(200).json({message: "usuário deletado com sucesso."})
})

server.post("/tickets", async (req, res) =>{
   const { userID, title, description } = req.body
   console.log("Dados recebidos da criação do ticket: ", userID, title, description)

   const { channel, priority } = classifyPriorityChannel(description)

   let response = await createTicket(userID, title, description, channel, priority)

   console.log(response)

   if(response === null){
      return res.status(500).json({error: "Erro interno"})
   }else if (!response){
      return res.status(400).json({error: "Erro ao tentar criar o chamado, verifique as informações do mesmo."})
   }

   return res.status(201).json({message: "Chamado criado com sucesso!"})
})

server.get("/tickets", async (req, res) => {
   console.log("solicitação dos tickets")

   let ticketsData = await getTickets()

   if(ticketsData === null){
      res.status(500).json({error: "Erro no servidor"})
   }

   return res.status(200).json(ticketsData)
})

server.get("/tickets/:id", async (req, res) => {
   let ticketID = req.params.id
   console.log("solicitação do ticket: ", ticketID)

   let ticketData = await getTicketByID(ticketID)

   return res.status(200).json(ticketData)
})

server.put("/tickets/:id/status", async (req, res) => {
   const { priority, channel, status } = req.body
   const id = req.params.id
   console.log("Atualizou o status do chamado: ", id, priority, channel, status)

   let response = await updateTicketStatus(id, priority, channel, status)

   if(response === null){
      return res.status(500).json({error: "Erro no servidor ao tentar ataulizar chamado"})
   }else if(!response){
      return res.status(400).json({error: "Erro ao tentar ataulizar chamado, verifique os dados do mesmo."})
   }

   return res.status(200).json({message: "Chamado atualizado com sucesso!!!"})
})

server.get("/health", async (req, res) => {
   try{
      await prisma.$queryRaw`SELECT 1`
      return res.status(200).json({
         message: "Servidor e Banco de Dados funcionando."
      })
   } catch (error){
      return res.status(500).json({
         message: "Banco de Dados indisponível"
      })
   }
})

server.listen(port, () => {
   console.log(`Server is running on: http://localhost:${port}`)
})

async function verifyLogin(email, password){
   try{
      const userData = await prisma.user.findFirst({
         where: {
            email: email
         }
      })

      if(!userData || userData.password !== password){
         return null
      }else{
         return userData
      }

   } catch (error){
      console.log('ERRO NA VERIFICAÇÃO DE LOGIN: ')
      console.log(error)
      return null
   }
}

async function createUser(user, email, password){
   let userData = {
      name: user,
      email,
      password,
      role: 'CLIENT'
   }

   try{
      let user = await prisma.user.create({data: userData})

      if(user.id && user.email === email && user.role === 'CLIENT'){
         return userData
      }else{
         return false
      }

      console.log(user);
   } catch (error){
      if(error instanceof PrismaClientKnownRequestError){
         return false
      }else{
         console.log('ERRO NA CRIAÇÃO DE USUÁRIO: ', error)
         return null
      }
   }
}

async function getUsers(){
   try{
      let usersData = await prisma.user.findMany()

      return usersData

   } catch (error){
      console.error('ERRO NA BUSCA DE USUÁRIOS: ', error)
      return null
   }
}

async function getUserById(id){
   try{
      let userData = await prisma.user.findUnique({
         where: {
            id: parseInt(id)
         }
      })

      return userData
      
   } catch (error){
      console.error("ERRO NA BUSCA DE USUÁRIO POR ID: ", error)
      return null
   }
}

async function updateUser(id, name, email, password){
   try{
      let user = await prisma.user.update({
         where: {
            id: parseInt(id)
         },
         data: {
            name: name,
            email: email,
            password: password
         }
      })

      if(user.id && user.name === name && user.email === email && user.password === password){
         return true
      }else{
         return false
      }
      
   } catch (error){
      console.error('ERRO NA ATUALIZAÇÃO DO USUÁRIO: ', error)
      return null
   }
}

async function deleteUser(id){
   try{
      let user = await prisma.user.delete({
         where: {
            id: parseInt(id)
         }
      })

      return true

   } catch (error){
      if(error.code === 'P2025') return error.code
      console.error('ERRO AO TENTAR EXCLUIR USUÁRIO: ', error)
      return null
   }
}

async function createTicket(userID, title, description, channel, priority){
   let ticketData = {
      title,
      description,
      channel,
      priority,
      customerId: parseInt(userID)
   }

   console.log("Dados do chamado:", ticketData)

   try{
      let ticket = await prisma.ticket.create({data: ticketData})

      console.log(ticket)

      if(ticket.id && ticket.description === description && ticket.title === title){
         return true
      }else{
         return false
      }
   } catch (error){
      console.log('ERRO NA CRIAÇÃO DO CHAMADO: ', error)
      return null
   }
}

async function getTickets(){
   try{
      let ticketsData = await prisma.ticket.findMany({
         orderBy: {
            createdAt: 'desc'
         },
         include: {
            customer: {
               select: {
                  email: true
               }
            }
         }
      })

      return ticketsData

   } catch (error){
      console.log('ERRO NA BUSCA DE TICKETS DO USUÁRIO: ', error)
      return null
   }
}

async function getTicketByID(ID){
   try{
      let ticketData = await prisma.ticket.findUnique({
         where: {
            id: parseInt(ID)
         },
         include: {
            customer: true
         }
      })

      return ticketData

   } catch (error){
      console.log("ERRO NA BUSCA DO TICKET POR ID: ", error)
      return null
   }
}

async function updateTicketStatus(id, priority, channel, status){
   try{
      let ticket = await prisma.ticket.update({
         where: { id: parseInt(id)},
         data: {
            priority: priority,
            channel: channel,
            status: status
         }
      })

      if(ticket.id && ticket.priority === priority && ticket.channel === channel && ticket.status === status){
         return true
      }else{
         return false
      }
      
   } catch (error) {
      console.log('ERRO NA ATUALIZAÇÃO DO CHAMDO: ', error)
      return null
   }
}