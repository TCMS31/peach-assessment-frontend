#!/usr/bin/env node
/* eslint-env node */
/**
 * Zero-dependency stand-in for peach-take-home-back-end.
 *
 * It speaks the same contract as the Rails API (same routes, same serializer
 * shape, `decimal` amounts as strings) so the app can be run, demoed and
 * screenshotted without Ruby and Postgres. The data in scripts/seed.json is the
 * backend's own seed set: the categories and merchants from db/seeds.rb and the
 * ten rows of transactions.csv.
 *
 *   node scripts/mock-api.js --port 3000
 */
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const PORT = Number(process.env.PORT ?? process.argv[process.argv.indexOf('--port') + 1] ?? 3000);

const seed = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf8'));
const state = {
  categories: seed.categories,
  merchants: seed.merchants,
  transactions: seed.transactions.map((tx) => ({ ...tx })),
};

/** Mirrors TransactionSerializer: id, name, date, amount, reviewed + relations. */
function serializeTransaction(tx) {
  return {
    id: tx.id,
    name: tx.name,
    date: tx.date,
    amount: tx.amount,
    reviewed: tx.reviewed,
    merchant: state.merchants.find((m) => m.id === tx.merchant_id) ?? null,
    category: state.categories.find((c) => c.id === tx.category_id) ?? null,
  };
}

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw === '' ? {} : JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'OPTIONS') {
    return send(res, 204, {});
  }

  if (req.method === 'GET' && url.pathname === '/categories') {
    return send(res, 200, state.categories);
  }

  if (req.method === 'GET' && url.pathname === '/merchants') {
    return send(res, 200, state.merchants);
  }

  if (req.method === 'GET' && url.pathname === '/transactions') {
    let rows = state.transactions;
    if (url.searchParams.has('pending_review')) {
      rows = rows.filter((tx) => !tx.reviewed);
    } else if (url.searchParams.has('reviewed')) {
      rows = rows.filter((tx) => tx.reviewed);
    }
    return send(res, 200, rows.map(serializeTransaction));
  }

  const member = url.pathname.match(/^\/transactions\/(\d+)$/);
  if (member) {
    const tx = state.transactions.find((row) => row.id === Number(member[1]));
    if (tx === undefined) {
      return send(res, 404, { message: ['Transaction not found'] });
    }
    if (req.method === 'GET') {
      return send(res, 200, serializeTransaction(tx));
    }
    if (req.method === 'PATCH') {
      const body = await readBody(req);
      const changes = body.transaction ?? {};
      if (typeof changes.reviewed === 'boolean') {
        tx.reviewed = changes.reviewed;
      }
      if (changes.category_attributes?.name) {
        const category = state.categories.find((c) => c.name === changes.category_attributes.name);
        if (category === undefined) {
          return send(res, 422, { message: ['Category is not valid'] });
        }
        tx.category_id = category.id;
      }
      return send(res, 200, serializeTransaction(tx));
    }
  }

  return send(res, 404, { message: ['Not found'] });
});

server.listen(PORT, () => {
  process.stdout.write(`mock Peach API listening on http://localhost:${PORT}\n`);
});
