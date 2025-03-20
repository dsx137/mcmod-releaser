import values from "./values";
import fetch from "node-fetch";
import FormData from "form-data";
import * as fs from "fs";
import * as core from "@actions/core";
import * as nable from "@dsx137/nable";
import * as defs from "./defs";
import path from "path";

export async function login(account: defs.Account) {
  return core.group("🔑 Login", async () => {
    return await fetch("https://www.mcmod.cn/action/doLogin/", {
      method: "POST",
      headers: { Referer: "https://www.mcmod.cn/login/" },
      body: new URLSearchParams({ data: JSON.stringify(account) }),
    }).then(async (res) => {
      if (!res.ok) throw Error(`${res.status}: ${await res.text()}`);
      const state = (await res.json()) as defs.State;
      if (state.state !== 0) throw Error(`State: ${defs.STATES[state.state]}`);

      const uuid = res.headers.get("set-cookie")!.split("_uuid=")[1].split(";")[0];

      if (!uuid) throw Error("Login failed!");
      core.info("Login success!");
      return uuid;
    });
  });
}

export async function upload(
  uuid: string,
  projectId: string,
  gameVersions: string[],
  platforms: defs.Platform[],
  loaders: defs.Loader[],
  tags: defs.Tag[],
  file: string
) {
  return core.group("📦 Upload", async () => {
    core.info(`File to upload: ${path.basename(file)}`);

    const form = new FormData();
    form.append("classID", projectId);
    form.append("mcverList", gameVersions.join(","));
    form.append("platformList", platforms.map((it) => defs.PLATFORMS[it]).join(","));
    form.append("apiList", loaders.map((it) => defs.LOADERS[it]).join(","));
    form.append("tagList", tags.join(","));
    form.append("0", fs.createReadStream(file));

    await fetch("https://modfile-dl.mcmod.cn/action/upload/", {
      method: "POST",
      headers: {
        Referer: `https://modfile-dl.mcmod.cn/admin/${projectId}/`,
        Cookie: `_uuid=${uuid}`,
        ...form.getHeaders(),
      },
      body: form,
    }).then(async (res) => {
      if (!res.ok) throw Error(`${res.status}: ${await res.text()}`);
      const state = (await res.json()) as defs.State;
      if (state.state !== 0) throw Error(`State: ${defs.STATES[state.state]}`);
      core.info("Upload success!");
    });
  });
}

export async function main() {
  const uuid = await login(values.account);
  await upload(
    uuid,
    values.projectId,
    await values.gameVersions,
    values.platforms,
    values.loaders,
    values.tags,
    values.file
  );
}

await main()
  .then(() => core.info("✅️ Done!"))
  .catch((error) => {
    core.setFailed("❌️ " + nable.getError(error));
    process.exit(1);
  });
