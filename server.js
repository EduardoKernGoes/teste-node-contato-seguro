import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

const server = express()
const port = 3000

server.use(express.urlencoded({extended: true}))
server.use(express.json())

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

server.use(express.static(path.join(dirname, "public")))

server.get("/open-ticket.html", (req, res) =>{
   console.log('um teste foi feito')
   return res.status(201).sendFile(path.join(dirname, "public/pages/open-ticket.html"))
})

server.post("/login", async (req, res) => {
   const { user, password } = req.body;
   console.log('Dados recebidos do usuário: ', user, password);

   const userData = await verifyLogin(user, password)

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

server.listen(port, () => {
   console.log(`Server is running on: http://localhost:${port}`)
})

async function verifyLogin(user, password){
   try{
      const userData = await prisma.user.findFirst({
         where: {
            OR: [
               {email: user},
               {name: user}
            ]
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