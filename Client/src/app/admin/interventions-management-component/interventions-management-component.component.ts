import { Component, OnInit } from '@angular/core';
import { IntervencijaDTO } from '../../models/intervencijaDTO';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-interventions-management-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interventions-management-component.component.html',
  styleUrls: ['./interventions-management-component.component.css'],
})
export class InterventionsManagementComponentComponent implements OnInit {
  interventionsList: IntervencijaDTO[] = [];

  newIntervention = {
    naziv: '',
    cena: null as number | null,
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAllInterventions();
  }

  fetchAllInterventions() {
    this.http
      .get<IntervencijaDTO[]>('http://localhost:5001/Intervencija/getDTOs')
      .subscribe({
        next: (intervencije) => {
          this.interventionsList = intervencije.map((intervencija) => ({
            ...intervencija,
            selected: false,
          }));
        },
        error: (error) => {
          console.error('Greška pri učitavanju intervencija:', error);
        },
      });
  }

  togglePriceChange(index: number) {
    this.interventionsList[index].selected = !this.interventionsList[index].selected;
  }

  saveChanges(id: string, cena: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .put(`http://localhost:5001/Intervencija/${id}/${cena}`, {}, { headers })
      .subscribe({
        next: () => {
          this.fetchAllInterventions();
          alert(`Cena uspešno ažurirana!`);
        },
        error: (err) => {
          console.error(`Greška pri ažuriranju cene:`, err);
          alert(`Došlo je do greške pri ažuriranju cene.`);
        },
      });
  }

  addNewIntervention() {
    if (!this.newIntervention.naziv || this.newIntervention.cena === null) {
      alert('Molimo unesite naziv i cenu za novu intervenciju.');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const newIntervention = {
      naziv: this.newIntervention.naziv,
      cena: this.newIntervention.cena,
    };

    this.http
      .post('http://localhost:5001/Intervencija', newIntervention, { headers })
      .subscribe({
        next: () => {
          this.fetchAllInterventions();
          alert('Nova intervencija je uspešno dodata!');
          this.newIntervention = { naziv: '', cena: null };
        },
        error: (err) => {
          console.error('Greška pri dodavanju nove intervencije:', err);
          alert('Došlo je do greške pri dodavanju nove intervencije.');
        },
      });
  }

  deleteIntervention(id:string){
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const confirmation = window.confirm( 'Da li ste sigurni da želite da obrišete ovu intervenciju?')
   
    if (!confirmation) {
      return;
    }
    this.http.delete(`http://localhost:5001/Intervencija/${id}`, { headers })
    .subscribe({
      next: () => {
        this.interventionsList = this.interventionsList.filter((intervencija) => intervencija.id !== id);
        alert('Intervencija je uspesno obrisana.');
      },
      error: (error) => {
        console.error('Greska pri brisanju intervencije', error);
        alert('Došlo je do greške pri brisanju intervencije.');
      },
    });

  }
}
