// src/components/Lista/Lista.tsx
import { type ReactNode } from 'react';
import './Lista.css';

interface ListaProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  className?: string;
  itemClassName?: string;
  renderEmpty?: () => ReactNode;
}

const Lista = <T,>({
  items,
  keyExtractor,
  renderItem,
  className = '',
  itemClassName = '',
  renderEmpty,
}: ListaProps<T>) => {
  if (items.length === 0) {
    return renderEmpty ? <>{renderEmpty()}</> : null;
  }

  return (
    <ul className={`lista ${className}`.trim()}>
      {items.map((item) => (
        <li
          key={keyExtractor(item)}
          className={`lista-item ${itemClassName}`.trim()}
        >
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
};

export default Lista;
