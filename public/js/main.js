$(function () {

  function arraysEqual(a, b) {

    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  Array.prototype.indexOfArray = function(val) {

    for(var i=0; i<this.length; i++) {
      if(arraysEqual(val, this[i])) {
        return i
        break
      }
    }

    return '-1'
  }


  var App = function () {

    this.canvas = document.getElementById('app')
    this.ctx = this.canvas.getContext('2d')
    this.scale = [10, 10]
    this.cells = []
    this.removed = []

    this.getNeighbors = function (x, y, alive) {

      let allNeighbors = [
        [x + this.scale[0], y + this.scale[1]],
        [x + this.scale[0], y],
        [x + this.scale[0], y - this.scale[1]],
        [x, y + this.scale[1]],
        [x, y - this.scale[1]],
        [x - this.scale[0], y + this.scale[1]],
        [x - this.scale[0], y],
        [x - this.scale[0], y - this.scale[1]]
      ]

      let neighbors = []

      if (alive) {
        for (let i=0; i<allNeighbors.length; i++) {
          if (this.cells.indexOfArray(allNeighbors[i]) != '-1') {
            neighbors.push(allNeighbors[i])
          }
        }
      } else {
        for (let i=0; i<allNeighbors.length; i++) {
          if (this.cells.indexOfArray(allNeighbors[i]) == '-1') {
            neighbors.push(allNeighbors[i])
          }
        }
      }

      return neighbors
    }

    this.isDrawn = function (x, y) {
      return (this.cells.indexOfArray([x * this.scale[0], y * this.scale[1]]) != '-1')
    }


    this.alive = function (x, y, neighbors) {
      return (neighbors == 2 || neighbors == 3)
    }

    this.born = function (x, y, neighbors) {
      return (neighbors == 2)
    }

    this.draw = function (x, y) {
      this.ctx.fillStyle = "#000"
      this.ctx.fillRect(x*this.scale[0], y*this.scale[1], this.scale[0], this.scale[1])
    }

    this.destroy = function (x, y) {
      let index = this.cells.indexOfArray([x, y])
      if (index != '-1') {
        return (this.cells.splice(index, 1))
      }

      return false
    }

    this.add = function (x, y) {
      if (this.cells.indexOfArray([x, y]) == '-1') {
        this.cells.push([x*this.scale[0], y*this.scale[1]])
        return true
      }

      return false

    }

    this.getMousePos = function (evt) {
      var rect = this.canvas.getBoundingClientRect()
      return {
          x: (evt.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width,
          y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height
      }
    }


    this.render = function () {

      let size, aliveNeighbors, deadNeighbors, born = []
      this.removed = []
      for(var i=0; i<this.cells.length; i++) {
        size = [this.cells[i][0], this.cells[i][1]]
        aliveNeighbors = this.getNeighbors(size[0], size[1], true)
        deadNeighbors = this.getNeighbors(size[0], size[1], false)

        if (!this.alive(size[0], size[1], aliveNeighbors.length)) {
          this.removed.push(size)
        }

        for (let j=0; j<deadNeighbors.length; j++) {
          aliveNeighbors = this.getNeighbors(deadNeighbors[j][0], deadNeighbors[j][1], true)
          if (this.born(deadNeighbors[j][0], deadNeighbors[j][1], aliveNeighbors.length)) {

            let x = Math.round(deadNeighbors[j][0] / 10),
            y = Math.round(deadNeighbors[j][1] / 10)

            if (born.indexOfArray([x, y]) == '-1') {
              born.push([x, y])
            }

          }
        }

      }

      if (born.length > 0) {
        for (let i=0; i<born.length; i++) {
          this.add(born[i][0], born[i][1])
        }
      }

      if (this.removed.length > 0) {
        for(var j=0; j<this.removed.length; j++) {
          this.destroy(this.removed[j][0], this.removed[j][1])
        }
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      for (var j=0; j<this.cells.length; j++) {
        this.draw(this.cells[j][0] / 10, this.cells[j][1] / 10)
      }




    }

  }

  // On intialise l'application
  var app = new App()

  // Permet à l'utilisateur de sélectionner le schéma initial
  var click = 0

  var select = function(e) {
    if (click) {
      p = app.getMousePos(e)
      let pos = [Math.round(p.x / app.scale[0]), Math.round(p.y / app.scale[1])]
      if (!app.isDrawn(pos[0], pos[1])) {
        app.draw(pos[0], pos[1])
        app.add(pos[0], pos[1])
      }

    }

  }

  $('#app').mousedown(function (e) {
    if (e.which)
      click = 1
      select(e)
  })

  $('#app').mouseup(function (e) {
    if (e.which)
      click = 0
  })


  app.canvas.addEventListener('mousemove', select, false)

  // Permet à l'utilisateur de lancer la machine !

  var loop

  $('#start').click(function () {
    loop = setInterval(function () { app.render() }, 200)
    //app.canvas.removeEventListener('mousemove', select)

  })

  $('#stop').click(function () {

    clearInterval(loop)
  })





});
