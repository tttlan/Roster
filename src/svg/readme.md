## Adding a new icon


# Generate a new sprite

To add a new icon, place it in this folder and then export all svgs to http://icomoon.io

Place all the files in a project and then export them as an SVG sprite.  The aim here is to combine all icons into an SVG sprite with even spacing.  

Make sure your icon size is set to 64px. This will make sure the pixels all line up with the sprite css

By default icomoon will space the icons 16px apart, make sure this setting is unchanged.

Place the new sprite into this folder and name it sprite.svg (overwrite the current file)

Gulp will copy this file into /interface/ and minify it too


# Update CSS

svg-sprite.styl will need to be updated with new values from the SVG.  The values need to be retrieved from the SVG file by opening it in a text editor

The stylus file has more information on how to place these values into the stylus file