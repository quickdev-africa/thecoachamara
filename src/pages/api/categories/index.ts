import type { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Fetch all categories
    const catCol = collection(db, "categories");
    const catSnapshot = await getDocs(catCol);
    const categories = catSnapshot.docs.map(doc => doc.data().name);
    return res.status(200).json(categories);
  }
  if (req.method === "POST") {
    // Add a new category
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    await addDoc(collection(db, "categories"), { name });
    return res.status(201).json({ success: true });
  }
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
