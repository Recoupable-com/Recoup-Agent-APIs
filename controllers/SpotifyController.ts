import { Request, Response } from "express";
import getSearch from "../lib/spotify/getSearch";
import getAlbum from "../lib/spotify/getAlbum";
import generateAccessToken from "../lib/spotify/generateAccessToken";
import { getArtistTopTracks } from "../lib/spotify/getArtistTopTracks";
import getArtistAlbums from "../lib/spotify/getArtistAlbums";

export const getSpotifySearchHandler = async (req: Request, res: Response) => {
  try {
    const { q, type, market, limit, offset } = req.query;
    if (!q || !type) {
      return res.status(400).json({ status: "error" });
    }

    const tokenResult = await generateAccessToken();
    if (!tokenResult || tokenResult.error || !tokenResult.access_token) {
      return res.status(500).json({ status: "error" });
    }

    const { data, error } = await getSearch({
      q: String(q),
      type: String(type),
      market: market ? String(market) : undefined,
      limit: limit ? String(limit) : undefined,
      offset: offset ? String(offset) : undefined,
      accessToken: tokenResult.access_token,
    });

    if (error) {
      return res.status(502).json({ status: "error" });
    }

    return res.status(200).json({ status: "success", ...data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error" });
  }
};

export const getSpotifyTopTracksHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, market } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ status: "error" });
    }

    const tokenResult = await generateAccessToken();
    if (!tokenResult || tokenResult.error || !tokenResult.access_token) {
      return res.status(500).json({ status: "error" });
    }

    const { data, error } = await getArtistTopTracks({
      id: String(id),
      market: market ? String(market) : undefined,
      accessToken: tokenResult.access_token,
    });

    if (error) {
      return res.status(502).json({ status: "error" });
    }

    return res.status(200).json({ status: "success", ...data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error" });
  }
};

export const getSpotifyArtistAlbumsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, include_groups, market, limit, offset } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ status: "error" });
    }

    const tokenResult = await generateAccessToken();
    if (!tokenResult || tokenResult.error || !tokenResult.access_token) {
      return res.status(500).json({ status: "error" });
    }

    const { data, error } = await getArtistAlbums({
      id,
      include_groups: include_groups ? String(include_groups) : undefined,
      market: market ? String(market) : undefined,
      limit: limit ? String(limit) : undefined,
      offset: offset ? String(offset) : undefined,
      accessToken: tokenResult.access_token,
    });

    if (error) {
      return res.status(502).json({ status: "error" });
    }

    return res.status(200).json({ status: "success", ...data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error" });
  }
};

export const getSpotifyAlbumHandler = async (req: Request, res: Response) => {
  try {
    const { id, market } = req.query;
    if (!id) {
      return res.status(400).json({ status: "error" });
    }

    const tokenResult = await generateAccessToken();
    if (!tokenResult || tokenResult.error || !tokenResult.access_token) {
      return res.status(500).json({ status: "error" });
    }

    const { album, error } = await getAlbum({
      id: String(id),
      market: market ? String(market) : undefined,
      accessToken: tokenResult.access_token,
    });

    if (error) {
      return res.status(502).json({ status: "error" });
    }

    return res.status(200).json({ status: "success", ...album });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error" });
  }
};
