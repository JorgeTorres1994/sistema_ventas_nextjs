const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

async function seedQuotations() {
  try {
    console.log('--- Iniciando seeding de cotizaciones ---\n');

    // Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    const token = loginRes.data.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Login exitoso\n');

    // Get products
    const productsRes = await axios.get(`${BASE_URL}/products`, { headers });
    const products = productsRes.data.data || productsRes.data;
    console.log(`✅ ${products.length} productos disponibles\n`);

    // Get customers
    const customersRes = await axios.get(`${BASE_URL}/customers`, { headers });
    const customers = customersRes.data.data || customersRes.data;
    console.log(`✅ ${customers.length} clientes disponibles\n`);

    if (!customers.length || !products.length) {
      console.log('❌ No hay suficientes clientes o productos para generar cotizaciones.');
      return;
    }

    // Create 5 quotations
    const quotationScenarios = [
      { customerIdx: 0, items: [{ productIdx: 0, qty: 2 }, { productIdx: 1, qty: 1 }], notes: 'Cotización para empresa constructora - prioridad alta' },
      { customerIdx: 0, items: [{ productIdx: 2, qty: 3 }], notes: 'Pedido mayorista - descuento aplicado' },
      { customerIdx: 0, items: [{ productIdx: 0, qty: 1 }, { productIdx: 3, qty: 2 }, { productIdx: 4, qty: 1 }], notes: 'Pedido mixto de temporada' },
      { customerIdx: 0, items: [{ productIdx: 1, qty: 5 }], notes: 'Reposición de inventario urgente' },
      { customerIdx: 0, items: [{ productIdx: 2, qty: 1 }, { productIdx: 5 || 0, qty: 2 }], notes: 'Cotización estándar - cliente recurrente' },
    ];

    let created = 0;
    for (const scenario of quotationScenarios) {
      const customer = customers[scenario.customerIdx % customers.length];
      const items = scenario.items.map(i => ({
        productId: products[i.productIdx % products.length].id,
        quantity: i.qty,
      }));

      try {
        const res = await axios.post(`${BASE_URL}/quotations`, {
          customerId: customer.id,
          items,
          notes: scenario.notes,
          expirationDays: 7 + (created * 3)
        }, { headers });

        console.log(`✅ Cotización ${res.data.number} creada - Total: S/ ${Number(res.data.total).toFixed(2)} - Cliente: ${customer.name}`);
        created++;
      } catch (err) {
        console.log(`⚠️ Error creando cotización:`, err.response?.data || err.message);
      }
    }

    console.log(`\n--- ✅ Seeding completado: ${created}/5 cotizaciones creadas ---`);

    // Verify all quotations
    const allQuotesRes = await axios.get(`${BASE_URL}/quotations`, { headers });
    const allQuotes = allQuotesRes.data;
    console.log(`\n📋 Total de cotizaciones en la base de datos: ${allQuotes.length}`);
    allQuotes.forEach(q => {
      console.log(`   - ${q.number} | S/ ${Number(q.total).toFixed(2)} | ${q.status} | ${q.customer?.name || 'Sin cliente'}`);
    });

  } catch (error) {
    console.error('Error fatal:', error.response?.data || error.message);
  }
}

seedQuotations();
