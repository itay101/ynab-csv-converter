import type {User, Account} from "@prisma/client";

import {prisma} from "~/db.server";

export type {Account} from "@prisma/client";

export function getAccount({accountId, userId,}) {
    return prisma.account.findFirst({
        select: {id: true, accountId: true, accountIdentifier: true,  cardLastDigits: true, type: true, username: true, budgetId: true},
        where: {accountId, userId},
    });
}

export function getAccountListItems({userId}: { userId: User["id"] }) {
    return prisma.account.findMany({
        where: {userId},
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
                              }: Pick<Account, "id"> & { userId: User["id"] }) {
    return prisma.note.deleteMany({
        where: {id, userId},
    });
}
