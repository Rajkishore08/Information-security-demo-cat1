import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { MOCK_PRODUCTS } from '../../data/mockData';
import type { Product } from '../../types/security';
import { ShoppingCart, ShieldAlert, ExternalLink, AlertOctagon } from 'lucide-react';

export const IdorShop: React.FC = () => {
  const { mode, addLog } = useSecurity();
  const [selectedId, setSelectedId] = useState<number>(1);
  const [activeProduct, setActiveProduct] = useState<Product | null>(MOCK_PRODUCTS[0]);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  const presets = [
    { label: "Standard Item (?id=1)", id: 1 },
    { label: "Headphones (?id=2)", id: 2 },
    { label: "Hardware Token (?id=3)", id: 3 },
    { label: "Laptop (?id=4)", id: 4 },
    { label: "⚠️ HIDDEN ADMIN ITEM (?id=10)", id: 10 }
  ];

  const handleFetchProduct = (idToFetch: number) => {
    setSelectedId(idToFetch);
    setAccessDeniedMessage(null);

    const targetProduct = MOCK_PRODUCTS.find((p) => p.id === idToFetch);

    if (mode === 'vulnerable') {
      // ❌ VULNERABLE MODE: No permission or visibility checks on ID
      if (targetProduct) {
        setActiveProduct(targetProduct);
        addLog(
          'vuln',
          'PARAMETER TAMPERING / IDOR',
          `Fetched product data for ID ${idToFetch} without authorization check`,
          `// Vulnerable Server Endpoint:\n$id = $_GET['id']; // product.php?id=${idToFetch}\n$sql = "SELECT * FROM products WHERE id = $id"; // Direct lookup!\n$result = mysqli_query($conn, $sql);`,
          { productId: idToFetch, isRestricted: targetProduct.isRestricted }
        );

        if (targetProduct.isRestricted) {
          addLog(
            'exploit',
            'IDOR VULNERABILITY EXPLOITED',
            `⚡ UNEXPOSED/RESTRICTED ITEM ACCESSED! User bypassed catalog grid via parameter manipulation ?id=10!`,
            `Accessed item: "${targetProduct.name}" (Original Value: ₹${targetProduct.originalPrice})`
          );
        }
      } else {
        setActiveProduct(null);
        addLog('warn', 'IDOR', `Product ID ${idToFetch} not found in database.`);
      }
    } else {
      // 🟢 SECURE MODE: Authorization & Visibility Check
      if (targetProduct) {
        if (targetProduct.isRestricted) {
          setActiveProduct(null);
          setAccessDeniedMessage(`HTTP 403 Forbidden: Product ID ${idToFetch} is marked as RESTRICTED ADMIN ITEM. Access denied for current session role [Customer].`);
          addLog(
            'secure',
            'ACCESS CONTROL DEFENSE',
            `🔒 Blocked unauthorized access to restricted product ID ${idToFetch}`,
            `// Secure Server Verification:\nif ($product['is_restricted'] && !is_admin_session()) {\n    http_response_code(403);\n    die("Access Denied");\n}`,
            { requestedId: idToFetch, status: 403 }
          );
        } else {
          setActiveProduct(targetProduct);
          addLog(
            'secure',
            'ACCESS CONTROL DEFENSE',
            `Verified user authorization for public product ID ${idToFetch}`
          );
        }
      } else {
        setActiveProduct(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulated Browser URL Bar Panel */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-indigo-400" />
              Scenario A: IDOR / Hidden Product URL Parameter Tampering
            </h3>
            <p className="text-xs text-gray-400">Manipulate the `?id=` URL parameter to attempt accessing unlisted admin vouchers</p>
          </div>

          <div className="flex items-center gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleFetchProduct(p.id)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition border ${
                  p.id === 10
                    ? 'bg-red-950/80 text-red-300 border-red-800 hover:bg-red-900'
                    : 'bg-gray-950 text-indigo-300 border-gray-800 hover:bg-indigo-950'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simulated Address Bar */}
        <div className="flex items-center gap-2 rounded-xl bg-black p-3 border border-gray-800 font-mono text-xs">
          <span className="text-gray-500 shrink-0">https://cybershop.com/product.php?id=</span>
          <input
            type="number"
            value={selectedId}
            onChange={(e) => setSelectedId(parseInt(e.target.value, 10) || 1)}
            className="w-20 rounded bg-gray-900 px-2 py-1 text-emerald-400 font-bold border border-gray-700 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => handleFetchProduct(selectedId)}
            className="rounded bg-indigo-600 hover:bg-indigo-500 px-3 py-1 text-white font-bold transition flex items-center gap-1"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>GET Request</span>
          </button>
        </div>
      </div>

      {/* Product Display Card / Response Panel */}
      {accessDeniedMessage ? (
        <div className="rounded-2xl border border-red-800 bg-red-950/40 p-8 text-center text-red-200 shadow-xl space-y-3">
          <AlertOctagon className="mx-auto h-12 w-12 text-red-400" />
          <h4 className="text-base font-bold text-red-300 font-mono">403 FORBIDDEN: ACCESS DENIED</h4>
          <p className="text-xs max-w-lg mx-auto text-red-200">{accessDeniedMessage}</p>
        </div>
      ) : activeProduct ? (
        <div className={`rounded-2xl border p-6 shadow-2xl transition grid grid-cols-1 md:grid-cols-12 gap-6 ${
          activeProduct.isRestricted
            ? 'border-red-700 bg-red-950/30'
            : 'border-gray-800 bg-gray-900/60'
        }`}>
          <div className="md:col-span-4 flex items-center justify-center bg-gray-950 rounded-xl p-4 border border-gray-800 overflow-hidden">
            <img
              src={activeProduct.image}
              alt={activeProduct.name}
              className="h-48 w-full object-cover rounded-lg"
            />
          </div>

          <div className="md:col-span-8 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-800">
                  {activeProduct.category}
                </span>
                {activeProduct.isRestricted && (
                  <span className="rounded bg-red-950 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-800 flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> RESTRICTED ADMIN ITEM EXPOSED
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white">{activeProduct.name}</h3>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">{activeProduct.description}</p>
            </div>

            <div className="border-t border-gray-800 pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">Catalog Listed Price:</span>
                <span className="text-2xl font-black text-emerald-400">₹{activeProduct.price.toLocaleString()}</span>
              </div>

              <div className="text-xs text-gray-400 font-mono">
                Item ID: <span className="text-white font-bold">#{activeProduct.id}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
