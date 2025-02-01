import express from "express";
import cors from "cors";
import routes from "./routes";
import bodyParser from "body-parser";
import getTikTokAnalysis from "./agents/getTikTokAnalysis";
import { Server } from "socket.io";
import dotenv from "dotenv";
import getInstagramAnalysis from "./agents/getInstagramAnalysis";
import getTwitterAnalysis from "./agents/getTwitterAnalysis";
import getSpotifyAnalysis from "./agents/getSpotifyAnalysis";

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

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const socketIo = new Server(server, {
  cors: {
    origin: "*",
  },
});

global.io = socketIo;

socketIo.on("connection", async (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("TIKTOK_ANALYSIS", (_, msg) => {
    if (msg?.handle && msg?.pilot_id && msg?.account_id && msg?.address)
      getTikTokAnalysis(
        msg?.handle,
        msg?.pilot_id,
        msg?.account_id,
        msg?.address,
        msg?.isWrapped,
        msg?.existingArtistId,
      );
  });

  socket.on("INSTAGRAM_ANALYSIS", (_, msg) => {
    if (msg?.handle && msg?.pilot_id && msg?.account_id && msg?.address)
      getInstagramAnalysis(
        msg?.handle,
        msg?.pilot_id,
        msg?.account_id,
        msg?.address,
        msg?.isWrapped,
        msg?.existingArtistId,
      );
  });

  socket.on("TWITTER_ANALYSIS", (_, msg) => {
    if (msg?.handle && msg?.pilot_id && msg?.account_id && msg?.address)
      getTwitterAnalysis(
        msg?.handle,
        msg?.pilot_id,
        msg?.account_id,
        msg?.address,
        msg?.isWrapped,
        msg?.existingArtistId,
      );
  });

  socket.on("SPOTIFY_ANALYSIS", (_, msg) => {
    if (msg?.handle && msg?.pilot_id && msg?.account_id && msg?.address)
      getSpotifyAnalysis(
        msg?.handle,
        msg?.pilot_id,
        msg?.account_id,
        msg?.address,
        msg?.isWrapped,
        msg?.existingArtistId,
      );
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
