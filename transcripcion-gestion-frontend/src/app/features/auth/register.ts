import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, Button, InputText, Password],
  template: `
    <section class="mx-auto flex w-full max-w-md flex-col px-4 py-16">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-slate-900">Crear cuenta</h1>
        <p class="mt-2 text-sm text-slate-600">
          Registrate para empezar a transcribir tus audios.
        </p>
      </div>

      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div class="mb-4 flex flex-col gap-2">
          <label for="fullName" class="text-sm font-medium text-slate-700">
            Nombre completo
          </label>
          <input
            id="fullName"
            type="text"
            pInputText
            formControlName="fullName"
            placeholder="Juan Perez"
            autocomplete="name"
          />
          @if (isInvalid('fullName')) {
            <small class="text-red-500">El nombre completo es obligatorio</small>
          }
        </div>

        <div class="mb-4 flex flex-col gap-2">
          <label for="email" class="text-sm font-medium text-slate-700">
            Correo electronico
          </label>
          <input
            id="email"
            type="email"
            pInputText
            formControlName="email"
            placeholder="tu@correo.com"
            autocomplete="email"
          />
          @if (isInvalid('email')) {
            <small class="text-red-500">Ingresa un correo valido</small>
          }
        </div>

        <div class="mb-4 flex flex-col gap-2">
          <label for="password" class="text-sm font-medium text-slate-700">
            Contrasena
          </label>
          <p-password
            inputId="password"
            formControlName="password"
            [toggleMask]="true"
            styleClass="w-full"
            inputStyleClass="w-full"
            promptLabel="Elige una contrasena"
            weakLabel="Debil"
            mediumLabel="Media"
            strongLabel="Fuerte"
            placeholder="Minimo 8 caracteres"
          />
          @if (isInvalid('password')) {
            <small class="text-red-500">
              La contrasena debe tener al menos 8 caracteres
            </small>
          }
        </div>

        <div class="mb-6 flex flex-col gap-2">
          <label for="confirmPassword" class="text-sm font-medium text-slate-700">
            Confirmar contrasena
          </label>
          <p-password
            inputId="confirmPassword"
            formControlName="confirmPassword"
            [feedback]="false"
            [toggleMask]="true"
            styleClass="w-full"
            inputStyleClass="w-full"
            placeholder="Repite la contrasena"
          />
          @if (mismatch()) {
            <small class="text-red-500">Las contrasenas no coinciden</small>
          }
        </div>

        <p-button
          type="submit"
          label="Registrarme"
          icon="pi pi-user-plus"
          styleClass="w-full"
          [loading]="loading()"
        />
      </form>

      <p class="mt-6 text-center text-sm text-slate-600">
        Ya tienes cuenta?
        <a routerLink="/login" class="font-medium text-indigo-600 hover:underline">
          Inicia sesion
        </a>
      </p>
    </section>
  `,
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  protected readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(180)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  protected isInvalid(control: string): boolean {
    const field = this.form.get(control);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  protected mismatch(): boolean {
    const confirm = this.form.get('confirmPassword');
    return (
      !!confirm &&
      confirm.touched &&
      this.form.value.password !== this.form.value.confirmPassword
    );
  }

  protected submit(): void {
    if (this.form.invalid || this.mismatch()) {
      this.form.markAllAsTouched();
      return;
    }

    const { fullName, email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.auth.register({ fullName, email, password }).subscribe({
      next: () => {
        this.notification.success(
          'Cuenta creada',
          'Tu cuenta fue registrada correctamente',
        );
        void this.router.navigate(['/app/dashboard']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
