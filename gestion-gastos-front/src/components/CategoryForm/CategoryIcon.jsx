// components/CategoryIcon.jsx
import React from 'react';
import * as FaIcons from 'react-icons/fa';

// Mapeo de nombres de iconos a componentes
const iconMap = {
  'FaUtensils': FaIcons.FaUtensils,
  'FaHome': FaIcons.FaHome,
  'FaCar': FaIcons.FaCar,
  'FaHeartbeat': FaIcons.FaHeartbeat,
  'FaGamepad': FaIcons.FaGamepad,
  'FaNewspaper': FaIcons.FaNewspaper,
  'FaTshirt': FaIcons.FaTshirt,
  'FaBook': FaIcons.FaBook,
  'FaPlane': FaIcons.FaPlane,
  'FaBox': FaIcons.FaBox,
  'FaPizzaSlice': FaIcons.FaPizzaSlice,
  'FaLaptop': FaIcons.FaLaptop,
  'FaGift': FaIcons.FaGift,
  'FaFutbol': FaIcons.FaFutbol,
  'FaSprayCan': FaIcons.FaSprayCan,
  'FaDog': FaIcons.FaDog,
  'FaShieldAlt': FaIcons.FaShieldAlt,
  'FaFileInvoiceDollar': FaIcons.FaFileInvoiceDollar,
  'FaShoppingCart': FaIcons.FaShoppingCart,
  'FaCoffee': FaIcons.FaCoffee,
  'FaAppleAlt': FaIcons.FaAppleAlt,
  'FaWineBottle': FaIcons.FaWineBottle,
  'FaCookieBite': FaIcons.FaCookieBite,
  
  // GASTOS - Transporte
  'FaBus': FaIcons.FaBus,
  'FaGasPump': FaIcons.FaGasPump,
  'FaTaxi': FaIcons.FaTaxi,
  'FaBicycle': FaIcons.FaBicycle,
  'FaTrain': FaIcons.FaTrain,
  'FaSubway': FaIcons.FaSubway,
  
  // GASTOS - Entretenimiento
  'FaFilm': FaIcons.FaFilm,
  'FaMusic': FaIcons.FaMusic,
  'FaTv': FaIcons.FaTv,
  'FaTheaterMasks': FaIcons.FaTheaterMasks,
  'FaTicketAlt': FaIcons.FaTicketAlt,
  
  // GASTOS - Compras
  'FaShoppingBag': FaIcons.FaShoppingBag,
  'FaTshirt': FaIcons.FaTshirt,
  'FaMobileAlt': FaIcons.FaMobileAlt,
  'FaGem': FaIcons.FaGem,
  'FaShoePrints': FaIcons.FaShoePrints,
  
  // GASTOS - Salud
  'FaHospital': FaIcons.FaHospital,
  'FaPills': FaIcons.FaPills,
  'FaHeart': FaIcons.FaHeart,
  'FaRunning': FaIcons.FaRunning,
  'FaFirstAid': FaIcons.FaFirstAid,
  
  // GASTOS - Hogar
  'FaCouch': FaIcons.FaCouch,
  'FaToolbox': FaIcons.FaToolbox,
  'FaLightbulb': FaIcons.FaLightbulb,
  'FaShower': FaIcons.FaShower,
  'FaWarehouse': FaIcons.FaWarehouse,
  
  // GASTOS - Educación
  'FaGraduationCap': FaIcons.FaGraduationCap,
  'FaPencilAlt': FaIcons.FaPencilAlt,
  'FaBookOpen': FaIcons.FaBookOpen,
  'FaUniversity': FaIcons.FaUniversity,
  
  // GASTOS - Servicios
  'FaWifi': FaIcons.FaWifi,
  'FaMobile': FaIcons.FaMobile,
  'FaTint': FaIcons.FaTint,
  'FaBolt': FaIcons.FaBolt,
  
  // INGRESOS
  'FaMoneyBillWave': FaIcons.FaMoneyBillWave,
  'FaDollarSign': FaIcons.FaDollarSign,
  'FaPiggyBank': FaIcons.FaPiggyBank,
  'FaChartLine': FaIcons.FaChartLine,
  'FaBriefcase': FaIcons.FaBriefcase,
  'FaUserTie': FaIcons.FaUserTie,
  'FaHandHoldingUsd': FaIcons.FaHandHoldingUsd,
  'FaCashRegister': FaIcons.FaCashRegister,
  'FaCreditCard': FaIcons.FaCreditCard,
  'FaWallet': FaIcons.FaWallet,
  
  // VARIOS
  'FaGift': FaIcons.FaGift,
  'FaUmbrellaBeach': FaIcons.FaUmbrellaBeach,
  'FaBaby': FaIcons.FaBaby,
  'FaPaw': FaIcons.FaPaw,
  'FaTree': FaIcons.FaTree,
  'FaChurch': FaIcons.FaChurch,
  'FaQuestionCircle': FaIcons.FaQuestionCircle,
};

export const allIcons = Object.keys(iconMap);

const CategoryIcon = ({ iconName, size = 20, color = "currentColor", className = "" }) => {
  const IconComponent = iconMap[iconName];
  
  if (!IconComponent) {
    console.warn(`Icono no encontrado: ${iconName}`);
    return <FaIcons.FaQuestionCircle size={size} color={color} className={className} />;
  }
  
  return <IconComponent size={size} color={color} className={className} />;
};

export default CategoryIcon;