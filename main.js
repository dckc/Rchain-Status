const bodyParser = require('body-parser');
const { RNode, RHOCore, logged } = require('rchain-api');

function main({ express, grpc, clock, resolve }) {
  const app = express();

  const myNode = RNode(grpc, { host: 'localhost', port: 40401 });

  app.get('/', (req, res) => res.sendFile(resolve('index.html')));
  app.get('/page.js', (req, res) => res.sendFile(resolve('page.js')));

  app.post('/rchain/', bodyParser.json({ type: '*/json' }), deployHandler(myNode, clock));

  app.get('/rchain/channel/:channel', listenHandler(myNode));

  app.listen(3000, () => console.log('RChain service listening at http://localhost:3000/ .'));
}

function deployHandler(myNode, clock) {
  return (req, res) => {
    console.log('deploy body:', req.body);
    if (!req.body.term) {
      res.status(400).type('text/plain').send('missing term');
      return;
    }

    httpCatch(
      res,
      myNode.doDeploy({
        term: req.body.term,
        timestamp: clock().valueOf(),
      })
        .then(() => myNode.createBlock())
        .then((message) => {
          res.status(200).type('application/json').send(JSON.stringify({ message }));
        }),
    );
  };
}

function listenHandler(myNode) {
  return (req, res) => {
    console.log('dataAt params:', req.params);
    httpCatch(
      res,
      myNode.listenForDataAtName(req.params.channel)
        .then((blockResults) => {
          console.log(`blocks received: ${blockResults.length}`);
          const dataPerBlock = blockResults.map(r => r.postBlockData.map(RHOCore.toRholang));
          const data = [].concat(...dataPerBlock);
          // TODO: If we got no blocks back, fail gracefully.
          res.status(200).type('application/json').send(JSON.stringify(data));
        }),
    );
  };
}

function httpCatch(res, p) {
  return p.catch((oops) => {
    logged(oops, 'httpCatch oops');
    res.status(500).type('text/plain').send(`${oops.name}:  ${oops.message}`);
  });
}

if (require.main === module) {
  // Access ambient stuff only when invoked as main module.
  /* eslint-disable global-require */
  main({
    clock: () => new Date(),
    resolve: require('path').resolve,
    express: require('express'),
    grpc: require('grpc'),
  });
}
