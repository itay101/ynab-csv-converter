import {PrismaClient} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
    const email = "rachel@remix.run";

    // cleanup the existing database
    await prisma.user.delete({where: {email}}).catch(() => {
        // no worries if it doesn't exist yet
    });

    const hashedPassword = await bcrypt.hash("racheliscool", 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: {
                create: {
                    hash: hashedPassword,
                },
            },
        },
    });

    await prisma.note.create({
        data: {
            title: "My first note",
            body: "Hello, world!",
            userId: user.id,
        },
    });

    await prisma.note.create({
        data: {
            title: "My second note",
            body: "Hello, world!",
            userId: user.id,
        },
    });

    await prisma.account.create({
        data:
            {
                accountId: "1234",
                accountIdentifier: "abcd",
                cardLastDigits: 1234,
                password: "1@3$%67",
                type: "poalim",
                username: "kuku",
                userId: user.id,
                budgetId: "e02acc98-693e-4311-99c7-7b1c89ac796e"
            }
    });

    console.log(`Database has been seeded. 🌱`);
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
