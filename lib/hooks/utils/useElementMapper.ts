/**
 * Custom hook for managing element arrays in mapper components
 * Extracted to improve separation of concerns and reusability
 */

import { useCallback } from "react";

/**
 * Generic hook for managing arrays of elements
 */
export function useElementMapper<T>(
  elements: T[],
  onElementsChange: (elements: T[]) => void,
  createEmptyElement: () => T
) {
  const handleAddElement = useCallback(() => {
    onElementsChange([...elements, createEmptyElement()]);
  }, [elements, onElementsChange, createEmptyElement]);

  const handleRemoveElement = useCallback(
    (index: number) => {
      const newElements = elements.filter((_, i) => i !== index);
      onElementsChange(newElements);
    },
    [elements, onElementsChange]
  );

  const handleElementChange = useCallback(
    (index: number, updates: Partial<T>) => {
      const newElements = [...elements];
      newElements[index] = { ...newElements[index], ...updates };
      onElementsChange(newElements);
    },
    [elements, onElementsChange]
  );

  const handleFieldChange = useCallback(
    <K extends keyof T>(index: number, field: K, value: T[K]) => {
      const newElements = [...elements];
      newElements[index] = { ...newElements[index], [field]: value };
      onElementsChange(newElements);
    },
    [elements, onElementsChange]
  );

  return {
    handleAddElement,
    handleRemoveElement,
    handleElementChange,
    handleFieldChange,
  };
}

