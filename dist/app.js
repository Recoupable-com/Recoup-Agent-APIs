"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const body_parser_1 = __importDefault(require("body-parser"));
const getTikTokAnalysis_1 = __importDefault(require("./agents/getTikTokAnalysis"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const getInstagramAnalysis_1 = __importDefault(require("./agents/getInstagramAnalysis"));
const getTwitterAnalysis_1 = __importDefault(require("./agents/getTwitterAnalysis"));
const getSpotifyAnalysis_1 = __importDefault(require("./agents/getSpotifyAnalysis"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: false, limit: "10mb" }));
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use("/api", routes_1.default);
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
const socketIo = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
global.io = socketIo;
socketIo.on("connection", async (socket) => {
    console.log("New client connected: " + socket.id);
    socket.on("TIKTOK_ANALYSIS", (_, msg) => {
        if (msg?.handle && msg?.chat_id && msg?.account_id && msg?.address)
            (0, getTikTokAnalysis_1.default)(msg?.handle, msg?.chat_id, msg?.account_id, msg?.address, msg?.isWrapped, msg?.existingArtistId);
    });
    socket.on("INSTAGRAM_ANALYSIS", (_, msg) => {
        if (msg?.handle && msg?.chat_id && msg?.account_id && msg?.address)
            (0, getInstagramAnalysis_1.default)(msg?.handle, msg?.chat_id, msg?.account_id, msg?.address, msg?.isWrapped, msg?.existingArtistId);
    });
    socket.on("TWITTER_ANALYSIS", (_, msg) => {
        if (msg?.handle && msg?.chat_id && msg?.account_id && msg?.address)
            (0, getTwitterAnalysis_1.default)(msg?.handle, msg?.chat_id, msg?.account_id, msg?.address, msg?.isWrapped, msg?.existingArtistId);
    });
    socket.on("SPOTIFY_ANALYSIS", (_, msg) => {
        if (msg?.handle && msg?.chat_id && msg?.account_id && msg?.address)
            (0, getSpotifyAnalysis_1.default)(msg?.handle, msg?.chat_id, msg?.account_id, msg?.address, msg?.isWrapped, msg?.existingArtistId);
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});
