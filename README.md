# Phase plotter

Use WebGL to explore complex-valued functions.

## See it in action

Go to [the website](https://kisonecat.github.io/phase-plot/).

You can share your favorite expressions by appending `#f=z^2` or the like.  For instance,

* [z/w](https://kisonecat.github.io/phase-plot/#f=z/w)
* [z/(z-w)](https://kisonecat.github.io/phase-plot/#f=z/(z-w))
* [exp(1/z)](https://kisonecat.github.io/phase-plot/#f=exp(1/z))

Note that the variable `w` represents the mouse position.

Using variables besides `z` and `w` will introduce draggable pins.  For instance,

* [(z-a)/(z-b)](https://kisonecat.github.io/phase-plot/#f=(z-a)/(z-b))
* [az²+bz+c](https://kisonecat.github.io/phase-plot/#f=a*z*z+b*z+c)

## Credits and acknowledgments

This code uses a modified version of the domain coloring fragment shader from [@rreusser](https://beta.observablehq.com/@rreusser/domain-coloring-for-complex-functions), and relies on npm packages like [pan-zoom](https://www.npmjs.com/package/pan-zoom) and [dat.gui](https://github.com/dataarts/dat.gui).  Mathematical expressions are parsed and converted into GLSL using [math-expressions](https://github.com/kisonecat/math-expressions).  In spirit, this is a WebGL version of [the old plotter](https://people.math.osu.edu/fowler.291/phase/) which owes much of its existence to Steve Gubkin.
