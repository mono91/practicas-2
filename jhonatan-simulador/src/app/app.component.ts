import { Component, OnInit } from '@angular/core';
import { Coordenadas } from '../models/Coordenadas';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private numeroCopiasNodoDiccionario = {};
  private coordendadas: Coordenadas = { ax: 0, ay: 0, bx: 0, by: 0 };
  private startEnd: boolean = false;

  ngOnInit() {
  }

  clickEvent(event) {
    this.startEnd = !this.startEnd;
    if (this.startEnd) {
      this.coordendadas.ax = event.clientX;
      this.coordendadas.ay = event.clientY;
    } else {
      this.coordendadas.bx = event.clientX;
      this.coordendadas.by = event.clientY;
      this.dibujarLinea(this.coordendadas);
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
      event.target.append(nodoCopia);
    } else {
      (<HTMLCanvasElement>document.getElementById(idElemento)).style.left = event.clientX.toString().concat("px");
      (<HTMLCanvasElement>document.getElementById(idElemento)).style.top = event.clientY.toString().concat("px");
    }
  }

  dibujarLinea(coordendadas: Coordenadas) {
    console.log('Dibujar una linea');
  }

}