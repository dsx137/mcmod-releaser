import values from "./values";
import fetch from "node-fetch";
import FormData from "form-data";
import * as fs from "fs";
import * as cheerio from "cheerio";
import * as core from "@actions/core";
import * as nable from "@dsx137/nable";
import * as defs from "./defs";
import path from "path";

export async function login(account: defs.Account) {
  return core.group("🔑 Login", async () => {
    return await fetch("https://www.mcmod.cn/action/doLogin/", {
      method: "POST",
      referrer: "https://www.mcmod.cn/login/",
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

export async function findFile(uuid: string, projectId: string, file: string) {
  return await core.group("🔍 Find file", async () => {
    return await fetch(`https://modfile-dl.mcmod.cn/admin/${projectId}/`, {
      referrer: "https://modfile-dl.mcmod.cn/admin/",
      headers: { Cookie: `_uuid=${uuid}` },
    }).then(async (res) => {
      if (!res.ok) throw Error(`${res.status}: ${await res.text()}`);
      core.info("Getting file list from html...");

      const $ = cheerio.load(await res.text());
      const files = $("span.file-name")
        .map((i, it) => $(it).text())
        .get();

      const basename = path.basename(file);
      const isExist = files.includes(basename);
      isExist ? core.info("File exist!") : core.info("File not exist!");
      return isExist;
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
      referrer: `https://modfile-dl.mcmod.cn/admin/${projectId}/`,
      headers: {
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

  if (values.upload_mode === "unique" && (await findFile(uuid, values.projectId, values.file))) {
    core.notice("File already exists. Skipping...");
    return;
  }

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
