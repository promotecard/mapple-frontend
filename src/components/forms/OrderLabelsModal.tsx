
import React from 'react';
import type { Order, Student } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface OrderLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  students: Map<string, Student>;
  deliveryTime: string;
}

export const OrderLabelsModal: React.FC<OrderLabelsModalProps> = ({ isOpen, onClose, orders, students, deliveryTime }) => {

    const handlePrint = () => {
        const printContent = document.getElementById('labels-printable-content');
        if (!printContent) return;

        // Open a new window for printing
        const printWindow = window.open('', '_blank', 'height=600,width=800');
        if (!printWindow) {
            alert("Por favor, permita las ventanas emergentes para imprimir.");
            return;
        }

        printWindow.document.write('<html><head><title>Imprimir Etiquetas</title>');
        // Inject Tailwind CDN to ensure styles look correct in the new window
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        
        // Add specific print styles
        printWindow.document.write(`
            <style>
                body { background-color: white; padding: 20px; }
                @media print {
                    .no-print { display: none; }
                    .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');

        printWindow.document.close();
        printWindow.focus();

        // Small delay to allow Tailwind to parse styles before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 1000);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Etiquetas para Lote de Entrega (${deliveryTime})`}
            footer={<Button onClick={handlePrint}>Imprimir Etiquetas</Button>}
        >
            <div className="bg-gray-100 p-4 rounded-md max-h-[60vh] overflow-y-auto">
                <div id="labels-printable-content" className="grid grid-cols-2 gap-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-4 border border-gray-300 rounded-lg shadow-sm flex flex-col break-inside-avoid">
                            <div className="border-b pb-2 mb-2">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-500 font-mono">#{order.id.split('-')[1] || order.id}</p>
                                    <p className="text-xs font-bold text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</p>
                                </div>
                                <p className="font-bold text-lg truncate mt-1">{students.get(order.studentId)?.name || 'Estudiante Desconocido'}</p>
                                <p className="text-sm text-gray-600 truncate">{students.get(order.studentId)?.gradeLevel || 'Sin grado'}</p>
                            </div>
                            <div className="flex-grow">
                                <p className="text-[10px] font-semibold uppercase mb-1 text-gray-500">Contenido:</p>
                                <ul className="text-sm space-y-1">
                                    {order.items.map(item => (
                                        <li key={item.productId} className="flex justify-between items-center border-b border-dashed border-gray-100 pb-1">
                                            <span className="truncate pr-2 font-medium">({item.quantity}) {item.productName}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="border-t pt-2 mt-3 bg-gray-50 -mx-4 -mb-4 p-3 rounded-b-lg">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-500 font-bold">Hora de Entrega</p>
                                        <p className="font-bold text-xl text-gray-800">{deliveryTime}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400">Recibe:</p>
                                        <p className="text-xs font-medium text-gray-600 truncate max-w-[120px]">{order.customerName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};
