import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Button, InputText, Password],
  template: `
    <section class="mx-auto flex w-full max-w-md flex-col px-4 py-16">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-slate-900">Iniciar sesion</h1>
        <p class="mt-2 text-sm text-slate-600">
          Accede para transcribir y gestionar tus audios.
        </p>
      </div>

      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
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

        <div class="mb-6 flex flex-col gap-2">
          <label for="password" class="text-sm font-medium text-slate-700">
            Contrasena
          </label>
          <p-password
            inputId="password"
            formControlName="password"
            [feedback]="false"
            [toggleMask]="true"
            styleClass="w-full"
            inputStyleClass="w-full"
            placeholder="Tu contrasena"
          />
          @if (isInvalid('password')) {
            <small class="text-red-500">La contrasena es obligatoria</small>
          }
        </div>

        <p-button
          type="submit"
          label="Ingresar"
          icon="pi pi-sign-in"
          styleClass="w-full"
          [loading]="loading()"
        />
      </form>

      <p class="mt-6 text-center text-sm text-slate-600">
        No tienes cuenta?
        <a routerLink="/register" class="font-medium text-indigo-600 hover:underline">
          Registrate aqui
        </a>
      </p>
    </section>
  `,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  protected readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected isInvalid(control: string): boolean {
    const field = this.form.get(control);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.notification.success('Bienvenido', 'Sesion iniciada correctamente');
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ?? '/app/dashboard';
        void this.router.navigateByUrl(returnUrl);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
