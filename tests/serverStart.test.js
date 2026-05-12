const app = require('../server');
const database = require('../database/db');

function fakeResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

describe('server startup and fallback handlers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('unhandled error middleware returns a generic 500 response', () => {
    const response = fakeResponse();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    app.handleUnhandledError(new Error('private failure'), {}, response, jest.fn());

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error.' });
    expect(errorSpy).toHaveBeenCalledWith('Unhandled error:', expect.any(Error));
  });

  test('startServer initializes the database and registers the HTTP listener', () => {
    const initSpy = jest.spyOn(database, 'initDatabase').mockImplementation(() => {});
    const seedSpy = jest.spyOn(database, 'seedDatabase').mockImplementation(() => {});
    const close = jest.fn();
    const listenSpy = jest.spyOn(app, 'listen').mockImplementation((port, callback) => {
      callback();
      return { close };
    });
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const server = app.startServer(4567);

    expect(initSpy).toHaveBeenCalled();
    expect(seedSpy).toHaveBeenCalled();
    expect(listenSpy).toHaveBeenCalledWith(4567, expect.any(Function));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Quiz LMS is running'));
    expect(server.close).toBe(close);
  });
});
