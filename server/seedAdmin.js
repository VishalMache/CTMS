const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'admin@cpms.edu'

    const existing = await prisma.user.findUnique({
        where: { email: adminEmail }
    })

    if (existing) {
        console.log(`✅ Admin account already exists: ${adminEmail}`)
        return
    }

    const hashedPassword = await bcrypt.hash('admin123', 10)

    await prisma.user.create({
        data: {
            email: adminEmail,
            password: hashedPassword,
            role: 'TPO_ADMIN',
        },
    })

    console.log(`🎉 Success! TPO Admin created.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
