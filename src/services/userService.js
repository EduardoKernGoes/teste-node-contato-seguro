import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function createUserService(name, email, password, role) {
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password,
            role
        }
    });

    return user;
}

export async function getUsersService(){
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        }
    })

    return users
}

export async function getUserByIdService(id){
    const user = await prisma.user.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        }
    })

    return user
}

export async function updateUserService(id, name, email, password, role){
    const user = await prisma.user.update({
        where: {
            id
        },
        data: {
            name,
            email,
            password,
            role
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