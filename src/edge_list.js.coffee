window.Voronoi = window.Voronoi || {};

class Voronoi.EdgeList
  constructor: () ->
    @leftEnd  = new window.Voronoi.HalfEdge()
    @rightEnd = new window.Voronoi.HalfEdge()
    @leftEnd.setRight(@rightEnd)
    @rightEnd.setLeft(@leftEnd)

  leftbnd: (p) ->
    halfedge = @leftEnd

    if (halfedge is @leftEnd) || ((halfedge isnt @rightEnd) && halfedge.rightOf(p))
      loop
        halfedge = halfedge.right
        break unless ((halfedge isnt @rightEnd) && halfedge.rightOf(p))
      halfedge = halfedge.left
    else
      loop
        halfedge = halfedge.left
        break unless ((halfedge isnt @leftEnd) && !halfedge.rightOf(p))

    halfedge
