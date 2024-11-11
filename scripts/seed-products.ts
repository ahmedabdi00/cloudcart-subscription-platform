import { db } from "../db";
import { products } from "../db/schema";

async function seedProducts() {
  try {
    // First, let's clean up existing products
    await db.delete(products);
    
    await db.insert(products).values([
      {
        name: "GEEK",
        description: "Premium vape device with long-lasting battery and superior vapor production",
        price: 14.69,
        image: "/images/products/geek.jpg",
        category: "Vapes",
        brand: "GEEK",
        inStock: true,
        quantity: 50
      },
      {
        name: "RAZ",
        description: "High-performance vape device featuring advanced temperature control",
        price: 15.82,
        image: "/images/products/raz.jpg",
        category: "Vapes",
        brand: "RAZ",
        inStock: true,
        quantity: 50
      },
      {
        name: "ELF",
        description: "Compact and stylish vape device with exceptional flavor delivery",
        price: 13.56,
        image: "/images/products/elf.jpg",
        category: "Vapes",
        brand: "ELF",
        inStock: true,
        quantity: 50
      },
      {
        name: "GEEK PULS",
        description: "Enhanced version of the classic GEEK with extended battery life",
        price: 14.69,
        image: "/images/products/geek-puls.jpg",
        category: "Vapes",
        brand: "GEEK",
        inStock: true,
        quantity: 50
      },
      {
        name: "LOST MARRY",
        description: "Premium vape device known for its reliability and smooth hits",
        price: 14.69,
        image: "/images/products/lost-marry.jpg",
        category: "Vapes",
        brand: "LOST MARRY",
        inStock: true,
        quantity: 50
      },
      {
        name: "LOST MARRY O.S",
        description: "Advanced LOST MARRY model with optimized system for better performance",
        price: 15.82,
        image: "/images/products/lost-marry-os.jpg",
        category: "Vapes",
        brand: "LOST MARRY",
        inStock: true,
        quantity: 50
      },
      {
        name: "FLUM",
        description: "Sleek and powerful vape device with consistent vapor production",
        price: 14.69,
        image: "/images/products/flum.jpg",
        category: "Vapes",
        brand: "FLUM",
        inStock: true,
        quantity: 50
      }
    ]);

    console.log("Successfully seeded products");
  } catch (error) {
    console.error("Error seeding products:", error);
  }
}

seedProducts();
