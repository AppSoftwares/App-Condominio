import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MdTrendingUp, MdTrendingDown, MdAccountBalanceWallet, MdGroups } from 'react-icons/md';
import { formatUSD } from '../../utils/currency';

interface TransparencyData {
    mes: number;
    anio: number;
    total_ingresos: number;
    total_reserva_mes: number;
    total_gastos: number;
    balance_neto: number;
    porcentaje_al_dia: number;
    total_residentes: number;
}

export const TransparencyDashboard: React.FC = () => {
    const today = new Date();
    const mes = today.getMonth() + 1;
    const anio = today.getFullYear();

    const { data, isLoading, error } = useQuery<TransparencyData>({
        queryKey: ['transparency', mes, anio],
        queryFn: async () => {
            // Asumimos que hay un fetcher base o usamos fetch directo
            const resp = await fetch(`/api/v1/reports/transparency?mes=${mes}&anio=${anio}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Ajustar según auth del proyecto
                }
            });
            if (!resp.ok) throw new Error('Error al cargar datos de transparencia');
            return resp.json();
        }
    });

    if (isLoading) return <div className="p-6 text-center">Cargando datos de transparencia...</div>;
    if (error || !data) return <div className="p-6 text-center text-red-500">No se pudieron cargar los datos financieros.</div>;

    return (
        <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-[#0f5551] mb-6 flex items-center gap-2">
                <MdAccountBalanceWallet /> Transparencia Financiera
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Ingresos del Mes"
                    value={formatUSD(data.total_ingresos)}
                    icon={<MdTrendingUp color="#27ae60" />}
                />
                <StatCard
                    label="Gastos del Mes"
                    value={formatUSD(data.total_gastos)}
                    icon={<MdTrendingDown color="#ba1a1a" />}
                />
                <StatCard
                    label="Fondo de Reserva"
                    value={formatUSD(data.total_reserva_mes)}
                    icon={<MdAccountBalanceWallet color="#785919" />}
                />
                <StatCard
                    label="Residentes al Día"
                    value={`${data.porcentaje_al_dia}%`}
                    icon={<MdGroups color="#0f5551" />}
                />
            </div>

            {/* Visual Bar para Balance */}
            <div className="mt-6">
                <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Balance Operativo</span>
                    <span className={data.balance_neto >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatUSD(data.balance_neto)}
                    </span>
                </div>
                <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${data.balance_neto >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(Math.abs(data.balance_neto / (data.total_ingresos || 1)) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            <p className="text-[10px] text-gray-400 mt-8 text-center italic">
                * Datos actualizados al cierre del día anterior. La transparencia genera confianza.
            </p>
        </div>
    );
};

const StatCard = ({ label, value, icon }: any) => (
    <div className="bg-[#F4F7F6] p-4 rounded-2xl flex items-center gap-4">
        <div className="text-2xl">{icon}</div>
        <div>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{label}</p>
            <p className="text-lg font-extrabold text-[#1b1c1a]">{value}</p>
        </div>
    </div>
);
