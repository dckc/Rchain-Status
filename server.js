function main({ express }) {
  const app = express();

  app.get('/', (req, res) => res.send('Hello World!'));

  app.listen(3000, () => console.log('Example app listening on port 3000!'));
}


if (require.main === module) {
  // Access ambient stuff only when invoked as main module.
  /* eslint-disable global-require */
  const express = require('express');
  main({ express });
}
