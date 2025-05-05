import React, { createContext, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { sendApiRequest } from "services/network_service"; // API çağrıları için kullanılan servis

export const ReportContext = createContext();

const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState([]); 
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(false); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata mesajı

  const reportUrl = "core/report/"; // Tek bir API endpoint

  const fetchReports = useCallback(async (filters = {}, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
  
    const params = new URLSearchParams();
    if (filters.seller) params.append("seller", filters.seller);
    if (filters.action_type) params.append("action_type", filters.action_type);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
  
    params.append("page", page);
    params.append("page_size", pageSize);
  
    try {
      const res = await sendApiRequest({
        url: `${reportUrl}?${params.toString()}`,
        method: "GET",
      });
  
      if (res.response.status === 200) {
        setReports(res.data.results || []);
        setReportCount(res.data.count || 0);
        console.log("Fetched reports:", reports);
      } else {
        setError("Rapor alınırken bir hata oluştu.");
        console.error("Failed to fetch report:", res.response);
      }
    } catch (error) {
      setError("API çağrısı başarısız oldu.");
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  
    useEffect(() => {
      fetchReports();
    }, [fetchReports]);

  return (
    <ReportContext.Provider
      value={{
        reports,
        reportCount,
        loading,
        error,
        fetchReports,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

ReportProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ReportProvider;
