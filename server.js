import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const server = express()
const port = 3000

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

server.get("/", verifyLogin, (req, res) => {
   res.sendFile(path.join(dirname, "public/pages/open-ticket.html"))
})

server.use(express.static(path.join(dirname, "public")))

server.get("/open-ticket.html", (req, res) =>{
   console.log('um teste foi feito')
   return res.status(201).sendFile(path.join(dirname, "public/pages/open-ticket.html"))
})

server.post("/verifies-user-data", (req, res) => {
   console.log('Dados do usuário recebidos');
})

server.listen(port, () => {
   console.log(`Server is running on: http://localhost:${port}`)
})

function verifyLogin(req, res, next){
   const isUserLogged = false
   if(isUserLogged){
      next()
   }else{
      console.log("O usuário ... foi negado")
      res.redirect('/pages/login.html')
   }
}