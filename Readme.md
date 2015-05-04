Voronoi JS
----------

A library to generate Voronoi cells. Given a list of 2d points it returns a list of 2d lines / edges.


## Motivation

This library is based on a modified version of the [Fortune algorithm](http://en.wikipedia.org/wiki/Fortune's_algorithm) written in C++ which has readability and a (subjectivly) better code organization as main objectives, compared to the C version of 1992.

The CoffeeScript version is more or less a direct port of the C++ code with similar considerations.
One problem I found with other implementations (either C++, C or JS) was that it was pretty hard to understand what the algorithm was doing exactly.


## Installation

A Gruntfile is available that is used to compile the Coffee files into a single JavaScript version. It also produces the minimized version with an associated Map file.

TODO Installation with Bower



## Usage

Example with how to prepare data and how to calculate edges / lines for the given input


## Development

TODO



## Contributing

TODO?


## License

Software is released under the MIT licence, see the `LICENSE` file.
