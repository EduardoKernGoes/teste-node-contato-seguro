import {
    createUserService,
    getUsersService,
    getUserByIdService,
    updateUserService,
    deleteUserService
} from "../services/userService.js";

export async function createUserController(req, res) {
    try{
        const { user, email, password, repeat_password, role } = req.body

        if(!user || !email || !password || !repeat_password){
            return res.status(400).json({error: "O formulário não pode ter campos vazios"})
        }else if(password != repeat_password){
            return res.status(400).json({error: "Senhas não coincidem"})
        }else if(!email.includes('@')){
            return res.status(400).json({error: "E-mail inválido"})
        }else if(role && (role !== 'ADMIN' && role !== 'CLIENT')){
            return res.status(400).json({error: "Cargo inválido."})
        }

        console.info("Dados de criação do usuário: ", user, email, password, repeat_password, role)

        const userData = await createUserService(user, email, password, role)

        return res.status(201).json({
            message: "Usuário criado com sucesso!",
            user: userData
        })

    } catch (error) {
        if(error.code === 'P2002'){
            return res.status(400).json({error: "Este endereço de e-mail já existe."})
        }
        console.error("[UserController] Erro na criação do usuário: ", error)
        return res.status(500).json({error: "Erro interno no servidor"})
    }
}
export async function getUsersController(req , res) {
    try {
        const usersData = await getUsersService();

        return res.status(200).json({
            message: "Busca de usuários concluida com sucesso!",
            users: usersData
        })
    } catch (error) {
        console.error("[UserController] Erro na busca de usuários: ", error)
        return res.status(500).json({error: "Erro interno do servidor"})
    }
}

export async function getuserByIdController(req, res){
    try{
        const userID = parseInt(req.params.id)

        if(isNaN(userID)){
            return res.status(400).json({error: "ID inválido"})
        }

        console.log("Solicitação do usuário: ", userID)

        const userData = await getUserByIdService(userID)

        if(!userData){
            return res.status(404).json({error: "Usuário não encontrado"})
        }

        return res.status(200).json({
            message: "Usuário encontrado com sucesso!",
            user: userData
        })
    } catch (error) {
        console.error("[UserController] Erro na busca de usuário por ID: ", error)
        return res.status(500).json({error: "Erro interno do servidor"})
    }
} 

export async function updateUserController(req, res){
    try{
        const { user, email, password, role } = req.body
        const userID = parseInt(req.params.id)

        if(isNaN(userID)){
            return res.status(400).json({error: "ID inválido"})
        }else if(!email.includes('@')){
            return res.status(400).json({error: "Endereço de e-mail inválido"})
        }else if(role && (role !== 'ADMIN' && role !== 'CLIENT')){
            return res.status(400).json({error: "Cargo inválido"})
        }

        console.info("Dados de atualização do usuário: ", userID, user, email, password, role)

        const userData = await updateUserService(userID, user, email, password, role)

        return res.status(200).json({
            message: "Usuário alterado com sucesso!",
            user: userData
        })

    } catch (error){
        if(error.code === 'P2002'){
            return res.status(400).json({error: "Este endereço de e-mail já está em uso"})
        }
        console.error("[UserController] Erro na ataulização de usuário: ", error)
        return res.status(500).json({error: "Erro interno do servidor"})
    }
}

export async function deleteUserController(req, res){
    try{
        const userID = parseInt(req.params.id)

        if(isNaN(userID)){
            return res.status(400).json({error: "ID inválido"})
        }

        console.info("Solicitação de exclusão do usuário: ", userID)

        const userData = await deleteUserService(userID)

        console.info("Dados do usuário excluido: ", userData)

        return res.status(200).json({
            message: "Usuário excluido com sucesso!",
            user: userData
        })

    } catch (error) {
        if(error.code === 'P2025'){
            return res.status(400).json({error: "Usuário não encontrado"})
        }
        console.error("[UserController] Erro na exclusão do usuário: ", error)
        return res.status(500).json({error: "Erro interno do servidor"})
    }
}