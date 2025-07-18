export function CategoryForm() {

  // function onClick(){
  //   console.log("Button clicked");
  //   console.log("me estoy mostrando dos veces");
    
  // }
      
  const submitForm = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    
    try{
      const response = await fetch('http://localhost:3001/api/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // 'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(data)
      })
      
      console.log(response);
      const result = await response.json();
      
      // console.log(result);
      if (!response.ok) throw new Error('Network response was not ok');
      
      console.log("Form submitted successfully:", result);
      alert("Categoría guardada correctamente");
    }
    catch (error) {
      alert(error.message);
      console.error("Error submitting form:", error);
    }
  }

  return (
    <div>
      <h1>Category Form</h1>
      <form onSubmit={submitForm}>
        <h4>Nombre</h4>
        <input type="text" name="name" placeholder="Ingrese el nombre de la categoría" />
        <h4>Descripción</h4>
        <input type="text" name="description" placeholder="Ingrese una descripción" />
        {/* este campo hay que borralo */}
        <h4>Id usuario</h4> 
        <input type="text" name="userid" placeholder="Ingrese el id del usuarip" />
        <span></span>
        <button type="submit" >Guardar</button>
      </form>
      {/* Add form elements here */}
    </div>
  );
}