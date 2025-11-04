import React from 'react';
import styles from './TagBadge.module.css';

const TagBadge = ({ tag, onRemove, size = 'medium', clickable = false, onClick }) => {
  const handleClick = () => {
    if (clickable && onClick) {
      onClick(tag);
    }
  };

  const badgeStyle = {
    backgroundColor: tag.color || '#6c757d',
  };

  const className = [
    styles.badge,
    styles[size],
    clickable ? styles.clickable : '',
    onRemove ? styles.removable : ''
  ].join(' ');

  return (
    <span 
      className={className}
      style={badgeStyle}
      onClick={handleClick}
    >
      <span className={styles.name}>{tag.name}</span>
      {onRemove && (
        <button 
          className={styles.removeButton}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag.id);
          }}
          aria-label={`Eliminar tag ${tag.name}`}
        >
          ×
        </button>
      )}
    </span>
  );
};

export default TagBadge;