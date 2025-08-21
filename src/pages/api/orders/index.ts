import type { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Fetch all orders
    const ordersCol = collection(db, "orders");
    const orderSnapshot = await getDocs(ordersCol);
    const orders = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(orders);
  }
  if (req.method === "POST") {
    // Add a new order
    const { customer, amount, status, items } = req.body;
    if (!customer || !amount || !status || !items) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const docRef = await addDoc(collection(db, "orders"), {
      customer,
      amount,
      status,
      items,
      createdAt: new Date().toISOString(),
    });
    return res.status(201).json({ id: docRef.id });
  }
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
