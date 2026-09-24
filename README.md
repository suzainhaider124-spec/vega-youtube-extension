# Vega YouTube Provider

This provider is still in progress.

It is being developed as a custom Vega source for YouTube search and metadata, with playback support still being finalized and tested.

## Current status

- Search and catalog loading: in progress
- Metadata extraction: in progress
- Stream/playback resolution: being tested
- Public upstream compatibility: under review

## How to set up in Vega

1. Open Vega and go to the provider/source section.
2. Add a new provider source using the raw GitHub repository URL below:

```text
https://raw.githubusercontent.com/suzainhaider124-spec/vega-youtube-extension/main
```

3. Vega will read the provider manifest from:

```text
https://raw.githubusercontent.com/suzainhaider124-spec/vega-youtube-extension/main/manifest.json
```

4. After installation, Vega will load the provider modules from the repository's `dist/youtube-provider/` folder.

## Important note

Do not use the GitHub HTML/blob URL such as:

```text
https://github.com/suzainhaider124-spec/vega-youtube-extension/blob/main/manifest.json
```

Use the raw URL instead, because Vega expects a direct file response, not a GitHub web page.

## Repository layout

- `manifest.json` — provider metadata
- `dist/manifest.json` — built manifest copy
- `dist/youtube-provider/` — provider modules used by Vega

## Development note

This repo is a work in progress and may change frequently while the provider is being stabilized.
