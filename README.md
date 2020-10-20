# Work In Progress

## Moving Parts
- `SightLayer.fog` is a white to black painting of what should be visible of the background. This has the BlendMode of MULTIPLY applied to paint only the darker parts onto the background.
- Whatever Image I want to apply to the "Black" parts of the fog will need to live seperate from the `SightLayer.fog` PIXI Container so that the multiply can still work.
- OR The whole `SightLayer.fog` container will need to be inverted and turned into a mask for either a Black fill or Image which is then blendMode NORMAL. 

- Either Way, I need to create a Sprite based on the `SightLayer.fog` or `SightLayer` itself's contents, invert it so that Black is what we expect to be transparent, and apply that as a mask to the Sprite of the image being loaded.

- I need to do this as the SightLayer updates with each update.


# Image as Fog

![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?label=Downloads@latest&query=assets%5B1%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2FElfFriend-DnD%2Ffoundryvtt-imageFog%2Freleases%2Flatest)
[![ko-fi](https://img.shields.io/badge/-buy%20me%20a%20coke-%23FF5E5B)](https://ko-fi.com/elffriend)

The idea behind this project is to allow GMs to set an image as the fog layer for Foundry maps. This would be useful if say the Players are following a Rough map for overland travel but you want to show them the hexes they are traveling through within their own vision range.

## Installation

Module JSON:

```
https://github.com/ElfFriend-DnD/foundryvtt-imageFog/releases/latest/download/module.json
```

## Gallery


Click to view bigger.

## Key Features & Changes

### Use Image as fog!
Instead of blackness, use an image!

## Options

| **Name** | Description     |
| -------- | --------------- |
| **Foo**  | Something Cool. |


### Compatibility

I'm honestly not sure how well this will play with modules that affect character sheets, I'll try to test as many as possible but if somethign is obviously breaking please create and issue here and I'll see what I can do.

| **Name**                                         | Works | Notes         |
| ------------------------------------------------ | :---: | ------------- |
| [Less Fog](https://github.com/trdischat/lessfog) |  --   | Does things!. |



## Known Issues

- It doesn't work!

## Acknowledgements

Bootstrapped with Nick East's [create-foundry-project](https://gitlab.com/foundry-projects/foundry-pc/create-foundry-project).

Mad props to the [League of Extraordinary FoundryVTT Developers](https://forums.forge-vtt.com/c/package-development/11) community which helped me figure out a lot.
