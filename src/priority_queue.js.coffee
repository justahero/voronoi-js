window.Voronoi = window.Voronoi || {};

class Voronoi.PriorityQueue
  constructor: ->
    @hash = []

  @comparison = (l, r) ->
    if l.ystar == r.ystar
      l.vertex.x - r.vertex.x
    else
      l.ystar - r.ystar

  @boundaries: (sites) ->
    xmin = 0.0
    xmax = 0.0
    ymin = 0.0
    ymax = 0.0

    for site in sites
      xmin = Math.min(xmin, site.x)
      xmax = Math.max(xmax, site.x)

    if sites.length > 0
      ymin = sites[0].y
      ymax = sites[sites.length - 1].y

    { xmin: xmin, ymin: ymin, xmax: xmax, ymax: ymax }

  init: (sites) ->
    @hash.length = 0
    @bounds = PriorityQueue.boundaries(sites)

  release: (halfedge) ->
    if halfedge.vertex != null
      @_erase(halfedge)
      halfedge.vertex = null

  insert: (he, v, offset) ->
    he.vertex = { x: v.x, y: v.y }
    he.ystar  = v.y + offset
    index = @_binaryIndex(he, @hash)
    @hash.splice(index, 0, he)

  size: ->
    @hash.length

  empty: ->
    @hash.length == 0

  min: ->
    v = @hash[0]
    { x: v.vertex.x, y: v.ystar }

  extractMin: ->
    @hash.shift()

  _erase: (halfedge) ->
    index = @hash.indexOf(halfedge)
    if index != -1
      @hash.splice(index, 1)

  _binaryIndex: (entry, list) ->
    lower  = 0
    upper  = list.length

    while lower < upper
      current = (lower + upper) >>> 1
      if PriorityQueue.comparison(list[current], entry) < 0.0
        lower = current + 1
      else
        upper = current

    lower
