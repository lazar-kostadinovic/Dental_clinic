import { Component } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  ngOnInit(): void {
    this.initMap();
  }

  initMap(): void {
    const map = L.map('map').setView([43.32230905684506, 21.92228605320106], 13); 


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    L.marker([43.32230905684506, 21.92228605320106]).addTo(map)
      .bindPopup('<b>Stomatoloska ordinacija</b><br>Adresa klinike: Narodnih heroja 42')
      .openPopup();
  }
}
