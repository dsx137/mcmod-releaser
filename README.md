# mcmod-releaser

```yml
# Simple
- name: Mcmod Release
  uses: dsx137/mcmod-releaser@main
  env:
      MCMOD_ACCOUNT: username:password
  with:
      project_id: 7611
      game_version: 1.20.1
      file: ./build/libs/mymod-all.jar
```

```yml
# Full
- name: Mcmod Release
  uses: dsx137/mcmod-releaser@main
  env:
      MCMOD_ACCOUNT: username:password
  with:
      project_id: 7611
      game_version: 1.20.1
      file: ./build/libs/mymod-all.jar
      platforms: java, bedrock
      loaders: forge, fabric, rift, liteloader, datapack, commandblock, overwrite, actionpack, sandbox, other, quilt, resourcepack, neoforge
      tags: snapshot, beta, dev, lite, client, server
      upload_mode: unique # or replace
```
