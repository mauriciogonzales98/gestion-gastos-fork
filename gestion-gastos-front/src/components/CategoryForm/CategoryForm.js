import React from "react";
import styles from "./CategoryForm.module.css";

export function CategoryForm() {
  const submitForm = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch('http://localhost:3001/api/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      console.log(response);
      const result = await response.json();
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      console.log("Form submitted successfully:", result);
      alert("Categoría guardada correctamente");
    } catch (error) {
      alert(error.message);
      console.error("Error submitting form:", error);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Category Form</h1>
      <form onSubmit={submitForm} className={styles.form}>
        <div className={styles.fieldGroup}>
          <h4 className={styles.sectionTitle}>Nombre</h4>
          <input 
            type="text" 
            name="name" 
            placeholder="Ingrese el nombre de la categoría" 
            className={styles.input}
          />
        </div>
        
        <div className={styles.fieldGroup}>
          <h4 className={styles.sectionTitle}>Descripción</h4>
          <input 
            type="text" 
            name="description" 
            placeholder="Ingrese una descripción" 
            className={styles.input}
          />
        </div>
        
        {/* este campo hay que borralo */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.sectionTitle}>Id usuario</h4>
          <input 
            type="text" 
            name="userid" 
            placeholder="Ingrese el id del usuario" 
            className={styles.input}
          />
        </div>
        
        <button type="submit" className={styles.submitButton}>
          Guardar
        </button>
      </form>
    </div>
  );
}