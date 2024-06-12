import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    DestroyRef,
    HostBinding,
    inject
} from '@angular/core';

import { AbstractControl, NgModel, NgModelGroup } from '@angular/forms';
import { mergeWith, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormDirective } from '../../directives/form.directive';

@Component({
    selector: '[sc-control-wrapper]',
    standalone: true,
    templateUrl: './control-wrapper.component.html',
    styleUrls: ['./control-wrapper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlWrapperComponent implements AfterViewInit {
    private readonly cdRef = inject(ChangeDetectorRef);
    private readonly formDirective = inject(FormDirective);
    private readonly destroyRef = inject(DestroyRef);

    @ContentChild(NgModel) public ngModel?: NgModel; // Optional ngModel
    public readonly ngModelGroup: NgModelGroup | null = inject(NgModelGroup, {
        optional: true,
        self: true,
    });


    // Cache the previous error to avoid 'flickering'
    private previousError?: string[];

    private get control(): AbstractControl | undefined {
        return this.ngModelGroup ? this.ngModelGroup.control : this.ngModel?.control;
    }

    @HostBinding('class.sc-control-wrapper--invalid')
    public get invalid() {
        return this.control?.touched && this.errors;
    }

    public get errors(): string[] | undefined {
        if (this.control?.pending) {
            return this.previousError;
        } else {
            this.previousError = this.control?.errors?.['errors'];
        }
        return this.control?.errors?.['errors'];
    }

    public ngAfterViewInit(): void {
        // Wait until the form is idle
        // Then, listen to all events of the ngModelGroup or ngModel
        // and mark the component and its ancestors as dirty
        // This allows us to use the OnPush ChangeDetection Strategy
        this.formDirective.idle$
            .pipe(
                switchMap(() => this.ngModelGroup?.control?.events || of(null)),
                mergeWith(this.control?.events || of(null)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => {
                this.cdRef.markForCheck();
            });
    }
}
