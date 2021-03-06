# Image as Fog

![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?label=Downloads@latest&query=assets%5B1%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2FElfFriend-DnD%2Ffoundryvtt-imageFog%2Freleases%2Flatest)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fimage-fog&colorB=4aa94a)
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FElfFriend-DnD%2Ffoundryvtt-imageFog%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange)
[![ko-fi](https://img.shields.io/badge/-buy%20me%20a%20coke-%23FF5E5B)](https://ko-fi.com/elffriend)

The idea behind this project is to allow GMs to set an image as the fog layer for Foundry maps. This would be useful if say the players are following a rough map for overland travel but you want to show them the hexes they are traveling through within their own vision range.

The module respects all of expected fog vision limitations. On scenes that do not allow fog exploration, the fog is never dispelled, but the currently visible area of the background items are visible.

## Installation

Module JSON:

```
https://github.com/ElfFriend-DnD/foundryvtt-imageFog/releases/latest/download/module.json
```

## Gallery

![Example with fog exploration on.](/readme-img/explore-fog.gif)

![Example without fog exploration on.](/readme-img/no-explore-fog.gif)

![Added Scene Config option.](/readme-img/new-scene-config-option.png)

## Added Scene Config Options

| **Name**                            | Description                                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Unexplored Fog Background Image** | Path to the file that will be used for the Unexplored Fog. This image should be the same size as your background image or stretching will occur. |


### Compatibility

I'm honestly not sure how well this will play with modules that affect the fog layer, under the hood we take a snapshot of the fog layer on every `sightUpdate`, reverse it, and use that as a mask for our image, which otherwise sits on top of the usual fog layer.

| **Name**                                             |       Works        | Notes                                                                                                                 |
| ---------------------------------------------------- | :----------------: | --------------------------------------------------------------------------------------------------------------------- |
| [Less Fog](https://github.com/trdischat/lessfog)     |        :heavy_check_mark:         | Less fog's settings apply to the Unexplored Fog Image as you would expect them to.                                                     |
| [Simple Fog](https://github.com/VanceCole/simplefog) | :heavy_check_mark: | Simple fog's Manual Fog Layer sits on top of the Image Fog layer. Interacts the same as with regular sight-based fog. |


## Known Issues

- This almost doubles the amount of time it takes to calculate a vision update on scenes that employ it. Which can be a pretty nasty hit for low performance machines. [Issue #10](https://github.com/ElfFriend-DnD/foundryvtt-imageFog/issues/10)

## Acknowledgements

Bootstrapped with Nick East's [create-foundry-project](https://gitlab.com/foundry-projects/foundry-pc/create-foundry-project).

Mad props to the [League of Extraordinary FoundryVTT Developers](https://forums.forge-vtt.com/c/package-development/11) community which helped me figure out a lot.
