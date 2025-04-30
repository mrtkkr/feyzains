import React, { createContext, useState } from "react";
import { sendApiRequest } from "../../services/network_service.js";

export const SnippetContext = createContext();

const snippetApiUrl = "snippets/";

export const SnippetProvider = ({ children }) => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Snippetleri Getir (GET)
  const fetchSnippets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({ url: snippetApiUrl, method: "GET" });
      if (res.response.status === 200) {
        setSnippets(res.data);
      } else {
        setError("Snippetler getirilemedi.");
        console.error("Failed to fetch snippets:", res.response);
      }
    } catch (error) {
      setError("Snippetler getirilirken bir hata oluştu.");
      console.error("Error fetching snippets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Snippet Oluştur (POST)
  const createSnippet = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: snippetApiUrl, method: "POST", body: data });
      if (res.response.status === 201) {
        setSnippets((prev) => [res.data.snippet, ...prev]);
        return {
          success: true,
          message: res.data.message,
          snippet: res.data.snippet,
        };
      } else {
        const msg = res.data?.message || "Snippet oluşturulamadı.";
        setError(msg);
        return { success: false, error: msg };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Snippet oluşturulurken bir hata oluştu.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Snippet Güncelle (PUT)
  const updateSnippet = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: snippetApiUrl, method: "PUT", body: data });
      if (res.response.status === 200) {
        setSnippets((prev) =>
          prev.map((s) => (s.id === data.id ? res.data.snippet : s))
        );
        return {
          success: true,
          message: res.data.message,
          snippet: res.data.snippet,
        };
      } else {
        const msg = res.data?.message || "Snippet güncellenemedi.";
        setError(msg);
        return { success: false, error: msg };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Snippet güncellenirken bir hata oluştu.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Snippet Sil (DELETE)
  const deleteSnippet = async (id) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: snippetApiUrl, method: "DELETE", body: { id } });
      if (res.data?.success) {
        setSnippets((prev) => prev.filter((s) => s.id !== id));
        return res.data;
      } else {
        setError("Snippet silinemedi.");
        return { error: "Snippet silinemedi" };
      }
    } catch (error) {
      setError("Snippet silinirken bir hata oluştu.");
      console.error("Delete snippet error:", error);
      return error;
    }
  };

  return (
    <SnippetContext.Provider
      value={{
        snippets,
        loading,
        error,
        fetchSnippets,
        createSnippet,
        updateSnippet,
        deleteSnippet,
      }}
    >
      {children}
    </SnippetContext.Provider>
  );
};

export default SnippetProvider;
