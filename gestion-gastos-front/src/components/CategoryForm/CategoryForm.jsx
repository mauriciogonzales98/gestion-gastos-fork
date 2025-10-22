import React from "react";
import CategoryList from "../CategoryForm/CategoryList";
import styles from "./CategoryForm.module.css";

const CategoryForm = () => {
  console.log("CategoryForm rendered");

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>llegue</h1>
      <CategoryList />
    </div>

  );
};

export default CategoryForm;