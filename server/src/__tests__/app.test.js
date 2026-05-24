process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

const { default: app } = await import('../app.js');
const { default: routes } = await import('../routes/index.js');

const createResponse = () => ({
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
});

const getRouteHandler = (router, path) => {
  const layer = router.stack.find((item) => item.route?.path === path);
  return layer?.route?.stack?.[0]?.handle;
};

describe('API shell', () => {
  it('responds from the root endpoint', async () => {
    const handler = getRouteHandler(app._router, '/');
    const response = createResponse();

    handler({}, response);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Welcome to BDA Module API'
    });
  });

  it('responds from the versioned health endpoint', async () => {
    const handler = getRouteHandler(routes, '/health');
    const response = createResponse();

    handler({}, response);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'API is running'
    });
    expect(response.body.timestamp).toBeDefined();
  });

  it('registers the versioned API router', () => {
    const apiLayer = app._router.stack.find((layer) => layer.name === 'router' && layer.regexp.test('/api/v1'));

    expect(apiLayer).toBeDefined();
  });
});
