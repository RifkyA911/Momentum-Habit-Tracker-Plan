import { test, expect } from '@playwright/test'

test.describe('Database Connection', () => {
  test('should connect to the database successfully', async ({ request }) => {
    // Assuming Nuxt is running on localhost:3000 during tests
    const response = await request.get('http://localhost:3000/api/health')
    
    // Check if the endpoint responds with 200 OK
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    
    // Check the structure of the response
    expect(data).toHaveProperty('status', 'success')
    expect(data).toHaveProperty('message', 'Database connection successful')
    expect(data.data[0]).toHaveProperty('connected', 1)
  })
})
