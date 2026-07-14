import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { classifyPriorityChannel } from './utils/classifyTickets.js';
import { calculateTicketHealth } from './utils/ticketHealth.js';
import { count } from 'console';

const prisma = new PrismaClient()

const server = express()
const port = 3000

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

server.use(express.urlencoded({extended: true}))
server.use(express.json())

server.use(express.static(path.join(dirname, "public")))

server.post("/users", async (req, res) => {
   const {user, email, password, repeat_password} = req.body;

   if(password != repeat_password){
      return res.status(400).json({error: "Senhas não coincidem"})
   }else if(!user || !email || !password || !repeat_password){
      return res.status(400).json({error: "O formulário não pode ter itens vazios"})
   }else if(!email.includes('@')){
      return res.status(400).json({error: "E-mail inválido"})
   }

   console.info("Dados de criação do usuário: ", user, email, password, repeat_password);

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
   let userID = parseInt(req.params.id)

   if(isNaN(userID)){
      return res.status(400).json({error: "ID inválido. O ID deve ser um número"})
   }

   console.info('Solicitação do usuário: ', userID)

   let userData = await getUserById(userID)

   if(userData === null){
      return res.status(500).json({error: "Erro no servidor"})
   }else if (!userData){
      return res.status(400).json({error: "Este usuário não existe, tente outro ID."})
   }

   return res.status(200).json(userData)
})

server.put("/users/:id", async (req, res) => {
   let { user, email, password } = req.body
   let userID = parseInt(req.params.id)

   if(isNaN(userID)){
      return res.status(400).json({error: "ID inválido. O ID deve ser um número"})
   }

   console.info('Dados da solicitação de alteração do usuário: ', userID, user, email, password)

   let response = await updateUser(userID, user, email, password)

   if(!response){
      return res.status(500).json({error: "Erro no servidor ao tentar atualizar usuário"})
   }else if(response === 'P2002'){
      return res.status(400).json({error: "Erro ao tentar ataulizar usuário, já existe um usuário com este e-mail."})
   }

   return res.status(200).json({message: "Usuário atualizado com sucesso!!!"})

})

server.delete("/users/:id", async (req, res) => {
   let userID = parseInt(req.params.id)

   if(isNaN(userID)){
      return res.status(400).json({error: "ID inválido. O ID deve ser um número"})
   }

   console.info('Solicitação de exclusão do usuário: ', userID)

   let response = await deleteUser(userID)

   if(response === null){
      return res.status(500).json({error: "Erro no servidor"})
   }else if (response === 'P2025'){
      return res.status(400).json({error: "Usuário não encontrado"})
   }

   return res.status(200).json({message: "Usuário excluido com sucesso."})
})

server.post("/tickets", async (req, res) =>{
   const { userID, title, description } = req.body

   let id = parseInt(userID)

   if(isNaN(id)){
      return res.status(400).json({error: "ID inválido. O ID deve ser um número"})
   }

   const { channel, priority } = classifyPriorityChannel(description)

   console.info("Dados da criação do ticket: ", userID, title, description, channel, priority)

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

   let ticketsData = await getTickets()

   if(ticketsData === null){
      res.status(500).json({error: "Erro no servidor"})
   }

   return res.status(200).json(ticketsData)
})

server.get("/tickets/:id", async (req, res) => {
   let ticketID = parseInt(req.params.id)

   if(isNaN(ticketID)){
      return res.status(400).json({error: "ID inválido. O ID deve ser um número"})
   }

   console.info("Solicitação do ticket: ", ticketID)

   let ticketData = await getTicketByID(ticketID)

   if(!ticketData){
      return res.status(400).json({error: "Ticket não encontrado"})
   }

   return res.status(200).json(ticketData)
})

server.put("/tickets/:id/status", async (req, res) => {
   const { priority, channel, status } = req.body
   let ticketID = parseInt(req.params.id)

   if(isNaN(ticketID)){
      return res.status(400).json({error: "ID inválido. O ID deve ser um número"})
   }

   console.info("Dados de atualização do chamado: ", ticketID, priority, channel, status)

   let response = await updateTicket(ticketID, priority, channel, status)

   if(response === null){
      return res.status(500).json({error: "Erro no servidor ao tentar ataulizar chamado"})
   }else if(!response){
      return res.status(400).json({error: "Erro ao tentar ataulizar chamado, verifique os dados do mesmo."})
   }

   return res.status(200).json({message: "Chamado atualizado com sucesso!!!"})
})

server.get("/health", async (req, res) => {
   let { id } = req.query
   let ticketID = parseInt(id)

   if(isNaN(ticketID)){
      return res.status(400).json({error: "ID inválido. O ID deve ser um número"})
   }

   let ticketData = await getTicketByID(ticketID)

   if(!ticketData){
      return res.status(400).json({error: "Ticket não encontrado"})
   }

   let ticketHealth = calculateTicketHealth(ticketData)

   return res.status(200).json({ticketData, ticketHealth})

})

server.listen(port, () => {
   console.log(`Server is running on: http://localhost:${port}`)
})

async function createUser(name, email, password){
   let userData = {
      name,
      email,
      password,
      role: 'CLIENT'
   }

   try{
      let user = await prisma.user.create({data: userData})

      console.log("Usuário criado: ", user);

      return user
   } catch (error){
      if(error instanceof PrismaClientKnownRequestError){
         return false
      }else{
         console.error('ERRO NA CRIAÇÃO DE USUÁRIO: ', error)
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
            id: id
         }
      })

      console.info("Usuário retornado: ", userData)

      if(userData){
         return userData
      }else{
         return false
      }
      
   } catch (error){
      console.error("ERRO NA BUSCA DE USUÁRIO POR ID: ", error)
      return null
   }
}

async function updateUser(id, name, email, password){
   try{
      let user = await prisma.user.update({
         where: {
            id: id
         },
         data: {
            name: name,
            email: email,
            password: password
         }
      })

      console.info("Dados do usuário: ", user)

      if(user.id && user.name === name && user.email === email && user.password === password){
         return true
      }else{
         return false
      }
      
   } catch (error){
      if(error.code === 'P2002') return error.code
      console.error('ERRO NA ATUALIZAÇÃO DO USUÁRIO: ', error)
      return null
   }
}

async function deleteUser(id){
   try{
      let user = await prisma.user.delete({
         where: {
            id: id
         }
      })

      console.info("Dados do usuário excluido: ", user)

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
      customerId: id
   }

   try{
      let ticket = await prisma.ticket.create({data: ticketData})

      console.info("Dados do ticket: ", ticket)

      if(ticket.id && ticket.description === description && ticket.title === title){
         return true
      }else{
         return false
      }

   } catch (error){
      console.error('ERRO NA CRIAÇÃO DO CHAMADO: ', error)
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
      console.error('ERRO NA BUSCA DE TICKETS DO USUÁRIO: ', error)
      return null
   }
}

async function getTicketByID(id){
   try{
      let ticketData = await prisma.ticket.findUnique({
         where: {
            id: id
         },
         include: {
            customer: true
         }
      })

      console.info("Dados do ticket: ", ticketData)

      return ticketData

   } catch (error){
      console.error("ERRO NA BUSCA DO TICKET POR ID: ", error)
      return null
   }
}

async function updateTicket(id, priority, channel, status){
   try{
      let ticket = await prisma.ticket.update({
         where: {
            id: id
         },
         data: {
            priority: priority,
            channel: channel,
            status: status
         }
      })

      console.info("Dados do ticket: ", ticket)

      if(ticket.id && ticket.priority === priority && ticket.channel === channel && ticket.status === status){
         return true
      }else{
         return false
      }
      
   } catch (error) {
      console.error('ERRO NA ATUALIZAÇÃO DO CHAMDO: ', error)
      return null
   }
}