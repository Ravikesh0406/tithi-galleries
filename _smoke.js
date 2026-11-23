const fs = require('fs');
const src = fs.readFileSync(__dirname + '\\js\\app.js', 'utf8');
global.window = { location: { href: '' } };
global.localStorage = { _ : {}, getItem(k) { return k in this._ ? this._[k] : null; }, setItem(k, v) { this._[k] = String(v); }, removeItem(k) { delete this._[k]; } };
global.document = { querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {}, createElement: () => ({ style: {} }) };
eval(src);
const g = { id: 'abc', photos: [{ src: 'a', caption: 'cake cutting', tags: ['cake'] }, { src: 'b', caption: 'group', tags: ['group', 'kids'] }, { src: 'c', caption: 'runners', tags: ['marathon'] }] };
const T = window.Tithi;
const r1 = T.searchGallery(g, 'cake').length;
const r2 = T.searchGallery(g, 'GROUP').length;
const r3 = T.searchGallery(g, 'zzz').length;
const page = T.galleryPage(g);
T.upsertGallery({ id: '1', name: 'T', photos: [] });
const n = T.getGalleries().length;
console.log('search cake:', r1, '| search GROUP:', r2, '| search zzz:', r3, '| page:', page, '| galleries:', n);
if (r1 !== 1 || r2 !== 1 || r3 !== 0 || n !== 1 || !page.includes('gallery.html?g=abc')) { console.log('FAIL'); process.exit(1); }
console.log('SMOKE TESTS PASSED');
