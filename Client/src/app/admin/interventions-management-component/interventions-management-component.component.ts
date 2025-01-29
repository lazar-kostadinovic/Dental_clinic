import { Component, OnInit } from '@angular/core';
import { IntervencijaDTO } from '../../models/intervencijaDTO';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

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
          Swal.fire('',`Cena uspešno ažurirana!`,'success');
        },
        error: (err) => {
          console.error(`Greška pri ažuriranju cene:`, err);
          Swal.fire('',`Došlo je do greške pri ažuriranju cene.`,'error');
        },
      });
  }

  addNewIntervention() {
    if (!this.newIntervention.naziv || this.newIntervention.cena === null) {
      Swal.fire('','Molimo unesite naziv i cenu za novu intervenciju.','warning');
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
          Swal.fire('','Nova intervencija je uspešno dodata!','success');
          this.newIntervention = { naziv: '', cena: null };
        },
        error: (err) => {
          console.error('Greška pri dodavanju nove intervencije:', err);
          Swal.fire('','Došlo je do greške pri dodavanju nove intervencije.','error');
        },
      });
  }

  deleteIntervention(id: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    Swal.fire({
      title: 'Da li ste sigurni?',
      text: 'Da li želite da obrišete ovu intervenciju?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Obriši',
      cancelButtonText: 'Odustani',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost:5001/Intervencija/${id}`, { headers })
          .subscribe({
            next: () => {
              this.interventionsList = this.interventionsList.filter(
                (intervencija) => intervencija.id !== id
              );
              Swal.fire('', 'Intervencija je uspešno obrisana.', 'success');
            },
            error: (error) => {
              console.error('Greška pri brisanju intervencije:', error);
              Swal.fire(
                '',
                'Došlo je do greške pri brisanju intervencije.',
                'error'
              );
            },
          });
      }
    });
  }
  
}
