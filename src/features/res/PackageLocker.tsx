import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { QRCodeSVG } from 'qrcode.react';
import { Package, CheckCircle, Clock } from 'lucide-react';

interface PackageItem {
  id: string;
  courier_name: string;
  package_details: string;
  status: 'en_custodia' | 'entregado' | 'devuelto';
  received_at: string;
  liberation_token: string;
}

export const PackageLocker = () => {
  const user = useAuthStore(state => state.user);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('casillero_virtual')
      .select('*')
      .eq('resident_id', user.id)
      .order('received_at', { ascending: false });

    if (!error && data) {
      setPackages(data);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Package className="text-blue-600" /> Mi Casillero
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Cargando paquetes...</p>
      ) : packages.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
          <Package className="mx-auto text-gray-300 mb-2" size={48} />
          <p className="text-gray-500">No tienes paquetes pendientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => pkg.status === 'en_custodia' && setSelectedPackage(pkg)}
              className={`p-4 rounded-xl border-2 transition-all ${
                pkg.status === 'en_custodia'
                ? 'border-blue-100 bg-blue-50 cursor-pointer hover:border-blue-300'
                : 'border-gray-100 bg-white opacity-70'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{pkg.courier_name}</h3>
                  <p className="text-sm text-gray-600">{pkg.package_details}</p>
                </div>
                {pkg.status === 'en_custodia' ? (
                  <Clock className="text-amber-500" size={20} />
                ) : (
                  <CheckCircle className="text-green-500" size={20} />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Recibido: {new Date(pkg.received_at).toLocaleString()}
              </p>
              {pkg.status === 'en_custodia' && (
                <p className="text-xs font-bold text-blue-600 mt-1 italic">
                  Toca para mostrar código de retiro
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de QR de Liberación */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Código de Retiro</h2>
            <p className="text-sm text-gray-500 mb-6">Muestra este código al vigilante para retirar tu paquete de {selectedPackage.courier_name}</p>

            <div className="bg-white p-4 inline-block rounded-xl border-4 border-blue-600 mb-6">
              <QRCodeSVG value={selectedPackage.liberation_token} size={200} />
            </div>

            <button
              onClick={() => setSelectedPackage(null)}
              className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
