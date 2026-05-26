import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Categories (upsert to avoid duplicates)
  const fiction = await prisma.category.upsert({
    where: { slug: 'fiction' },
    update: {},
    create: { name: 'Fiction', slug: 'fiction' }
  })
  const scifi = await prisma.category.upsert({
    where: { slug: 'sci-fi' },
    update: {},
    create: { name: 'Science Fiction', slug: 'sci-fi', parent_id: fiction.id }
  })
  const fantasy = await prisma.category.upsert({
    where: { slug: 'fantasy' },
    update: {},
    create: { name: 'Fantasy', slug: 'fantasy', parent_id: fiction.id }
  })
  const nonfiction = await prisma.category.upsert({
    where: { slug: 'non-fiction' },
    update: {},
    create: { name: 'Non-Fiction', slug: 'non-fiction' }
  })
  const selfhelp = await prisma.category.upsert({
    where: { slug: 'self-help' },
    update: {},
    create: { name: 'Self Help', slug: 'self-help', parent_id: nonfiction.id }
  })

  console.log('✅ Categories ready')

  // Authors (upsert by name)
  const andyWeir = await prisma.author.create({ data: { name: 'Andy Weir', bio: 'American novelist known for The Martian.' } }).catch(() => prisma.author.findFirst({ where: { name: 'Andy Weir' } })) as any
  const frankHerbert = await prisma.author.create({ data: { name: 'Frank Herbert', bio: 'American science fiction author of Dune.' } }).catch(() => prisma.author.findFirst({ where: { name: 'Frank Herbert' } })) as any
  const tolkien = await prisma.author.create({ data: { name: 'J.R.R. Tolkien', bio: 'English author of The Lord of the Rings.' } }).catch(() => prisma.author.findFirst({ where: { name: 'J.R.R. Tolkien' } })) as any
  const jkRowling = await prisma.author.create({ data: { name: 'J.K. Rowling', bio: 'British author of the Harry Potter series.' } }).catch(() => prisma.author.findFirst({ where: { name: 'J.K. Rowling' } })) as any
  const jamesClear = await prisma.author.create({ data: { name: 'James Clear', bio: 'Author of Atomic Habits.' } }).catch(() => prisma.author.findFirst({ where: { name: 'James Clear' } })) as any
  const brandonSanderson = await prisma.author.create({ data: { name: 'Brandon Sanderson', bio: 'American author of epic fantasy novels.' } }).catch(() => prisma.author.findFirst({ where: { name: 'Brandon Sanderson' } })) as any
  const georgeRR = await prisma.author.create({ data: { name: 'George R.R. Martin', bio: 'American novelist, author of A Song of Ice and Fire.' } }).catch(() => prisma.author.findFirst({ where: { name: 'George R.R. Martin' } })) as any
  const stephenKing = await prisma.author.create({ data: { name: 'Stephen King', bio: 'American author of horror and suspense novels.' } }).catch(() => prisma.author.findFirst({ where: { name: 'Stephen King' } })) as any
  const yuvalHarari = await prisma.author.create({ data: { name: 'Yuval Noah Harari', bio: 'Israeli historian and author of Sapiens.' } }).catch(() => prisma.author.findFirst({ where: { name: 'Yuval Noah Harari' } })) as any
  const pauloCoelho = await prisma.author.create({ data: { name: 'Paulo Coelho', bio: 'Brazilian lyricist and novelist.' } }).catch(() => prisma.author.findFirst({ where: { name: 'Paulo Coelho' } })) as any
  const eckhart = await prisma.author.create({ data: { name: 'Eckhart Tolle', bio: 'German-born spiritual teacher and author.' } }).catch(() => prisma.author.findFirst({ where: { name: 'Eckhart Tolle' } })) as any
  const markManson = await prisma.author.create({ data: { name: 'Mark Manson', bio: 'American author and blogger.' } }).catch(() => prisma.author.findFirst({ where: { name: 'Mark Manson' } })) as any
  const orsonCard = await prisma.author.create({ data: { name: 'Orson Scott Card', bio: "American author of Ender's Game." } }).catch(() => prisma.author.findFirst({ where: { name: 'Orson Scott Card' } })) as any
  const neilGaiman = await prisma.author.create({ data: { name: 'Neil Gaiman', bio: 'English author of American Gods.' } }).catch(() => prisma.author.findFirst({ where: { name: 'Neil Gaiman' } })) as any
  const malcolmGladwell = await prisma.author.create({ data: { name: 'Malcolm Gladwell', bio: 'Canadian journalist and author of Outliers.' } }).catch(() => prisma.author.findFirst({ where: { name: 'Malcolm Gladwell' } })) as any
  const robinSharma = await prisma.author.create({ data: { name: 'Robin Sharma', bio: 'Canadian author of The Monk Who Sold His Ferrari.' } }).catch(() => prisma.author.findFirst({ where: { name: 'Robin Sharma' } })) as any
  const georgeOrwell = await prisma.author.create({ data: { name: 'George Orwell', bio: 'English novelist, author of 1984.' } }).catch(() => prisma.author.findFirst({ where: { name: 'George Orwell' } })) as any

  console.log('✅ Authors ready')

  const books = [
    // Original 6
    { title: 'Project Hail Mary', isbn: '978-0593135204', price: 18.99, discount_price: null, stock_quantity: 50, format: 'Hardcover', page_count: 496, publisher: 'Ballantine Books', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg', category_id: scifi.id, authorId: andyWeir.id },
    { title: 'Dune', isbn: '978-0441013593', price: 35.00, discount_price: 28.00, stock_quantity: 30, format: 'Hardcover', page_count: 688, publisher: 'Ace Books', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg', category_id: scifi.id, authorId: frankHerbert.id },
    { title: 'The Hobbit', isbn: '978-0547928227', price: 22.50, discount_price: null, stock_quantity: 45, format: 'Hardcover', page_count: 310, publisher: 'Houghton Mifflin', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg', category_id: fantasy.id, authorId: tolkien.id },
    { title: "Harry Potter and the Sorcerer's Stone", isbn: '978-0439708180', price: 19.99, discount_price: 14.99, stock_quantity: 60, format: 'Paperback', page_count: 309, publisher: 'Scholastic', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg', category_id: fantasy.id, authorId: jkRowling.id },
    { title: 'Atomic Habits', isbn: '978-0735211292', price: 16.99, discount_price: null, stock_quantity: 80, format: 'Paperback', page_count: 320, publisher: 'Avery', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', category_id: selfhelp.id, authorId: jamesClear.id },
    { title: 'The Way of Kings', isbn: '978-0765326355', price: 24.99, discount_price: 19.99, stock_quantity: 25, format: 'Hardcover', page_count: 1007, publisher: 'Tor Books', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780765326355-L.jpg', category_id: fantasy.id, authorId: brandonSanderson.id },
    // New books
    { title: "Ender's Game", isbn: '978-0812550702', price: 14.99, discount_price: 11.99, stock_quantity: 40, format: 'Paperback', page_count: 352, publisher: 'Tor Books', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780812550702-L.jpg', category_id: scifi.id, authorId: orsonCard.id },
    { title: '1984', isbn: '978-0451524935', price: 12.99, discount_price: null, stock_quantity: 60, format: 'Paperback', page_count: 328, publisher: 'Signet Classic', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', category_id: scifi.id, authorId: georgeOrwell.id },
    { title: 'A Game of Thrones', isbn: '978-0553573404', price: 28.99, discount_price: 22.99, stock_quantity: 30, format: 'Hardcover', page_count: 694, publisher: 'Bantam Books', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780553573404-L.jpg', category_id: fantasy.id, authorId: georgeRR.id },
    { title: 'American Gods', isbn: '978-0062572110', price: 17.99, discount_price: null, stock_quantity: 25, format: 'Paperback', page_count: 465, publisher: 'William Morrow', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780062572110-L.jpg', category_id: fantasy.id, authorId: neilGaiman.id },
    { title: 'The Fellowship of the Ring', isbn: '978-0618346257', price: 24.99, discount_price: 19.99, stock_quantity: 40, format: 'Hardcover', page_count: 479, publisher: 'Houghton Mifflin', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780618346257-L.jpg', category_id: fantasy.id, authorId: tolkien.id },
    { title: 'The Shining', isbn: '978-0307743657', price: 15.99, discount_price: 12.99, stock_quantity: 30, format: 'Paperback', page_count: 447, publisher: 'Anchor Books', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780307743657-L.jpg', category_id: fiction.id, authorId: stephenKing.id },
    { title: 'The Alchemist', isbn: '978-0062315007', price: 14.99, discount_price: null, stock_quantity: 55, format: 'Paperback', page_count: 197, publisher: 'HarperOne', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg', category_id: fiction.id, authorId: pauloCoelho.id },
    { title: 'It', isbn: '978-1501142970', price: 19.99, discount_price: 15.99, stock_quantity: 20, format: 'Paperback', page_count: 1138, publisher: 'Scribner', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9781501142970-L.jpg', category_id: fiction.id, authorId: stephenKing.id },
    { title: 'Sapiens', isbn: '978-0062316097', price: 22.99, discount_price: 17.99, stock_quantity: 45, format: 'Hardcover', page_count: 443, publisher: 'Harper', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg', category_id: nonfiction.id, authorId: yuvalHarari.id },
    { title: 'Outliers', isbn: '978-0316017930', price: 17.99, discount_price: null, stock_quantity: 35, format: 'Paperback', page_count: 309, publisher: 'Little Brown', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780316017930-L.jpg', category_id: nonfiction.id, authorId: malcolmGladwell.id },
    { title: 'The Power of Now', isbn: '978-1577314806', price: 15.99, discount_price: 12.99, stock_quantity: 50, format: 'Paperback', page_count: 236, publisher: 'New World Library', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9781577314806-L.jpg', category_id: selfhelp.id, authorId: eckhart.id },
    { title: 'The Subtle Art of Not Giving a F*ck', isbn: '978-0062457714', price: 16.99, discount_price: 13.99, stock_quantity: 60, format: 'Paperback', page_count: 224, publisher: 'HarperOne', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780062457714-L.jpg', category_id: selfhelp.id, authorId: markManson.id },
    { title: 'The Monk Who Sold His Ferrari', isbn: '978-0062515675', price: 14.99, discount_price: null, stock_quantity: 40, format: 'Paperback', page_count: 198, publisher: 'HarperOne', cover_image_url: 'https://covers.openlibrary.org/b/isbn/9780062515675-L.jpg', category_id: selfhelp.id, authorId: robinSharma.id },
  ]

  for (const bookData of books) {
    const { authorId, ...data } = bookData
    try {
      const book = await prisma.book.create({ data })
      await prisma.bookAuthor.create({
        data: { book_id: book.id, author_id: authorId, role: 'author' }
      })
      console.log(`✅ Added: ${book.title}`)
    } catch (e: any) {
      if (e.code === 'P2002') {
        console.log(`⚠️  Skipped (already exists): ${bookData.title}`)
      } else {
        throw e
      }
    }
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())