import type { NextApiRequest, NextApiResponse } from "next";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { reference, email, amount, productId, status } = req.body;
    if (!reference || !email || !amount || !productId || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    await addDoc(collection(db, "payments"), {
      reference,
      email,
      amount,
      productId,
      status,
      createdAt: new Date().toISOString(),
    });
    return res.status(201).json({ success: true });
  }
  if (req.method === "GET") {
    const paymentsCol = collection(db, "payments");
    const paymentSnapshot = await getDocs(paymentsCol);
  const payments = paymentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(payments);
  }
  res.setHeader("Allow", ["POST", "GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
