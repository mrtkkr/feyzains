import React, { createContext, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { sendApiRequest } from "services/network_service"; // API çağrıları için kullanılan servis

export const ProductContext = createContext();

const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [productsAll, setProductsAll] = useState([]);
  const [productCount, setProductCount] = useState(0);  
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  const productsUrl = "core/products/";
  const productsAllUrl = "core/products/all";
  

  const fetchProducts = useCallback(async ({ page = 1, pageSize = 50, search = "" } = {}) => {
    setLoading(true);
    setError(null);
  
    try {
      const res = await sendApiRequest({
        url: `${productsUrl}?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`,
        method: "GET",
      });
  
      if (res.response.status === 200) {
        setProducts(res.data.results || []);
        setProductCount(res.data.count || 0);
      } else {
        setError("Ürünler alınırken bir hata oluştu.");
        console.error("Failed to fetch products:", res.response);
      }
    } catch (error) {
      setError("API çağrısı başarısız oldu.");
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductsAll = useCallback(async () => {
      setLoading(true);
      setError(null);
    
      try {
        const res = await sendApiRequest({ url: productsAllUrl, method: "GET" });
        if (res.response.status === 200) {
          setProductsAll(res.data || []);
          return res.data;
        } else {
          setError("Ürünler alınırken bir hata oluştu.");
          console.error("Failed to fetch all products:", res.response);
        }
      } catch (error) {
        setError("API çağrısı başarısız oldu.");
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }, []);

  const createProduct = async (data) => {
      setError(null);
      try {
        const res = await sendApiRequest({ url: productsUrl, method: "POST", body: data });
        if (res.response.status === 201) {
          setProducts((prevProducts) => [res.data.product, ...prevProducts]);
          return { 
            success: true, 
            message: res.data.message,
            product: res.data.product 
          };
        } else {
          const errorMessage = res.data?.message || "Yeni ürün eklenemedi.";
          setError(errorMessage);
          return { 
            success: false, 
            error: errorMessage 
          };
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Ürün eklenirken bir hata oluştu.";
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage 
        };
      }
    };
    
    // Ürün Güncelle (PUT)
    const updateProduct = async (data) => {
      setError(null);
      try {
        const res = await sendApiRequest({ url: productsUrl, method: "PUT", body: data });
        if (res.response.status === 200) {
          setProducts((prevProducts) =>
            prevProducts.map((product) => (product.id === data.id ? res.data.product : product))
          );
          return { 
            success: true, 
            message: res.data.message,
            product: res.data.product 
          };
        } else if (res.response.status === 400) {
          const errorMessage = res.data?.message || "Ürün güncellenemedi.";
          setError(errorMessage);
          return { 
            success: false, 
            error: errorMessage 
          };
        } else if (res.response.status === 404) {
          setError("Ürün bulunamadı.");
          return { 
            success: false, 
            error: "Ürün bulunamadı." 
          };
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Ürün güncellenirken bir hata oluştu.";
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage 
        };
      }
    };

  const deleteProduct = async (id) => {
      setError(null);
      try {
        const res = await sendApiRequest({ url: productsUrl, method: "DELETE", body: { id }  });
        console.log("Full API Response:", res);
        if (res.data?.success) {
          setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
          return res.data;
        } else {
          setError("Ürün silinemedi.");
          console.error("Failed to delete product:", res.response);
          return { error: "Failed to delete product" };
        }
      } catch (error) {
        setError("Ürün silinirken bir hata oluştu.");
        console.error("Failed to delete product:", error);
        return error;
      }
    };

    useEffect(() => {
        fetchProducts();
      }, [fetchProducts]);

  

  return (
    <ProductContext.Provider
      value={{
        products,
        productsAll,
        productCount,
        loading,
        error,
        fetchProducts,
        fetchProductsAll,
        createProduct,
        deleteProduct,
        updateProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

ProductProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProductProvider;
