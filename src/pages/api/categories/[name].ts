import type { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs, deleteDoc, query, where, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  if (typeof name !== "string") {
    return res.status(400).json({ error: "Invalid category name" });
  }

  if (req.method === "DELETE") {
    // Delete category by name
    const catCol = collection(db, "categories");
    const q = query(catCol, where("name", "==", name));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return res.status(404).json({ error: "Category not found" });
    }
    await Promise.all(snapshot.docs.map(docSnap => deleteDoc(docSnap.ref)));
    return res.status(200).json({ success: true });
  }

  if (req.method === "PUT") {
    // Update category name
    const { name: newName } = req.body;
    if (!newName) {
      return res.status(400).json({ error: "New name is required" });
    }
    const catCol = collection(db, "categories");
    const q = query(catCol, where("name", "==", name));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return res.status(404).json({ error: "Category not found" });
    }
    await Promise.all(snapshot.docs.map(docSnap => updateDoc(docSnap.ref, { name: newName })));
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["DELETE", "PUT"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
