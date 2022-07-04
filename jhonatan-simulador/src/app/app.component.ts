import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

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
  public estiloMenu: any = {};
  private flag = null;
  public imagenes: any;

  constructor() {
    this.imagenes = ["laptot", "fibra", "modem-adsl", "fabry-perot", "dfb", "vcsel", "amplificador-optico", "pigtail", "splitter", "conector"];
    Chart.register(...registerables);
  }

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
      if (element.tagName === 'path' || element.tagName === 'line' || element instanceof HTMLImageElement) {
        this.flag = element.id;
        this.detectarClicDerecho(e);
      }
    });
    this.cerrarMenuContextual();
    var altoMenu = document.getElementById('barra-menu').clientHeight.toString().concat('px');
    document.getElementById('zona-1').style.top = altoMenu;
    document.getElementById('zona-2').style.top = altoMenu;
    document.getElementById('zona-3').style.top = altoMenu;

  }

  restaurarLienzo() {
    var hijos = document.getElementById("zona-2").children;
    var length = hijos.length;
    for (let i = length - 1; i >= 0; i--) {
      if (hijos[i].id != 'svgContainer') {
        hijos[i].remove();
      }
    }
    var hijos2 = document.getElementById("svg").children;
    var length2 = hijos2.length
    for (let j = length2 - 1; j >= 0; j--) {
      hijos2[j].remove();
    }

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
    if (document.getElementById(idElemento).parentElement.classList.contains('grid-zona-1')) {
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
      if (this.origen == id) {
        return;
      }
      this.destino = id;
      this.contadorLineas += 1;
      let idLinea = this.origen + "_" + this.destino;
      let linea = this.validarLinea(document.getElementById(this.origen), document.getElementById(this.destino));
      if (linea) {
        this.drawLine(document.getElementById(this.origen), document.getElementById(this.destino), idLinea);
      } else {
        document.getElementById("svg").innerHTML += "<path id='" + idLinea + "' d='M0 0' stroke-width='0.3em' style='stroke:#555; fill:none;'/>";
        this.connectElements(document.getElementById("svg"), document.getElementById(idLinea), document.getElementById(this.origen), document.getElementById(this.destino));
      }
    }
  }

  validarLinea(startElement, endElement) {
    let startTop = startElement.offsetTop;
    let startBottom = startTop + startElement.height;
    let endTop = endElement.offsetTop;
    let endBottom = endTop + startElement.height;
    return (endTop > startTop && endTop < startBottom || endBottom > startTop && endBottom < startBottom) ? true : false;
  }

  drawLine(startElement, endElement, idLinea) {
    // Validar cuál elemento esta más a la izquierda de la pantalla
    let startElementLeft = startElement.offsetLeft;
    let endElementLeft = endElement.offsetLeft;
    if (startElementLeft > endElementLeft) {
      let auxiliar = startElement;
      startElement = endElement;
      endElement = auxiliar;
    }
    let alfa = 9;
    let offsetX = document.getElementById('zona-1').offsetWidth + alfa;
    let beta = 4;
    let offsetY = document.documentElement.offsetHeight - beta;
    let x1 = startElement.offsetLeft + startElement.offsetWidth - offsetX;
    let y1 = startElement.offsetTop + (startElement.offsetHeight / 2) - offsetY;
    let x2 = endElement.offsetLeft - offsetX;
    let y2 = endElement.offsetTop + (endElement.offsetHeight / 2) - offsetY;
    let x3 = x1 + ((x2 - x1) / 2); // Punto medio entre el punto x1 y x2
    let path = "<path d='M" + x1 + "," + y1 + " L" + x3 + "," + y1 + " L" + x3 + "," + y2 + " L" + x2 + "," + y2 + "' id='" + idLinea + "' stroke-width='0.3em' style='stroke:#555; fill:none;' />";
    document.getElementById("svg").innerHTML += path;
    // get the line's stroke width (if one wanted to be  really precize, one could use half the stroke size)
    let line = document.getElementById(idLinea);
    let gama = 3;
    let stroke = parseFloat(line.getAttribute("stroke-width")) + gama;
    // check if the svg is big enough to draw the path, if not, set heigh/width
    let w = x2; let h = y2;
    if (x1 > x2) w = x1;
    if (y1 > y2) h = y1;
    let svg = document.getElementById("svg");
    if (parseFloat(svg.getAttribute("width")) < (w + stroke)) svg.setAttribute("width", String(w + stroke));
    if (parseFloat(svg.getAttribute("height")) < (h + stroke)) svg.setAttribute("height", String(h + stroke));
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
    var offsetY = document.getElementById('barra-menu').clientHeight;
    var ajusteX = 8;
    var ajusteY = 11;
    var startX = startElem.offsetLeft + 0.5 * startElem.offsetWidth - ajusteX - svgLeft - offsetX;    // x = left offset + 0.5*width - svg's left offset
    var startY = startElem.offsetTop + startElem.offsetHeight - svgTop - ajusteY - offsetY;        // y = top offset + height - svg's top offset

    // calculate path's end (x,y) coords
    var endX = endElem.offsetLeft + 0.5 * endElem.offsetWidth - ajusteX - svgLeft - offsetX;
    var endY = endElem.offsetTop - svgTop - ajusteY - offsetY;

    // call function for drawing the path
    this.drawPath(svg, path, startX, startY, endX, endY);

  }

  drawPath(svg, path, startX, startY, endX, endY) {
    // get the path's stroke width (if one wanted to be  really precize, one could use half the stroke size)
    var gama = 3;
    var stroke = parseFloat(path.getAttribute("stroke-width")) + gama;
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

  cerrar() {
    document.getElementById('zona-2').style.display = 'block';
    document.getElementById('zona-3').style.display = 'none';
  }

  graficar() {
    document.getElementById('zona-2').style.display = 'none';
    document.getElementById('zona-3').style.display = 'block';
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: 'Variable 1',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

}