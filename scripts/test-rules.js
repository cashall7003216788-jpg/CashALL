const https = require('https');

const postData = JSON.stringify({
  pid: 21235,
  plid: 19,
  bbmp: 5950,
  pm: 'csh'
});

const paths = [
  '/sell_/v2/calculator/rules?pm=csh&souid=2&serid=2',
  '/v2/calculator/rules?pm=csh&souid=2&serid=2',
  '/api/v2/calculator/rules?pm=csh&souid=2&serid=2',
  '/sell/api/v2/calculator/rules?pm=csh&souid=2&serid=2',
  '/sell/calculator/page?pid=21235&plid=19&plnm=Laptop&pn=IdeaPad+D+Series&bn=Lenovo&pin=https%3A%2F%2Fs3n.cashify.in%2Fcashify%2Fproduct%2Fimg%2Fxhdpi%2F8eab44d2-ea5a.jpg&pm=csh&bbmp=5950&pageId=1&tg=cshweb3'
];

paths.forEach(p => {
  const req = https.request({
    hostname: 'www.cashify.in',
    path: p,
    method: p.includes('rules') ? 'POST' : 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*'
    }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      console.log(p, '=> status:', res.statusCode, 'len:', d.length, 'preview:', d.slice(0, 150));
      if (d.includes('Intel') || d.includes('Processor')) {
        console.log('FOUND IN', p);
        require('fs').writeFileSync('found_' + Date.now() + '.json', d);
      }
    });
  });
  if (p.includes('rules')) req.write(postData);
  req.end();
});
