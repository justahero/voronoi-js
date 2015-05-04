window.Voronoi = window.Voronoi || {};

class Voronoi.Edge
  constructor: (@point1, @point2) ->
    @a = 0.0
    @b = 0.0
    @c = 0.0
    @reg = [ @point1, @point2 ]
    @ep  = [ null, null ]
