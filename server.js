import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { classifyPriorityChannel } from './utils/classifyTickets';

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

server.post("/create-account", async (req, res) => {
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

server.post("/open-ticket", async (req, res) =>{
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

async function createTicket(userID, title, description, channel, priority){
   let ticketData = {
      title,
      description,
      channel,
      priority,
      status: "OPEN",
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