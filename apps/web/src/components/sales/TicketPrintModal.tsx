"use client";

import React, { useState, useEffect } from 'react';
import { X, Printer, Download, FileText, RotateCcw, AlertCircle } from 'lucide-react';
import { getSaleById, cancelSale } from '@/lib/api';
import { toast } from 'sonner';
import { useSettings } from '@/components/SettingsProvider';

interface TicketPrintModalProps {
    saleId: string | null;
    onClose: () => void;
}

const TicketPrintModal = ({ saleId, onClose }: TicketPrintModalProps) => {
    const [sale, setSale] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { settings } = useSettings();

    useEffect(() => {
        if (saleId) {
            setLoading(true);
            getSaleById(saleId)
                .then(setSale)
                .finally(() => setLoading(false));
        }
    }, [saleId]);

    if (!saleId) return null;

    const handlePrint = () => {
        const printContent = document.getElementById('ticket-content');
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=0,top=0,width=400,height=600');
        
        if (printWindow && printContent) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Imprimir Ticket - ${sale?.documentSeries || 'VENTA'}</title>
                        <style>
                            @page { size: 80mm auto; margin: 0; }
                            body { 
                                font-family: 'Courier New', Courier, monospace; 
                                font-size: 12px; 
                                line-height: 1.2; 
                                padding: 10px;
                                width: 70mm;
                            }
                            .text-center { text-align: center; }
                            .text-right { text-align: right; }
                            .bold { font-weight: bold; }
                            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
                            .item { margin-bottom: 5px; }
                            .flex { display: flex; justify-content: space-between; }
                        </style>
                    </head>
                    <body>
                        ${printContent.innerHTML}
                        <script>
                            setTimeout(() => {
                                window.print();
                                window.close();
                            }, 500);
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
        }
    };

    const handleCancelSale = async () => {
        if (!sale) return;
        toast('¿Desea anular esta venta?', {
            description: 'Esta acción restaurará el stock de los productos. No se puede deshacer.',
            action: {
                label: 'Confirmar Anulación',
                onClick: async () => {
                    const toastId = toast.loading('Anulando venta...');
                    try {
                        await cancelSale(sale.id);
                        toast.success('Venta anulada correctamente', { id: toastId });
                        onClose();
                        window.location.reload();
                    } catch (error: any) {
                        const msg = error.response?.data?.message || 'Error al cancelar la venta';
                        toast.error(msg, { id: toastId });
                    }
                }
            },
            duration: 5000,
        });
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
            
            <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
                {/* Preview Section */}
                <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center overflow-y-auto max-h-[80vh]">
                    {loading ? (
                        <div className="animate-pulse flex flex-col items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full" />
                            <div className="w-32 h-4 bg-gray-200 rounded" />
                        </div>
                    ) : (
                        <div 
                            id="ticket-content" 
                            className="bg-white shadow-xl p-8 w-[80mm] min-h-[120mm] text-[#111827] font-mono text-[11px] leading-relaxed"
                            style={{ boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}
                        >
                            {sale ? (
                                <>
                                    <div className="text-center space-y-1 mb-4">
                                        <p className="font-black text-lg uppercase tracking-tight">{settings?.businessName || 'NEXUS GENESIS'}</p>
                                        <p className="text-[9px] font-bold">{settings?.address || 'LIMA, PERU'}</p>
                                        <p className="text-[9px]">RUC: 20600000000</p>
                                        <p className="text-[9px]">TEL: {settings?.phone || '+51 900 000 000'}</p>
                                    </div>

                                    <div className="border-b border-dashed border-gray-300 my-4" />

                                    <div className="space-y-1 mb-4">
                                        <p className="font-bold uppercase tracking-widest text-[9px] text-gray-400">Comprobante Electrónico</p>
                                        <p className="font-black text-sm">{sale.documentSeries || 'VENTA'}-{sale.documentNumber?.toString().padStart(8, '0') || '00000000'}</p>
                                        <p>FECHA: {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : '---'}</p>
                                        <p>HORA: {sale.createdAt ? new Date(sale.createdAt).toLocaleTimeString() : '---'}</p>
                                        <p>CLIENTE: {sale.customer?.name?.toUpperCase() || 'CLIENTE DE MOSTRADOR'}</p>
                                        {sale.customer?.dni && <p>DNI/RUC: {sale.customer.dni}</p>}
                                    </div>

                                    <div className="border-b border-dashed border-gray-300 my-4" />

                                    <div className="space-y-3 mb-6">
                                        {sale.items?.map((item: any, idx: number) => (
                                            <div key={idx}>
                                                <p className="font-bold uppercase">{item.product?.name}</p>
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span>{item.quantity} x S/ {Number(item.price || 0).toFixed(2)}</span>
                                                    <span className="font-black">S/ {(item.quantity * Number(item.price || 0)).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-b border-dashed border-gray-300 my-4" />

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold uppercase">Subtotal</span>
                                            <span>S/ {(Number(sale.total || 0) / 1.18).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold uppercase">I.G.V (18%)</span>
                                            <span>S/ {(Number(sale.total || 0) - (Number(sale.total || 0) / 1.18)).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pt-2">
                                            <span className="font-black uppercase tracking-tighter">Total a Pagar</span>
                                            <span className="font-black text-lg">S/ {Number(sale.total || 0).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="border-b border-dashed border-gray-300 my-4" />

                                    <div className="text-center space-y-2 mt-6">
                                        <p className="font-bold text-[9px] uppercase tracking-widest">Gracias por su preferencia</p>
                                        <p className="text-[8px] text-gray-400">Representación impresa del comprobante electrónico.</p>
                                        <p className="text-[8px] font-bold">www.nexusgenesis.com</p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                                    <AlertCircle className="w-8 h-8 mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Error al cargar datos</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions Section */}
                <div className="w-full md:w-64 p-8 border-l border-gray-50 flex flex-col justify-between bg-white">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Acciones</h3>
                            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                                <X className="w-5 h-5 text-gray-300" />
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={handlePrint}
                                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                            >
                                <Printer className="w-4 h-4" /> Imprimir
                            </button>
                            <button 
                                onClick={() => {
                                    if (sale?.pdfUrl) window.open(sale.pdfUrl, '_blank');
                                }}
                                className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-100 transition-all flex items-center justify-center gap-3"
                            >
                                <Download className="w-4 h-4" /> Exportar PDF
                            </button>
                            <button 
                                onClick={() => {
                                    if (sale?.xmlUrl) window.open(sale.xmlUrl, '_blank');
                                }}
                                className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
                            >
                                <FileText className="w-4 h-4" /> Descargar XML
                            </button>

                            {sale?.status !== 'CANCELLED' && (
                                <button 
                                    onClick={handleCancelSale}
                                    className="w-full py-4 mt-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-100 transition-all flex items-center justify-center gap-3 border border-rose-100/50"
                                >
                                    <RotateCcw className="w-4 h-4" /> Anular Venta
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-50">
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest text-center">Nexus Genesis v2.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketPrintModal;
