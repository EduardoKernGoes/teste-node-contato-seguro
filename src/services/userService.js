import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function createUserService(name, email, password) {
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password
        }
    });

    return user;
}

export async function getUsersService(){
    const users = await prisma.user.findMany()

    return users
}

export async function getUserByIdService(id){
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    })

    return user
}

export async function updateUserService(id, name, email, password){
    const user = await prisma.user.update({
        where: {
            id
        },
        data: {
            name,
            email,
            password
        }
    });

    return user;
}

export async function deleteUserService(id){
    const user = await prisma.user.delete({
        where:{
            id
        }
    })

    return user
}