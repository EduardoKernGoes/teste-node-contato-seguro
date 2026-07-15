import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function createUserService(name: string, email: string, password: string, role: string) {
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

export async function getUserByIdService(id: number){
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

export async function updateUserService(id: number, name: string, email: string, password: string, role: string){
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

export async function deleteUserService(id: number){
    const user = await prisma.user.delete({
        where:{
            id
        }
    })

    return user
}