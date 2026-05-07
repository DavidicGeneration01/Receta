import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Pharmacy = () => {
  const { pharmacyId } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderInfo, setOrderInfo] = useState({ deliveryOption: 'pickup', deliveryAddress: '', customerName: '', customerPhone: '' });

  useEffect(() => {
    fetchPharmacy();
  }, [pharmacyId]);

  // fetch products once pharmacy is loaded
  useEffect(() => {
    if (pharmacy) fetchProducts();
  }, [pharmacy]);

  const fetchPharmacy = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/pharmacy/list`);
      if (data.success) {
        const found = data.pharmacies.find((p) => p._id === pharmacyId);
        if (found) setPharmacy(found);
        else toast.error("Pharmacy not found");
      }
    } catch {
      toast.error("Failed to load pharmacy");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/pharmacy-product/${pharmacyId}`);
      if (data.success) setProducts(data.products);
    } catch (err) {
      // no-op
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading pharmacy details...</p>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-4xl mb-4">💊</p>
          <p className="text-gray-500 mb-4">Pharmacy not found.</p>
          <button
            onClick={() => navigate("/pharmacies")}
            className="text-indigo-600 underline"
          >
            Back to Pharmacies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/pharmacies")}
          className="text-sm text-indigo-600 hover:underline mb-6 flex items-center gap-1"
        >
          ← Back to Pharmacies
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Logo / Icon */}
          {pharmacy.logo ? (
            <img
              src={pharmacy.logo}
              alt={pharmacy.name}
              className="w-20 h-20 rounded-xl object-contain mb-6"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-indigo-50 flex items-center justify-center text-4xl mb-6">
              💊
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-800 mb-1">{pharmacy.name}</h1>

          <div className="mt-6 space-y-4 text-sm text-gray-600">
            {pharmacy.address && (
              <div className="flex items-start gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">Address</p>
                  <p>{pharmacy.address}</p>
                </div>
              </div>
            )}
            {pharmacy.phone && (
              <div className="flex items-start gap-3">
                <span className="text-lg">📞</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">Phone</p>
                  <a href={`tel:${pharmacy.phone}`} className="text-indigo-600 hover:underline">
                    {pharmacy.phone}
                  </a>
                </div>
              </div>
            )}
            {pharmacy.email && (
              <div className="flex items-start gap-3">
                <span className="text-lg">✉️</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">Email</p>
                  <a href={`mailto:${pharmacy.email}`} className="text-indigo-600 hover:underline">
                    {pharmacy.email}
                  </a>
                </div>
              </div>
            )}
            {pharmacy.operatingHours && (
              <div className="flex items-start gap-3">
                <span className="text-lg">🕐</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">
                    Operating Hours
                  </p>
                  <p>{pharmacy.operatingHours}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50">
            <p className="text-xs text-gray-400 text-center">
              Present your doctor's prescription at this pharmacy to fill your medication.
            </p>

            {/* Products */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Available Drugs</h2>
              {products.length === 0 ? (
                <p className="text-sm text-gray-500">No products listed for this pharmacy.</p>
              ) : (
                <div className="space-y-3">
                  {products.map((prod) => {
                    const isSelected = selectedProducts.find((s) => s._id === prod._id);
                    return (
                      <div key={prod._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{prod.productName}</p>
                          <p className="text-xs text-gray-500">{prod.manufacturer}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">₦{prod.price.toLocaleString()}</span>
                          <button
                            onClick={() => {
                              setSelectedProducts((prev) =>
                                prev.find((p) => p._id === prod._id) ? prev.filter((p) => p._id !== prod._id) : [...prev, prod]
                              );
                            }}
                            className={`px-3 py-1 rounded ${isSelected ? 'bg-red-100 text-red-700' : 'bg-indigo-600 text-white'}`}
                          >
                            {isSelected ? 'Remove' : 'Add'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedProducts.length > 0 && (
                <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">₦{selectedProducts.reduce((s,p)=>s+p.price,0).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={()=>setShowOrderForm(true)}
                    className="mt-3 w-full bg-indigo-600 text-white py-2 rounded"
                  >
                    Proceed to Order
                  </button>
                </div>
              )}

              {/* Order form modal-like section */}
              {showOrderForm && (
                <div className="mt-4 p-4 border rounded-lg bg-white">
                  <h3 className="font-semibold mb-2">Order Details</h3>
                  <div className="space-y-2">
                    <label className="block text-sm">Name</label>
                    <input value={orderInfo.customerName} onChange={(e)=>setOrderInfo({...orderInfo, customerName: e.target.value})} className="w-full border p-2 rounded" />
                    <label className="block text-sm">Phone</label>
                    <input value={orderInfo.customerPhone} onChange={(e)=>setOrderInfo({...orderInfo, customerPhone: e.target.value})} className="w-full border p-2 rounded" />
                    <label className="block text-sm">Delivery option</label>
                    <select value={orderInfo.deliveryOption} onChange={(e)=>setOrderInfo({...orderInfo, deliveryOption: e.target.value})} className="w-full border p-2 rounded">
                      <option value="pickup">Pickup</option>
                      <option value="delivery">Delivery</option>
                    </select>
                    {orderInfo.deliveryOption === 'delivery' && (
                      <>
                        <label className="block text-sm">Delivery address</label>
                        <input value={orderInfo.deliveryAddress} onChange={(e)=>setOrderInfo({...orderInfo, deliveryAddress: e.target.value})} className="w-full border p-2 rounded" />
                      </>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button onClick={()=>setShowOrderForm(false)} className="px-3 py-2 border rounded">Cancel</button>
                      <button onClick={async ()=>{
                        // create order
                        try{
                          const items = selectedProducts.map(p=>({ productId: p._id, name: p.productName, price: p.price, qty: 1 }));
                          const total = selectedProducts.reduce((s,p)=>s+p.price,0);
                          const payload = { pharmacyId: pharmacy._id, items, total, deliveryOption: orderInfo.deliveryOption, deliveryAddress: orderInfo.deliveryAddress, customerName: orderInfo.customerName, customerPhone: orderInfo.customerPhone, logisticAgent: pharmacy.logisticAgent || '' };
                          const { data } = await axios.post(`${backendUrl}/api/order/create`, payload);
                          if (data.success) {
                            toast.success('Order created');
                            setSelectedProducts([]);
                            setShowOrderForm(false);
                          } else {
                            toast.error('Failed to create order');
                          }
                        } catch (err) {
                          toast.error('Failed to create order');
                        }
                      }} className="px-3 py-2 bg-indigo-600 text-white rounded">Place Order</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;