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
    const eventos = ["dragstart", "dragover", "drop", "click", "mouseup"]
    const funciones = [(e) => {
      if (e.target instanceof HTMLImageElement) {
        this.arrastrar(e);
      }
    }, (e) => {
      this.permitirSoltar(e);
    }, (e) => {
      this.soltar(e);
    }, (e) => {
      if (e.target instanceof HTMLImageElement) {
        this.clickEvent(e.target.id);
      }
    }, (e) => {
      var element = <HTMLElement>e.target;
      if (element.tagName === 'path' || element.tagName === 'line' || element instanceof HTMLImageElement) {
        this.flag = element.id;
        this.clicDerechoElemento(e);
      }
    }]
    this.addListenerMulti(padre, eventos, funciones);
    this.cerrarMenuContextual();
  }

  addListenerMulti(element, eventNames, listener) {
    for (var i = 0, iLen = eventNames.length; i < iLen; i++) {
      element.addEventListener(eventNames[i], listener[i], false);
    }
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

  clicDerechoElemento(event) {
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
    // Verificar si la zona de origén del elemento es la zona con la clase grid-zona-1
    if (document.getElementById(idElemento).parentElement.classList.contains('grid-zona-1')) {
      if (this.numeroCopiasNodoDiccionario[idElemento] == undefined) { // Variable incremental para cada nodo
        this.numeroCopiasNodoDiccionario[idElemento] = 1;
      } else {
        let mumeroCopiasNodo = this.numeroCopiasNodoDiccionario[idElemento]; // A partir del nùmero 2 (2 copias)
        mumeroCopiasNodo += 1;
        this.numeroCopiasNodoDiccionario[idElemento] = mumeroCopiasNodo;
      }
      let nodoCopia = <HTMLCanvasElement>document.getElementById(idElemento).cloneNode(true); // Clonar el nodo
      nodoCopia.id = idElemento.concat(this.numeroCopiasNodoDiccionario[idElemento].toString());
      nodoCopia.classList.remove('element');
      nodoCopia.width = event.dataTransfer.getData('width'); // Ancho nodo clonado, que sea igual al de su artefacto
      nodoCopia.height = event.dataTransfer.getData('height'); // Alto nodo clonado, que sea igual al de su artefacto
      nodoCopia.style.position = 'absolute'; // Para que las propiedades left y top funcionen
      nodoCopia.style.left = event.clientX.toString().concat("px"); // Ajuste de posiciòn en X
      nodoCopia.style.top = event.clientY.toString().concat("px"); // Ajuste de posiciòn en Y
      document.getElementById('zona-2').append(nodoCopia); // Integrar dentro de la zona-2 el resultado final
    } else { // Si el nodo ya existe en la zona-2 reubicarlo en una nueva posiciòn
      (<HTMLCanvasElement>document.getElementById(idElemento)).style.left = event.clientX.toString().concat("px");
      (<HTMLCanvasElement>document.getElementById(idElemento)).style.top = event.clientY.toString().concat("px");
    }
  }

  // Metodo para dibujar una linea
  clickEvent(id) {
    this.startEnd = !this.startEnd;
    if (this.startEnd) {
      this.origen = id;
    } else {
      if (this.origen == id) {
        console.log("No se puede conectar a el mismo");
        var audio = new Audio('assets/audios/nspcaem.mp3');
        audio.play();
        return;
      }
      this.destino = id;
      this.contadorLineas += 1;
      let idLinea = this.origen + "_" + this.destino;
      let linea = this.verificarCamino(document.getElementById(this.origen), document.getElementById(this.destino));
      document.getElementById("svg").innerHTML += "<path id='" + idLinea + "' d='M0 0' stroke-width='0.3em' style='stroke:#555; fill:none;'/>";
      if (linea) {
        this.connectElements1(document.getElementById("svg"), document.getElementById(idLinea), document.getElementById(this.origen), document.getElementById(this.destino));
      } else {
        this.connectElements2(document.getElementById("svg"), document.getElementById(idLinea), document.getElementById(this.origen), document.getElementById(this.destino));
      }
    }
  }

  verificarCamino(startElement, endElement) {
    let startTop = startElement.offsetTop;
    let startBottom = startTop + startElement.height;
    let endTop = endElement.offsetTop;
    let endBottom = endTop + startElement.height;
    return (endTop > startTop && endTop < startBottom || endBottom > startTop && endBottom < startBottom) ? true : false;
  }


  connectElements1(svg, path, startElem, endElem) {
    var svgContainer = document.getElementById("svgContainer");

    // if first element is lower than the second, swap!
    if (endElem.offsetLeft < startElem.offsetLeft) {
      var temp = startElem;
      startElem = endElem;
      endElem = temp;
    }

    // get (top, left) corner coordinates of the svg container   
    var svgTop = svgContainer.offsetTop;
    var svgLeft = svgContainer.offsetLeft;

    // Ajuste necesario em los puntos iniciales startX, startY, endX, endY
    var beta = 8;

    // calculate path's start (x,y)  coords
    // we want the x coordinate to visually result in the element's mid point
    var startX = startElem.offsetLeft + startElem.offsetWidth - svgLeft - beta;    // x = left offset + 0.5*width - svg's left offset
    var startY = startElem.offsetTop + 0.5 * startElem.offsetHeight - svgTop - beta;        // y = top offset + height - svg's top offset

    // calculate path's end (x,y) coords
    var endX = endElem.offsetLeft - svgLeft - beta;
    var endY = endElem.offsetTop + 0.5 * endElem.offsetHeight - svgTop - beta;

    // call function for drawing the path
    this.dibujarCamino1(svg, path, startX, startY, endX, endY);

  }

  dibujarCamino1(svg, path, startX, startY, endX, endY) {
    // get the path's stroke width (if one wanted to be  really precize, one could use half the stroke size)
    var gama = 10;
    var stroke = parseFloat(path.getAttribute("stroke-width")) + gama;
    // check if the svg is big enough to draw the path, if not, set heigh/width
    if (svg.getAttribute("width") < endX) svg.setAttribute("width", endX);
    if (svg.getAttribute("height") < (startY + stroke)) svg.setAttribute("height", (startY + stroke));
    if (svg.getAttribute("height") < (endY + stroke)) svg.setAttribute("height", (endY + stroke));

    var deltaX = (endX - startX) * 0.15;
    var deltaY = (endY - startY) * 0.15;
    // for further calculations which ever is the shortest distance
    var delta = this.absolute(deltaY) < this.absolute(deltaX) ? this.absolute(deltaY) : this.absolute(deltaX);

    // set sweep-flag (counter/clock-wise)
    // if start element is closer to the left edge,
    // draw the first arc counter-clockwise, and the second one clock-wise
    var arc1 = 1; var arc2 = 0;
    if (endY < startY) {
      arc1 = 0; // Convexo ó en contra de las manecillas del reloj
      arc2 = 1; // Concavo ó con las manecillas del reloj
    }
    // draw tha pipe-like path
    // 1. move a bit down, 2. arch,  3. move a bit to the right, 4.arch, 5. move down to the end 
    path.setAttribute("d", "M" + startX + " " + startY +
      " H" + (startX + delta) +
      " A" + delta + " " + delta + " 0 0 " + arc1 + " " + (startX + 2 * delta) + " " + (startY + delta * this.signum(deltaY)) +
      " V" + (endY - delta * this.signum(deltaY)) +
      " A" + delta + " " + delta + " 0 0 " + arc2 + " " + (startX + 3 * delta) + " " + endY +
      " H" + endX);
  }

  connectElements2(svg, path, startElem, endElem) {
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

    // Ajuste necesario em los puntos iniciales startX, startY, endX, endY
    var beta = 8;

    // calculate path's start (x,y)  coords
    // we want the x coordinate to visually result in the element's mid point
    var startX = startElem.offsetLeft + 0.5 * startElem.offsetWidth - svgLeft - beta;    // x = left offset + 0.5*width - svg's left offset
    var startY = startElem.offsetTop + startElem.offsetHeight - svgTop - beta;        // y = top offset + height - svg's top offset

    // calculate path's end (x,y) coords
    var endX = endElem.offsetLeft + 0.5 * endElem.offsetWidth - svgLeft - beta;
    var endY = endElem.offsetTop - svgTop - beta;

    // call function for drawing the path
    this.dibujarCamino2(svg, path, startX, startY, endX, endY);

  }


  dibujarCamino2(svg, path, startX, startY, endX, endY) {
    // get the path's stroke width (if one wanted to be  really precize, one could use half the stroke size)
    var gama = 10;
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

  cerrarGrafica() {
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
          label: 'Resultados simulaciòn',
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