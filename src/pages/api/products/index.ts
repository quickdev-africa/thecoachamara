import type { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Fetch all products
    const productsCol = collection(db, "products");
    const productSnapshot = await getDocs(productsCol);
    const products = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(products);
  }
  if (req.method === "POST") {
    // Add a new product
    try {
      const { name, price, category, image, description } = req.body;
      if (!name || !price) {
        return res.status(400).json({ error: "Name and price are required" });
      }
      const docRef = await addDoc(collection(db, "products"), {
        name,
        price,
        category,
        image,
        description,
        createdAt: new Date().toISOString(),
      });
      return res.status(201).json({ id: docRef.id });
    } catch (error) {
      console.error("Error adding product:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
