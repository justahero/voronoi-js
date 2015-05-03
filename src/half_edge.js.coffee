window.Voronoi = window.Voronoi || {};

class Voronoi.HalfEdge
  constructor: (edge = null, orientation = 0) ->
    @left        = null
    @right       = null
    @edge        = edge
    @orientation = orientation
    @vertex      = null
    @ystar       = 0

  release: ->
    @left.right = @right
    @right.left = @left
    @edge = null

  setLeft: (left) ->
    @left = left

  setRight: (right) ->
    @right = right

  isLeftEdge: ->
    @orientation == 0

  isRightEdge: ->
    @orientation == 1

  leftreg: (root) ->
    if @edge == null
      return root

    @edge.reg[@orientation]

  rightreg: (root) ->
    if @edge == null
      return root

    @edge.reg[(@orientation + 1) % 2]

  insert: (insert) =>
    insert.left  = this
    insert.right = @right
    @right.left  = insert
    @right = insert

  rightOf: (p) ->
    fast    = false
    above   = false
    edge    = @edge
    topsite = edge.reg[1]
    right_of_site = p.x > topsite.x

    if right_of_site && @isLeftEdge()
      return true
    if !right_of_site && @isRightEdge()
      return false

    if edge.a == 1.0
      d = Voronoi.Geometry.subtract(topsite, p)

      if (!right_of_site & (edge.b < 0.0)) || (right_of_site & (edge.b >= 0.0))
        fast  = (d.y >= (edge.b * d.x))
        above = fast
      else
        above = (p.x + p.y * edge.b) > edge.c
        if edge.b < 0.0
          above = !above
        if !above
          fast = true

      if !fast
        dxs = topsite.x - edge.reg[0].x
        above = (edge.b * (d.x * d.x - d.y * d.y)) < (dxs * d.y * (1.0 + 2.0 * d.x / dxs + edge.b * edge.b))
        if edge.b < 0.0
          above = !above

    else
      yl = edge.c - edge.a * p.x
      t1 = p.y - yl
      t2 = p.x - topsite.x
      t3 = yl  - topsite.y
      above = ((t1 * t1) > ((t2 * t2) + (t3 * t3)))

    @isLeftEdge() == above
