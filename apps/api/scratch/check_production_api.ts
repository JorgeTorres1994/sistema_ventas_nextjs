import axios from 'axios';

async function main() {
  const url = 'https://sistema-ventas-nextjs-api.vercel.app/products?categoryId=91490950-71e7-495d-b2f3-b71938fbbcb9&page=1&limit=100';
  
  try {
    const response = await axios.get(url);
    console.log('--- RAW API RESPONSE ---');
    console.log('Total:', response.data.total);
    console.log('Data Length:', response.data.data.length);
    console.log('Data Content IDs:');
    response.data.data.forEach((p: any) => console.log(`- ${p.id} (${p.name})`));
  } catch (error) {
    console.error('API Call Failed');
  }
}

main();
