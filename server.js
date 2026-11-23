const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8123;
const ROOT = __dirname;
const UPLOADS_DIR = path.join(ROOT, 'uploads');
const DATA_FILE = path.join(ROOT, 'data.json');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    console.error('Failed to read data.json', e);
  }
  return { galleries: [], products: [], orders: [], portfolio: null };
}
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
function uid() {
  return crypto.randomBytes(8).toString('hex');
}

/* ---------- Seed: a public example gallery + demo store products ---------- */
function seedIfNeeded() {
  const data = loadData();
  data.galleries = data.galleries || [];
  data.products = data.products || [];
  data.orders = data.orders || [];

  if (!data.galleries.some(g => g.isDemo)) {
    const u = (n) => `https://images.unsplash.com/${n}?auto=format&fit=crop&w=900&q=80`;
    data.galleries.push({
      id: 'demo-wedding-2026',
      name: 'Aditi & Rohan — Wedding',
      eventDate: '2026-02-14',
      description: 'Jaipur · Sample gallery · See how guests experience your photos',
      isDemo: true,
      createdAt: new Date().toISOString(),
      photos: [
        { id: uid(), src: u('photo-1519741497674-611481863552'), caption: 'The couple', createdAt: new Date().toISOString(), source: 'seed' },
        { id: uid(), src: u('photo-1511285560929-80b456fea0bc'), caption: 'Wedding ceremony', createdAt: new Date().toISOString(), source: 'seed' },
        { id: uid(), src: u('photo-1465495976277-4387d4b0b4c6'), caption: 'Rings and vows', createdAt: new Date().toISOString(), source: 'seed' },
        { id: uid(), src: u('photo-1519225421980-715cb0215aed'), caption: 'First dance', createdAt: new Date().toISOString(), source: 'seed' },
        { id: uid(), src: u('photo-1470229722913-7ea0d4d0e2e0'), caption: 'Guests celebrating', createdAt: new Date().toISOString(), source: 'seed' },
        { id: uid(), src: u('photo-1522673607200-164d1b6ce486'), caption: 'Family portraits', createdAt: new Date().toISOString(), source: 'seed' },
        { id: uid(), src: u('photo-1583939003579-730e3918a45a'), caption: 'Mehendi details', createdAt: new Date().toISOString(), source: 'seed' },
        { id: uid(), src: u('photo-1606216794074-735e91aa2c92'), caption: 'Sangeet night', createdAt: new Date().toISOString(), source: 'seed' },
        { id: uid(), src: u('photo-1591604466107-ec97de577aff'), caption: 'Candid laughter', createdAt: new Date().toISOString(), source: 'seed' },
        { id: uid(), src: u('photo-1507504031003-b417219a0fde'), caption: 'Decor and lights', createdAt: new Date().toISOString(), source: 'seed' },
        { id: uid(), src: u('photo-1464366400600-7168b8af9bc3'), caption: 'Group photo', createdAt: new Date().toISOString(), source: 'seed' },
        { id: uid(), src: u('photo-1537633552985-df8429e8048b'), caption: 'Reception toast', createdAt: new Date().toISOString(), source: 'seed' },
      ]
    });
  }

  if (!data.products.length) {
    const demoGid = 'demo-wedding-2026';
    data.products = [
      { id: uid(), galleryId: demoGid, name: 'Digital Download (Full Res)', price: 499, description: 'High-resolution digital copies of your favourite photos.', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80', stock: 'unlimited' },
      { id: uid(), galleryId: demoGid, name: '4×6 Premium Prints (set of 10)', price: 899, description: 'Matte lab-quality prints, delivered to your door.', image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=600&q=80', stock: 'unlimited' },
      { id: uid(), galleryId: demoGid, name: 'Hardcover Photo Album (30 pages)', price: 3499, description: 'Layflat hardcover album designed from your gallery.', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80', stock: 'made to order' },
      { id: uid(), galleryId: demoGid, name: 'Framed Canvas (12×18 in)', price: 2499, description: 'Gallery-wrapped canvas, ready to hang.', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=600&q=80', stock: 'limited' },
    ];
  }

  if (!data.portfolio) {
    data.portfolio = {
      studioName: 'Rohit Studios',
      tagline: 'Capturing timeless Indian wedding stories & modern couples',
      city: 'Jaipur · Udaipur · Destination',
      email: 'hello@example.com',
      phone: '+91 98765 43210',
      about: 'We are a wedding photography studio with 10+ years of experience, covering weddings, receptions and destination events across India.',
      cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
      stats: [
        { value: '350+', label: 'Weddings' },
        { value: '10+', label: 'Years' },
        { value: '4.9★', label: 'Rating' },
        { value: '100%', label: 'On-time delivery' }
      ]
    };
  }

  saveData(data);
}
seedIfNeeded();

/* ---------- Uploads ---------- */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${uid()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype || '')) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(ROOT, { extensions: ['html'] }));

/* ---------- Galleries ---------- */
app.get('/api/galleries', (_req, res) => {
  const data = loadData();
  res.json(data.galleries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.post('/api/galleries', (req, res) => {
  const { name, eventDate, description } = req.body || {};
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Gallery name is required' });
  const data = loadData();
  const gallery = {
    id: uid(),
    name: String(name).trim(),
    eventDate: eventDate || null,
    description: description ? String(description).trim() : '',
    createdAt: new Date().toISOString(),
    photos: []
  };
  data.galleries.push(gallery);
  saveData(data);
  res.status(201).json(gallery);
});

app.get('/api/galleries/:id', (req, res) => {
  const data = loadData();
  const g = data.galleries.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: 'Gallery not found' });
  res.json(g);
});

app.post('/api/galleries/:id/photos', upload.single('photo'), (req, res) => {
  const data = loadData();
  const g = data.galleries.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: 'Gallery not found' });

  let photo = null;
  if (req.file) {
    photo = {
      id: uid(),
      src: `/uploads/${req.file.filename}`,
      caption: req.body.caption ? String(req.body.caption).trim() : '',
      createdAt: new Date().toISOString(),
      source: 'upload'
    };
  } else if (req.body && req.body.url) {
    const url = String(req.body.url).trim();
    if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'Photo URL must start with http:// or https://' });
    photo = {
      id: uid(),
      src: url,
      caption: req.body.caption ? String(req.body.caption).trim() : '',
      createdAt: new Date().toISOString(),
      source: 'url'
    };
  } else {
    return res.status(400).json({ error: 'Provide a photo file or url' });
  }

  g.photos = g.photos || [];
  g.photos.push(photo);
  saveData(data);
  res.status(201).json({ gallery: g, photo });
});

app.get('/api/galleries/:id/photos', (req, res) => {
  const data = loadData();
  const g = data.galleries.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: 'Gallery not found' });
  res.json(g.photos || []);
});

app.delete('/api/galleries/:id', (req, res) => {
  const data = loadData();
  const i = data.galleries.findIndex(x => x.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Gallery not found' });
  const [removed] = data.galleries.splice(i, 1);
  data.products = (data.products || []).filter(p => p.galleryId !== removed.id);
  saveData(data);
  res.json({ ok: true });
});

/* ---------- Store products ---------- */
app.get('/api/products', (req, res) => {
  const data = loadData();
  const { galleryId } = req.query;
  const list = galleryId ? (data.products || []).filter(p => p.galleryId === galleryId) : (data.products || []);
  res.json(list);
});

app.post('/api/products', (req, res) => {
  const { galleryId, name, price, description, image, stock } = req.body || {};
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Product name is required' });
  if (price === undefined || Number(price) <= 0) return res.status(400).json({ error: 'Price must be greater than 0' });
  const data = loadData();
  const product = {
    id: uid(),
    galleryId: galleryId || null,
    name: String(name).trim(),
    price: Math.round(Number(price)),
    description: description ? String(description).trim() : '',
    image: image && /^https?:\/\//i.test(String(image)) ? String(image) : 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    stock: stock || 'unlimited',
    createdAt: new Date().toISOString()
  };
  data.products = data.products || [];
  data.products.push(product);
  saveData(data);
  res.status(201).json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const data = loadData();
  const i = (data.products || []).findIndex(p => p.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Product not found' });
  data.products.splice(i, 1);
  saveData(data);
  res.json({ ok: true });
});

/* ---------- Orders (demo checkout) ---------- */
app.post('/api/orders', (req, res) => {
  const { productId, quantity, buyerName, buyerEmail } = req.body || {};
  const data = loadData();
  const product = (data.products || []).find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const qty = Math.max(1, Math.min(99, Number(quantity) || 1));
  const commissionRate = 0.03;
  const order = {
    id: uid(),
    productId: product.id,
    productName: product.name,
    quantity: qty,
    unitPrice: product.price,
    total: product.price * qty,
    commission: Math.round(product.price * qty * commissionRate),
    buyerName: buyerName || 'Guest',
    buyerEmail: buyerEmail || '',
    status: 'paid',
    createdAt: new Date().toISOString()
  };
  data.orders = data.orders || [];
  data.orders.push(order);
  saveData(data);
  res.status(201).json(order);
});

app.get('/api/orders', (_req, res) => {
  const data = loadData();
  res.json(data.orders || []);
});

/* ---------- Portfolio ---------- */
app.get('/api/portfolio', (_req, res) => {
  const data = loadData();
  res.json(data.portfolio || {});
});

app.put('/api/portfolio', (req, res) => {
  const data = loadData();
  data.portfolio = { ...(data.portfolio || {}), ...(req.body || {}) };
  saveData(data);
  res.json(data.portfolio);
});

/* ---------- Error handler ---------- */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Request failed' });
});

app.listen(PORT, () => {
  console.log(`Tithi web app running at http://localhost:${PORT}`);
});
