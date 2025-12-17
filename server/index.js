const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


const restaurants = [
  { id: 1, name: "Pizza Roma", category: "Pizza", deliveryFee: 1.5, minOrder: 8, rating: 4.6, distanceKm: 1.2 },
  { id: 2, name: "Burger House", category: "Burgers", deliveryFee: 2.0, minOrder: 7, rating: 4.2, distanceKm: 2.8 },
  { id: 3, name: "Sushi Time", category: "Sushi", deliveryFee: 2.5, minOrder: 12, rating: 4.8, distanceKm: 4.1 },
  { id: 4, name: "Crepe Corner", category: "Crepes", deliveryFee: 1.0, minOrder: 5, rating: 4.0, distanceKm: 0.9 },
  { id: 5, name: "Healthy Bowl", category: "Healthy", deliveryFee: 1.8, minOrder: 9, rating: 4.4, distanceKm: 3.3 }
];

const menus = {
  1: [
    { id: 101, name: "Margherita", price: 7.5 },
    { id: 102, name: "Pepperoni", price: 9.0 }
  ],
  2: [
    { id: 201, name: "Cheeseburger", price: 6.5 },
    { id: 202, name: "Double Burger", price: 8.5 }
  ],
  3: [
    { id: 301, name: "Salmon Roll", price: 10.0 },
    { id: 302, name: "California Roll", price: 9.5 }
  ],
  4: [
    { id: 401, name: "Crepe Nutella", price: 4.5 },
    { id: 402, name: "Crepe Banana", price: 5.0 }
  ],
  5: [
    { id: 501, name: "Chicken Bowl", price: 9.5 },
    { id: 502, name: "Vegan Bowl", price: 8.8 }
  ]
};


function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}


app.get("/api/restaurants", (req, res) => {
  try {
    const search = (req.query.q || "").toLowerCase().trim();
    const category = (req.query.category || "All").toLowerCase();
    const minRating = toNumber(req.query.minRating, 0);
    const maxDistance = toNumber(req.query.maxDistance, 9999);
    const sort = req.query.sort || "relevance";

    let result = restaurants.slice();

    
    if (search) {
      result = result.filter(r =>
        r.name.toLowerCase().includes(search) ||
        r.category.toLowerCase().includes(search)
      );
    }

    
    if (category !== "all") {
      result = result.filter(r => r.category.toLowerCase() === category);
    }
    if (minRating > 0) {
      result = result.filter(r => r.rating >= minRating);
    }
    if (maxDistance < 9999) {
      result = result.filter(r => r.distanceKm <= maxDistance);
    }

    
    switch (sort) {
      case "rating_desc":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "distance_asc":
        result.sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      case "name_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: "Server error" });
  }
});


app.get("/api/restaurants/:id/menu", (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ ok: false, message: "Invalid restaurant id" });
  }

  res.json(menus[id] || []);
});


app.post("/api/orders", (req, res) => {
  const { restaurantId, items } = req.body;

  if (!restaurantId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ ok: false, message: "Invalid order payload" });
  }

  const restaurant = restaurants.find(r => r.id === Number(restaurantId));
  if (!restaurant) {
    return res.status(404).json({ ok: false, message: "Restaurant not found" });
  }

  
  const orderId = Math.floor(Math.random() * 1_000_000);

  res.json({
    ok: true,
    orderId,
    message: "Order created successfully"
  });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🎄 Foodly API running on http://localhost:${PORT}`);
  console.log(`→ Test: http://localhost:${PORT}/api/restaurants`);
});
