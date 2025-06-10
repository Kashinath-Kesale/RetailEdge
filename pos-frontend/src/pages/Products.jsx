import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import AddProduct from "../components/AddProduct";
import EditProduct from "../components/EditProduct";
import axiosInstance from "../api/axiosInstance";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [role] = useState("admin"); // Replace with actual role from auth context later

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("/products");
      const productsData = Array.isArray(response.data)
        ? response.data
        : response.data.products || [];
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts([]);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axiosInstance.delete(`/products/${productId}`);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Products</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
            {role === "admin" && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm font-medium whitespace-nowrap"
              >
                <FiPlus className="text-lg" />
                Add Product
              </button>
            )}
          </div>
        </div>

        {showAddForm && role === "admin" && (
          <div className="mb-6">
            <AddProduct
              onSuccess={() => {
                fetchProducts();
                setShowAddForm(false);
              }}
              onClose={() => setShowAddForm(false)}
            />
          </div>
        )}

        {showEditForm && role === "admin" && selectedProduct && (
          <div className="mb-6">
            <EditProduct
              product={selectedProduct}
              onSuccess={() => {
                fetchProducts();
                setShowEditForm(false);
                setSelectedProduct(null);
              }}
              onClose={() => {
                setShowEditForm(false);
                setSelectedProduct(null);
              }}
            />
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-6 text-center text-gray-500 text-base">
              No products found
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Stock</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">
                            {product.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {product.category}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                            ₹{product.price}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                            {product.quantity}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowEditForm(true);
                                }}
                                className="text-blue-500 hover:text-blue-700 p-1"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
