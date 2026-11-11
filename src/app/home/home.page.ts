import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonList, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { FirebaseService, Estudiante } from '../services/firebase.service';

@Component({
  selector: 'app-home', standalone: true, templateUrl: './home.page.html', styleUrls: ['./home.page.scss'],
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonList, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
})
export class HomePage implements OnInit {
  private firebase = inject(FirebaseService);

  nombre = '';
  correo = '';
  telefono = '';
  fechaNacimiento = '';
  cargo = '';
  nivelAcademico = '';
  expericiaAnios: number | null = null;
  modalidad = '';
  habilidades:string = '';
  fechaDisponibilidad = '';
  aspiracionSalarial: number | null = null;
  resumen = '';
  consentimiento: boolean = false;

  estudiantes: (Estudiante & { id: string })[] = [];
  guardando = false;
  mensaje = '';

  async ngOnInit() { await this.cargarEstudiantes(); }

  async guardar() {
    if (!this.nombre || this.nombre.trim() === '') {
    this.mensaje = 'Por favor, ingresa el nombre.';
    return;
  }

  if (!this.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo.trim())) {
    this.mensaje = 'Por favor, ingresa un correo electrónico válido.';
    return;
  }

  if (!this.telefono || this.telefono.trim() === '') {
    this.mensaje = 'Por favor, ingresa el teléfono.';
    return;
  }

  if (!this.fechaNacimiento) {
    this.mensaje = 'Por favor, selecciona la fecha de nacimiento.';
    return;
  }

  if (!this.cargo || this.cargo.trim() === '') {
    this.mensaje = 'Por favor, ingresa el cargo.';
    return;
  }

  if (!this.nivelAcademico) {
    this.mensaje = 'Por favor, selecciona el nivel académico.';
    return;
  }

  if (this.expericiaAnios === null || this.expericiaAnios < 0) {
    this.mensaje = 'Por favor, ingresa un valor válido para los años de experiencia.';
    return;
  }

  if (!this.modalidad) {
    this.mensaje = 'Por favor, selecciona la modalidad.';
    return;
  }

  if (!this.habilidades || this.habilidades.trim() === '') {
    this.mensaje = 'Por favor, ingresa las habilidades.';
    return;
  }

  if (!this.fechaDisponibilidad) {
    this.mensaje = 'Por favor, selecciona la fecha de disponibilidad.';
    return;
  }

  if (this.aspiracionSalarial !== null && this.aspiracionSalarial < 0) {
    this.mensaje = 'La aspiración salarial no puede ser negativa.';
    return;
  }

  if (!this.resumen || this.resumen.trim() === '') {
    this.mensaje = 'Por favor, ingresa el resumen.';
    return;
  }

  if (!this.consentimiento) {
    this.mensaje = 'Debes aceptar el consentimiento para continuar.';
    return;
  }
    this.guardando = true;
    this.mensaje = '';
    try {
      await this.firebase.guardarEstudiante({
        nombre: this.nombre.trim(),
        correo: this.correo.trim(),
        telefono: this.telefono.trim(),
        fechaNacimiento: this.fechaNacimiento,
        cargo: this.cargo.trim(),
        nivelAcademico: this.nivelAcademico.trim(),
        experienciaAnios: Number(this.expericiaAnios),
        modalidad: this.modalidad.trim(),
        habilidades: this.habilidades.trim(),
        fechaDisponibilidad: this.fechaDisponibilidad,
        aspiracionSalarial: Number(this.aspiracionSalarial),
        resumen: this.resumen.trim(),
        consentimiento: this.consentimiento
      });

      this.nombre = '';
      this.correo = '';
      this.telefono = '';
      this.fechaNacimiento = '';
      this.cargo = '';
      this.nivelAcademico = '';
      this.expericiaAnios = null;
      this.modalidad = '';
      this.habilidades = '';
      this.fechaDisponibilidad = '';
      this.aspiracionSalarial = null;
      this.resumen = '';
      this.consentimiento = false;

      this.mensaje = 'Estudiante guardado correctamente.';
      await this.cargarEstudiantes();
    } catch (error) {
      console.error(error);
      this.mensaje = 'No se pudo guardar. Revise la configuración y las reglas de Firestore.';
    } finally { this.guardando = false; }
  }

  async cargarEstudiantes() {
      this.guardando = true;
      this.mensaje = '';
      try { 
        this.estudiantes = await this.firebase.obtenerEstudiantes(); 
      } catch (error) {
        console.error(error);
        this.mensaje = 'No se pudo consultar Firestore. Revise la conexión.';
      } finally {
        this.guardando = false;
      }
    }
}
