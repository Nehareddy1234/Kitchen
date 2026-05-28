// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// // Helper to collect request body as JSON
// function getJsonBody(req) {
//   return new Promise((resolve, reject) => {
//     let data = '';
//     req.on('data', chunk => {
//       data += chunk;
//     });
//     req.on('end', () => {
//       if (!data) return resolve({});
//       try {
//         resolve(JSON.parse(data));
//       } catch (e) {
//         reject(e);
//       }
//     });
//     req.on('error', err => reject(err));
//   });
// }

// /**
//  * Vercel serverless function entry point.
//  * Handles CRUD for /api/menu, /api/tables, /api/orders, /api/grocery.
//  */
// export default async function handler(req, res) {
//   const url = req.url || '';
//   const method = req.method;

//   // Normalize path (remove query string)
//   const path = url.split('?')[0];

//   // ---------- MENU ----------
//   if (path.startsWith('/api/menu')) {
//     // /api/menu or /api/menu/:id
//     const idPart = path.replace('/api/menu', '').replace(/^\//, '');
//     const id = idPart ? parseInt(idPart) : null;
//     if (method === 'GET') {
//       if (id) {
//         const item = await prisma.menuItem.findUnique({ where: { id } });
//         res.writeHead(item ? 200 : 404, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify(item || { error: 'Not found' }));
//       } else {
//         const items = await prisma.menuItem.findMany({
//           where: {
//             enabled: true
//           }
//         });
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify(items));
//       }
//       return;
//     }
//     if (method === 'POST') {
//       const body = await getJsonBody(req);
//       const created = await prisma.menuItem.create({ data: body });
//       res.writeHead(201, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify(created));
//       return;
//     }
//     if (method === 'PUT' && id) {
//       const body = await getJsonBody(req);
//       const updated = await prisma.menuItem.update({ where: { id }, data: body });
//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify(updated));
//       return;
//     }
//     if (method === 'DELETE' && id) {
//       await prisma.menuItem.update({
//         where: { id },
//         data: {
//           enabled: false
//         }
//       });
//       res.writeHead(204);
//       res.end();
//       return;
//     }
//     res.writeHead(405);
//     return res.end();
//   }

//   // ---------- TABLES ----------
//   if (path.startsWith('/api/tables')) {
//     const idPart = path.replace('/api/tables', '').replace(/^\//, '');
//     const id = idPart ? parseInt(idPart) : null;
//     if (method === 'GET') {
//       if (id) {
//         const tbl = await prisma.table.findUnique({ where: { id }, include: { orders: true } });
//         res.writeHead(tbl ? 200 : 404, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify(tbl || { error: 'Not found' }));
//       } else {
//         const tables = await prisma.table.findMany({ include: { orders: true } });
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify(tables));
//       }
//       return;
//     }
//     if (method === 'PUT' && id) {
//       const body = await getJsonBody(req);
//       const updated = await prisma.table.update({ where: { id }, data: body });
//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify(updated));
//       return;
//     }
//     res.writeHead(405);
//     return res.end();
//   }

//   // ---------- GROCERY ----------
//   if (path.startsWith('/api/grocery')) {
//     const idPart = path.replace('/api/grocery', '').replace(/^\//, '');
//     const id = idPart ? parseInt(idPart) : null;
//     if (method === 'GET') {
//       if (id) {
//         const item = await prisma.groceryItem.findUnique({ where: { id } });
//         res.writeHead(item ? 200 : 404, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify(item || { error: 'Not found' }));
//       } else {
//         const items = await prisma.groceryItem.findMany();
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify(items));
//       }
//       return;
//     }
//     if (method === 'POST') {
//       const body = await getJsonBody(req);
//       const created = await prisma.groceryItem.create({ data: body });
//       res.writeHead(201, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify(created));
//       return;
//     }
//     if (method === 'PUT' && id) {
//       const body = await getJsonBody(req);
//       const updated = await prisma.groceryItem.update({ where: { id }, data: body });
//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify(updated));
//       return;
//     }
//     if (method === 'DELETE' && id) {
//       await prisma.groceryItem.delete({ where: { id } });
//       res.writeHead(204);
//       res.end();
//       return;
//     }
//     res.writeHead(405);
//     return res.end();
//   }

//   // ---------- ORDERS ----------
//   if (path.startsWith('/api/orders')) {
//     const idPart = path.replace('/api/orders', '').replace(/^\//, '');
//     const id = idPart ? idPart : null; // id may be uuid string
//     if (method === 'GET') {
//       if (id) {
//         const order = await prisma.order.findUnique({ where: { id } });
//         res.writeHead(order ? 200 : 404, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify(order || { error: 'Not found' }));
//       } else {
//         const orders = await prisma.order.findMany();
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify(orders));
//       }
//       return;
//     }
//     if (method === 'POST') {
//       const body = await getJsonBody(req);
//       const created = await prisma.order.create({ data: body });
//       res.writeHead(201, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify(created));
//       return;
//     }
//     if (method === 'PUT' && id) {
//       const body = await getJsonBody(req);
//       const updated = await prisma.order.update({ where: { id }, data: body });
//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify(updated));
//       return;
//     }
//     if (method === 'DELETE' && id) {
//       await prisma.order.delete({ where: { id } });
//       res.writeHead(204);
//       res.end();
//       return;
//     }
//     res.writeHead(405);
//     return res.end();
//   }

//   // If none matched
//   res.writeHead(404, { 'Content-Type': 'application/json' });
//   res.end(JSON.stringify({ error: 'Endpoint not found' }));
// };





import { PrismaClient } from '@prisma/client';

/**
 * Prevent multiple Prisma instances in Vercel serverless.
 * Always store on globalThis so warm invocations reuse the
 * same client and don't exhaust the PgBouncer connection pool.
 */
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Always cache — even in production (Vercel warm instances)
globalForPrisma.prisma = prisma;

/**
 * Helper to parse JSON body
 */
function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      if (!data) return resolve({});

      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });

    req.on('error', err => reject(err));
  });
}

/**
 * Helper response function
 */
function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
  });

  res.end(JSON.stringify(data));
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  try {
    const url = req.url || '';
    const method = req.method;
    const path = url.split('?')[0];

    /**
     * =========================================================
     * MENU
     * =========================================================
     */
    if (path.startsWith('/api/menu')) {
      const idPart = path
        .replace('/api/menu', '')
        .replace(/^\//, '');

      const id = idPart ? parseInt(idPart) : null;

      /**
       * GET MENU
       */
      if (method === 'GET') {
        if (id) {
          const item = await prisma.menuItem.findUnique({
            where: { id },
          });

          if (!item) {
            return send(res, 404, {
              error: 'Menu item not found',
            });
          }

          return send(res, 200, item);
        }

        const items = await prisma.menuItem.findMany({
          where: {
            enabled: true,
          },
          orderBy: {
            id: 'asc',
          },
        });

        return send(res, 200, items);
      }

      /**
       * CREATE MENU ITEM
       */
      if (method === 'POST') {
        const body = await getJsonBody(req);

        const created = await prisma.menuItem.create({
          data: {
            name: body.name,
            category: body.category,
            price: body.price,
            image: body.image || null,
            enabled: true,
          },
        });

        return send(res, 201, created);
      }

      /**
       * UPDATE MENU ITEM
       */
      if (method === 'PUT' && id) {
        const body = await getJsonBody(req);

        const updated = await prisma.menuItem.update({
          where: { id },
          data: {
            name: body.name,
            category: body.category,
            price: body.price,
            image: body.image,
            enabled: body.enabled,
          },
        });

        return send(res, 200, updated);
      }

      /**
       * SOFT DELETE MENU ITEM
       */
      if (method === 'DELETE' && id) {
        const deleted = await prisma.menuItem.update({
          where: { id },
          data: {
            enabled: false,
          },
        });

        return send(res, 200, deleted);
      }

      return send(res, 405, {
        error: 'Method not allowed',
      });
    }

    /**
     * =========================================================
     * TABLES
     * =========================================================
     */
    if (path.startsWith('/api/tables')) {
      const idPart = path
        .replace('/api/tables', '')
        .replace(/^\//, '');

      const id = idPart ? parseInt(idPart) : null;

      if (method === 'GET') {
        if (id) {
          const table = await prisma.table.findUnique({
            where: { id },
            include: {
              orders: true,
            },
          });

          if (!table) {
            return send(res, 404, {
              error: 'Table not found',
            });
          }

          return send(res, 200, table);
        }

        const tables = await prisma.table.findMany({
          include: {
            orders: true,
          },
          orderBy: {
            id: 'asc',
          },
        });

        return send(res, 200, tables);
      }

      if (method === 'PUT' && id) {
        const body = await getJsonBody(req);

        const updated = await prisma.table.update({
          where: { id },
          data: body,
        });

        return send(res, 200, updated);
      }

      return send(res, 405, {
        error: 'Method not allowed',
      });
    }

    /**
     * =========================================================
     * GROCERY
     * =========================================================
     */
    if (path.startsWith('/api/grocery')) {
      const idPart = path
        .replace('/api/grocery', '')
        .replace(/^\//, '');

      const id = idPart ? parseInt(idPart) : null;

      if (method === 'GET') {
        if (id) {
          const item = await prisma.groceryItem.findUnique({
            where: { id },
          });

          if (!item) {
            return send(res, 404, {
              error: 'Grocery item not found',
            });
          }

          return send(res, 200, item);
        }

        const items = await prisma.groceryItem.findMany({
          orderBy: {
            id: 'asc',
          },
        });

        return send(res, 200, items);
      }

      if (method === 'POST') {
        const body = await getJsonBody(req);

        const created = await prisma.groceryItem.create({
          data: body,
        });

        return send(res, 201, created);
      }

      if (method === 'PUT' && id) {
        const body = await getJsonBody(req);

        const updated = await prisma.groceryItem.update({
          where: { id },
          data: body,
        });

        return send(res, 200, updated);
      }

      if (method === 'DELETE' && id) {
        await prisma.groceryItem.delete({
          where: { id },
        });

        return send(res, 200, {
          success: true,
        });
      }

      return send(res, 405, {
        error: 'Method not allowed',
      });
    }

    /**
     * =========================================================
     * ORDERS
     * =========================================================
     */
    if (path.startsWith('/api/orders')) {
      const idPart = path
        .replace('/api/orders', '')
        .replace(/^\//, '');

      const id = idPart || null;

      if (method === 'GET') {
        if (id) {
          const order = await prisma.order.findUnique({
            where: { id },
            include: {
              items: true,
              table: true,
            },
          });

          if (!order) {
            return send(res, 404, {
              error: 'Order not found',
            });
          }

          return send(res, 200, order);
        }

        const orders = await prisma.order.findMany({
          include: {
            items: true,
            table: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return send(res, 200, orders);
      }

      if (method === 'POST') {
        const body = await getJsonBody(req);

        const created = await prisma.order.create({
          data: body,
        });

        return send(res, 201, created);
      }

      if (method === 'PUT' && id) {
        const body = await getJsonBody(req);

        const updated = await prisma.order.update({
          where: { id },
          data: body,
        });

        return send(res, 200, updated);
      }

      if (method === 'DELETE' && id) {
        await prisma.order.delete({
          where: { id },
        });

        return send(res, 200, {
          success: true,
        });
      }

      return send(res, 405, {
        error: 'Method not allowed',
      });
    }

    /**
     * =========================================================
     * 404
     * =========================================================
     */
    return send(res, 404, {
      error: 'Endpoint not found',
    });

  } catch (error) {
    console.error(error);

    return send(res, 500, {
      error: 'Internal server error',
      details: error.message,
    });
  } finally {
    // Release the connection back to PgBouncer after every request.
    // This is safe because the global singleton will reconnect on the
    // next invocation without creating a new PrismaClient instance.
    await prisma.$disconnect();
  }
}