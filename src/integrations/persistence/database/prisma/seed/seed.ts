import { Prisma, PrismaClient } from '../../../../../../generated/prisma';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 10; i++) {
    let posts: Prisma.PostCreateManyAuthorInput[] = [];

    const numberOfPosts = Math.floor(Math.random() * 101);

    const birthDate = faker.date.birthdate({
      min: 10,
      max: 40,
      mode: 'age',
    });

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const password = faker.internet.password();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    for (let j = 0; j < numberOfPosts; j++) {
      posts.push({
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
        deleted: faker.datatype.boolean({ probability: 0.9 }),
      });
    }

    await prisma.user.create({
      data: {
        email,
        password: bcrypt.hashSync(password, 10),
        profile: {
          create: {
            username: faker.internet.username({ firstName, lastName }),
            bio: faker.lorem.paragraph(),
            birthDate,
            posts: {
              create: posts,
            },
          },
        },
      },
    });
  }
  await prisma.user.create({
    data: {
      email: 'test@pinaculo.dev',
      password: bcrypt.hashSync('123456', 10),
      profile: {
        create: {
          username: 'test.user',
          bio: 'Usuário de teste',
          birthDate: new Date('1995-01-01'),
        },
      },
    },
  });

  console.log('Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
