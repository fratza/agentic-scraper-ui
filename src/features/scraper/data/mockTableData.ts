// Mock data for ExtractedDataTable component
export interface MockDataItem {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  inStock: boolean;
  category: string;
  tags: string[];
  imageUrl: string;
  lastUpdated: string;
  vendor: string;
}

export const mockTableData: MockDataItem[] = [
  {
    id: "item-001",
    title: "Professional Camera DSLR",
    description: "High-quality professional DSLR camera with 24.2MP sensor and 4K video recording capabilities.",
    price: 1299.99,
    rating: 4.8,
    inStock: true,
    category: "Electronics",
    tags: ["camera", "photography", "professional"],
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FtZXJhfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
    lastUpdated: "2025-06-15T08:30:00Z",
    vendor: "CameraPro"
  },
  {
    id: "item-002",
    title: "Wireless Noise-Cancelling Headphones",
    description: "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
    price: 349.99,
    rating: 4.7,
    inStock: true,
    category: "Audio",
    tags: ["headphones", "wireless", "noise-cancelling"],
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aGVhZHBob25lc3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80",
    lastUpdated: "2025-06-18T14:45:00Z",
    vendor: "SoundMaster"
  },
  {
    id: "item-003",
    title: "Smart Watch Series 5",
    description: "Advanced smartwatch with health monitoring, GPS, and always-on display.",
    price: 429.99,
    rating: 4.6,
    inStock: false,
    category: "Wearables",
    tags: ["smartwatch", "fitness", "tech"],
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnR3YXRjaHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80",
    lastUpdated: "2025-06-20T09:15:00Z",
    vendor: "TechWear"
  },
  {
    id: "item-004",
    title: "Ultra-thin Laptop Pro",
    description: "Lightweight laptop with 16GB RAM, 512GB SSD, and 14-hour battery life.",
    price: 1499.99,
    rating: 4.9,
    inStock: true,
    category: "Computers",
    tags: ["laptop", "ultrabook", "professional"],
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8bGFwdG9wfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
    lastUpdated: "2025-06-22T16:30:00Z",
    vendor: "TechPro"
  },
  {
    id: "item-005",
    title: "4K Smart TV 55-inch",
    description: "Ultra HD Smart TV with HDR, voice control, and streaming apps built-in.",
    price: 799.99,
    rating: 4.5,
    inStock: true,
    category: "Electronics",
    tags: ["tv", "smart", "4k"],
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dHZ8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80",
    lastUpdated: "2025-06-25T11:20:00Z",
    vendor: "ScreenMaster"
  },
  {
    id: "item-006",
    title: "Wireless Gaming Mouse",
    description: "High-precision wireless gaming mouse with customizable RGB lighting and programmable buttons.",
    price: 89.99,
    rating: 4.7,
    inStock: true,
    category: "Gaming",
    tags: ["mouse", "gaming", "wireless"],
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FtaW5nJTIwbW91c2V8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80",
    lastUpdated: "2025-06-28T13:40:00Z",
    vendor: "GameGear"
  },
  {
    id: "item-007",
    title: "Portable Bluetooth Speaker",
    description: "Waterproof portable speaker with 24-hour battery life and deep bass sound.",
    price: 129.99,
    rating: 4.4,
    inStock: true,
    category: "Audio",
    tags: ["speaker", "bluetooth", "portable"],
    imageUrl: "https://images.unsplash.com/photo-1589003077984-894e133dabab?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Ymx1ZXRvb3RoJTIwc3BlYWtlcnxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80",
    lastUpdated: "2025-07-01T10:15:00Z",
    vendor: "SoundWave"
  },
  {
    id: "item-008",
    title: "Digital Drawing Tablet",
    description: "Professional drawing tablet with pressure sensitivity and wireless connectivity.",
    price: 249.99,
    rating: 4.6,
    inStock: false,
    category: "Art & Design",
    tags: ["tablet", "drawing", "digital"],
    imageUrl: "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZHJhd2luZyUyMHRhYmxldHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80",
    lastUpdated: "2025-07-03T15:50:00Z",
    vendor: "ArtTech"
  },
  {
    id: "item-009",
    title: "Smart Home Security Camera",
    description: "Wireless security camera with motion detection, night vision, and cloud storage.",
    price: 179.99,
    rating: 4.3,
    inStock: true,
    category: "Smart Home",
    tags: ["security", "camera", "smart home"],
    imageUrl: "https://images.unsplash.com/photo-1558000143-a78f8299c40b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2VjdXJpdHklMjBjYW1lcmF8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80",
    lastUpdated: "2025-07-05T09:30:00Z",
    vendor: "SafeHome"
  },
  {
    id: "item-010",
    title: "Mechanical Gaming Keyboard",
    description: "RGB mechanical keyboard with customizable keys and anti-ghosting technology.",
    price: 149.99,
    rating: 4.8,
    inStock: true,
    category: "Gaming",
    tags: ["keyboard", "mechanical", "gaming"],
    imageUrl: "https://images.unsplash.com/photo-1595044778792-33e339cd1adf?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8bWVjaGFuaWNhbCUyMGtleWJvYXJkfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
    lastUpdated: "2025-07-08T14:20:00Z",
    vendor: "GameGear"
  },
  {
    id: "item-011",
    title: "Wireless Earbuds Pro",
    description: "True wireless earbuds with active noise cancellation and transparency mode.",
    price: 199.99,
    rating: 4.7,
    inStock: true,
    category: "Audio",
    tags: ["earbuds", "wireless", "audio"],
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZWFyYnVkc3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80",
    lastUpdated: "2025-07-10T11:45:00Z",
    vendor: "SoundMaster"
  },
  {
    id: "item-012",
    title: "Smart Coffee Maker",
    description: "Wi-Fi enabled coffee maker with scheduling and customizable brewing options.",
    price: 149.99,
    rating: 4.2,
    inStock: true,
    category: "Kitchen",
    tags: ["coffee", "smart", "appliance"],
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y29mZmVlJTIwbWFrZXJ8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80",
    lastUpdated: "2025-07-12T08:10:00Z",
    vendor: "SmartKitchen"
  }
];

// Helper function to get a subset of the mock data
export const getMockData = (count: number = 5): MockDataItem[] => {
  return mockTableData.slice(0, Math.min(count, mockTableData.length));
};

// Export all keys for table columns
export const mockDataKeys = Object.keys(mockTableData[0]).filter(key => key !== 'id');
