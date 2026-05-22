import { ReactNode } from "react";

interface ProductGridProps {
  children: ReactNode;
}

export const ProductGrid = ({ children }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
      {children}
    </div>
  );
};
