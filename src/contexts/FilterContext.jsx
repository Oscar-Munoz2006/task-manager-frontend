import { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [filterStatus, setFilterStatus] = useState("todas");
  const [filterPriority, setFilterPriority] = useState("todas");
  const [filterDate, setFilterDate] = useState("todas");

  return (
    <FilterContext.Provider
      value={{
        filterStatus,
        setFilterStatus,
        filterPriority,
        setFilterPriority,
        filterDate,
        setFilterDate,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
