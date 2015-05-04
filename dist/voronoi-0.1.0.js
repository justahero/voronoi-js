(function() {
  window.Voronoi = window.Voronoi || {};

  Voronoi.Edge = (function() {
    function Edge(point1, point2) {
      this.point1 = point1;
      this.point2 = point2;
      this.a = 0.0;
      this.b = 0.0;
      this.c = 0.0;
      this.reg = [this.point1, this.point2];
      this.ep = [null, null];
    }

    return Edge;

  })();

}).call(this);

(function() {
  window.Voronoi = window.Voronoi || {};

  Voronoi.EdgeList = (function() {
    function EdgeList() {
      this.leftEnd = new window.Voronoi.HalfEdge();
      this.rightEnd = new window.Voronoi.HalfEdge();
      this.leftEnd.setRight(this.rightEnd);
      this.rightEnd.setLeft(this.leftEnd);
    }

    EdgeList.prototype.leftbnd = function(p) {
      var halfedge;
      halfedge = this.leftEnd;
      if ((halfedge === this.leftEnd) || ((halfedge !== this.rightEnd) && halfedge.rightOf(p))) {
        while (true) {
          halfedge = halfedge.right;
          if (!((halfedge !== this.rightEnd) && halfedge.rightOf(p))) {
            break;
          }
        }
        halfedge = halfedge.left;
      } else {
        while (true) {
          halfedge = halfedge.left;
          if (!((halfedge !== this.leftEnd) && !halfedge.rightOf(p))) {
            break;
          }
        }
      }
      return halfedge;
    };

    return EdgeList;

  })();

}).call(this);

(function() {
  window.Voronoi = window.Voronoi || {};

  Voronoi.Geometry = (function() {
    function Geometry() {}

    Geometry.subtract = function(l, r) {
      return {
        x: r.x - l.x,
        y: r.y - l.y
      };
    };

    Geometry.length = function(x, y) {
      return Math.sqrt(x * x + y * y);
    };

    Geometry.dot = function(l, r) {
      return l.x * r.x + l.y * r.y;
    };

    Geometry.distance = function(l, r) {
      var dx, dy;
      dx = r.x - l.x;
      dy = r.y - l.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    Geometry.bisect = function(s1, s2) {
      var adx, ady, d, newedge;
      newedge = new window.Voronoi.Edge(s1, s2);
      d = Voronoi.Geometry.subtract(s1, s2);
      adx = Math.abs(d.x);
      ady = Math.abs(d.y);
      newedge.c = Voronoi.Geometry.dot(s1, d) + Voronoi.Geometry.dot(d, d) * 0.5;
      if (adx > ady) {
        newedge.a = 1.0;
        newedge.b = d.y / d.x;
        newedge.c /= d.x;
      } else {
        newedge.b = 1.0;
        newedge.a = d.x / d.y;
        newedge.c /= d.y;
      }
      return newedge;
    };

    Geometry.intersect = function(el1, el2, bp) {
      var d, e, e1, e2, el, right_of_site, xint, yint;
      e = null;
      e1 = el1.edge;
      e2 = el2.edge;
      if (e1 === null || e2 === null) {
        return false;
      }
      if (e1.reg[1] === e2.reg[1]) {
        return false;
      }
      d = (e1.a * e2.b) - (e1.b * e2.a);
      if (Math.abs(d) < 0.0000001) {
        return false;
      }
      xint = (e1.c * e2.b - e2.c * e1.b) / d;
      yint = (e2.c * e1.a - e1.c * e2.a) / d;
      if ((e1.reg[1].y < e2.reg[1].y) || ((e1.reg[1].y === e2.reg[1].y) && (e1.reg[1].x < e2.reg[1].x))) {
        el = el1;
        e = e1;
      } else {
        el = el2;
        e = e2;
      }
      right_of_site = xint >= e.reg[1].x;
      if ((right_of_site && el.isLeftEdge()) || (!right_of_site && el.isRightEdge())) {
        return false;
      }
      bp.x = xint;
      bp.y = yint;
      return true;
    };

    return Geometry;

  })();

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Voronoi = window.Voronoi || {};

  Voronoi.HalfEdge = (function() {
    function HalfEdge(edge, orientation) {
      if (edge == null) {
        edge = null;
      }
      if (orientation == null) {
        orientation = 0;
      }
      this.insert = bind(this.insert, this);
      this.left = null;
      this.right = null;
      this.edge = edge;
      this.orientation = orientation;
      this.vertex = null;
      this.ystar = 0;
    }

    HalfEdge.prototype.release = function() {
      this.left.right = this.right;
      this.right.left = this.left;
      return this.edge = null;
    };

    HalfEdge.prototype.setLeft = function(left) {
      return this.left = left;
    };

    HalfEdge.prototype.setRight = function(right) {
      return this.right = right;
    };

    HalfEdge.prototype.isLeftEdge = function() {
      return this.orientation === 0;
    };

    HalfEdge.prototype.isRightEdge = function() {
      return this.orientation === 1;
    };

    HalfEdge.prototype.leftreg = function(root) {
      if (this.edge === null) {
        return root;
      }
      return this.edge.reg[this.orientation];
    };

    HalfEdge.prototype.rightreg = function(root) {
      if (this.edge === null) {
        return root;
      }
      return this.edge.reg[(this.orientation + 1) % 2];
    };

    HalfEdge.prototype.insert = function(insert) {
      insert.left = this;
      insert.right = this.right;
      this.right.left = insert;
      return this.right = insert;
    };

    HalfEdge.prototype.rightOf = function(p) {
      var above, d, dxs, edge, fast, right_of_site, t1, t2, t3, topsite, yl;
      fast = false;
      above = false;
      edge = this.edge;
      topsite = edge.reg[1];
      right_of_site = p.x > topsite.x;
      if (right_of_site && this.isLeftEdge()) {
        return true;
      }
      if (!right_of_site && this.isRightEdge()) {
        return false;
      }
      if (edge.a === 1.0) {
        d = Voronoi.Geometry.subtract(topsite, p);
        if ((!right_of_site & (edge.b < 0.0)) || (right_of_site & (edge.b >= 0.0))) {
          fast = d.y >= (edge.b * d.x);
          above = fast;
        } else {
          above = (p.x + p.y * edge.b) > edge.c;
          if (edge.b < 0.0) {
            above = !above;
          }
          if (!above) {
            fast = true;
          }
        }
        if (!fast) {
          dxs = topsite.x - edge.reg[0].x;
          above = (edge.b * (d.x * d.x - d.y * d.y)) < (dxs * d.y * (1.0 + 2.0 * d.x / dxs + edge.b * edge.b));
          if (edge.b < 0.0) {
            above = !above;
          }
        }
      } else {
        yl = edge.c - edge.a * p.x;
        t1 = p.y - yl;
        t2 = p.x - topsite.x;
        t3 = yl - topsite.y;
        above = (t1 * t1) > ((t2 * t2) + (t3 * t3));
      }
      return this.isLeftEdge() === above;
    };

    return HalfEdge;

  })();

}).call(this);

(function() {
  window.Voronoi = window.Voronoi || {};

  Voronoi.PriorityQueue = (function() {
    function PriorityQueue() {
      this.hash = [];
    }

    PriorityQueue.comparison = function(l, r) {
      if (l.ystar === r.ystar) {
        return l.vertex.x - r.vertex.x;
      } else {
        return l.ystar - r.ystar;
      }
    };

    PriorityQueue.boundaries = function(sites) {
      var i, len, site, xmax, xmin, ymax, ymin;
      xmin = 0.0;
      xmax = 0.0;
      ymin = 0.0;
      ymax = 0.0;
      for (i = 0, len = sites.length; i < len; i++) {
        site = sites[i];
        xmin = Math.min(xmin, site.x);
        xmax = Math.max(xmax, site.x);
      }
      if (sites.length > 0) {
        ymin = sites[0].y;
        ymax = sites[sites.length - 1].y;
      }
      return {
        xmin: xmin,
        ymin: ymin,
        xmax: xmax,
        ymax: ymax
      };
    };

    PriorityQueue.prototype.init = function(sites) {
      this.hash.length = 0;
      return this.bounds = PriorityQueue.boundaries(sites);
    };

    PriorityQueue.prototype.release = function(halfedge) {
      if (halfedge.vertex !== null) {
        this._erase(halfedge);
        return halfedge.vertex = null;
      }
    };

    PriorityQueue.prototype.insert = function(he, v, offset) {
      var index;
      he.vertex = {
        x: v.x,
        y: v.y
      };
      he.ystar = v.y + offset;
      index = this._binaryIndex(he, this.hash);
      return this.hash.splice(index, 0, he);
    };

    PriorityQueue.prototype.size = function() {
      return this.hash.length;
    };

    PriorityQueue.prototype.empty = function() {
      return this.hash.length === 0;
    };

    PriorityQueue.prototype.min = function() {
      var v;
      v = this.hash[0];
      return {
        x: v.vertex.x,
        y: v.ystar
      };
    };

    PriorityQueue.prototype.extractMin = function() {
      return this.hash.shift();
    };

    PriorityQueue.prototype._erase = function(halfedge) {
      var index;
      index = this.hash.indexOf(halfedge);
      if (index !== -1) {
        return this.hash.splice(index, 1);
      }
    };

    PriorityQueue.prototype._binaryIndex = function(entry, list) {
      var current, lower, upper;
      lower = 0;
      upper = list.length;
      while (lower < upper) {
        current = (lower + upper) >>> 1;
        if (PriorityQueue.comparison(list[current], entry) < 0.0) {
          lower = current + 1;
        } else {
          upper = current;
        }
      }
      return lower;
    };

    return PriorityQueue;

  })();

}).call(this);

(function() {
  window.Voronoi = window.Voronoi || {};

  Voronoi.Voronoi = (function() {
    function Voronoi() {
      this.edgeList = new window.Voronoi.EdgeList();
      this.queue = new window.Voronoi.PriorityQueue();
      this.edges = [];
    }

    Voronoi.prototype._compare = function(a, b) {
      if (a.y === b.y) {
        return a.x < b.x;
      } else {
        return a.y < b.y;
      }
    };

    Voronoi.prototype.calculate = function(vertices) {
      var lbnd, newintstar, newsite, root, sites, sites_count;
      if (!(vertices instanceof Array)) {
        throw "Vertices is not an Array";
      }
      if (vertices.length === 0) {
        return [];
      }
      sites = this._sortSites(vertices);
      this.queue.init(sites);
      this.edges.length = 0;
      this.edgeList = new window.Voronoi.EdgeList();
      sites_count = 0;
      root = sites[sites_count++];
      newsite = sites[sites_count++];
      newintstar = {
        x: 0,
        y: 0
      };
      while (true) {
        if (!this.queue.empty()) {
          newintstar = this.queue.min();
        }
        if ((sites_count < sites.length) && (this.queue.empty() || this._compare(newsite, newintstar))) {
          this._handleSiteEvent(newsite, root);
          newsite = sites[sites_count++];
        } else if (!this.queue.empty()) {
          lbnd = this.queue.extractMin();
          this._handleCircleEvent(lbnd, root);
        } else {
          break;
        }
      }
      lbnd = this.edgeList.leftEnd.right;
      while (lbnd !== this.edgeList.rightEnd) {
        this._clipLine(lbnd.edge);
        lbnd = lbnd.right;
      }
      return this.edges;
    };

    Voronoi.prototype._sortSites = function(vertices) {
      var points, v;
      points = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = vertices.length; i < len; i++) {
          v = vertices[i];
          results.push({
            x: v.x,
            y: v.y
          });
        }
        return results;
      })();
      return points.sort(function(l, r) {
        if (l.y === r.y) {
          return l.x - r.x;
        } else {
          return l.y - r.y;
        }
      });
    };

    Voronoi.prototype._handleSiteEvent = function(newsite, root) {
      var bisector, bottom, edge, lbnd, rbnd;
      lbnd = this.edgeList.leftbnd(newsite);
      rbnd = lbnd.right;
      bottom = lbnd.rightreg(root);
      edge = window.Voronoi.Geometry.bisect(bottom, newsite);
      bisector = this._replaceEdge(edge, lbnd, bottom, 0);
      return this._insertEdge(edge, bisector, rbnd, newsite);
    };

    Voronoi.prototype._replaceEdge = function(edge, left, bottom, orientation) {
      var bisector, bp;
      bisector = new window.Voronoi.HalfEdge(edge, orientation);
      left.insert(bisector);
      bp = {
        x: 0,
        y: 0
      };
      if (window.Voronoi.Geometry.intersect(left, bisector, bp)) {
        this.queue.release(left);
        this.queue.insert(left, bp, window.Voronoi.Geometry.distance(bp, bottom));
      }
      return bisector;
    };

    Voronoi.prototype._insertEdge = function(edge, left, right, bottom) {
      var bisector, bp;
      bisector = new window.Voronoi.HalfEdge(edge, 1);
      left.insert(bisector);
      bp = {
        x: 0,
        y: 0
      };
      if (window.Voronoi.Geometry.intersect(bisector, right, bp)) {
        this.queue.insert(bisector, bp, window.Voronoi.Geometry.distance(bp, bottom));
      }
      return bisector;
    };

    Voronoi.prototype._handleCircleEvent = function(lbnd, root) {
      var bisector, bottom, bp, edge, llbnd, pm, rbnd, rrbnd, temp, top, v;
      llbnd = lbnd.left;
      rbnd = lbnd.right;
      rrbnd = rbnd.right;
      bottom = lbnd.leftreg(root);
      top = rbnd.rightreg(root);
      v = lbnd.vertex;
      this._endPoint(lbnd.edge, lbnd.orientation, v);
      this._endPoint(rbnd.edge, rbnd.orientation, v);
      lbnd.release();
      rbnd.release();
      this.queue.release(rbnd);
      pm = 0;
      if (bottom.y > top.y) {
        temp = bottom;
        bottom = top;
        top = temp;
        pm = 1;
      }
      edge = window.Voronoi.Geometry.bisect(bottom, top);
      bisector = this._replaceEdge(edge, llbnd, bottom, pm);
      this._endPoint(edge, 1 - pm, v);
      bp = {
        x: 0,
        y: 0
      };
      if (window.Voronoi.Geometry.intersect(bisector, rrbnd, bp)) {
        return this.queue.insert(bisector, bp, window.Voronoi.Geometry.distance(bp, bottom));
      }
    };

    Voronoi.prototype._endPoint = function(e, lr, s) {
      e.ep[lr] = {
        x: s.x,
        y: s.y
      };
      if (e.ep[(1 + lr) % 2] === null) {
        return;
      }
      return this._clipLine(e);
    };

    Voronoi.prototype._clipLine = function(e) {
      var bounds, pxmax, pxmin, pymax, pymin, s1, s2, x1, x2, y1, y2;
      bounds = this.queue.bounds;
      pxmin = bounds.xmin;
      pxmax = bounds.xmax;
      pymin = bounds.ymin;
      pymax = bounds.ymax;
      s1 = s2 = null;
      x1 = x2 = y1 = y2 = 0.0;
      if (e.a === 1.0 && e.b >= 0.0) {
        s1 = e.ep[1];
        s2 = e.ep[0];
      } else {
        s1 = e.ep[0];
        s2 = e.ep[1];
      }
      if (e.a === 1.0) {
        y1 = pymin;
        if (s1 !== null && s1.y > pymin) {
          y1 = s1.y;
        }
        if (y1 > pymax) {
          return null;
        }
        x1 = e.c - e.b * y1;
        y2 = pymax;
        if (s2 !== null && s2.y < pymax) {
          y2 = s2.y;
        }
        if (y2 < pymin) {
          return null;
        }
        x2 = e.c - e.b * y2;
        if (((x1 > pxmax) && (x2 > pxmax)) || ((x1 < pxmin) && (x2 < pxmin))) {
          return null;
        }
        if (x1 > pxmax) {
          x1 = pxmax;
          y1 = (e.c - x1) / e.b;
        }
        if (x1 < pxmin) {
          x1 = pxmin;
          y1 = (e.c - x1) / e.b;
        }
        if (x2 > pxmax) {
          x2 = pxmax;
          y2 = (e.c - x2) / e.b;
        }
        if (x2 < pxmin) {
          x2 = pxmin;
          y2 = (e.c - x2) / e.b;
        }
      } else {
        x1 = pxmin;
        if (s1 !== null && s1.x > pxmin) {
          x1 = s1.x;
        }
        if (x1 > pxmax) {
          return null;
        }
        y1 = e.c - e.a * x1;
        x2 = pxmax;
        if (s2 !== null && s2.x < pxmax) {
          x2 = s2.x;
        }
        if (x2 < pxmin) {
          return null;
        }
        y2 = e.c - e.a * x2;
        if (((y1 > pymax) && (y2 > pymax)) || ((y1 < pymin) && (y2 < pymin))) {
          return null;
        }
        if (y1 > pymax) {
          y1 = pymax;
          x1 = (e.c - y1) / e.a;
        }
        if (y1 < pymin) {
          y1 = pymin;
          x1 = (e.c - y1) / e.a;
        }
        if (y2 > pymax) {
          y2 = pymax;
          x2 = (e.c - y2) / e.a;
        }
        if (y2 < pymin) {
          y2 = pymin;
          x2 = (e.c - y2) / e.a;
        }
      }
      return this.edges.push({
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
      });
    };

    return Voronoi;

  })();

}).call(this);
