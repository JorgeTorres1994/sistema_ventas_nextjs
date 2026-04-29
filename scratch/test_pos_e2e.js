const http = require('http');

async function runTest() {
  const baseUrl = 'http://localhost:3005/api';
  console.log('🔄 Iniciando prueba End-to-End del Flujo de Venta en POS...');

  const request = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3005,
        path: path,
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (token) options.headers['Authorization'] = `Bearer ${token}`;
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Login
    const loginRes = await request('/auth/login', 'POST', { email: 'admin@admin.com', password: 'admin123' });
    if (loginRes.status !== 201 && loginRes.status !== 200) {
      console.error('Login Response:', loginRes);
      throw new Error('Login failed');
    }
    const token = loginRes.data.access_token;
    console.log('✅ 1. Login exitoso. Token JWT obtenido.');

    // 2. Fetch Customers
    const custRes = await request('/customers?isActive=true', 'GET', null, token);
    const customers = custRes.data.data;
    if (!customers || customers.length === 0) throw new Error('No se encontraron clientes activos.');
    const selectedCustomer = customers[0];
    console.log(`✅ 2. Clientes cargados. Cliente seleccionado: "${selectedCustomer.name}" (ID: ${selectedCustomer.id})`);

    // 3. Fetch Products
    const prodRes = await request('/products', 'GET', null, token);
    const products = prodRes.data.data;
    if (!products || products.length === 0) throw new Error('No se encontraron productos.');
    const selectedProduct = products[0];
    console.log(`✅ 3. Productos cargados. Producto seleccionado: "${selectedProduct.name}" (Stock actual: ${selectedProduct.stock})`);

    // 4. Generar Venta con el Cliente Seleccionado
    const taxRate = 0.18;
    const subtotal = Number(selectedProduct.price) * 1;
    const total = subtotal + (subtotal * taxRate);

    const salePayload = {
      items: [{ productId: selectedProduct.id, quantity: 1 }],
      paymentMethod: 'CASH',
      amountPaid: total,
      documentType: 'BOLETA',
      customerId: selectedCustomer.id
    };

    console.log('⏳ 4. Procesando Venta...');
    const saleRes = await request('/sales', 'POST', salePayload, token);
    
    if (saleRes.status === 201 || saleRes.status === 200) {
      console.log(`✅ ¡ÉXITO! Venta procesada correctamente (Código HTTP ${saleRes.status}).`);
      console.log(`   - ID Venta: ${saleRes.data.id}`);
      console.log(`   - Cliente Asignado: ${saleRes.data.customerId === selectedCustomer.id ? 'Correcto ✅' : 'Incorrecto ❌'}`);
      console.log(`   - Total Pagado: S/ ${saleRes.data.total}`);
    } else {
      console.error(`❌ Falla en la Venta (Código HTTP ${saleRes.status}):`, saleRes.data);
    }

  } catch (err) {
    console.error('❌ Error en el test E2E:', err.message);
  }
}

runTest();
