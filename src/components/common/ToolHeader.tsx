import React from 'react';
import './ToolHeader.css';

export interface ToolHeaderProps {
  title: string;
  description: string;
  className?: string;
}

/**
 * Unified header component for all tools
 * Provides consistent styling and layout across the application
 */
const ToolHeader: React.FC<ToolHeaderProps> = ({ 
  title, 
  description, 
  className = '' 
}) => {
  return (
    <header className={`tool-header ${className}`}>
      <h1 className="tool-header__title">{title}</h1>
      <p className="tool-header__description">{description}</p>
    </header>
  );
};

export default ToolHeader;