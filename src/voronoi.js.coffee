window.Voronoi = window.Voronoi || {};

class Voronoi.Voronoi
  constructor: () ->
    @edgeList = new window.Voronoi.EdgeList()
    @queue = new window.Voronoi.PriorityQueue()
    @edges = []

  _compare: (a, b) ->
    if a.y == b.y then a.x < b.x else a.y < b.y

  calculate: (vertices) ->
    unless vertices instanceof Array
      throw "Vertices is not an Array"

    return [] if vertices.length == 0

    sites = @_sortSites(vertices)
    @queue.init(sites)
    @edges.length = 0
    @edgeList = new window.Voronoi.EdgeList()

    sites_count = 0
    root        = sites[sites_count++]
    newsite     = sites[sites_count++]
    newintstar  = { x: 0, y: 0 }

    while true
      if !@queue.empty()
        newintstar = @queue.min()

      if (sites_count < sites.length) && (@queue.empty() || @_compare(newsite, newintstar))
        @_handleSiteEvent(newsite, root)
        newsite = sites[sites_count++]
      else if !@queue.empty()
        lbnd = @queue.extractMin()
        @_handleCircleEvent(lbnd, root)
      else
        break

    lbnd = @edgeList.leftEnd.right
    while lbnd isnt @edgeList.rightEnd
      @_clipLine(lbnd.edge)
      lbnd = lbnd.right

    @edges

  _sortSites: (vertices) ->
    points = ({ x: v.x, y: v.y } for v in vertices)
    points.sort((l, r) -> if l.y == r.y then l.x - r.x else l.y - r.y)

  _handleSiteEvent: (newsite, root) ->
    lbnd   = @edgeList.leftbnd(newsite)
    rbnd   = lbnd.right
    bottom = lbnd.rightreg(root)

    edge = window.Voronoi.Geometry.bisect(bottom, newsite)

    bisector = @_replaceEdge(edge, lbnd, bottom, 0)
    @_insertEdge(edge, bisector, rbnd, newsite)

  _replaceEdge: (edge, left, bottom, orientation) ->
    bisector = new window.Voronoi.HalfEdge(edge, orientation)
    left.insert(bisector)

    bp = { x: 0, y: 0 }
    if window.Voronoi.Geometry.intersect(left, bisector, bp)
      @queue.release(left)
      @queue.insert(left, bp, window.Voronoi.Geometry.distance(bp, bottom))

    bisector

  _insertEdge: (edge, left, right, bottom) ->
    bisector = new window.Voronoi.HalfEdge(edge, 1)
    left.insert(bisector)

    bp = { x: 0, y: 0 }
    if window.Voronoi.Geometry.intersect(bisector, right, bp)
      @queue.insert(bisector, bp, window.Voronoi.Geometry.distance(bp, bottom))

    bisector

  _handleCircleEvent: (lbnd, root) ->
    llbnd = lbnd.left
    rbnd  = lbnd.right
    rrbnd = rbnd.right

    bottom = lbnd.leftreg(root)
    top    = rbnd.rightreg(root)
    v      = lbnd.vertex

    @_endPoint(lbnd.edge, lbnd.orientation, v)
    @_endPoint(rbnd.edge, rbnd.orientation, v)

    lbnd.release()
    rbnd.release()
    @queue.release(rbnd)

    pm = 0
    if bottom.y > top.y
      temp = bottom
      bottom = top
      top = temp
      pm = 1

    edge = window.Voronoi.Geometry.bisect(bottom, top)
    bisector = @_replaceEdge(edge, llbnd, bottom, pm)
    @_endPoint(edge, 1 - pm, v)

    bp = { x: 0, y: 0 }
    if window.Voronoi.Geometry.intersect(bisector, rrbnd, bp)
      @queue.insert(bisector, bp, window.Voronoi.Geometry.distance(bp, bottom))

  _endPoint: (e, lr, s) ->
    e.ep[lr] = { x: s.x, y: s.y }
    if e.ep[(1 + lr) % 2] == null
      return
    @_clipLine(e)

  _clipLine: (e) ->
    bounds = @queue.bounds

    pxmin = bounds.xmin
    pxmax = bounds.xmax
    pymin = bounds.ymin
    pymax = bounds.ymax
    s1 = s2 = null
    x1 = x2 = y1 = y2 = 0.0

    if e.a == 1.0 && e.b >= 0.0
      s1 = e.ep[1];
      s2 = e.ep[0];
    else
      s1 = e.ep[0];
      s2 = e.ep[1];

    if e.a == 1.0
      y1 = pymin
      if s1 != null && s1.y > pymin
        y1 = s1.y
      if y1 > pymax
        return null

      x1 = e.c - e.b * y1
      y2 = pymax
      if s2 != null && s2.y < pymax
        y2 = s2.y
      if y2 < pymin
        return null

      x2 = e.c - e.b * y2

      if ((x1 > pxmax) && (x2 > pxmax)) || ((x1 < pxmin) && (x2 < pxmin))
        return null;

      if x1 > pxmax
        x1 = pxmax
        y1 = (e.c - x1) / e.b

      if x1 < pxmin
        x1 = pxmin
        y1 = (e.c - x1) / e.b

      if x2 > pxmax
        x2 = pxmax
        y2 = (e.c - x2) / e.b

      if x2 < pxmin
        x2 = pxmin
        y2 = (e.c - x2) / e.b

    else
      x1 = pxmin
      if s1 != null && s1.x > pxmin
        x1 = s1.x
      if x1 > pxmax
        return null

      y1 = e.c - e.a * x1
      x2 = pxmax
      if s2 != null && s2.x < pxmax
        x2 = s2.x
      if x2 < pxmin
        return null

      y2 = e.c - e.a * x2

      if ((y1 > pymax) && (y2 > pymax)) || ((y1 < pymin) && (y2 < pymin))
        return null

      if y1 > pymax
        y1 = pymax
        x1 = (e.c - y1) / e.a
      if y1 < pymin
        y1 = pymin
        x1 = (e.c - y1) / e.a
      if y2 > pymax
        y2 = pymax
        x2 = (e.c - y2) / e.a
      if y2 < pymin
        y2 = pymin
        x2 = (e.c - y2) / e.a

    @edges.push({ x1: x1, y1: y1, x2: x2, y2: y2 })
