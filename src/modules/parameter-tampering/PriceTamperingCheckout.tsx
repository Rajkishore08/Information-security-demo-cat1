import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { MOCK_PRODUCTS } from '../../data/mockData';
import type { Order } from '../../types/security';
import { ShoppingCart, ShieldAlert, ShieldCheck, Sparkles, Send } from 'lucide-react';

export const PriceTamperingCheckout: React.FC = () => {
  const { mode, addLog, orders, addOrder } = useSecurity();
  const laptop = MOCK_PRODUCTS.find((p) => p.id === 4) || MOCK_PRODUCTS[3]; // Alienware Laptop (₹85,000)

  const [submittedPrice, setSubmittedPrice] = useState<number>(10); // Attack preset: ₹10!
  const [quantity] = useState<number>(1);
  const [lastOrderResult, setLastOrderResult] = useState<Order | null>(null);

  const presets = [
    { label: "Tamper Price to ₹10 (99.9% Discount Attack)", price: 10 },
    { label: "Tamper Price to ₹1", price: 1 },
    { label: "Tamper Price to ₹0 (Free Item Attack)", price: 0 },
    { label: "Legitimate Price (₹85,000)", price: 85000 }
  ];

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    const verifiedUnitPrice = laptop.price; // ₹85,000 from authoritative DB
    const verifiedTotal = verifiedUnitPrice * quantity;
    const clientSubmittedTotal = submittedPrice * quantity;

    if (mode === 'vulnerable') {
      // ❌ VULNERABLE MODE: Server trusts client-submitted 'price' parameter from POST request body
      const newOrder: Order = {
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        productName: laptop.name,
        quantity,
        unitPriceSubmitted: submittedPrice,
        unitPriceVerified: verifiedUnitPrice,
        totalPaid: clientSubmittedTotal,
        status: clientSubmittedTotal < verifiedTotal ? 'PRICE_TAMPERED' : 'SUCCESS',
        timestamp: new Date().toLocaleTimeString()
      };

      addOrder(newOrder);
      setLastOrderResult(newOrder);

      addLog(
        'vuln',
        'PRICE TAMPERING',
        `Unvalidated checkout order processed with client-submitted price ₹${submittedPrice}`,
        `// Vulnerable PHP Backend:\n$price = $_POST['price']; // ${submittedPrice}\n$sql = "INSERT INTO orders (product_id, amount) VALUES (4, $price)";\nmysqli_query($conn, $sql);`,
        { submittedPrice, verifiedPrice: verifiedUnitPrice }
      );

      if (submittedPrice < verifiedUnitPrice) {
        addLog(
          'exploit',
          'PRICE TAMPERING EXPLOIT',
          `⚡ PRICE TAMPERING SUCCESSFUL! Purchased ₹85,000 Laptop for ₹${submittedPrice}!`,
          `Order ID: ${newOrder.orderId} | Total Billed: ₹${clientSubmittedTotal}`
        );
      }
    } else {
      // 🟢 SECURE MODE: Backend recalculates price using database catalog
      const newOrder: Order = {
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        productName: laptop.name,
        quantity,
        unitPriceSubmitted: submittedPrice,
        unitPriceVerified: verifiedUnitPrice,
        totalPaid: verifiedTotal,
        status: 'SUCCESS',
        timestamp: new Date().toLocaleTimeString()
      };

      addOrder(newOrder);
      setLastOrderResult(newOrder);

      addLog(
        'secure',
        'SERVER-SIDE VALIDATION',
        `Client price input ₹${submittedPrice} overridden by backend database price ₹${verifiedUnitPrice}`,
        `// Secure Backend Price Lookup:\n$stmt = $db->prepare("SELECT price FROM products WHERE id = ?");\n$verified_price = $stmt->fetch_assoc()['price']; // 85000\n$total = $verified_price * $quantity; // ${verifiedTotal}`,
        { clientSubmittedPrice: submittedPrice, serverVerifiedPrice: verifiedUnitPrice }
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Product & Checkout Form */}
      <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Scenario B: Checkout Price Tampering</h3>
            <p className="text-xs text-gray-400">CyberShop E-Commerce Checkout API</p>
          </div>
        </div>

        {/* Selected Product Card */}
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 flex gap-4">
          <img
            src={laptop.image}
            alt={laptop.name}
            className="h-20 w-20 object-cover rounded-lg shrink-0"
          />
          <div>
            <h4 className="text-sm font-bold text-white">{laptop.name}</h4>
            <p className="text-xs text-gray-400 mt-1">{laptop.description}</p>
            <div className="mt-2 text-xs">
              <span className="text-gray-400">Authoritative Catalog Price: </span>
              <span className="font-extrabold text-emerald-400">₹{laptop.price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Attack Presets */}
        <div className="rounded-xl bg-gray-950 p-3.5 border border-gray-800">
          <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Intercept & Tamper Client POST Payload:
          </label>
          <div className="space-y-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSubmittedPrice(p.price)}
                className="w-full text-left rounded-lg bg-gray-900 hover:bg-emerald-950/80 px-2.5 py-1.5 text-xs text-gray-300 hover:text-emerald-200 border border-gray-800 hover:border-emerald-700 transition truncate"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* HTTP Form Payload Form */}
        <form onSubmit={handleCheckout} className="space-y-3">
          <div className="rounded-xl bg-black p-3.5 border border-gray-800 font-mono text-xs space-y-2">
            <span className="text-gray-500 font-bold text-[10px] uppercase block">
              Intercepted HTTP POST Request Body (Client Control):
            </span>
            <div className="space-y-1 text-gray-300">
              <p>POST /api/v1/checkout.php</p>
              <p>{"{"}</p>
              <p className="pl-4 font-bold text-purple-300">"product_id": 4,</p>
              <p className="pl-4 font-bold text-purple-300">"quantity": {quantity},</p>
              <div className="pl-4 flex items-center gap-2">
                <span className="text-red-400 font-bold">"price": </span>
                <input
                  type="number"
                  value={submittedPrice}
                  onChange={(e) => setSubmittedPrice(parseFloat(e.target.value) || 0)}
                  className="w-28 rounded bg-gray-900 px-2 py-0.5 text-red-300 font-bold border border-red-700 focus:outline-none"
                />
              </div>
              <p>{"}"}</p>
            </div>
          </div>

          <button
            type="submit"
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-white shadow-lg transition ${
              mode === 'vulnerable'
                ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Send Intercepted Checkout Request</span>
          </button>
        </form>
      </div>

      {/* Order Result & Audit Log Panel */}
      <div className="lg:col-span-6 space-y-4">
        {lastOrderResult && (
          <div className={`rounded-2xl border p-6 shadow-2xl space-y-4 ${
            lastOrderResult.status === 'PRICE_TAMPERED'
              ? 'border-red-700 bg-red-950/40'
              : 'border-emerald-700 bg-emerald-950/40'
          }`}>
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                {lastOrderResult.status === 'PRICE_TAMPERED' ? (
                  <>
                    <ShieldAlert className="h-5 w-5 text-red-400" />
                    <span>⚠️ Order Processed with Manipulated Price!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <span>🟢 Order Processed with Authoritative Price</span>
                  </>
                )}
              </div>
              <span className="font-mono text-xs text-gray-400">{lastOrderResult.orderId}</span>
            </div>

            <div className="space-y-2 text-xs text-gray-200">
              <div className="flex justify-between">
                <span>Product:</span>
                <span className="font-bold text-white">{lastOrderResult.productName}</span>
              </div>
              <div className="flex justify-between">
                <span>Submitted Price (Browser):</span>
                <span className="font-mono text-red-300">₹{lastOrderResult.unitPriceSubmitted}</span>
              </div>
              <div className="flex justify-between">
                <span>Verified Price (Server DB):</span>
                <span className="font-mono text-emerald-300">₹{lastOrderResult.unitPriceVerified}</span>
              </div>
              <div className="flex justify-between border-t border-gray-800 pt-2 font-bold text-sm">
                <span>Total Amount Charged:</span>
                <span className={lastOrderResult.status === 'PRICE_TAMPERED' ? 'text-red-400 font-extrabold' : 'text-emerald-400 font-extrabold'}>
                  ₹{lastOrderResult.totalPaid.toLocaleString()}
                </span>
              </div>
            </div>

            {mode === 'vulnerable' && lastOrderResult.status === 'PRICE_TAMPERED' && (
              <div className="rounded-xl bg-red-950 p-3 text-xs text-red-300 border border-red-800 font-mono">
                ⚡ VULNERABILITY CONFIRMED: The server blindly accepted the client's submitted price of ₹{submittedPrice}. Item purchased for ₹{submittedPrice} instead of ₹{laptop.price.toLocaleString()}!
              </div>
            )}

            {mode === 'secure' && (
              <div className="rounded-xl bg-emerald-950 p-3 text-xs text-emerald-300 border border-emerald-800 font-mono">
                🟢 DEFENSE CONFIRMED: Server ignored client price input ₹{submittedPrice} and calculated price using database table record ₹{laptop.price.toLocaleString()}.
              </div>
            )}
          </div>
        )}

        {/* Order History Log */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 font-mono">
            Transaction History ({orders.length} orders)
          </h4>

          {orders.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-gray-500 text-xs">
              <ShoppingCart className="h-6 w-6 mb-2 opacity-30" />
              <p>No checkout transactions executed yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto font-mono text-xs">
              {orders.map((o) => (
                <div
                  key={o.orderId}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    o.status === 'PRICE_TAMPERED'
                      ? 'border-red-900 bg-red-950/30 text-red-200'
                      : 'border-gray-800 bg-gray-950 text-gray-200'
                  }`}
                >
                  <div>
                    <span className="font-bold text-white">{o.orderId}</span>
                    <span className="text-gray-400 block text-[11px]">{o.productName}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${o.status === 'PRICE_TAMPERED' ? 'text-red-400' : 'text-emerald-400'}`}>
                      ₹{o.totalPaid.toLocaleString()}
                    </span>
                    <span className="text-gray-500 block text-[10px]">{o.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
