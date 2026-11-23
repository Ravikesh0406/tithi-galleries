const http = require('http');

const get = (path) => new Promise((resolve, reject) => {
  http.get('http://localhost:8123' + path, (res) => {
    let body = '';
    res.on('data', (c) => body += c);
    res.on('end', () => resolve({ status: res.statusCode, body }));
  }).on('error', reject);
});

const post = (path, data) => new Promise((resolve, reject) => {
  const req = http.request({ host: 'localhost', port: 8123, path, method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
    let body = '';
    res.on('data', (c) => body += c);
    res.on('end', () => resolve({ status: res.statusCode, body }));
  });
  req.on('error', reject);
  req.end(JSON.stringify(data));
});

(async () => {
  const pages = ['/', '/index.html', '/pricing.html', '/store.html', '/portfolio.html', '/gallery.html?id=demo-wedding-2026', '/dashboard.html', '/css/style.css', '/js/app.js'];
  for (const p of pages) {
    try {
      const r = await get(p);
      console.log(r.status, p, r.status === 200 ? 'OK' : r.body.slice(0, 120));
    } catch (e) { console.log('FAIL', p, e.message); }
  }

  const g = await get('/api/galleries');
  const list = JSON.parse(g.body);
  console.log('galleries:', list.length, '| demo:', list.some(x => x.isDemo), '| demo photos:', (list.find(x => x.isDemo) || {}).photos?.length);

  const prod = await get('/api/products');
  const products = JSON.parse(prod.body);
  console.log('products:', products.length);

  const pf = await get('/api/portfolio');
  console.log('portfolio:', JSON.parse(pf.body).studioName || 'MISSING');

  if (products.length) {
    const o = await post('/api/orders', { productId: products[0].id, quantity: 2, buyerName: 'Smoke Test' });
    console.log('order:', o.status, o.status === 201 ? 'OK' : o.body);
  }

  const p2 = await post('/api/products', { name: 'Test Print', price: 199 });
  console.log('create product:', p2.status);
  if (p2.status === 201) {
    const pid = JSON.parse(p2.body).id;
    const del = await new Promise((resolve, reject) => {
      const req = http.request({ host: 'localhost', port: 8123, path: '/api/products/' + pid, method: 'DELETE' }, (res) => resolve(res.statusCode));
      req.on('error', reject);
      req.end();
    });
    console.log('delete product:', del);
  }
})();
