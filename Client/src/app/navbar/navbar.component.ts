import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { map, Observable } from 'rxjs';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, NgIf,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  email: string | null = localStorage.getItem('email');
  isAdmin: boolean = false;
  isPatient: boolean = false;
  hidden:boolean=false;

  constructor(private router: Router,private stateService:StateService) {}


  ngOnInit() {
    this.checkIsHidden();
    this.stateService.hidden$.subscribe((state) => {
      this.hidden = state;  
    });
  }

  checkIsHidden() {
    this.hidden = this.stateService.getHiddenState();
  }

  getProfileLink(): string | any {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    
    if(email ==="admin@gmail.com"){
      this.isAdmin=true;
      return '/admin-profile';
    }
    else if (token && email) {
      this.isAdmin=false;
      if(role==='pacijent'){
        this.isPatient=true;
      }
      return role === 'stomatolog' ? '/dentist-profile' : '/patient-profile';
    }
  }
  isLoggedIn(): boolean {
    return localStorage.getItem('token') ? true : false;
  }

  logout() {
    sessionStorage.removeItem('alreadyNavigated');
    this.isAdmin=false;
    this.isPatient=false;
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    this.router.navigate(['/home']);
  }
}
