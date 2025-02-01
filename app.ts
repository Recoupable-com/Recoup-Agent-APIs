import express from "express";
import cors from "cors";
import routes from "./routes";
import bodyParser from "body-parser";
import dotenv from "dotenv";

declare global {
  var io: any;
}

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
