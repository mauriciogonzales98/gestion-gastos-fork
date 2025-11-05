import { useState, useEffect } from "react";
import styles from "./OperationList.module.css";
import deleteOperation from "./operationDelete/OperationDeleteManager.jsx";
import OperationUpdateForm, {
  updateOperation,
} from "./operationUpdate/OperationUpdateManager.jsx";
import { useToken } from "../../Contexts/fbTokenContext/TokenContext.jsx";

import TagSelector from "../Tag/TagSelector.jsx";
import {
  loadEnrichedOperations,
  loadOperations,
} from "./operationCreate/OperationEnrichManager.jsx";

// import CategoryButtons from "../Category/CategoryForm/CategoryButtons.jsx";
// import CategoryList from "../Category/CategoryForm/CategoryList.jsx";
import CategoryDropdown from "../Category/CategoryForm/CategoryDropdown.jsx";

const OperationList = ({
  selectedWalletId,
  onChange,
  doRefreshOperations,
  setDoRefreshOperations,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  //Estado de borrado
  const [isDeleting, setIsDeleting] = useState();
  // Estados para la edición
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  // auth token
  const { token, refreshToken } = useToken();

  // Lista de todas las operaciones del usuario
  const [operations, setOperations] = useState([]);

  // Categoría seleccionada para el filtro
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);

  // Manejo de fechas desde y hasta para el filtro
  const [selectedDates, setSelectedDates] = useState({});

  // Tag seleccionado para el filtro
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [showOperationList, setShowOperationList] = useState(true);
  const dates = {
    from: selectedDates.from,
    to: selectedDates.to,
  };
  const handleDateChange = (field, value) => {
    //Valores actuales de from y to
    const currentFrom = selectedDates.from || "";
    const currentTo = selectedDates.to || "";
    console.log("Handling change...");
    //Evita que la fecha de inicio sea mayor a la de fin
    // y que la de fin sea menor a la de inicio, colocando el último campo que se intenta seleccionar en null
    console.log("Valores que entran: ", field, " ", value);
    console.log("Valores actuales: ", currentFrom, currentTo);
    if (
      (currentFrom && field == "to" && value < currentFrom) ||
      (currentTo && field == "from" && value > currentTo)
    ) {
      console.log("fecha inválida");
      setErrorMessage("Error: Intervalo de fechas inválido. ");
      setSelectedDates((prev) => ({ ...prev, [field]: " " }));
      return;
    }
    console.log("Fecha válida");
    setSelectedDates((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Función que refresca las operaciones
  const refreshOperations = async () => {
    if (!selectedWalletId) return;
    try {
      const enrichedOperations = await loadEnrichedOperations(
        selectedWalletId,
        token
      );
      setOperations(enrichedOperations);
    } catch (err) {
      console.log("Error refreshing operations:", err);
      setOperations([]);
    }
  };
  if (doRefreshOperations) {
    refreshOperations();
    setDoRefreshOperations(false);
  }
  //Cuando se selecciona una wallet, carga todas las operaciones, cargando las categorías e insertandolas en el objeto
  const operationsLoader = async () => {
    if (selectedWalletId) {
      try {
        const enrichedOperations = await loadEnrichedOperations(
          selectedWalletId,
          token
        );
        setOperations(enrichedOperations.reverse());
        // DEBUG
        console.log(
          "Operaciones seleccionadas en operationsLoader:",
          enrichedOperations
        );
      } catch (err) {
        console.log("Error cargando operaciones enriqucidas al main", err);
        setOperations([]);
      }
    }
  };
  useEffect(() => {
    operationsLoader();
  }, [selectedWalletId, token]);

  if (!Array.isArray(operations) || operations.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2 className={styles.emptyTitle}>Lista de Operaciones</h2>
        <p className={styles.emptyText}>No hay operaciones para mostrar</p>
      </div>
    );
  }
  // Maneja el filtrado de las operaciones
  const filterOperationList = () => {
    const normalizedCategoryId = (() => {
      if (
        selectedCategoryId === null ||
        selectedCategoryId === undefined ||
        selectedCategoryId === ""
      ) {
        return 0; // default: show all
      }
      const n = Number(selectedCategoryId);
      return Number.isNaN(n) ? 0 : n;
    })();
    return operations.filter((operation) => {

      //Filtrado por categorías
      const categoryFilter = () => {
        // 0 => all categories, -1 => unassigned (Sin Categoría)
        if (normalizedCategoryId === 0) return true;
        if (normalizedCategoryId === -1) return operation.categoryid == null;
        return operation.categoryid === normalizedCategoryId;
      };
      // Filtrado por fecha desde
      const fromDateFilter = () => {
        if (!dates.from || dates.from == " ") return true;
        const opDate = new Date(operation.date).toISOString().split('T')[0];
        console.log("date from: ", opDate >= dates.from);
        return opDate >= dates.from;
      };
      // Filtrado por fecha hasta
      const toDateFilter = () => {
        if (!dates.to || dates.to == " ") return true;
        const opDate = new Date(operation.date).toISOString().split('T')[0];
        console.log("Date to: ", opDate <= dates.to);
        return opDate <= dates.to;
      };

      //Filtrado por tag
 const tagFilter = () => {
      if (selectedTagId === null || selectedTagId === undefined || selectedTagId === "") return true;
      const n = Number(selectedTagId);
      if (Number.isNaN(n)) return true;
      if (n === -1) 
        return operation.tagid === null || operation.tagid === undefined;
      
      return Number(operation.tagid) === n;
      
    };
      return categoryFilter() && fromDateFilter() && toDateFilter()  && tagFilter() ;
    });
  };

  const filteredOperations = filterOperationList();
  // Maneja el borrado de operaciones
  const handleDelete = async (operation, token) => {
    if (!token) {
      try {
        token = await refreshToken();
      } catch (error) {}
    }
    const amount = Number(operation.amount);
    setIsDeleting(true);
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar la operación "${
          operation.description
        }" por $${amount.toFixed(2)}?`
      )
    ) {
      try {
        await deleteOperation(operation.id, token);
        setIsDeleting(false);
        if (onChange) onChange();
      } catch (err) {
        setIsDeleting(false);
      }
    }
    if (window.close) {
      setIsDeleting(false);
    }
  };
  // Inicia el modo de edición, llamando al componente OperationUpdateForm
  const handleDoubleClick = (operation) => {
    setEditingId(operation.id);
    setEditedValues({
      description: operation.description || "",
      amount: operation.amount.toString(),
      category: operation.category?.id || null,
      date: operation.date.split("T")[0], // Format for date input
      type: operation.type,
      walletid: operation.wallet,
    });
  };

  return (
    <div className={styles.container}>
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

      <h2 className={styles.title}>
        Cantidad de Operaciones ({operations.length})
      </h2>

      {/* Sección de Filtros - ESTILOS MEJORADOS */}
      <div className={styles.filterSection}>
        <div className={styles.filterGrid}>
          {/* Filtro por Categoría */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Categoría</label>
            <div className={styles.categoryDropdown}>
              <CategoryDropdown
                selectedId={selectedCategoryId}
                onSelect={setSelectedCategoryId}
              />
            </div>
          </div>

          {/* Filtro por Fecha Desde */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Fecha Desde</label>
            <input
              type="date"
              value={selectedDates.from || ""}
              onKeyDown={(e) => e.preventDefault()}
              onChange={(e) => handleDateChange("from", e.target.value)}
              className={styles.filterInput}
            />
          </div>

          {/* Filtro por Fecha Hasta */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Fecha Hasta</label>
            <input
              type="date"
              value={selectedDates.to || ""}
              onKeyDown={(e) => e.preventDefault()}
              onChange={(e) => handleDateChange("to", e.target.value)}
              className={styles.filterInput}
            />
          </div>

          {/* Filtro por Tag */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Etiqueta</label>
            <div className={styles.tagSelector}>
              <TagSelector
                selectedTagId={selectedTagId}
                onTagSelect={setSelectedTagId}
                token={token}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Acá arranca el mapeo de la lista de operaciones */}
      <ul className={styles.list}>
        {filteredOperations.map((operation) => (
          <li
            key={operation.id}
            className={`${styles.operationItem} ${
              operation.type === "gasto" ? styles.expense : ""
            } ${editingId === operation.id ? styles.editing : ""}`}
            onDoubleClick={() => {
              handleDoubleClick(operation);
            }}
          >
            {editingId === operation.id ? (
              // Modo edición
              <OperationUpdateForm
                editingId={editingId}
                setEditingId={setEditingId}
                editedValues={editedValues}
                setEditedValues={setEditedValues}
                onChange={onChange}
              />
            ) : (
              // Modo display
              <>
                <div className={styles.operationContent}>
                  <div className={styles.operationDescription}>
                    {operation.description || "Sin descripción"}
                  </div>
                  <div className={styles.operationDetails}>
                    <span
                      className={`${styles.operationAmount} ${
                        operation.type === "gasto" ? styles.expense : ""
                      }`}
                    >
                      ${operation.amount}
                    </span>
                    {operation.category && (
                      <span className={styles.operationCategory}>
                        📁 {operation.category.name}
                      </span>
                    )}
                    <span className={styles.operationDate}>
                      📅 {new Date(operation.date).toLocaleDateString("es-ES")}
                    </span>
                    <span
                      className={`${styles.operationType} ${
                        operation.type === "gasto" ? styles.expense : ""
                      }`}
                    >
                      {operation.type === "ingreso" ? "INGRESO" : "GASTO"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleDelete(operation, token);
                  }}
                  disabled={isDeleting}
                  className={styles.deleteButton}
                >
                  {isDeleting ? "⏳ Eliminando..." : "🗑️ Eliminar"}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default OperationList;