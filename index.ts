import * as BunnySDK from "@bunny.net/edgescript-sdk";
import process from "node:process";

const SETLIST_FM_REGEX: RegExp = /^\/1\.0\/(artist|city|venue|search|setlist|user)\//;
const SETLIST_FM_URL_BASE: string = "https://api.setlist.fm/rest";
const ACCEPTED_SETLIST_FM_LANGS: string[] = ["en", "es", "fr", "de", "pt", "tr", "it", "pl"];

const headerSecurityTheatre = (rqHeaders: Headers): boolean =>
  rqHeaders.has("x-sherlock-theatre-version") &&
  rqHeaders.get("x-sherlock-theatre-version") === "1.0.0" &&
  !!rqHeaders.get("User-Agent")?.startsWith("setlist-sherlock-client, ");

const setlistFmStyleError = (code: number, message: string) =>
  [JSON.stringify({ status: code, message }), { status: code, statusText: message }] as const;

BunnySDK.net.http.serve(async (request: Request): Promise<Response> => {
  if (!headerSecurityTheatre(request.headers)) {
    return new Response(...setlistFmStyleError(401, "Missing Theatre"));
  }

  let pathname: string;
  try {
    pathname = new URL(request.url)?.pathname;
  } catch {
    return new Response(...setlistFmStyleError(422, "Invalid URL"));
  }

  if (!SETLIST_FM_REGEX.test(pathname)) {
    throw new Response(...setlistFmStyleError(422, "Invalid Path"));
  }

  const finalUrl = new URL(`${SETLIST_FM_URL_BASE}${pathname}`);
  return fetch(finalUrl, {
    method: "GET",
    headers: {
      "x-api-key": process.env.SETLIST_API_KEY,
      "Accept-Language": ACCEPTED_SETLIST_FM_LANGS.includes(
        request.headers.get("Accept-Language") ?? "en",
      )
        ? request.headers.get("Accept-Language")!
        : "en",
      Accept: "application/json",
      "User-Agent": "setlist-sherlock-api, 1.0.0",
    },
  });
});
