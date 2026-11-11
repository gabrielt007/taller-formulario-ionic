import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonList, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonDatetime, IonSelect, IonSelectOption, IonRadio, IonRadioGroup, IonCheckbox, IonListHeader, IonTextarea } from '@ionic/angular/standalone';
import { FirebaseService, Estudiante } from '../services/firebase.service';

@Component({
  selector: 'app-home', standalone: true, templateUrl: './home.page.html', styleUrls: ['./home.page.scss'],
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonList, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonDatetime, IonSelect, IonSelectOption, IonRadio, IonRadioGroup, IonCheckbox, IonListHeader, IonTextarea]
})
export class HomePage implements OnInit {
  private firebase = inject(FirebaseService);

  nombre = '';
  correo = '';
  telefono = '';
  fechaNacimiento = '';
  cargo = '';
  nivelAcademico = '';
  experienciaAnios: number | null = null;
  modalidad = '';
  habilidades: string[] = [];
  fechaDisponibilidad = '';
  aspiracionSalarial: number | null = null;
  resumen = '';
  consentimiento = false;

  get fechaHoy(): string { return new Date().toISOString().slice(0, 10); }

  estudiantes: (Estudiante & { id: string })[] = [];
  guardando = false;
  mensaje = '';

  async ngOnInit() { await this.cargarEstudiantes(); }

  alternarHabilidad(habilidad: string, seleccionada: boolean) {
    this.habilidades = seleccionada
      ? [...new Set([...this.habilidades, habilidad])]
      : this.habilidades.filter(item => item !== habilidad);
  }

  async guardar() {
    const nombre = this.nombre.trim();
    const telefonoDigitos = this.telefono.replace(/\D/g, '');
    const fechaNacimiento = this.fechaNacimiento.slice(0, 10);
    const fechaDisponibilidad = this.fechaDisponibilidad.slice(0, 10);
    const resumen = this.resumen.trim();

    if (nombre.length < 3) {
      this.mensaje = 'Ingresa nombres y apellidos con al menos 3 caracteres.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo.trim())) {
      this.mensaje = 'Ingresa un correo electrónico válido.';
      return;
    }

    if (telefonoDigitos.length < 7 || telefonoDigitos.length > 15) {
      this.mensaje = 'Ingresa un teléfono con entre 7 y 15 dígitos.';
      return;
    }

    if (!fechaNacimiento || fechaNacimiento > this.fechaHoy) {
      this.mensaje = 'Selecciona una fecha de nacimiento válida, no futura.';
      return;
    }

    if (!this.cargo) {
      this.mensaje = 'Selecciona el cargo al que postulas.';
      return;
    }

    if (!this.nivelAcademico) {
      this.mensaje = 'Selecciona el nivel académico.';
      return;
    }

    if (!Number.isInteger(this.experienciaAnios) || this.experienciaAnios === null || this.experienciaAnios < 0 || this.experienciaAnios > 50) {
      this.mensaje = 'Los años de experiencia deben ser un entero entre 0 y 50.';
      return;
    }

    if (!this.modalidad) {
      this.mensaje = 'Selecciona una modalidad de trabajo.';
      return;
    }

    if (this.habilidades.length === 0) {
      this.mensaje = 'Selecciona al menos una habilidad técnica.';
      return;
    }

    if (!fechaDisponibilidad || fechaDisponibilidad < this.fechaHoy) {
      this.mensaje = 'Selecciona una fecha de inicio válida, no anterior a hoy.';
      return;
    }

    if (this.aspiracionSalarial === null || !Number.isFinite(this.aspiracionSalarial) || this.aspiracionSalarial <= 0) {
      this.mensaje = 'La aspiración salarial debe ser mayor que 0.';
      return;
    }

    if (resumen.length < 30) {
      this.mensaje = 'El resumen profesional debe tener al menos 30 caracteres.';
      return;
    }

    if (!this.consentimiento) {
      this.mensaje = 'Debes aceptar el tratamiento de datos para guardar.';
      return;
    }

    this.guardando = true;
    this.mensaje = '';
    try {
      await this.firebase.guardarEstudiante({
        nombre,
        correo: this.correo.trim(),
        telefono: this.telefono.trim(),
        fechaNacimiento,
        cargo: this.cargo,
        nivelAcademico: this.nivelAcademico,
        experienciaAnios: Number(this.experienciaAnios),
        modalidad: this.modalidad,
        habilidades: this.habilidades,
        fechaDisponibilidad,
        aspiracionSalarial: Number(this.aspiracionSalarial),
        resumen,
        consentimiento: this.consentimiento
      });

      this.nombre = '';
      this.correo = '';
      this.telefono = '';
      this.fechaNacimiento = '';
      this.cargo = '';
      this.nivelAcademico = '';
      this.experienciaAnios = null;
      this.modalidad = '';
      this.habilidades = [];
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
