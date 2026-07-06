const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 4000;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const DATA_DIR = path.join(__dirname, "data");

app.use(cors());
app.use(express.json());

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
}

// ---------- API ----------

app.get("/api/products", (req, res) => {
  const products = readJson("products.json");
  const { category, q } = req.query;
  let result = products;
  if (category && category !== "all") {
    result = result.filter((p) => p.category === category);
  }
  if (q) {
    const needle = q.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(needle));
  }
  res.json(result);
});

app.get("/api/products/:slug", (req, res) => {
  const products = readJson("products.json");
  const product = products.find((p) => p.slug === req.params.slug);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

app.get("/api/reviews", (req, res) => {
  const reviews = readJson("reviews.json");
  const { productSlug } = req.query;
  const result = productSlug
    ? reviews.filter((r) => r.productSlug === productSlug)
    : reviews;
  res.json(result);
});

// Mock Stripe-style payment intent + order creation
app.post("/api/checkout", (req, res) => {
  const { items, customer, paymentMethod } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: "Košík je prázdny" });
  }
  if (!customer || !customer.name || !customer.email || !customer.address) {
    return res.status(400).json({ error: "Chýbajú údaje o zákazníkovi" });
  }

  // Simulate card failure for a magic test card so the fail flow is demoable
  const isFailureCard = paymentMethod?.cardNumber?.replace(/\s/g, "") === "4000000000000002";

  if (isFailureCard) {
    return res.status(402).json({
      error: "card_declined",
      message: "Vaša karta bola zamietnutá (simulované zlyhanie v testovacom režime Stripe).",
    });
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const order = {
    orderId: "WW-" + Math.random().toString(36).slice(2, 9).toUpperCase(),
    status: "paid",
    total: Number(total.toFixed(2)),
    currency: "EUR",
    items,
    customer: { name: customer.name, email: customer.email, address: customer.address },
    createdAt: new Date().toISOString(),
  };

  res.json(order);
});

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Všetky polia sú povinné" });
  }

  console.log("[contact] new message:", { name, email, message });

  if (resend && NOTIFY_EMAIL) {
    try {
      await resend.emails.send({
        from: "Whisk & Wonder <onboarding@resend.dev>",
        to: NOTIFY_EMAIL,
        reply_to: email,
        subject: `Nová správa z webu od ${name}`,
        text: `Meno: ${name}\nEmail: ${email}\n\nSpráva:\n${message}`,
      });
    } catch (err) {
      console.error("[contact] failed to send email:", err);
      return res.status(500).json({ error: "Nepodarilo sa odoslať správu" });
    }
  }

  res.json({ ok: true });
});

app.post("/api/newsletter", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Je potrebný platný e-mail" });
  }
  console.log("[newsletter] subscribed:", email);
  res.json({ ok: true });
});

// ---------- Clean URLs for product detail pages ----------
app.get("/products/:slug", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "product.html"));
});

// ---------- Static files ----------
app.use(express.static(PUBLIC_DIR));

app.listen(PORT, () => {
  console.log(`Whisk & Wonder server running at http://localhost:${PORT}`);
});
