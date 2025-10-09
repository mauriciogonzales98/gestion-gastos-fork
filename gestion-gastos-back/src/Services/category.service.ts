// services/category.service.ts
import { User } from "../User/user.entity.js";
import { Category } from "../Category/category.entity.js";

export class CategoryService {
  static defaultCategories = [
    // Gastos esenciales
    { name: 'Alimentación', icon: 'FaUtensils', description: 'Supermercado, restaurantes, comida' },
    { name: 'Casa', icon: 'FaHome', description: 'Alquiler, hipoteca, servicios básicos' },
    { name: 'Transporte', icon: 'FaCar', description: 'Combustible, transporte público, mantenimiento' },
    { name: 'Salud', icon: 'FaHeartbeat', description: 'Medicamentos, consultas médicas, seguros' },
    { name: 'Ropa', icon: 'FaTshirt', description: 'Prendas de vestir, calzado, accesorios' },
    
    // Entretenimiento y servicios
    { name: 'Ocio', icon: 'FaGamepad', description: 'Cine, videojuegos, actividades recreativas' },
    { name: 'Subscripción', icon: 'FaNewspaper', description: 'Streaming, apps, servicios digitales' },
    { name: 'Restaurante', icon: 'FaPizzaSlice', description: 'Comidas fuera de casa, delivery' },
    { name: 'Viajes', icon: 'FaPlane', description: 'Vacaciones, hoteles, turismo' },
    
    // Educación y desarrollo
    { name: 'Educación', icon: 'FaBook', description: 'Cursos, libros, materiales educativos' },
    { name: 'Tecnología', icon: 'FaLaptop', description: 'Electrónicos, software, gadgets' },
    
    // Varios
    { name: 'Regalos', icon: 'FaGift', description: 'Regalos, donaciones, ayudas' },
    { name: 'Deportes', icon: 'FaFutbol', description: 'Actividades deportivas, gimnasio' },
    { name: 'Belleza', icon: 'FaSprayCan', description: 'Cuidado personal, cosméticos' },
    { name: 'Mascotas', icon: 'FaDog', description: 'Veterinario, comida, cuidados' },
    { name: 'Seguros', icon: 'FaShieldAlt', description: 'Seguros varios' },
    { name: 'Impuestos', icon: 'FaFileInvoiceDollar', description: 'Impuestos y tasas' },
    { name: 'Otros', icon: 'FaBox', description: 'Gastos varios no categorizados' }
  ];

  static async createDefaultCategories(em: any, user: User) {
    const categories = [];
    
    for (const categoryData of this.defaultCategories) {
      const category = em.create(Category, {
        ...categoryData,
        user: user
      });
      categories.push(category);
    }
    
    await em.flush();
    return categories;
  }

  static async getCategoriesByUser(em: any, userId: string) {
    return em.find(Category, {user: { id : userId }});
  }
}