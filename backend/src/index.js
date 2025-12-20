import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { nanoid } from "nanoid";
import { supabase } from "./supabaseClient.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 4000;

const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = data.user;
  return next();
};

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/menu-items", async (_req, res) => {
  const { data, error } = await supabase.from("menu_items").select("*").order("name");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get("/api/customers", async (_req, res) => {
  const { data, error } = await supabase.from("customers").select("*").order("name");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get("/api/staff", async (_req, res) => {
  const { data, error } = await supabase.from("staff").select("*").order("hired_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get("/api/orders", async (_req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), payments(*)")
    .order("order_date", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch("/api/orders/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  const { data, error } = await supabase.from("orders").update({ status }).eq("order_id", orderId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/orders", requireAuth, async (req, res) => {
  const { customer, customer_id, items, payment_method = "cash", status = "pending" } = req.body;

  if (!items?.length) {
    return res.status(400).json({ error: "items is required" });
  }

  try {
    const resolvedCustomerId = await getOrCreateCustomer(customer_id, customer);

    const totalAmount = await calculateTotal(items);

    const orderInsertPayload = {
      customer_id: resolvedCustomerId,
      order_date: new Date().toISOString(),
      total_amount: totalAmount,
      status
    };

    // First attempt: rely on DB default for order_id
    let orderData;
    let orderError;
    const firstTry = await supabase.from("orders").insert(orderInsertPayload).select().maybeSingle();
    orderData = firstTry.data;
    orderError = firstTry.error;

    // If DB complains about null order_id, retry with generated numeric ID
    if (orderError && /order_id/.test(orderError.message || "")) {
      const orderInsertWithId = { order_id: generateNumericId(), ...orderInsertPayload };
      const retry = await supabase.from("orders").insert(orderInsertWithId).select().single();
      orderData = retry.data;
      orderError = retry.error;
    }

    if (orderError || !orderData?.order_id) throw orderError || new Error("Order insert failed");

    const orderItemsPayload = items.map((item) => ({
      order_id: orderData.order_id,
      item_id: item.item_id,
      quantity: item.quantity || 1
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);
    if (itemsError) throw itemsError;

    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: orderData.order_id,
      amount: totalAmount,
      payment_method
    });
    if (paymentError) throw paymentError;

    res.status(201).json({ order: orderData, total_amount: totalAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/reservations", async (_req, res) => {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, customers(name, email, phone)")
    .order("reservation_date", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/reservations", requireAuth, async (req, res) => {
  const { customer, customer_id, reservation_date, party_size, status = "reserved" } = req.body;

  if (!reservation_date || !party_size) {
    return res.status(400).json({ error: "reservation_date and party_size are required" });
  }

  try {
    const resolvedCustomerId = await getOrCreateCustomer(customer_id, customer);
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        customer_id: resolvedCustomerId,
        reservation_date,
        party_size,
        status
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

async function getOrCreateCustomer(customerId, customerPayload) {
  if (customerId) return customerId;
  if (!customerPayload?.email) {
    throw new Error("customer email is required when customer_id is not provided");
  }

  const { data, error } = await supabase.rpc("get_or_create_customer", {
    p_email: customerPayload.email,
    p_name: customerPayload.name || null,
    p_phone: customerPayload.phone || null
  });

  if (error) throw error;
  if (!data) throw new Error("Unable to create customer");
  return data;
}

async function calculateTotal(items) {
  const { data, error } = await supabase.rpc("calculate_items_total", {
    p_items: items
  });
  if (error) throw error;

  return Number(data || 0);
}

function generateNumericId() {
  const now = Date.now();
  const rand = Math.floor(Math.random() * 1000);
  return Number(`${now}${rand}`.slice(-9)); // 9-digit fallback
}
