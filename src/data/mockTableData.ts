import { Product } from '../model';

/**
 * Mock product data for development and testing
 */
export const mockProductData: Product[] = [
  {
    id: 1,
    title: "iPhone 15 Pro",
    description: "Apple's latest flagship smartphone with A17 Pro chip and titanium design",
    price: 999.99,
    rating: 4.8,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1696448442129-8c6b081e9b63",
    inStock: true,
    tags: ["smartphone", "apple", "premium"]
  },
  {
    id: 2,
    title: "Samsung Galaxy S24 Ultra",
    description: "Samsung's premium smartphone with advanced AI features and S-Pen",
    price: 1199.99,
    rating: 4.7,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1707320576177-3f7a7e608309",
    inStock: true,
    tags: ["smartphone", "samsung", "premium"]
  },
  {
    id: 3,
    title: "Sony WH-1000XM5",
    description: "Industry-leading noise cancelling wireless headphones with exceptional sound quality",
    price: 349.99,
    rating: 4.9,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb",
    inStock: true,
    tags: ["headphones", "sony", "noise-cancelling"]
  },
  {
    id: 4,
    title: "MacBook Pro 16-inch",
    description: "Powerful laptop for professionals with M3 Pro/Max chip",
    price: 2499.99,
    rating: 4.8,
    category: "Computers",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    inStock: false,
    tags: ["laptop", "apple", "premium"]
  },
  {
    id: 5,
    title: "Kindle Paperwhite",
    description: "E-reader with adjustable warm light and waterproof design",
    price: 139.99,
    rating: 4.6,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1544631006-71a1f1a3d1f8",
    inStock: true,
    tags: ["e-reader", "amazon", "books"]
  },
  {
    id: 6,
    title: "Dyson V15 Detect",
    description: "Cordless vacuum with laser dust detection and powerful suction",
    price: 699.99,
    rating: 4.7,
    category: "Home Appliances",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001",
    inStock: true,
    tags: ["vacuum", "dyson", "home"]
  },
  {
    id: 7,
    title: "Nintendo Switch OLED",
    description: "Gaming console with vibrant OLED display and enhanced audio",
    price: 349.99,
    rating: 4.8,
    category: "Gaming",
    image: "https://images.unsplash.com/photo-1617096200347-cb04ae810b1d",
    inStock: true,
    tags: ["console", "nintendo", "gaming"]
  },
  {
    id: 8,
    title: "LG C3 OLED 65-inch TV",
    description: "Premium OLED TV with perfect blacks and Dolby Vision",
    price: 1799.99,
    rating: 4.9,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1",
    inStock: true,
    tags: ["tv", "lg", "oled"]
  }
];

/**
 * Mock XML data for development and testing
 */
export const mockXMLData = [
  {
    id: "item-1",
    name: "Product Listing",
    category: "Electronics",
    attributes: {
      brand: "Apple",
      model: "iPhone 15",
      year: "2023"
    },
    price: "$999.99",
    availability: "In Stock"
  },
  {
    id: "item-2",
    name: "Service Package",
    category: "Subscription",
    attributes: {
      provider: "Netflix",
      plan: "Premium",
      period: "Monthly"
    },
    price: "$19.99",
    availability: "Available"
  },
  {
    id: "item-3",
    name: "Digital Content",
    category: "Software",
    attributes: {
      developer: "Adobe",
      product: "Photoshop",
      license: "Annual"
    },
    price: "$239.88",
    availability: "Digital Download"
  }
];

/**
 * Mock form data for development and testing
 */
export const mockFormData = {
  url: "https://example.com/products",
  selector: ".product-card",
  fields: [
    { name: "title", selector: ".product-title", attribute: "text" },
    { name: "price", selector: ".product-price", attribute: "text" },
    { name: "image", selector: ".product-image", attribute: "src" },
    { name: "rating", selector: ".product-rating", attribute: "data-rating" }
  ]
};

/**
 * Mock template data for development and testing
 */
export const mockTemplateData = [
  {
    templateName: "E-commerce Product",
    fields: ["title", "price", "description", "image", "rating", "category"],
    example: mockProductData[0]
  },
  {
    templateName: "News Article",
    fields: ["headline", "author", "publishDate", "content", "category", "tags"],
    example: {
      headline: "New Technology Breakthrough Announced",
      author: "Jane Smith",
      publishDate: "2025-07-10",
      content: "Scientists have announced a major breakthrough in quantum computing...",
      category: "Technology",
      tags: ["quantum", "computing", "research"]
    }
  },
  {
    templateName: "Real Estate Listing",
    fields: ["address", "price", "bedrooms", "bathrooms", "squareFeet", "images", "features"],
    example: {
      address: "123 Main Street, Anytown, USA",
      price: 450000,
      bedrooms: 3,
      bathrooms: 2.5,
      squareFeet: 2200,
      images: ["https://images.unsplash.com/photo-1518780664697-55e3ad937233"],
      features: ["Garage", "Pool", "Updated Kitchen"]
    }
  }
];
