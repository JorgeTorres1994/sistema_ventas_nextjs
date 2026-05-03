import { Controller, Post, Param, UseGuards, Get, Res, Header, Query } from '@nestjs/common';
import type { Response } from 'express';
import { InvoicingService } from './invoicing.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('invoicing')
export class InvoicingController {
  constructor(private invoicingService: InvoicingService) {}

  @Post('send/:saleId')
  @UseGuards(JwtAuthGuard)
  async sendInvoice(@Param('saleId') saleId: string) {
    return this.invoicingService.sendInvoice(saleId);
  }

  @Post('preview/:saleId')
  @UseGuards(JwtAuthGuard)
  async getPreview(@Param('saleId') saleId: string) {
    // Esto es solo para que el usuario vea algo real en el demo
    return {
      url: `http://localhost:3005/invoicing/view/${saleId}`
    };
  }

  @Get('view/:saleId')
  async viewInvoice(
    @Param('saleId') saleId: string, 
    @Query('type') type: string,
    @Res() res: Response
  ) {
    const sale = await this.invoicingService.getSaleDataForView(saleId);
    
    if (!sale || !sale.id) {
      return res.status(404).send('Comprobante no encontrado');
    }

    const formattedNumber = `${sale.series}-${sale.correlative ? sale.correlative.toString().padStart(8, '0') : '00000000'}`;

    const html = `
    <html>
      <head>
        <title>${sale.documentType}-${formattedNumber}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            .invoice-card { box-shadow: none !important; border: none !important; }
          }
        </style>
      </head>
      <body class="bg-gray-100 p-4 sm:p-10 font-sans">
        <!-- Floating Actions -->
        <div class="max-w-3xl mx-auto mb-6 no-print flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <p class="text-sm font-black text-gray-900 uppercase tracking-tight">Vista de Impresión Oficial</p>
           </div>
           <button onclick="document.title='${sale.documentType}-${formattedNumber}'; window.print();" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Imprimir o Guardar PDF
           </button>
        </div>

        <div class="max-w-3xl mx-auto bg-white p-8 sm:p-12 shadow-2xl rounded-sm border-t-8 border-indigo-600 invoice-card">
          <div class="flex justify-between items-start mb-12">
            <div>
              <h1 class="text-3xl font-black text-gray-900 mb-2">${sale.businessName || 'NEXUS GENESIS'}</h1>
              <p class="text-sm text-gray-500 font-bold">RUC: 20600000000</p>
              <p class="text-sm text-gray-500 font-medium">Dirección: Av. Empresarial 123, Lima</p>
            </div>
            <div class="border-4 border-indigo-600 p-6 text-center rounded-lg">
              <p class="text-lg font-black text-indigo-600 uppercase tracking-widest">${sale.documentType}</p>
              <p class="text-2xl font-black text-gray-900 mt-2">${sale.series}-${sale.correlative}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-10 mb-12 pb-8 border-b border-gray-100">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Señor(es):</p>
              <p class="text-sm font-black text-gray-900 uppercase">${sale.customer?.name || 'Consumidor Final'}</p>
              <p class="text-sm text-gray-500 mt-1 font-bold">DNI/RUC: ${sale.customer?.dni || '-'}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha de Emisión:</p>
              <p class="text-sm font-black text-gray-900">${sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p class="text-sm text-gray-500 mt-1 font-bold">Moneda: SOLES (PEN)</p>
            </div>
          </div>

          <table class="w-full mb-12">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cant.</th>
                <th class="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción</th>
                <th class="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">P. Unit</th>
                <th class="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${(sale.items || []).map(item => `
                <tr>
                  <td class="py-4 px-4 text-sm font-bold text-gray-900">${item.quantity}</td>
                  <td class="py-4 px-4 text-sm text-gray-600 uppercase font-black">${item.product?.name}</td>
                  <td class="py-4 px-4 text-sm text-gray-900 text-right font-bold">S/ ${Number(item.price).toFixed(2)}</td>
                  <td class="py-4 px-4 text-sm text-gray-900 text-right font-black">S/ ${(Number(item.price) * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="flex justify-between items-end">
            <div class="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
               <div class="w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-[10px] font-black uppercase text-center px-4">
                  QR CODE SIMULADO SUNAT
               </div>
               <p class="text-[8px] font-black text-gray-400 mt-2 uppercase tracking-widest">Hash: ${Math.random().toString(36).substring(7).toUpperCase()}</p>
            </div>
            <div class="w-72 space-y-3">
              <div class="flex justify-between items-center text-sm">
                <span class="font-bold text-gray-400 uppercase">Subtotal</span>
                <span class="font-black text-gray-900">S/ ${(Number(sale.total) / 1.18).toFixed(2)}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="font-bold text-gray-400 uppercase">IGV (18%)</span>
                <span class="font-black text-gray-900">S/ ${(Number(sale.total) - (Number(sale.total) / 1.18)).toFixed(2)}</span>
              </div>
              <div class="flex justify-between items-center py-4 border-t border-gray-100">
                <span class="font-black text-indigo-600 uppercase tracking-widest">Total Soles</span>
                <span class="text-2xl font-black text-gray-900">S/ ${Number(sale.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-12 pt-8 border-t border-dashed border-gray-200 text-center">
            <p class="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Representación impresa de la ${sale.documentType} ELECTRÓNICA</p>
            <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Autorizado mediante Resolución de Intendencia</p>
          </div>
        </div>
      </body>
    </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }
}
