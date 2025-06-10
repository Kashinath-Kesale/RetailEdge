import { useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';

const LowStockNotifier = () => {
  useEffect(() => {
    const checkLowStock = async () => {
      try {
        const response = await axiosInstance.get('/products');
        // Handle both possible response formats
        const products = Array.isArray(response.data) ? response.data : 
                        response.data.products ? response.data.products : [];
        
        const lowStockThreshold = 5;
        
        const lowStockProducts = products.filter(product => product.quantity < lowStockThreshold);
        
        if (lowStockProducts.length > 0) {
          // Show individual notifications for each low stock product
          lowStockProducts.forEach(product => {
            toast.warning(
              `Low Stock Alert!\n${product.name}\nRemaining Quantity: ${product.quantity} units`,
              {
                position: "top-right",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          });
        }
      } catch (error) {
        console.error('Error checking low stock:', error);
      }
    };

    // Initial check after 2 minutes of login
    const initialCheck = setTimeout(checkLowStock, 120000);

    // Check every 5 minutes
    const interval = setInterval(checkLowStock, 300000);

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default LowStockNotifier; 