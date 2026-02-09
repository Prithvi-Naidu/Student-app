import request from 'supertest';
import app from '../src/index';

describe('Forum API', () => {
  it('should list forum posts', async () => {
    const response = await request(app).get('/api/forum/posts');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('should require auth for creating a post', async () => {
    const response = await request(app)
      .post('/api/forum/posts')
      .send({ title: 'Test', content: 'Body', category: 'General' });
    expect(response.status).toBe(401);
  });
});



