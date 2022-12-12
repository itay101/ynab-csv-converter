import type {User, Note, Account} from "@prisma/client";

import {prisma} from "~/db.server";

export type {Note} from "@prisma/client";

export function getNote({
                            id,
                            userId,
                        }: Pick<Note, "id"> & {
    userId: User["id"];
}) {
    return prisma.note.findFirst({
        select: {id: true, body: true, title: true},
        where: {id, userId},
    });
}

export function getAccountListItems({userId}: { userId: User["id"] }) {
    return prisma.account.findMany({
        where: {userId},
        select: {id: true},
        orderBy: {updatedAt: "desc"},
    });
}

export function createAccount({
                                  accountId,
                                  accountIdentifier,
                                  cardLastDigits,
                                  password,
                                  type,
                                  username,
                                  budgetId,
                                  userId
                              }: Account) {
    return prisma.account.create({
        data: {
            accountId,
            accountIdentifier,
            cardLastDigits,
            password,
            type,
            username,
            budgetId,
            user: {
                connect: {
                    id: userId,
                },
            },
        },
    });
}

export function deleteAccount({
                                  id,
                                  userId,
                              }: Pick<Note, "id"> & { userId: User["id"] }) {
    return prisma.note.deleteMany({
        where: {id, userId},
    });
}
