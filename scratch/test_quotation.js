const axios = require('axios');

async function test() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:3005/auth/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.access_token;
    console.log('Token acquired:', token.substring(0, 20) + '...');
    
    // Get a product
    const productsRes = await axios.get('http://localhost:3005/products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const product = productsRes.data.data ? productsRes.data.data[0] : productsRes.data[0];
    
    // Get or Create a customer
    let customer;
    const customersRes = await axios.get('http://localhost:3005/customers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (customersRes.data && customersRes.data.data && customersRes.data.data.length > 0) {
      customer = customersRes.data.data[0];
    } else {
      console.log('Creating a test customer...');
      const newCustomerRes = await axios.post('http://localhost:3005/customers', {
        name: 'Cliente de Prueba',
        email: 'cliente@prueba.com',
        dni: '12345678',
        address: 'Calle Falsa 123',
        phone: '999888777'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      customer = newCustomerRes.data;
    }
    
    console.log('Creating quotation for customer ID:', customer.id);
    const quotationData = {
      customerId: customer.id,
      items: [{
        productId: product.id,
        quantity: 1,
        price: product.price
      }],
      total: product.price,
      notes: "Test quotation"
    };
    
    const quoteRes = await axios.post('http://localhost:3005/quotations', quotationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Success!', quoteRes.data);
  } catch (error) {
    console.error('Error in request:', error.response ? error.response.data : error.message);
  }
}

test();
