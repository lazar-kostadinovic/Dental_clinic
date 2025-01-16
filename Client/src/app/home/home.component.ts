import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  token: any=null;
  constructor(private router: Router) {}
  
  ngOnInit(){
    this.token = localStorage.getItem('token');
  }

  goToRegisterForm() {
    this.router.navigate(['/register-patient']);
  }
}
