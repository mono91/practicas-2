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

  ngOnInit() {
  }

  clickEvent(id) {
    this.startEnd = !this.startEnd;
    console.log(this.startEnd);

    console.log(id);
    if (this.startEnd) {
      this.origen = id;
    } else {
      this.destino = id;
      this.contadorLineas += 1;
      console.log(this.origen, this.destino, this.contadorLineas);
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
      document.getElementById(nodoCopia.id).addEventListener("click", this.clickEvent.bind(event, nodoCopia.id));
    } else {
      (<HTMLCanvasElement>document.getElementById(idElemento)).style.left = event.clientX.toString().concat("px");
      (<HTMLCanvasElement>document.getElementById(idElemento)).style.top = event.clientY.toString().concat("px");
    }
  }

  dibujarLinea(origen, destino, contadorLineas) {
  }

}