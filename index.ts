import * as BunnySDK from "@bunny.net/edgescript-sdk";
import process from "node:process";

const SETLIST_FM_REGEX: RegExp = /^\/1\.0\/(artist|city|venue|search|setlist|user)\//;
const SETLIST_FM_URL_BASE: string = "https://api.setlist.fm/rest";
const ACCEPTED_SETLIST_FM_LANGS: string[] = ["en", "es", "fr", "de", "pt", "tr", "it", "pl"];

BunnySDK.net.http.serve(async (request: Request): Promise<Response> => {
  let pathname: string;
  try {
    pathname = new URL(request.url)?.pathname;
  } catch {
    throw new Error("invalid URL");
  }

  if (!SETLIST_FM_REGEX.test(pathname)) {
    throw new Error("invalid path");
  }

  const requestApiUrl = new URL(`${SETLIST_FM_URL_BASE}${pathname}`);
  return fetch(requestApiUrl, {
    method: "GET",
    headers: {
      "x-api-key": process.env.SETLIST_API_KEY,
      "Accept-Language": ACCEPTED_SETLIST_FM_LANGS.includes(request.headers.get("Accept-Language") ?? "en") ? request.headers.get("Accept-Language")! : "en",
      "Origin": "https://setlist-sherlock.dylmye.me",
      "Accept": "application/json",
      "User-Agent": "setlist-sherlock-api, 1.0.0",
    }
  });
});
