import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('POST /api/admin/catalog/import', () => {
  it('should return a 400 error if the uploaded file is not a CSV', async () => {
    const file = new File(['this is not a csv'], 'test.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', file);

    const req = new NextRequest('http://localhost/api/admin/catalog/import', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(415);
    expect(body.error).toBe('Invalid file type. Please upload a CSV file.');
  });
});
