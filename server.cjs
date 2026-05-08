const path = require('path');
const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

server.use(middlewares);

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

server.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'vue-workout-lovable-api',
    endpoints: ['/workouts', '/api/workouts'],
  });
});

server.use(jsonServer.bodyParser);
server.use('/api', router);
server.use(router);

server.listen(port, () => {
  console.log(`JSON Server API is running on port ${port}`);
});
