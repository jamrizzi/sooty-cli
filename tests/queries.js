import path from 'path';
import silentcp from 'easycp';
import { createServer } from 'http-server';

const config = {
  port: 8080
};

const { env } = process;
let server = null;

beforeAll(async () => {
  env.__JEST__ = true;
  server = createServer({
    root: path.resolve(__dirname, 'public')
  });
  await new Promise((resolve, reject) => {
    server.server.on('error', err => {
      if (err.errno !== 'EADDRINUSE') {
        return reject(err);
      }
      // eslint-disable-next-line no-console
      console.warn(`server already listening at ${config.port}`);
      return resolve();
    });
    server.listen(8080, err => {
      if (err) return reject(err);
      // eslint-disable-next-line no-console
      console.log(`listening on port ${config.port}`);
      return resolve();
    });
  });
});

afterAll(() => {
  server.close();
});

describe('queries', () => {
  it('should scrape data from website', async () => {
    await silentcp(
      'babel-node -- src/bin -r tests -c queries.yml -o ../.tmp/queries.json'
    );
    const queries = require('../.tmp/queries.json');
    expect(queries).toEqual({ numbers: ['One', 'Two', 'Three'] });
  });

  it('should scrape and filter data from website', async () => {
    await silentcp(
      'babel-node -- src/bin -r tests -c queries-filter.yml -o ../.tmp/queries-filter.json'
    );
    const queries = require('../.tmp/queries-filter.json');
    expect(queries).toEqual({ numbers: ['Two', 'Three'] });
  });

  it('should scrape and replace data from website', async () => {
    await silentcp(
      'babel-node -- src/bin -r tests -c queries-replace.yml -o ../.tmp/queries-replace.json'
    );
    const queries = require('../.tmp/queries-replace.json');
    expect(queries).toEqual({ numbers: ['ne', 'wo', 'hree'] });
  });
});
