import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Categories
  const fiction = await prisma.category.create({
    data: { name: 'Fiction', slug: 'fiction' }
  })
  const scifi = await prisma.category.create({
    data: { name: 'Science Fiction', slug: 'sci-fi', parent_id: fiction.id }
  })
  const fantasy = await prisma.category.create({
    data: { name: 'Fantasy', slug: 'fantasy', parent_id: fiction.id }
  })
  const nonfiction = await prisma.category.create({
    data: { name: 'Non-Fiction', slug: 'non-fiction' }
  })
  const selfhelp = await prisma.category.create({
    data: { name: 'Self Help', slug: 'self-help', parent_id: nonfiction.id }
  })

  console.log('✅ Categories created')

  // Authors
  const andyWeir = await prisma.author.create({
    data: { name: 'Andy Weir', bio: 'American novelist known for The Martian.' }
  })
  const frankHerbert = await prisma.author.create({
    data: { name: 'Frank Herbert', bio: 'American science fiction author of Dune.' }
  })
  const tolkien = await prisma.author.create({
    data: { name: 'J.R.R. Tolkien', bio: 'English author of The Lord of the Rings.' }
  })
  const jkRowling = await prisma.author.create({
    data: { name: 'J.K. Rowling', bio: 'British author of the Harry Potter series.' }
  })
  const jamesClear = await prisma.author.create({
    data: { name: 'James Clear', bio: 'Author of Atomic Habits.' }
  })
  const brandonSanderson = await prisma.author.create({
    data: { name: 'Brandon Sanderson', bio: 'American author of epic fantasy novels.' }
  })

  console.log('✅ Authors created')

  // Books
  const books = [
    {
      title: 'Project Hail Mary',
      isbn: '978-0593135204',
      price: 18.99,
      discount_price: null,
      stock_quantity: 50,
      format: 'Hardcover',
      page_count: 496,
      publisher: 'Ballantine Books',
      cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg',
      category_id: scifi.id,
      authorId: andyWeir.id
    },
    {
      title: 'Dune',
      isbn: '978-0441013593',
      price: 35.00,
      discount_price: 28.00,
      stock_quantity: 30,
      format: 'Hardcover',
      page_count: 688,
      publisher: 'Ace Books',
      cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg',
      category_id: scifi.id,
      authorId: frankHerbert.id
    },
    {
      title: 'The Hobbit',
      isbn: '978-0547928227',
      price: 22.50,
      discount_price: null,
      stock_quantity: 45,
      format: 'Hardcover',
      page_count: 310,
      publisher: 'Houghton Mifflin',
      cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
      category_id: fantasy.id,
      authorId: tolkien.id
    },
    {
      title: 'Harry Potter and the Sorcerer\'s Stone',
      isbn: '978-0439708180',
      price: 19.99,
      discount_price: 14.99,
      stock_quantity: 60,
      format: 'Paperback',
      page_count: 309,
      publisher: 'Scholastic',
      cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg',
      category_id: fantasy.id,
      authorId: jkRowling.id
    },
    {
      title: 'Atomic Habits',
      isbn: '978-0735211292',
      price: 16.99,
      discount_price: null,
      stock_quantity: 80,
      format: 'Paperback',
      page_count: 320,
      publisher: 'Avery',
      cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
      category_id: selfhelp.id,
      authorId: jamesClear.id
    },
    {
      title: 'The Way of Kings',
      isbn: '978-0765326355',
      price: 24.99,
      discount_price: 19.99,
      stock_quantity: 25,
      format: 'Hardcover',
      page_count: 1007,
      publisher: 'Tor Books',
      cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780765326355-L.jpg',
      category_id: fantasy.id,
      authorId: brandonSanderson.id
    },
  ]

  for (const bookData of books) {
    const { authorId, ...data } = bookData
    const book = await prisma.book.create({ data })
    await prisma.bookAuthor.create({
      data: { book_id: book.id, author_id: authorId, role: 'author' }
    })
  }

  console.log('✅ Books created')
  console.log('🎉 Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())