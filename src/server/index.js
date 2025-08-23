import express from "express";
import path from "path";

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const products = JSON.parse(
  readFileSync(join(__dirname, "data", "products.json"), "utf-8")
);

console.log(products); 

const app = express();

// SERVE STATIC PAGES
app.use(express.static(path.join(process.cwd(), "/src/static")));

// ~~~~~ API ~~~~~ //
app.get("/products", (req, res) => {
	res.send(products);
});

app.listen(3000, (...e) => console.log("Server Started", e));
