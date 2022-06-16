import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private numeroCopiasNodoDiccionario = {};
  private startEnd: boolean = false;
  private origen: string;
  private destino: string;
  private contadorLineas: number = 0;
  private estiloMenu: any = {}
  private flag = null;

  ngOnInit() {
    const padre = document.getElementById("zona-2");
    padre.addEventListener('dragstart', (e) => {
      if (e.target instanceof HTMLImageElement) {
        this.arrastrar(e);
      }
    });
    padre.addEventListener('dragover', (e) => {
      this.permitirSoltar(e);
    });
    padre.addEventListener('drop', (e) => {
      this.soltar(e);
    });
    padre.addEventListener('click', (e) => {
      if (e.target instanceof HTMLImageElement) {
        this.clickEvent(e.target.id);
      }
    });
    padre.addEventListener('mouseup', (e) => {
      var element = <HTMLElement>e.target;
      if (element.tagName === 'path' || element instanceof HTMLImageElement) {
        this.flag = element.id;
        this.detectarClicDerecho(e);
      }
    });
    this.cerrarMenuContextual();
  }

  detectarClicDerecho(event) {
    if (event.which === 3) {
      this.estiloMenu = {
        'display': 'block',
        'position': 'absolute',
        'left.px': event.clientX,
        'top.px': event.clientY
      }

    }
  }

  cerrarMenuContextual() {
    this.estiloMenu = {
      'display': 'none'
    }
  }

  arrastrar(event) {
    event.dataTransfer.setData('id', event.target.id);
    event.dataTransfer.setData('width', event.target.width);
    event.dataTransfer.setData('height', event.target.height);
  }

  permitirSoltar(event) {
    event.preventDefault();
  }

  soltar(event) {
    let idElemento = event.dataTransfer.getData('id');
    if (document.getElementById(idElemento).parentElement.classList.contains('zona-1')) {
      if (this.numeroCopiasNodoDiccionario[idElemento] == undefined) {
        this.numeroCopiasNodoDiccionario[idElemento] = 1;
      } else {
        let mumeroCopiasNodo = this.numeroCopiasNodoDiccionario[idElemento];
        mumeroCopiasNodo += 1;
        this.numeroCopiasNodoDiccionario[idElemento] = mumeroCopiasNodo;
      }
      let nodoCopia = <HTMLCanvasElement>document.getElementById(idElemento).cloneNode(true);
      nodoCopia.id = idElemento.concat(this.numeroCopiasNodoDiccionario[idElemento].toString());
      nodoCopia.classList.remove('element');
      nodoCopia.width = event.dataTransfer.getData('width');
      nodoCopia.height = event.dataTransfer.getData('height');
      nodoCopia.style.position = 'fixed';
      nodoCopia.style.left = event.clientX.toString().concat("px");
      nodoCopia.style.top = event.clientY.toString().concat("px");
      document.getElementById('zona-2').append(nodoCopia);
    } else {
      (<HTMLCanvasElement>document.getElementById(idElemento)).style.left = event.clientX.toString().concat("px");
      (<HTMLCanvasElement>document.getElementById(idElemento)).style.top = event.clientY.toString().concat("px");
    }
  }

  clickEvent(id) {
    this.startEnd = !this.startEnd;
    if (this.startEnd) {
      this.origen = id;
    } else {
      this.destino = id;
      this.contadorLineas += 1;
      let idLinea = this.origen + "_" + this.destino;
      document.getElementById("svg").innerHTML += "<path id='" + idLinea + "' d='M0 0' stroke-width='0.3em' style='stroke:#555; fill:none;'/>";
      this.connectElements(document.getElementById("svg"), document.getElementById(idLinea), document.getElementById(this.origen), document.getElementById(this.destino));
    }
  }

  connectElements(svg, path, startElem, endElem) {
    var svgContainer = document.getElementById("svgContainer");

    // if first element is lower than the second, swap!
    if (startElem.offsetTop > endElem.offsetTop) {
      var temp = startElem;
      startElem = endElem;
      endElem = temp;
    }

    // get (top, left) corner coordinates of the svg container   
    var svgTop = svgContainer.offsetTop;
    var svgLeft = svgContainer.offsetLeft;

    // calculate path's start (x,y)  coords
    // we want the x coordinate to visually result in the element's mid point
    var offsetX = document.getElementById('zona-1').offsetWidth;
    var startX = startElem.offsetLeft + 0.5 * startElem.offsetWidth - svgLeft - offsetX;    // x = left offset + 0.5*width - svg's left offset
    var startY = startElem.offsetTop + startElem.offsetHeight - svgTop - 14;        // y = top offset + height - svg's top offset

    // calculate path's end (x,y) coords
    var endX = endElem.offsetLeft + 0.5 * endElem.offsetWidth - svgLeft - offsetX;
    var endY = endElem.offsetTop - svgTop - 14;

    // call function for drawing the path
    this.drawPath(svg, path, startX, startY, endX, endY);

  }

  drawPath(svg, path, startX, startY, endX, endY) {
    // get the path's stroke width (if one wanted to be  really precize, one could use half the stroke size)
    var stroke = parseFloat(path.getAttribute("stroke-width"));
    // check if the svg is big enough to draw the path, if not, set heigh/width
    if (svg.getAttribute("height") < endY) svg.setAttribute("height", endY);
    if (svg.getAttribute("width") < (startX + stroke)) svg.setAttribute("width", (startX + stroke));
    if (svg.getAttribute("width") < (endX + stroke)) svg.setAttribute("width", (endX + stroke));

    var deltaX = (endX - startX) * 0.15;
    var deltaY = (endY - startY) * 0.15;
    // for further calculations which ever is the shortest distance
    var delta = deltaY < this.absolute(deltaX) ? deltaY : this.absolute(deltaX);

    // set sweep-flag (counter/clock-wise)
    // if start element is closer to the left edge,
    // draw the first arc counter-clockwise, and the second one clock-wise
    var arc1 = 0; var arc2 = 1;
    if (startX > endX) {
      arc1 = 1;
      arc2 = 0;
    }
    // draw tha pipe-like path
    // 1. move a bit down, 2. arch,  3. move a bit to the right, 4.arch, 5. move down to the end 
    path.setAttribute("d", "M" + startX + " " + startY +
      " V" + (startY + delta) +
      " A" + delta + " " + delta + " 0 0 " + arc1 + " " + (startX + delta * this.signum(deltaX)) + " " + (startY + 2 * delta) +
      " H" + (endX - delta * this.signum(deltaX)) +
      " A" + delta + " " + delta + " 0 0 " + arc2 + " " + endX + " " + (startY + 3 * delta) +
      " V" + endY);
  }

  signum(x) {
    return (x < 0) ? -1 : 1;
  }

  absolute(x) {
    return (x < 0) ? -x : x;
  }

  borrarLinea(event) {
    document.getElementById(this.flag).remove()
  }

}