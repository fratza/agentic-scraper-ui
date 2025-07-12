/**
 * Interface for product data
 */
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  image: string;
  inStock: boolean;
  tags: string[];
}
