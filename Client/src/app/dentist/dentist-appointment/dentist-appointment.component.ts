import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PregledDTO } from '../../models/pregledDTO.model';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, map, switchMap, timeout } from 'rxjs';
import { DateService } from '../../shared/date.service';
import { FormsModule } from '@angular/forms';
import { IntervencijaDTO } from '../../models/intervencijaDTO';
import { PacijentDTO } from '../../models/pacijentDTO.model';
import Swal from 'sweetalert2';
import { StomatologDTO } from '../../models/stomatologDTO.model';

@Component({
  selector: 'app-dentist-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dentist-appointment.component.html',
  styleUrl: './dentist-appointment.component.css',
})
export class DentistAppointmentComponent {
  @Input() dentistId!: string;
  // @Output() appointmentsUpdated = new EventEmitter<string[]>();
  // @Output() appointmentCharged = new EventEmitter<void>();
  appointmentIds: string[] = [];
  dentistPhoneNumber?: string;
  dentistName?: string;
  appointmentList: PregledDTO[] = [];
  interventionsList: IntervencijaDTO[] = [];
  filteredAppointmentList: PregledDTO[] = [];
  filteredAppointmentListForToday: PregledDTO[] = [];
  showCharge = false;
  pacijentList: {
    id: string;
    name: string;
    email: string;
    totalSpent: number;
    debt: number;
  }[] = [];
  hasPastAppointments: boolean = false;
  hasUpcomingAppointments: boolean = false;
  appointmentsForToday = false;

  selectedPatientId: string = '';
  selectedPatientName: string = '';
  selectedPregled: PregledDTO | null = null;
  showPastAppointments: boolean = false;
  showUpcomingAppointments: boolean = true;

  selectedPatientDetails?: PacijentDTO;
  iznosZaSmanjenje: number = 0;
  

  constructor(private http: HttpClient, private dateService: DateService) {}

  ngOnInit() {
    this.getDentistInfo();
  }

  getDentistInfo(){
    this.http.get(`http://localhost:5001/Stomatolog/getStomatologDTO/${this.dentistId}`).subscribe({
      next:(stom:any)=>{
        this.dentistPhoneNumber=stom.brojTelefona;
        this.dentistName=stom.ime+' '+stom.prezime;
        this.appointmentIds = stom.pregledi;
        this.fetchPatientHistory();
        this.fetchAllPatients();
      }
    })
  }

  formatDate(utcDate: Date): string {
    return this.dateService.formatDate(utcDate);
  }

  fetchPatientHistory() {
    if(this.appointmentIds!=null)
    {  
    const pregledRequests = this.appointmentIds.map((id) =>
      this.http
        .get<PregledDTO>(`http://localhost:5001/Pregled/getPregledDTO/${id}`)
        .pipe(
          switchMap((pregled) =>
            this.http
              .get<{ ime: string; prezime: string; email: string; brojTelefona: number}>(
                `http://localhost:5001/Pacijent/getDTO/${pregled.idPacijenta}`
              )
              .pipe(
                map((patient) => ({
                  ...pregled,
                  imePacijenta: `${patient.ime} ${patient.prezime}`,
                  emailPacijenta: `${patient.email}`,
                  brojPacijenta: `${patient.brojTelefona}`,
                }))
              )
          )
        )
    );

    if (pregledRequests.length > 0) {
      forkJoin(pregledRequests).subscribe({
        next: (appointments) => {
          console.log(appointments);
          this.appointmentList = appointments;
          this.filteredAppointmentList = appointments;
          this.updateAppointmentIndicators();
          this.filterAppointmentsForToday();
          this.sortAppointmentsByDate();
        },
        error: (error) => {
          console.error('Error fetching appointments or patients:', error);
        },
      });
    }
  }
  }

  isToday(date: Date): boolean {
    const today = new Date().setHours(0, 0, 0, 0);
    const pregledDate = new Date(date).setHours(0, 0, 0, 0);
    return pregledDate === today;
  }

  filterAppointmentsForToday() {
    const today = new Date().setHours(0, 0, 0, 0);
    this.filteredAppointmentListForToday = this.appointmentList.filter(
      (pregled) => {
        const pregledDate = new Date(pregled.datum).setHours(0, 0, 0, 0);
        return pregledDate === today;
      }
    );
    this.filteredAppointmentList = this.filteredAppointmentList.filter(
      (pregled) =>
        !this.filteredAppointmentListForToday.some(
          (todayPregled) => todayPregled.id === pregled.id
        )
    );

    this.updateAppointmentIndicators();
    this.appointmentsForToday = true;
    this.sortAppointmentsByDate();
  }

  fetchAllPatients() {
    this.http
      .get<
        {
          id: string;
          name: string;
          email: string;
          totalSpent: number;
          debt: number;
        }[]
      >('http://localhost:5001/Pacijent/basic')
      .subscribe({
        next: (patients) => {
          this.pacijentList = patients;
        },
        error: (error) => {
          console.error('Error fetching patients:', error);
        },
      });
  }

  fetchAllInterventions() {
    this.http
      .get<IntervencijaDTO[]>('http://localhost:5001/Intervencija/getDTOs')
      .subscribe({
        next: (intervencije) => {
          this.interventionsList = intervencije.map((intervencija) => ({
            ...intervencija,
            selected: false,
            kolicina: 1,
          }));
        },
        error: (error) => {
          console.error('Greška pri učitavanju intervencija:', error);
        },
      });
  }

  calculateTotal(): number {
    return this.interventionsList.filter((intervencija) => intervencija.selected).reduce((total, intervencija) =>total + intervencija.cena * intervencija.kolicina, 0  );
  }
  calculateTotalForAppointment(pregled: PregledDTO): number {
    return pregled.intervencije.reduce((total, intervencija) => total + (intervencija.cena * intervencija.kolicina), 0);
  }
  
  filterAppointmentsByPatient() {
    if (this.selectedPatientId) {
      this.filteredAppointmentList = this.appointmentList.filter(
        (pregled) => pregled.idPacijenta === this.selectedPatientId
      );
    } else {
      this.filteredAppointmentList = [...this.appointmentList];
    }
    this.updateAppointmentIndicators();
    this.filterAppointmentsForToday();
  }

  onPatientSelected() {
    const selectedPatient = this.pacijentList.find(
      (pacijent) =>
        `${pacijent.name} - ${pacijent.email}`.toLowerCase() ===
        this.selectedPatientName.toLowerCase()
    );

    if (selectedPatient) {
      this.selectedPatientId = selectedPatient.id;
      this.filterAppointmentsByPatient();
  

      this.http.get<PacijentDTO>(`http://localhost:5001/Pacijent/getDTO/${this.selectedPatientId}`)
      .subscribe({
        next: (details)=>{
          this.selectedPatientDetails=details;
        },
        error: (err)=>{
          alert("Doslo je do greske pri dohvatanju podataka o pacijentu");
        },
      });

    } else {
      this.selectedPatientId = '';
      this.filteredAppointmentList = [...this.appointmentList];
      this.updateAppointmentIndicators();
      this.selectedPatientDetails=undefined;
    }
  }

  deleteAppointment(id: string,patientId:string){
    const token = localStorage.getItem('token') || '';

    this.http
      .delete(`http://localhost:5001/Pregled/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe({
        next: () => {
          this.appointmentList = this.appointmentList.filter(
            (pregled) => pregled.id !== id
          );
          this.appointmentIds = this.appointmentIds.filter(
            (appId) => appId !== id
          );
          this.filterAppointmentsByPatient();
          this.filterAppointmentsForToday();
          this.incrementMissedAppointments(patientId);
          // this.appointmentsUpdated.emit(this.appointmentIds);
          Swal.fire('', 'Pregled je obrisan a pacijentu dodat izostanak sa pregleda.', 'success');
        },
        error: (error) => {
          console.error('Greška pri brisanju pregleda:', error);
        },
      });
  }

  incrementMissedAppointments(patientId: string) {
    const token = localStorage.getItem('token') || '';
  
    this.http
      .put(`http://localhost:5001/Pacijent/incrementmissedAppointments/${patientId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe({
        next: () => {
        },
        error: (error) => {
          console.error('Greška pri povećanju broja nedolazaka:', error);
        },
      });
  }

  cancelAppointment(id: string) {
    this.getDentistInfo();

    const pregled = this.appointmentList.find((p) => p.id === id);
    if (!pregled) return;

    const token = localStorage.getItem('token') || '';

    this.http .delete(`http://localhost:5001/Pregled/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe({
        next: () => {
          this.appointmentList = this.appointmentList.filter(
            (pregled) => pregled.id !== id
          );
          this.appointmentIds = this.appointmentIds.filter(
            (appId) => appId !== id
          );
          this.filterAppointmentsByPatient();
          // this.appointmentsUpdated.emit(this.appointmentIds);

          const emailPayload = {
            toEmail: 'kostadinovicl999@gmail.com',
            patientName: pregled.imePacijenta,
            appointmentDate: this.formatDate(pregled.datum),
            dentistPhoneNumber: this.dentistPhoneNumber,
            dentistName:this.dentistName      };

          this.http
            .post(
              'http://localhost:5001/api/EmailControler/sendCancellationEmail',
              emailPayload,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .subscribe({
              next: () =>
                Swal.fire
               ('', 'Pregled je otkazan i email je poslat pacijentu.','success'),
              error: (error) =>
                console.error('Greška pri slanju emaila:', error),
            });
        },
        error: (error) => {
          console.error('Greška pri brisanju pregleda:', error);
        },
      });
  }

  updateAppointmentIndicators() {
    this.hasPastAppointments = this.filteredAppointmentList.some(
      (pregled) => pregled.status === 1
    );
    this.hasUpcomingAppointments = this.filteredAppointmentList.some(
      (pregled) => pregled.status === 0
    );
  }

  sortAppointmentsByDate(): void {
  const upcoming = this.filteredAppointmentList.filter(
    (a) => a.status === 0
  );
  const past = this.filteredAppointmentList.filter(
    (a) => a.status === 1
  );

  upcoming.sort(
    (a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()
  ); 
  past.sort(
    (a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()
  ); 

  this.filteredAppointmentList = [...upcoming, ...past];
    this.filteredAppointmentListForToday.sort(
      (a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()
    );
  }
  toggleCharge(pregled: PregledDTO) {
    this.fetchAllInterventions();
    this.selectedPregled = pregled;
    this.showCharge = true;
  }
  
  chargeAppointment() {
    if (!this.selectedPregled) {
      Swal.fire('Greška', 'Nema odabranog pregleda za naplatu.', 'error');
      return;
    }
  
    const selectedInterventions = this.interventionsList
      .filter(intervencija => intervencija.selected)
      .map(intervencija => ({
        IntervencijaId: intervencija.id,
        Kolicina: intervencija.kolicina
      }));
  
    if (selectedInterventions.length === 0) {
      Swal.fire('Greška', 'Morate odabrati barem jednu intervenciju za naplatu.', 'error');
      return;
    }
  
    const appointmentId = this.selectedPregled.id;
    const patientId = this.selectedPregled.idPacijenta;
  
    const chargeData = {
      Intervencije: selectedInterventions,
      UkupnaCena: this.calculateTotal()
    };
  
    const token = localStorage.getItem('token') || '';
  
    this.http.put(`http://localhost:5001/Pregled/chargeAppointment/${appointmentId}/${patientId}`, chargeData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: () => {
        this.selectedPregled!.naplacen = true;
        this.showCharge = false;
        Swal.fire('Uspeh', 'Pregled je uspešno naplaćen.', 'success');
        this.fetchPatientHistory();
        // this.appointmentCharged.emit();
      },
      error: (error) => {
        console.error('Greška pri naplati pregleda:', error);
        Swal.fire('Greška', 'Došlo je do greške pri naplati pregleda.', 'error');
      }
    });
  }
  
reducePatientDebt(patientId: string, amount: number) {
    this.http
      .put(
        `http://localhost:5001/Pacijent/reduceDebt/${patientId}/${amount}`,
        {}
      )
      .subscribe({
        next: (response: any) => {
          this.onPatientSelected();
          Swal.fire('', response.message, 'success');
        },
        error: (err) => {
          console.error('Greška prilikom smanjenja dugovanja:', err);
          Swal.fire('Greška', 'Došlo je do greške prilikom ažuriranja dugovanja.', 'error');
          },
      });
  }

  togglePastAppointments() {
    this.showPastAppointments = !this.showPastAppointments;
  }

  toggleUpcomingAppointments() {
    this.showUpcomingAppointments = !this.showUpcomingAppointments;
  }
  closeCharge(){
    this.showCharge=false;
  }
}
