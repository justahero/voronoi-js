/*! voronoi 05-05-2015 */

!function(a,b){b["true"]=a,function(){window.Voronoi=window.Voronoi||{},Voronoi.Edge=function(){function a(a,b){this.point1=a,this.point2=b,this.a=0,this.b=0,this.c=0,this.reg=[this.point1,this.point2],this.ep=[null,null]}return a}()}.call(this),function(){window.Voronoi=window.Voronoi||{},Voronoi.EdgeList=function(){function a(){this.leftEnd=new window.Voronoi.HalfEdge,this.rightEnd=new window.Voronoi.HalfEdge,this.leftEnd.setRight(this.rightEnd),this.rightEnd.setLeft(this.leftEnd)}return a.prototype.leftbnd=function(a){var b;if(b=this.leftEnd,b===this.leftEnd||b!==this.rightEnd&&b.rightOf(a)){for(;;)if(b=b.right,b===this.rightEnd||!b.rightOf(a))break;b=b.left}else for(;;)if(b=b.left,b===this.leftEnd||b.rightOf(a))break;return b},a}()}.call(this),function(){window.Voronoi=window.Voronoi||{},Voronoi.Geometry=function(){function a(){}return a.subtract=function(a,b){return{x:b.x-a.x,y:b.y-a.y}},a.length=function(a,b){return Math.sqrt(a*a+b*b)},a.dot=function(a,b){return a.x*b.x+a.y*b.y},a.distance=function(a,b){var c,d;return c=b.x-a.x,d=b.y-a.y,Math.sqrt(c*c+d*d)},a.bisect=function(a,b){var c,d,e,f;return f=new window.Voronoi.Edge(a,b),e=Voronoi.Geometry.subtract(a,b),c=Math.abs(e.x),d=Math.abs(e.y),f.c=Voronoi.Geometry.dot(a,e)+.5*Voronoi.Geometry.dot(e,e),c>d?(f.a=1,f.b=e.y/e.x,f.c/=e.x):(f.b=1,f.a=e.x/e.y,f.c/=e.y),f},a.intersect=function(a,b,c){var d,e,f,g,h,i,j,k;return e=null,f=a.edge,g=b.edge,null===f||null===g?!1:f.reg[1]===g.reg[1]?!1:(d=f.a*g.b-f.b*g.a,Math.abs(d)<1e-7?!1:(j=(f.c*g.b-g.c*f.b)/d,k=(g.c*f.a-f.c*g.a)/d,f.reg[1].y<g.reg[1].y||f.reg[1].y===g.reg[1].y&&f.reg[1].x<g.reg[1].x?(h=a,e=f):(h=b,e=g),i=j>=e.reg[1].x,i&&h.isLeftEdge()||!i&&h.isRightEdge()?!1:(c.x=j,c.y=k,!0)))},a}()}.call(this),function(){var a=function(a,b){return function(){return a.apply(b,arguments)}};window.Voronoi=window.Voronoi||{},Voronoi.HalfEdge=function(){function b(b,c){null==b&&(b=null),null==c&&(c=0),this.insert=a(this.insert,this),this.left=null,this.right=null,this.edge=b,this.orientation=c,this.vertex=null,this.ystar=0}return b.prototype.release=function(){return this.left.right=this.right,this.right.left=this.left,this.edge=null},b.prototype.setLeft=function(a){return this.left=a},b.prototype.setRight=function(a){return this.right=a},b.prototype.isLeftEdge=function(){return 0===this.orientation},b.prototype.isRightEdge=function(){return 1===this.orientation},b.prototype.leftreg=function(a){return null===this.edge?a:this.edge.reg[this.orientation]},b.prototype.rightreg=function(a){return null===this.edge?a:this.edge.reg[(this.orientation+1)%2]},b.prototype.insert=function(a){return a.left=this,a.right=this.right,this.right.left=a,this.right=a},b.prototype.rightOf=function(a){var b,c,d,e,f,g,h,i,j,k,l;return f=!1,b=!1,e=this.edge,k=e.reg[1],g=a.x>k.x,g&&this.isLeftEdge()?!0:!g&&this.isRightEdge()?!1:(1===e.a?(c=Voronoi.Geometry.subtract(k,a),!g&e.b<0||g&e.b>=0?(f=c.y>=e.b*c.x,b=f):(b=a.x+a.y*e.b>e.c,e.b<0&&(b=!b),b||(f=!0)),f||(d=k.x-e.reg[0].x,b=e.b*(c.x*c.x-c.y*c.y)<d*c.y*(1+2*c.x/d+e.b*e.b),e.b<0&&(b=!b))):(l=e.c-e.a*a.x,h=a.y-l,i=a.x-k.x,j=l-k.y,b=h*h>i*i+j*j),this.isLeftEdge()===b)},b}()}.call(this),function(){window.Voronoi=window.Voronoi||{},Voronoi.PriorityQueue=function(){function a(){this.hash=[]}return a.comparison=function(a,b){return a.ystar===b.ystar?a.vertex.x-b.vertex.x:a.ystar-b.ystar},a.boundaries=function(a){var b,c,d,e,f,g,h;for(f=0,e=0,h=0,g=0,b=0,c=a.length;c>b;b++)d=a[b],f=Math.min(f,d.x),e=Math.max(e,d.x);return a.length>0&&(h=a[0].y,g=a[a.length-1].y),{xmin:f,ymin:h,xmax:e,ymax:g}},a.prototype.init=function(b){return this.hash.length=0,this.bounds=a.boundaries(b)},a.prototype.release=function(a){return null!==a.vertex?(this._erase(a),a.vertex=null):void 0},a.prototype.insert=function(a,b,c){var d;return a.vertex={x:b.x,y:b.y},a.ystar=b.y+c,d=this._binaryIndex(a,this.hash),this.hash.splice(d,0,a)},a.prototype.size=function(){return this.hash.length},a.prototype.empty=function(){return 0===this.hash.length},a.prototype.min=function(){var a;return a=this.hash[0],{x:a.vertex.x,y:a.ystar}},a.prototype.extractMin=function(){return this.hash.shift()},a.prototype._erase=function(a){var b;return b=this.hash.indexOf(a),-1!==b?this.hash.splice(b,1):void 0},a.prototype._binaryIndex=function(b,c){var d,e,f;for(e=0,f=c.length;f>e;)d=e+f>>>1,a.comparison(c[d],b)<0?e=d+1:f=d;return e},a}()}.call(this),function(){window.Voronoi=window.Voronoi||{},Voronoi.Voronoi=function(){function a(){this.edgeList=new window.Voronoi.EdgeList,this.queue=new window.Voronoi.PriorityQueue,this.edges=[]}return a.prototype._compare=function(a,b){return a.y===b.y?a.x<b.x:a.y<b.y},a.prototype.calculate=function(a){var b,c,d,e,f,g;if(!(a instanceof Array))throw"Vertices is not an Array";if(0===a.length)return[];for(f=this._sortSites(a),this.queue.init(f),this.edges.length=0,this.edgeList=new window.Voronoi.EdgeList,g=0,e=f[g++],d=f[g++],c={x:0,y:0};;)if(this.queue.empty()||(c=this.queue.min()),g<f.length&&(this.queue.empty()||this._compare(d,c)))this._handleSiteEvent(d,e),d=f[g++];else{if(this.queue.empty())break;b=this.queue.extractMin(),this._handleCircleEvent(b,e)}for(b=this.edgeList.leftEnd.right;b!==this.edgeList.rightEnd;)this._clipLine(b.edge),b=b.right;return this.edges},a.prototype._sortSites=function(a){var b,c;return b=function(){var b,d,e;for(e=[],b=0,d=a.length;d>b;b++)c=a[b],e.push({x:c.x,y:c.y});return e}(),b.sort(function(a,b){return a.y===b.y?a.x-b.x:a.y-b.y})},a.prototype._handleSiteEvent=function(a,b){var c,d,e,f,g;return f=this.edgeList.leftbnd(a),g=f.right,d=f.rightreg(b),e=window.Voronoi.Geometry.bisect(d,a),c=this._replaceEdge(e,f,d,0),this._insertEdge(e,c,g,a)},a.prototype._replaceEdge=function(a,b,c,d){var e,f;return e=new window.Voronoi.HalfEdge(a,d),b.insert(e),f={x:0,y:0},window.Voronoi.Geometry.intersect(b,e,f)&&(this.queue.release(b),this.queue.insert(b,f,window.Voronoi.Geometry.distance(f,c))),e},a.prototype._insertEdge=function(a,b,c,d){var e,f;return e=new window.Voronoi.HalfEdge(a,1),b.insert(e),f={x:0,y:0},window.Voronoi.Geometry.intersect(e,c,f)&&this.queue.insert(e,f,window.Voronoi.Geometry.distance(f,d)),e},a.prototype._handleCircleEvent=function(a,b){var c,d,e,f,g,h,i,j,k,l,m;return g=a.left,i=a.right,j=i.right,d=a.leftreg(b),l=i.rightreg(b),m=a.vertex,this._endPoint(a.edge,a.orientation,m),this._endPoint(i.edge,i.orientation,m),a.release(),i.release(),this.queue.release(i),h=0,d.y>l.y&&(k=d,d=l,l=k,h=1),f=window.Voronoi.Geometry.bisect(d,l),c=this._replaceEdge(f,g,d,h),this._endPoint(f,1-h,m),e={x:0,y:0},window.Voronoi.Geometry.intersect(c,j,e)?this.queue.insert(c,e,window.Voronoi.Geometry.distance(e,d)):void 0},a.prototype._endPoint=function(a,b,c){return a.ep[b]={x:c.x,y:c.y},null!==a.ep[(1+b)%2]?this._clipLine(a):void 0},a.prototype._clipLine=function(a){var b,c,d,e,f,g,h,i,j,k,l;if(b=this.queue.bounds,d=b.xmin,c=b.xmax,f=b.ymin,e=b.ymax,g=h=null,i=j=k=l=0,1===a.a&&a.b>=0?(g=a.ep[1],h=a.ep[0]):(g=a.ep[0],h=a.ep[1]),1===a.a){if(k=f,null!==g&&g.y>f&&(k=g.y),k>e)return null;if(i=a.c-a.b*k,l=e,null!==h&&h.y<e&&(l=h.y),f>l)return null;if(j=a.c-a.b*l,i>c&&j>c||d>i&&d>j)return null;i>c&&(i=c,k=(a.c-i)/a.b),d>i&&(i=d,k=(a.c-i)/a.b),j>c&&(j=c,l=(a.c-j)/a.b),d>j&&(j=d,l=(a.c-j)/a.b)}else{if(i=d,null!==g&&g.x>d&&(i=g.x),i>c)return null;if(k=a.c-a.a*i,j=c,null!==h&&h.x<c&&(j=h.x),d>j)return null;if(l=a.c-a.a*j,k>e&&l>e||f>k&&f>l)return null;k>e&&(k=e,i=(a.c-k)/a.a),f>k&&(k=f,i=(a.c-k)/a.a),l>e&&(l=e,j=(a.c-l)/a.a),f>l&&(l=f,j=(a.c-l)/a.a)}return this.edges.push({x1:i,y1:k,x2:j,y2:l})},a}()}.call(this)}({},function(){return this}());
//# sourceMappingURL=voronoi-0.1.0-min.js.map