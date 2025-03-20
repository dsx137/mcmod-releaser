import fetch from "node-fetch";
import { HeadersInit, BodyInit } from "node-fetch";
import * as values from "./values";

export async function getMcVersions() {
  return await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json").then(async (res) => {
    if (!res.ok) throw Error(`${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { versions: { type: string; id: string }[] };
    return json.versions
      .filter((it: { type: string }) => it.type === "release")
      .map((it: { id: string }) => it.id)
      .reverse();
  });
}
