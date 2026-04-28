import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import axios from 'axios';

@Injectable()
export class InvoicingService {
  private readonly logger = new Logger(InvoicingService.name);
  private readonly API_TOKEN = process.env.NUBEFACT_TOKEN || 'YOUR_REAL_TOKEN_HERE';
  private readonly API_URL = process.env.NUBEFACT_URL || 'https://api.nubefact.com/v1/document';

  constructor(private prisma: PrismaService) {}

  async sendInvoice(saleId: string) {
    try {
      const sale = await this.prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          items: {
            include: { product: true }
          },
          customer: true
        }
      });

      if (!sale) throw new Error('Venta no encontrada');

      // REPARACIÓN: Si la venta antigua no tiene tipo de documento, por defecto es BOLETA
      const docType = sale.documentType || 'BOLETA';
      let currentSeries = sale.series;
      let currentNumber = sale.correlative;

      // Si no tiene serie/número, generarlo ahora de forma obligatoria
      if (!currentSeries || !currentNumber) {
        this.logger.log(`Iniciando auto-reparación de numeración para venta ${saleId} (${docType})...`);
        
        const seriesData = await (this.prisma as any).documentSeries.findFirst({
          where: { documentType: docType, isActive: true }
        });

        if (!seriesData) {
          currentSeries = docType === 'FACTURA' ? 'F001' : 'B001';
          currentNumber = Math.floor(Date.now() / 1000000); 
        } else {
          currentSeries = seriesData.prefix;
          currentNumber = (seriesData.currentNumber || 0) + 1;
          
          await (this.prisma as any).documentSeries.update({
            where: { id: seriesData.id },
            data: { currentNumber: currentNumber }
          });
        }

        // GUARDADO AGRESIVO: Guardar Serie, Correlativo y Tipo de Documento
        await (this.prisma as any).sale.update({
          where: { id: saleId },
          data: { 
            series: currentSeries, 
            correlative: currentNumber,
            documentType: docType // Aseguramos que ya no sea NULL
          }
        });
        
        this.logger.log(`Venta reparada con éxito: ${currentSeries}-${currentNumber}`);
      }

      // Mapeo al formato estándar de NubeFact
      const invoiceData = {
        operacion: "generar_comprobante",
        tipo_de_comprobante: docType === 'FACTURA' ? 1 : 2,
        serie: currentSeries,
        numero: currentNumber,
        sunat_transaction: 1,
        cliente_tipo_de_documento: sale.customer?.dni ? (sale.customer.dni.length === 11 ? 6 : 1) : 0,
        cliente_numero_de_documento: sale.customer?.dni || "00000000",
        cliente_denominacion: sale.customer?.name || "CLIENTE VARIOS",
        cliente_direccion: sale.customer?.address || "",
        cliente_email: sale.customer?.email || "",
        fecha_de_emision: new Date().toISOString().split('T')[0],
        moneda: 1,
        porcentaje_de_igv: Number(sale.taxRate || 18),
        total_gravada: Number(sale.subtotal || 0),
        total_igv: Number(sale.taxAmount || 0),
        total: Number(sale.total || 0),
        items: (sale.items || []).map(item => ({
          unidad_de_medida: "NIU",
          codigo: item.productId,
          descripcion: item.product?.name || "Producto",
          cantidad: item.quantity,
          valor_unitario: Number(item.price) / 1.18,
          precio_unitario: Number(item.price),
          subtotal: (Number(item.price) * item.quantity) / 1.18,
          tipo_de_igv: 1,
          igv: (Number(item.price) * item.quantity) - ((Number(item.price) * item.quantity) / 1.18),
          total: Number(item.price) * item.quantity
        }))
      };

      const baseUrl = 'http://localhost:3005';
      let response;
      
      if (this.API_TOKEN === 'YOUR_REAL_TOKEN_HERE') {
        response = {
          data: {
            enlace_del_pdf: `${baseUrl}/invoicing/view/${saleId}`,
            enlace_del_xml: `${baseUrl}/invoicing/view/${saleId}?type=xml`,
            enlace_del_cdr: `${baseUrl}/invoicing/view/${saleId}?type=cdr`,
            codigo_de_barras: "QR_SIMULATED"
          }
        };
      } else {
        response = await axios.post(this.API_URL, invoiceData, {
          headers: { 'Authorization': `Bearer ${this.API_TOKEN}`, 'Content-Type': 'application/json' }
        });
      }

      await (this.prisma as any).sale.update({
        where: { id: saleId },
        data: {
          invoiceStatus: 'SENT',
          pdfUrl: response.data.enlace_del_pdf,
          xmlUrl: response.data.enlace_del_xml,
          cdrUrl: response.data.enlace_del_cdr,
          qrCode: response.data.codigo_de_barras,
          sunatResponse: JSON.stringify(response.data)
        }
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Error crítico en facturación: ${error.message}`);
      throw error;
    }
  }

  async getSaleDataForView(saleId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: { include: { product: true } },
        customer: true,
        user: true
      }
    });

    const settings = await (this.prisma as any).setting.findFirst();

    return {
      ...sale,
      series: sale?.series || 'TK',
      correlative: sale?.correlative || 0,
      documentType: sale?.documentType || 'TICKET',
      businessName: settings?.businessName,
      address: settings?.address,
      phone: settings?.phone,
    };
  }
}
