import Fastify from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Temporary basic auth hook (you can expand this to use Supabase tokens)
fastify.addHook('preHandler', async (req, reply) => {
  // In a real production app, uncomment this to enforce token auth
  /*
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return reply.code(401).send({ error: 'Missing token' });

  if (supabase) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) return reply.code(401).send({ error: 'Invalid token' });
    req.user = data.user;
  }
  */
});

// --- Menu API ---
fastify.get('/api/menu', async (req, reply) => {
  const items = await prisma.menuItem.findMany();
  return items;
});

fastify.post('/api/menu', async (req, reply) => {
  const { name, category, price, imageUrl } = req.body;
  const item = await prisma.menuItem.create({
    data: { name, category, price, imageUrl }
  });
  return item;
});

// --- Tables API ---
fastify.get('/api/tables', async (req, reply) => {
  const tables = await prisma.table.findMany({ include: { order: { include: { items: { include: { menuItem: true } } } } } });
  return tables;
});

fastify.put('/api/tables/:id', async (req, reply) => {
  const { id } = req.params;
  const { status, orderId } = req.body;
  
  const updateData = { status };
  if (orderId !== undefined) updateData.orderId = orderId;

  const table = await prisma.table.update({
    where: { id: Number(id) },
    data: updateData,
  });
  return table;
});

// --- Orders API ---
fastify.get('/api/orders', async (req, reply) => {
  const orders = await prisma.order.findMany({
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return orders;
});

fastify.post('/api/orders', async (req, reply) => {
  const { tableId, items } = req.body;

  const total = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        table: tableId ? { connect: { id: tableId } } : undefined,
        total: 0,
        status: 'Preparing',
        items: {
          create: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            addOns: i.addOns || {},
          })),
        },
      },
      include: { items: true },
    });

    const fullItems = await tx.orderItem.findMany({
      where: { orderId: order.id },
      include: { menuItem: true },
    });

    const computed = fullItems.reduce((sum, oi) => {
      const addOns = oi.addOns || {};
      const addOnPrice = ((addOns.roti || 0) * 15) + ((addOns.curry || 0) * 40);
      return sum + ((oi.menuItem.price + addOnPrice) * oi.quantity);
    }, 0);

    const totalWithTax = Math.round(computed * 1.05);

    await tx.order.update({
      where: { id: order.id },
      data: { total: totalWithTax },
    });

    if (tableId) {
      await tx.table.update({
        where: { id: tableId },
        data: { status: 'occupied', orderId: order.id }
      });
    }

    return totalWithTax;
  });

  return { message: 'Order placed', total };
});

fastify.put('/api/orders/:id', async (req, reply) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const order = await prisma.order.update({
    where: { id },
    data: { status, paidAt: status === 'Paid' ? new Date() : null }
  });

  if (status === 'Paid' && order.tableId) {
    await prisma.table.update({
      where: { id: order.tableId },
      data: { status: 'available', orderId: null }
    });
  }
  
  return order;
});

// --- Grocery API ---
fastify.get('/api/grocery', async (req, reply) => {
  return await prisma.groceryItem.findMany();
});

fastify.post('/api/grocery', async (req, reply) => {
  const { name, quantity, unit } = req.body;
  return await prisma.groceryItem.create({ data: { name, quantity, unit } });
});

fastify.put('/api/grocery/:id', async (req, reply) => {
  const { id } = req.params;
  const { purchased } = req.body;
  return await prisma.groceryItem.update({
    where: { id: Number(id) },
    data: { purchased }
  });
});

export default async function handler(req, res) {
  await fastify.ready();
  fastify.server.emit('request', req, res);
}
