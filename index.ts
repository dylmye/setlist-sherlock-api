import * as BunnySDK from "@bunny.net/edgescript-sdk";
// import process from "node:process";

const SETLIST_FM_REGEX: RegExp = /^\/1\.0\/(artist|city|venue|search|setlist|user)\//;
const SETLIST_FM_URL_BASE: string = "https://api.setlist.fm/rest";

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
  // const apiKey = process.env.SETLIST_API_KEY; // defined in bunny.net script vars
  return new Response(requestApiUrl.toJSON());
});
