const { RNode, RHOCore } = require('rchain-api');

function main({ express, grpc, clock }) {
  const app = express();
  const myNode = RNode(grpc, { host: 'localhost', port: 40401 });

  app.post('/rchain/', (req, res) => deploy(req, res, myNode, clock));

  app.get('/rchain/channel/:channel', (req, res) => dataAt(req, res, myNode));

  app.listen(3000, () => console.log('RChain service listening at http://localhost:3000/ .'));
}

function deploy(req, res, myNode, clock) {
  httpCatch(
    myNode.doDeploy({
      term: req.params.term,
      timestamp: clock().valueOf(),
    })
      .then(() => myNode.createBlock())
      .then((message) => {
        res.status(200).send(message);
      }),
  );
}

function dataAt(req, res, myNode) {
  httpCatch(
    myNode.listenForDataAtName(req.params.channel)
      .then((blockResults) => {
        console.log(`blocks received: ${blockResults.length}`);
        // TODO: If we got no blocks back, fail gracefully.
        const lastBlock = blockResults.slice(-1).pop();
        const lastDatum = lastBlock.postBlockData.slice(-1).pop();
        res.status(200).send(RHOCore.toRholang(lastDatum));
      }),
  );
}

function httpCatch(p, res) {
  p.catch((oops) => {
    res.status(500).send(JSON.stringify(oops));
  });
}

if (require.main === module) {
  // Access ambient stuff only when invoked as main module.
  /* eslint-disable global-require */
  main({
    clock: () => new Date(),
    express: require('express'),
    grpc: require('grpc'),
  });
}
