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
};

const CategoryIcon = ({ iconName, size = 20, color = "currentColor", className = "" }) => {
  const IconComponent = iconMap[iconName];
  
  if (!IconComponent) {
    console.warn(`Icono no encontrado: ${iconName}`);
    return <FaIcons.FaQuestionCircle size={size} color={color} className={className} />;
  }
  
  return <IconComponent size={size} color={color} className={className} />;
};

export default CategoryIcon;