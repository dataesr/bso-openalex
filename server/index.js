import 'dotenv/config';
import path from 'path';
import express from 'express';
import cors from 'cors';

let httpServer;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.disable('x-powered-by');
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));
}

// SERVE REACT BUILD
app.use(express.static(path.join(path.resolve(), 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'dist/index.html'));
});

async function cleanup() {
  app.isReady = false;
  if (httpServer) {
    await httpServer.close();
  }
}
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function start(port) {
  httpServer = app.listen(port, () => {
    console.log('Server started');
    app.isReady = true;
  });
}

start(process.env.PORT || 3000);
