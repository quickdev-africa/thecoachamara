import type { NextApiRequest, NextApiResponse } from "next";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  const productRef = doc(db, "products", id);

  if (req.method === "GET") {
    // Get a single product
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).json({ id: productSnap.id, ...productSnap.data() });
  }

  if (req.method === "PUT") {
    // Update a product
    const { name, price, category, image, description } = req.body;
    await updateDoc(productRef, { name, price, category, image, description });
    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    // Delete a product
    await deleteDoc(productRef);
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
